import { useEffect, useState } from "react";
import { api, type HpaiAlertHistoryEntry } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { Bird, AlertTriangle, CheckCircle2, MinusCircle, AlertCircle, Clock } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KEY_LABELS: Record<string, string> = {
  "hpai.alert_active": "Alert active",
  "hpai.alert_level":  "Alert level",
  "hpai.alert_message": "Alert message",
  "hpai.alert_date":   "Alert date",
};

const LEVEL_LABELS: Record<string, { label: string; colour: string }> = {
  precautionary: { label: "Precautionary",  colour: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  regional:      { label: "Regional",       colour: "bg-orange-100 text-orange-800 border-orange-200" },
  national:      { label: "National",       colour: "bg-red-100 text-red-800 border-red-200" },
};

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

function ValuePill({ k, v }: { k: string; v: string | null }) {
  if (v === null) return <span className="italic text-muted-foreground text-xs">cleared</span>;

  if (k === "hpai.alert_active") {
    return v === "true"
      ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200"><AlertTriangle className="w-3 h-3" />Active</span>
      : <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3" />Inactive</span>;
  }

  if (k === "hpai.alert_level") {
    const lvl = LEVEL_LABELS[v];
    return lvl
      ? <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${lvl.colour}`}>{lvl.label}</span>
      : <span className="text-xs font-mono text-foreground">{v}</span>;
  }

  return <span className="text-xs font-mono text-foreground break-all">{v}</span>;
}

function ChangeRow({ entry }: { entry: HpaiAlertHistoryEntry }) {
  const meta = entry.metadata;
  if (!meta) return null;
  const keyLabel = KEY_LABELS[meta.key] ?? meta.key;
  const isCleared = meta.newValue === null;
  const isSet = meta.oldValue === null;

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

function groupByDay(entries: HpaiAlertHistoryEntry[]) {
  const groups: { day: string; items: HpaiAlertHistoryEntry[] }[] = [];
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
  const [entries, setEntries] = useState<HpaiAlertHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const secret = getSecret()!;

  useEffect(() => {
    api.getHpaiAlertHistory(secret)
      .then(d => setEntries(d.entries))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [secret]);

  const groups = groupByDay(entries);

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
          <Bird className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">HPAI Alert Log</h1>
          <p className="text-sm text-muted-foreground">
            Permanent record of every change to the HPAI platform alert settings.
          </p>
        </div>
      </div>

      <div className="mt-2 mb-6 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
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
          <p className="text-sm font-medium">No HPAI alert changes recorded yet.</p>
          <p className="text-xs mt-1">The log will populate the first time an HPAI config key is saved or cleared.</p>
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
