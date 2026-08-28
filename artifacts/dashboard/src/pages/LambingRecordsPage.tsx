import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { YearCompareSelector, COMPARE_COLORS } from "@/components/analytics/YearCompareSelector";
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
import { useFarmReportMeta } from "@/hooks/use-farm-name";
import { printBirthRecordReport } from "@/lib/birth-record-report";
import { Baby, Plus, Printer, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type LambingRecord = {
  id: number;
  flockId: number | null;
  lambingDate: string;
  eweEarTag: string | null;
  eweAgeYears: number | null;
  eweBcs: string | null;
  numberOfLambs: number;
  lambingEase: number | null;
  assistanceRequired: boolean;
  assistanceType: string | null;
  lambEarTags: string | null;
  sexOfLambs: string | null;
  birthWeightsKg: string | null;
  colostrumGiven: boolean;
  fostered: boolean;
  fosterEweTag: string | null;
  mortalityCount: number;
  mortalityReasons: string | null;
  notes: string | null;
};

type Flock = { id: number; flockName: string };

const EMPTY: Partial<LambingRecord> = {
  lambingDate: new Date().toISOString().slice(0, 10),
  numberOfLambs: 1,
  assistanceRequired: false,
  colostrumGiven: true,
  fostered: false,
  mortalityCount: 0,
};

const EASE_LABELS = ["", "1 — Unassisted", "2 — Easy Pull", "3 — Hard Pull", "4 — Assisted (repel)", "5 — Vet / C-section"];
const EASE_COLOURS = ["", "#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];
const PIE_COLOURS = ["#3b82f6", "#ec4899", "#8b5cf6"];

export default function LambingRecordsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const farmMeta = useFarmReportMeta(farmId ?? 0);
  const [tab, setTab] = usePersistedTab<"records" | "analytics">({ page: "lambing-records", farmId, validIds: ["records", "analytics"], defaultTab: "records" });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LambingRecord | null>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const recordsQ = useQuery<LambingRecord[]>({
    queryKey: ["farms", farmId, "lambing-records"],
    queryFn: () => api.get(`/farms/${farmId}/lambing-records`).then(r => r.records ?? []),
    enabled: !!farmId,
  });

  const flocksQ = useQuery<Flock[]>({
    queryKey: ["farms", farmId, "sheep-flocks"],
    queryFn: () => api.get(`/farms/${farmId}/sheep-flocks`).then(r => r.flocks ?? []),
    enabled: !!farmId,
  });

  const saveMut = useMutation({
    mutationFn: (body: any) =>
      editing
        ? api.put(`/farms/${farmId}/lambing-records/${editing.id}`, body)
        : api.post(`/farms/${farmId}/lambing-records`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "lambing-records"] });
      toast({ title: editing ? "Lambing record updated" : "Lambing record saved" });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const records = recordsQ.data ?? [];
  const flocks = flocksQ.data ?? [];

  const filtered = records.filter(r =>
    !search || (r.eweEarTag ?? "").toLowerCase().includes(search.toLowerCase()) || r.lambingDate.includes(search)
  );

  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    records.forEach(r => {
      const y = Number(r.lambingDate.slice(0, 4));
      if (y > 2000) years.add(y);
    });
    return [...years].sort((a, b) => b - a);
  }, [records]);

  const [selectedYear, setSelectedYear] = usePersistedNumberFilter({ page: "lambing-analytics", filter: "year", farmId, defaultValue: currentYear, isValid: (y) => y > 2000 && y <= currentYear + 1 });
  const [compareYear, setCompareYear] = useState<number | null>(null);

  // Reset comparison if it collides with the newly-selected primary year
  useEffect(() => {
    setCompareYear(prev => (prev === selectedYear ? null : prev));
  }, [selectedYear]);

  const recordsFiltered = useMemo(
    () => records.filter(r => r.lambingDate.startsWith(String(selectedYear))),
    [records, selectedYear]
  );

  const recordsCompare = useMemo(
    () => compareYear ? records.filter(r => r.lambingDate.startsWith(String(compareYear))) : [],
    [records, compareYear]
  );

  const totalLambs = useMemo(() => recordsFiltered.reduce((s, r) => s + r.numberOfLambs, 0), [recordsFiltered]);
  const totalMortalities = useMemo(() => recordsFiltered.reduce((s, r) => s + r.mortalityCount, 0), [recordsFiltered]);
  const assisted = useMemo(() => recordsFiltered.filter(r => r.assistanceRequired).length, [recordsFiltered]);
  const survivalRate = totalLambs > 0 ? Math.round(((totalLambs - totalMortalities) / totalLambs) * 100) : null;

  const easeData = useMemo(() => [1, 2, 3, 4, 5].map(e => ({
    ease: EASE_LABELS[e],
    count: recordsFiltered.filter(r => r.lambingEase === e).length,
    fill: EASE_COLOURS[e],
  })).filter(d => d.count > 0), [recordsFiltered]);

  const sexData = useMemo(() => [
    { name: "All Male", value: recordsFiltered.filter(r => r.sexOfLambs === "all_male").length },
    { name: "All Female", value: recordsFiltered.filter(r => r.sexOfLambs === "all_female").length },
    { name: "Mixed", value: recordsFiltered.filter(r => r.sexOfLambs === "mixed").length },
  ].filter(d => d.value > 0), [recordsFiltered]);

  const lambsPerEwe = useMemo(() => [1, 2, 3, 4].map(n => ({
    lambs: `${n} lamb${n > 1 ? "s" : ""}`,
    count: recordsFiltered.filter(r => r.numberOfLambs === n).length,
  })).filter(d => d.count > 0), [recordsFiltered]);

  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const lambingsByMonth = useMemo(() => MONTH_LABELS.map((label, i) => {
    const m = String(i + 1).padStart(2, "0");
    const count = recordsFiltered.filter(r => r.lambingDate.slice(5, 7) === m).length;
    const count_cmp = recordsCompare.filter(r => r.lambingDate.slice(5, 7) === m).length;
    return { month: label, count, count_cmp };
  }).filter(d => d.count > 0 || d.count_cmp > 0), [recordsFiltered, recordsCompare]);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); };
  const openEdit = (r: LambingRecord) => { setEditing(r); setForm({ ...r }); setOpen(true); };
  const f = (field: string, val: any) => setForm((p: any) => ({ ...p, [field]: val }));
  const printLambingRecord = (record: LambingRecord) => {
    const tags = (record.lambEarTags || "").split(/[,\n;]/).map(part => part.trim()).filter(Boolean);
    const weights = (record.birthWeightsKg || "").split(/[,\n;]/).map(part => part.trim()).filter(Boolean);
    const mortalityReasons = (record.mortalityReasons || "").split(/[,\n;]/).map(part => part.trim()).filter(Boolean);
    printBirthRecordReport({
      species: "sheep",
      recordId: record.id,
      ...farmMeta,
      birthDate: record.lambingDate,
      damLabel: record.eweEarTag,
      damAge: record.eweAgeYears,
      damCondition: record.eweBcs,
      offspring: Array.from({ length: Math.max(1, record.numberOfLambs) }, (_, index) => {
        const isMortality = index >= Math.max(0, record.numberOfLambs - record.mortalityCount);
        return {
          label: `Lamb ${index + 1}`,
          outcome: isMortality ? mortalityReasons[index - (record.numberOfLambs - record.mortalityCount)] || "Mortality recorded" : "Live",
          sex: record.sexOfLambs,
          tag: tags[index],
          weightKg: weights[index],
          colostrum: record.colostrumGiven ? "Given" : "Not recorded as given",
        };
      }),
      ease: record.lambingEase ? EASE_LABELS[record.lambingEase] ?? record.lambingEase : null,
      assistance: record.assistanceRequired,
      assistanceType: record.assistanceType,
      colostrumWithin2Hours: record.colostrumGiven,
      fostering: record.fostered ? `Yes${record.fosterEweTag ? ` — foster ewe ${record.fosterEweTag}` : ""}` : "No",
      disposition: record.mortalityCount > 0 ? `${record.mortalityCount} mortality${record.mortalityCount === 1 ? "" : "ies"}: ${record.mortalityReasons || "reason not recorded"}` : "No mortality recorded",
      notes: [flocks.find(flock => flock.id === record.flockId)?.flockName ? `Flock: ${flocks.find(flock => flock.id === record.flockId)?.flockName}` : null, record.notes].filter(Boolean).join(" · ") || null,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMut.mutate({
      ...form,
      numberOfLambs: Number(form.numberOfLambs ?? 1),
      mortalityCount: Number(form.mortalityCount ?? 0),
      lambingEase: form.lambingEase ? Number(form.lambingEase) : null,
      eweAgeYears: form.eweAgeYears ? Number(form.eweAgeYears) : null,
      assistanceRequired: Boolean(form.assistanceRequired),
      colostrumGiven: Boolean(form.colostrumGiven),
      fostered: Boolean(form.fostered),
    });
  };

  return (
    <AppLayout title="Lambing Records">
      <div className="mb-4 flex gap-2">
        {(["records", "analytics"] as const).map(t => (
          <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
            {t === "records" ? "Records" : "Analytics"}
          </Button>
        ))}
      </div>

      {tab === "records" && (
        <>
          <div className="flex items-center justify-between mb-4 gap-3">
            <Input placeholder="Search by ewe tag, date…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Record Lambing</Button>
          </div>
          {recordsQ.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Baby className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No lambing records found. Start recording this season's lambings.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.sort((a, b) => b.lambingDate.localeCompare(a.lambingDate)).map(r => (
                <div key={r.id} className="bg-white border rounded-lg p-3 flex items-start justify-between gap-3 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => openEdit(r)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{r.lambingDate}</span>
                      {r.eweEarTag && <span className="text-xs text-muted-foreground">Ewe: {r.eweEarTag}</span>}
                      <Badge className="bg-green-100 text-green-800 text-xs">{r.numberOfLambs} lamb{r.numberOfLambs > 1 ? "s" : ""}</Badge>
                      {r.lambingEase && <Badge className="text-xs" style={{ backgroundColor: EASE_COLOURS[r.lambingEase] + "20", color: EASE_COLOURS[r.lambingEase] }}>Ease {r.lambingEase}</Badge>}
                      {r.mortalityCount > 0 && <Badge className="bg-red-100 text-red-800 text-xs">{r.mortalityCount} dead</Badge>}
                      {r.assistanceRequired && <Badge className="bg-orange-100 text-orange-800 text-xs">Assisted</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground space-x-2">
                      {r.sexOfLambs && <span>{r.sexOfLambs.replace(/_/g, " ")}</span>}
                      {r.birthWeightsKg && <span>Weights: {r.birthWeightsKg} kg</span>}
                      {r.fostered && <span>Fostered</span>}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); printLambingRecord(r); }}><Printer className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          {availableYears.length > 0 && (
            <YearCompareSelector
              availableYears={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              compareYear={compareYear}
              onCompareYearChange={setCompareYear}
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: `Lambings (${selectedYear})`, value: recordsFiltered.length },
              { label: "Total Lambs", value: totalLambs },
              { label: "Mortalities", value: totalMortalities, red: totalMortalities > 0 },
              { label: "Survival Rate", value: survivalRate != null ? `${survivalRate}%` : "—", green: survivalRate != null && survivalRate >= 90 },
            ].map((s, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${(s as any).red ? "text-red-600" : (s as any).green ? "text-green-600" : ""}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {lambingsByMonth.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm font-medium mb-3">
                Monthly Lambings{compareYear ? ` — ${selectedYear} vs ${compareYear}` : ` — ${selectedYear}`}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={lambingsByMonth}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  {compareYear && <Legend iconSize={10} />}
                  <Bar dataKey="count" fill={COMPARE_COLORS[0]} radius={[4, 4, 0, 0]} name={compareYear ? String(selectedYear) : "Lambings"} />
                  {compareYear && <Bar dataKey="count_cmp" fill={COMPARE_COLORS[1]} radius={[4, 4, 0, 0]} name={String(compareYear)} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {easeData.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" />Lambing Ease Distribution</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={easeData}>
                    <XAxis dataKey="ease" tick={{ fontSize: 9 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {easeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {sexData.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium mb-3">Sex of Lambs</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={sexData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={d => d.name}>
                      {sexData.map((_, i) => <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {lambsPerEwe.length > 0 && (
              <div className="bg-white border rounded-lg p-4 md:col-span-2">
                <div className="text-sm font-medium mb-3">Litter Size Distribution</div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={lambsPerEwe}>
                    <XAxis dataKey="lambs" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm font-medium mb-2">Season Summary ({selectedYear})</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Assisted deliveries: <strong>{assisted} ({recordsFiltered.length > 0 ? Math.round((assisted / recordsFiltered.length) * 100) : 0}%)</strong></div>
              <div>Avg lambs/ewe: <strong>{recordsFiltered.length > 0 ? (totalLambs / recordsFiltered.length).toFixed(2) : "—"}</strong></div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm(EMPTY); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Lambing Record" : "Record Lambing"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lambing Date *</Label>
                <Input type="date" value={form.lambingDate ?? ""} onChange={e => f("lambingDate", e.target.value)} required />
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
              <div>
                <Label>Ewe Ear Tag</Label>
                <Input value={form.eweEarTag ?? ""} onChange={e => f("eweEarTag", e.target.value)} placeholder="e.g. UK123456 000123" />
              </div>
              <div>
                <Label>Ewe Age (years)</Label>
                <Input type="number" min="1" max="20" value={form.eweAgeYears ?? ""} onChange={e => f("eweAgeYears", e.target.value)} />
              </div>
              <div>
                <Label>Ewe BCS (body condition score)</Label>
                <Input type="number" step="0.5" min="1" max="5" value={form.eweBcs ?? ""} onChange={e => f("eweBcs", e.target.value)} placeholder="1.0–5.0" />
              </div>
              <div>
                <Label>Number of Lambs Born *</Label>
                <Input type="number" min="1" max="6" value={form.numberOfLambs ?? 1} onChange={e => f("numberOfLambs", e.target.value)} required />
              </div>
              <div>
                <Label>Lambing Ease</Label>
                <Select value={form.lambingEase?.toString() ?? ""} onValueChange={v => f("lambingEase", v ? Number(v) : null)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(e => <SelectItem key={e} value={String(e)}>{EASE_LABELS[e]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sex of Lambs</Label>
                <Select value={form.sexOfLambs ?? ""} onValueChange={v => f("sexOfLambs", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_male">All Male</SelectItem>
                    <SelectItem value="all_female">All Female</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lamb Ear Tags</Label>
                <Input value={form.lambEarTags ?? ""} onChange={e => f("lambEarTags", e.target.value)} placeholder="Comma-separated tags" />
              </div>
              <div>
                <Label>Birth Weights (kg)</Label>
                <Input value={form.birthWeightsKg ?? ""} onChange={e => f("birthWeightsKg", e.target.value)} placeholder="e.g. 4.2,3.8" />
              </div>
              <div>
                <Label>Mortalities</Label>
                <Input type="number" min="0" value={form.mortalityCount ?? 0} onChange={e => f("mortalityCount", e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { id: "assist", field: "assistanceRequired", label: "Assistance Required" },
                { id: "colostrum", field: "colostrumGiven", label: "Colostrum Given" },
                { id: "foster", field: "fostered", label: "Fostered" },
              ].map(cb => (
                <div key={cb.id} className="flex items-center gap-2">
                  <input type="checkbox" id={cb.id} checked={Boolean(form[cb.field])} onChange={e => f(cb.field, e.target.checked)} />
                  <Label htmlFor={cb.id}>{cb.label}</Label>
                </div>
              ))}
            </div>
            {form.assistanceRequired && (
              <div>
                <Label>Assistance Type</Label>
                <Input value={form.assistanceType ?? ""} onChange={e => f("assistanceType", e.target.value)} placeholder="e.g. Rope pull, repel, vet" />
              </div>
            )}
            {form.fostered && (
              <div>
                <Label>Foster Ewe Ear Tag</Label>
                <Input value={form.fosterEweTag ?? ""} onChange={e => f("fosterEweTag", e.target.value)} />
              </div>
            )}
            {Number(form.mortalityCount) > 0 && (
              <div>
                <Label>Mortality Reasons</Label>
                <Textarea value={form.mortalityReasons ?? ""} onChange={e => f("mortalityReasons", e.target.value)} rows={2} />
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={e => f("notes", e.target.value)} rows={2} />
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
