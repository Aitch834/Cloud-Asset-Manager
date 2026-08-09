import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
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
import { AlertTriangle, BarChart3, CheckCircle2, FlaskConical, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type NCPTest = {
  id: number;
  flockId: number | null;
  flockRef: string | null;
  houseOrLocation: string | null;
  testDate: string;
  sampleType: string;
  samplingMethod: string | null;
  laboratoryName: string | null;
  sampleRef: string | null;
  result: string;
  serotypeIsolated: string | null;
  notificationSentToApha: boolean;
  movementRestrictions: boolean;
  actionsTaken: string | null;
  nextTestDueDate: string | null;
  notes: string | null;
};

type Flock = { id: number; flockName: string };

const EMPTY: Partial<NCPTest> = {
  testDate: new Date().toISOString().slice(0, 10),
  sampleType: "boot_swab",
  samplingMethod: "self_sampled",
  result: "pending",
  notificationSentToApha: false,
  movementRestrictions: false,
};

const RESULT_BADGE: Record<string, { label: string; className: string }> = {
  pending:      { label: "Pending",      className: "bg-yellow-100 text-yellow-800" },
  negative:     { label: "Negative",     className: "bg-green-100 text-green-800" },
  positive:     { label: "POSITIVE",     className: "bg-red-100 text-red-800 font-bold" },
  inconclusive: { label: "Inconclusive", className: "bg-orange-100 text-orange-800" },
};

const PIE_COLOURS: Record<string, string> = {
  Negative: "#22c55e", Pending: "#eab308", Positive: "#ef4444", Inconclusive: "#f97316",
};

export default function PoultryNCPPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = usePersistedTab<"records" | "analytics">({ page: "poultry-ncp", farmId, validIds: ["records", "analytics"], defaultTab: "records" });
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = usePersistedFilter({ page: "poultry-ncp", filter: "result", farmId, defaultValue: "all" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NCPTest | null>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const testsQ = useQuery<NCPTest[]>({
    queryKey: ["farms", farmId, "poultry-ncp-tests"],
    queryFn: () => api.get(`/farms/${farmId}/poultry-ncp-tests`).then(r => r.tests ?? []),
    enabled: !!farmId,
  });

  const flocksQ = useQuery<Flock[]>({
    queryKey: ["farms", farmId, "poultry-flocks"],
    queryFn: () => api.get(`/farms/${farmId}/poultry-flocks`).then(r => r.flocks ?? []),
    enabled: !!farmId,
  });

  const saveMut = useMutation({
    mutationFn: (body: any) =>
      editing
        ? api.put(`/farms/${farmId}/poultry-ncp-tests/${editing.id}`, body)
        : api.post(`/farms/${farmId}/poultry-ncp-tests`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "poultry-ncp-tests"] });
      toast({ title: editing ? "NCP test updated" : "NCP test saved" });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const tests = testsQ.data ?? [];
  const flocks = flocksQ.data ?? [];

  const filtered = tests
    .filter(t => resultFilter === "all" || t.result === resultFilter)
    .filter(t => !search || (t.flockRef ?? "").toLowerCase().includes(search.toLowerCase()) || (t.sampleRef ?? "").toLowerCase().includes(search.toLowerCase()) || t.testDate.includes(search));

  const positives = tests.filter(t => t.result === "positive");
  const pending = tests.filter(t => t.result === "pending");

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); };
  const openEdit = (t: NCPTest) => { setEditing(t); setForm({ ...t }); setOpen(true); };
  const f = (field: string, val: any) => setForm((p: any) => ({ ...p, [field]: val }));

  const resultDistrib = ["negative", "positive", "inconclusive", "pending"].map(r => ({
    name: r.charAt(0).toUpperCase() + r.slice(1),
    value: tests.filter(t => t.result === r).length,
  })).filter(d => d.value > 0);

  const monthlyTests = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return {
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      tests: tests.filter(t => t.testDate.slice(5, 7) === m).length,
      positives: tests.filter(t => t.testDate.slice(5, 7) === m && t.result === "positive").length,
    };
  });

  const positiveRate = tests.filter(t => t.result !== "pending").length > 0
    ? ((positives.length / tests.filter(t => t.result !== "pending").length) * 100).toFixed(1)
    : "0.0";

  return (
    <AppLayout title="Poultry NCP Salmonella Testing">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>NCP (National Control Programme)</strong> — Mandatory Salmonella surveillance required under EU/UK Regulation (EC) No 2160/2003. Positive <em>S. Enteritidis</em> or <em>S. Typhimurium</em> results must be notified to APHA.
      </div>

      {positives.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 font-semibold text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            {positives.length} Positive Result{positives.length > 1 ? "s" : ""} — APHA Notification Required
          </div>
          {positives.filter(t => !t.notificationSentToApha).map(t => (
            <div key={t.id} className="text-xs text-red-700">
              {t.testDate} — {t.serotypeIsolated ?? "Serotype TBC"} — {t.notificationSentToApha ? "APHA notified" : "⚠️ APHA NOT yet notified"}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2">
          <Button size="sm" variant={tab === "records" ? "default" : "outline"} onClick={() => setTab("records")}>Records</Button>
          <Button size="sm" variant={tab === "analytics" ? "default" : "outline"} onClick={() => setTab("analytics")}>
            <BarChart3 className="w-3.5 h-3.5 mr-1" />Analytics
          </Button>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add NCP Test</Button>
      </div>

      {tab === "records" && (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            <Input placeholder="Search flock, sample ref, date…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
            {(["all", "negative", "positive", "pending", "inconclusive"] as const).map(r => (
              <Button key={r} size="sm" variant={resultFilter === r ? "default" : "outline"} onClick={() => setResultFilter(r)}>
                {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total Tests", value: tests.length },
              { label: "Pending", value: pending.length, amber: pending.length > 0 },
              { label: "Positives", value: positives.length, red: positives.length > 0, green: positives.length === 0 },
            ].map((s, i) => (
              <div key={i} className="bg-white border rounded-lg p-3 text-center">
                <div className={`text-xl font-bold ${(s as any).red ? "text-red-600" : (s as any).amber ? "text-amber-600" : (s as any).green ? "text-green-600" : ""}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {testsQ.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FlaskConical className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No NCP test records found. Record your first Salmonella test.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.sort((a, b) => b.testDate.localeCompare(a.testDate)).map(t => {
                const rb = RESULT_BADGE[t.result] ?? RESULT_BADGE.pending;
                return (
                  <div key={t.id} className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${t.result === "positive" ? "border-red-300" : ""}`} onClick={() => openEdit(t)}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{t.testDate}</span>
                      <Badge className={`text-xs ${rb.className}`}>{rb.label}</Badge>
                      <span className="text-xs text-muted-foreground capitalize">{t.sampleType.replace(/_/g, " ")}</span>
                      {t.result === "positive" && !t.notificationSentToApha && <Badge className="text-xs bg-red-200 text-red-900">APHA not notified</Badge>}
                      {t.movementRestrictions && <Badge className="text-xs bg-red-100 text-red-800">Restricted</Badge>}
                      {t.result === "negative" && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                    </div>
                    <div className="text-xs text-muted-foreground space-x-3">
                      {t.flockRef && <span>Flock/House: {t.flockRef}</span>}
                      {t.sampleRef && <span>Sample: {t.sampleRef}</span>}
                      {t.laboratoryName && <span>Lab: {t.laboratoryName}</span>}
                      {t.serotypeIsolated && <span className="text-red-700 font-medium">Serotype: {t.serotypeIsolated}</span>}
                      {t.nextTestDueDate && <span className="text-blue-700">Next: {t.nextTestDueDate}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Tests", value: tests.length },
              { label: "Negative", value: tests.filter(t => t.result === "negative").length, green: true },
              { label: "Positive", value: positives.length, red: positives.length > 0, green: positives.length === 0 },
              { label: "Positive Rate", value: `${positiveRate}%`, red: parseFloat(positiveRate) > 0 },
            ].map((s, i) => (
              <div key={i} className={`bg-white border rounded-lg p-4 text-center ${(s as any).red && parseFloat(String(s.value)) > 0 ? "border-red-300" : ""}`}>
                <div className={`text-2xl font-bold ${(s as any).red && (positives.length > 0 || parseFloat(positiveRate) > 0) ? "text-red-600" : (s as any).green ? "text-green-600" : ""}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {tests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <FlaskConical className="mx-auto mb-2 w-8 h-8 opacity-30" />
              <p>Add NCP test records to see analytics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resultDistrib.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="text-sm font-medium mb-3">Result Distribution</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={resultDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={d => d.name}>
                        {resultDistrib.map((d, i) => <Cell key={i} fill={PIE_COLOURS[d.name] ?? "#9ca3af"} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium mb-3">Monthly Testing Activity</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyTests}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="tests" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tests" />
                    <Bar dataKey="positives" fill="#ef4444" radius={[4, 4, 0, 0]} name="Positives" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {positives.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm font-semibold mb-3 text-red-700">Positive Result History</div>
              <div className="space-y-2">
                {positives.sort((a, b) => b.testDate.localeCompare(a.testDate)).map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs border border-red-200 rounded p-2 bg-red-50">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.testDate}</span>
                      {t.flockRef && <span className="text-muted-foreground">Flock: {t.flockRef}</span>}
                      {t.serotypeIsolated && <span className="text-red-700 font-medium">{t.serotypeIsolated}</span>}
                    </div>
                    <Badge className={`text-xs ${t.notificationSentToApha ? "bg-green-100 text-green-800" : "bg-red-200 text-red-900"}`}>
                      {t.notificationSentToApha ? "APHA notified" : "APHA not notified"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm(EMPTY); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit NCP Test" : "Add NCP Salmonella Test"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMut.mutate({ ...form, notificationSentToApha: Boolean(form.notificationSentToApha), movementRestrictions: Boolean(form.movementRestrictions) }); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Test Date *</Label><Input type="date" value={form.testDate ?? ""} onChange={e => f("testDate", e.target.value)} required /></div>
              <div>
                <Label>Sample Type *</Label>
                <Select value={form.sampleType ?? "boot_swab"} onValueChange={v => f("sampleType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boot_swab">Boot Swab</SelectItem>
                    <SelectItem value="environmental">Environmental Swab</SelectItem>
                    <SelectItem value="blood">Blood Sample</SelectItem>
                    <SelectItem value="neck_skin">Neck Skin</SelectItem>
                    <SelectItem value="caecal">Caecal (post-mortem)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sampling Method</Label>
                <Select value={form.samplingMethod ?? "self_sampled"} onValueChange={v => f("samplingMethod", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_sampled">Self-sampled</SelectItem>
                    <SelectItem value="official">Official (APHA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Result *</Label>
                <Select value={form.result ?? "pending"} onValueChange={v => f("result", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Flock</Label>
                <Select value={form.flockId?.toString() ?? ""} onValueChange={v => f("flockId", v ? Number(v) : null)}>
                  <SelectTrigger><SelectValue placeholder="Select flock…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific flock</SelectItem>
                    {flocks.map(fl => <SelectItem key={fl.id} value={String(fl.id)}>{fl.flockName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Flock/House Reference</Label><Input value={form.flockRef ?? ""} onChange={e => f("flockRef", e.target.value)} placeholder="e.g. House 3 / Flock A" /></div>
              <div><Label>Laboratory Name</Label><Input value={form.laboratoryName ?? ""} onChange={e => f("laboratoryName", e.target.value)} /></div>
              <div><Label>Sample Reference</Label><Input value={form.sampleRef ?? ""} onChange={e => f("sampleRef", e.target.value)} /></div>
              {form.result === "positive" && (
                <div className="col-span-2"><Label>Serotype Isolated</Label><Input value={form.serotypeIsolated ?? ""} onChange={e => f("serotypeIsolated", e.target.value)} placeholder="e.g. S. Enteritidis, S. Typhimurium DT104" /></div>
              )}
              <div><Label>Next Test Due</Label><Input type="date" value={form.nextTestDueDate ?? ""} onChange={e => f("nextTestDueDate", e.target.value)} /></div>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { id: "apha", field: "notificationSentToApha", label: "APHA notified of positive result" },
                { id: "restrict", field: "movementRestrictions", label: "Movement restrictions imposed" },
              ].map(cb => (
                <div key={cb.id} className="flex items-center gap-2">
                  <input type="checkbox" id={cb.id} checked={Boolean(form[cb.field])} onChange={e => f(cb.field, e.target.checked)} />
                  <Label htmlFor={cb.id}>{cb.label}</Label>
                </div>
              ))}
            </div>
            <div><Label>Actions Taken</Label><Textarea value={form.actionsTaken ?? ""} onChange={e => f("actionsTaken", e.target.value)} rows={3} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => f("notes", e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending}>{saveMut.isPending ? "Saving…" : "Save Test"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
