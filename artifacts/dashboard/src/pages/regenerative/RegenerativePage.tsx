import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Sprout, Plus, Pencil, Trash2 } from "lucide-react";

const TAB_IDS = ["practices", "soil", "summary"] as const;
type RegenTab = (typeof TAB_IDS)[number];

/** The six widely-recognised regenerative principles (Groundswell / Regenified 6-3-4 / gov.scot code of practice). */
const PRINCIPLES: { value: string; label: string; hint: string }[] = [
  { value: "min_disturbance", label: "Minimise soil disturbance", hint: "No-till or reduced tillage" },
  { value: "soil_cover", label: "Keep soil covered", hint: "Cover crops, stubble, mulches — no bare ground over winter" },
  { value: "living_roots", label: "Living roots year-round", hint: "Catch/cover crops, undersowing, leys" },
  { value: "diversity", label: "Maximise diversity", hint: "Varied rotations, companion cropping, herbal leys" },
  { value: "livestock_integration", label: "Integrate livestock", hint: "Rotational/mob grazing on arable ground" },
  { value: "input_reduction", label: "Reduce synthetic inputs", hint: "Cutting fertiliser and pesticide use over time" },
];
const principleLabel = (v: string) => PRINCIPLES.find(p => p.value === v)?.label ?? v;

const num = (v: unknown) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };
const fmtDate = (d: string | null | undefined) => (d ? String(d).slice(0, 10) : "—");
const yearOf = (r: any) => r.seasonYear ?? (r.recordDate ? Number(String(r.recordDate).slice(0, 4)) : null);

// ─── Practice dialog ──────────────────────────────────────────────────────────
function PracticeDialog({ farmId, editRow, fields, onClose }: { farmId: number; editRow?: any; fields: any[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(() => ({
    recordDate: editRow?.recordDate?.slice(0, 10) ?? "",
    seasonYear: editRow?.seasonYear != null ? String(editRow.seasonYear) : String(new Date().getFullYear()),
    fieldId: editRow?.fieldId ? String(editRow.fieldId) : "",
    fieldName: editRow?.fieldName ?? "",
    principle: editRow?.principle ?? "min_disturbance",
    practice: editRow?.practice ?? "",
    areaHectares: editRow?.areaHectares ?? "",
    details: editRow?.details ?? "",
  }));
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        recordDate: f.recordDate,
        seasonYear: f.seasonYear ? Number(f.seasonYear) : null,
        fieldId: f.fieldId ? Number(f.fieldId) : null,
        fieldName: f.fieldName || (f.fieldId ? (fields.find((fd: any) => String(fd.id) === f.fieldId)?.name ?? null) : null),
        principle: f.principle,
        practice: f.practice,
        areaHectares: f.areaHectares || null,
        details: f.details || null,
      };
      return editRow
        ? api.put(`/farms/${farmId}/regen-practices/${editRow.id}`, payload)
        : api.post(`/farms/${farmId}/regen-practices`, payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["regen-practices", farmId] }); onClose(); },
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) { saveMut.reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editRow ? "Edit Practice Record" : "Record Regenerative Practice"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Date *</Label><Input type="date" value={f.recordDate} onChange={e => set("recordDate", e.target.value)} /></div>
          <div><Label>Season / harvest year</Label><Input type="number" value={f.seasonYear} onChange={e => set("seasonYear", e.target.value)} /></div>
          <div>
            <Label>Field</Label>
            <Select value={f.fieldId || "none"} onValueChange={v => set("fieldId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None / whole farm —</SelectItem>
                {fields.map((fd: any) => <SelectItem key={fd.id} value={String(fd.id)}>{fd.name ?? fd.fieldName ?? `Field ${fd.id}`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Field name (if not listed)</Label><Input value={f.fieldName} onChange={e => set("fieldName", e.target.value)} /></div>
          <div className="col-span-2">
            <Label>Principle *</Label>
            <Select value={f.principle} onValueChange={v => set("principle", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRINCIPLES.map(p => <SelectItem key={p.value} value={p.value}>{p.label} — {p.hint}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Practice *</Label><Input value={f.practice} onChange={e => set("practice", e.target.value)} placeholder="e.g. No-till drilling, Cover crop — vetch/rye" /></div>
          <div><Label>Area (ha)</Label><Input type="number" min="0" step="0.01" value={f.areaHectares} onChange={e => set("areaHectares", e.target.value)} /></div>
          <div className="col-span-2"><Label>Details / evidence</Label><Textarea rows={2} value={f.details} onChange={e => set("details", e.target.value)} placeholder="Mix, drill used, photos kept, input reduction vs last year…" /></div>
        </div>
        <DialogMutationError mutation={saveMut} />
        <DialogFooter>
          <Button variant="outline" onClick={() => { saveMut.reset(); onClose(); }}>Cancel</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !f.recordDate || !f.practice}>{saveMut.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Soil indicator dialog ────────────────────────────────────────────────────
function SoilDialog({ farmId, editRow, fields, onClose }: { farmId: number; editRow?: any; fields: any[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(() => ({
    testDate: editRow?.testDate?.slice(0, 10) ?? "",
    fieldId: editRow?.fieldId ? String(editRow.fieldId) : "",
    fieldName: editRow?.fieldName ?? "",
    sampleDepthCm: editRow?.sampleDepthCm != null ? String(editRow.sampleDepthCm) : "",
    organicMatterPercent: editRow?.organicMatterPercent ?? "",
    wormCount: editRow?.wormCount != null ? String(editRow.wormCount) : "",
    vessScore: editRow?.vessScore != null ? String(editRow.vessScore) : "",
    infiltrationSeconds: editRow?.infiltrationSeconds != null ? String(editRow.infiltrationSeconds) : "",
    bulkDensityGCm3: editRow?.bulkDensityGCm3 ?? "",
    labName: editRow?.labName ?? "",
    notes: editRow?.notes ?? "",
  }));
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        testDate: f.testDate,
        fieldId: f.fieldId ? Number(f.fieldId) : null,
        fieldName: f.fieldName || (f.fieldId ? (fields.find((fd: any) => String(fd.id) === f.fieldId)?.name ?? null) : null),
        sampleDepthCm: f.sampleDepthCm ? Number(f.sampleDepthCm) : null,
        organicMatterPercent: f.organicMatterPercent || null,
        wormCount: f.wormCount ? Number(f.wormCount) : null,
        vessScore: f.vessScore ? Number(f.vessScore) : null,
        infiltrationSeconds: f.infiltrationSeconds ? Number(f.infiltrationSeconds) : null,
        bulkDensityGCm3: f.bulkDensityGCm3 || null,
        labName: f.labName || null,
        notes: f.notes || null,
      };
      return editRow
        ? api.put(`/farms/${farmId}/regen-soil-indicators/${editRow.id}`, payload)
        : api.post(`/farms/${farmId}/regen-soil-indicators`, payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["regen-soil-indicators", farmId] }); onClose(); },
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) { saveMut.reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editRow ? "Edit Soil Indicators" : "Record Soil Health Indicators"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Test date *</Label><Input type="date" value={f.testDate} onChange={e => set("testDate", e.target.value)} /></div>
          <div>
            <Label>Field</Label>
            <Select value={f.fieldId || "none"} onValueChange={v => set("fieldId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {fields.map((fd: any) => <SelectItem key={fd.id} value={String(fd.id)}>{fd.name ?? fd.fieldName ?? `Field ${fd.id}`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Field name (if not listed)</Label><Input value={f.fieldName} onChange={e => set("fieldName", e.target.value)} /></div>
          <div><Label>Sample depth (cm)</Label><Input type="number" min="0" value={f.sampleDepthCm} onChange={e => set("sampleDepthCm", e.target.value)} /></div>
          <div><Label>Soil organic matter (%)</Label><Input type="number" min="0" step="0.01" value={f.organicMatterPercent} onChange={e => set("organicMatterPercent", e.target.value)} /></div>
          <div><Label>Worm count (per pit)</Label><Input type="number" min="0" value={f.wormCount} onChange={e => set("wormCount", e.target.value)} /></div>
          <div><Label>VESS score (1 best – 5 worst)</Label><Input type="number" min="1" max="5" value={f.vessScore} onChange={e => set("vessScore", e.target.value)} /></div>
          <div><Label>Infiltration (seconds)</Label><Input type="number" min="0" value={f.infiltrationSeconds} onChange={e => set("infiltrationSeconds", e.target.value)} /></div>
          <div><Label>Bulk density (g/cm³)</Label><Input type="number" min="0" step="0.01" value={f.bulkDensityGCm3} onChange={e => set("bulkDensityGCm3", e.target.value)} /></div>
          <div><Label>Lab / method</Label><Input value={f.labName} onChange={e => set("labName", e.target.value)} placeholder="e.g. NRM, in-field spade test" /></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={f.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        <DialogMutationError mutation={saveMut} />
        <DialogFooter>
          <Button variant="outline" onClick={() => { saveMut.reset(); onClose(); }}>Cancel</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !f.testDate}>{saveMut.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegenerativePage() {
  const { farmId: rawFarmId } = useAppStore();
  const farmId = rawFarmId!;
  const qc = useQueryClient();
  const [tab, setTab] = usePersistedTab<RegenTab>({ page: "regenerative", farmId: rawFarmId, validIds: TAB_IDS, defaultTab: "practices" });

  const practicesQ = useQuery({
    queryKey: ["regen-practices", farmId],
    queryFn: () => api.get(`/farms/${farmId}/regen-practices`),
    enabled: !!farmId,
    select: (d: any) => (Array.isArray(d?.records) ? d.records : []),
  });
  const soilQ = useQuery({
    queryKey: ["regen-soil-indicators", farmId],
    queryFn: () => api.get(`/farms/${farmId}/regen-soil-indicators`),
    enabled: !!farmId,
    select: (d: any) => (Array.isArray(d?.records) ? d.records : []),
  });
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => api.get(`/farms/${farmId}/fields`),
    enabled: !!farmId,
    select: (d: any) => (Array.isArray(d?.records) ? d.records : Array.isArray(d) ? d : []),
    staleTime: 60_000,
  });

  const practices = practicesQ.data ?? [];
  const soil = soilQ.data ?? [];
  const fields = fieldsQ.data ?? [];

  const [pracDlg, setPracDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [soilDlg, setSoilDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [pendingDelPrac, setPendingDelPrac] = useState<number | null>(null);
  const [pendingDelSoil, setPendingDelSoil] = useState<number | null>(null);

  const delPracMut = useMutation({
    mutationFn: (id: number) => api.delete(`/farms/${farmId}/regen-practices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regen-practices", farmId] }),
  });
  const delSoilMut = useMutation({
    mutationFn: (id: number) => api.delete(`/farms/${farmId}/regen-soil-indicators/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regen-soil-indicators", farmId] }),
  });

  const years = useMemo(() => {
    const ys = new Set<number>();
    practices.forEach((r: any) => { const y = yearOf(r); if (y) ys.add(y); });
    soil.forEach((r: any) => { const y = r.testDate ? Number(String(r.testDate).slice(0, 4)) : null; if (y) ys.add(y); });
    if (ys.size === 0) ys.add(new Date().getFullYear());
    return Array.from(ys).sort((a, b) => b - a);
  }, [practices, soil]);
  const [summaryYear, setSummaryYear] = useState<number | null>(null);
  const selYear = summaryYear ?? years[0];

  const summary = useMemo(() => {
    const inYear = practices.filter((r: any) => yearOf(r) === selYear);
    return PRINCIPLES.map(p => {
      const rows = inYear.filter((r: any) => r.principle === p.value);
      return { ...p, count: rows.length, areaHa: rows.reduce((a: number, r: any) => a + num(r.areaHectares), 0) };
    });
  }, [practices, selYear]);

  const somTrend = useMemo(() => {
    const byYear = new Map<number, number[]>();
    soil.forEach((r: any) => {
      const om = num(r.organicMatterPercent);
      if (!om || !r.testDate) return;
      const y = Number(String(r.testDate).slice(0, 4));
      byYear.set(y, [...(byYear.get(y) ?? []), om]);
    });
    return Array.from(byYear.entries()).sort((a, b) => a[0] - b[0])
      .map(([y, vals]) => ({ year: y, avg: vals.reduce((a, b) => a + b, 0) / vals.length, n: vals.length }));
  }, [soil]);

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Sprout size={24} className="text-green-600" /> Regenerative Farming</h1>
            <p className="text-sm text-gray-500 mt-1">Practice records against the six regenerative principles, plus the outcome evidence buyers and verifiers ask for</p>
          </div>
          <div className="flex gap-2">
            {tab === "practices" && <Button onClick={() => setPracDlg({ open: true })} data-testid="button-add-practice"><Plus size={15} className="mr-1" />Record Practice</Button>}
            {tab === "soil" && <Button onClick={() => setSoilDlg({ open: true })} data-testid="button-add-soil"><Plus size={15} className="mr-1" />Record Indicators</Button>}
          </div>
        </div>

        <TabBar className="mb-4">
          <TabButton active={tab === "practices"} onClick={() => setTab("practices")}>Practices</TabButton>
          <TabButton active={tab === "soil"} onClick={() => setTab("soil")}>Soil Indicators</TabButton>
          <TabButton active={tab === "summary"} onClick={() => setTab("summary")}>Summary</TabButton>
        </TabBar>

        {tab === "practices" && (
          <div className="bg-white rounded-lg border overflow-x-auto">
            {practicesQ.isError ? <p className="p-4 text-sm text-red-600">Failed to load practice records — please refresh.</p> :
            practices.length === 0 ? <p className="p-6 text-sm text-gray-500">No practices recorded yet. Log each cover crop, no-till pass, grazing integration or input cut against one of the six principles — this builds the evidence pack verification schemes ask for.</p> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Date</th><th className="px-3 py-2">Year</th><th className="px-3 py-2">Field</th>
                    <th className="px-3 py-2">Principle</th><th className="px-3 py-2">Practice</th><th className="px-3 py-2">Area (ha)</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {practices.map((r: any) => (
                    <tr key={r.id} className="border-t" data-testid={`row-practice-${r.id}`}>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(r.recordDate)}</td>
                      <td className="px-3 py-2">{r.seasonYear ?? "—"}</td>
                      <td className="px-3 py-2">{r.fieldName || (r.fieldId ? fields.find((fd: any) => fd.id === r.fieldId)?.name : null) || "—"}</td>
                      <td className="px-3 py-2"><Badge className="bg-green-100 text-green-700">{principleLabel(r.principle)}</Badge></td>
                      <td className="px-3 py-2">{r.practice}</td>
                      <td className="px-3 py-2">{r.areaHectares ? num(r.areaHectares).toFixed(2) : "—"}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => setPracDlg({ open: true, row: r })}><Pencil size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setPendingDelPrac(r.id)}><Trash2 size={14} className="text-red-500" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "soil" && (
          <div className="bg-white rounded-lg border overflow-x-auto">
            {soilQ.isError ? <p className="p-4 text-sm text-red-600">Failed to load soil indicators — please refresh.</p> :
            soil.length === 0 ? <p className="p-6 text-sm text-gray-500">No soil indicators yet. Regenerative schemes are outcome-based — record organic matter %, worm counts, VESS scores and infiltration so you can show improvement over time.</p> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Date</th><th className="px-3 py-2">Field</th><th className="px-3 py-2">OM %</th>
                    <th className="px-3 py-2">Worms</th><th className="px-3 py-2">VESS</th><th className="px-3 py-2">Infiltration (s)</th>
                    <th className="px-3 py-2">Bulk density</th><th className="px-3 py-2">Lab</th><th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {soil.map((r: any) => (
                    <tr key={r.id} className="border-t" data-testid={`row-soil-${r.id}`}>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(r.testDate)}</td>
                      <td className="px-3 py-2">{r.fieldName || (r.fieldId ? fields.find((fd: any) => fd.id === r.fieldId)?.name : null) || "—"}</td>
                      <td className="px-3 py-2">{r.organicMatterPercent ? num(r.organicMatterPercent).toFixed(2) : "—"}</td>
                      <td className="px-3 py-2">{r.wormCount ?? "—"}</td>
                      <td className="px-3 py-2">{r.vessScore ?? "—"}</td>
                      <td className="px-3 py-2">{r.infiltrationSeconds ?? "—"}</td>
                      <td className="px-3 py-2">{r.bulkDensityGCm3 ? num(r.bulkDensityGCm3).toFixed(2) : "—"}</td>
                      <td className="px-3 py-2">{r.labName || "—"}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => setSoilDlg({ open: true, row: r })}><Pencil size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setPendingDelSoil(r.id)}><Trash2 size={14} className="text-red-500" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "summary" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Label className="text-sm">Season year:</Label>
              <Select value={String(selYear)} onValueChange={v => setSummaryYear(Number(v))}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {summary.map(p => (
                <div key={p.value} className={`rounded-lg border p-4 ${p.count > 0 ? "bg-green-50 border-green-200" : "bg-white"}`} data-testid={`card-principle-${p.value}`}>
                  <p className="font-semibold text-sm text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.hint}</p>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-2xl font-bold">{p.count}</span>
                    <span className="text-xs text-gray-500">record{p.count === 1 ? "" : "s"}{p.areaHa > 0 ? ` · ${p.areaHa.toFixed(1)} ha` : ""}</span>
                  </div>
                  {p.count === 0 && <p className="text-xs text-amber-600 mt-1">No evidence recorded for {selYear}</p>}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-2">Soil organic matter trend (farm average)</h3>
              {somTrend.length === 0 ? <p className="text-sm text-gray-500">No organic matter results recorded yet — the single most-asked-for regenerative outcome measure.</p> : (
                <table className="text-sm">
                  <thead className="text-left text-xs uppercase text-gray-500">
                    <tr><th className="pr-8 py-1">Year</th><th className="pr-8 py-1">Avg OM %</th><th className="py-1">Samples</th></tr>
                  </thead>
                  <tbody>
                    {somTrend.map(t => (
                      <tr key={t.year} className="border-t">
                        <td className="pr-8 py-1.5">{t.year}</td>
                        <td className="pr-8 py-1.5 font-medium">{t.avg.toFixed(2)}</td>
                        <td className="py-1.5">{t.n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {pracDlg.open && <PracticeDialog farmId={farmId} editRow={pracDlg.row} fields={fields} onClose={() => setPracDlg({ open: false })} />}
        {soilDlg.open && <SoilDialog farmId={farmId} editRow={soilDlg.row} fields={fields} onClose={() => setSoilDlg({ open: false })} />}

        <ConfirmDialog
          open={pendingDelPrac !== null}
          title="Delete practice record"
          message="Delete this regenerative practice record?"
          confirmLabel="Delete"
          confirmVariant="destructive"
          mutation={delPracMut}
          onConfirm={() => { if (pendingDelPrac !== null) delPracMut.mutate(pendingDelPrac, { onSuccess: () => setPendingDelPrac(null) }); }}
          onCancel={() => { setPendingDelPrac(null); delPracMut.reset(); }}
        />
        <ConfirmDialog
          open={pendingDelSoil !== null}
          title="Delete soil indicator record"
          message="Delete this soil indicator record?"
          confirmLabel="Delete"
          confirmVariant="destructive"
          mutation={delSoilMut}
          onConfirm={() => { if (pendingDelSoil !== null) delSoilMut.mutate(pendingDelSoil, { onSuccess: () => setPendingDelSoil(null) }); }}
          onCancel={() => { setPendingDelSoil(null); delSoilMut.reset(); }}
        />
      </div>
    </AppLayout>
  );
}
