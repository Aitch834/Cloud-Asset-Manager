import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { api, type PlatformConfigItem } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import {
  Bird, AlertTriangle, CheckCircle2, ChevronRight,
  Save, X, Loader2, AlertCircle, History,
} from "lucide-react";

// ─── Sector definitions ───────────────────────────────────────────────────────

const SECTORS = [
  { id: "hpai",         label: "HPAI",          sub: "Avian Influenza",       colour: "red" },
  { id: "beef",         label: "Beef",           sub: "Cattle Disease",        colour: "orange" },
  { id: "dairy",        label: "Dairy",          sub: "Herd Disease",          colour: "blue" },
  { id: "sheep",        label: "Sheep",          sub: "Sheep Disease",         colour: "lime" },
  { id: "goat",         label: "Goat",           sub: "Goat Disease",          colour: "teal" },
  { id: "pig",          label: "Pig",            sub: "Pig Disease",           colour: "pink" },
  { id: "arable",       label: "Arable",         sub: "Crop Health",           colour: "amber" },
  { id: "horticulture", label: "Horticulture",   sub: "Plant Health",          colour: "green" },
  { id: "viticulture",  label: "Viticulture",    sub: "Vine Disease",          colour: "purple" },
] as const;

type SectorId = typeof SECTORS[number]["id"];

const LEVELS = [
  { value: "precautionary", label: "Precautionary", colour: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "regional",      label: "Regional",      colour: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "national",      label: "National",      colour: "bg-red-100 text-red-800 border-red-200" },
];

const COLOUR_MAP: Record<string, { dot: string; badge: string; border: string; bg: string }> = {
  red:    { dot: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200",    border: "border-red-300",    bg: "bg-red-50" },
  orange: { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700 border-orange-200", border: "border-orange-300", bg: "bg-orange-50" },
  blue:   { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 border-blue-200",   border: "border-blue-300",   bg: "bg-blue-50" },
  lime:   { dot: "bg-lime-500",   badge: "bg-lime-100 text-lime-700 border-lime-200",   border: "border-lime-300",   bg: "bg-lime-50" },
  teal:   { dot: "bg-teal-500",   badge: "bg-teal-100 text-teal-700 border-teal-200",   border: "border-teal-300",   bg: "bg-teal-50" },
  pink:   { dot: "bg-pink-500",   badge: "bg-pink-100 text-pink-700 border-pink-200",   border: "border-pink-300",   bg: "bg-pink-50" },
  amber:  { dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700 border-amber-200", border: "border-amber-300",  bg: "bg-amber-50" },
  green:  { dot: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-200", border: "border-green-300",  bg: "bg-green-50" },
  purple: { dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700 border-purple-200", border: "border-purple-300", bg: "bg-purple-50" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getKey(configMap: Record<string, string | null>, sector: string, field: string) {
  return configMap[`${sector}.${field}`] ?? null;
}

function buildConfigMap(items: PlatformConfigItem[]): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const item of items) {
    map[item.key] = item.currentValue;
  }
  return map;
}

interface SectorState {
  active: boolean;
  level: string;
  message: string;
  date: string;
  counties: string;
}

function readSectorState(configMap: Record<string, string | null>, sector: string): SectorState {
  return {
    active:   getKey(configMap, sector, "alert_active") === "true",
    level:    getKey(configMap, sector, "alert_level") ?? "precautionary",
    message:  getKey(configMap, sector, "alert_message") ?? "",
    date:     getKey(configMap, sector, "alert_date") ?? new Date().toISOString().slice(0, 10),
    counties: getKey(configMap, sector, "alert_counties") ?? "",
  };
}

// ─── Sector tab button ────────────────────────────────────────────────────────

function SectorTab({
  sector, active: isActive, selected, onClick,
}: {
  sector: typeof SECTORS[number];
  active: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const c = COLOUR_MAP[sector.colour];
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        selected
          ? "bg-foreground text-background"
          : "hover:bg-muted"
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isActive ? c.dot : "bg-muted-foreground/30"}`} />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium leading-tight">{sector.label}</span>
        <span className={`block text-xs leading-tight ${selected ? "text-background/60" : "text-muted-foreground"}`}>{sector.sub}</span>
      </span>
      {isActive && (
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${selected ? "bg-background/20 text-background" : `${c.badge} border`}`}>
          LIVE
        </span>
      )}
      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selected ? "text-background/60" : "text-muted-foreground"}`} />
    </button>
  );
}

// ─── Alert editor form ────────────────────────────────────────────────────────

function AlertEditor({
  sector, draft, onChange, onSave, onClear, saving, clearing, saveError,
}: {
  sector: typeof SECTORS[number];
  draft: SectorState;
  onChange: (s: SectorState) => void;
  onSave: () => void;
  onClear: () => void;
  saving: boolean;
  clearing: boolean;
  saveError: string | null;
}) {
  const c = COLOUR_MAP[sector.colour];

  return (
    <div className="flex flex-col gap-5">

      {/* Status toggle */}
      <div className={`flex items-start gap-4 p-4 rounded-xl border ${draft.active ? `${c.border} ${c.bg}` : "border-border bg-muted/30"}`}>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Alert status</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            When active, this alert banner is shown to all farms subscribed to the {sector.label} sector.
          </p>
        </div>
        <button
          onClick={() => onChange({ ...draft, active: !draft.active })}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none mt-0.5 ${
            draft.active ? "bg-red-500" : "bg-muted-foreground/30"
          }`}
          role="switch"
          aria-checked={draft.active}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              draft.active ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm font-semibold mt-0.5 ${draft.active ? "text-red-600" : "text-muted-foreground"}`}>
          {draft.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Alert level */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Alert level</label>
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => onChange({ ...draft, level: l.value })}
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

      {/* Alert date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Alert date</label>
        <input
          type="date"
          value={draft.date}
          onChange={e => onChange({ ...draft, date: e.target.value })}
          className="w-48 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      {/* Alert message */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Alert message
          <span className="ml-2 text-xs text-muted-foreground font-normal">Displayed in the dashboard banner</span>
        </label>
        <textarea
          rows={4}
          value={draft.message}
          onChange={e => onChange({ ...draft, message: e.target.value })}
          placeholder={`e.g. A ${sector.label.toLowerCase()} alert has been issued. Please check APHA guidance and review your biosecurity measures…`}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
        />
      </div>

      {/* Counties */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Restrict to counties
          <span className="ml-2 text-xs text-muted-foreground font-normal">Leave blank to apply nationally</span>
        </label>
        <input
          type="text"
          value={draft.counties}
          onChange={e => onChange({ ...draft, counties: e.target.value })}
          placeholder="e.g. Norfolk,Suffolk,Cambridgeshire"
          className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">Comma-separated county names. Farms whose county matches will see the alert; all others won't.</p>
      </div>

      {/* Error */}
      {saveError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1 border-t border-border">
        <button
          onClick={onSave}
          disabled={saving || clearing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-foreground text-background hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save changes"}
        </button>

        <button
          onClick={onClear}
          disabled={saving || clearing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground disabled:opacity-50 transition-colors"
        >
          {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          {clearing ? "Clearing…" : "Clear alert"}
        </button>

        <span className="text-xs text-muted-foreground ml-auto">
          Saving will also activate/deactivate the banner depending on the toggle above.
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SectorAlertManager() {
  const [items, setItems] = useState<PlatformConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<SectorId>("hpai");
  const [drafts, setDrafts] = useState<Record<string, SectorState>>({});
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const secret = getSecret()!;

  const loadConfig = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    api.getPlatformConfig(secret)
      .then(d => {
        setItems(d.items);
        const map = buildConfigMap(d.items);
        setDrafts(prev => {
          const next: Record<string, SectorState> = {};
          for (const s of SECTORS) {
            // Preserve in-flight edits if any
            next[s.id] = prev[s.id] ?? readSectorState(map, s.id);
          }
          return next;
        });
      })
      .catch(e => setLoadError(e instanceof Error ? e.message : "Failed to load config"))
      .finally(() => setLoading(false));
  }, [secret]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // Re-initialise drafts from server when sector changes (only if not yet loaded for that sector)
  useEffect(() => {
    if (items.length === 0) return;
    const map = buildConfigMap(items);
    setDrafts(prev => {
      if (prev[selectedSector]) return prev;
      return { ...prev, [selectedSector]: readSectorState(map, selectedSector) };
    });
  }, [selectedSector, items]);

  const configMap = buildConfigMap(items);

  async function handleSave() {
    const d = drafts[selectedSector];
    if (!d) return;
    setSaving(true);
    setSaveError(null);
    try {
      const writes: [string, string][] = [
        [`${selectedSector}.alert_active`,  String(d.active)],
        [`${selectedSector}.alert_level`,   d.level],
        [`${selectedSector}.alert_message`, d.message],
        [`${selectedSector}.alert_date`,    d.date],
        [`${selectedSector}.alert_counties`, d.counties],
      ];
      await Promise.all(writes.map(([key, value]) => api.setPlatformConfig(key, value, secret)));
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      loadConfig();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    setSaveError(null);
    try {
      const keys = [
        `${selectedSector}.alert_active`,
        `${selectedSector}.alert_level`,
        `${selectedSector}.alert_message`,
        `${selectedSector}.alert_date`,
        `${selectedSector}.alert_counties`,
      ];
      await Promise.all(keys.map(key => api.resetPlatformConfig(key, secret)));
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      loadConfig();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Clear failed");
    } finally {
      setClearing(false);
    }
  }

  const sector = SECTORS.find(s => s.id === selectedSector)!;
  const draft = drafts[selectedSector];
  const liveActive = configMap[`${selectedSector}.alert_active`] === "true";

  const activeSectors = SECTORS.filter(s => configMap[`${s.id}.alert_active`] === "true");

  return (
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
              Issue, update, or clear biosecurity alerts for any sector. Changes take effect immediately in the dashboard.
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

      {/* Live alert summary */}
      {!loading && activeSectors.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground self-center mr-1">Live now:</span>
          {activeSectors.map(s => {
            const c = COLOUR_MAP[s.colour];
            const lvl = configMap[`${s.id}.alert_level`] ?? "";
            const lvlLabel = LEVELS.find(l => l.value === lvl)?.label ?? lvl;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSector(s.id as SectorId)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                {s.label}{lvlLabel ? ` — ${lvlLabel}` : ""}
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-20 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading config…
        </div>
      )}

      {loadError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {loadError}
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
                active={configMap[`${s.id}.alert_active`] === "true"}
                selected={selectedSector === s.id}
                onClick={() => {
                  setSavedAt(null);
                  setSaveError(null);
                  setSelectedSector(s.id as SectorId);
                }}
              />
            ))}
          </div>

          {/* Editor panel */}
          <div className="flex-1 min-w-0">
            {/* Panel header */}
            <div className="flex items-center gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">{sector.label} — {sector.sub}</h2>
                  {liveActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Alert live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      <CheckCircle2 className="w-3 h-3" />
                      No active alert
                    </span>
                  )}
                </div>
                {savedAt && (
                  <p className="text-xs text-green-600 mt-0.5">✓ Saved at {savedAt}</p>
                )}
              </div>
            </div>

            {draft ? (
              <AlertEditor
                sector={sector}
                draft={draft}
                onChange={s => setDrafts(prev => ({ ...prev, [selectedSector]: s }))}
                onSave={handleSave}
                onClear={handleClear}
                saving={saving}
                clearing={clearing}
                saveError={saveError}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading sector…
              </div>
            )}

            {/* Help note */}
            <div className="mt-6 p-4 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground space-y-1">
              <p><strong className="text-foreground">How it works:</strong> "Save changes" writes all five config values (active, level, message, date, counties) in one operation. The change appears in the dashboard immediately and is recorded in the audit log.</p>
              <p>"Clear alert" resets all five fields back to their defaults — this deactivates the alert and wipes the message, date, and county restrictions.</p>
              <p>The county filter is applied server-side: farms whose county doesn't match won't see the alert even if it's active. Leave blank to show to all farms in the sector.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer: HPAI icon credit */}
      {!loading && (
        <div className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <Bird className="w-3.5 h-3.5" />
          Changes are logged permanently in the Sector Alert Log.
        </div>
      )}
    </div>
  );
}
