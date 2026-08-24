import React, { useState, useMemo, useEffect } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Loader2, Pencil, Trash2, AlertTriangle, ArrowRight,
  Leaf, ShieldCheck, FlaskConical, FileText,
  Eye, Info, Package, CheckCircle2, Clock, Grape,
  ChevronDown, ChevronUp, Wine, Beaker, Award, ClipboardList,
  BarChart3, Bug, Scissors, Droplet, Gauge, Wrench, CalendarCheck,
  Sprout, Map, Receipt, BookOpen, TrendingUp, FileDown, Globe,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  OverviewTab as VitOverviewTab,
  VineRegisterTab,
  BlocksTab,
  PhenologyTab,
  OperationsTab,
  HarvestTab as VitHarvestTab,
  ScoutingTab,
  LicensingTab,
  ExciseDutyTab,
  TastingsToursTab,
  AgeVerificationTab,
  WineProductionTab,
  WineryStockTab,
  SprayDiaryTab,
  SoilAnalysisTab,
  GiComplianceTab,
  SO2Chip,
} from "@/pages/ViticulturePage";
import { WinegbSurveysTab } from "@/pages/viticulture/WinegbSurveysTab";
import {
  ViticulturalAnalyticsTab,
  VintageSeasonReportTab,
  ViticulturalEnterpriseReport,
} from "@/components/ViticulturalReports";
import { VineyardBlockMapTab } from "@/components/viticulture/VineyardBlockMapTab";
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
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLookupStrings } from "@/hooks/use-lookup";
import { StaffSelect } from "@/components/ui/staff-select";
import { usePersistedTab } from "@/hooks/use-persisted-tab";

function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  return val;
}
function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB"); } catch { return val; }
}
function fmtNum(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return String(val);
}
function exportCSV(rows: Record<string, unknown>[], filename: string, cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]) {
  const header = cols.map(c => `"${c.label}"`).join(",");
  const body = rows.map(r => cols.map(c => {
    const v = c.fmt ? c.fmt(r) : (r[c.key] ?? "");
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

type Tab =
  | "vit-overview" | "vine-register" | "blocks" | "block-map"
  | "block-conversion" | "input-log" | "copper-register" | "input-derogations" | "certificates"
  | "phenology" | "winegb-surveys" | "operations" | "vit-harvest" | "scouting"
  | "gi-compliance" | "licensing" | "excise" | "tours" | "age-check"
  | "wine-production" | "winery-stock" | "winery-reception" | "winery-pressing"
  | "winery-fermentation" | "winery-vessels" | "winery-cellar-ops" | "winery-bottling"
  | "winery-so2" | "winery-equipment"
  | "spray-diary" | "soil-analysis" | "analytics" | "vintage-report" | "enterprise-report";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "vit-overview",      label: "Overview",              icon: BarChart3 },
  { id: "vine-register",     label: "Vine Register",         icon: ClipboardList },
  { id: "blocks",            label: "Blocks",                icon: Sprout },
  { id: "block-map",         label: "Block Map",             icon: Map },
  { id: "block-conversion",  label: "Block Conversion",      icon: ArrowRight },
  { id: "input-log",         label: "Organic Inputs",        icon: ClipboardList },
  { id: "copper-register",   label: "Copper Register",       icon: FlaskConical },
  { id: "input-derogations", label: "Input Derogations",     icon: FileText },
  { id: "certificates",      label: "Certificates",          icon: Award },
  { id: "phenology",         label: "Phenology",             icon: Leaf },
  { id: "winegb-surveys",    label: "WineGB Surveys",        icon: Globe },
  { id: "operations",        label: "Pruning & Canopy",      icon: Scissors },
  { id: "vit-harvest",       label: "Harvest",               icon: Grape },
  { id: "scouting",          label: "Disease Scouting",      icon: Bug },
  { id: "gi-compliance",     label: "GI Compliance",         icon: Award },
  { id: "licensing",         label: "Licensing",             icon: FileText },
  { id: "excise",            label: "Excise & Duty",         icon: Receipt },
  { id: "tours",             label: "Tastings & Tours",      icon: CalendarCheck },
  { id: "age-check",         label: "Age Verification",      icon: ShieldCheck },
  { id: "wine-production",   label: "Wine Production",       icon: Wine },
  { id: "winery-stock",      label: "Winery Stock",          icon: Package },
  { id: "winery-reception",  label: "Grape Intake",          icon: Grape },
  { id: "winery-pressing",   label: "Pressing Records",      icon: Gauge },
  { id: "winery-fermentation", label: "Fermentation",        icon: Beaker },
  { id: "winery-vessels",    label: "Tank & Vessel Register",icon: Package },
  { id: "winery-cellar-ops", label: "Cellar Operations",     icon: Wrench },
  { id: "winery-bottling",   label: "Bottling Records",      icon: Wine },
  { id: "winery-so2",        label: "SO₂ Testing Register",  icon: FlaskConical },
  { id: "winery-equipment",  label: "Lab Equipment",         icon: ShieldCheck },
  { id: "spray-diary",       label: "Spray Diary",           icon: Droplet },
  { id: "soil-analysis",     label: "Soil & Leaf Analysis",  icon: FlaskConical },
  { id: "analytics",         label: "Analytics",             icon: BarChart3 },
  { id: "vintage-report",    label: "Vintage Report",        icon: BookOpen },
  { id: "enterprise-report", label: "Enterprise Report",     icon: TrendingUp },
];

const BLOCK_STATUS_OPTIONS = ["in-conversion", "fully-organic", "suspended", "withdrawn"];
const INPUT_TYPE_OPTIONS = ["Fungicide", "Insecticide", "Fertiliser", "Growth Regulator", "Soil Amendment", "Biostimulant", "Other"];
const APPROVAL_STATUS_OPTIONS = ["permitted", "derogation", "not-permitted"];
const COPPER_UNIT_OPTIONS = ["kg/ha", "g/ha", "L/ha"];
const DEROGATION_STATUS_OPTIONS = ["pending", "approved", "refused", "withdrawn", "expired"];
const CORRESPONDENCE_TYPE_OPTIONS = ["Email", "Letter", "Phone Call", "Meeting", "Portal Submission", "Decision Notice", "Other"];
const DIRECTION_OPTIONS = ["outbound", "inbound"];
const CERT_TYPE_OPTIONS = ["Vineyard Organic Certificate", "Organic Wine Certificate", "In-Conversion Certificate", "Other"];
const CERT_STATUS_OPTIONS = ["active", "expired", "suspended", "withdrawn"];
// ─── Status Chips ─────────────────────────────────────────────────────────────

function BlockStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    "in-conversion": "bg-amber-100 text-amber-800",
    "fully-organic": "bg-green-100 text-green-800",
    "suspended": "bg-red-100 text-red-800",
    "withdrawn": "bg-gray-100 text-gray-700",
  };
  const label: Record<string, string> = {
    "in-conversion": "In Conversion",
    "fully-organic": "Fully Organic",
    "suspended": "Suspended",
    "withdrawn": "Withdrawn",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {label[status] ?? status}
    </span>
  );
}

function ApprovalChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    "permitted": "bg-green-100 text-green-800",
    "derogation": "bg-amber-100 text-amber-800",
    "not-permitted": "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status === "not-permitted" ? "Not Permitted" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DerogationStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    "pending": "bg-amber-100 text-amber-800",
    "approved": "bg-green-100 text-green-800",
    "refused": "bg-red-100 text-red-800",
    "withdrawn": "bg-gray-100 text-gray-700",
    "expired": "bg-orange-100 text-orange-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CertStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    "active": "bg-green-100 text-green-800",
    "expired": "bg-red-100 text-red-800",
    "suspended": "bg-amber-100 text-amber-800",
    "withdrawn": "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}


// ─── Block Conversion Tab ────────────────────────────────────────────────────

function BlockConversionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "organic-vit-block-conversion", filter: "status", farmId, defaultValue: "all" });

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-block-status", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/block-status`).then(r => r.json()),
  });

  const openAdd = () => { setForm({ status: "in-conversion" }); setShowAdd(true); };
  const openEdit = (r: any) => {
    setForm({
      blockName: r.blockName ?? "",
      certifyingBody: r.certifyingBody ?? "",
      status: r.status ?? "in-conversion",
      conversionStartDate: r.conversionStartDate ?? "",
      fullyOrganicDate: r.fullyOrganicDate ?? "",
      preConversionLandUse: r.preConversionLandUse ?? "",
      syntheticHistory: r.syntheticHistory ?? "",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/block-status/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/block-status`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-block-status", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/farms/${farmId}/organic-viticulture/block-status/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-block-status", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const certifyingBodies = useLookupStrings("organic_certifying_bodies", ["Soil Association", "Organic Farmers & Growers (OF&G)", "Biodynamic Association (BDAA)", "Quality Welsh Food Certification (QWFC)", "Other"]);
  const landUseTypes = useLookupStrings("organic_land_use_types", ["Conventional arable", "Conventional grassland", "Set-aside / fallow", "Woodland / forestry", "Previously certified organic", "Other"]);

  const records = data?.records ?? [];
  const statusFiltered = statusFilter === "all" ? records : records.filter((r: any) => String(r.status) === statusFilter);
  const convCsvCols = [
    { key: "blockName", label: "Block" },
    { key: "certifyingBody", label: "Certifying Body" },
    { key: "status", label: "Status" },
    { key: "conversionStartDate", label: "Conversion Start", fmt: (r: Record<string, unknown>) => fmtDate(r.conversionStartDate as string) },
    { key: "fullyOrganicDate", label: "Fully Organic Date", fmt: (r: Record<string, unknown>) => fmtDate(r.fullyOrganicDate as string) },
    { key: "preConversionLandUse", label: "Pre-Conversion Land Use" },
    { key: "syntheticHistory", label: "Synthetic History" },
    { key: "notes", label: "Notes" },
  ];

  const convStatusChart = Object.entries(
    records.reduce((acc: Record<string, number>, r: any) => {
      const s = String(r.status ?? "unknown").replace(/-/g, " ");
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-between">
        <p className="text-sm text-gray-600">Organic conversion register for each vineyard block — certifying body, conversion dates, and pre-conversion land-use history.</p>
        <div className="flex gap-2 items-center shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="in-conversion">In Conversion</SelectItem>
              <SelectItem value="certified-organic">Certified Organic</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(statusFiltered as Record<string, unknown>[], "block-conversion.csv", convCsvCols)} disabled={!statusFiltered.length}><FileDown className="h-4 w-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Block</Button>
        </div>
      </div>
      {convStatusChart.length > 1 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Blocks by Conversion Status</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={convStatusChart} margin={{ top: 4, right: 12, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="Blocks" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <strong>UK Organic Regs 2020:</strong> A 3-year conversion period applies to vineyard blocks. Records must be retained for at least 5 years. Certifying bodies include Soil Association and OF&G.
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : statusFiltered.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">{records.length === 0 ? "No block conversion records yet. Add your first block above." : "No records match the selected status."}</Card>
      ) : (
        <div className="space-y-3">
          {statusFiltered.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{r.blockName}</span>
                    <BlockStatusChip status={r.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                    <div><span className="text-gray-500">Certifying Body:</span> <span className="font-medium">{fmt(r.certifyingBody)}</span></div>
                    <div><span className="text-gray-500">Conversion Start:</span> <span className="font-medium">{fmtDate(r.conversionStartDate)}</span></div>
                    <div><span className="text-gray-500">Fully Organic:</span> <span className="font-medium">{fmtDate(r.fullyOrganicDate)}</span></div>
                    <div><span className="text-gray-500">Pre-conversion Use:</span> <span className="font-medium">{fmt(r.preConversionLandUse)}</span></div>
                  </div>
                  {r.syntheticHistory && <p className="text-sm text-gray-600 mt-1"><span className="text-gray-500">Synthetic History:</span> {r.syntheticHistory}</p>}
                  {r.notes && <p className="text-sm text-gray-500 mt-1">{r.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleting(r)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); saveMutation.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Block Conversion Record" : "Add Block Conversion Record"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Block Name *</Label><Input value={form.blockName ?? ""} onChange={sf("blockName")} placeholder="e.g. North Slope" /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "in-conversion"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BLOCK_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Conversion Start Date</Label><Input type="date" value={form.conversionStartDate ?? ""} onChange={sf("conversionStartDate")} /></div>
              <div><Label>Fully Organic Date</Label><Input type="date" value={form.fullyOrganicDate ?? ""} onChange={sf("fullyOrganicDate")} /></div>
            </div>
            <div>
              <Label>Pre-conversion Land Use</Label>
              <Select value={form.preConversionLandUse ?? ""} onValueChange={v => setForm(f => ({ ...f, preConversionLandUse: v }))}>
                <SelectTrigger><SelectValue placeholder="Select land use…" /></SelectTrigger>
                <SelectContent>{landUseTypes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Synthetic Input History</Label><Textarea value={form.syntheticHistory ?? ""} onChange={sf("syntheticHistory")} placeholder="Note any synthetic pesticide/fertiliser history relevant to conversion" rows={2} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          {editing && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="organic-block-conversion" recordId={(editing as any).id} />
            </div>
          )}
          <DialogMutationError mutation={saveMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.blockName || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleting} onOpenChange={() => { setDeleting(null); deleteMutation.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Block Record</DialogTitle><DialogDescription>Remove <strong>{deleting?.blockName}</strong> from the conversion register? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Organic Inputs Log Tab ──────────────────────────────────────────────────

function InputLogTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "organic-vit-input-log", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [productLookupId, setProductLookupId] = useState<string>("");
  const inputUnits = useLookupStrings("organic_input_units", ["kg/ha", "g/ha", "L/ha", "mL/ha", "kg", "g", "L", "mL", "t/ha", "Other"]);
  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);
  const { data: productsData } = useQuery<{ records: { id: number; productName: string; activeIngredient: string | null; category: string | null }[] }>({
    queryKey: ["spray-products", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/spray-products`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const sprayProducts = productsData?.records ?? [];
  const handleProductLookup = (id: string) => {
    setProductLookupId(id);
    const p = sprayProducts.find(p => String(p.id) === id);
    if (p) {
      setForm(f => ({ ...f, productName: p.productName, inputType: p.category ?? f.inputType ?? "" }));
    }
  };

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-input-log", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-log`).then(r => r.json()),
  });

  const { data: certRegData } = useQuery<{ records: any[] }>({
    queryKey: ["org-certification", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-certification`).then(r => r.json()),
    staleTime: 300_000,
  });
  const primaryCertifier = certRegData?.records?.[0] ?? null;

  const openAdd = () => { setProductLookupId(""); setForm({ approvalStatus: "permitted", vintageYear: String(new Date().getFullYear()) }); setShowAdd(true); };
  const openEdit = (r: any) => {
    setProductLookupId("");
    setForm({
      blockName: r.blockName ?? "",
      productName: r.productName ?? "",
      inputType: r.inputType ?? "",
      supplier: r.supplier ?? "",
      dateApplied: r.dateApplied ?? "",
      quantity: r.quantity ?? "",
      unit: r.unit ?? "",
      areaHa: r.areaHa ?? "",
      vintageYear: r.vintageYear ? String(r.vintageYear) : "",
      approvalStatus: r.approvalStatus ?? "permitted",
      certifierApprovalRef: r.certifierApprovalRef ?? "",
      appliedBy: r.appliedBy ?? "",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/input-log/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/input-log`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-input-log", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/farms/${farmId}/organic-viticulture/input-log/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-input-log", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const records = data?.records ?? [];
  const inputYears = Array.from(new Set(records.map((r: any) => String(r.vintageYear)).filter(Boolean))).sort().reverse();
  if (!inputYears.includes(String(new Date().getFullYear()))) inputYears.unshift(String(new Date().getFullYear()));
  const filteredInputs = yearFilter === "all" ? records : records.filter((r: any) => String(r.vintageYear) === yearFilter);
  const inputCsvCols = [
    { key: "dateApplied", label: "Date Applied", fmt: (r: Record<string, unknown>) => fmtDate(r.dateApplied as string) },
    { key: "vintageYear", label: "Vintage Year" },
    { key: "productName", label: "Product" },
    { key: "inputType", label: "Type" },
    { key: "blockName", label: "Block" },
    { key: "quantity", label: "Quantity" },
    { key: "unit", label: "Unit" },
    { key: "areaHa", label: "Area (ha)" },
    { key: "approvalStatus", label: "Approval Status" },
    { key: "certifierApprovalRef", label: "Certifier Ref" },
    { key: "appliedBy", label: "Applied By" },
    { key: "notes", label: "Notes" },
  ];

  const inputTypeChart = Object.entries(
    filteredInputs.reduce((acc: Record<string, number>, r: any) => {
      const t = String(r.inputType ?? "Unknown");
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Log all organic-approved inputs applied in the vineyard — copper, sulphur, plant preparations, fertilisers, and any inputs requiring certifier approval.</p>
          <p className="text-xs text-gray-500">Set <strong>Approval Status</strong> to <em>Restricted</em> for products needing certifier notification, or <em>Derogation</em> for products used under a formal derogation approval. For the full derogation case file (availability search, correspondence, decision), use the <strong>Input Derogations</strong> tab. <em>Do not record arable or general farm inputs here — use Organic Compliance → Input Register.</em></p>
        </div>
        <Button size="sm" className="shrink-0" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Input</Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Vintage:</span>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{inputYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => exportCSV(filteredInputs as Record<string, unknown>[], "organic-inputs.csv", inputCsvCols)} disabled={!filteredInputs.length}><FileDown className="h-4 w-4 mr-1" />Export CSV</Button>
      </div>
      {inputTypeChart.length > 1 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Applications by Input Type</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={inputTypeChart} margin={{ top: 4, right: 12, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="Applications" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {primaryCertifier && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <Leaf className="h-4 w-4 text-green-600 shrink-0" />
          <span>Registered certifier: <strong>{primaryCertifier.certifier}</strong>{primaryCertifier.operatorNumber ? <> · Operator No: <strong>{primaryCertifier.operatorNumber}</strong></> : null}</span>
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : filteredInputs.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">{records.length === 0 ? "No input records yet." : "No records match the selected vintage year."}</Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Product</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Block</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Quantity</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Approval</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Vintage</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInputs.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDate(r.dateApplied)}</td>
                  <td className="px-3 py-2 font-medium">{r.productName}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.inputType)}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.blockName)}</td>
                  <td className="px-3 py-2 text-gray-600">{r.quantity ? `${r.quantity} ${r.unit ?? ""}`.trim() : "—"}</td>
                  <td className="px-3 py-2"><ApprovalChip status={r.approvalStatus} /></td>
                  <td className="px-3 py-2 text-gray-600">{fmtNum(r.vintageYear)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); saveMutation.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Input Record" : "Add Input Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product Register Lookup</Label>
              <Select value={productLookupId} onValueChange={handleProductLookup}>
                <SelectTrigger><SelectValue placeholder={sprayProducts.length ? "Select from product register to auto-fill…" : "No products in register — enter manually below"} /></SelectTrigger>
                <SelectContent>
                  {sprayProducts.map(p => <SelectItem key={String(p.id)} value={String(p.id)}>{p.productName}{p.activeIngredient ? ` — ${p.activeIngredient}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
              {sprayProducts.length === 0 && <p className="text-xs text-muted-foreground mt-1">Add products in <strong>Sprays &amp; Inputs → Products</strong> to enable auto-fill.</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Product Name *</Label>
                <Input value={form.productName ?? ""} onChange={sf("productName")} placeholder="e.g. Bordeaux Mixture WP" />
                {productLookupId && <p className="text-xs text-green-700 mt-1">Auto-filled — edit if needed.</p>}
              </div>
              <div>
                <Label>Input Type *</Label>
                <Select value={form.inputType ?? ""} onValueChange={v => setForm(f => ({ ...f, inputType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{INPUT_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                {productLookupId && !!form.inputType && <p className="text-xs text-green-700 mt-1">From product register</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Applied *</Label><Input type="date" value={form.dateApplied ?? ""} onChange={sf("dateApplied")} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={sf("vintageYear")} placeholder="e.g. 2025" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Block</Label>
                <Select value={form.blockName || "__whole__"} onValueChange={v => setForm(f => ({ ...f, blockName: v === "__whole__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Whole vineyard or select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__whole__">— Whole vineyard —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.blockName)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Area (ha)</Label><Input type="number" value={form.areaHa ?? ""} onChange={sf("areaHa")} placeholder="0.00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input value={form.quantity ?? ""} onChange={sf("quantity")} placeholder="e.g. 3.0" /></div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit ?? ""} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select unit…" /></SelectTrigger>
                  <SelectContent>{inputUnits.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Supplier</Label><Input value={form.supplier ?? ""} onChange={sf("supplier")} /></div>
            <div>
              <Label>Approval Status</Label>
              <Select value={form.approvalStatus ?? "permitted"} onValueChange={v => setForm(f => ({ ...f, approvalStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{APPROVAL_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certifier Approval Ref</Label>
              <Input value={form.certifierApprovalRef ?? ""} onChange={sf("certifierApprovalRef")} placeholder="Reference if certifier pre-approval was required" />
              {primaryCertifier && <p className="text-xs text-green-700 mt-1">Your registered certifier: <strong>{primaryCertifier.certifier}</strong>{primaryCertifier.operatorNumber ? ` (Op. No: ${primaryCertifier.operatorNumber})` : ""}</p>}
            </div>
            <div><Label>Applied By</Label><StaffSelect value={form.appliedBy ?? ""} onChange={v => setForm(f => ({ ...f, appliedBy: v }))} staffNames={staffNames} loading={staffLoading} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          {editing && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="organic-input-log" recordId={(editing as any).id} />
            </div>
          )}
          <DialogMutationError mutation={saveMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.productName || !form.inputType || !form.dateApplied || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => { setDeleting(null); deleteMutation.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Input Record</DialogTitle><DialogDescription>Remove <strong>{deleting?.productName}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Copper Register Tab ─────────────────────────────────────────────────────

function CopperRegisterTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "organic-vit-copper-register", filter: "year", farmId, defaultValue: "all" });
  const copperProducts = useLookupStrings("organic_copper_products", ["Bordeaux Mixture WP", "Copper Hydroxide WP", "Copper Oxychloride WP", "Copper Sulfate (tribasic)", "Nordox 75 WG", "Trophy WG", "Other"]);
  const sprayMethods = useLookupStrings("vineyard_spray_application_methods", ["Knapsack Sprayer", "Tractor-mounted Boom Sprayer", "Air-blast / Vineyard Sprayer", "Lean-to / Facing Sprayer", "Drone Application", "Hand-held Lance", "Other"]);
  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-copper-log", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/copper-log`).then(r => r.json()),
  });

  const openAdd = () => { setForm({ quantityUnit: "kg/ha" }); setShowAdd(true); };
  const openEdit = (r: any) => {
    setForm({
      blockName: r.blockName ?? "",
      applicationDate: r.applicationDate ?? "",
      productName: r.productName ?? "",
      copperContent: r.copperContent ?? "",
      quantityApplied: r.quantityApplied ?? "",
      quantityUnit: r.quantityUnit ?? "kg/ha",
      areaHa: r.areaHa ?? "",
      copperKgApplied: r.copperKgApplied ?? "",
      applicationMethod: r.applicationMethod ?? "",
      operatorName: r.operatorName ?? "",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/copper-log/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/copper-log`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-copper-log", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/farms/${farmId}/organic-viticulture/copper-log/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-copper-log", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const records = data?.records ?? [];
  const copperYears = Array.from(new Set(records.map((r: any) => r.applicationDate ? String(r.applicationDate).slice(0, 4) : null).filter((x): x is string => Boolean(x)))).sort().reverse();
  if (!copperYears.includes(String(new Date().getFullYear()))) copperYears.unshift(String(new Date().getFullYear()));
  const filteredCopper = yearFilter === "all" ? records : records.filter((r: any) => r.applicationDate && String(r.applicationDate).slice(0, 4) === yearFilter);
  const copperCsvCols = [
    { key: "applicationDate", label: "Date Applied", fmt: (r: Record<string, unknown>) => fmtDate(r.applicationDate as string) },
    { key: "blockName", label: "Block" },
    { key: "productName", label: "Product" },
    { key: "copperContent", label: "Copper Content (%)" },
    { key: "quantityApplied", label: "Quantity Applied" },
    { key: "quantityUnit", label: "Unit" },
    { key: "areaHa", label: "Area (ha)" },
    { key: "copperKgApplied", label: "Cu Applied (kg)" },
    { key: "applicationMethod", label: "Method" },
    { key: "operatorName", label: "Operator" },
    { key: "notes", label: "Notes" },
  ];

  // Running total of copper kg applied
  const totalCopperKg = useMemo(() => {
    return records.reduce((sum, r) => {
      const v = parseFloat(r.copperKgApplied ?? "0");
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
  }, [records]);

  const LIMIT_7YR = 28;
  const limitPct = Math.min((totalCopperKg / LIMIT_7YR) * 100, 100);
  const limitColour = limitPct >= 90 ? "bg-red-500" : limitPct >= 70 ? "bg-amber-500" : "bg-green-500";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Running register of all copper-based fungicide applications. UK Organic Regs 2020 cap copper at 28 kg/ha over any 7-year period (equivalent to 4 kg/ha/year average).</p>
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{copperYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredCopper as Record<string, unknown>[], "copper-register.csv", copperCsvCols)} disabled={!filteredCopper.length}><FileDown className="h-4 w-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Application</Button>
        </div>
      </div>

      {/* 7-year running total widget */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Recorded copper applied (all records)</span>
          <span className={`text-sm font-bold ${limitPct >= 90 ? "text-red-600" : limitPct >= 70 ? "text-amber-600" : "text-green-700"}`}>
            {totalCopperKg.toFixed(2)} kg/ha of 28 kg/ha limit
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-2 rounded-full transition-all ${limitColour}`} style={{ width: `${limitPct}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1">This total covers all records in your register. Filter by block and 7-year rolling window in your certifier audit report.</p>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : filteredCopper.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">{records.length === 0 ? "No copper applications recorded yet." : "No records match the selected year."}</Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Product</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Block</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Area (ha)</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Cu Applied (kg)</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Method</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Operator</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCopper.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDate(r.applicationDate)}</td>
                  <td className="px-3 py-2 font-medium">{r.productName}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.blockName)}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.areaHa)}</td>
                  <td className="px-3 py-2 font-medium">{fmt(r.copperKgApplied)}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.applicationMethod)}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.operatorName)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); saveMutation.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Copper Application" : "Add Copper Application"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Application Date *</Label><Input type="date" value={form.applicationDate ?? ""} onChange={sf("applicationDate")} /></div>
              <div>
                <Label>Product Name *</Label>
                <Select value={form.productName ?? ""} onValueChange={v => setForm(f => ({ ...f, productName: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select copper product…" /></SelectTrigger>
                  <SelectContent>{copperProducts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Block</Label>
                <Select value={form.blockName || "__whole__"} onValueChange={v => setForm(f => ({ ...f, blockName: v === "__whole__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Whole vineyard or select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__whole__">— Whole vineyard —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.blockName)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Area Applied (ha)</Label><Input type="number" value={form.areaHa ?? ""} onChange={sf("areaHa")} placeholder="0.00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Copper Content (%)</Label><Input value={form.copperContent ?? ""} onChange={sf("copperContent")} placeholder="e.g. 20" /></div>
              <div><Label>Quantity Applied</Label><Input value={form.quantityApplied ?? ""} onChange={sf("quantityApplied")} placeholder="Amount applied" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unit</Label>
                <Select value={form.quantityUnit ?? "kg/ha"} onValueChange={v => setForm(f => ({ ...f, quantityUnit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COPPER_UNIT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Copper kg Applied *</Label><Input type="number" value={form.copperKgApplied ?? ""} onChange={sf("copperKgApplied")} placeholder="Actual kg Cu applied" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Application Method</Label>
                <Select value={form.applicationMethod ?? ""} onValueChange={v => setForm(f => ({ ...f, applicationMethod: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select method…" /></SelectTrigger>
                  <SelectContent>{sprayMethods.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Operator</Label><StaffSelect value={form.operatorName ?? ""} onChange={v => setForm(f => ({ ...f, operatorName: v }))} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          {editing && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="organic-copper-log" recordId={(editing as any).id} />
            </div>
          )}
          <DialogMutationError mutation={saveMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.applicationDate || !form.productName || !form.copperKgApplied || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => { setDeleting(null); deleteMutation.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Copper Application</DialogTitle><DialogDescription>Remove <strong>{deleting?.productName}</strong> on {fmtDate(deleting?.applicationDate)}? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Input Derogations Tab ────────────────────────────────────────────────────

type DerogCase = {
  id: number; farmId: number; inputName: string; inputType: string;
  regulatoryBasis?: string | null; certifier?: string | null; certifierRef?: string | null;
  internalDecisionDate?: string | null;
  availabilitySearchDate?: string | null; availabilitySearchRef?: string | null;
  applicationDate?: string | null; decisionDate?: string | null;
  status: string; approvalConditions?: string | null; expiryDate?: string | null;
  vintageYear?: number | null; justification?: string | null;
  rejectionReason?: string | null; rejectionRef?: string | null; correctiveAction?: string | null;
  notes?: string | null;
  createdAt: string;
};

type CorrespondenceItem = {
  id: number; derogationId: number; correspondenceDate: string;
  direction: string; correspondenceType: string; summary: string;
  reference?: string | null; notes?: string | null;
};

function RecordDecisionDialog({ farmId, derogCase, onClose }: { farmId: number; derogCase: DerogCase; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState("approved");
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().slice(0, 10));
  const [certifierRef, setCertifierRef] = useState(derogCase.certifierRef ?? "");
  const [approvalConditions, setApprovalConditions] = useState(derogCase.approvalConditions ?? "");
  const [expiryDate, setExpiryDate] = useState(derogCase.expiryDate ?? "");
  const [rejectionReason, setRejectionReason] = useState(derogCase.rejectionReason ?? "");
  const [rejectionRef, setRejectionRef] = useState(derogCase.rejectionRef ?? "");

  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations/${derogCase.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, decisionDate: decisionDate || null, certifierRef: certifierRef || null, approvalConditions: approvalConditions || null, expiryDate: expiryDate || null, rejectionReason: rejectionReason || null, rejectionRef: rejectionRef || null }),
    }).then(r => { if (!r.ok) throw new Error("Failed"); }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-derogations", farmId] });
      toast({ title: "Decision recorded" });
      onClose();
    },
    onError: () => toast({ title: "Error saving decision", variant: "destructive" }),
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) { onClose(); mut.reset(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-amber-600" /> Record Certifier Decision
          </DialogTitle>
          <DialogDescription>
            {derogCase.inputName} — decision from {derogCase.certifier ?? "certifying body"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Decision *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="refused">Refused</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn (by applicant)</SelectItem>
                  <SelectItem value="expired">Expired — no decision received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Decision Date *</Label><Input type="date" className="mt-1" value={decisionDate} onChange={e => setDecisionDate(e.target.value)} /></div>
          </div>
          <div><Label>Certifier Reference No.</Label><Input className="mt-1" value={certifierRef} onChange={e => setCertifierRef(e.target.value)} placeholder="Reference from certifying body" /></div>
          {status === "approved" && (
            <>
              <div><Label>Approval Conditions</Label><Textarea className="mt-1" value={approvalConditions} onChange={e => setApprovalConditions(e.target.value)} rows={2} placeholder="Any conditions attached to the approval…" /></div>
              <div><Label>Expiry Date</Label><Input type="date" className="mt-1" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
            </>
          )}
        </div>
        <DialogMutationError mutation={mut} message="Failed to save — your entries are still here." />
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !decisionDate}>
            {mut.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving…</> : "Record Decision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InputDerogationsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<DerogCase | null>(null);
  const [deleting, setDeleting] = useState<DerogCase | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "organic-vit-input-derogations", filter: "year", farmId, defaultValue: "all" });
  const [regulatoryOther, setRegulatoryOther] = useState(false);
  const [raiseTaskFor, setRaiseTaskFor] = useState<{ title: string; description: string; dueDate?: string } | null>(null);
  const [recordDecisionFor, setRecordDecisionFor] = useState<DerogCase | null>(null);
  const certifyingBodies = useLookupStrings("organic_certifying_bodies", ["Soil Association", "Organic Farmers & Growers (OF&G)", "Biodynamic Association (BDAA)", "Quality Welsh Food Certification (QWFC)", "Other"]);
  const { data: certRegData } = useQuery<{ records: any[] }>({
    queryKey: ["org-certification", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-certification`).then(r => r.json()),
    staleTime: 300_000,
  });
  const primaryCertifier = certRegData?.records?.[0] ?? null;

  // Correspondence
  const [showAddCorr, setShowAddCorr] = useState(false);
  const [editingCorr, setEditingCorr] = useState<CorrespondenceItem | null>(null);
  const [deletingCorr, setDeletingCorr] = useState<CorrespondenceItem | null>(null);
  const [corrForm, setCorrForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ cases: DerogCase[] }>({
    queryKey: ["org-vit-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations`).then(r => r.json()),
  });

  const { data: corrData } = useQuery<{ items: CorrespondenceItem[] }>({
    queryKey: ["org-vit-derog-corr", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations/${expandedId}/correspondence`).then(r => r.json()),
    enabled: expandedId !== null,
  });

  const openAdd = () => { setForm({ status: "pending", vintageYear: String(new Date().getFullYear()), internalDecisionDate: "", rejectionReason: "", rejectionRef: "", correctiveAction: "", certifier: primaryCertifier?.certifier ?? "" }); setRegulatoryOther(false); setShowAdd(true); };
  const openEdit = (c: DerogCase) => {
    setForm({
      inputName: c.inputName ?? "",
      inputType: c.inputType ?? "",
      regulatoryBasis: c.regulatoryBasis ?? "",
      certifier: c.certifier ?? "",
      certifierRef: c.certifierRef ?? "",
      availabilitySearchDate: c.availabilitySearchDate ?? "",
      availabilitySearchRef: c.availabilitySearchRef ?? "",
      applicationDate: c.applicationDate ?? "",
      decisionDate: c.decisionDate ?? "",
      status: c.status ?? "pending",
      approvalConditions: c.approvalConditions ?? "",
      expiryDate: c.expiryDate ?? "",
      vintageYear: c.vintageYear ? String(c.vintageYear) : "",
      justification: c.justification ?? "",
      internalDecisionDate: c.internalDecisionDate ?? "",
      rejectionReason: c.rejectionReason ?? "",
      rejectionRef: c.rejectionRef ?? "",
      correctiveAction: c.correctiveAction ?? "",
      notes: c.notes ?? "",
    });
    setRegulatoryOther(!!c.regulatoryBasis && !["UK Organic Regs 2020, Sch. 1 Part A", "UK Organic Regs 2020, Sch. 1 Part B", "UK Organic Regs 2020, Annex II", "Certifier derogation guidance"].includes(c.regulatoryBasis ?? ""));
    setEditing(c);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/input-derogations/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/input-derogations`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-derogations", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-derogations", farmId] }); setDeleting(null); if (expandedId === deleting?.id) setExpandedId(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  // Correspondence mutations
  const saveCorr = useMutation({
    mutationFn: async () => {
      if (!expandedId) return;
      const url = editingCorr
        ? `/api/farms/${farmId}/organic-viticulture/input-derogation-correspondence/${editingCorr.id}`
        : `/api/farms/${farmId}/organic-viticulture/input-derogations/${expandedId}/correspondence`;
      const method = editingCorr ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corrForm) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-derog-corr", farmId, expandedId] }); setShowAddCorr(false); setEditingCorr(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving correspondence", variant: "destructive" }),
  });

  const deleteCorr = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/farms/${farmId}/organic-viticulture/input-derogation-correspondence/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-derog-corr", farmId, expandedId] }); setDeletingCorr(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting correspondence", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const csf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCorrForm(f => ({ ...f, [k]: e.target.value }));

  const openAddCorr = () => { setCorrForm({ direction: "outbound", correspondenceDate: new Date().toISOString().slice(0, 10) }); setShowAddCorr(true); };
  const openEditCorr = (c: CorrespondenceItem) => {
    setCorrForm({ correspondenceDate: c.correspondenceDate, direction: c.direction, correspondenceType: c.correspondenceType, summary: c.summary, reference: c.reference ?? "", notes: c.notes ?? "" });
    setEditingCorr(c);
  };

  const cases = data?.cases ?? [];
  const corrItems = corrData?.items ?? [];
  const derogYears = Array.from(new Set(cases.map((c: any) => c.vintageYear ? String(c.vintageYear) : null).filter((x): x is string => Boolean(x)))).sort().reverse();
  if (!derogYears.includes(String(new Date().getFullYear()))) derogYears.unshift(String(new Date().getFullYear()));
  const filteredCases = yearFilter === "all" ? cases : cases.filter((c: any) => String(c.vintageYear) === yearFilter);
  const derogCsvCols = [
    { key: "inputName", label: "Input Name" },
    { key: "inputType", label: "Type" },
    { key: "vintageYear", label: "Vintage Year" },
    { key: "certifier", label: "Certifier" },
    { key: "certifierRef", label: "Certifier Ref" },
    { key: "status", label: "Status" },
    { key: "applicationDate", label: "Application Date", fmt: (r: Record<string, unknown>) => fmtDate(r.applicationDate as string) },
    { key: "decisionDate", label: "Decision Date", fmt: (r: Record<string, unknown>) => fmtDate(r.decisionDate as string) },
    { key: "expiryDate", label: "Expiry Date", fmt: (r: Record<string, unknown>) => fmtDate(r.expiryDate as string) },
    { key: "regulatoryBasis", label: "Regulatory Basis" },
    { key: "approvalConditions", label: "Approval Conditions" },
    { key: "justification", label: "Justification" },
    { key: "notes", label: "Notes" },
  ];

  // Expiry urgency
  function expiryBadge(expiry: string | null | undefined) {
    if (!expiry) return null;
    const d = new Date(expiry);
    const now = new Date();
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (daysLeft < 0) return <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">Expired</span>;
    if (daysLeft <= 30) return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium">Expires in {daysLeft}d</span>;
    if (daysLeft <= 90) return <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Expires in {daysLeft}d</span>;
    return null;
  }

  const derogStatusChart = Object.entries(
    cases.reduce((acc: Record<string, number>, c: any) => {
      const s = String(c.status ?? "unknown");
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Manage UK Organic Regs 2020 Sch. 1 / Annex II input derogation cases — availability searches, certifier correspondence, and decisions.</p>
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{derogYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredCases as Record<string, unknown>[], "input-derogations.csv", derogCsvCols)} disabled={!filteredCases.length}><FileDown className="h-4 w-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />New Case</Button>
        </div>
      </div>
      {derogStatusChart.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Derogation Cases by Status</p>
          <ResponsiveContainer width="100%" height={Math.max(100, derogStatusChart.length * 32)}>
            <BarChart data={derogStatusChart} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 64 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 9 }} width={64} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="Cases" fill="#f59e0b" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900 space-y-1.5">
        <p><strong>Derogation requirement:</strong> Where an approved organic input is not available in sufficient quantity, farmers may apply to their certifying body for a time-limited derogation to use a non-organic equivalent. An availability search must be completed and documented before application.</p>
        <p className="text-amber-800 text-xs border-t border-amber-200 pt-1.5">This tab is for <strong>vineyard input derogation cases only</strong>. For livestock and dairy feed ingredient derogations (e.g. non-organic protein sources), use <em>Organic Livestock → Feed Derogations</em>. For restricted products that don't require a formal case, log them directly in the <em>Organic Inputs</em> tab with status set to Restricted.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : filteredCases.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">{cases.length === 0 ? "No derogation cases yet." : "No cases match the selected vintage year."}</Card>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => {
            const isOpen = expandedId === c.id;
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900">{c.inputName}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{c.inputType}</span>
                        <DerogationStatusChip status={c.status} />
                        {expiryBadge(c.expiryDate)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                        <div><span className="text-gray-500">Certifier:</span> <span className="font-medium">{fmt(c.certifier)}</span></div>
                        <div><span className="text-gray-500">Cert. Ref:</span> <span className="font-medium">{fmt(c.certifierRef)}</span></div>
                        <div><span className="text-gray-500">Applied:</span> <span className="font-medium">{fmtDate(c.applicationDate)}</span></div>
                        <div><span className="text-gray-500">Decision:</span> <span className="font-medium">{fmtDate(c.decisionDate)}</span></div>
                        <div><span className="text-gray-500">Expiry:</span> <span className="font-medium">{fmtDate(c.expiryDate)}</span></div>
                        <div><span className="text-gray-500">Vintage:</span> <span className="font-medium">{fmtNum(c.vintageYear)}</span></div>
                      </div>
                      {c.regulatoryBasis && <p className="text-xs text-gray-500 mt-1"><span className="font-medium">Regulatory basis:</span> {c.regulatoryBasis}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0 items-center">
                      {(c.status === "pending" || !c.status) && (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 gap-1" onClick={e => { e.stopPropagation(); setRecordDecisionFor(c); }}>
                          Record Decision <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                      {(c.status === "refused" && !c.correctiveAction) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-300">Action Required</span>
                      )}
                      {c.expiryDate && (
                        <Button variant="ghost" size="icon" title="Raise task" onClick={e => { e.stopPropagation(); setRaiseTaskFor({ title: `Organic Viticulture Derogation Expiring — ${c.inputName}`, description: `The derogation approval for '${c.inputName}' is due to expire. Renew or confirm with your certifying body.`, dueDate: c.expiryDate ?? undefined }); }}>
                          <ClipboardList className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(c)}><Trash2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(isOpen ? null : c.id)}>
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t bg-gray-50 p-4 space-y-4">
                    {c.availabilitySearchRef && (
                      <div className="text-sm"><span className="font-medium text-gray-700">Availability Search Ref:</span> {c.availabilitySearchRef} {c.availabilitySearchDate ? `(${fmtDate(c.availabilitySearchDate)})` : ""}</div>
                    )}
                    {c.justification && (
                      <div className="text-sm"><span className="font-medium text-gray-700">Justification:</span> <span className="text-gray-600">{c.justification}</span></div>
                    )}
                    {c.approvalConditions && (
                      <div className="text-sm"><span className="font-medium text-gray-700">Approval Conditions:</span> <span className="text-gray-600">{c.approvalConditions}</span></div>
                    )}
                    {c.rejectionReason && (
                      <div className="text-sm">
                        <span className="text-gray-500">Rejection reason: </span>
                        <span className="text-red-700">{c.rejectionReason}</span>
                        {c.rejectionRef && <span className="ml-2 text-xs text-gray-500">(Ref: {c.rejectionRef})</span>}
                      </div>
                    )}
                    {c.status === "refused" && !c.correctiveAction && (
                      <div className="rounded-md border border-orange-300 bg-orange-50 p-2 text-xs text-orange-800">
                        <strong>Action Required:</strong> Record a corrective action in response to this refusal.
                      </div>
                    )}
                    {c.correctiveAction && (
                      <div className="text-sm"><span className="text-gray-500">Corrective action: </span><span className="text-green-700">{c.correctiveAction}</span></div>
                    )}
                    {c.notes && (
                      <div className="text-sm text-gray-500">{c.notes}</div>
                    )}

                    {/* Correspondence Log */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Correspondence Log</h4>
                        <Button size="sm" variant="outline" onClick={openAddCorr}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
                      </div>
                      {corrItems.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No correspondence recorded.</p>
                      ) : (
                        <div className="space-y-2">
                          {corrItems.map((ci) => (
                            <div key={ci.id} className="bg-white border rounded p-3 flex items-start justify-between gap-2">
                              <div className="text-sm flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <span className="font-medium text-gray-800">{fmtDate(ci.correspondenceDate)}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{ci.direction}</span>
                                  <span className="text-xs text-gray-500">{ci.correspondenceType}</span>
                                </div>
                                <p className="text-gray-700">{ci.summary}</p>
                                {ci.reference && <p className="text-xs text-gray-500 mt-0.5">Ref: {ci.reference}</p>}
                                {ci.notes && <p className="text-xs text-gray-400">{ci.notes}</p>}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" onClick={() => openEditCorr(ci)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeletingCorr(ci)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Case Dialog */}
      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); saveMutation.reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Derogation Case" : "New Derogation Case"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Input Name *</Label><Input value={form.inputName ?? ""} onChange={sf("inputName")} placeholder="e.g. Copper Hydroxide WP" /></div>
              <div>
                <Label>Input Type *</Label>
                <Select value={form.inputType ?? ""} onValueChange={v => setForm(f => ({ ...f, inputType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{INPUT_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Regulatory Basis</Label>
              <Select
                value={regulatoryOther ? "Other" : (form.regulatoryBasis ?? "")}
                onValueChange={v => { if (v === "Other") { setRegulatoryOther(true); setForm(f => ({ ...f, regulatoryBasis: "" })); } else { setRegulatoryOther(false); setForm(f => ({ ...f, regulatoryBasis: v })); } }}
              >
                <SelectTrigger><SelectValue placeholder="Select regulatory basis…" /></SelectTrigger>
                <SelectContent>
                  {["UK Organic Regs 2020, Sch. 1 Part A", "UK Organic Regs 2020, Sch. 1 Part B", "UK Organic Regs 2020, Annex II", "Certifier derogation guidance", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              {regulatoryOther && <Input className="mt-1.5" placeholder="Describe regulatory basis…" value={form.regulatoryBasis ?? ""} onChange={e => setForm(f => ({ ...f, regulatoryBasis: e.target.value }))} />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
              <Label>Certifier</Label>
              <Select value={form.certifier ?? ""} onValueChange={v => setForm(f => ({ ...f, certifier: v }))}>
                <SelectTrigger><SelectValue placeholder="Select certifying body…" /></SelectTrigger>
                <SelectContent>{certifyingBodies.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {editing && <div><Label>Certifier Reference</Label><Input value={form.certifierRef ?? ""} onChange={sf("certifierRef")} /></div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Availability Search Date</Label><Input type="date" value={form.availabilitySearchDate ?? ""} onChange={sf("availabilitySearchDate")} /></div>
              <div><Label>Availability Search Ref</Label><Input value={form.availabilitySearchRef ?? ""} onChange={sf("availabilitySearchRef")} /></div>
            </div>
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Application Date</Label><Input type="date" value={form.applicationDate ?? ""} onChange={sf("applicationDate")} /></div>
                <div><Label>Decision Date</Label><Input type="date" value={form.decisionDate ?? ""} onChange={sf("decisionDate")} /></div>
              </div>
            ) : (
              <div><Label>Application Date</Label><Input type="date" value={form.applicationDate ?? ""} onChange={sf("applicationDate")} /></div>
            )}
            {editing && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status ?? "pending"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DEROGATION_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate ?? ""} onChange={sf("expiryDate")} /></div>
              </div>
            )}
            <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={sf("vintageYear")} placeholder="e.g. 2025" /></div>
            <div><Label>Justification</Label><Textarea value={form.justification ?? ""} onChange={sf("justification")} placeholder="Why the organic alternative was unavailable" rows={3} /></div>
            {editing && <div><Label>Approval Conditions</Label><Textarea value={form.approvalConditions ?? ""} onChange={sf("approvalConditions")} rows={2} /></div>}
            {editing && (form.status === "refused") && (
              <>
                <div><Label>Rejection Reason</Label><Textarea value={form.rejectionReason ?? ""} onChange={sf("rejectionReason")} rows={2} placeholder="Certifier's stated reason for refusing the derogation" /></div>
                <div><Label>Rejection Reference</Label><Input value={form.rejectionRef ?? ""} onChange={sf("rejectionRef")} placeholder="Certifier ref for rejection notice" /></div>
                <div><Label>Corrective Action Taken</Label><Textarea value={form.correctiveAction ?? ""} onChange={sf("correctiveAction")} rows={2} placeholder="What the farm did in response to the refusal" /></div>
              </>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          {editing && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="organic-input-derogation" recordId={(editing as any).id} />
            </div>
          )}
          <DialogMutationError mutation={saveMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.inputName || !form.inputType || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Correspondence Dialog */}
      <Dialog open={showAddCorr || !!editingCorr} onOpenChange={() => { setShowAddCorr(false); setEditingCorr(null); saveCorr.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingCorr ? "Edit Correspondence" : "Add Correspondence"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Date *</Label><Input type="date" value={corrForm.correspondenceDate ?? ""} onChange={csf("correspondenceDate")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Direction</Label>
                <Select value={corrForm.direction ?? "outbound"} onValueChange={v => setCorrForm(f => ({ ...f, direction: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIRECTION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={corrForm.correspondenceType ?? ""} onValueChange={v => setCorrForm(f => ({ ...f, correspondenceType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{CORRESPONDENCE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Summary *</Label><Textarea value={corrForm.summary ?? ""} onChange={csf("summary")} rows={2} placeholder="Brief summary of the correspondence" /></div>
            <div><Label>Reference</Label><Input value={corrForm.reference ?? ""} onChange={csf("reference")} placeholder="Letter/email reference" /></div>
            <div><Label>Notes</Label><Textarea value={corrForm.notes ?? ""} onChange={csf("notes")} rows={2} /></div>
          </div>
          <DialogMutationError mutation={saveCorr} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddCorr(false); setEditingCorr(null); }}>Cancel</Button>
            <Button onClick={() => saveCorr.mutate()} disabled={!corrForm.correspondenceDate || !corrForm.correspondenceType || !corrForm.summary || saveCorr.isPending}>
              {saveCorr.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Case Dialog */}
      <Dialog open={!!deleting} onOpenChange={() => { setDeleting(null); deleteMutation.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Derogation Case</DialogTitle><DialogDescription>Remove the derogation case for <strong>{deleting?.inputName}</strong>? All correspondence will also be deleted. This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting!.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Correspondence Dialog */}
      <Dialog open={!!deletingCorr} onOpenChange={() => { setDeletingCorr(null); deleteCorr.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Correspondence</DialogTitle><DialogDescription>Remove this correspondence entry? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteCorr} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCorr(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteCorr.mutate(deletingCorr!.id)} disabled={deleteCorr.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          defaultTitle={raiseTaskFor.title}
          defaultDescription={raiseTaskFor.description}
          defaultDueDate={raiseTaskFor.dueDate}
          taskType="compliance_fix"
          module="Organic Viticulture"
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
        />
      )}
      {recordDecisionFor && (
        <RecordDecisionDialog
          farmId={farmId}
          derogCase={recordDecisionFor}
          onClose={() => setRecordDecisionFor(null)}
        />
      )}
    </div>
  );
}

// ─── Certificates Tab ─────────────────────────────────────────────────────────

function CertificatesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [raiseTaskFor, setRaiseTaskFor] = useState<{ title: string; description: string; dueDate?: string } | null>(null);
  const certifyingBodies = useLookupStrings("organic_certifying_bodies", ["Soil Association", "Organic Farmers & Growers (OF&G)", "Biodynamic Association (BDAA)", "Quality Welsh Food Certification (QWFC)", "Other"]);
  const { data: certRegData } = useQuery<{ records: any[] }>({
    queryKey: ["org-certification", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-certification`).then(r => r.json()),
    staleTime: 300_000,
  });
  const primaryCertifier = certRegData?.records?.[0] ?? null;

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/certificates`).then(r => r.json()),
  });

  const openAdd = () => { setForm({ status: "active", certifyingBody: primaryCertifier?.certifier ?? "" }); setShowAdd(true); };
  const openEdit = (r: any) => {
    setForm({
      certifyingBody: r.certifyingBody ?? "",
      certificateNumber: r.certificateNumber ?? "",
      certificateType: r.certificateType ?? "",
      issueDate: r.issueDate ?? "",
      expiryDate: r.expiryDate ?? "",
      scope: r.scope ?? "",
      status: r.status ?? "active",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/certificates/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/certificates`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-certs", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/farms/${farmId}/organic-viticulture/certificates/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-certs", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const records = data?.records ?? [];

  function expiryBadge(expiry: string | null | undefined) {
    if (!expiry) return null;
    const d = new Date(expiry);
    const now = new Date();
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (daysLeft < 0) return <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">Expired</span>;
    if (daysLeft <= 30) return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium">Expires in {daysLeft}d</span>;
    if (daysLeft <= 90) return <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Expires in {daysLeft}d</span>;
    return null;
  }

  const certCsvCols = [
    { key: "certifyingBody", label: "Certifying Body" },
    { key: "certificateNumber", label: "Certificate Number" },
    { key: "certificateType", label: "Type" },
    { key: "status", label: "Status" },
    { key: "issueDate", label: "Issue Date", fmt: (r: Record<string, unknown>) => fmtDate(r.issueDate as string) },
    { key: "expiryDate", label: "Expiry Date", fmt: (r: Record<string, unknown>) => fmtDate(r.expiryDate as string) },
    { key: "scope", label: "Scope" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Store organic viticulture and wine certificates issued by your certifying body.</p>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => exportCSV(records as Record<string, unknown>[], "certificates.csv", certCsvCols)} disabled={!records.length}><FileDown className="h-4 w-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Certificate</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No certificates stored yet.</Card>
      ) : (
        <div className="space-y-3">
          {records.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{r.certifyingBody}</span>
                    {r.certificateType && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.certificateType}</span>}
                    <CertStatusChip status={r.status} />
                    {expiryBadge(r.expiryDate)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                    <div><span className="text-gray-500">Certificate No:</span> <span className="font-medium">{fmt(r.certificateNumber)}</span></div>
                    <div><span className="text-gray-500">Issued:</span> <span className="font-medium">{fmtDate(r.issueDate)}</span></div>
                    <div><span className="text-gray-500">Expires:</span> <span className="font-medium">{fmtDate(r.expiryDate)}</span></div>
                  </div>
                  {r.scope && <p className="text-sm text-gray-600 mt-1"><span className="text-gray-500">Scope:</span> {r.scope}</p>}
                  {r.notes && <p className="text-sm text-gray-500 mt-1">{r.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {r.expiryDate && (
                    <Button variant="ghost" size="icon" title="Raise task" onClick={() => setRaiseTaskFor({ title: `Organic Viticulture Certificate Expiring — ${r.certificateType || r.certifyingBody}`, description: `The organic viticulture certificate${r.certifyingBody ? ` from ${r.certifyingBody}` : ""}${r.certificateType ? ` (${r.certificateType})` : ""} is due to expire. Arrange renewal with your certifying body.`, dueDate: r.expiryDate ?? undefined })}>
                      <ClipboardList className="h-4 w-4 text-amber-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); saveMutation.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Certificate" : "Add Certificate"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Certifying Body *</Label>
              <Select value={form.certifyingBody ?? ""} onValueChange={v => setForm(f => ({ ...f, certifyingBody: v }))}>
                <SelectTrigger><SelectValue placeholder="Select certifying body…" /></SelectTrigger>
                <SelectContent>{certifyingBodies.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certificate Number</Label><Input value={form.certificateNumber ?? ""} onChange={sf("certificateNumber")} /></div>
              <div>
                <Label>Certificate Type</Label>
                <Select value={form.certificateType ?? ""} onValueChange={v => setForm(f => ({ ...f, certificateType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{CERT_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Issue Date</Label><Input type="date" value={form.issueDate ?? ""} onChange={sf("issueDate")} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate ?? ""} onChange={sf("expiryDate")} /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CERT_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Scope</Label><Textarea value={form.scope ?? ""} onChange={sf("scope")} rows={2} placeholder="What does this certificate cover?" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          {editing && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="organic-certificate" recordId={(editing as any).id} />
            </div>
          )}
          <DialogMutationError mutation={saveMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.certifyingBody || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => { setDeleting(null); deleteMutation.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Certificate</DialogTitle><DialogDescription>Remove the certificate from <strong>{deleting?.certifyingBody}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          defaultTitle={raiseTaskFor.title}
          defaultDescription={raiseTaskFor.description}
          defaultDueDate={raiseTaskFor.dueDate}
          taskType="compliance_fix"
          module="Organic Viticulture"
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrganicViticulturePage() {
  const { farmId } = useAppStore();
  // Persist the active tab in localStorage, scoped to the farm — shared
  // usePersistedTab hook (same behaviour as all other tabbed pages); page key
  // "organic-viticulture" keeps the historical
  // `organic-viticulture-active-tab-${farmId}` storage key.
  const [tab, setTab] = usePersistedTab<Tab>({
    page: "organic-viticulture",
    farmId,
    validIds: TABS.map(t => t.id),
    defaultTab: "block-conversion",
  });
  // Cross-tab "view additions" shortcut: fermentation/cellar-ops/bottling rows
  // request the Pressing tab's Additions Report; switching tabs mounts
  // PressingRecordsTab, which consumes the stored scope and opens the report.
  useEffect(() => {
    // Persist via the wrapped setter so the shortcut writes to the *current*
    // farm's storage key — re-registered whenever the farm changes.
    const h = () => setTab("winery-pressing");
    window.addEventListener(WINERY_VIEW_ADDITIONS_EVENT, h);
    return () => window.removeEventListener(WINERY_VIEW_ADDITIONS_EVENT, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  const { data: vineyardBlocks = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["vineyard-blocks", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/vineyard-blocks`, { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
  });

  const { data: dashData, isLoading: dashLoading } = useQuery<{ activeSubscriptions?: Array<{ moduleKey: string }> }>({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  const activeSubs = (dashData?.activeSubscriptions ?? []).map(s => s.moduleKey);
  const hasOrganicVit = activeSubs.includes("organic-viticulture");

  if (!farmId) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-gray-500">No farm selected.</div>
    </AppLayout>
  );

  if (dashLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />Loading farm details…
      </div>
    </AppLayout>
  );

  if (!hasOrganicVit) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
        <Grape className="h-10 w-10 text-purple-200" />
        <h2 className="text-lg font-semibold text-gray-800">Organic Viticulture module not active</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This farm doesn't have the Organic Viticulture module enabled. Contact your account manager to add it to your subscription.
        </p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Grape className="h-5 w-5 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Organic Viticulture</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Full organic compliance for your vineyard — block conversion register, approved inputs log, copper register, input derogation cases, organic wine production additives, and certificate storage. UK Organic Regulations 2020 and UK-retained EU Reg 203/2012.
          </p>
        </div>

        <TabBar>
          {TABS.map(t => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              <t.icon className="w-3.5 h-3.5 mr-1" />
              {t.label}
            </TabButton>
          ))}
        </TabBar>

        {tab.startsWith("winery-") && (
          <div className="flex items-center justify-end py-1">
            <BatchTrailQuickSearch farmId={farmId} />
          </div>
        )}
        <Card className="p-6">
          {tab === "block-conversion" && <BlockConversionTab farmId={farmId} />}
          {tab === "input-log" && <InputLogTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "copper-register" && <CopperRegisterTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "input-derogations" && <InputDerogationsTab farmId={farmId} />}
          {tab === "wine-production" && <WineProductionTab farmId={farmId} />}
          {tab === "winery-stock" && <WineryStockTab farmId={farmId} />}
          {tab === "winery-reception" && <HarvestReceptionTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "winery-pressing" && <PressingRecordsTab farmId={farmId} />}
          {tab === "winery-fermentation" && <FermentationRecordsTab farmId={farmId} />}
          {tab === "winery-vessels" && <VesselRegisterTab farmId={farmId} />}
          {tab === "winery-cellar-ops" && <CellarOpsTab farmId={farmId} />}
          {tab === "winery-bottling" && <BottlingRecordsTab farmId={farmId} />}
          {tab === "winery-so2" && <So2TestingTab farmId={farmId} />}
          {tab === "winery-equipment" && <EquipmentRegisterTab farmId={farmId} />}
          {tab === "certificates" && <CertificatesTab farmId={farmId} />}
          {tab === "vit-overview" && <VitOverviewTab farmId={farmId} onNavigate={(toTab) => setTab(toTab as Tab)} />}
          {tab === "vine-register" && <VineRegisterTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "blocks" && <BlocksTab farmId={farmId} />}
          {tab === "block-map" && <VineyardBlockMapTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "phenology" && <PhenologyTab farmId={farmId} blocks={vineyardBlocks} onNavigate={(toTab) => setTab(toTab as Tab)} />}
          {tab === "winegb-surveys" && <WinegbSurveysTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "operations" && <OperationsTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "vit-harvest" && <VitHarvestTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "scouting" && <ScoutingTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "gi-compliance" && <GiComplianceTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "licensing" && <LicensingTab farmId={farmId} />}
          {tab === "excise" && <ExciseDutyTab farmId={farmId} />}
          {tab === "tours" && <TastingsToursTab farmId={farmId} />}
          {tab === "age-check" && <AgeVerificationTab farmId={farmId} />}
          {tab === "spray-diary" && <SprayDiaryTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "soil-analysis" && <SoilAnalysisTab farmId={farmId} blocks={vineyardBlocks} />}
          {tab === "analytics" && <ViticulturalAnalyticsTab farmId={farmId} />}
          {tab === "vintage-report" && <VintageSeasonReportTab farmId={farmId} />}
          {tab === "enterprise-report" && <ViticulturalEnterpriseReport farmId={farmId} />}
        </Card>
      </div>
    </AppLayout>
  );
}
