import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getSecret } from "@/lib/auth";
import { setNavGuard } from "@/lib/nav-guard";
import {
  Megaphone, ImageIcon, Loader2, CheckCircle, AlertCircle, Eye,
  Plus, Pencil, Trash2, ChevronDown, X, Save, ChevronRight, Palette,
  Upload, RotateCcw, Archive, BookmarkPlus, BookOpen,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdCopyPreset {
  id: number;
  name: string;
  headline: string;
  body: string;
  accentColor: string;
  bgUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface AdTemplate {
  id: number;
  name: string;
  slug: string;
  widthMm: number;
  heightMm: number;
  htmlBody: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

// ── Custom errors ─────────────────────────────────────────────────────────────

class MissingAssetsError extends Error {
  missingAssets: string[];
  constructor(message: string, missingAssets: string[]) {
    super(message);
    this.name = "MissingAssetsError";
    this.missingAssets = missingAssets;
  }
}

class MissingPlaceholdersError extends Error {
  missingPlaceholders: string[];
  constructor(message: string, missingPlaceholders: string[]) {
    super(message);
    this.name = "MissingPlaceholdersError";
    this.missingPlaceholders = missingPlaceholders;
  }
}

// ── API helpers ───────────────────────────────────────────────────────────────

function adminHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", "x-admin-secret": getSecret() ?? "" };
}

async function fetchTemplates(): Promise<AdTemplate[]> {
  const res = await fetch("/api/admin/ad-templates?includeArchived=1", { headers: adminHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function restoreTemplate(id: number): Promise<AdTemplate> {
  const res = await fetch(`/api/admin/ad-templates/${id}/restore`, {
    method: "POST",
    headers: adminHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  return json;
}

interface TemplateSaveResult {
  template: AdTemplate;
  warnings: string[];
}

async function createTemplate(data: Omit<AdTemplate, "id" | "createdAt" | "updatedAt" | "archivedAt">): Promise<TemplateSaveResult> {
  const res = await fetch("/api/admin/ad-templates", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  const { warnings, ...template } = json as AdTemplate & { warnings?: string[] };
  return { template: template as AdTemplate, warnings: warnings ?? [] };
}

async function updateTemplate(id: number, data: Omit<AdTemplate, "id" | "createdAt" | "updatedAt" | "archivedAt">): Promise<TemplateSaveResult> {
  const res = await fetch(`/api/admin/ad-templates/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  const { warnings, ...template } = json as AdTemplate & { warnings?: string[] };
  return { template: template as AdTemplate, warnings: warnings ?? [] };
}

async function deleteTemplate(id: number): Promise<void> {
  const res = await fetch(`/api/admin/ad-templates/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  }
}

interface CustomiseOpts {
  headline: string;
  body: string;
  accentColor: string;
}

interface GeneratePdfResult {
  blob: Blob;
  warnings: string[];
}
async function generatePdf(templateId: number, bgUrl: string, opts: CustomiseOpts): Promise<GeneratePdfResult> {
  const payload: Record<string, string | number | undefined> = {
    templateId,
    bgUrl: bgUrl.trim() || undefined,
  };
  if (opts.headline.trim()) payload.headline = opts.headline.trim();
  if (opts.body.trim())     payload.body     = opts.body.trim();
  if (opts.accentColor.trim()) payload.accentColor = opts.accentColor.trim();
  const res = await fetch("/api/admin/ad-pdf", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { error?: string; missingAssets?: string[]; missingPlaceholders?: string[] };
    if (json.missingPlaceholders?.length) throw new MissingPlaceholdersError(json.error ?? `HTTP ${res.status}`, json.missingPlaceholders);
    if (json.missingAssets?.length) throw new MissingAssetsError(json.error ?? `HTTP ${res.status}`, json.missingAssets);
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }
  const warningsHeader = res.headers.get("X-Ad-Render-Warnings");
  const warnings: string[] = warningsHeader ? (JSON.parse(warningsHeader) as string[]) : [];
  const blob = await res.blob();
  return { blob, warnings };
}

interface FetchPreviewResult {
  url: string;
  warnings: string[];
}
async function fetchPreview(templateId: number, bgUrl: string, opts: CustomiseOpts): Promise<FetchPreviewResult> {
  const params = new URLSearchParams({ templateId: String(templateId) });
  const trimmed = bgUrl.trim();
  if (trimmed) params.set("bgUrl", trimmed);
  if (opts.headline.trim())    params.set("headline",    opts.headline.trim());
  if (opts.body.trim())        params.set("body",        opts.body.trim());
  if (opts.accentColor.trim()) params.set("accentColor", opts.accentColor.trim());
  const res = await fetch(`/api/admin/ad-pdf/preview?${params.toString()}`, {
    headers: { "x-admin-secret": getSecret() ?? "" },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { error?: string; missingAssets?: string[]; missingPlaceholders?: string[] };
    if (json.missingPlaceholders?.length) throw new MissingPlaceholdersError(json.error ?? `HTTP ${res.status}`, json.missingPlaceholders);
    if (json.missingAssets?.length) throw new MissingAssetsError(json.error ?? `HTTP ${res.status}`, json.missingAssets);
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }
  const warningsHeader = res.headers.get("X-Ad-Render-Warnings");
  const warnings: string[] = warningsHeader ? (JSON.parse(warningsHeader) as string[]) : [];
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), warnings };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface BrandAssetWarningProps {
  status: { logoResolvable: boolean; qrResolvable: boolean };
  /** "full"    – larger card shown below the page header (rounded-lg, py-3, heading + body)
   *  "compact" – smaller inline banner above the action buttons (rounded-md, py-2, single line) */
  variant: "full" | "compact";
}
async function fetchBrandAssets(): Promise<{ logo: string; qr: string }> {
  const res = await fetch("/api/admin/platform-config", { headers: adminHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as { items: Array<{ key: string; currentValue: string | null; defaultValue: string }> };
  const byKey: Record<string, string> = {};
  for (const item of json.items) byKey[item.key] = item.currentValue ?? item.defaultValue ?? "";
  return { logo: byKey["brand.adLogoDataUrl"] ?? "", qr: byKey["brand.adQrDataUrl"] ?? "" };
}

async function fetchBrandAssetStatus(): Promise<{ logoResolvable: boolean; qrResolvable: boolean }> {
  const res = await fetch("/api/admin/ad-brand-assets/status", { headers: adminHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function saveBrandAsset(key: string, value: string): Promise<void> {
  const res = await fetch(`/api/admin/platform-config/${key}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ value }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  }
}

async function clearBrandAsset(key: string): Promise<void> {
  const res = await fetch(`/api/admin/platform-config/${key}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  }
}

async function fetchPresets(): Promise<AdCopyPreset[]> {
  const res = await fetch("/api/admin/ad-copy-presets", { headers: adminHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function savePreset(data: { name: string; headline: string; body: string; accentColor: string; bgUrl: string; overwrite?: boolean }): Promise<AdCopyPreset> {
  const res = await fetch("/api/admin/ad-copy-presets", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  return json;
}

async function updatePreset(id: number, data: { name: string; headline: string; body: string; accentColor: string; bgUrl: string }): Promise<AdCopyPreset> {
  const res = await fetch(`/api/admin/ad-copy-presets/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  return json;
}

async function deletePreset(id: number): Promise<void> {
  const res = await fetch(`/api/admin/ad-copy-presets/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  }
}

function AssetUploader({
  label, hint, assetKey, currentDataUrl, onSaved,
}: {
  label: string;
  hint: string;
  assetKey: string;
  currentDataUrl: string;
  onSaved: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft]     = useState<string>(currentDataUrl);
  const [saving, setSaving]   = useState(false);
  const [clearing, setClearing] = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [error,  setError]    = useState<string | null>(null);

  // Sync when parent reloads
  useEffect(() => { setDraft(currentDataUrl); }, [currentDataUrl]);

  const isDirty = draft !== currentDataUrl;

  function handleFile(file: File) {
    if (file.size > 500 * 1024) { setError("File must be under 500 KB."); return; }
    if (!file.type.startsWith("image/")) { setError("Please select a PNG, JPG, SVG or WebP image."); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setDraft(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true); setError(null);
    try {
      await saveBrandAsset(assetKey, draft);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  async function handleClear() {
    setClearing(true); setError(null);
    try {
      await clearBrandAsset(assetKey);
      setDraft("");
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Clear failed");
    } finally { setClearing(false); }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>

      {/* Preview */}
      <div className="flex items-start gap-4">
        <div className="w-28 h-20 rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
          {draft ? (
            <img src={draft} alt={label} className="max-w-full max-h-full object-contain p-1" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            {draft ? "Replace image" : "Upload image"}
          </Button>
          {draft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={clearing}
              onClick={handleClear}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              {clearing ? "Clearing…" : "Clear (use fallback)"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={saving || !draft.trim() || !isDirty}
          onClick={handleSave}
        >
          {saved && !isDirty ? (
            <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Saved</>
          ) : (
            <><Save className="w-3.5 h-3.5 mr-1.5" />{saving ? "Saving…" : "Save"}</>
          )}
        </Button>
        {isDirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
      </div>
    </div>
  );
}

// ── Template form (create / edit) ─────────────────────────────────────────────

interface TemplateFormProps {
  initial?: AdTemplate;
  onSave: (data: Omit<AdTemplate, "id" | "createdAt" | "updatedAt" | "archivedAt">) => void;
  onCancel: () => void;
  isSaving: boolean;
  saveError?: string;
  /** Current Customise-section values — passed in so the preview reflects what's already filled in above */
  previewHeadline?: string;
  previewBody?: string;
  previewAccentColor?: string;
}

const DEFAULT_ACCENT = "#C49A6C";

// All recognised placeholder tokens (required + optional).
// Used for near-miss typo detection in the template editor.
const CANONICAL_PLACEHOLDERS_ALL = [
  "{{font_css}}", "{{logo}}", "{{bg}}", "{{qr}}",
  "{{headline}}", "{{body}}", "{{accent_color}}",
] as const;

/** Map from normalised inner content (lowercase, trimmed, hyphens→underscores) → canonical full token. */
const CANONICAL_PLACEHOLDER_NORM_MAP: Map<string, string> = new Map(
  CANONICAL_PLACEHOLDERS_ALL.map((p) => {
    const inner = p.slice(2, -2); // strip {{ and }}
    return [inner.trim().toLowerCase().replace(/-/g, "_"), p];
  })
);
const SAMPLE_HEADLINE = "Your vineyard.<br><em>Audit-ready.</em>";
const SAMPLE_BODY = "Vine register, phenology, harvest chemistry, spray logs, PDO&nbsp;/&nbsp;PGI records — all in one place.";

/**
 * Strips all HTML except the two inline tags documented as supported:
 *   <em>   — italic accent text (no attributes allowed)
 *   <br>   — line break
 * Everything else is text-escaped or recursed into.
 * Uses DOMParser so the browser handles entity decoding; safe to pass to
 * dangerouslySetInnerHTML because the output can only contain <em> and <br>.
 */
function sanitizeInlineHtml(html: string): string {
  if (typeof window === "undefined") return "";
  const doc = new DOMParser().parseFromString(`<span>${html}</span>`, "text/html");

  function walk(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      // Escape any text so it's safe when re-inserted as HTML
      return (node.textContent ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as Element).tagName.toLowerCase();
      if (tag === "br") return "<br>";
      // Wrap <em> children; strip attributes
      if (tag === "em") {
        const inner = Array.from(node.childNodes).map(walk).join("");
        return `<em>${inner}</em>`;
      }
      // All other elements: recurse into children but drop the tag itself
      return Array.from(node.childNodes).map(walk).join("");
    }
    return "";
  }

  const wrapper = doc.body.firstChild;
  if (!wrapper) return "";
  return Array.from(wrapper.childNodes).map(walk).join("");
}

export function TemplatePlaceholderPreview({
  htmlBody,
  headline,
  body,
  accentColor,
}: {
  htmlBody: string;
  headline: string;
  body: string;
  accentColor: string;
}) {
  const hasHeadline    = htmlBody.includes("{{headline}}");
  const hasBody        = htmlBody.includes("{{body}}");
  const hasAccentColor = htmlBody.includes("{{accent_color}}");

  // Debounce the three text values so the preview only re-renders after the
  // user pauses typing, avoiding flicker on every keystroke.
  const [debouncedHeadline,    setDebouncedHeadline]    = useState(headline);
  const [debouncedBody,        setDebouncedBody]        = useState(body);
  const [debouncedAccentColor, setDebouncedAccentColor] = useState(accentColor);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedHeadline(headline), 150);
    return () => clearTimeout(t);
  }, [headline]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBody(body), 150);
    return () => clearTimeout(t);
  }, [body]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedAccentColor(accentColor), 150);
    return () => clearTimeout(t);
  }, [accentColor]);

  if (!hasHeadline && !hasBody && !hasAccentColor) return null;

  const resolvedAccent   = debouncedAccentColor.trim() || DEFAULT_ACCENT;
  const resolvedHeadline = debouncedHeadline.trim()    || SAMPLE_HEADLINE;
  const resolvedBody     = debouncedBody.trim()        || SAMPLE_BODY;

  // True when any placeholder that appears in the template has no real value supplied
  const anyValueMissing =
    (hasHeadline && !headline.trim()) ||
    (hasBody && !body.trim()) ||
    (hasAccentColor && !accentColor.trim());

  return (
    <div className="mt-3 rounded-lg border border-border overflow-hidden text-sm">
      {/* Mini accent bar */}
      <div className="h-1.5" style={{ background: resolvedAccent }} />
      <div className="px-4 py-3 space-y-2 bg-background">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Placeholder preview
          <span className="font-normal">
            — {[hasHeadline && "{{headline}}", hasBody && "{{body}}", hasAccentColor && "{{accent_color}}"].filter(Boolean).join(", ")} detected in template
          </span>
        </p>

        {anyValueMissing && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <span className="font-medium">Sample text shown.</span>{" "}
              Fill in the <span className="font-medium">Preview values</span> fields above to see real values.
            </span>
          </div>
        )}

        {hasHeadline && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              <code className="bg-muted px-1 rounded">{"{{headline}}"}</code>
            </p>
            <p
              className="font-semibold leading-snug"
              style={{ color: resolvedAccent }}
              dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(resolvedHeadline) }}
            />
          </div>
        )}

        {hasBody && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              <code className="bg-muted px-1 rounded">{"{{body}}"}</code>
            </p>
            <p
              className="text-muted-foreground leading-snug"
              dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(resolvedBody) }}
            />
          </div>
        )}

        {hasAccentColor && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              <code className="bg-muted px-1 rounded">{"{{accent_color}}"}</code>
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-border shrink-0"
                style={{ background: resolvedAccent }}
              />
              <code className="text-xs">{resolvedAccent}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TemplateForm({ initial, onSave, onCancel, isSaving, saveError, previewHeadline = "", previewBody = "", previewAccentColor = "" }: TemplateFormProps) {
  const [name,     setName]     = useState(initial?.name     ?? "");
  const [slug,     setSlug]     = useState(initial?.slug     ?? "");
  const [widthMm,  setWidthMm]  = useState(String(initial?.widthMm  ?? "190"));
  const [heightMm, setHeightMm] = useState(String(initial?.heightMm ?? "133"));
  const [htmlBody, setHtmlBody] = useState(initial?.htmlBody ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  // Typo-placeholder confirmation — true when the form is waiting for the admin
  // to acknowledge detected near-miss typos before the save proceeds.
  const [awaitingTypoConfirm, setAwaitingTypoConfirm] = useState(false);

  // Local preview values — filled by the author inside this form so they can
  // test specific copy without leaving and filling the page-level Customise section.
  const [localPreviewHeadline,    setLocalPreviewHeadline]    = useState("");
  const [localPreviewBody,        setLocalPreviewBody]        = useState("");
  const [localPreviewAccentColor, setLocalPreviewAccentColor] = useState("");

  // Draft preview state
  const [draftBgUrl, setDraftBgUrl] = useState("");
  const [draftPreviewUrl,          setDraftPreviewUrl]          = useState<string | null>(null);
  const [draftPreviewPending,      setDraftPreviewPending]      = useState(false);
  const [draftPreviewError,        setDraftPreviewError]        = useState<string | null>(null);
  const [draftPreviewMissingAssets, setDraftPreviewMissingAssets] = useState<string[] | null>(null);
  const [draftPreviewMissingPlaceholders, setDraftPreviewMissingPlaceholders] = useState<string[] | null>(null);
  // Track whether a preview has ever been successfully generated — used to keep
  // the missing-placeholder warning visible even after subsequent HTML edits clear
  // the preview image.
  const [hasEverPreviewed, setHasEverPreviewed] = useState(false);

  const prevDraftObjectUrl = useRef<string | null>(null);
  // Monotonic revision counter — completed fetches whose revision doesn't match the
  // current one are discarded, preventing stale responses from overwriting a newer preview.
  const previewRevision = useRef(0);


  function handleNameChange(v: string) {
    setName(v);
    if (!initial) {
      setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  const REQUIRED_PLACEHOLDERS = ["{{font_css}}", "{{logo}}", "{{bg}}", "{{qr}}"] as const;

  const missingPlaceholders = htmlBody.trim()
    ? REQUIRED_PLACEHOLDERS.filter((p) => !htmlBody.includes(p))
    : [];

  // Near-miss typo detection — find {{…}} tokens that aren't exact canonical
  // placeholders but normalise to one (wrong case, extra spaces, - vs _).
  const typoPlaceholders: Array<{ found: string; expected: string }> = (() => {
    if (!htmlBody.trim()) return [];
    const results: Array<{ found: string; expected: string }> = [];
    const seen = new Set<string>();
    const tokenRe = /\{\{([^}]*)\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = tokenRe.exec(htmlBody)) !== null) {
      const found = `{{${m[1]}}}`;
      if (seen.has(found)) continue;
      seen.add(found);
      // Skip tokens that are already exact canonical matches
      if (CANONICAL_PLACEHOLDER_NORM_MAP.has(m[1].trim().toLowerCase().replace(/-/g, "_")) &&
          found === CANONICAL_PLACEHOLDER_NORM_MAP.get(m[1].trim().toLowerCase().replace(/-/g, "_"))) continue;
      // Check whether normalising the inner content matches a canonical placeholder
      const normInner = m[1].trim().toLowerCase().replace(/-/g, "_");
      const expected = CANONICAL_PLACEHOLDER_NORM_MAP.get(normInner);
      if (expected && expected !== found) results.push({ found, expected });
    }
    return results;
  })();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // If there are near-miss typo placeholders and the admin hasn't yet
    // acknowledged them, pause and show the inline confirmation instead of saving.
    if (typoPlaceholders.length > 0 && !awaitingTypoConfirm) {
      setAwaitingTypoConfirm(true);
      return;
    }
    onSave({ name, slug, widthMm: Number(widthMm), heightMm: Number(heightMm), htmlBody, isDefault });
  }

  async function handleDraftPreview() {
    if (!htmlBody.trim()) return;
    // Increment revision so any older in-flight request is silently dropped on arrival.
    const thisRevision = ++previewRevision.current;
    setDraftPreviewPending(true);
    setDraftPreviewError(null);
    setDraftPreviewMissingAssets(null);
    setDraftPreviewMissingPlaceholders(null);
    try {
      const res = await fetch("/api/admin/ad-pdf/preview-draft", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          htmlBody,
          bgUrl: draftBgUrl,
          widthMm: Number(widthMm) || 190,
          heightMm: Number(heightMm) || 133,
        }),
      });
      // Discard if a newer request was already dispatched while this one was in flight.
      if (thisRevision !== previewRevision.current) return;
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string; missingAssets?: string[]; missingPlaceholders?: string[] };
        if (json.missingPlaceholders?.length) throw new MissingPlaceholdersError(json.error ?? `HTTP ${res.status}`, json.missingPlaceholders);
        if (json.missingAssets?.length) throw new MissingAssetsError(json.error ?? `HTTP ${res.status}`, json.missingAssets);
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (prevDraftObjectUrl.current) URL.revokeObjectURL(prevDraftObjectUrl.current);
      prevDraftObjectUrl.current = url;
      setDraftPreviewUrl(url);
      setHasEverPreviewed(true);
    } catch (err) {
      if (thisRevision !== previewRevision.current) return;
      if (err instanceof MissingPlaceholdersError) {
        setDraftPreviewMissingPlaceholders(err.missingPlaceholders);
        setDraftPreviewError(null);
      } else if (err instanceof MissingAssetsError) {
        setDraftPreviewMissingAssets(err.missingAssets);
        setDraftPreviewError(null);
      } else {
        setDraftPreviewError(err instanceof Error ? err.message : "Preview generation failed");
      }
    } finally {
      if (thisRevision === previewRevision.current) setDraftPreviewPending(false);
    }
  }

  const inputCls = "w-full text-sm border border-input rounded-md px-3 py-2 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Template name</label>
          <input required className={inputCls} value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Viticulture — Half Page Horizontal" />
        </div>
        <div>
          <label className={labelCls}>Slug <span className="text-muted-foreground font-normal">(unique identifier)</span></label>
          <input required className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="viticulture-horizontal" />
          <p className="text-xs text-muted-foreground mt-1">Must be unique among active templates only — archived templates free up their slug.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Width (mm)</label>
          <input required type="number" className={inputCls} value={widthMm} onChange={(e) => { setWidthMm(e.target.value); setDraftPreviewUrl(null); setDraftPreviewError(null); }} min={10} max={1000} />
        </div>
        <div>
          <label className={labelCls}>Height (mm)</label>
          <input required type="number" className={inputCls} value={heightMm} onChange={(e) => { setHeightMm(e.target.value); setDraftPreviewUrl(null); setDraftPreviewError(null); }} min={10} max={1000} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls.replace("mb-1.5", "mb-0")}>
            WeasyPrint HTML body
            <span className="text-muted-foreground font-normal ml-1">
              — use <code className="text-xs bg-muted px-1 rounded">{"{{font_css}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{logo}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{bg}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{qr}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{headline}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{body}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{accent_color}}"}</code> as placeholders
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={draftBgUrl}
              onChange={(e) => { setDraftBgUrl(e.target.value); setDraftPreviewUrl(null); setDraftPreviewError(null); }}
              placeholder="Background image URL (optional)"
              className="w-64 text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!htmlBody.trim() || draftPreviewPending || missingPlaceholders.length > 0}
              onClick={handleDraftPreview}
            >
              {draftPreviewPending
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Rendering…</>
                : <><Eye className="w-3.5 h-3.5 mr-1.5" />Preview</>}
            </Button>
          </div>
        </div>
        <textarea
          required
          className={`${inputCls} font-mono text-xs resize-y`}
          rows={16}
          value={htmlBody}
          onChange={(e) => { setHtmlBody(e.target.value); setDraftPreviewUrl(null); setDraftPreviewError(null); setAwaitingTypoConfirm(false); }}
          placeholder={"<!DOCTYPE html>\n<html lang=\"en\">\n<head>...</head>\n<body>...</body>\n</html>"}
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          The renderer substitutes placeholders then passes the resulting HTML to WeasyPrint. All fonts, logo,
          QR code, and background image are embedded as base64 data-URIs at render time.{" "}
          <code className="bg-muted px-1 rounded">{"{{headline}}"}</code>,{" "}
          <code className="bg-muted px-1 rounded">{"{{body}}"}</code>, and{" "}
          <code className="bg-muted px-1 rounded">{"{{accent_color}}"}</code> are filled from the{" "}
          <strong>Customise</strong> fields on this page; they fall back to built-in defaults when those fields are left blank.
        </p>

        {/* ── Preview values sub-section ───────────────────────────────── */}
        {(htmlBody.includes("{{headline}}") || htmlBody.includes("{{body}}") || htmlBody.includes("{{accent_color}}")) && (
          <div className="mt-3 rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Preview values <span className="font-normal">— fill these to test specific copy without leaving this form</span></p>
            <div className="grid gap-3" style={{ gridTemplateColumns: [htmlBody.includes("{{headline}}") && "1fr", htmlBody.includes("{{body}}") && "1fr", htmlBody.includes("{{accent_color}}") && "auto"].filter(Boolean).join(" ") }}>
              {htmlBody.includes("{{headline}}") && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">
                    Headline <code className="bg-muted px-1 rounded font-normal">{"{{headline}}"}</code>
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    value={localPreviewHeadline}
                    onChange={(e) => setLocalPreviewHeadline(e.target.value)}
                    placeholder="Your vineyard. Audit-ready."
                  />
                </div>
              )}
              {htmlBody.includes("{{body}}") && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">
                    Body <code className="bg-muted px-1 rounded font-normal">{"{{body}}"}</code>
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    value={localPreviewBody}
                    onChange={(e) => setLocalPreviewBody(e.target.value)}
                    placeholder="Vine register, spray logs — all in one place."
                  />
                </div>
              )}
              {htmlBody.includes("{{accent_color}}") && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">
                    Accent <code className="bg-muted px-1 rounded font-normal">{"{{accent_color}}"}</code>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="h-9 w-9 rounded border border-input bg-background cursor-pointer p-0.5 shrink-0"
                      value={localPreviewAccentColor || "#C49A6C"}
                      onChange={(e) => setLocalPreviewAccentColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-28 text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                      value={localPreviewAccentColor}
                      onChange={(e) => setLocalPreviewAccentColor(e.target.value)}
                      placeholder="#C49A6C"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <TemplatePlaceholderPreview
          htmlBody={htmlBody}
          headline={localPreviewHeadline || previewHeadline}
          body={localPreviewBody || previewBody}
          accentColor={localPreviewAccentColor || previewAccentColor}
        />

        {draftPreviewMissingPlaceholders && draftPreviewMissingPlaceholders.length > 0 && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
            <p className="text-sm text-destructive">
              <span className="font-medium">Cannot generate preview:</span>{" "}
              the following required placeholder{draftPreviewMissingPlaceholders.length > 1 ? "s are" : " is"} missing from the template:{" "}
              {draftPreviewMissingPlaceholders.map((p, i) => (
                <span key={p}>
                  <code className="bg-destructive/10 px-1 rounded">{p}</code>{i < draftPreviewMissingPlaceholders.length - 1 ? ", " : ""}
                </span>
              ))}
              . Add {draftPreviewMissingPlaceholders.length === 1 ? "it" : "them"} to the HTML body and retry.
            </p>
          </div>
        )}

        {draftPreviewMissingAssets && draftPreviewMissingAssets.length > 0 && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
            <p className="text-sm text-destructive">
              <span className="font-medium">Cannot generate preview:</span>{" "}
              {draftPreviewMissingAssets.map((a, i) => (
                <span key={a}>
                  <strong>{a}</strong>{i < draftPreviewMissingAssets.length - 1 ? " and " : ""}
                </span>
              ))}{" "}
              {draftPreviewMissingAssets.length === 1 ? "is" : "are"} missing — upload{" "}
              {draftPreviewMissingAssets.length === 1 ? "it" : "them"} in{" "}
              <a href="/platform-config" className="underline font-medium">Platform Config</a> before retrying.
            </p>
          </div>
        )}

        {draftPreviewError && (
          <div className="flex items-start gap-2 text-sm text-destructive mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{draftPreviewError}</span>
          </div>
        )}

        {/* Missing-placeholder warning shown independently of the preview image so it
            persists after the admin edits the HTML following a successful preview. */}
        {missingPlaceholders.length > 0 && (
          <div className="flex items-start gap-2 px-3 py-2 mt-2 rounded-md bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <p className="text-xs text-amber-800">
              <span className="font-medium">Preview blocked</span> — the following required placeholder{missingPlaceholders.length > 1 ? "s are" : " is"} missing from the HTML body. Add {missingPlaceholders.length > 1 ? "them" : "it"} to enable the Preview button:{" "}
              {missingPlaceholders.map((p, i) => (
                <span key={p}>
                  <code className="bg-amber-100 px-1 rounded">{p}</code>
                  {i < missingPlaceholders.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
        )}

        {draftPreviewUrl && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Draft preview</p>
            {typoPlaceholders.length > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div className="text-xs text-amber-800 space-y-1">
                  <p className="font-medium">
                    Likely placeholder typo{typoPlaceholders.length > 1 ? "s" : ""} — {typoPlaceholders.length > 1 ? "these tokens were" : "this token was"} silently ignored in the render above:
                  </p>
                  <ul className="space-y-0.5">
                    {typoPlaceholders.map(({ found, expected }) => (
                      <li key={found} className="flex items-center gap-1.5">
                        <code className="bg-amber-100 px-1 rounded">{found}</code>
                        <span className="text-amber-600">→</span>
                        <code className="bg-amber-100 px-1 rounded">{expected}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
              <img src={draftPreviewUrl} alt="Draft template preview" className="w-full object-contain" />
            </div>
            <p className="text-xs text-muted-foreground">
              Rendered at 150&nbsp;dpi from the RGB intermediate PDF.{" "}
              {draftBgUrl.trim() ? "Background image from the URL above." : "Using the default background photo — paste a URL above to preview with a custom one."}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is-default"
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="w-4 h-4 rounded border-input"
        />
        <label htmlFor="is-default" className="text-sm">Set as default template</label>
      </div>

      {saveError && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{saveError}</span>
        </div>
      )}

      {missingPlaceholders.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <p className="text-sm text-amber-800">
            Missing placeholder{missingPlaceholders.length > 1 ? "s" : ""}:{" "}
            {missingPlaceholders.map((p, i) => (
              <span key={p}>
                <code className="text-xs bg-amber-100 px-1 rounded">{p}</code>
                {i < missingPlaceholders.length - 1 ? ", " : ""}
              </span>
            ))}
            . The rendered PDF will be blank for {missingPlaceholders.length > 1 ? "those fields" : "that field"}.
          </p>
        </div>
      )}

      {typoPlaceholders.length > 0 && !awaitingTypoConfirm && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-medium">
              Likely placeholder typo{typoPlaceholders.length > 1 ? "s" : ""} detected
            </p>
            <p className="text-xs">
              The following token{typoPlaceholders.length > 1 ? "s" : ""} will be silently ignored by the renderer because {typoPlaceholders.length > 1 ? "they don't" : "it doesn't"} match any recognised placeholder exactly. Did you mean:
            </p>
            <ul className="text-xs space-y-0.5 mt-1">
              {typoPlaceholders.map(({ found, expected }) => (
                <li key={found} className="flex items-center gap-1.5">
                  <code className="bg-amber-100 px-1 rounded">{found}</code>
                  <span className="text-amber-600">→</span>
                  <code className="bg-amber-100 px-1 rounded">{expected}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {awaitingTypoConfirm && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div className="text-sm text-amber-900 space-y-1">
              <p className="font-semibold">
                Confirm save with typo placeholder{typoPlaceholders.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-800">
                The following token{typoPlaceholders.length > 1 ? "s don't" : " doesn't"} match any recognised placeholder and will render as blank in live PDFs:
              </p>
              <ul className="text-xs space-y-0.5 mt-1">
                {typoPlaceholders.map(({ found, expected }) => (
                  <li key={found} className="flex items-center gap-1.5">
                    <code className="bg-amber-100 px-1 rounded">{found}</code>
                    <span className="text-amber-600">→ did you mean</span>
                    <code className="bg-amber-100 px-1 rounded">{expected}</code>
                    <span className="text-amber-600">?</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSaving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                : <><Save className="w-4 h-4 mr-2" />Save anyway</>}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => setAwaitingTypoConfirm(false)}
            >
              Go back and fix
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSaving || awaitingTypoConfirm} size="sm">
          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Save className="w-4 h-4 mr-2" />Save template</>}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type PanelMode = "none" | "create" | { edit: AdTemplate };

export default function AdPdfGenerator() {
  const qc = useQueryClient();

  // Template list (includes archived so the library shows them; render-selector filters them out)
  const { data: templates = [], isLoading: loadingTemplates } = useQuery<AdTemplate[]>({
    queryKey: ["ad-templates"],
    queryFn: fetchTemplates,
  });

  const activeTemplates = templates.filter((t) => !t.archivedAt);

  // Brand assets
  const { data: brandAssets, refetch: refetchBrandAssets } = useQuery<{ logo: string; qr: string }>({
    queryKey: ["brand-assets"],
    queryFn: fetchBrandAssets,
  });

  // Resolvability status — checked separately so the warning reflects the server-side fallback logic
  const { data: brandAssetStatus, refetch: refetchBrandAssetStatus } = useQuery<{ logoResolvable: boolean; qrResolvable: boolean }>({
    queryKey: ["brand-assets-status"],
    queryFn: fetchBrandAssetStatus,
  });
  const hasMissingAssets = !!brandAssetStatus && (!brandAssetStatus.logoResolvable || !brandAssetStatus.qrResolvable);
  const missingAssetsTitle = !brandAssetStatus ? undefined
    : !brandAssetStatus.logoResolvable && !brandAssetStatus.qrResolvable
      ? "Upload the logo and QR code in Brand Assets below before generating"
      : !brandAssetStatus.logoResolvable
      ? "Upload the logo in Brand Assets below before generating"
      : !brandAssetStatus.qrResolvable
      ? "Upload the QR code in Brand Assets below before generating"
      : undefined;

  // Selected template for rendering (only from active templates)
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const effectiveId = selectedId ?? (activeTemplates.find((t) => t.isDefault)?.id ?? activeTemplates[0]?.id ?? null);
  const selectedTemplate = activeTemplates.find((t) => t.id === effectiveId) ?? null;

  // Background URL
  const [bgUrl, setBgUrl] = useState("");
  const [bgUrlCheckStatus, setBgUrlCheckStatus] = useState<"idle" | "checking" | "ok" | "unreachable">("idle");
  // Tracks which URL is currently being probed (for stale-result guard)
  const bgUrlChecking = useRef<string>("");
  // Tracks the last URL whose probe has fully completed — so we know if the current value needs a new check
  const bgUrlLastChecked = useRef<string>("");

  function checkBgUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) { setBgUrlCheckStatus("idle"); return; }
    setBgUrlCheckStatus("checking");
    bgUrlChecking.current = trimmed;
    const img = new Image();
    img.onload = () => {
      if (bgUrlChecking.current !== trimmed) return; // stale
      bgUrlLastChecked.current = trimmed;
      setBgUrlCheckStatus("ok");
    };
    img.onerror = () => {
      if (bgUrlChecking.current !== trimmed) return; // stale
      bgUrlLastChecked.current = trimmed;
      setBgUrlCheckStatus("unreachable");
    };
    img.src = trimmed;
  }

  /**
   * Returns true if the current bgUrl needs a reachability probe before
   * Generate / Preview can safely proceed. Triggers the probe as a side-effect.
   */
  function ensureBgUrlChecked(): boolean {
    const trimmed = bgUrl.trim();
    if (!trimmed) return false; // no URL — nothing to check
    if (bgUrlLastChecked.current === trimmed) return false; // already checked this exact URL
    if (bgUrlChecking.current === trimmed) return true; // probe already in flight — wait
    checkBgUrl(trimmed); // start the probe; buttons will be disabled while pending
    return true;
  }

  // Customise copy & colour
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [headline,    setHeadline]    = useState("");
  const [body,        setBody]        = useState("");
  const [accentColor, setAccentColor] = useState("");
  const customiseOpts: CustomiseOpts  = { headline, body, accentColor };

  // PDF / preview mutations
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevObjectUrl = useRef<string | null>(null);
  // Near-miss warnings returned by the render API (populated after preview or PDF generation)
  const [renderWarnings, setRenderWarnings] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!effectiveId) throw new Error("No template selected");
      return generatePdf(effectiveId, bgUrl, customiseOpts);
    },
    onSuccess: ({ blob, warnings }) => {
      const name = selectedTemplate
        ? `BDE-FarmTrac-${selectedTemplate.slug}-CMYK.pdf`
        : "BDE-FarmTrac-CMYK.pdf";
      triggerDownload(blob, name);
      setRenderWarnings(warnings);
    },
  });

  const previewMutation = useMutation({
    mutationFn: () => {
      if (!effectiveId) throw new Error("No template selected");
      return fetchPreview(effectiveId, bgUrl, customiseOpts);
    },
    onSuccess: ({ url, warnings }) => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = url;
      setPreviewUrl(url);
      setRenderWarnings(warnings);
    },
  });

  function resetRendering() {
    mutation.reset();
    previewMutation.reset();
    setPreviewUrl(null);
    setRenderWarnings([]);
  }

  // CRUD panel
  const [panel, setPanel] = useState<PanelMode>("none");

  // Warnings surfaced from the API after a successful template create/update
  const [apiSaveWarnings, setApiSaveWarnings] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: ({ warnings }) => {
      qc.invalidateQueries({ queryKey: ["ad-templates"] });
      setPanel("none");
      setApiSaveWarnings(warnings);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<AdTemplate, "id" | "createdAt" | "updatedAt" | "archivedAt"> }) =>
      updateTemplate(id, data),
    onSuccess: ({ warnings }) => {
      qc.invalidateQueries({ queryKey: ["ad-templates"] });
      setPanel("none");
      setApiSaveWarnings(warnings);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ad-templates"] }); },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreTemplate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ad-templates"] }); },
  });

  // Presets
  const { data: presets = [] } = useQuery<AdCopyPreset[]>({
    queryKey: ["ad-copy-presets"],
    queryFn: fetchPresets,
  });

  const [presetName, setPresetName]         = useState("");
  const [overwritePreset, setOverwritePreset] = useState(false);
  const [savingPreset, setSavingPreset]     = useState(false);
  const [presetSaveErr, setPresetSaveErr]   = useState<string | null>(null);
  const [presetSaved, setPresetSaved]       = useState(false);

  const savePresetMutation = useMutation({
    mutationFn: savePreset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad-copy-presets"] });
      setPresetName("");
      setPresetSaved(true);
      setSavingPreset(false);
      setTimeout(() => setPresetSaved(false), 2500);
    },
    onError: (err) => {
      setPresetSaveErr(err instanceof Error ? err.message : "Save failed");
      setSavingPreset(false);
    },
  });

  const deletePresetMutation = useMutation({
    mutationFn: deletePreset,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ad-copy-presets"] }); },
  });

  // Inline preset editing
  const [editingPresetId,  setEditingPresetId]  = useState<number | null>(null);
  const [editName,         setEditName]         = useState("");
  const [editHeadline,     setEditHeadline]     = useState("");
  const [editBody,         setEditBody]         = useState("");
  const [editAccentColor,  setEditAccentColor]  = useState("");
  const [editBgUrl,        setEditBgUrl]        = useState("");
  const [editErr,          setEditErr]          = useState<string | null>(null);

  const updatePresetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; headline: string; body: string; accentColor: string; bgUrl: string } }) =>
      updatePreset(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad-copy-presets"] });
      setEditingPresetId(null);
      setEditErr(null);
    },
    onError: (err) => {
      setEditErr(err instanceof Error ? err.message : "Update failed");
    },
  });

  function handleStartEdit(p: AdCopyPreset) {
    // Always clear any stale mutation error immediately — even when re-opening
    // the same preset's form or when the user cancels a discard prompt.
    setEditErr(null);
    updatePresetMutation.reset();
    if (editingPresetId !== null && editingPresetId !== p.id) {
      const orig = presets.find((x) => x.id === editingPresetId);
      const isDirty =
        !orig ||
        editName !== orig.name ||
        editHeadline !== orig.headline ||
        editBody !== orig.body ||
        editAccentColor !== orig.accentColor;
      if (isDirty && !window.confirm("Discard unsaved changes?")) {
        return;
      }
    }
    setEditingPresetId(p.id);
    setEditName(p.name);
    setEditHeadline(p.headline);
    setEditBody(p.body);
    setEditAccentColor(p.accentColor);
    setEditBgUrl(p.bgUrl ?? "");
  }

  function handleCancelEdit() {
    setEditingPresetId(null);
    setEditErr(null);
    updatePresetMutation.reset();
  }

  function handleSubmitEdit(id: number) {
    if (!editName.trim()) { setEditErr("Name is required"); return; }
    setEditErr(null);
    updatePresetMutation.mutate({ id, data: { name: editName.trim(), headline: editHeadline, body: editBody, accentColor: editAccentColor, bgUrl: editBgUrl } });
  }

  function handleSavePreset() {
    if (!presetName.trim()) return;
    setPresetSaveErr(null);
    setSavingPreset(true);
    savePresetMutation.mutate({ name: presetName.trim(), headline, body, accentColor, bgUrl, overwrite: overwritePreset });
  }

  function handleLoadPreset(id: number) {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setHeadline(p.headline);
    setBody(p.body);
    setAccentColor(p.accentColor);
    setBgUrl(p.bgUrl ?? "");
    resetRendering();
  }

  // Protect unsaved preset edits — compute dirty state once and use it to
  // register/clear all navigation guards (sidebar, Back/Forward, beforeunload).
  // nav-guard.ts installs and tears down all three event handlers atomically so
  // there is no window where one guard fires after another has already confirmed.
  const editIsDirty = (() => {
    if (editingPresetId === null) return false;
    const orig = presets.find((x) => x.id === editingPresetId);
    return (
      !orig ||
      editName !== orig.name ||
      editHeadline !== orig.headline ||
      editBody !== orig.body ||
      editAccentColor !== orig.accentColor ||
      editBgUrl !== (orig.bgUrl ?? "")
    );
  })();

  useEffect(() => {
    if (editIsDirty) {
      setNavGuard(() => window.confirm("Discard unsaved changes to this preset?"));
    } else {
      setNavGuard(null);
    }
    // Clear on unmount (save / cancel / navigate away) so no stale guard remains.
    return () => { setNavGuard(null); };
  }, [editIsDirty]);

  return (
    <div className="p-8 max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ad PDF Generator</h1>
          <p className="text-sm text-muted-foreground">
            Produces a press-ready CMYK PDF&nbsp;1.3 for magazine print submissions
          </p>
        </div>
      </div>

      {/* Brand-asset missing warning */}
      {brandAssetStatus && (
        <BrandAssetWarning status={brandAssetStatus} variant="full" />
      )}

      {/* ── Generator section ── */}
      <div className="space-y-6">
        {/* Template selector */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Ad template</label>
          {loadingTemplates ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />Loading templates…
            </div>
          ) : activeTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active templates — create one below.</p>
          ) : (
            <div className="relative">
              <select
                value={effectiveId ?? ""}
                onChange={(e) => { setSelectedId(Number(e.target.value)); resetRendering(); }}
                className="w-full text-sm border border-input rounded-md pl-3 pr-8 py-2 bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {activeTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.widthMm}×{t.heightMm} mm{t.isDefault ? " (default)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          )}
          {selectedTemplate && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Trim: {selectedTemplate.widthMm}×{selectedTemplate.heightMm}&nbsp;mm · Slug: <code>{selectedTemplate.slug}</code>
            </p>
          )}
        </div>

        {/* Background image override */}
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="bg-url">
            Background image URL
            <span className="font-normal text-muted-foreground ml-1">(optional)</span>
          </label>
          <div className="flex gap-2 items-center">
            <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              id="bg-url"
              type="url"
              value={bgUrl}
              onChange={(e) => { setBgUrl(e.target.value); setBgUrlCheckStatus("idle"); bgUrlChecking.current = ""; bgUrlLastChecked.current = ""; resetRendering(); }}
              onBlur={(e) => checkBgUrl(e.target.value)}
              placeholder="https://… (leave blank for default vineyard photo)"
              className="flex-1 text-sm border border-input rounded-md px-3 py-2 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {bgUrlCheckStatus === "checking" && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>
          {bgUrlCheckStatus === "unreachable" && (
            <div className="flex items-center gap-2 mt-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              This URL doesn't appear to serve a loadable image. The generated PDF may have a blank background.
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            Must be a publicly accessible JPEG URL. Leave blank to use the default Pexels vineyard photo.
          </p>
        </div>

        {/* Customise copy & colour */}
        <div className="rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setCustomiseOpen((o) => !o)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-left hover:bg-muted/40 transition-colors"
          >
            <Palette className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="flex-1">Customise copy &amp; colour</span>
            <span className="text-xs text-muted-foreground mr-1">
              {customiseOpen ? "" : "optional overrides"}
            </span>
            {customiseOpen
              ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
              : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </button>
          {customiseOpen && (
            <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/10">

              {/* ── Load preset ── */}
              {presets.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                  <label className="text-sm font-medium whitespace-nowrap">Load preset</label>
                  <div className="relative flex-1">
                    <select
                      defaultValue=""
                      onChange={(e) => { if (e.target.value) handleLoadPreset(Number(e.target.value)); e.target.value = ""; }}
                      className="w-full text-sm border border-input rounded-md pl-3 pr-8 py-2 bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="" disabled>Select a saved preset…</option>
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {deletePresetMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Headline HTML
                  <span className="font-normal text-muted-foreground ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => { setHeadline(e.target.value); resetRendering(); }}
                  placeholder={`Your vineyard.<br><em>Audit-ready.</em>`}
                  className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports inline HTML — use <code className="bg-muted px-1 rounded">&lt;em&gt;</code> for italic accent text, <code className="bg-muted px-1 rounded">&lt;br&gt;</code> for line breaks.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Body copy HTML
                  <span className="font-normal text-muted-foreground ml-1">(optional)</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => { setBody(e.target.value); resetRendering(); }}
                  placeholder="Vine register, phenology, harvest chemistry, spray logs, PDO&amp;nbsp;/&amp;nbsp;PGI records and excise duty — all in one place, accessible anywhere."
                  rows={3}
                  className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The supporting sentence shown below the headline. Inline HTML is allowed.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Accent colour
                  <span className="font-normal text-muted-foreground ml-1">(optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor || "#C49A6C"}
                    onChange={(e) => { setAccentColor(e.target.value); resetRendering(); }}
                    className="h-9 w-12 rounded border border-input cursor-pointer bg-background p-0.5"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => { setAccentColor(e.target.value); resetRendering(); }}
                    placeholder="#C49A6C (default)"
                    className="flex-1 text-sm border border-input rounded-md px-3 py-2 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Controls the gold/amber used for the top bar gradient, feature dots, CTA border, and headline italic. Leave blank for the default gold.
                </p>
              </div>

              {/* ── Save as preset ── */}
              <div className="pt-2 border-t border-border space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <BookmarkPlus className="w-4 h-4 text-muted-foreground" />
                  Save as preset
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => { setPresetName(e.target.value); setPresetSaveErr(null); savePresetMutation.reset(); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSavePreset(); } }}
                    placeholder="Preset name, e.g. Harvest 2026"
                    className="flex-1 text-sm border border-input rounded-md px-3 py-2 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!presetName.trim() || savingPreset}
                    onClick={handleSavePreset}
                  >
                    {presetSaved ? (
                      <><CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-600" />Saved</>
                    ) : savingPreset ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</>
                    ) : (
                      <><Save className="w-3.5 h-3.5 mr-1.5" />Save</>
                    )}
                  </Button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={overwritePreset}
                    onChange={(e) => setOverwritePreset(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">Overwrite existing preset with this name</span>
                </label>
                {presetSaveErr && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />{presetSaveErr}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Stores the current headline, body, accent colour, and background image URL under a name so you can reload them later without re-typing.
                </p>
              </div>

              {/* ── Manage presets (edit / delete) ── */}
              {presets.length > 0 && (
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Saved presets</p>
                  {presets.map((p) => (
                    <div key={p.id}>
                      {editingPresetId === p.id ? (
                        /* ── Inline edit form ── */
                        <div className="rounded-md border border-border bg-muted/20 p-3 space-y-2 my-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => { setEditName(e.target.value); setEditErr(null); if (updatePresetMutation.isError) updatePresetMutation.reset(); }}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmitEdit(p.id); } if (e.key === "Escape") handleCancelEdit(); }}
                              placeholder="Preset name"
                              autoFocus
                              className="flex-1 text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <input
                            type="text"
                            value={editHeadline}
                            onChange={(e) => setEditHeadline(e.target.value)}
                            placeholder="Headline HTML (optional)"
                            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                          />
                          <textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            placeholder="Body copy HTML (optional)"
                            rows={2}
                            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={editAccentColor || "#C49A6C"}
                              onChange={(e) => setEditAccentColor(e.target.value)}
                              className="h-8 w-10 rounded border border-input cursor-pointer bg-background p-0.5 shrink-0"
                            />
                            <input
                              type="text"
                              value={editAccentColor}
                              onChange={(e) => setEditAccentColor(e.target.value)}
                              placeholder="#C49A6C (default)"
                              className="flex-1 text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                            />
                          </div>
                          <input
                            type="url"
                            value={editBgUrl}
                            onChange={(e) => setEditBgUrl(e.target.value)}
                            placeholder="Background image URL (optional)"
                            className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          {editErr && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{editErr}
                            </p>
                          )}
                          <div className="flex items-center gap-2 pt-0.5">
                            <Button
                              type="button"
                              size="sm"
                              disabled={!editName.trim() || updatePresetMutation.isPending}
                              onClick={() => handleSubmitEdit(p.id)}
                            >
                              {updatePresetMutation.isPending
                                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</>
                                : <><Save className="w-3.5 h-3.5 mr-1.5" />Save changes</>}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-3.5 h-3.5 mr-1.5" />Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* ── Normal row ── */
                        <div className="flex items-center gap-2 py-1 group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate font-mono">
                              {[p.headline && `"${p.headline.slice(0, 40)}${p.headline.length > 40 ? "…" : ""}"`, p.accentColor && p.accentColor, p.bgUrl && "bg url saved"].filter(Boolean).join(" · ") || "no overrides"}
                            </p>
                          </div>
                          <button
                            type="button"
                            title={`Load "${p.name}"`}
                            onClick={() => handleLoadPreset(p.id)}
                            className="shrink-0 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title={`Edit "${p.name}"`}
                            onClick={() => handleStartEdit(p)}
                            className="shrink-0 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title={`Delete "${p.name}"`}
                            disabled={deletePresetMutation.isPending}
                            onClick={() => {
                              if (!confirm(`Delete preset "${p.name}"?`)) return;
                              deletePresetMutation.mutate(p.id);
                            }}
                            className="shrink-0 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {deletePresetMutation.isError && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {deletePresetMutation.error instanceof Error ? deletePresetMutation.error.message : "Delete failed"}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spec summary */}
        {selectedTemplate && (
          <div className="rounded-lg bg-muted/50 border border-border p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground mb-1.5">Output specification</p>
            <p>Format · PDF&nbsp;1.3, DeviceCMYK</p>
            <p>Trim · {selectedTemplate.widthMm}&nbsp;×&nbsp;{selectedTemplate.heightMm}&nbsp;mm</p>
            <p>Fonts · Inter (body) + Playfair&nbsp;Display (headlines) — embedded</p>
            <p>Resolution · 300&nbsp;dpi equivalent (vector text, rasterised photo)</p>
            <p>Pipeline · Node renderer → WeasyPrint&nbsp;→&nbsp;RGB&nbsp;PDF · Ghostscript&nbsp;→&nbsp;CMYK&nbsp;PDF&nbsp;1.3</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {brandAssetStatus && (
            <BrandAssetWarning status={brandAssetStatus} variant="compact" />
          )}
          <div className="flex flex-wrap gap-3">
            {/* Wrap in a span when disabled-by-missing-assets so the title tooltip is reachable
                (disabled buttons have pointer-events-none and cannot receive hover events). */}
            <span
              title={hasMissingAssets ? missingAssetsTitle : undefined}
              className={hasMissingAssets ? "cursor-not-allowed" : undefined}
              aria-label={hasMissingAssets ? missingAssetsTitle : undefined}
            >
              <Button
                variant="outline"
                onClick={() => { if (!ensureBgUrlChecked()) previewMutation.mutate(); }}
                disabled={!effectiveId || previewMutation.isPending || mutation.isPending || bgUrlCheckStatus === "checking" || hasMissingAssets}
                size="lg"
                className={hasMissingAssets ? "pointer-events-none" : undefined}
              >
                {previewMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rendering preview…</>
                ) : bgUrlCheckStatus === "checking" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking image URL…</>
                ) : (
                  <><Eye className="w-4 h-4 mr-2" />Preview</>
                )}
              </Button>
            </span>

            <span
              title={hasMissingAssets ? missingAssetsTitle : undefined}
              className={hasMissingAssets ? "cursor-not-allowed" : undefined}
              aria-label={hasMissingAssets ? missingAssetsTitle : undefined}
            >
              <Button
                onClick={() => { if (!ensureBgUrlChecked()) mutation.mutate(); }}
                disabled={!effectiveId || mutation.isPending || previewMutation.isPending || bgUrlCheckStatus === "checking" || hasMissingAssets}
                size="lg"
                className={hasMissingAssets ? "pointer-events-none" : undefined}
              >
                {mutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating — this takes about a minute…</>
                ) : bgUrlCheckStatus === "checking" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking image URL…</>
                ) : (
                  "Generate & Download CMYK PDF"
                )}
              </Button>
            </span>
          </div>

          {(previewMutation.isPending || mutation.isPending) && (
            <p className="text-xs text-muted-foreground">
              Downloading fonts, rendering ad, converting colour space. Please wait — don't navigate away.
            </p>
          )}

          {previewMutation.isError && (
            previewMutation.error instanceof MissingPlaceholdersError ? (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
                <p className="text-sm text-destructive">
                  <span className="font-medium">Cannot generate preview:</span>{" "}
                  the selected template is missing required placeholder{previewMutation.error.missingPlaceholders.length > 1 ? "s" : ""}{" "}
                  {previewMutation.error.missingPlaceholders.map((p, i) => (
                    <span key={p}>
                      <code className="bg-destructive/10 px-1 rounded">{p}</code>{i < (previewMutation.error as MissingPlaceholdersError).missingPlaceholders.length - 1 ? ", " : ""}
                    </span>
                  ))}. Edit the template in the <span className="font-medium">Template library</span> below to add them.
                </p>
              </div>
            ) : previewMutation.error instanceof MissingAssetsError ? (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
                <p className="text-sm text-destructive">
                  <span className="font-medium">Cannot generate preview:</span>{" "}
                  {previewMutation.error.missingAssets.map((a, i) => (
                    <span key={a}>
                      <strong>{a}</strong>{i < (previewMutation.error as MissingAssetsError).missingAssets.length - 1 ? " and " : ""}
                    </span>
                  ))}{" "}
                  {previewMutation.error.missingAssets.length === 1 ? "is" : "are"} missing — upload{" "}
                  {previewMutation.error.missingAssets.length === 1 ? "it" : "them"} in{" "}
                  <a href="#brand-assets" className="underline font-medium">Brand Assets ↓</a> before retrying.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {previewMutation.error instanceof Error
                    ? previewMutation.error.message
                    : "Preview generation failed — check the API server logs."}
                </span>
              </div>
            )
          )}

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              PDF downloaded
            </div>
          )}

          {mutation.isError && (
            mutation.error instanceof MissingPlaceholdersError ? (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
                <p className="text-sm text-destructive">
                  <span className="font-medium">Cannot generate PDF:</span>{" "}
                  the selected template is missing required placeholder{mutation.error.missingPlaceholders.length > 1 ? "s" : ""}{" "}
                  {mutation.error.missingPlaceholders.map((p, i) => (
                    <span key={p}>
                      <code className="bg-destructive/10 px-1 rounded">{p}</code>{i < (mutation.error as MissingPlaceholdersError).missingPlaceholders.length - 1 ? ", " : ""}
                    </span>
                  ))}. Edit the template in the <span className="font-medium">Template library</span> below to add them.
                </p>
              </div>
            ) : mutation.error instanceof MissingAssetsError ? (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
                <p className="text-sm text-destructive">
                  <span className="font-medium">Cannot generate PDF:</span>{" "}
                  {mutation.error.missingAssets.map((a, i) => (
                    <span key={a}>
                      <strong>{a}</strong>{i < (mutation.error as MissingAssetsError).missingAssets.length - 1 ? " and " : ""}
                    </span>
                  ))}{" "}
                  {mutation.error.missingAssets.length === 1 ? "is" : "are"} missing — upload{" "}
                  {mutation.error.missingAssets.length === 1 ? "it" : "them"} in{" "}
                  <a href="#brand-assets" className="underline font-medium">Brand Assets ↓</a> before retrying.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "Generation failed — check the API server logs."}
                </span>
              </div>
            )
          )}
        </div>

        {/* PNG preview */}
        {previewUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Preview</p>
            <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
              <img src={previewUrl} alt="Ad preview" className="w-full object-contain" />
            </div>
            <p className="text-xs text-muted-foreground">
              Rendered at 150&nbsp;dpi from the RGB intermediate PDF. Colours will shift slightly after CMYK conversion.
            </p>
            {renderWarnings.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Likely placeholder typo{renderWarnings.length > 1 ? "s" : ""} detected in template
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 mb-1.5">
                    The following token{renderWarnings.length > 1 ? "s were" : " was"} silently dropped during substitution — {renderWarnings.length > 1 ? "they don't" : "it doesn't"} match any recognised placeholder exactly:
                  </p>
                  <ul className="text-xs space-y-0.5">
                    {renderWarnings.map((w) => (
                      <li key={w} className="font-mono">{w}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1.5">
                    Edit the template in the <span className="font-medium">Template library</span> below to fix the typos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRenderWarnings([])}
                  className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Brand assets section ── */}
      <div id="brand-assets" className="border-t border-border pt-8 space-y-5">
        <div>
          <h2 className="text-base font-semibold">Brand assets</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Logo and QR code embedded into every ad PDF via the{" "}
            <code className="text-xs bg-muted px-1 rounded">{"{{logo}}"}</code> and{" "}
            <code className="text-xs bg-muted px-1 rounded">{"{{qr}}"}</code> placeholders.
            Upload once and all templates use them automatically.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 divide-y divide-border space-y-6">
          <AssetUploader
            label="BDE Farm Trac logo"
            hint="PNG, SVG or WebP — shown top-right in the ad. Recommended: transparent background, max 500 KB."
            assetKey="brand.adLogoDataUrl"
            currentDataUrl={brandAssets?.logo ?? ""}
            onSaved={() => { refetchBrandAssets(); refetchBrandAssetStatus(); }}
          />
          <div className="pt-6">
            <AssetUploader
              label="QR code — bdefarmtrac.co.uk"
              hint="PNG pointing to bdefarmtrac.co.uk — shown bottom-right in the ad. Recommended: square, max 500 KB."
              assetKey="brand.adQrDataUrl"
              currentDataUrl={brandAssets?.qr ?? ""}
              onSaved={() => { refetchBrandAssets(); refetchBrandAssetStatus(); }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          If both fields are blank the renderer falls back to extracting the logo and QR from the legacy on-disk template HTML files.
        </p>
      </div>

      {/* ── Template library section ── */}
      <div className="border-t border-border pt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Template library</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Add, edit, or remove ad layouts. Use <code className="text-xs bg-muted px-1 rounded">{"{{font_css}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{logo}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{bg}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{qr}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{headline}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{body}}"}</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{{accent_color}}"}</code> in your HTML.
            </p>
          </div>
          {panel === "none" && (
            <Button size="sm" variant="outline" onClick={() => { setPanel("create"); setApiSaveWarnings([]); }}>
              <Plus className="w-4 h-4 mr-1.5" />New template
            </Button>
          )}
        </div>

        {/* API save warnings — shown after a successful create/update that had missing or near-miss placeholders */}
        {apiSaveWarnings.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Template saved — {apiSaveWarnings.length === 1 ? "1 warning" : `${apiSaveWarnings.length} warnings`} detected
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 mb-1.5">
                Review the following issue{apiSaveWarnings.length > 1 ? "s" : ""} — {apiSaveWarnings.length > 1 ? "they" : "it"} may cause blank assets in generated PDFs:
              </p>
              <ul className="text-xs space-y-0.5">
                {apiSaveWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setApiSaveWarnings([])}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Create / Edit form */}
        {panel !== "none" && (
          <div className="rounded-lg border border-border p-5 bg-muted/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">
                {panel === "create" ? "New template" : `Edit — ${(panel as { edit: AdTemplate }).edit.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setPanel("none")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {panel === "create" ? (
              <TemplateForm
                key="create"
                onSave={(data) => createMutation.mutate(data)}
                onCancel={() => setPanel("none")}
                isSaving={createMutation.isPending}
                saveError={createMutation.error instanceof Error ? createMutation.error.message : undefined}
                previewHeadline={headline}
                previewBody={body}
                previewAccentColor={accentColor}
              />
            ) : (
              <TemplateForm
                key={(panel as { edit: AdTemplate }).edit.id}
                initial={(panel as { edit: AdTemplate }).edit}
                onSave={(data) => updateMutation.mutate({ id: (panel as { edit: AdTemplate }).edit.id, data })}
                onCancel={() => setPanel("none")}
                isSaving={updateMutation.isPending}
                saveError={updateMutation.error instanceof Error ? updateMutation.error.message : undefined}
                previewHeadline={headline}
                previewBody={body}
                previewAccentColor={accentColor}
              />
            )}
          </div>
        )}

        {/* Template list */}
        {loadingTemplates ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />Loading…
          </div>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No templates yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {templates.map((t) => {
              const isArchived = !!t.archivedAt;
              return (
                <div key={t.id} className={`flex items-center gap-3 px-4 py-3 ${isArchived ? "bg-muted/40" : "bg-background"}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isArchived ? "text-muted-foreground line-through" : ""}`}>{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.widthMm}&nbsp;×&nbsp;{t.heightMm}&nbsp;mm · <code>{t.slug}</code>
                      {t.isDefault && !isArchived && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">default</span>}
                      {isArchived && (
                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                          <Archive className="w-3 h-3" />Archived
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isArchived ? (
                      <button
                        type="button"
                        title="Restore"
                        disabled={restoreMutation.isPending}
                        onClick={() => restoreMutation.mutate(t.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border"
                      >
                        <RotateCcw className="w-3 h-3" />Restore
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => { setPanel({ edit: t }); setApiSaveWarnings([]); }}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Archive"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (!confirm(`Archive template "${t.name}"? It will no longer appear in the render selector but can be restored.`)) return;
                            deleteMutation.mutate(t.id);
                          }}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-amber-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {deleteMutation.isError && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{deleteMutation.error instanceof Error ? deleteMutation.error.message : "Archive failed"}</span>
          </div>
        )}
        {restoreMutation.isError && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{restoreMutation.error instanceof Error ? restoreMutation.error.message : "Restore failed"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BrandAssetWarning({ status, variant }: BrandAssetWarningProps) {
  if (status.logoResolvable && status.qrResolvable) return null;

  const bothMissing = !status.logoResolvable && !status.qrResolvable;
  const uploadPronoun = bothMissing ? "them" : "it";

  if (variant === "full") {
    const heading = bothMissing
      ? "Logo and QR code cannot be found"
      : !status.logoResolvable
      ? "Logo cannot be found"
      : "QR code cannot be found";
    const placeholder = bothMissing ? "these placeholders" : "this placeholder";

    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{heading}</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
            The generated PDF will render {placeholder} blank.
            Neither the database nor the legacy on-disk template files contain a resolvable asset.{" "}
            <a href="#brand-assets" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200">
              Upload {uploadPronoun} in Brand Assets ↓
            </a>
          </p>
        </div>
      </div>
    );
  }

  // compact variant
  const label = bothMissing
    ? "Logo and QR code are missing"
    : !status.logoResolvable
    ? "Logo is missing"
    : "QR code is missing";

  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-3 py-2">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
      <p className="text-sm text-amber-800 dark:text-amber-300">
        {label}{" "}— the rendered output will show blank placeholders.{" "}
        <a href="#brand-assets" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200">
          Upload {uploadPronoun} below ↓
        </a>
      </p>
    </div>
  );
}
