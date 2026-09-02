import { useEffect, useState } from "react";
import { api, type PlatformConfigItem } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { Settings2, RotateCcw, Save, CheckCircle2, AlertCircle, Clock } from "lucide-react";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ConfigCard({ item, secret, onSaved }: { item: PlatformConfigItem; secret: string; onSaved: () => void }) {
  const effectiveValue = item.currentValue ?? item.defaultValue;
  const [draft, setDraft] = useState(effectiveValue);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(item.currentValue ?? item.defaultValue);
  }, [item.currentValue, item.defaultValue]);

  const isCustomised = item.currentValue !== null;
  const isDirty = draft !== effectiveValue;
  const isBarrelAlertThreshold =
    item.key === "barrel_idle_days_default" ||
    item.key === "barrel_neutral_fills_default" ||
    item.key === "barrel_retirement_threshold_pence";

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api.setPlatformConfig(item.key, draft, secret);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setError(null);
    try {
      await api.resetPlatformConfig(item.key, secret);
      setDraft(item.defaultValue);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-foreground">{item.label}</h3>
            {isCustomised ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                Customised
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        {item.updatedAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {formatDate(item.updatedAt)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Current value
        </label>
        {isBarrelAlertThreshold ? (
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            spellCheck={false}
          />
        )}
        {isCustomised && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Built-in default</p>
            <p className="text-xs font-mono text-muted-foreground bg-muted rounded px-2 py-1 break-all">
              {item.defaultValue}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !draft.trim() || !isDirty}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saved && !isDirty ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved</>
            ) : (
              <><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}</>
            )}
          </button>
          {isCustomised && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {resetting ? "Resetting…" : "Reset to default"}
            </button>
          )}
        </div>
        {isDirty && (
          <span className="text-xs text-amber-600">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}

export default function PlatformConfig() {
  const [items, setItems] = useState<PlatformConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const secret = getSecret()!;

  async function loadConfig() {
    try {
      const data = await api.getPlatformConfig(secret);
      setItems(data.items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadConfig(); }, []);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
          <Settings2 className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Platform Config</h1>
          <p className="text-sm text-muted-foreground">
            Live settings for the deployed app — changes take effect immediately, no deployment needed.
          </p>
        </div>
      </div>

      <div className="mt-2 mb-6 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <strong>How it works:</strong> The mobile app and dashboard fetch these values from the API on load. 
        If a value is blank here the built-in default is used automatically, so you only need to fill 
        in a field when it needs to change.
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading config…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {items.map((item) => (
            <ConfigCard key={item.key} item={item} secret={secret} onSaved={loadConfig} />
          ))}
        </div>
      )}
    </div>
  );
}
