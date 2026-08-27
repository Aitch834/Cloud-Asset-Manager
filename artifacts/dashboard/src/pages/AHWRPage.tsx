import { useState, useEffect } from "react";
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
import { printRecordReport } from "@/lib/record-report";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  BarChart3, CalendarCheck, Clock, Plus, Printer, Stethoscope,
  Info, CheckCircle2, AlertCircle, AlertTriangle, Paperclip,
  ListChecks, UserCheck, ExternalLink,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type FarmContact = {
  id: number;
  name: string;
  organisation: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
};

type AHWR = {
  id: number;
  species: string;
  reviewDate: string;
  vetName: string;
  vetPractice: string | null;
  vetContactId: number | null;
  ahwrRef: string | null;
  sbiNumber: string | null;
  areasReviewed: string | null;
  keyFindings: string | null;
  healthPriorities: string | null;
  recommendations: string | null;
  actionsAgreed: string | null;
  agreedWith: string | null;
  outcome: string | null;
  nextReviewDue: string | null;
  documentRef: string | null;
  notes: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SPECIES = ["Cattle", "Sheep", "Pigs", "Poultry", "Goats", "Deer"];

const SPECIES_COLOUR: Record<string, string> = {
  Cattle: "bg-blue-100 text-blue-800",
  Sheep: "bg-green-100 text-green-800",
  Pigs: "bg-pink-100 text-pink-800",
  Poultry: "bg-yellow-100 text-yellow-800",
  Goats: "bg-purple-100 text-purple-800",
  Deer: "bg-orange-100 text-orange-800",
};

const PIE_COLOURS = ["#3b82f6", "#22c55e", "#ec4899", "#eab308", "#a855f7", "#f97316"];

const OUTCOMES = [
  { key: "satisfactory",   label: "Satisfactory",   icon: CheckCircle2,  colour: "text-green-600",  bg: "bg-green-50 border-green-300"  },
  { key: "action_required", label: "Action Required", icon: AlertCircle,   colour: "text-amber-600",  bg: "bg-amber-50 border-amber-300"  },
  { key: "urgent_action",  label: "Urgent Action",  icon: AlertTriangle, colour: "text-red-600",    bg: "bg-red-50 border-red-300"      },
];

function addOneYear(dateStr: string): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

const VET_OTHER = "__other__";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AHWRPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [tab, setTab] = usePersistedTab<"reviews" | "analytics">({
    page: "ahwr", farmId, validIds: ["reviews", "analytics"], defaultTab: "reviews",
  });
  const [speciesFilter, setSpeciesFilter] = usePersistedFilter({
    page: "ahwr", filter: "species", farmId, defaultValue: "all",
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AHWR | null>(null);
  const [form, setForm] = useState<Partial<AHWR>>({});
  // Tracks whether nextReviewDue was auto-set so we can update it if reviewDate changes
  const [nextReviewAutoSet, setNextReviewAutoSet] = useState(false);
  // For vet select — either a contact id (string) or VET_OTHER
  const [vetSelectVal, setVetSelectVal] = useState<string>("");
  // Post-save task prompt
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<number | null>(null);

  // ── Data queries ────────────────────────────────────────────────────────────

  const recordsQ = useQuery<AHWR[]>({
    queryKey: ["farms", farmId, "ahwr-records"],
    queryFn: () => api.get(`/farms/${farmId}/ahwr-records`).then(r => r.records ?? []),
    enabled: !!farmId,
  });

  // Farm info — for SBI auto-population
  const farmQ = useQuery<{
    sbiNumber?: string | null; name?: string; address?: string | null; phone?: string | null;
    cphNumber?: string | null; redTractorId?: string | null;
  }>({
    queryKey: ["farms", farmId, "info"],
    queryFn: () => api.get(`/farms/${farmId}`).then(response => response.record ?? response),
    enabled: !!farmId,
  });

  // All active farm contacts — for vet lookup
  const contactsQ = useQuery<FarmContact[]>({
    queryKey: ["farms", farmId, "ahwr-vet-contacts"],
    queryFn: () => api.get(`/farms/${farmId}/ahwr-vet-contacts`).then(r => r.contacts ?? []),
    enabled: !!farmId,
  });

  // ── Derived data ────────────────────────────────────────────────────────────

  const records = recordsQ.data ?? [];
  const contacts = contactsQ.data ?? [];
  // Contacts that look like vets (role contains "vet", case-insensitive), plus all others as fallback
  const vetContacts = contacts.filter(c =>
    !c.role || c.role.toLowerCase().includes("vet") || c.role.toLowerCase().includes("veterinar")
  );
  // If no role-filtered contacts, show all — the farm may not have categorised them
  const vetOptions = vetContacts.length > 0 ? vetContacts : contacts;

  const filtered = speciesFilter === "all" ? records : records.filter(r => r.species === speciesFilter);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = records.filter(r => r.nextReviewDue && r.nextReviewDue < today);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const f = (field: keyof AHWR, val: any) => setForm(p => ({ ...p, [field]: val }));

  function openAdd() {
    setEditing(null);
    const sbi = farmQ.data?.sbiNumber ?? "";
    const today = new Date().toISOString().slice(0, 10);
    setForm({
      species: "Cattle",
      reviewDate: today,
      sbiNumber: sbi,
      nextReviewDue: addOneYear(today),
    });
    setNextReviewAutoSet(true);
    setVetSelectVal("");
    setShowTaskPrompt(false);
    setOpen(true);
  }

  function openEdit(r: AHWR) {
    setEditing(r);
    setForm({ ...r });
    setNextReviewAutoSet(false);
    // Restore vet select value from the contact id on the record
    setVetSelectVal(r.vetContactId ? String(r.vetContactId) : (r.vetName ? VET_OTHER : ""));
    setShowTaskPrompt(false);
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setForm({});
    setNextReviewAutoSet(false);
    setVetSelectVal("");
    setShowTaskPrompt(false);
  }

  // When review date changes, auto-update next review date (if it was auto-set or empty)
  useEffect(() => {
    if (!form.reviewDate) return;
    if (nextReviewAutoSet || !form.nextReviewDue) {
      setForm(p => ({ ...p, nextReviewDue: addOneYear(form.reviewDate!) }));
      setNextReviewAutoSet(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.reviewDate]);

  // When vet contact is selected, cross-populate name and practice
  function handleVetSelect(val: string) {
    setVetSelectVal(val);
    if (val === VET_OTHER || val === "") {
      // Manual entry — clear vet contact link but keep any existing free-text name
      f("vetContactId", null);
    } else {
      const contact = vetOptions.find(c => String(c.id) === val);
      if (contact) {
        setForm(p => ({
          ...p,
          vetContactId: contact.id,
          vetName: contact.name,
          vetPractice: contact.organisation ?? "",
          // Pre-fill "agreed with" with vet name if not already set
          agreedWith: p.agreedWith || contact.name,
        }));
      }
    }
  }

  // ── Save mutation ────────────────────────────────────────────────────────────

  const saveMut = useMutation({
    mutationFn: (body: Partial<AHWR>) =>
      editing
        ? api.put(`/farms/${farmId}/ahwr-records/${editing.id}`, body)
        : api.post(`/farms/${farmId}/ahwr-records`, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "ahwr-records"] });
      toast({ title: editing ? "AHWR record updated" : "AHWR record saved" });
      // If actions were noted, prompt to raise a follow-up task
      if (form.actionsAgreed?.trim()) {
        const id = data?.record?.id ?? editing?.id ?? null;
        setSavedRecordId(id);
        setShowTaskPrompt(true);
        // Keep dialog open to show the prompt
      } else {
        closeDialog();
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  // ── Task creation ────────────────────────────────────────────────────────────

  const taskMut = useMutation({
    mutationFn: (body: { title: string; description?: string; dueDate?: string }) =>
      api.post(`/farms/${farmId}/task-assignments`, body),
    onSuccess: () => {
      toast({ title: "Follow-up task created" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
      closeDialog();
    },
  });

  function raiseFollowUpTask() {
    taskMut.mutate({
      title: `AHWR follow-up — ${form.species ?? ""}${form.reviewDate ? ` (${form.reviewDate})` : ""}`,
      description: form.actionsAgreed ?? "",
      dueDate: form.nextReviewDue ?? undefined,
    });
  }

  // ── Analytics data ───────────────────────────────────────────────────────────

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

  const outcomeLabel = (o: string | null | undefined) =>
    OUTCOMES.find(x => x.key === o)?.label ?? "";

  function printReview(record: AHWR) {
    printRecordReport({
      title: "Annual Health & Welfare Review",
      subtitle: `${record.species} review — ${record.reviewDate}`,
      farmName: farmQ.data?.name ?? "",
      farmAddress: farmQ.data?.address ?? undefined,
      contactPhone: farmQ.data?.phone ?? undefined,
      cphNumber: farmQ.data?.cphNumber ?? undefined,
      sbiNumber: farmQ.data?.sbiNumber ?? undefined,
      redTractorId: farmQ.data?.redTractorId ?? undefined,
      authority: "SFI / ELM",
      authorityReferenceLabel: "AHWR Reference",
      authorityReference: record.ahwrRef,
      authorityReferenceRequired: true,
      record,
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AppLayout title="Annual Health & Welfare Review (AHWR)">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>AHWR</strong> — Annual vet health and welfare reviews are a condition of SFI/ELM payments. Records must
        be kept for at least 5 years. Add your attending vets to <strong>Farm Settings → Contacts</strong> to enable
        intelligent vet lookup and auto-population.
      </div>

      {overdue.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
            <Clock className="w-4 h-4" />
            {overdue.length} review{overdue.length > 1 ? "s" : ""} overdue
          </div>
          {overdue.map(r => (
            <div key={r.id} className="text-xs text-amber-700 mt-1 cursor-pointer hover:underline" onClick={() => openEdit(r)}>
              {r.species} — due {r.nextReviewDue}
            </div>
          ))}
        </div>
      )}

      {/* Tabs & toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={tab === "reviews" ? "default" : "outline"} onClick={() => setTab("reviews")}>
            Reviews
          </Button>
          <Button size="sm" variant={tab === "analytics" ? "default" : "outline"} onClick={() => setTab("analytics")}>
            <BarChart3 className="w-3.5 h-3.5 mr-1" />Analytics
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {tab === "reviews" && ["all", ...SPECIES].map(s => (
            <Button key={s} size="sm" variant={speciesFilter === s ? "default" : "outline"} onClick={() => setSpeciesFilter(s)}>
              {s === "all" ? "All" : s}
            </Button>
          ))}
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add AHWR</Button>
        </div>
      </div>

      {/* ── Reviews tab ── */}
      {tab === "reviews" && (
        <>
          {recordsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No AHWR records{speciesFilter !== "all" ? ` for ${speciesFilter}` : ""}. Add your first review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate)).map(r => {
                const outcomeObj = OUTCOMES.find(o => o.key === r.outcome);
                const OutcomeIcon = outcomeObj?.icon;
                return (
                  <div
                    key={r.id}
                    className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => openEdit(r)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={SPECIES_COLOUR[r.species] ?? "bg-gray-100 text-gray-700"}>{r.species}</Badge>
                        <span className="font-medium text-sm">{r.reviewDate}</span>
                        {outcomeObj && OutcomeIcon && (
                          <span className={`flex items-center gap-1 text-xs font-medium ${outcomeObj.colour}`}>
                            <OutcomeIcon className="w-3 h-3" />{outcomeObj.label}
                          </span>
                        )}
                        {r.nextReviewDue && r.nextReviewDue < today && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">Overdue</Badge>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); printReview(r); }}>
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        Vet: <strong>{r.vetName}</strong>
                        {r.vetPractice ? ` — ${r.vetPractice}` : ""}
                      </p>
                      {r.ahwrRef && <p>Ref: {r.ahwrRef}</p>}
                      {r.keyFindings && <p className="line-clamp-2">Findings: {r.keyFindings}</p>}
                      {r.actionsAgreed && (
                        <p className="flex items-center gap-1 text-blue-700">
                          <ListChecks className="w-3 h-3" />Actions agreed
                          {r.agreedWith ? ` with ${r.agreedWith}` : ""}
                        </p>
                      )}
                      {r.nextReviewDue && (
                        <p className={r.nextReviewDue < today ? "text-amber-600 font-medium" : "text-blue-700"}>
                          <CalendarCheck className="inline w-3 h-3 mr-1" />Next due: {r.nextReviewDue}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Analytics tab ── */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Reviews", value: records.length },
              { label: "Overdue", value: overdue.length, amber: overdue.length > 0 },
              {
                label: "Upcoming (next 90d)",
                value: records.filter(r => {
                  const d90 = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
                  return r.nextReviewDue && r.nextReviewDue >= today && r.nextReviewDue <= d90;
                }).length,
                blue: true,
              },
              { label: "Species Covered", value: new Set(records.map(r => r.species)).size },
            ].map((s, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${(s as any).amber ? "text-amber-600" : (s as any).blue ? "text-blue-600" : ""}`}>
                  {s.value}
                </div>
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
                        <RechartTooltip />
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
                        <RechartTooltip />
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
                            {latest.nextReviewDue && (
                              <p className={isOverdue ? "text-amber-600 font-medium" : "text-green-700"}>
                                Next: {latest.nextReviewDue}
                              </p>
                            )}
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

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={o => { if (!o) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit AHWR Record" : "Add Annual Health & Welfare Review"}</DialogTitle>
          </DialogHeader>

          {/* ── Post-save task prompt ── */}
          {showTaskPrompt && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <ListChecks className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Actions recorded — raise a follow-up task?</p>
                  <p className="text-xs text-blue-700 mt-1">
                    The actions agreed during this review can be added to your Week Ahead task planner so
                    they appear as reminders for your team. The next review date will be set as the due date.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={raiseFollowUpTask} disabled={taskMut.isPending}>
                  {taskMut.isPending ? "Creating…" : "Yes, raise a task"}
                </Button>
                <Button size="sm" variant="outline" onClick={closeDialog}>No thanks, close</Button>
              </div>
            </div>
          )}

          {!showTaskPrompt && (
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-5">

              {/* ── Section 1: Review Details ── */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Review Details</h3>
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
                    <Input
                      type="date"
                      value={form.reviewDate ?? ""}
                      onChange={e => f("reviewDate", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* SBI — auto-populated, read-only with override */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Label>SBI Number</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          Auto-filled from Farm Settings. Edit Farm Settings to change your registered SBI.
                          You can override it here for this record only.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      value={form.sbiNumber ?? ""}
                      onChange={e => f("sbiNumber", e.target.value)}
                      placeholder="Single Business Identifier"
                      className={farmQ.data?.sbiNumber && form.sbiNumber === farmQ.data.sbiNumber ? "bg-gray-50" : ""}
                    />
                    {farmQ.data?.sbiNumber && form.sbiNumber === farmQ.data.sbiNumber && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        from Farm Settings
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Section 2: Attending Vet ── */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Attending Vet</h3>

                {vetOptions.length === 0 ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      No contacts registered. Add your attending vet in <strong>Farm Settings → Contacts</strong> to
                      enable intelligent vet lookup and automatic practice population.
                      You can still enter details manually below.
                    </span>
                  </div>
                ) : null}

                {vetOptions.length > 0 ? (
                  <div>
                    <Label>Select Vet</Label>
                    <Select value={vetSelectVal} onValueChange={handleVetSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose from registered contacts…" />
                      </SelectTrigger>
                      <SelectContent>
                        {vetOptions.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}{c.organisation ? ` — ${c.organisation}` : ""}
                          </SelectItem>
                        ))}
                        <SelectItem value={VET_OTHER}>Other / manual entry…</SelectItem>
                      </SelectContent>
                    </Select>
                    {vetSelectVal && vetSelectVal !== VET_OTHER && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-green-600" />
                        Vet name and practice auto-populated from your Contacts register
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vet Name *</Label>
                    <Input
                      value={form.vetName ?? ""}
                      onChange={e => f("vetName", e.target.value)}
                      required
                      readOnly={!!(vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0)}
                      className={vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0 ? "bg-gray-50" : ""}
                      placeholder="e.g. Dr Sarah Jones"
                    />
                  </div>
                  <div>
                    <Label>Vet Practice</Label>
                    <Input
                      value={form.vetPractice ?? ""}
                      onChange={e => f("vetPractice", e.target.value)}
                      readOnly={!!(vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0)}
                      className={vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0 ? "bg-gray-50" : ""}
                      placeholder="Practice name"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 3: Findings & Priorities ── */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Findings & Priorities</h3>
                <div>
                  <Label>Areas Reviewed</Label>
                  <Input
                    value={form.areasReviewed ?? ""}
                    onChange={e => f("areasReviewed", e.target.value)}
                    placeholder="e.g. Biosecurity, lameness, BVD, nutrition, parasite management"
                  />
                </div>
                <div>
                  <Label>Key Findings</Label>
                  <Textarea
                    value={form.keyFindings ?? ""}
                    onChange={e => f("keyFindings", e.target.value)}
                    rows={3}
                    placeholder="Summary of health status, disease pressures, body condition, welfare indicators…"
                  />
                </div>
                <div>
                  <Label>Health Priorities for Next 12 Months</Label>
                  <Textarea
                    value={form.healthPriorities ?? ""}
                    onChange={e => f("healthPriorities", e.target.value)}
                    rows={2}
                    placeholder="Vaccination protocols, endemic disease management, nutrition plans…"
                  />
                </div>
                <div>
                  <Label>Recommendations</Label>
                  <Textarea
                    value={form.recommendations ?? ""}
                    onChange={e => f("recommendations", e.target.value)}
                    rows={2}
                    placeholder="Vet's formal recommendations for herd / flock health"
                  />
                </div>
              </div>

              {/* ── Section 4: Actions ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions Agreed</h3>
                  <span className="text-xs text-muted-foreground">Saved actions can be raised as a follow-up task after saving</span>
                </div>
                <div>
                  <Label>Actions Agreed</Label>
                  <Textarea
                    value={form.actionsAgreed ?? ""}
                    onChange={e => f("actionsAgreed", e.target.value)}
                    rows={3}
                    placeholder="Specific actions agreed — ideally name a responsible person and target date for each"
                  />
                </div>
                <div>
                  <Label>Agreed With</Label>
                  <Input
                    value={form.agreedWith ?? ""}
                    onChange={e => f("agreedWith", e.target.value)}
                    placeholder="e.g. Dr Sarah Jones and farm manager"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Auto-filled with the vet name when a registered contact is selected</p>
                </div>
              </div>

              {/* ── Section 5: Outcome & Schedule ── */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outcome & Schedule</h3>

                <div>
                  <Label className="mb-2 block">Overall Outcome</Label>
                  <div className="flex gap-2 flex-wrap">
                    {OUTCOMES.map(o => {
                      const Icon = o.icon;
                      const selected = form.outcome === o.key;
                      return (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => f("outcome", selected ? null : o.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                            selected ? `${o.bg} ${o.colour} border-current` : "border-gray-200 text-muted-foreground hover:border-gray-400"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Label>Next Review Due</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Auto-calculated to 12 months from the review date. Appears in the Week Ahead
                            Planner as an upcoming task reminder. Edit to override.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      type="date"
                      value={form.nextReviewDue ?? ""}
                      onChange={e => { f("nextReviewDue", e.target.value); setNextReviewAutoSet(false); }}
                    />
                    {nextReviewAutoSet && (
                      <p className="text-xs text-muted-foreground mt-1">Auto-set to 12 months from review date</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Label>AHWR Reference</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            The reference number on the vet's report, or the RPA action reference assigned
                            when you confirm the review under your SFI agreement. This is not an RPA claim
                            number — it is your own record-keeping reference for this review.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      value={form.ahwrRef ?? ""}
                      onChange={e => f("ahwrRef", e.target.value)}
                      placeholder="Vet report or RPA action reference"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 6: Attachments (edit only) ── */}
              {editing && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />Vet Report & Attachments
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Attach the vet's written report (paper scan, emailed PDF, or photo). Accepted formats: PDF, images, Word documents.
                  </p>
                  <RecordAttachments farmId={farmId!} recordType="ahwr_review" recordId={editing.id} />
                </div>
              )}

              {!editing && (
                <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  Save this record first, then re-open it to attach the vet's written report or PDF.
                </div>
              )}

              {/* ── Notes ── */}
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={form.notes ?? ""}
                  onChange={e => f("notes", e.target.value)}
                  rows={2}
                  placeholder="Additional observations or context"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={saveMut.isPending}>
                  {saveMut.isPending ? "Saving…" : editing ? "Update Review" : "Save Review"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
