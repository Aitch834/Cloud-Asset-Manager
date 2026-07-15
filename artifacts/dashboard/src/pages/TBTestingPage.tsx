import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, Clock, Plus, Printer, TestTube } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Uses tbTestsTable from compliance-gaps.ts via /farms/:farmId/tb-tests
type TBTest = {
  id: number;
  herdId: number | null;
  herdFlockRef: string | null;
  testDate: string;
  readingDate: string | null;
  testType: string;
  species: string;
  animalsTested: number | null;
  reactors: number;
  inconclusives: number;
  outcome: string;
  testingVet: string | null;
  aphaOfficer: string | null;
  aphaCaseRef: string | null;
  movementRestriction: boolean;
  restrictionLiftedDate: string | null;
  nextTestDueDate: string | null;
  notes: string | null;
  createdAt: string;
};

type Herd = { id: number; herdName: string };

const EMPTY: Partial<TBTest> = {
  testDate: new Date().toISOString().slice(0, 10),
  testType: "routine_skin",
  species: "cattle",
  outcome: "pending",
  reactors: 0,
  inconclusives: 0,
  movementRestriction: false,
};

const OUTCOME_BADGE: Record<string, { label: string; className: string }> = {
  pending:      { label: "Pending",      className: "bg-yellow-100 text-yellow-800" },
  clear:        { label: "Clear",        className: "bg-green-100 text-green-800" },
  reactor:      { label: "Reactor",      className: "bg-red-100 text-red-800" },
  inconclusive: { label: "Inconclusive", className: "bg-orange-100 text-orange-800" },
  withdrawn:    { label: "Withdrawn",    className: "bg-gray-100 text-gray-700" },
};

export default function TBTestingPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<"records" | "restrictions" | "analytics">("records");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TBTest | null>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const testsQ = useQuery<TBTest[]>({
    queryKey: ["farms", farmId, "tb-tests"],
    queryFn: () => api.get(`/farms/${farmId}/tb-tests`).then(r => r.records ?? []),
    enabled: !!farmId,
  });

  const herdsQ = useQuery<Herd[]>({
    queryKey: ["farms", farmId, "herds"],
    queryFn: () => api.get(`/farms/${farmId}/herds`).then(r => r.herds ?? []),
    enabled: !!farmId,
  });

  const saveMut = useMutation({
    mutationFn: (body: any) =>
      editing
        ? api.put(`/farms/${farmId}/tb-tests/${editing.id}`, body)
        : api.post(`/farms/${farmId}/tb-tests`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "tb-tests"] });
      toast({ title: editing ? "TB test updated" : "TB test saved" });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const tests = testsQ.data ?? [];
  const herds = herdsQ.data ?? [];

  const filtered = tests.filter(t =>
    !search ||
    (t.testingVet ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (t.aphaCaseRef ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (t.herdFlockRef ?? "").toLowerCase().includes(search.toLowerCase()) ||
    t.testDate.includes(search)
  );

  const restricted = tests.filter(t => t.movementRestriction && !t.restrictionLiftedDate);
  const totalReactors = tests.reduce((s, t) => s + (t.reactors ?? 0), 0);
  const lastTest = [...tests].sort((a, b) => b.testDate.localeCompare(a.testDate))[0];

  const analyticsData = ["clear", "reactor", "inconclusive", "pending", "withdrawn"].map(r => ({
    result: OUTCOME_BADGE[r]?.label ?? r,
    count: tests.filter(t => t.outcome === r).length,
  })).filter(d => d.count > 0);

  const COLOURS: Record<string, string> = { Clear: "#22c55e", Reactor: "#ef4444", Inconclusive: "#f97316", Pending: "#eab308", Withdrawn: "#9ca3af" };

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); };
  const openEdit = (t: TBTest) => { setEditing(t); setForm({ ...t }); setOpen(true); };
  const f = (field: string, val: any) => setForm((p: any) => ({ ...p, [field]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMut.mutate({
      ...form,
      reactors: Number(form.reactors ?? 0),
      inconclusives: Number(form.inconclusives ?? 0),
      animalsTested: form.animalsTested ? Number(form.animalsTested) : null,
      movementRestriction: Boolean(form.movementRestriction),
    });
  };

  return (
    <AppLayout title="TB Testing Register">
      <div className="mb-4 flex gap-2">
        {(["records", "restrictions", "analytics"] as const).map(t => (
          <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
            {t === "records" ? "Test Records" : t === "restrictions" ? `Restrictions${restricted.length ? ` (${restricted.length})` : ""}` : "Analytics"}
          </Button>
        ))}
      </div>

      {tab === "records" && (
        <>
          <div className="flex items-center justify-between mb-4 gap-3">
            <Input placeholder="Search by vet, APHA ref, herd, date…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add TB Test</Button>
          </div>
          {testsQ.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TestTube className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No TB test records found. Add your first test.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(t => {
                const ob = OUTCOME_BADGE[t.outcome] ?? OUTCOME_BADGE.pending;
                return (
                  <div key={t.id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => openEdit(t)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">{t.testDate}</span>
                        <Badge className="text-xs bg-blue-100 text-blue-800 capitalize">{t.species}</Badge>
                        <span className="text-xs text-muted-foreground capitalize">{t.testType.replace(/_/g, " ")}</span>
                        <Badge className={`text-xs ${ob.className}`}>{ob.label}</Badge>
                        {t.movementRestriction && <Badge className="text-xs bg-red-100 text-red-800">Restricted</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground space-x-3">
                        {t.herdFlockRef && <span>Herd/Flock: {t.herdFlockRef}</span>}
                        {t.testingVet && <span>Vet: {t.testingVet}</span>}
                        {t.aphaCaseRef && <span>APHA: {t.aphaCaseRef}</span>}
                        {t.animalsTested != null && <span>Tested: {t.animalsTested}</span>}
                        {t.reactors > 0 && <span className="text-red-600 font-medium">Reactors: {t.reactors}</span>}
                        {t.inconclusives > 0 && <span className="text-orange-600">Inconclusive: {t.inconclusives}</span>}
                        {t.nextTestDueDate && <span className="text-blue-700">Next: {t.nextTestDueDate}</span>}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); window.print(); }}><Printer className="w-4 h-4" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "restrictions" && (
        <div>
          {restricted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="mx-auto mb-2 w-10 h-10 text-green-400" />
              <p className="font-medium text-green-700">No active movement restrictions.</p>
            </div>
          ) : restricted.map(t => (
            <div key={t.id} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-800">Movement Restriction Active — {t.species}</span>
              </div>
              <div className="text-sm text-red-700 space-y-1">
                <p>Test date: <strong>{t.testDate}</strong></p>
                {t.aphaCaseRef && <p>APHA case ref: <strong>{t.aphaCaseRef}</strong></p>}
                {t.herdFlockRef && <p>Herd/Flock: <strong>{t.herdFlockRef}</strong></p>}
                <p>Reactors: <strong>{t.reactors}</strong> · Inconclusive: <strong>{t.inconclusives}</strong></p>
                {t.testingVet && <p>Vet: {t.testingVet}</p>}
                {t.notes && <p>Notes: {t.notes}</p>}
              </div>
              <Button size="sm" className="mt-3" onClick={() => openEdit(t)}>Update Record</Button>
            </div>
          ))}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{tests.length}</div>
              <div className="text-xs text-muted-foreground">Total Tests</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${totalReactors > 0 ? "text-red-600" : "text-green-600"}`}>{totalReactors}</div>
              <div className="text-xs text-muted-foreground">Total Reactors</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{restricted.length}</div>
              <div className="text-xs text-muted-foreground">Active Restrictions</div>
            </div>
            {lastTest && (
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-sm font-medium">{lastTest.testDate}</div>
                <div className="text-xs text-muted-foreground">Last Test</div>
                {lastTest.nextTestDueDate && (
                  <div className="flex items-center gap-1 text-blue-700 text-xs mt-1 justify-center">
                    <Clock className="w-3 h-3" />Next: {lastTest.nextTestDueDate}
                  </div>
                )}
              </div>
            )}
          </div>
          {analyticsData.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm font-medium mb-3">Outcomes Breakdown</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={analyticsData}>
                  <XAxis dataKey="result" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analyticsData.map((d, i) => <Cell key={i} fill={COLOURS[d.result] ?? "#3b82f6"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm(EMPTY); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit TB Test Record" : "Add TB Test Record"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Test Date *</Label>
                <Input type="date" value={form.testDate ?? ""} onChange={e => f("testDate", e.target.value)} required />
              </div>
              <div>
                <Label>Reading Date (72-hour skin)</Label>
                <Input type="date" value={form.readingDate ?? ""} onChange={e => f("readingDate", e.target.value)} />
              </div>
              <div>
                <Label>Test Type</Label>
                <Select value={form.testType ?? "routine_skin"} onValueChange={v => f("testType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine_skin">Routine Skin Test</SelectItem>
                    <SelectItem value="pre_movement">Pre-Movement</SelectItem>
                    <SelectItem value="post_movement">Post-Movement</SelectItem>
                    <SelectItem value="gamma_ifn">Gamma Interferon (Blood)</SelectItem>
                    <SelectItem value="check_test">Check Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Species</Label>
                <Select value={form.species ?? "cattle"} onValueChange={v => f("species", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="goat">Goat</SelectItem>
                    <SelectItem value="deer">Deer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Outcome *</Label>
                <Select value={form.outcome ?? "pending"} onValueChange={v => f("outcome", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="clear">Clear</SelectItem>
                    <SelectItem value="reactor">Reactor Found</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Herd / Flock Reference</Label>
                <Input value={form.herdFlockRef ?? ""} onChange={e => f("herdFlockRef", e.target.value)} placeholder="e.g. herd number / flock mark" />
              </div>
              <div>
                <Label>Testing Vet / OV</Label>
                <Input value={form.testingVet ?? ""} onChange={e => f("testingVet", e.target.value)} />
              </div>
              <div>
                <Label>APHA Officer</Label>
                <Input value={form.aphaOfficer ?? ""} onChange={e => f("aphaOfficer", e.target.value)} />
              </div>
              <div>
                <Label>APHA Case Reference</Label>
                <Input value={form.aphaCaseRef ?? ""} onChange={e => f("aphaCaseRef", e.target.value)} placeholder="e.g. TB-2025-XXXX" />
              </div>
              <div>
                <Label>Animals Tested</Label>
                <Input type="number" min="0" value={form.animalsTested ?? ""} onChange={e => f("animalsTested", e.target.value)} />
              </div>
              <div>
                <Label>Reactors Found</Label>
                <Input type="number" min="0" value={form.reactors ?? 0} onChange={e => f("reactors", e.target.value)} />
              </div>
              <div>
                <Label>Inconclusive Results</Label>
                <Input type="number" min="0" value={form.inconclusives ?? 0} onChange={e => f("inconclusives", e.target.value)} />
              </div>
              <div>
                <Label>Next Test Due Date</Label>
                <Input type="date" value={form.nextTestDueDate ?? ""} onChange={e => f("nextTestDueDate", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="movRes" checked={Boolean(form.movementRestriction)} onChange={e => f("movementRestriction", e.target.checked)} />
              <Label htmlFor="movRes">Movement restriction imposed</Label>
            </div>
            {form.movementRestriction && (
              <div>
                <Label>Restriction Lifted Date</Label>
                <Input type="date" value={form.restrictionLiftedDate ?? ""} onChange={e => f("restrictionLiftedDate", e.target.value)} />
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={e => f("notes", e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending}>{saveMut.isPending ? "Saving…" : "Save Record"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
