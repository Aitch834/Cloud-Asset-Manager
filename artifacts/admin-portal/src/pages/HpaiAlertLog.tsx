import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api, type SectorAlertHistoryEntry, type SectorAlertEpisode } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { Bird, AlertTriangle, CheckCircle2, MinusCircle, AlertCircle, Clock, CalendarDays, ChevronRight } from "lucide-react";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const SECTOR_META: Record<string, { label: string; colour: string }> = {
  hpai:         { label: "HPAI (Avian Influenza)",       colour: "bg-red-100 text-red-700 border-red-200" },
  arable:       { label: "Arable / Crop Health",         colour: "bg-amber-100 text-amber-700 border-amber-200" },
  horticulture: { label: "Horticulture / Plant Health",  colour: "bg-green-100 text-green-700 border-green-200" },
  viticulture:  { label: "Viticulture / Vine Disease",   colour: "bg-purple-100 text-purple-700 border-purple-200" },
  beef:         { label: "Beef / Cattle Disease",        colour: "bg-orange-100 text-orange-700 border-orange-200" },
  dairy:        { label: "Dairy Herd Disease",           colour: "bg-blue-100 text-blue-700 border-blue-200" },
  pig:          { label: "Pig Disease",                  colour: "bg-pink-100 text-pink-700 border-pink-200" },
  sheep:        { label: "Sheep Disease",                colour: "bg-lime-100 text-lime-700 border-lime-200" },
  goat:         { label: "Goat Disease",                 colour: "bg-teal-100 text-teal-700 border-teal-200" },
};

const KEY_LABELS: Record<string, string> = {
  "hpai.alert_active": "Alert active", "hpai.alert_level": "Alert level",
  "hpai.alert_message": "Alert message", "hpai.alert_date": "Alert date", "hpai.alert_counties": "Alert counties",
  "arable.alert_active": "Alert active", "arable.alert_level": "Alert level",
  "arable.alert_message": "Alert message", "arable.alert_date": "Alert date", "arable.alert_counties": "Alert counties",
  "horticulture.alert_active": "Alert active", "horticulture.alert_level": "Alert level",
  "horticulture.alert_message": "Alert message", "horticulture.alert_date": "Alert date", "horticulture.alert_counties": "Alert counties",
  "viticulture.alert_active": "Alert active", "viticulture.alert_level": "Alert level",
  "viticulture.alert_message": "Alert message", "viticulture.alert_date": "Alert date", "viticulture.alert_counties": "Alert counties",
  "beef.alert_active": "Alert active", "beef.alert_level": "Alert level",
  "beef.alert_message": "Alert message", "beef.alert_date": "Alert date", "beef.alert_counties": "Alert counties",
  "dairy.alert_active": "Alert active", "dairy.alert_level": "Alert level",
  "dairy.alert_message": "Alert message", "dairy.alert_date": "Alert date", "dairy.alert_counties": "Alert counties",
  "pig.alert_active": "Alert active", "pig.alert_level": "Alert level",
  "pig.alert_message": "Alert message", "pig.alert_date": "Alert date", "pig.alert_counties": "Alert counties",
  "sheep.alert_active": "Alert active", "sheep.alert_level": "Alert level",
  "sheep.alert_message": "Alert message", "sheep.alert_date": "Alert date", "sheep.alert_counties": "Alert counties",
  "goat.alert_active": "Alert active", "goat.alert_level": "Alert level",
  "goat.alert_message": "Alert message", "goat.alert_date": "Alert date", "goat.alert_counties": "Alert counties",
};

const LEVEL_LABELS: Record<string, { label: string; colour: string }> = {
  precautionary: { label: "Precautionary", colour: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  regional:      { label: "Regional",      colour: "bg-orange-100 text-orange-800 border-orange-200" },
  national:      { label: "National",      colour: "bg-red-100 text-red-800 border-red-200" },
};

const SECTOR_FILTER_OPTIONS = [
  { value: "", label: "All sectors" },
  { value: "hpai", label: "HPAI" },
  { value: "arable", label: "Arable" },
  { value: "horticulture", label: "Horticulture" },
  { value: "viticulture", label: "Viticulture" },
  { value: "beef", label: "Beef" },
  { value: "dairy", label: "Dairy" },
  { value: "pig", label: "Pig" },
  { value: "sheep", label: "Sheep" },
  { value: "goat", label: "Goat" },
];

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short",
  });
}

function fmtDateGroup(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function fmtDuration(from: string, to?: string | null) {
  const ms = (to ? new Date(to).getTime() : Date.now()) - new Date(from).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60)   return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  const days = Math.floor(mins / 1440);
  const hrs  = Math.floor((mins % 1440) / 60);
  return hrs > 0 ? `${days}d ${hrs}h` : `${days}d`;
}

function SectorBadge({ sector }: { sector: string }) {
  const meta = SECTOR_META[sector];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${meta.colour}`}>
      {meta.label}
    </span>
  );
}

function ValuePill({ k, v }: { k: string; v: string | null }) {
  if (v === null) return <span className="italic text-muted-foreground text-xs">cleared</span>;
  if (k.endsWith(".alert_active"))
    return v === "true"
      ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200"><AlertTriangle className="w-3 h-3" />Active</span>
      : <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3" />Inactive</span>;
  if (k.endsWith(".alert_level")) {
    const lvl = LEVEL_LABELS[v];
    return lvl
      ? <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${lvl.colour}`}>{lvl.label}</span>
      : <span className="text-xs font-mono">{v}</span>;
  }
  return <span className="text-xs font-mono text-foreground break-all">{v}</span>;
}

function resolveSector(entry: SectorAlertHistoryEntry) {
  if (entry.action === "hpai_config_change") return "hpai";
  return entry.metadata?.sector ?? "hpai";
}

function ChangeRow({ entry }: { entry: SectorAlertHistoryEntry }) {
  const meta = entry.metadata;
  if (!meta) return null;
  const keyLabel = KEY_LABELS[meta.key] ?? meta.key;
  const isCleared = meta.newValue === null;
  const isSet = meta.oldValue === null;
  const sector = resolveSector(entry);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="mt-0.5 shrink-0">
        {isCleared
          ? <MinusCircle className="w-4 h-4 text-muted-foreground" />
          : isSet
            ? <AlertTriangle className="w-4 h-4 text-amber-500" />
            : <Clock className="w-4 h-4 text-blue-500" />}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <SectorBadge sector={sector} />
          <span className="text-xs font-semibold uppercase tracking-wide">{keyLabel}</span>
          <span className="text-xs text-muted-foreground">
            {isCleared ? "reset to default" : isSet ? "set for the first time" : "updated"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {!isSet && (
            <><ValuePill k={meta.key} v={meta.oldValue} /><span className="text-muted-foreground">→</span></>
          )}
          <ValuePill k={meta.key} v={meta.newValue} />
        </div>
        <p className="text-xs text-muted-foreground">
          {fmtDateTime(entry.createdAt)}<span className="mx-1.5">·</span>
          by <span className="font-mono">{entry.actorUserId}</span>
        </p>
      </div>
    </div>
  );
}

function groupByDay(entries: SectorAlertHistoryEntry[]) {
  const groups: { day: string; items: SectorAlertHistoryEntry[] }[] = [];
  for (const entry of entries) {
    const day = new Date(entry.createdAt).toISOString().slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(entry);
    else groups.push({ day, items: [entry] });
  }
  return groups;
}

// ─── Episode cards ────────────────────────────────────────────────────────────

function EpisodeCard({ ep }: { ep: SectorAlertEpisode }) {
  const meta = SECTOR_META[ep.sector];
  const isOpen = !ep.ended_at;
  const lvl = LEVEL_LABELS[ep.level];

  return (
    <div className={`rounded-xl border px-5 py-4 space-y-3 ${isOpen ? "border-red-200 bg-red-50/50" : "border-border bg-card"}`}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {meta && (
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${meta.colour}`}>
              {meta.label}
            </span>
          )}
          {lvl && (
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${lvl.colour}`}>
              {lvl.label}
            </span>
          )}
          {isOpen && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">#{ep.id}</span>
      </div>

      {/* Message */}
      {ep.message && (
        <p className="text-sm text-foreground/80 italic">"{ep.message}"</p>
      )}
      {ep.counties && (
        <p className="text-xs text-muted-foreground">Counties: {ep.counties}</p>
      )}

      {/* Timeline */}
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Issued {fmtDateTime(ep.issued_at)}</span>
          <span className="text-foreground/40">·</span>
          <span className="font-mono">{ep.issued_by}</span>
        </div>

        {ep.ended_at ? (
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span>Resolved {fmtDateTime(ep.ended_at)}</span>
              <span className="text-foreground/40 mx-1">·</span>
              <span className="font-mono">{ep.ended_by}</span>
              <span className="text-foreground/40 mx-1">·</span>
              <span>Duration: {fmtDuration(ep.issued_at, ep.ended_at)}</span>
              {ep.ended_reason && (
                <p className="mt-0.5 text-foreground/70">Reason: {ep.ended_reason}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Active for {fmtDuration(ep.issued_at)} — not yet resolved</span>
          </div>
        )}

        {ep.ended_at && (
          <div className="flex items-center gap-2">
            <Bird className={`w-3.5 h-3.5 shrink-0 ${ep.end_notified ? "text-green-500" : "text-muted-foreground/40"}`} />
            <span>{ep.end_notified ? "All-clear SMS dispatched" : "All-clear SMS pending (next hourly run)"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "episodes" | "config-changes";

export default function HpaiAlertLog() {
  const [tab, setTab] = useState<Tab>("episodes");

  // Episodes state
  const [episodes, setEpisodes]       = useState<SectorAlertEpisode[]>([]);
  const [epLoading, setEpLoading]     = useState(true);
  const [epError, setEpError]         = useState<string | null>(null);
  const [epSector, setEpSector]       = useState("");

  // Config changes state
  const [entries, setEntries]         = useState<SectorAlertHistoryEntry[]>([]);
  const [cfgLoading, setCfgLoading]   = useState(false);
  const [cfgError, setCfgError]       = useState<string | null>(null);
  const [cfgSector, setCfgSector]     = useState("");

  const secret = getSecret()!;

  // Load episodes on mount + when sector filter changes
  useEffect(() => {
    setEpLoading(true);
    setEpError(null);
    api.getSectorAlertEpisodes(epSector || undefined, false, secret)
      .then(d => setEpisodes(d.episodes))
      .catch(e => setEpError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setEpLoading(false));
  }, [secret, epSector]);

  // Load config changes lazily when that tab is first opened
  useEffect(() => {
    if (tab !== "config-changes") return;
    setCfgLoading(true);
    setCfgError(null);
    api.getSectorAlertHistory(cfgSector || undefined, secret)
      .then(d => setEntries(d.entries))
      .catch(e => setCfgError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setCfgLoading(false));
  }, [secret, tab, cfgSector]);

  const groups = groupByDay(entries);
  const filteredEpisodes = epSector ? episodes.filter(e => e.sector === epSector) : episodes;
  const openCount = filteredEpisodes.filter(e => !e.ended_at).length;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <Bird className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Sector Alert Log</h1>
            <p className="text-sm text-muted-foreground">
              Full lifecycle record of every sector alert episode and config change.
            </p>
          </div>
        </div>
        <Link
          href="/sector-alerts"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <AlertTriangle className="w-4 h-4" />
          Alert Manager
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {([
          { id: "episodes",       label: "Episodes",      badge: openCount > 0 ? String(openCount) : null },
          { id: "config-changes", label: "Config Changes", badge: null },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.badge && (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sector filter (shared) */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-2">
          {SECTOR_FILTER_OPTIONS.map(s => {
            const active = tab === "episodes" ? epSector === s.value : cfgSector === s.value;
            return (
              <button
                key={s.value}
                onClick={() => tab === "episodes" ? setEpSector(s.value) : setCfgSector(s.value)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/40"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Episodes tab ─────────────────────────────────────────────── */}
      {tab === "episodes" && (
        <>
          {epLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              Loading episodes…
            </div>
          )}
          {epError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {epError}
            </div>
          )}
          {!epLoading && !epError && filteredEpisodes.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No alert episodes recorded yet{epSector ? " for this sector" : ""}.</p>
              <p className="text-xs mt-1">Episodes are created when you issue an alert from the Alert Manager.</p>
            </div>
          )}
          {!epLoading && !epError && filteredEpisodes.length > 0 && (
            <div className="space-y-4">
              {filteredEpisodes.map(ep => <EpisodeCard key={ep.id} ep={ep} />)}
              <p className="text-xs text-muted-foreground text-center pb-4">
                {filteredEpisodes.length} episode{filteredEpisodes.length !== 1 ? "s" : ""} shown
              </p>
            </div>
          )}
        </>
      )}

      {/* ─── Config changes tab ───────────────────────────────────────── */}
      {tab === "config-changes" && (
        <>
          <div className="mb-5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
            <strong>Note:</strong> This log captures individual config key changes. For the structured episode view (with start/end times and resolution notes), use the <strong>Episodes</strong> tab.
          </div>

          {cfgLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              Loading history…
            </div>
          )}
          {cfgError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {cfgError}
            </div>
          )}
          {!cfgLoading && !cfgError && entries.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Bird className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No config changes recorded yet{cfgSector ? " for this sector" : ""}.</p>
            </div>
          )}
          {!cfgLoading && !cfgError && entries.length > 0 && (
            <div className="space-y-6">
              {groups.map(({ day, items }) => (
                <div key={day}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    {fmtDateGroup(items[0].createdAt)}
                  </h2>
                  <div className="bg-card border border-border rounded-xl px-5 divide-y divide-border">
                    {items.map(entry => <ChangeRow key={entry.id} entry={entry} />)}
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center pb-4">
                Showing {entries.length} most recent change{entries.length !== 1 ? "s" : ""} (max 500)
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
