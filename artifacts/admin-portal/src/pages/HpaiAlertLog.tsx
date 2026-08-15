import { useEffect, useState } from "react";
import { api, type SectorAlertHistoryEntry } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { Bird, AlertTriangle, CheckCircle2, MinusCircle, AlertCircle, Clock } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECTOR_META: Record<string, { label: string; colour: string; emptyIcon?: string }> = {
  hpai:          { label: "HPAI (Avian Influenza)", colour: "bg-red-100 text-red-700 border-red-200" },
  arable:        { label: "Arable / Crop Health",   colour: "bg-amber-100 text-amber-700 border-amber-200" },
  horticulture:  { label: "Horticulture / Plant Health", colour: "bg-green-100 text-green-700 border-green-200" },
  viticulture:   { label: "Viticulture / Vine Disease",  colour: "bg-purple-100 text-purple-700 border-purple-200" },
  beef:          { label: "Beef / Cattle Disease",       colour: "bg-orange-100 text-orange-700 border-orange-200" },
  dairy:         { label: "Dairy Herd Disease",          colour: "bg-blue-100 text-blue-700 border-blue-200" },
  pig:           { label: "Pig Disease",                 colour: "bg-pink-100 text-pink-700 border-pink-200" },
  sheep:         { label: "Sheep Disease",               colour: "bg-lime-100 text-lime-700 border-lime-200" },
  goat:          { label: "Goat Disease",                colour: "bg-teal-100 text-teal-700 border-teal-200" },
};

const KEY_LABELS: Record<string, string> = {
  // HPAI
  "hpai.alert_active":   "Alert active",
  "hpai.alert_level":    "Alert level",
  "hpai.alert_message":  "Alert message",
  "hpai.alert_date":     "Alert date",
  "hpai.alert_counties": "Alert counties",
  // Arable
  "arable.alert_active":   "Alert active",
  "arable.alert_level":    "Alert level",
  "arable.alert_message":  "Alert message",
  "arable.alert_date":     "Alert date",
  "arable.alert_counties": "Alert counties",
  // Horticulture
  "horticulture.alert_active":   "Alert active",
  "horticulture.alert_level":    "Alert level",
  "horticulture.alert_message":  "Alert message",
  "horticulture.alert_date":     "Alert date",
  "horticulture.alert_counties": "Alert counties",
  // Viticulture
  "viticulture.alert_active":   "Alert active",
  "viticulture.alert_level":    "Alert level",
  "viticulture.alert_message":  "Alert message",
  "viticulture.alert_date":     "Alert date",
  "viticulture.alert_counties": "Alert counties",
  // Beef / Cattle
  "beef.alert_active":   "Alert active",
  "beef.alert_level":    "Alert level",
  "beef.alert_message":  "Alert message",
  "beef.alert_date":     "Alert date",
  "beef.alert_counties": "Alert counties",
  // Dairy
  "dairy.alert_active":   "Alert active",
  "dairy.alert_level":    "Alert level",
  "dairy.alert_message":  "Alert message",
  "dairy.alert_date":     "Alert date",
  "dairy.alert_counties": "Alert counties",
  // Pig
  "pig.alert_active":   "Alert active",
  "pig.alert_level":    "Alert level",
  "pig.alert_message":  "Alert message",
  "pig.alert_date":     "Alert date",
  "pig.alert_counties": "Alert counties",
  // Sheep
  "sheep.alert_active":   "Alert active",
  "sheep.alert_level":    "Alert level",
  "sheep.alert_message":  "Alert message",
  "sheep.alert_date":     "Alert date",
  "sheep.alert_counties": "Alert counties",
  // Goat
  "goat.alert_active":   "Alert active",
  "goat.alert_level":    "Alert level",
  "goat.alert_message":  "Alert message",
  "goat.alert_date":     "Alert date",
  "goat.alert_counties": "Alert counties",
};

const LEVEL_LABELS: Record<string, { label: string; colour: string }> = {
  precautionary: { label: "Precautionary",  colour: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  regional:      { label: "Regional",       colour: "bg-orange-100 text-orange-800 border-orange-200" },
  national:      { label: "National",       colour: "bg-red-100 text-red-800 border-red-200" },
};

const SECTORS = [
  { value: "",             label: "All sectors" },
  { value: "hpai",        label: "HPAI (Avian Influenza)" },
  { value: "arable",      label: "Arable / Crop Health" },
  { value: "horticulture", label: "Horticulture / Plant Health" },
  { value: "viticulture", label: "Viticulture / Vine Disease" },
  { value: "beef",        label: "Beef / Cattle Disease" },
  { value: "dairy",       label: "Dairy Herd Disease" },
  { value: "pig",         label: "Pig Disease" },
  { value: "sheep",       label: "Sheep Disease" },
  { value: "goat",        label: "Goat Disease" },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short",
  });
}

function formatDateGroup(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function resolveSector(entry: SectorAlertHistoryEntry): string {
  if (entry.action === "hpai_config_change") return "hpai";
  return entry.metadata?.sector ?? "hpai";
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

  if (k.endsWith(".alert_active")) {
    return v === "true"
      ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200"><AlertTriangle className="w-3 h-3" />Active</span>
      : <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3" />Inactive</span>;
  }

  if (k.endsWith(".alert_level")) {
    const lvl = LEVEL_LABELS[v];
    return lvl
      ? <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${lvl.colour}`}>{lvl.label}</span>
      : <span className="text-xs font-mono text-foreground">{v}</span>;
  }

  return <span className="text-xs font-mono text-foreground break-all">{v}</span>;
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
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        {isCleared
          ? <MinusCircle className="w-4 h-4 text-muted-foreground" />
          : isSet
            ? <AlertTriangle className="w-4 h-4 text-amber-500" />
            : <Clock className="w-4 h-4 text-blue-500" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <SectorBadge sector={sector} />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{keyLabel}</span>
          <span className="text-xs text-muted-foreground">
            {isCleared ? "reset to default" : isSet ? "set for the first time" : "updated"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {!isSet && (
            <>
              <ValuePill k={meta.key} v={meta.oldValue} />
              <span className="text-muted-foreground">→</span>
            </>
          )}
          <ValuePill k={meta.key} v={meta.newValue} />
        </div>

        <p className="text-xs text-muted-foreground">
          {formatDateTime(entry.createdAt)}
          <span className="mx-1.5">·</span>
          by <span className="font-mono">{entry.actorUserId}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Group entries by calendar day ───────────────────────────────────────────

function groupByDay(entries: SectorAlertHistoryEntry[]) {
  const groups: { day: string; items: SectorAlertHistoryEntry[] }[] = [];
  for (const entry of entries) {
    const day = new Date(entry.createdAt).toISOString().slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.day === day) {
      last.items.push(entry);
    } else {
      groups.push({ day, items: [entry] });
    }
  }
  return groups;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HpaiAlertLog() {
  const [entries, setEntries] = useState<SectorAlertHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sector, setSector] = useState<string>("");
  const secret = getSecret()!;

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getSectorAlertHistory(sector || undefined, secret)
      .then(d => setEntries(d.entries))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [secret, sector]);

  const groups = groupByDay(entries);

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
          <Bird className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Sector Alert Log</h1>
          <p className="text-sm text-muted-foreground">
            Permanent record of every change to platform alert settings across all sectors.
          </p>
        </div>
      </div>

      {/* Sector filter */}
      <div className="mt-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {SECTORS.map(s => (
            <button
              key={s.value}
              onClick={() => setSector(s.value)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                sector === s.value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/40"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
        <strong>Note:</strong> This log only captures changes made <em>from this date forward</em> — 
        changes made before this feature was added are not recorded.
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading history…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Bird className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No alert changes recorded yet{sector ? ` for this sector` : ""}.</p>
          <p className="text-xs mt-1">The log will populate the first time an alert config key is saved or cleared.</p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-6">
          {groups.map(({ day, items }) => (
            <div key={day}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {formatDateGroup(items[0].createdAt)}
              </h2>
              <div className="bg-card border border-border rounded-xl px-5 divide-y divide-border">
                {items.map(entry => (
                  <ChangeRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}

          <p className="text-xs text-muted-foreground text-center pb-4">
            Showing the {entries.length} most recent change{entries.length !== 1 ? "s" : ""} (max 500)
          </p>
        </div>
      )}
    </div>
  );
}
