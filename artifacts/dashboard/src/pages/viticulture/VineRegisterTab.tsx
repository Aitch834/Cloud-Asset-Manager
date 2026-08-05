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

type VineReg = Record<string, unknown>;

export function VineRegisterTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<VineReg>(farmId, "vine-register", "vine-register");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VineReg | null>(null);
  const [form, setForm] = useState<VineReg>({});
  const [viewing, setViewing] = useState<VineReg | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<VineReg | null>(null);
  const varieties = useLookupStrings("vineyard_grape_varieties", UK_GRAPE_VARIETIES);
  const [varietyOther, setVarietyOther] = useState(false);

  const openAdd = () => { setForm({}); setCurrent(null); setVarietyOther(false); setOpen(true); };
  const openEdit = (r: VineReg) => {
    setForm({ ...r });
    setCurrent(r);
    setVarietyOther(!!r.registeredVariety && !UK_GRAPE_VARIETIES.includes(String(r.registeredVariety)));
    setOpen(true);
  };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const csvCols = [
    { key: "fsaVineRegisterRef", label: "FSA Ref" },
    { key: "registeredVariety", label: "Variety" },
    { key: "vivcNumber", label: "VIVC Number" },
    { key: "varietyColour", label: "Berry Colour" },
    { key: "motherVariety", label: "Mother Variety" },
    { key: "fatherVariety", label: "Father Variety" },
    { key: "registeredAreaHa", label: "Area (ha)" },
    { key: "giClassification", label: "GI Classification" },
    { key: "wineColour", label: "Wine Colour" },
    { key: "dateRegistered", label: "Date Registered", fmt: (r: Record<string, unknown>) => fmtDate(r.dateRegistered) },
    { key: "dateAmended", label: "Date Amended", fmt: (r: Record<string, unknown>) => fmtDate(r.dateAmended) },
    { key: "isRemovedFromRegister", label: "Status", fmt: (r: Record<string, unknown>) => r.isRemovedFromRegister ? "Removed" : "Active" },
    { key: "removalDate", label: "Removal Date", fmt: (r: Record<string, unknown>) => fmtDate(r.removalDate) },
    { key: "removalReason", label: "Removal Reason" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">FSA Vine Register</p>
          <p className="text-xs text-muted-foreground">Mandatory for all UK vineyards over 0.01 ha. Keep this up to date and report any changes to the Food Standards Agency.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "vine-register.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Entry</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "fsaVineRegisterRef", label: "FSA Ref" },
          { key: "registeredVariety", label: "Variety" },
          { key: "registeredAreaHa", label: "Area (ha)", render: r => fmtNum(r.registeredAreaHa, 4) },
          { key: "giClassification", label: "GI / PDO" },
          { key: "wineColour", label: "Colour" },
          { key: "dateRegistered", label: "Date Registered", render: r => fmtDate(r.dateRegistered) },
          { key: "isRemovedFromRegister", label: "Status", render: r => <Badge variant={r.isRemovedFromRegister ? "destructive" : "default"}>{r.isRemovedFromRegister ? "Removed" : "Active"}</Badge> },
        ]}
        rows={data}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Vine Register Entry</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ViewField label="FSA Ref" value={fmt(viewing.fsaVineRegisterRef)} />
                <ViewField label="Registered Variety" value={fmt(viewing.registeredVariety)} />
              </div>
              {!!(viewing.motherVariety || viewing.fatherVariety || viewing.vivcNumber || viewing.varietyColour) && (
                <div className="rounded-md border bg-muted/30 px-3 py-2.5 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variety Pedigree</p>
                  <div className="grid grid-cols-2 gap-3">
                    {!!(viewing.motherVariety || viewing.fatherVariety) && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Parentage (VIVC nomenclature)</p>
                        <p className="text-sm font-mono">
                          {String(viewing.motherVariety || "?")}
                          <span className="text-muted-foreground mx-1.5">♀ ×</span>
                          {String(viewing.fatherVariety || "?")}
                          <span className="text-muted-foreground ml-1.5">♂</span>
                        </p>
                      </div>
                    )}
                    {!!viewing.vivcNumber && <ViewField label="VIVC Number" value={fmt(viewing.vivcNumber)} />}
                    {!!viewing.varietyColour && <ViewField label="Berry Colour" value={fmt(viewing.varietyColour)} />}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <ViewField label="Registered Area (ha)" value={fmtNum(viewing.registeredAreaHa, 4)} />
                <ViewField label="GI Classification" value={fmt(viewing.giClassification)} />
                <ViewField label="Wine Colour" value={fmt(viewing.wineColour)} />
                <ViewField label="Linked Block" value={fmt(blocks.find(b => b.id === viewing.blockId)?.blockName)} />
                <ViewField label="Date Registered" value={fmtDate(viewing.dateRegistered)} />
                <ViewField label="Date Amended" value={fmtDate(viewing.dateAmended)} />
                <ViewField label="Status" value={!!viewing.isRemovedFromRegister ? <Badge variant="destructive">Removed</Badge> : <Badge>Active</Badge>} />
                {!!viewing.isRemovedFromRegister && <>
                  <ViewField label="Removal Date" value={fmtDate(viewing.removalDate)} />
                  <div className="col-span-2"><ViewField label="Removal Reason" value={fmt(viewing.removalReason)} /></div>
                </>}
                {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
              </div>
            </div>
          )}
          {viewing && typeof viewing.id === "number" && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="vine-register" recordId={viewing.id} />
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
          defaultTitle={`Vine Register — ${fmt(raiseTaskFor.registeredVariety)} (${fmt(raiseTaskFor.fsaVineRegisterRef)})`}
          defaultDescription={`Area: ${fmtNum(raiseTaskFor.registeredAreaHa, 4)} ha · GI: ${fmt(raiseTaskFor.giClassification)} · Status: ${raiseTaskFor.isRemovedFromRegister ? "Removed" : "Active"}`}
          module="Viticulture"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); add.reset(); edit.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Vine Register Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>FSA Vine Register Ref</Label><Input value={String(form.fsaVineRegisterRef ?? "")} onChange={e => sf("fsaVineRegisterRef", e.target.value)} placeholder="e.g. WPR-12345" /></div>
              <div>
                <Label>Registered Variety *</Label>
                <Select
                  value={varietyOther ? "Other" : String(form.registeredVariety ?? "")}
                  onValueChange={v => { if (v === "Other") { setVarietyOther(true); sf("registeredVariety", ""); } else { setVarietyOther(false); sf("registeredVariety", v); } }}
                >
                  <SelectTrigger><SelectValue placeholder="Select variety…" /></SelectTrigger>
                  <SelectContent>{varieties.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                {varietyOther && <Input className="mt-1.5" placeholder="Enter variety name…" value={String(form.registeredVariety ?? "")} onChange={e => sf("registeredVariety", e.target.value)} />}
              </div>
            </div>
            {/* Pedigree / ampelographic fields */}
            <div className="rounded-md border bg-muted/30 px-3 py-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variety Pedigree <span className="normal-case font-normal">(VIVC nomenclature — optional)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Mother Variety <span className="text-muted-foreground font-normal">(♀ seed parent)</span></Label>
                  <Input value={String(form.motherVariety ?? "")} onChange={e => sf("motherVariety", e.target.value)} placeholder="e.g. Sirius" />
                </div>
                <div>
                  <Label>Father Variety <span className="text-muted-foreground font-normal">(♂ pollen parent)</span></Label>
                  <Input value={String(form.fatherVariety ?? "")} onChange={e => sf("fatherVariety", e.target.value)} placeholder="e.g. Villard Blanc" />
                </div>
                <div>
                  <Label>VIVC Number</Label>
                  <Input value={String(form.vivcNumber ?? "")} onChange={e => sf("vivcNumber", e.target.value)} placeholder="e.g. 21074" />
                  <p className="text-xs text-muted-foreground mt-1">Vitis International Variety Catalogue accession. Look up at <span className="font-mono">vivc.de</span></p>
                </div>
                <div>
                  <Label>Berry Colour</Label>
                  <Select value={String(form.varietyColour ?? "")} onValueChange={v => sf("varietyColour", v)}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {["White", "Black", "Grey", "Rosé/Pink", "Teinturier"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Colour of berry skin — VIVC classification</p>
                </div>
              </div>
              {!!(form.motherVariety || form.fatherVariety) && (
                <div className="rounded bg-background border px-3 py-2 text-sm font-mono text-muted-foreground">
                  {String(form.registeredVariety || "—")}
                  <span className="mx-2 text-xs">=</span>
                  {String(form.motherVariety || "?")}
                  <span className="mx-1.5">♀ ×</span>
                  {String(form.fatherVariety || "?")}
                  <span className="ml-1.5">♂</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Registered Area (ha) *</Label><Input type="number" step="0.0001" value={String(form.registeredAreaHa ?? "")} onChange={e => sf("registeredAreaHa", e.target.value)} /></div>
              <div>
                <Label>GI Classification</Label>
                <Select value={String(form.giClassification ?? "")} onValueChange={v => sf("giClassification", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["English Wine PDO", "English Wine PGI", "Welsh Wine PDO", "Welsh Wine PGI", "UK Table Wine", "No GI"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Wine Colour</Label>
                <Select value={String(form.wineColour ?? "")} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["White", "Red", "Rosé", "Sparkling White", "Sparkling Rosé", "Sparkling Red"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Link to Block</Label>
                <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)} ({String(b.variety)})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Registered</Label><Input type="date" max={today} value={String(form.dateRegistered ?? "")} onChange={e => sf("dateRegistered", e.target.value)} /></div>
              <div><Label>Date Amended</Label><Input type="date" max={today} value={String(form.dateAmended ?? "")} onChange={e => sf("dateAmended", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.isRemovedFromRegister} onCheckedChange={v => sf("isRemovedFromRegister", !!v)} id="rmv" />
              <Label htmlFor="rmv">Removed from register</Label>
            </div>
            {!!form.isRemovedFromRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Removal Date</Label><Input type="date" max={today} value={String(form.removalDate ?? "")} onChange={e => sf("removalDate", e.target.value)} /></div>
                <div><Label>Removal Reason</Label><Input value={String(form.removalReason ?? "")} onChange={e => sf("removalReason", e.target.value)} /></div>
              </div>
            )}
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

// ─── Blocks ────────────────────────────────────────────────────────────────────
