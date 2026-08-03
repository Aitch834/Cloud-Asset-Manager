import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
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
import { BarChart3, CalendarCheck, Clock, Plus, Printer, Stethoscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type AHWR = {
  id: number;
  species: string;
  reviewDate: string;
  vetName: string;
  vetPractice: string | null;
  ahwrRef: string | null;
  sbiNumber: string | null;
  areasReviewed: string | null;
  keyFindings: string | null;
  recommendations: string | null;
  actionsAgreed: string | null;
  nextReviewDue: string | null;
  documentRef: string | null;
  notes: string | null;
};

const SPECIES = ["Cattle", "Sheep", "Pigs", "Poultry"];
const SPECIES_COLOUR: Record<string, string> = {
  Cattle: "bg-blue-100 text-blue-800",
  Sheep: "bg-green-100 text-green-800",
  Pigs: "bg-pink-100 text-pink-800",
  Poultry: "bg-yellow-100 text-yellow-800",
};
const PIE_COLOURS = ["#3b82f6", "#22c55e", "#ec4899", "#eab308"];

const EMPTY: Partial<AHWR> = {
  reviewDate: new Date().toISOString().slice(0, 10),
  species: "Cattle",
};

export default function AHWRPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = usePersistedTab<"reviews" | "analytics">({ page: "ahwr", farmId, validIds: ["reviews", "analytics"], defaultTab: "reviews" });
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AHWR | null>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const recordsQ = useQuery<AHWR[]>({
    queryKey: ["farms", farmId, "ahwr-records"],
    queryFn: () => api.get(`/farms/${farmId}/ahwr-records`).then(r => r.records ?? []),
    enabled: !!farmId,
  });

  const saveMut = useMutation({
    mutationFn: (body: any) =>
      editing
        ? api.put(`/farms/${farmId}/ahwr-records/${editing.id}`, body)
        : api.post(`/farms/${farmId}/ahwr-records`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "ahwr-records"] });
      toast({ title: editing ? "AHWR record updated" : "AHWR record saved" });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const records = recordsQ.data ?? [];
  const filtered = speciesFilter === "all" ? records : records.filter(r => r.species === speciesFilter);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = records.filter(r => r.nextReviewDue && r.nextReviewDue < today);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); };
  const openEdit = (r: AHWR) => { setEditing(r); setForm({ ...r }); setOpen(true); };
  const f = (field: string, val: any) => setForm((p: any) => ({ ...p, [field]: val }));

  const bySpecies = SPECIES.map(s => ({
    species: s,
    count: records.filter(r => r.species === s).length,
  })).filter(d => d.count > 0);

  const byYear = Array.from(new Set(records.map(r => r.reviewDate.slice(0, 4)))).sort().map(yr => ({
    year: yr,
    count: records.filter(r => r.reviewDate.startsWith(yr)).length,
  }));

  const upcoming = records
    .filter(r => r.nextReviewDue && r.nextReviewDue >= today)
    .sort((a, b) => a.nextReviewDue!.localeCompare(b.nextReviewDue!))
    .slice(0, 4);

  return (
    <AppLayout title="Annual Health & Welfare Review (AHWR)">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>AHWR</strong> — Annual vet health and welfare reviews are a condition of SFI/ELM payments. Records must be kept for a minimum of 5 years.
      </div>

      {overdue.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
            <Clock className="w-4 h-4" />
            {overdue.length} review{overdue.length > 1 ? "s" : ""} overdue
          </div>
          {overdue.map(r => (
            <div key={r.id} className="text-xs text-amber-700 mt-1">
              {r.species} — due {r.nextReviewDue}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={tab === "reviews" ? "default" : "outline"} onClick={() => setTab("reviews")}>
            Reviews
          </Button>
          <Button size="sm" variant={tab === "analytics" ? "default" : "outline"} onClick={() => setTab("analytics")}>
            <BarChart3 className="w-3.5 h-3.5 mr-1" />Analytics
          </Button>
        </div>
        {tab === "reviews" && (
          <div className="flex gap-2 flex-wrap items-center">
            {["all", ...SPECIES].map(s => (
              <Button key={s} size="sm" variant={speciesFilter === s ? "default" : "outline"} onClick={() => setSpeciesFilter(s)}>
                {s === "all" ? "All" : s}
              </Button>
            ))}
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add AHWR</Button>
          </div>
        )}
        {tab === "analytics" && (
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add AHWR</Button>
        )}
      </div>

      {tab === "reviews" && (
        <>
          {recordsQ.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No AHWR records for {speciesFilter === "all" ? "any species" : speciesFilter}. Add your first review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate)).map(r => (
                <div key={r.id} className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => openEdit(r)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={SPECIES_COLOUR[r.species] ?? "bg-gray-100 text-gray-700"}>{r.species}</Badge>
                      <span className="font-medium text-sm">{r.reviewDate}</span>
                      {r.nextReviewDue && r.nextReviewDue < today && (
                        <Badge className="bg-amber-100 text-amber-800 text-xs">Overdue</Badge>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); window.print(); }}><Printer className="w-4 h-4" /></Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Vet: <strong>{r.vetName}</strong>{r.vetPractice ? ` — ${r.vetPractice}` : ""}</p>
                    {r.ahwrRef && <p>AHWR ref: {r.ahwrRef}</p>}
                    {r.keyFindings && <p className="line-clamp-2">Findings: {r.keyFindings}</p>}
                    {r.nextReviewDue && (
                      <p className={r.nextReviewDue < today ? "text-amber-600 font-medium" : "text-blue-700"}>
                        <CalendarCheck className="inline w-3 h-3 mr-1" />Next due: {r.nextReviewDue}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Reviews", value: records.length },
              { label: "Overdue", value: overdue.length, amber: overdue.length > 0 },
              { label: "Upcoming (next 90d)", value: records.filter(r => r.nextReviewDue && r.nextReviewDue >= today && r.nextReviewDue <= new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)).length, blue: true },
              { label: "Species Covered", value: new Set(records.map(r => r.species)).size },
            ].map((s, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${(s as any).amber ? "text-amber-600" : (s as any).blue ? "text-blue-600" : ""}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <Stethoscope className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No AHWR records yet. Add your first review to see analytics.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bySpecies.length > 0 && (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-sm font-medium mb-3">Reviews by Species</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={bySpecies} dataKey="count" nameKey="species" cx="50%" cy="50%" outerRadius={65} label={d => d.species}>
                          {bySpecies.map((_, i) => <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {byYear.length > 0 && (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-sm font-medium mb-3">Annual Review Frequency</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={byYear}>
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reviews" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {upcoming.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-blue-600" />Upcoming Reviews
                  </div>
                  <div className="space-y-2">
                    {upcoming.map(r => {
                      const daysUntil = Math.ceil((new Date(r.nextReviewDue!).getTime() - Date.now()) / 86400000);
                      return (
                        <div key={r.id} className="flex items-center justify-between text-sm border rounded p-2">
                          <div className="flex items-center gap-2">
                            <Badge className={SPECIES_COLOUR[r.species] ?? "bg-gray-100 text-gray-700"}>{r.species}</Badge>
                            <span className="text-muted-foreground">Vet: {r.vetName}</span>
                          </div>
                          <div className={`text-xs font-medium ${daysUntil <= 30 ? "text-amber-600" : "text-blue-600"}`}>
                            Due {r.nextReviewDue} ({daysUntil}d)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium mb-3">SFI / ELM Compliance Overview</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {SPECIES.map(sp => {
                    const spRecords = records.filter(r => r.species === sp);
                    const latest = spRecords.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate))[0];
                    const isOverdue = latest?.nextReviewDue && latest.nextReviewDue < today;
                    return (
                      <div key={sp} className={`rounded p-3 border ${isOverdue ? "border-amber-300 bg-amber-50" : spRecords.length > 0 ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                        <div className="font-semibold mb-1">{sp}</div>
                        {spRecords.length === 0 ? (
                          <p className="text-muted-foreground">No records</p>
                        ) : (
                          <>
                            <p>Last: {latest.reviewDate}</p>
                            {latest.nextReviewDue && <p className={isOverdue ? "text-amber-600 font-medium" : "text-green-700"}>Next: {latest.nextReviewDue}</p>}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditing(null); setForm(EMPTY); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit AHWR Record" : "Add Annual Health & Welfare Review"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Species *</Label>
                <Select value={form.species ?? "Cattle"} onValueChange={v => f("species", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Review Date *</Label>
                <Input type="date" value={form.reviewDate ?? ""} onChange={e => f("reviewDate", e.target.value)} required />
              </div>
              <div>
                <Label>Vet Name *</Label>
                <Input value={form.vetName ?? ""} onChange={e => f("vetName", e.target.value)} required />
              </div>
              <div>
                <Label>Vet Practice</Label>
                <Input value={form.vetPractice ?? ""} onChange={e => f("vetPractice", e.target.value)} />
              </div>
              <div>
                <Label>AHWR Reference / Claim Number</Label>
                <Input value={form.ahwrRef ?? ""} onChange={e => f("ahwrRef", e.target.value)} placeholder="e.g. AHWR-2025-XXXX" />
              </div>
              <div>
                <Label>SBI Number</Label>
                <Input value={form.sbiNumber ?? ""} onChange={e => f("sbiNumber", e.target.value)} placeholder="Single Business Identifier" />
              </div>
              <div>
                <Label>Next Review Due</Label>
                <Input type="date" value={form.nextReviewDue ?? ""} onChange={e => f("nextReviewDue", e.target.value)} />
              </div>
              <div>
                <Label>Document Reference</Label>
                <Input value={form.documentRef ?? ""} onChange={e => f("documentRef", e.target.value)} placeholder="Vet report file/ref" />
              </div>
            </div>
            <div>
              <Label>Areas Reviewed</Label>
              <Input value={form.areasReviewed ?? ""} onChange={e => f("areasReviewed", e.target.value)} placeholder="e.g. Biosecurity, lameness, BVD, nutrition" />
            </div>
            <div>
              <Label>Key Findings</Label>
              <Textarea value={form.keyFindings ?? ""} onChange={e => f("keyFindings", e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Recommendations</Label>
              <Textarea value={form.recommendations ?? ""} onChange={e => f("recommendations", e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Actions Agreed</Label>
              <Textarea value={form.actionsAgreed ?? ""} onChange={e => f("actionsAgreed", e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={e => f("notes", e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending}>{saveMut.isPending ? "Saving…" : "Save Review"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
