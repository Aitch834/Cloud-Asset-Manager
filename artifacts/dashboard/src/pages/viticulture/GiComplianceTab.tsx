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
import { usePersistedFilter } from "@/hooks/use-persisted-filter";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn, FsaCompletenessBar } from "./shared";


const GI_SUBTABS = [
  { id: "designations", label: "Designations", icon: Globe },
  { id: "block-compliance", label: "Block Compliance", icon: ShieldCheck },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "declarations", label: "Harvest Declarations", icon: ClipboardList },
];

function giResultBadge(result: unknown) {
  const r = String(result ?? "");
  if (r === "passed") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Passed</span>;
  if (r === "failed") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Failed</span>;
  if (r === "pending") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pending</span>;
  if (r === "withdrawn") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Withdrawn</span>;
  return r ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{r}</span> : <span className="text-muted-foreground">—</span>;
}

function giTypeBadge(t: unknown) {
  const s = String(t ?? "");
  if (s === "PDO") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">PDO</span>;
  if (s === "PGI") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">PGI</span>;
  return <span>{s}</span>;
}

function giStatusBadge(s: unknown) {
  const v = String(s ?? "active");
  if (v === "active") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>;
  if (v === "suspended") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Suspended</span>;
  if (v === "revoked") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Revoked</span>;
  return <span>{v}</span>;
}

function yieldLimitBadge(ok: boolean | null) {
  if (ok === null) return <span className="text-muted-foreground text-xs">—</span>;
  if (ok) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" />Within limit</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Exceeds limit</span>;
}

function declStatusBadge(s: unknown) {
  const v = String(s ?? "draft");
  if (v === "draft") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Draft</span>;
  if (v === "submitted") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Submitted</span>;
  if (v === "acknowledged") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Acknowledged</span>;
  if (v === "queried") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Queried</span>;
  return <span>{v}</span>;
}

function fmtVarieties(v: unknown): string {
  if (!v) return "—";
  if (Array.isArray(v)) return v.join(", ");
  try { const arr = JSON.parse(String(v)); return Array.isArray(arr) ? arr.join(", ") : String(v); } catch { return String(v); }
}

function parseVarieties(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  try { const arr = JSON.parse(String(v)); return Array.isArray(arr) ? arr.map(String) : []; } catch { return []; }
}

export function GiComplianceTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const [subTab, setSubTab] = useState("designations");
  const desigs = useCrud(farmId, "wine-gi-designations", "wine-gi-designations");
  const register = useCrud(farmId, "vine-register", "vine-register");
  const harvest = useCrud(farmId, "vineyard-harvest", "vineyard-harvest");
  const certs = useCrud(farmId, "wine-gi-certifications", "wine-gi-certifications");
  const decls = useCrud(farmId, "wine-gi-harvest-declarations", "wine-gi-harvest-declarations");

  return (
    <div className="space-y-4">
      <FsaCompletenessBar farmId={farmId} />
      <div className="flex gap-2 flex-wrap border-b pb-3">
        {GI_SUBTABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${subTab === t.id ? "bg-purple-100 text-purple-800" : "hover:bg-muted text-muted-foreground"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>
      {subTab === "designations" && <GiDesignationsSection farmId={farmId} desigs={desigs} />}
      {subTab === "block-compliance" && <GiBlockComplianceSection designations={desigs.data} registerRows={register.data} harvestRows={harvest.data} blocks={blocks} />}
      {subTab === "certifications" && <GiCertificationsSection farmId={farmId} certs={certs} designations={desigs.data} />}
      {subTab === "declarations" && <GiDeclarationsSection farmId={farmId} decls={decls} designations={desigs.data} harvestRows={harvest.data} registerRows={register.data} />}
    </div>
  );
}

function GiDesignationsSection({ farmId: _farmId, desigs }: { farmId: number; desigs: ReturnType<typeof useCrud> }) {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function openNew() { setForm({ designationType: "PDO", status: "active", competentAuthority: "APHA Wine Standards" }); setEditing({}); }
  function openEdit(r: Record<string, unknown>) { setForm({ ...r, approvedVarietiesText: fmtVarieties(r.approvedVarieties) }); setEditing(r); }

  async function save() {
    const varietiesArr = String(form.approvedVarietiesText ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const { approvedVarietiesText: _avt, ...rest } = form as Record<string, unknown> & { approvedVarietiesText?: unknown };
    void _avt;
    const payload = { ...rest, approvedVarieties: varietiesArr };
    if (editing && editing.id) { await desigs.edit.mutateAsync({ id: Number(editing.id), ...payload }); toast({ title: "Designation updated" }); }
    else { await desigs.add.mutateAsync(payload); toast({ title: "Designation added" }); }
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Designations" value={desigs.data.length} sub="registered" />
        <StatCard label="PDO" value={desigs.data.filter(d => d.designationType === "PDO").length} sub="protected designation" color="purple" />
        <StatCard label="PGI" value={desigs.data.filter(d => d.designationType === "PGI").length} sub="protected geographical" color="green" />
      </div>
      <div className="flex justify-end"><Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add Designation</Button></div>
      {desigs.data.length === 0 ? <Empty msg="No GI designations registered. Add your PDO or PGI to begin compliance tracking." /> : (
        <DataTable
          cols={[
            { key: "designationName", label: "Designation" },
            { key: "designationType", label: "Type", render: (r) => giTypeBadge(r.designationType) },
            { key: "aphaRef", label: "APHA Ref", render: (r) => <span className="text-sm text-muted-foreground">{fmt(r.aphaRef)}</span> },
            { key: "region", label: "Region", render: (r) => <span className="text-sm">{fmt(r.region)}</span> },
            { key: "approvedVarieties", label: "Varieties", render: (r) => { const arr = parseVarieties(r.approvedVarieties); return <span className="text-sm text-muted-foreground">{arr.length > 0 ? `${arr.length} listed` : "—"}</span>; } },
            { key: "maxYieldKgPerHa", label: "Max Yield (kg/ha)", render: (r) => <span className="text-sm">{r.maxYieldKgPerHa ? fmtNum(r.maxYieldKgPerHa, 0) : "—"}</span> },
            { key: "nextAssessmentDate", label: "Next Assessment", render: (r) => <span className="text-sm">{fmtDate(r.nextAssessmentDate)}</span> },
            { key: "status", label: "Status", render: (r) => giStatusBadge(r.status) },
          ]}
          rows={desigs.data} onView={setViewing} onEdit={openEdit} onDelete={setDeleting}
        />
      )}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{fmt(viewing?.designationName)}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <ViewField label="Type" value={viewing ? giTypeBadge(viewing.designationType) : null} />
            <ViewField label="APHA Reference" value={fmt(viewing?.aphaRef)} />
            <ViewField label="Competent Authority" value={fmt(viewing?.competentAuthority)} />
            <ViewField label="Region" value={fmt(viewing?.region)} />
            <ViewField label="Approved Varieties" value={fmtVarieties(viewing?.approvedVarieties)} />
            <ViewField label="Max Yield (kg/ha)" value={viewing?.maxYieldKgPerHa ? fmtNum(viewing.maxYieldKgPerHa, 0) : "—"} />
            <ViewField label="Registration Date" value={fmtDate(viewing?.registrationDate)} />
            <ViewField label="Next Assessment Date" value={fmtDate(viewing?.nextAssessmentDate)} />
            <ViewField label="Status" value={viewing ? giStatusBadge(viewing.status) : null} />
            <ViewField label="Notes" value={fmt(viewing?.notes)} />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={editing !== null} onOpenChange={() => { setEditing(null); desigs.add.reset(); desigs.edit.reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Designation" : "Add GI Designation"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Designation Name *</Label><Input value={String(form.designationName ?? "")} onChange={e => sf("designationName", e.target.value)} placeholder="e.g. English Wine PDO" /></div>
            <div><Label>Type *</Label>
              <Select value={String(form.designationType ?? "PDO")} onValueChange={v => sf("designationType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDO">PDO — Protected Designation of Origin</SelectItem>
                  <SelectItem value="PGI">PGI — Protected Geographical Indication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>APHA Reference</Label><Input value={String(form.aphaRef ?? "")} onChange={e => sf("aphaRef", e.target.value)} placeholder="APHA / Wine Standards reference" /></div>
            <div><Label>Competent Authority</Label><Input value={String(form.competentAuthority ?? "")} onChange={e => sf("competentAuthority", e.target.value)} placeholder="APHA Wine Standards" /></div>
            <div><Label>Region</Label><Input value={String(form.region ?? "")} onChange={e => sf("region", e.target.value)} placeholder="e.g. England, Wales" /></div>
            <div>
              <Label>Approved Grape Varieties</Label>
              <Textarea value={String(form.approvedVarietiesText ?? "")} onChange={e => sf("approvedVarietiesText", e.target.value)} placeholder="Comma-separated, e.g. Chardonnay, Pinot Noir, Pinot Meunier" rows={3} />
              <p className="text-xs text-muted-foreground mt-1">Used to flag non-approved varieties on the Block Compliance view.</p>
            </div>
            <div><Label>Maximum Permitted Yield (kg/ha)</Label><Input type="number" value={String(form.maxYieldKgPerHa ?? "")} onChange={e => sf("maxYieldKgPerHa", e.target.value)} placeholder="e.g. 14500" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Registration Date</Label><Input type="date" value={String(form.registrationDate ?? "")} onChange={e => sf("registrationDate", e.target.value)} /></div>
              <div><Label>Next Assessment Date</Label><Input type="date" value={String(form.nextAssessmentDate ?? "")} onChange={e => sf("nextAssessmentDate", e.target.value)} /></div>
            </div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "active")} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={desigs.add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={desigs.edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={!form.designationName || !form.designationType}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {deleting && <ConfirmDialog open title="Delete Designation" message={`Delete "${fmt(deleting.designationName)}"? This cannot be undone.`} confirmLabel="Delete" confirmVariant="destructive" mutation={desigs.remove} onConfirm={() => { desigs.remove.mutate(Number(deleting.id), { onSuccess: () => setDeleting(null) }); }} onCancel={() => { setDeleting(null); desigs.remove.reset(); }} />}
    </div>
  );
}

function GiBlockComplianceSection({ designations, registerRows, harvestRows, blocks }: {
  designations: Record<string, unknown>[];
  registerRows: Record<string, unknown>[];
  harvestRows: Record<string, unknown>[];
  blocks: Record<string, unknown>[];
}) {
  const giRows = useMemo(() => {
    return registerRows
      .filter(r => r.giClassification && String(r.giClassification).trim() !== "")
      .map(r => {
        const giClass = String(r.giClassification ?? "");
        const desig = designations.find(d => String(d.designationName) === giClass);
        const block = blocks.find(b => String(b.id) === String(r.blockId));
        const areaHa = parseFloat(String(r.registeredAreaHa ?? block?.areaHa ?? "0")) || 0;
        const variety = String(r.registeredVariety ?? "");
        const approvedVarieties = desig ? parseVarieties(desig.approvedVarieties) : [];
        const varietyOk = approvedVarieties.length === 0 ? null : approvedVarieties.some(v => v.toLowerCase().trim() === variety.toLowerCase().trim());
        const blockHarvests = harvestRows.filter(h => String(h.blockId) === String(r.blockId)).sort((a, b) => Number(b.vintageYear ?? 0) - Number(a.vintageYear ?? 0));
        const latestHarvest = blockHarvests[0] ?? null;
        const yieldKg = latestHarvest ? parseFloat(String(latestHarvest.yieldKg ?? "0")) || 0 : null;
        const yieldKgPerHa = yieldKg !== null && areaHa > 0 ? yieldKg / areaHa : null;
        const maxYield = desig ? parseFloat(String(desig.maxYieldKgPerHa ?? "0")) || null : null;
        const yieldOk = yieldKgPerHa !== null && maxYield !== null ? yieldKgPerHa <= maxYield : null;
        return { r, desig, block, variety, varietyOk, approvedVarieties, areaHa, yieldKgPerHa, maxYield, yieldOk, latestHarvest };
      });
  }, [designations, registerRows, harvestRows, blocks]);

  const noDesig = registerRows.filter(r => !r.giClassification || String(r.giClassification).trim() === "").length;
  const issues = giRows.filter(r => r.varietyOk === false || r.yieldOk === false).length;

  if (giRows.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-800 font-semibold"><BadgeAlert className="w-5 h-5" />No GI-linked vine register entries</div>
        <p className="text-sm text-amber-700">To use Block Compliance tracking, open the Vine Register tab, edit each row, and set its GI Classification field to the name of one of your registered designations (e.g. "English Wine PDO"). The system then checks variety approval and yield thresholds automatically from your harvest data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="GI-Linked Rows" value={giRows.length} sub="vine register entries" color="purple" />
        <StatCard label="Compliant" value={giRows.length - issues} sub="no issues detected" color="green" />
        <StatCard label="Issues" value={issues} sub="variety or yield flag" color={issues > 0 ? "red" : "green"} />
      </div>
      {noDesig > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{noDesig}</strong> vine register {noDesig === 1 ? "row has" : "rows have"} no GI classification set and are not shown here. Edit those rows on the Vine Register tab to link them.
        </div>
      )}
      <div className="space-y-3">
        {giRows.map((item, i) => {
          const hasIssue = item.varietyOk === false || item.yieldOk === false;
          return (
            <div key={i} className={`rounded-xl border p-4 space-y-3 ${hasIssue ? "border-red-200 bg-red-50/30" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">{fmt(item.r.registeredVariety)} — {fmt(item.block?.blockName ?? item.r.blockId)}</div>
                  <div className="text-sm text-muted-foreground">{fmt(item.r.giClassification)} · {item.areaHa.toFixed(4)} ha registered</div>
                </div>
                {item.desig ? giTypeBadge(item.desig.designationType) : <span className="text-xs text-red-600 font-medium">Designation not found — check GI Classification matches a registered designation name exactly</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">Variety Approval</div>
                  {item.approvedVarieties.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No approved variety list set on this designation</span>
                  ) : item.varietyOk ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-700 font-medium"><CheckCircle2 className="w-4 h-4" />{item.variety} is approved</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-red-700 font-medium"><XCircle className="w-4 h-4" />{item.variety} is NOT on the approved list</span>
                  )}
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">Yield vs Threshold{item.latestHarvest ? ` (${fmt(item.latestHarvest.vintageYear)})` : ""}</div>
                  {item.yieldKgPerHa === null ? (
                    <span className="text-sm text-muted-foreground">No harvest data for this block</span>
                  ) : item.maxYield === null ? (
                    <span className="text-sm text-muted-foreground">No max yield set on designation</span>
                  ) : item.yieldOk ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-700 font-medium"><CheckCircle2 className="w-4 h-4" />{fmtNum(item.yieldKgPerHa, 0)} kg/ha — within {fmtNum(item.maxYield, 0)} kg/ha limit</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-red-700 font-medium"><XCircle className="w-4 h-4" />{fmtNum(item.yieldKgPerHa, 0)} kg/ha — exceeds limit by {fmtNum(item.yieldKgPerHa - item.maxYield, 0)} kg/ha</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GiCertificationsSection({ farmId: _farmId, certs, designations }: { farmId: number; certs: ReturnType<typeof useCrud>; designations: Record<string, unknown>[] }) {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const desigName = (id: unknown) => { const d = designations.find(d => String(d.id) === String(id)); return d ? String(d.designationName) : `Designation ${id}`; };

  function openNew() { setForm({ result: "pending", assessmentType: "both", vintageYear: new Date().getFullYear() - 1 }); setEditing({}); }
  function openEdit(r: Record<string, unknown>) { setForm({ ...r }); setEditing(r); }
  async function save() {
    if (editing && editing.id) { await certs.edit.mutateAsync({ id: Number(editing.id), ...form }); toast({ title: "Certification updated" }); }
    else { await certs.add.mutateAsync(form); toast({ title: "Certification added" }); }
    setEditing(null);
  }

  const expiringSoon = certs.data.filter(c => {
    if (!c.certificateExpiryDate) return false;
    const diff = (new Date(String(c.certificateExpiryDate)).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 90;
  }).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Certifications" value={certs.data.length} sub="total records" />
        <StatCard label="Passed" value={certs.data.filter(c => c.result === "passed").length} sub="successful assessments" color="green" />
        <StatCard label="Expiring ≤90 days" value={expiringSoon} sub="certificate renewals" color={expiringSoon > 0 ? "amber" : "green"} />
      </div>
      <div className="flex justify-end"><Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add Certification</Button></div>
      {certs.data.length === 0 ? <Empty msg="No certification records yet. Add a record after each vintage is assessed by APHA Wine Standards." /> : (
        <DataTable
          cols={[
            { key: "vintageYear", label: "Vintage" },
            { key: "designationId", label: "Designation", render: (r) => <span className="text-sm">{desigName(r.designationId)}</span> },
            { key: "assessmentType", label: "Assessment", render: (r) => <span className="text-sm capitalize">{fmt(r.assessmentType)}</span> },
            { key: "submissionDate", label: "Submitted", render: (r) => <span className="text-sm">{fmtDate(r.submissionDate)}</span> },
            { key: "result", label: "Result", render: (r) => giResultBadge(r.result) },
            { key: "certificateNumber", label: "Certificate No.", render: (r) => <span className="text-sm font-mono">{fmt(r.certificateNumber)}</span> },
            { key: "certificateExpiryDate", label: "Expiry", render: (r) => {
              if (!r.certificateExpiryDate) return <span className="text-muted-foreground">—</span>;
              const diff = (new Date(String(r.certificateExpiryDate)).getTime() - Date.now()) / 86400000;
              return <span className={`text-sm ${diff < 0 ? "text-red-600 font-medium" : diff < 90 ? "text-amber-600 font-medium" : ""}`}>{fmtDate(r.certificateExpiryDate)}</span>;
            }},
          ]}
          rows={certs.data} onView={setViewing} onEdit={openEdit} onDelete={setDeleting}
        />
      )}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Certification — {fmt(viewing?.vintageYear)} Vintage</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <ViewField label="Designation" value={viewing ? desigName(viewing.designationId) : null} />
            <ViewField label="Vintage Year" value={fmt(viewing?.vintageYear)} />
            <ViewField label="Submission Date" value={fmtDate(viewing?.submissionDate)} />
            <ViewField label="Assessment Type" value={fmt(viewing?.assessmentType)} />
            <ViewField label="Assessment Date" value={fmtDate(viewing?.assessmentDate)} />
            <ViewField label="Result" value={viewing ? giResultBadge(viewing.result) : null} />
            <ViewField label="Certificate Number" value={fmt(viewing?.certificateNumber)} />
            <ViewField label="Issue Date" value={fmtDate(viewing?.certificateIssueDate)} />
            <ViewField label="Expiry Date" value={fmtDate(viewing?.certificateExpiryDate)} />
            <ViewField label="Assessor" value={fmt(viewing?.assessorName)} />
            <ViewField label="Assessor Organisation" value={fmt(viewing?.assessorOrganisation)} />
            <ViewField label="Sample Reference" value={fmt(viewing?.sampleReference)} />
            <ViewField label="Wine Lot Reference" value={fmt(viewing?.wineLotReference)} />
            <ViewField label="Volume Assessed (L)" value={viewing?.volumeAssessedL ? fmtNum(viewing.volumeAssessedL, 0) : "—"} />
            {String(viewing?.result) === "failed" && <ViewField label="Failure Reason" value={fmt(viewing?.failureReason)} />}
            <ViewField label="Notes" value={fmt(viewing?.notes)} />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={editing !== null} onOpenChange={() => { setEditing(null); certs.add.reset(); certs.edit.reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Certification" : "Add Certification Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Designation</Label>
              <Select value={String(form.designationId ?? "__none__")} onValueChange={v => sf("designationId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select designation…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No designation</SelectItem>
                  {designations.map(d => <SelectItem key={String(d.id)} value={String(d.id)}>{String(d.designationName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Vintage Year *</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} placeholder="e.g. 2024" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assessment Type</Label>
                <Select value={String(form.assessmentType ?? "both")} onValueChange={v => sf("assessmentType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytical">Analytical only</SelectItem>
                    <SelectItem value="organoleptic">Organoleptic only</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Result</Label>
                <Select value={String(form.result ?? "pending")} onValueChange={v => sf("result", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Submission Date</Label><Input type="date" value={String(form.submissionDate ?? "")} onChange={e => sf("submissionDate", e.target.value)} /></div>
              <div><Label>Assessment Date</Label><Input type="date" value={String(form.assessmentDate ?? "")} onChange={e => sf("assessmentDate", e.target.value)} /></div>
            </div>
            <div><Label>Certificate Number</Label><Input value={String(form.certificateNumber ?? "")} onChange={e => sf("certificateNumber", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Issue Date</Label><Input type="date" value={String(form.certificateIssueDate ?? "")} onChange={e => sf("certificateIssueDate", e.target.value)} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={String(form.certificateExpiryDate ?? "")} onChange={e => sf("certificateExpiryDate", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assessor Name</Label><Input value={String(form.assessorName ?? "")} onChange={e => sf("assessorName", e.target.value)} /></div>
              <div><Label>Assessor Organisation</Label><Input value={String(form.assessorOrganisation ?? "")} onChange={e => sf("assessorOrganisation", e.target.value)} placeholder="APHA Wine Standards" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Sample Reference</Label><Input value={String(form.sampleReference ?? "")} onChange={e => sf("sampleReference", e.target.value)} /></div>
              <div><Label>Wine Lot Reference</Label><Input value={String(form.wineLotReference ?? "")} onChange={e => sf("wineLotReference", e.target.value)} /></div>
            </div>
            <div><Label>Volume Assessed (L)</Label><Input type="number" value={String(form.volumeAssessedL ?? "")} onChange={e => sf("volumeAssessedL", e.target.value)} /></div>
            {form.result === "failed" && <div><Label>Failure Reason</Label><Textarea value={String(form.failureReason ?? "")} onChange={e => sf("failureReason", e.target.value)} rows={2} /></div>}
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.resubmissionRequired} onCheckedChange={v => sf("resubmissionRequired", !!v)} id="resub" />
              <Label htmlFor="resub">Resubmission required</Label>
            </div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={certs.add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={certs.edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={!form.vintageYear}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {deleting && <ConfirmDialog open title="Delete Certification" message={`Delete ${fmt(deleting.vintageYear)} certification? This cannot be undone.`} confirmLabel="Delete" confirmVariant="destructive" mutation={certs.remove} onConfirm={() => { certs.remove.mutate(Number(deleting.id), { onSuccess: () => setDeleting(null) }); }} onCancel={() => { setDeleting(null); certs.remove.reset(); }} />}
    </div>
  );
}

function GiDeclarationsSection({ farmId, decls, designations, harvestRows, registerRows }: {
  farmId: number;
  decls: ReturnType<typeof useCrud>;
  designations: Record<string, unknown>[];
  harvestRows: Record<string, unknown>[];
  registerRows: Record<string, unknown>[];
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-gi-declarations", filter: "year", farmId, defaultValue: "all" });
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const desigName = (id: unknown) => { const d = designations.find(d => String(d.id) === String(id)); return d ? String(d.designationName) : `Designation ${id}`; };
  const declYears = Array.from(new Set(decls.data.map((d: Record<string, unknown>) => String(d.vintageYear ?? "")).filter(Boolean))).sort().reverse();
  if (!declYears.includes(String(new Date().getFullYear() - 1))) declYears.unshift(String(new Date().getFullYear() - 1));
  const filteredDecls = yearFilter === "all" ? decls.data : decls.data.filter((d: Record<string, unknown>) => String(d.vintageYear) === yearFilter);
  const declCsvCols = [
    { key: "vintageYear", label: "Vintage Year" },
    { key: "designationId", label: "Designation", fmt: (r: Record<string, unknown>) => desigName(r.designationId) },
    { key: "declarationRef", label: "Declaration Ref" },
    { key: "totalRegisteredAreaHa", label: "Registered Area (ha)" },
    { key: "totalYieldKg", label: "Total Yield (kg)" },
    { key: "declaredYieldKgPerHa", label: "Yield (kg/ha)" },
    { key: "submissionDate", label: "Submitted", fmt: (r: Record<string, unknown>) => fmtDate(r.submissionDate as string | null | undefined) },
    { key: "status", label: "Status" },
  ];

  function openNew() { setForm({ status: "draft", vintageYear: new Date().getFullYear() - 1 }); setEditing({}); }
  function openEdit(r: Record<string, unknown>) { setForm({ ...r }); setEditing(r); }

  function autoPopulate() {
    const yr = Number(form.vintageYear);
    const desigId = form.designationId ? Number(form.designationId) : null;
    const desig = desigId ? designations.find(d => Number(d.id) === desigId) : null;
    const desigNameVal = desig ? String(desig.designationName) : null;
    const relevantReg = registerRows.filter(r => !desigNameVal || String(r.giClassification) === desigNameVal);
    const blockIds = new Set(relevantReg.map(r => String(r.blockId)));
    const totalArea = relevantReg.reduce((s, r) => s + (parseFloat(String(r.registeredAreaHa ?? "0")) || 0), 0);
    const relevantHarvests = harvestRows.filter(h => Number(h.vintageYear) === yr && (blockIds.size === 0 || blockIds.has(String(h.blockId))));
    const totalYieldKg = relevantHarvests.reduce((s, h) => s + (parseFloat(String(h.yieldKg ?? "0")) || 0), 0);
    const yieldKgPerHa = totalArea > 0 ? totalYieldKg / totalArea : 0;
    const maxYield = desig ? parseFloat(String(desig.maxYieldKgPerHa ?? "0")) || null : null;
    setForm(f => ({
      ...f,
      totalRegisteredAreaHa: totalArea.toFixed(4),
      totalYieldKg: totalYieldKg.toFixed(2),
      declaredYieldKgPerHa: yieldKgPerHa.toFixed(2),
      ...(maxYield !== null ? { maxPermittedYieldKgPerHa: String(maxYield), yieldWithinLimit: yieldKgPerHa <= maxYield } : {}),
    }));
    toast({ title: "Auto-populated", description: `${relevantHarvests.length} harvest record(s) found for ${yr}.` });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Declarations" value={decls.data.length} sub="total records" />
        <StatCard label="Submitted" value={decls.data.filter(d => d.status === "submitted" || d.status === "acknowledged").length} sub="filed with APHA" color="green" />
        <StatCard label="Drafts" value={decls.data.filter(d => d.status === "draft").length} sub="not yet submitted" color="amber" />
      </div>
      <div className="flex gap-2 items-center justify-between flex-wrap">
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vintages</SelectItem>
              {declYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredDecls, "gi-declarations.csv", declCsvCols)} disabled={!filteredDecls.length}>
            <FileDown className="w-4 h-4 mr-1" />Export CSV
          </Button>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add Declaration</Button>
      </div>
      {decls.data.length === 0 ? <Empty msg="No harvest declarations yet. Producers holding PDO or PGI status must submit a harvest declaration to APHA Wine Standards after each vintage." /> : (
        <DataTable
          cols={[
            { key: "vintageYear", label: "Vintage" },
            { key: "designationId", label: "Designation", render: (r) => <span className="text-sm">{desigName(r.designationId)}</span> },
            { key: "declarationRef", label: "Declaration Ref", render: (r) => <span className="text-sm font-mono">{fmt(r.declarationRef)}</span> },
            { key: "declaredYieldKgPerHa", label: "Yield (kg/ha)", render: (r) => <span className="text-sm">{r.declaredYieldKgPerHa ? fmtNum(r.declaredYieldKgPerHa, 0) : "—"}</span> },
            { key: "yieldWithinLimit", label: "Within Limit", render: (r) => yieldLimitBadge(r.yieldWithinLimit == null ? null : Boolean(r.yieldWithinLimit)) },
            { key: "submissionDate", label: "Submitted", render: (r) => <span className="text-sm">{fmtDate(r.submissionDate)}</span> },
            { key: "status", label: "Status", render: (r) => declStatusBadge(r.status) },
          ]}
          rows={filteredDecls} onView={setViewing} onEdit={openEdit} onDelete={setDeleting}
        />
      )}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Harvest Declaration — {fmt(viewing?.vintageYear)}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <ViewField label="Designation" value={viewing ? desigName(viewing.designationId) : null} />
            <ViewField label="Vintage Year" value={fmt(viewing?.vintageYear)} />
            <ViewField label="Declaration Reference" value={fmt(viewing?.declarationRef)} />
            <ViewField label="Submission Date" value={fmtDate(viewing?.submissionDate)} />
            <ViewField label="Submitted By" value={fmt(viewing?.submittedBy)} />
            <ViewField label="Total Registered Area (ha)" value={viewing?.totalRegisteredAreaHa ? fmtNum(viewing.totalRegisteredAreaHa, 4) : "—"} />
            <ViewField label="Total Yield (kg)" value={viewing?.totalYieldKg ? fmtNum(viewing.totalYieldKg, 0) : "—"} />
            <ViewField label="Declared Yield (kg/ha)" value={viewing?.declaredYieldKgPerHa ? fmtNum(viewing.declaredYieldKgPerHa, 0) : "—"} />
            <ViewField label="Max Permitted (kg/ha)" value={viewing?.maxPermittedYieldKgPerHa ? fmtNum(viewing.maxPermittedYieldKgPerHa, 0) : "—"} />
            <ViewField label="Yield Within Limit" value={viewing ? yieldLimitBadge(viewing.yieldWithinLimit == null ? null : Boolean(viewing.yieldWithinLimit)) : null} />
            <ViewField label="Status" value={viewing ? declStatusBadge(viewing.status) : null} />
            <ViewField label="APHA Acknowledgement Ref" value={fmt(viewing?.aphaAcknowledgementRef)} />
            <ViewField label="Notes" value={fmt(viewing?.notes)} />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={editing !== null} onOpenChange={() => { setEditing(null); decls.edit.reset(); decls.add.reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Declaration" : "Add Harvest Declaration"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Designation</Label>
              <Select value={String(form.designationId ?? "__none__")} onValueChange={v => sf("designationId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select designation…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No designation</SelectItem>
                  {designations.map(d => <SelectItem key={String(d.id)} value={String(d.id)}>{String(d.designationName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Vintage Year *</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} /></div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={autoPopulate} disabled={!form.vintageYear}>
                <FileDown className="w-3.5 h-3.5 mr-1" />Populate from Harvest Data
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Total Registered Area (ha)</Label><Input type="number" step="0.0001" value={String(form.totalRegisteredAreaHa ?? "")} onChange={e => sf("totalRegisteredAreaHa", e.target.value)} /></div>
              <div><Label>Total Yield (kg)</Label><Input type="number" value={String(form.totalYieldKg ?? "")} onChange={e => sf("totalYieldKg", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Declared Yield (kg/ha)</Label><Input type="number" value={String(form.declaredYieldKgPerHa ?? "")} onChange={e => sf("declaredYieldKgPerHa", e.target.value)} /></div>
              <div><Label>Max Permitted (kg/ha)</Label><Input type="number" value={String(form.maxPermittedYieldKgPerHa ?? "")} onChange={e => sf("maxPermittedYieldKgPerHa", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.yieldWithinLimit} onCheckedChange={v => sf("yieldWithinLimit", !!v)} id="ywl" />
              <Label htmlFor="ywl">Yield within permitted limit</Label>
            </div>
            <div><Label>Declaration Reference</Label><Input value={String(form.declarationRef ?? "")} onChange={e => sf("declarationRef", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Submission Date</Label><Input type="date" value={String(form.submissionDate ?? "")} onChange={e => sf("submissionDate", e.target.value)} /></div>
              <div><Label>Submitted By</Label><Input value={String(form.submittedBy ?? "")} onChange={e => sf("submittedBy", e.target.value)} /></div>
            </div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "draft")} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged by APHA</SelectItem>
                  <SelectItem value="queried">Queried by APHA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>APHA Acknowledgement Reference</Label><Input value={String(form.aphaAcknowledgementRef ?? "")} onChange={e => sf("aphaAcknowledgementRef", e.target.value)} /></div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={decls.edit} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={decls.add} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={async () => { if (editing?.id) { await decls.edit.mutateAsync({ id: Number(editing.id), ...form }); toast({ title: "Declaration updated" }); } else { await decls.add.mutateAsync(form); toast({ title: "Declaration added" }); } setEditing(null); }} disabled={!form.vintageYear}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {deleting && <ConfirmDialog open title="Delete Declaration" message={`Delete ${fmt(deleting.vintageYear)} declaration? This cannot be undone.`} confirmLabel="Delete" confirmVariant="destructive" mutation={decls.remove} onConfirm={() => { decls.remove.mutate(Number(deleting.id), { onSuccess: () => setDeleting(null) }); }} onCancel={() => { setDeleting(null); decls.remove.reset(); }} />}
    </div>
  );
}

