import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge, Link,
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
import { sanitiseCsvCell, buildViticultureUnlinkedWarning } from "@/lib/csv";
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
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, printPhenology, FsaCompletenessBar, useFarmMeta, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";
import { FrostEventsSection } from "./FrostEventsSection";

type Phenology = Record<string, unknown>;

type WinegbSurveyKey = "bud_burst" | "frost_damage" | "flowering" | "veraison" | "harvest";

// Maps BBCH stage codes to WineGB's five seasonal vineyard surveys.
// surveyKey matches the WinegbSurveyKey union (null = no matching checklist entry).
const WINEGB_SURVEY_MAP: Record<string, { surveyName: string; label: string; surveyKey: WinegbSurveyKey | null }> = {
  "05": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "07": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "09": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "11": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "13": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "15": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "53": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "55": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "57": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "60": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "65": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "68": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "71": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "73": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "75": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "77": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "81": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "83": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "85": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "89": { surveyName: "Harvest Survey", label: "harvest", surveyKey: "harvest" },
};

// ─── WineGB Submissions Panel ──────────────────────────────────────────────────

interface WinegbSurvey {
  key: WinegbSurveyKey;
  label: string;
  /** Rough UK season months (1-based) when this survey is typically collected */
  months: number[];
}

const WINEGB_SURVEYS: WinegbSurvey[] = [
  { key: "bud_burst",    label: "Bud Burst",    months: [3, 4]    },
  { key: "frost_damage", label: "Frost Damage",  months: [3, 4, 5] },
  { key: "flowering",    label: "Flowering",     months: [6, 7]    },
  { key: "veraison",     label: "Véraison",      months: [8, 9]    },
  { key: "harvest",      label: "Harvest",        months: [9, 10]   },
];

function WinegbSubmissionsPanel({ farmId, seasonYear }: { farmId: number; seasonYear: number }) {
  const queryClient = useQueryClient();
  const currentMonth = new Date().getMonth() + 1; // 1-based
  const isCurrentSeason = seasonYear === new Date().getFullYear();

  const { data, isLoading } = useQuery<{ submissions: Record<string, { submitted: boolean; submittedAt: string | null }> }>({
    queryKey: ["winegb-submissions", farmId, seasonYear],
    queryFn: () =>
      fetch(api(`farms/${farmId}/winegb-submissions?year=${seasonYear}`), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("Failed to load"); return r.json(); }),
    enabled: !!farmId,
    staleTime: 60_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ key, submitted }: { key: WinegbSurveyKey; submitted: boolean }) => {
      const r = await fetch(api(`farms/${farmId}/winegb-submissions/${key}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitted, year: seasonYear }),
      });
      if (!r.ok) throw new Error("Failed to save");
      return r.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["winegb-submissions", farmId, seasonYear] });
    },
  });

  const submissions = data?.submissions ?? {};

  const allDone = WINEGB_SURVEYS.every(s => submissions[s.key]?.submitted);
  const doneCount = WINEGB_SURVEYS.filter(s => submissions[s.key]?.submitted).length;

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3.5 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold text-emerald-900">WineGB Seasonal Surveys — {seasonYear}</span>
          {allDone && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3" /> All submitted
            </span>
          )}
          {!allDone && doneCount > 0 && (
            <span className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5">
              {doneCount}/{WINEGB_SURVEYS.length} submitted
            </span>
          )}
        </div>
        <a
          href="https://winegb.co.uk/production/vineyards-wineries/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-700 underline underline-offset-2 hover:text-emerald-900 shrink-0"
        >
          Submit to WineGB →
        </a>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-emerald-700 py-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
          {WINEGB_SURVEYS.map(survey => {
            const state = submissions[survey.key];
            const isSubmitted = state?.submitted ?? false;
            const isInSeason = isCurrentSeason && survey.months.includes(currentMonth);
            const isOverdue = !isSubmitted && isCurrentSeason && currentMonth > Math.max(...survey.months);
            const isPending = toggleMutation.isPending && toggleMutation.variables?.key === survey.key;

            return (
              <button
                key={survey.key}
                type="button"
                disabled={isPending}
                onClick={() => toggleMutation.mutate({ key: survey.key, submitted: !isSubmitted })}
                className={[
                  "flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors",
                  isSubmitted
                    ? "border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                    : isOverdue
                    ? "border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
                    : isInSeason
                    ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50",
                ].join(" ")}
                aria-label={`${isSubmitted ? "Unmark" : "Mark"} ${survey.label} as submitted`}
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : isSubmitted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                ) : isOverdue ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ) : isInSeason ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-sm border border-emerald-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="font-medium leading-tight">{survey.label}</span>
                  {isOverdue && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-red-100 border border-red-200 px-1.5 py-px text-[10px] font-semibold text-red-700 leading-none">
                      Overdue
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
      {(() => {
        const overdueCount = isCurrentSeason
          ? WINEGB_SURVEYS.filter(s => !submissions[s.key]?.submitted && currentMonth > Math.max(...s.months)).length
          : 0;
        const inSeasonCount = isCurrentSeason
          ? WINEGB_SURVEYS.filter(s => !submissions[s.key]?.submitted && s.months.includes(currentMonth)).length
          : 0;
        return (
          <p className="mt-2 text-[11px] text-emerald-700 leading-snug">
            Tick each survey once you've submitted your data to WineGB.
            {isCurrentSeason && !allDone && overdueCount > 0 && inSeasonCount > 0 && " Surveys in red are overdue — their collection window has passed. Surveys in amber are currently in season."}
            {isCurrentSeason && !allDone && overdueCount > 0 && inSeasonCount === 0 && " Surveys marked Overdue had their collection window pass without a submission being recorded."}
            {isCurrentSeason && !allDone && overdueCount === 0 && inSeasonCount > 0 && " Surveys highlighted in amber are currently in season."}
          </p>
        );
      })()}
    </div>
  );
}

export function PhenologyTab({ farmId, blocks, highlightBlockId, onNavigate, requestBulkLink }: { farmId: number; blocks: Record<string, unknown>[]; highlightBlockId?: number; onNavigate?: (tab: string, blockId?: number) => void; requestBulkLink?: boolean }) {
  const { data, isLoading, add, edit, remove } = useCrud<Phenology>(farmId, "vineyard-phenology", "vineyard-phenology");
  const farmName = useFarmName(farmId);
  const { farmRecord: farmMeta } = useFarmMeta(farmId);
  const { displayName } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Phenology | null>(null);
  const [form, setForm] = useState<Phenology>({});
  const [viewing, setViewing] = useState<Phenology | null>(null);
  const [winegbSurveyBanner, setWinegbSurveyBanner] = useState<{ surveyName: string; label: string; surveyKey: WinegbSurveyKey | null; year: number } | null>(null);
  const [dismissedSurveys, setDismissedSurveys] = useState<Set<string>>(new Set());

  // ── localStorage helpers for persisted survey offer ────────────────────────
  type StoredOffer = { surveyName: string; label: string; surveyKey: WinegbSurveyKey; year: number };
  const lsOfferKey = (surveyKey: WinegbSurveyKey, year: number) => `winegb-offer:${farmId}:${surveyKey}:${year}`;

  const writeStoredOffer = (offer: StoredOffer) => {
    try { localStorage.setItem(lsOfferKey(offer.surveyKey, offer.year), JSON.stringify(offer)); } catch { /* storage full */ }
  };
  const clearStoredOffer = (surveyKey: WinegbSurveyKey, year: number) => {
    try { localStorage.removeItem(lsOfferKey(surveyKey, year)); } catch { /* ignore */ }
  };
  const readStoredOffers = (): StoredOffer[] => {
    const prefix = `winegb-offer:${farmId}:`;
    const results: StoredOffer[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          const raw = localStorage.getItem(k);
          if (raw) { try { results.push(JSON.parse(raw) as StoredOffer); } catch { localStorage.removeItem(k ?? ""); } }
        }
      }
    } catch { /* ignore */ }
    return results;
  };
  const [raiseTaskFor, setRaiseTaskFor] = useState<Phenology | null>(null);
  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-phenology", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [blockFilter, setBlockFilter] = usePersistedFilter({ page: "viticulture-phenology", filter: "block", farmId, defaultValue: highlightBlockId ? String(highlightBlockId) : "__all__" });
  const [printBlockFilter, setPrintBlockFilter] = usePersistedFilter({ page: "viticulture-phenology", filter: "print-block", farmId, defaultValue: "__all__" });
  const [bulkLinkOpen, setBulkLinkOpen] = useState(false);
  const [bulkLinks, setBulkLinks] = useState<Record<number, number | null>>({});

  // Sync block filter when navigating from a block card
  useEffect(() => {
    if (highlightBlockId) setBlockFilter(String(highlightBlockId));
  }, [highlightBlockId]);

  // ── Bulk-link ─────────────────────────────────────────────────────────────
  const unlinkedPhenology = useMemo(() => data.filter(r => !r.blockId), [data]);

  const openBulkLink = () => {
    const initial: Record<number, number | null> = {};
    for (const rec of unlinkedPhenology) initial[rec.id as number] = null;
    setBulkLinks(initial);
    setBulkLinkOpen(true);
  };

  // Auto-open bulk-link dialog when navigated from Overview warning bar
  const bulkLinkPending = useRef(false);
  useEffect(() => { if (requestBulkLink) bulkLinkPending.current = true; }, [requestBulkLink]);
  useEffect(() => {
    if (bulkLinkPending.current && !isLoading) {
      bulkLinkPending.current = false;
      openBulkLink();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const bulkLinkMutation = useMutation({
    mutationFn: async (links: Record<number, number | null>) => {
      const toSave = Object.entries(links).filter(([, blockId]) => blockId !== null);
      if (!toSave.length) return 0;
      await Promise.all(
        toSave.map(([id, blockId]) =>
          fetch(api(`farms/${farmId}/vineyard-phenology/${id}`), {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockId }),
          }).then(r => { if (!r.ok) throw new Error("Failed to link record"); return r.json(); })
        )
      );
      return toSave.length;
    },
    onSuccess: async (count) => {
      await queryClient.refetchQueries({ queryKey: ["vineyard-phenology", farmId] });
      setBulkLinkOpen(false);
      toast({ title: `${count} ${count === 1 ? "observation" : "observations"} linked`, description: "Block links saved successfully." });
    },
  });

  const bulkLinkCount = Object.values(bulkLinks).filter(v => v !== null).length;

  // ── Restore persisted survey offer on mount ───────────────────────────────
  // Track the year of a stored offer so we can query submissions to verify it
  const [storedOfferYear, setStoredOfferYear] = useState<number | null>(null);

  useEffect(() => {
    const offers = readStoredOffers();
    if (!offers.length) return;
    // Pick the offer with the most recent year
    const offer = offers.sort((a, b) => b.year - a.year)[0];
    setStoredOfferYear(offer.year);
    // Show the banner immediately; the submission-check effect below will suppress it if already done
    setWinegbSurveyBanner(offer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  // Query submissions for the stored offer's year so we can clear the banner if already submitted
  const { data: storedOfferSubmissions } = useQuery<{ submissions: Record<string, { submitted: boolean; submittedAt: string | null }> }>({
    queryKey: ["winegb-submissions", farmId, storedOfferYear ?? 0],
    queryFn: () =>
      fetch(api(`farms/${farmId}/winegb-submissions?year=${storedOfferYear}`), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("Failed to load"); return r.json(); }),
    enabled: !!farmId && storedOfferYear !== null,
    staleTime: 60_000,
  });

  // Once submissions load, clear the banner (and localStorage) if already submitted
  useEffect(() => {
    if (!storedOfferSubmissions || !winegbSurveyBanner?.surveyKey) return;
    const alreadySubmitted = storedOfferSubmissions.submissions?.[winegbSurveyBanner.surveyKey]?.submitted ?? false;
    if (alreadySubmitted) {
      clearStoredOffer(winegbSurveyBanner.surveyKey, winegbSurveyBanner.year);
      setWinegbSurveyBanner(null);
      setStoredOfferYear(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedOfferSubmissions]);

  // ── WineGB toggle mutation (year comes from the saved observation's date) ─────
  const winegbToggleMutation = useMutation({
    mutationFn: async ({ key, year }: { key: WinegbSurveyKey; year: number }) => {
      const r = await fetch(api(`farms/${farmId}/winegb-submissions/${key}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitted: true, year }),
      });
      if (!r.ok) throw new Error("Failed to save");
      return r.json();
    },
    onSuccess: (_, { key, year }) => {
      void queryClient.invalidateQueries({ queryKey: ["winegb-submissions", farmId, year] });
      const survey = WINEGB_SURVEYS.find(s => s.key === key);
      toast({ title: `${survey?.label ?? "Survey"} marked as submitted`, description: "WineGB survey checklist updated." });
      clearStoredOffer(key, year);
      setWinegbSurveyBanner(null);
    },
  });

  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const openAdd = () => { setForm({ observationDate: today, observer: displayName ?? "" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Phenology) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    const stage = String(form.bbchStage ?? "");
    const survey = WINEGB_SURVEY_MAP[stage];
    if (survey && !dismissedSurveys.has(survey.surveyName)) {
      // Derive the survey year from the observation's own date, not the table filter
      const obsYear = form.observationDate
        ? new Date(form.observationDate as string).getFullYear()
        : new Date().getFullYear();
      if (survey.surveyKey) {
        // Survey has a checklist entry — offer to tick it, unless already submitted for this year
        type SubmissionsPayload = { submissions: Record<string, { submitted: boolean; submittedAt: string | null }> };
        const cached = queryClient.getQueryData<SubmissionsPayload>(["winegb-submissions", farmId, obsYear]);
        const alreadySubmitted = cached?.submissions?.[survey.surveyKey]?.submitted ?? false;
        if (!alreadySubmitted) {
          const offer = { ...survey, year: obsYear } as StoredOffer;
          writeStoredOffer(offer);
          setWinegbSurveyBanner(offer);
        }
      } else {
        // No checklist key (e.g. Fruit Set) — show the external-link prompt instead
        setWinegbSurveyBanner({ ...survey, year: obsYear });
      }
    }
    setOpen(false);
  };

  const phenologyYears = Array.from(new Set(data.map(r => new Date(r.observationDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!phenologyYears.includes(new Date().getFullYear())) phenologyYears.unshift(new Date().getFullYear());
  const yearFiltered = yearFilter === "all" ? data : data.filter(r => new Date(r.observationDate as string).getFullYear() === Number(yearFilter));
  const filteredPhenology = blockFilter === "__all__" ? yearFiltered : yearFiltered.filter(r => String(r.blockId) === blockFilter);
  const printRows = printBlockFilter === "__all__" ? yearFiltered : yearFiltered.filter(r => String(r.blockId) === printBlockFilter);
  const highlightedBlockName = highlightBlockId ? String(blocks.find(b => b.id === highlightBlockId)?.blockName ?? highlightBlockId) : null;

  const csvCols = [
    { key: "observationDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.observationDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "blockLinked", label: "Block Linked", fmt: (r: Record<string, unknown>) => r.blockId ? "Yes" : "No" },
    { key: "bbchStage", label: "BBCH Stage" },
    { key: "bbchDescription", label: "Description" },
    { key: "percentageReached", label: "% Reached" },
    { key: "observer", label: "Observer" },
    { key: "temperatureC", label: "Temp (°C)" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {/* WineGB seasonal survey prompt */}
      {winegbSurveyBanner && (
        <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <Globe className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
          <div className="flex-1 min-w-0">
            <span className="font-medium">WineGB {winegbSurveyBanner.surveyName}</span>
            {winegbSurveyBanner.surveyKey ? (
              <span>
                {" "}— Have you submitted your {winegbSurveyBanner.label} data to WineGB? Mark it as done to keep your checklist up to date.
              </span>
            ) : (
              <span>
                {" "}— WineGB are collecting UK-wide data on {winegbSurveyBanner.label} this season. Submit your figures to their{" "}
                <a href="https://winegb.co.uk/production/vineyards-wineries/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-medium hover:text-emerald-900">
                  Vineyard Survey →
                </a>
              </span>
            )}
            {winegbSurveyBanner.surveyKey && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  disabled={winegbToggleMutation.isPending}
                  onClick={() => winegbToggleMutation.mutate({ key: winegbSurveyBanner.surveyKey!, year: winegbSurveyBanner.year })}
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                >
                  {winegbToggleMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Mark {winegbSurveyBanner.label} survey as submitted
                </button>
                <a
                  href="https://winegb.co.uk/production/vineyards-wineries/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                >
                  Submit to WineGB first →
                </a>
              </div>
            )}
          </div>
          <button
            type="button"
            className="shrink-0 text-emerald-500 hover:text-emerald-800"
            onClick={() => {
              // Add to session-only dismissed set so the banner doesn't re-show within this visit.
              // The localStorage entry is intentionally kept so the offer reappears on the next page load.
              setDismissedSurveys(prev => new Set(prev).add(winegbSurveyBanner.surveyName));
              setWinegbSurveyBanner(null);
            }}
            aria-label="Dismiss"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Block highlight banner */}
      {highlightBlockId && blockFilter === String(highlightBlockId) && highlightedBlockName && (
        <div className="flex items-center gap-2.5 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
          <Leaf className="w-4 h-4 shrink-0 text-purple-600" />
          <span>Showing phenology records for <span className="font-semibold">{highlightedBlockName}</span></span>
          <button type="button" className="ml-auto text-xs underline underline-offset-2 hover:text-purple-900" onClick={() => setBlockFilter("__all__")}>Show all blocks</button>
        </div>
      )}

      {/* WineGB Submissions Panel — year follows the table year filter for display */}
      <WinegbSubmissionsPanel farmId={farmId} seasonYear={yearFilter === "all" ? new Date().getFullYear() : Number(yearFilter)} />

      {/* FSA / APPA registration pre-flight check */}
      <FsaCompletenessBar farmId={farmId} />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Phenology (BBCH Growth Stages)</p>
          <p className="text-xs text-muted-foreground">Log key growth stages using the BBCH scale. Used to time spray applications, canopy operations, and vintner decisions.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className={`w-36 h-8 text-xs ${blockFilter !== "__all__" ? "border-purple-400 text-purple-700" : ""}`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All blocks</SelectItem>
              {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {phenologyYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          {unlinkedPhenology.length > 0 && (
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={openBulkLink}>
              <Link className="w-4 h-4 mr-1" />Link unlinked records ({unlinkedPhenology.length})
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => {
            exportCSV(filteredPhenology, "phenology.csv", csvCols, buildViticultureUnlinkedWarning(filteredPhenology));
          }} disabled={!filteredPhenology.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Select value={printBlockFilter} onValueChange={setPrintBlockFilter}>
            <SelectTrigger className={`w-36 h-8 text-xs ${printBlockFilter !== "__all__" ? "border-blue-400 text-blue-700" : ""}`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Print: all blocks</SelectItem>
              {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>Print: {String(b.blockName)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => { if (printRows.some(r => !r.blockId)) { setPrintConfirmOpen(true); } else { void printPhenology(printRows, farmName ?? "", blocks, farmMeta, yearFilter !== "all" ? yearFilter : undefined); } }} disabled={!printRows.length}><Printer className="w-4 h-4 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Observation</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "observationDate", label: "Date", render: r => fmtDate(r.observationDate) },
          { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
          { key: "bbchStage", label: "BBCH Stage" },
          { key: "bbchDescription", label: "Description" },
          { key: "percentageReached", label: "% Reached", render: r => r.percentageReached ? `${r.percentageReached}%` : "—" },
          { key: "observer", label: "Observer" },
          { key: "temperatureC", label: "Temp (°C)", render: r => fmtNum(r.temperatureC, 1) },
        ]}
        rows={filteredPhenology}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)} deleteMutation={remove}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Phenology Observation</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Observation Date" value={fmtDate(viewing.observationDate)} />
              <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
              <ViewField label="BBCH Stage" value={fmt(viewing.bbchStage)} />
              <ViewField label="% Reached" value={viewing.percentageReached ? `${viewing.percentageReached}%` : "—"} />
              <div className="col-span-2"><ViewField label="Description" value={fmt(viewing.bbchDescription)} /></div>
              <ViewField label="Observer" value={fmt(viewing.observer)} />
              <ViewField label="Temperature (°C)" value={fmtNum(viewing.temperatureC, 1)} />
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            {onNavigate && (
              <>
                <Button
                  variant="outline"
                  className="text-orange-700 border-orange-200 hover:bg-orange-50"
                  onClick={() => { onNavigate("operations", viewing?.blockId as number | undefined); setViewing(null); }}
                >
                  <Wrench className="w-4 h-4 mr-1" />Operations
                </Button>
                <Button
                  variant="outline"
                  className="text-purple-700 border-purple-200 hover:bg-purple-50"
                  onClick={() => { onNavigate("harvest", viewing?.blockId as number | undefined); setViewing(null); }}
                >
                  <Grape className="w-4 h-4 mr-1" />Harvest
                </Button>
              </>
            )}
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Phenology — BBCH ${fmt(raiseTaskFor.bbchStage)} · ${fmt(blockName(raiseTaskFor.blockId))}`}
          defaultDescription={`Date: ${fmtDate(raiseTaskFor.observationDate)} · ${fmt(raiseTaskFor.bbchDescription)} · ${raiseTaskFor.percentageReached ? `${raiseTaskFor.percentageReached}% reached` : ""}`}
          module="Viticulture"
        />
      )}

      {/* Bulk-link Dialog */}
      <Dialog open={bulkLinkOpen} onOpenChange={o => { if (!o) { setBulkLinkOpen(false); bulkLinkMutation.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link unlinked phenology observations to blocks</DialogTitle>
            <DialogDescription>
              Assign each unlinked observation to a vineyard block. Observations already linked to a block are not shown.
            </DialogDescription>
          </DialogHeader>
          {unlinkedPhenology.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All observations are already linked to blocks.</p>
          ) : (
            <div className="space-y-3">
              {unlinkedPhenology.map(rec => {
                const recId = rec.id as number;
                return (
                  <div key={recId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fmtDate(rec.observationDate)} — {fmt(rec.bbchStage)} {rec.bbchDescription ? `· ${fmt(rec.bbchDescription)}` : ""}</p>
                      {!!rec.observer && <p className="text-xs text-muted-foreground">{fmt(rec.observer)}</p>}
                    </div>
                    <Select
                      value={bulkLinks[recId] !== null && bulkLinks[recId] !== undefined ? String(bulkLinks[recId]) : "__none__"}
                      onValueChange={v => setBulkLinks(prev => ({ ...prev, [recId]: v === "__none__" ? null : Number(v) }))}
                    >
                      <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Select block…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— No block —</SelectItem>
                        {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
          <DialogMutationError mutation={bulkLinkMutation} message="Some links could not be saved. Please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkLinkOpen(false)}>Cancel</Button>
            <Button
              onClick={() => bulkLinkMutation.mutate(bulkLinks)}
              disabled={bulkLinkCount === 0 || bulkLinkMutation.isPending}
            >
              {bulkLinkMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Save {bulkLinkCount > 0 ? `${bulkLinkCount} link${bulkLinkCount === 1 ? "" : "s"}` : "links"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print pre-flight confirm */}
      {(() => {
        const unlinkedInView = printRows.filter(r => !r.blockId);
        return (
          <Dialog open={printConfirmOpen} onOpenChange={o => { if (!o) setPrintConfirmOpen(false); }}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  {unlinkedInView.length} {unlinkedInView.length === 1 ? "record isn't" : "records aren't"} linked to a block
                </DialogTitle>
                <DialogDescription>
                  {unlinkedInView.length === 1 ? "This record" : "These records"} will appear without a block name in the printed report. Link {unlinkedInView.length === 1 ? "it" : "them"} first, or print anyway.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => { setPrintConfirmOpen(false); openBulkLink(); }}>
                  <Link className="w-4 h-4 mr-1" />Link first
                </Button>
                <Button onClick={() => { setPrintConfirmOpen(false); void printPhenology(printRows, farmName ?? "", blocks, farmMeta, yearFilter !== "all" ? yearFilter : undefined); }}>
                  <Printer className="w-4 h-4 mr-1" />Print anyway
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Frost Events — seasonal risk log */}
      <FrostEventsSection farmId={farmId} blocks={blocks} />

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); add.reset(); edit.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Phenology Observation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" max={today} value={String(form.observationDate ?? "")} onChange={e => sf("observationDate", e.target.value)} /></div>
              <div><Label>Block</Label>
                <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="All blocks…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>BBCH Stage *</Label>
              <Select value={String(form.bbchStage ?? "")} onValueChange={v => { const s = BBCH_STAGES.find(x => x.code === v); sf("bbchStage", v); if (s) sf("bbchDescription", s.desc); }}>
                <SelectTrigger><SelectValue placeholder="Select BBCH stage…" /></SelectTrigger>
                <SelectContent>
                  {BBCH_STAGES.map(s => <SelectItem key={s.code} value={s.code}>{s.code} — {s.desc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={String(form.bbchDescription ?? "")} onChange={e => sf("bbchDescription", e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>% Reached</Label><Input type="number" min="0" max="100" value={String(form.percentageReached ?? "")} onChange={e => sf("percentageReached", e.target.value)} /></div>
              <div><Label>Observer</Label><StaffSelect value={String(form.observer ?? "")} onChange={v => sf("observer", v)} staffNames={staffNames} loading={staffLoading} /></div>
              <div><Label>Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureC ?? "")} onChange={e => sf("temperatureC", e.target.value)} /></div>
            </div>
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

// ─── Operations ────────────────────────────────────────────────────────────────
