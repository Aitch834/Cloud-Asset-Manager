import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import {
  Plus, Search, Loader2, Pencil, Trash2, ChevronDown, ChevronUp,
  TestTube, Printer, FlaskConical,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

type TabKey = "tests" | "print";

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}
function formatDateLong(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return val; }
}

interface FieldRecord { id: number; name: string; fieldReference: string | null; }
interface SoilTestResult { id: number; soilTestId: number; nutrient: string; value: string | null; unit: string | null; index: string | null; status: string | null; }
interface SoilTestRecord {
  id: number; farmId: number; fieldId: number; sampleDate: string;
  laboratory: string | null; sampleReference: string | null; sampleDepthCm: number | null; notes: string | null; createdAt: string;
  results?: SoilTestResult[];
}
interface Farm { id: number; name: string; address: string | null; postcode: string | null; cphNumber: string | null; redTractorId: string | null; }

const COMMON_NUTRIENTS = ["pH", "Phosphorus (P)", "Potassium (K)", "Magnesium (Mg)", "Nitrogen (N)", "Sulphur (SO3)", "Organic Matter (OM)", "Calcium (Ca)", "Sodium (Na)", "Boron (B)"];
const EMPTY_TEST = { fieldId: "", sampleDate: new Date().toISOString().slice(0, 10), laboratory: "", sampleReference: "", sampleDepthCm: "", notes: "" };
const EMPTY_RESULT = { nutrient: "", value: "", unit: "mg/l", index: "", status: "" };

function statusBadge(status: string | null) {
  if (!status) return null;
  const s = status.toLowerCase();
  const cls = s === "low" ? "bg-red-100 text-red-700 border-red-200"
    : s === "high" ? "bg-blue-100 text-blue-700 border-blue-200"
    : s === "adequate" || s === "optimal" ? "bg-green-100 text-green-700 border-green-200"
    : "bg-gray-100 text-gray-600 border-gray-200";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{status}</span>;
}

function TestsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [editTest, setEditTest] = useState<SoilTestRecord | null>(null);
  const [deleteTestId, setDeleteTestId] = useState<number | null>(null);
  const [testForm, setTestForm] = useState<typeof EMPTY_TEST>(EMPTY_TEST);
  const [addResultFor, setAddResultFor] = useState<number | null>(null);
  const [resultForm, setResultForm] = useState<typeof EMPTY_RESULT>(EMPTY_RESULT);
  const [deleteResultInfo, setDeleteResultInfo] = useState<{ testId: number; resultId: number } | null>(null);

  const fieldsQ = useQuery<{ records: FieldRecord[] }>({
    queryKey: ["fields-soil", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
  });
  const testsQ = useQuery<{ records: SoilTestRecord[] }>({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`).then(r => r.json()),
  });

  const fields: FieldRecord[] = fieldsQ.data?.records ?? [];
  const allTests: SoilTestRecord[] = testsQ.data?.records ?? [];

  // useQueries is designed for dynamic lists — no hooks-in-map violation
  const expandedIds = Array.from(expanded);
  const detailResults = useQueries({
    queries: expandedIds.map(testId => ({
      queryKey: ["soil-test-detail", farmId, testId],
      queryFn: (): Promise<{ record: SoilTestRecord & { results: SoilTestResult[] } }> =>
        fetch(`/api/farms/${farmId}/soil-tests/${testId}`).then(r => r.json()),
      enabled: true,
    })),
  });

  const detailMap: Record<number, SoilTestRecord & { results: SoilTestResult[] }> = {};
  expandedIds.forEach((testId, i) => {
    const d = detailResults[i]?.data?.record;
    if (d) detailMap[testId] = d;
  });
  const detailLoadingMap: Record<number, boolean> = {};
  expandedIds.forEach((testId, i) => {
    detailLoadingMap[testId] = detailResults[i]?.isLoading ?? false;
  });

  const createTest = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/soil-tests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
      setAddTestOpen(false); setEditTest(null); setTestForm(EMPTY_TEST);
      if (data?.record?.id) setExpanded(prev => new Set([...prev, data.record.id]));
    },
  });
  const updateTest = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/soil-tests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["soil-tests", farmId] }); setEditTest(null); setTestForm(EMPTY_TEST); setAddTestOpen(false); },
  });
  const deleteTest = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/soil-tests/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
      setDeleteTestId(null);
      setExpanded(prev => { const next = new Set(prev); next.delete(id); return next; });
    },
  });
  const addResult = useMutation({
    mutationFn: ({ testId, body }: { testId: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/soil-tests/${testId}/results`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["soil-test-detail", farmId, vars.testId] }); setAddResultFor(null); setResultForm(EMPTY_RESULT); },
  });
  const deleteResult = useMutation({
    mutationFn: ({ testId, resultId }: { testId: number; resultId: number }) =>
      fetch(`/api/farms/${farmId}/soil-tests/${testId}/results/${resultId}`, { method: "DELETE" }),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["soil-test-detail", farmId, vars.testId] }); setDeleteResultInfo(null); },
  });

  const filtered = allTests.filter(t => {
    if (!search) return true;
    const fieldName = fields.find(f => f.id === t.fieldId)?.name ?? "";
    return fieldName.toLowerCase().includes(search.toLowerCase())
      || t.laboratory?.toLowerCase().includes(search.toLowerCase())
      || t.sampleReference?.toLowerCase().includes(search.toLowerCase());
  });

  function openAddTest() { setEditTest(null); setTestForm(EMPTY_TEST); setAddTestOpen(true); }
  function openEditTest(t: SoilTestRecord) {
    setEditTest(t);
    setTestForm({ fieldId: String(t.fieldId), sampleDate: t.sampleDate?.slice(0, 10) ?? "", laboratory: t.laboratory ?? "", sampleReference: t.sampleReference ?? "", sampleDepthCm: String(t.sampleDepthCm ?? ""), notes: t.notes ?? "" });
    setAddTestOpen(true);
  }
  function handleTestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...testForm, fieldId: Number(testForm.fieldId), sampleDate: new Date(testForm.sampleDate).toISOString(), sampleDepthCm: testForm.sampleDepthCm ? Number(testForm.sampleDepthCm) : null };
    if (editTest) { updateTest.mutate({ id: editTest.id, body }); }
    else { createTest.mutate(body); }
  }
  function handleResultSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addResultFor) return;
    const body = { ...resultForm, value: resultForm.value || null, index: resultForm.index || null, status: resultForm.status || null };
    addResult.mutate({ testId: addResultFor, body });
  }
  function toggleExpand(id: number) {
    setExpanded(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search by field, lab or reference..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAddTest} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Soil Test
        </Button>
      </div>

      {testsQ.isLoading ? (
        <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <TestTube className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/80 mb-1">No soil tests recorded</h3>
            <p className="text-foreground/50 text-sm">{search ? "No tests match your search." : "Add your first soil test to start tracking field nutrient levels."}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(test => {
            const fieldName = fields.find(f => f.id === test.fieldId)?.name ?? `Field #${test.fieldId}`;
            const isExp = expanded.has(test.id);
            const detail = detailMap[test.id];
            const detailLoading = detailLoadingMap[test.id] ?? false;
            return (
              <Card key={test.id} className="overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{fieldName}</span>
                        {test.sampleReference && <span className="text-xs font-mono bg-black/5 px-1.5 py-0.5 rounded">{test.sampleReference}</span>}
                      </div>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {formatDate(test.sampleDate)}
                        {test.laboratory && <> · {test.laboratory}</>}
                        {test.sampleDepthCm && <> · {test.sampleDepthCm}cm depth</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditTest(test)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTestId(test.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => toggleExpand(test.id)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-foreground">
                      {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="border-t border-border/50 px-5 py-4 bg-muted/20">
                    {detailLoading && !detail ? (
                      <div className="text-center py-4 text-foreground/40 text-sm"><Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />Loading results...</div>
                    ) : (
                      <>
                        {detail?.results && detail.results.length > 0 ? (
                          <div className="overflow-x-auto mb-4">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Nutrient</th>
                                  <th className="text-right py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Value</th>
                                  <th className="text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Unit</th>
                                  <th className="text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Index</th>
                                  <th className="text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Status</th>
                                  <th className="text-right py-2"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {detail.results.map(r => (
                                  <tr key={r.id} className="border-b border-border/30 hover:bg-black/[0.02]">
                                    <td className="py-2 pr-4 font-medium text-foreground">{r.nutrient}</td>
                                    <td className="py-2 pr-4 text-right font-mono font-semibold text-foreground/80">{r.value ?? "—"}</td>
                                    <td className="py-2 pr-4 text-foreground/60">{r.unit ?? "—"}</td>
                                    <td className="py-2 pr-4 font-mono text-foreground/70">{r.index ?? "—"}</td>
                                    <td className="py-2 pr-4">{statusBadge(r.status)}</td>
                                    <td className="py-2 text-right">
                                      <button onClick={() => setDeleteResultInfo({ testId: test.id, resultId: r.id })} className="p-1 rounded hover:bg-red-50 text-foreground/30 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground/40 italic mb-4">No nutrient results recorded for this test yet.</p>
                        )}

                        {addResultFor === test.id ? (
                          <form onSubmit={handleResultSubmit} className="border border-border/50 rounded-xl p-4 bg-white space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">Add Nutrient Result</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">Nutrient <span className="text-red-500">*</span></label>
                                <div className="flex gap-1.5">
                                  <select
                                    className="flex-1 h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                                    value={COMMON_NUTRIENTS.includes(resultForm.nutrient) ? resultForm.nutrient : ""}
                                    onChange={e => e.target.value && setResultForm(f => ({ ...f, nutrient: e.target.value }))}
                                  >
                                    <option value="">Select...</option>
                                    {COMMON_NUTRIENTS.map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                  <Input
                                    className="h-8 text-xs w-32"
                                    placeholder="or type..."
                                    value={!COMMON_NUTRIENTS.includes(resultForm.nutrient) ? resultForm.nutrient : ""}
                                    onChange={e => setResultForm(f => ({ ...f, nutrient: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">Value</label>
                                <Input className="h-8 text-xs" type="number" step="0.01" placeholder="e.g. 6.5" value={resultForm.value} onChange={e => setResultForm(f => ({ ...f, value: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">Unit</label>
                                <select className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs" value={resultForm.unit} onChange={e => setResultForm(f => ({ ...f, unit: e.target.value }))}>
                                  {["mg/l", "kg/ha", "%", "meq/100g", "ppm", "—"].map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">AHDB Index</label>
                                <select className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs" value={resultForm.index} onChange={e => setResultForm(f => ({ ...f, index: e.target.value }))}>
                                  <option value="">—</option>
                                  {["0", "0-", "1", "2-", "2+", "3", "4"].map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">Status</label>
                                <select className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs" value={resultForm.status} onChange={e => setResultForm(f => ({ ...f, status: e.target.value }))}>
                                  <option value="">—</option>
                                  {["Low", "Adequate", "Optimal", "High", "Excessive"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1 justify-end">
                              <Button type="button" size="sm" variant="outline" onClick={() => { setAddResultFor(null); setResultForm(EMPTY_RESULT); }}>Cancel</Button>
                              <Button type="submit" size="sm" disabled={!resultForm.nutrient || addResult.isPending}>
                                {addResult.isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />} Add Result
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setAddResultFor(test.id); setResultForm(EMPTY_RESULT); }}>
                            <Plus className="w-3.5 h-3.5" /> Add Nutrient Result
                          </Button>
                        )}

                        {test.notes && (
                          <p className="text-xs text-foreground/50 italic mt-3 border-t border-border/30 pt-3">Notes: {test.notes}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit test dialog */}
      <Dialog open={addTestOpen} onOpenChange={(o) => { if (!o) { setAddTestOpen(false); setEditTest(null); setTestForm(EMPTY_TEST); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-600" />
              {editTest ? "Edit Soil Test" : "Add Soil Test"}
            </DialogTitle>
            <DialogDescription>
              {editTest ? "Update the test header details." : "Record a new soil test. After saving you can add individual nutrient results."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTestSubmit} className="space-y-4 pt-1">
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Field <span className="text-red-500">*</span></label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={testForm.fieldId} onChange={e => setTestForm(f => ({ ...f, fieldId: e.target.value }))} required>
                <option value="">Select field...</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Sample Date <span className="text-red-500">*</span></label>
                <Input type="date" value={testForm.sampleDate} onChange={e => setTestForm(f => ({ ...f, sampleDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Depth (cm)</label>
                <Input type="number" min="0" max="200" placeholder="e.g. 15" value={testForm.sampleDepthCm} onChange={e => setTestForm(f => ({ ...f, sampleDepthCm: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Laboratory</label>
                <Input placeholder="e.g. ADAS, NRM" value={testForm.laboratory} onChange={e => setTestForm(f => ({ ...f, laboratory: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Sample Reference</label>
                <Input placeholder="e.g. ST/2024/001" value={testForm.sampleReference} onChange={e => setTestForm(f => ({ ...f, sampleReference: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
              <Input placeholder="Any additional notes" value={testForm.notes} onChange={e => setTestForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setAddTestOpen(false); setEditTest(null); setTestForm(EMPTY_TEST); }}>Cancel</Button>
              <Button type="submit" disabled={createTest.isPending || updateTest.isPending}>
                {(createTest.isPending || updateTest.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editTest ? "Update Test" : "Save & Add Results"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete test confirmation */}
      <Dialog open={deleteTestId !== null} onOpenChange={() => setDeleteTestId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Soil Test</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">This will permanently delete the test and all its nutrient results. Cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTestId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTestId && deleteTest.mutate(deleteTestId)} disabled={deleteTest.isPending}>
              {deleteTest.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete result confirmation */}
      <Dialog open={deleteResultInfo !== null} onOpenChange={() => setDeleteResultInfo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove Nutrient Result</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Remove this nutrient reading from the test record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteResultInfo(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteResultInfo && deleteResult.mutate(deleteResultInfo)} disabled={deleteResult.isPending}>
              {deleteResult.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PrintTab({ farmId }: { farmId: number }) {
  const [printYear, setPrintYear] = useState<number | "all">("all");

  const fieldsQ = useQuery<{ records: FieldRecord[] }>({ queryKey: ["fields-soil", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()) });
  const testsQ = useQuery<{ records: SoilTestRecord[] }>({ queryKey: ["soil-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`).then(r => r.json()) });
  const farmQ = useQuery<{ record: Farm }>({ queryKey: ["farm", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()) });

  const fields: FieldRecord[] = fieldsQ.data?.records ?? [];
  const allTests: SoilTestRecord[] = testsQ.data?.records ?? [];
  const farm = farmQ.data?.record;
  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const years = [...new Set(allTests.map(t => new Date(t.sampleDate).getFullYear()))].sort((a, b) => b - a);

  // Fetch details for all tests using useQueries (no hooks-in-map)
  const testDetailResults = useQueries({
    queries: allTests.map(test => ({
      queryKey: ["soil-test-detail", farmId, test.id],
      queryFn: (): Promise<{ record: SoilTestRecord & { results: SoilTestResult[] } }> =>
        fetch(`/api/farms/${farmId}/soil-tests/${test.id}`).then(r => r.json()),
    })),
  });

  const testsWithResults = allTests.map((test, i) => ({
    ...test,
    results: testDetailResults[i]?.data?.record?.results ?? [],
  }));

  const filteredTests = printYear === "all"
    ? testsWithResults
    : testsWithResults.filter(t => new Date(t.sampleDate).getFullYear() === printYear);

  return (
    <div>
      <style>{`@media print { .no-print { display: none !important; } body { font-size: 11px; } }`}</style>
      <div className="no-print flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground/70">Filter by year:</label>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={String(printYear)} onChange={e => setPrintYear(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">All years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" /> Print / Export PDF
        </Button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #16a34a", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>{farm?.name ?? "Farm"}</p>
            {farm?.address && <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 0" }}>{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
            {farm?.cphNumber && <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "1px 0 0" }}>CPH: {farm.cphNumber}</p>}
          </div>
          <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#6b7280" }}>
            <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111", margin: 0 }}>Soil Test Register</p>
            {printYear !== "all" && <p style={{ margin: "2px 0 0" }}>Year: {printYear}</p>}
            <p style={{ margin: "2px 0 0" }}>Printed: {printedDate}</p>
          </div>
        </div>

        {filteredTests.length === 0 ? (
          <p style={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", padding: "2rem 0" }}>No soil tests to display.</p>
        ) : filteredTests.map(test => {
          const fieldName = fields.find(f => f.id === test.fieldId)?.name ?? `Field #${test.fieldId}`;
          return (
            <div key={test.id} style={{ marginBottom: "1.5rem", pageBreakInside: "avoid" }}>
              <div style={{ background: "#f0fdf4", borderLeft: "4px solid #16a34a", padding: "0.5rem 0.75rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{fieldName}</span>
                  {test.sampleReference && <span style={{ fontFamily: "monospace", fontSize: "0.75rem", marginLeft: "0.5rem", color: "#6b7280" }}>{test.sampleReference}</span>}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", textAlign: "right" }}>
                  <span>{formatDateLong(test.sampleDate)}</span>
                  {test.laboratory && <span> · {test.laboratory}</span>}
                  {test.sampleDepthCm && <span> · {test.sampleDepthCm}cm</span>}
                </div>
              </div>
              {test.results && test.results.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Nutrient", "Value", "Unit", "Index", "Status"].map(h => (
                        <th key={h} style={{ border: "1px solid #e5e7eb", padding: "4px 8px", textAlign: "left", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", fontSize: "0.65rem" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {test.results.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                        <td style={{ border: "1px solid #e5e7eb", padding: "4px 8px", fontWeight: 600 }}>{r.nutrient}</td>
                        <td style={{ border: "1px solid #e5e7eb", padding: "4px 8px", fontFamily: "monospace" }}>{r.value ?? "—"}</td>
                        <td style={{ border: "1px solid #e5e7eb", padding: "4px 8px" }}>{r.unit ?? "—"}</td>
                        <td style={{ border: "1px solid #e5e7eb", padding: "4px 8px", fontFamily: "monospace" }}>{r.index ?? "—"}</td>
                        <td style={{ border: "1px solid #e5e7eb", padding: "4px 8px" }}>{r.status ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "0.75rem", padding: "0.25rem 0" }}>No nutrient results recorded.</p>
              )}
              {test.notes && <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem", fontStyle: "italic" }}>Notes: {test.notes}</p>}
            </div>
          );
        })}

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "1.5rem", display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#9ca3af" }}>
          <span style={{ fontStyle: "italic" }}>Soil test records for Red Tractor compliance. Retain for 3 years and make available at audit.</span>
          <span>BDE Farm Trac · {printedDate}</span>
        </div>
      </div>
    </div>
  );
}

export default function SoilTestsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<TabKey>("tests");
  if (!farmId) return <Redirect href="/select" />;
  return (
    <AppLayout title="Soil Tests">
      <TabBar className="mb-6">
        <TabButton active={tab === "tests"} onClick={() => setTab("tests")}>Test Records</TabButton>
        <TabButton active={tab === "print"} onClick={() => setTab("print")}>Print / Export</TabButton>
      </TabBar>
      {tab === "tests" && <TestsTab farmId={farmId} />}
      {tab === "print" && <PrintTab farmId={farmId} />}
    </AppLayout>
  );
}
