import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { Tag, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function VersionManagement() {
  const secret = getSecret() ?? "";

  const [version, setVersion] = useState("");
  const [build, setBuild] = useState("");
  const [currentFull, setCurrentFull] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCurrent() {
    setLoading(true);
    try {
      const res = await fetch("/api/version");
      const data = await res.json() as { version: string; build: string; full: string };
      setVersion(data.version);
      setBuild(data.build);
      setCurrentFull(data.full);
    } catch {
      setError("Could not load current version from server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCurrent(); }, []);

  const preview = version.trim() && build.trim()
    ? `v${version.trim()} Build ${build.trim()}`
    : "—";

  const isValid = /^\d+\.\d+\.\d+$/.test(version.trim()) && /^\d+$/.test(build.trim());

  async function handleApply() {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.setPlatformConfig("app.version", version.trim(), secret);
      await api.setPlatformConfig("app.build", build.trim(), secret);
      setSaved(true);
      setCurrentFull(`${version.trim()} Build ${build.trim()}`);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <Tag className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Version Management</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Set the version and build number once here — the change is live immediately across the dashboard sidebar and mobile app with no redeployment required.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading current version…
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-muted/40 px-5 py-4 mb-8">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Currently deployed</p>
            <p className="text-2xl font-mono font-bold text-foreground">
              {currentFull ? `v${currentFull}` : "—"}
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Version Number
              </label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="e.g. 1.4.17"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground mt-1">Format: MAJOR.MINOR.PATCH</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Build Number
              </label>
              <input
                type="text"
                value={build}
                onChange={e => setBuild(e.target.value)}
                placeholder="e.g. 1246"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground mt-1">Increment by 1 each deployment</p>
            </div>

            <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Preview</p>
                <p className="text-lg font-mono font-bold text-primary">{preview}</p>
              </div>
              <p className="text-xs text-muted-foreground text-right max-w-[180px]">
                This is exactly what users will see in the dashboard and mobile app
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-md px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Version applied successfully — live across all platform clients.
              </div>
            )}

            <button
              onClick={handleApply}
              disabled={saving || !isValid}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-semibold shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Applying…
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4" />
                  Apply to All Platform
                </>
              )}
            </button>

            {!isValid && version.trim() && (
              <p className="text-xs text-amber-600 text-center">
                Version must be in X.Y.Z format and build must be a number
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
