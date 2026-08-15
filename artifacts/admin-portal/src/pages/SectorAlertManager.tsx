import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { api, type SectorAlertEpisode } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import {
  Bird, AlertTriangle, CheckCircle2, ChevronRight,
  Save, X, Loader2, AlertCircle, History, Clock, CalendarDays,
} from "lucide-react";

// ─── Sector definitions ───────────────────────────────────────────────────────

const SECTORS = [
  { id: "hpai",         label: "HPAI",         sub: "Avian Influenza",    colour: "red" },
  { id: "beef",         label: "Beef",          sub: "Cattle Disease",     colour: "orange" },
  { id: "dairy",        label: "Dairy",         sub: "Herd Disease",       colour: "blue" },
  { id: "sheep",        label: "Sheep",         sub: "Sheep Disease",      colour: "lime" },
  { id: "goat",         label: "Goat",          sub: "Goat Disease",       colour: "teal" },
  { id: "pig",          label: "Pig",           sub: "Pig Disease",        colour: "pink" },
  { id: "arable",       label: "Arable",        sub: "Crop Health",        colour: "amber" },
  { id: "horticulture", label: "Horticulture",  sub: "Plant Health",       colour: "green" },
  { id: "viticulture",  label: "Viticulture",   sub: "Vine Disease",       colour: "purple" },
] as const;

type SectorId = typeof SECTORS[number]["id"];

const LEVELS = [
  { value: "precautionary", label: "Precautionary", colour: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "regional",      label: "Regional",      colour: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "national",      label: "National",      colour: "bg-red-100 text-red-800 border-red-200" },
];

const COLOUR_MAP: Record<string, { dot: string; badge: string; border: string; bg: string; ring: string }> = {
  red:    { dot: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200",       border: "border-red-300",    bg: "bg-red-50",    ring: "ring-red-200" },
  orange: { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700 border-orange-200", border: "border-orange-300", bg: "bg-orange-50", ring: "ring-orange-200" },
  blue:   { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 border-blue-200",    border: "border-blue-300",   bg: "bg-blue-50",   ring: "ring-blue-200" },
  lime:   { dot: "bg-lime-500",   badge: "bg-lime-100 text-lime-700 border-lime-200",    border: "border-lime-300",   bg: "bg-lime-50",   ring: "ring-lime-200" },
  teal:   { dot: "bg-teal-500",   badge: "bg-teal-100 text-teal-700 border-teal-200",    border: "border-teal-300",   bg: "bg-teal-50",   ring: "ring-teal-200" },
  pink:   { dot: "bg-pink-500",   badge: "bg-pink-100 text-pink-700 border-pink-200",    border: "border-pink-300",   bg: "bg-pink-50",   ring: "ring-pink-200" },
  amber:  { dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700 border-amber-200", border: "border-amber-300",  bg: "bg-amber-50",  ring: "ring-amber-200" },
  green:  { dot: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-200", border: "border-green-300",  bg: "bg-green-50",  ring: "ring-green-200" },
  purple: { dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700 border-purple-200", border: "border-purple-300", bg: "bg-purple-50", ring: "ring-purple-200" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDuration(from: string, to?: string | null) {
  const start = new Date(from).getTime();
  const end   = to ? new Date(to).getTime() : Date.now();
  const mins  = Math.floor((end - start) / 60000);
  if (mins < 60)   return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  const days = Math.floor(mins / 1440);
  const hrs  = Math.floor((mins % 1440) / 60);
  return hrs > 0 ? `${days}d ${hrs}h` : `${days}d`;
}

// ─── Draft form state ─────────────────────────────────────────────────────────

interface DraftState {
  level: string;
  message: string;
  date: string;
  counties: string;
}

function defaultDraft(): DraftState {
  return {
    level: "precautionary",
    message: "",
    date: new Date().toISOString().slice(0, 10),
    counties: "",
  };
}

function episodeToDraft(ep: SectorAlertEpisode): DraftState {
  return {
    level:    ep.level,
    message:  ep.message,
    date:     ep.issued_at.slice(0, 10),
    counties: ep.counties,
  };
}

// ─── End-alert dialog ─────────────────────────────────────────────────────────

function EndAlertDialog({
  sectorLabel, onConfirm, onCancel, loading, error,
}: {
  sectorLabel: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">End {sectorLabel} Alert</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              This will clear the dashboard banner and queue an "all clear" SMS to subscribed farms. Please record why the alert is being lifted.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Reason for ending alert
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">(required)</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. APHA has lifted restrictions. No further cases detected in the affected area."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            autoFocus
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {loading ? "Ending alert…" : "End alert & notify farms"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sector tab ───────────────────────────────────────────────────────────────

function SectorTab({
  sector, activeEpisode, selected, onClick,
}: {
  sector: typeof SECTORS[number];
  activeEpisode: SectorAlertEpisode | null;
  selected: boolean;
  onClick: () => void;
}) {
  const c = COLOUR_MAP[sector.colour];
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        selected ? "bg-foreground text-background" : "hover:bg-muted"
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeEpisode ? c.dot : "bg-muted-foreground/30"}`} />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium leading-tight">{sector.label}</span>
        <span className={`block text-xs leading-tight ${selected ? "text-background/60" : "text-muted-foreground"}`}>{sector.sub}</span>
      </span>
      {activeEpisode && (
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${selected ? "bg-background/20 text-background" : `${c.badge} border`}`}>
          LIVE
        </span>
      )}
      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selected ? "text-background/60" : "text-muted-foreground"}`} />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SectorAlertManager() {
  const [episodes, setEpisodes]   = useState<SectorAlertEpisode[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected]   = useState<SectorId>("hpai");
  const [drafts, setDrafts]       = useState<Record<string, DraftState>>({});
  const [issuing, setIssuing]     = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [savedAt, setSavedAt]     = useState<string | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [ending, setEnding]       = useState(false);
  const [endError, setEndError]   = useState<string | null>(null);
  const secret = getSecret()!;

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    api.getSectorAlertEpisodes(undefined, false, secret)
      .then(d => setEpisodes(d.episodes))
      .catch(e => setLoadError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [secret]);

  useEffect(() => { load(); }, [load]);

  // Active episode for the currently selected sector
  const activeEpisode = episodes.find(e => e.sector === selected && !e.ended_at) ?? null;

  // Active episodes by sector (for sidebar dots)
  const activeBySecId = Object.fromEntries(
    SECTORS.map(s => [s.id, episodes.find(e => e.sector === s.id && !e.ended_at) ?? null])
  );

  // Draft for selected sector — seed from active episode if present
  const draft = drafts[selected] ?? (activeEpisode ? episodeToDraft(activeEpisode) : defaultDraft());
  function setDraft(d: DraftState) { setDrafts(prev => ({ ...prev, [selected]: d })); }

  const sector = SECTORS.find(s => s.id === selected)!;
  const c = COLOUR_MAP[sector.colour];

  async function handleIssue() {
    setIssuing(true);
    setIssueError(null);
    try {
      await api.createSectorAlertEpisode(
        { sector: selected, level: draft.level, message: draft.message, date: draft.date, counties: draft.counties },
        secret,
      );
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDrafts(prev => ({ ...prev, [selected]: defaultDraft() }));
      load();
    } catch (e: unknown) {
      setIssueError(e instanceof Error ? e.message : "Failed to issue alert");
    } finally {
      setIssuing(false);
    }
  }

  async function handleEnd(reason: string) {
    if (!activeEpisode) return;
    setEnding(true);
    setEndError(null);
    try {
      await api.endSectorAlertEpisode(activeEpisode.id, reason, secret);
      setShowEndDialog(false);
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDrafts(prev => ({ ...prev, [selected]: defaultDraft() }));
      load();
    } catch (e: unknown) {
      setEndError(e instanceof Error ? e.message : "Failed to end alert");
    } finally {
      setEnding(false);
    }
  }

  const activeSectors = SECTORS.filter(s => !!activeBySecId[s.id]);

  return (
    <>
      {showEndDialog && (
        <EndAlertDialog
          sectorLabel={`${sector.label} — ${sector.sub}`}
          onConfirm={handleEnd}
          onCancel={() => { setShowEndDialog(false); setEndError(null); }}
          loading={ending}
          error={endError}
        />
      )}

      <div className="p-8 max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sector Alert Manager</h1>
              <p className="text-sm text-muted-foreground">
                Issue, update, or resolve biosecurity alerts for any sector. Each alert is recorded as an episode with a full lifecycle.
              </p>
            </div>
          </div>
          <Link
            href="/hpai-alert-log"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <History className="w-4 h-4" />
            View audit log
          </Link>
        </div>

        {/* Live summary bar */}
        {!loading && activeSectors.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mr-1">Live now:</span>
            {activeSectors.map(s => {
              const ep = activeBySecId[s.id]!;
              const sc = COLOUR_MAP[s.colour];
              const lvlLabel = LEVELS.find(l => l.value === ep.level)?.label ?? ep.level;
              return (
                <button
                  key={s.id}
                  onClick={() => { setSavedAt(null); setIssueError(null); setSelected(s.id as SectorId); }}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {s.label} — {lvlLabel}
                  <span className="font-normal opacity-70">· {fmtDuration(ep.issued_at)}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-20 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}
        {loadError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {loadError}
          </div>
        )}

        {!loading && !loadError && (
          <div className="flex gap-6">

            {/* Sector selector */}
            <div className="w-52 shrink-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2">Sectors</p>
              {SECTORS.map(s => (
                <SectorTab
                  key={s.id}
                  sector={s}
                  activeEpisode={activeBySecId[s.id]}
                  selected={selected === s.id}
                  onClick={() => { setSavedAt(null); setIssueError(null); setSelected(s.id as SectorId); }}
                />
              ))}
            </div>

            {/* Editor panel */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Panel header — current episode status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-foreground">{sector.label} — {sector.sub}</h2>
                    {activeEpisode ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${c.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        Alert live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        <CheckCircle2 className="w-3 h-3" /> No active alert
                      </span>
                    )}
                  </div>
                  {savedAt && <p className="text-xs text-green-600 mt-0.5">✓ Saved at {savedAt}</p>}
                </div>

                {/* End alert button — only shown when active */}
                {activeEpisode && (
                  <button
                    onClick={() => { setEndError(null); setShowEndDialog(true); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    End alert
                  </button>
                )}
              </div>

              {/* Active episode info card */}
              {activeEpisode && (
                <div className={`rounded-xl border-2 ${c.border} ${c.bg} p-4 space-y-2`}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">Current episode</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Issued</span>
                      <span className="font-medium text-foreground">{fmtDateTime(activeEpisode.issued_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">{fmtDuration(activeEpisode.issued_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Level</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${LEVELS.find(l => l.value === activeEpisode.level)?.colour ?? ""}`}>
                        {LEVELS.find(l => l.value === activeEpisode.level)?.label ?? activeEpisode.level}
                      </span>
                    </div>
                    {activeEpisode.counties && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Counties</span>
                        <span className="font-medium text-foreground text-xs">{activeEpisode.counties}</span>
                      </div>
                    )}
                    {!activeEpisode.counties && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Scope</span>
                        <span className="font-medium text-foreground">National</span>
                      </div>
                    )}
                  </div>
                  {activeEpisode.message && (
                    <p className="text-sm text-foreground/80 border-t border-current/10 pt-2 mt-2 italic">
                      "{activeEpisode.message}"
                    </p>
                  )}
                </div>
              )}

              {/* Draft form — for issuing a NEW alert (hidden while one is active) */}
              {!activeEpisode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Alert level</label>
                    <div className="flex gap-2 flex-wrap">
                      {LEVELS.map(l => (
                        <button
                          key={l.value}
                          onClick={() => setDraft({ ...draft, level: l.value })}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                            draft.level === l.value
                              ? `${l.colour} border-current`
                              : "bg-card border-border text-muted-foreground hover:border-foreground/40"
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Alert date</label>
                    <input
                      type="date"
                      value={draft.date}
                      onChange={e => setDraft({ ...draft, date: e.target.value })}
                      className="w-48 rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Alert message
                      <span className="ml-2 text-xs text-muted-foreground font-normal">Shown in the dashboard banner</span>
                    </label>
                    <textarea
                      rows={4}
                      value={draft.message}
                      onChange={e => setDraft({ ...draft, message: e.target.value })}
                      placeholder={`e.g. A ${sector.label.toLowerCase()} alert has been issued. Please check APHA guidance and review your biosecurity measures…`}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Restrict to counties
                      <span className="ml-2 text-xs text-muted-foreground font-normal">Leave blank for national</span>
                    </label>
                    <input
                      type="text"
                      value={draft.counties}
                      onChange={e => setDraft({ ...draft, counties: e.target.value })}
                      placeholder="e.g. Norfolk,Suffolk,Cambridgeshire"
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Comma-separated. Leave blank to show to all farms in the sector regardless of location.</p>
                  </div>

                  {issueError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {issueError}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-1 border-t border-border">
                    <button
                      onClick={handleIssue}
                      disabled={issuing || !draft.message.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {issuing ? "Issuing alert…" : "Issue alert"}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      This creates a new alert episode, updates the dashboard banner, and is recorded in the audit log.
                    </span>
                  </div>
                </>
              )}

              {/* When active, show a prompt to use the End alert button */}
              {activeEpisode && (
                <div className="p-4 bg-muted/40 rounded-lg border border-border text-sm text-muted-foreground">
                  <p>
                    To issue a <strong className="text-foreground">replacement alert</strong> (e.g. escalating from Regional to National),
                    first end this episode using the <strong className="text-foreground">End alert</strong> button above,
                    then issue a new one. The original episode is preserved in the audit log with its full lifecycle.
                  </p>
                </div>
              )}

              {/* How it works */}
              <div className="p-4 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground space-y-1">
                <p><strong className="text-foreground">How it works:</strong> Each alert is stored as an <em>episode</em> — a permanent record with an issued date/time, level, message, and county scope. Ending an alert records the reason and timestamp, then queues an "all clear" SMS to farms that received the original alert. The audit log shows the complete lifecycle of every episode.</p>
              </div>

            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <Bird className="w-3.5 h-3.5" />
          All alert changes are logged permanently in the Sector Alert Log.
        </div>
      </div>
    </>
  );
}
