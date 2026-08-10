import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getSecret } from "@/lib/auth";
import {
  Megaphone, ImageIcon, Loader2, CheckCircle, AlertCircle, Eye,
  Plus, Pencil, Trash2, ChevronDown, X, Save, ChevronRight, Palette,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

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
}

// ── API helpers ───────────────────────────────────────────────────────────────

function adminHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", "x-admin-secret": getSecret() ?? "" };
}

async function fetchTemplates(): Promise<AdTemplate[]> {
  const res = await fetch("/api/admin/ad-templates", { headers: adminHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function createTemplate(data: Omit<AdTemplate, "id" | "createdAt" | "updatedAt">): Promise<AdTemplate> {
  const res = await fetch("/api/admin/ad-templates", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

async function updateTemplate(id: number, data: Omit<AdTemplate, "id" | "createdAt" | "updatedAt">): Promise<AdTemplate> {
  const res = await fetch(`/api/admin/ad-templates/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
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

async function generatePdf(templateId: number, bgUrl: string, opts: CustomiseOpts): Promise<Blob> {
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
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.blob();
}

async function fetchPreview(templateId: number, bgUrl: string, opts: CustomiseOpts): Promise<string> {
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
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Template form (create / edit) ─────────────────────────────────────────────

interface TemplateFormProps {
  initial?: AdTemplate;
  onSave: (data: Omit<AdTemplate, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  isSaving: boolean;
  saveError?: string;
}

function TemplateForm({ initial, onSave, onCancel, isSaving, saveError }: TemplateFormProps) {
  const [name,     setName]     = useState(initial?.name     ?? "");
  const [slug,     setSlug]     = useState(initial?.slug     ?? "");
  const [widthMm,  setWidthMm]  = useState(String(initial?.widthMm  ?? "190"));
  const [heightMm, setHeightMm] = useState(String(initial?.heightMm ?? "133"));
  const [htmlBody, setHtmlBody] = useState(initial?.htmlBody ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  // Draft preview state
  const [draftPreviewUrl,     setDraftPreviewUrl]     = useState<string | null>(null);
  const [draftPreviewPending, setDraftPreviewPending] = useState(false);
  const [draftPreviewError,   setDraftPreviewError]   = useState<string | null>(null);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name, slug, widthMm: Number(widthMm), heightMm: Number(heightMm), htmlBody, isDefault });
  }

  async function handleDraftPreview() {
    if (!htmlBody.trim()) return;
    // Increment revision so any older in-flight request is silently dropped on arrival.
    const thisRevision = ++previewRevision.current;
    setDraftPreviewPending(true);
    setDraftPreviewError(null);
    try {
      const res = await fetch("/api/admin/ad-pdf/preview-draft", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          htmlBody,
          bgUrl: "",
          widthMm: Number(widthMm) || 190,
          heightMm: Number(heightMm) || 133,
        }),
      });
      // Discard if a newer request was already dispatched while this one was in flight.
      if (thisRevision !== previewRevision.current) return;
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (prevDraftObjectUrl.current) URL.revokeObjectURL(prevDraftObjectUrl.current);
      prevDraftObjectUrl.current = url;
      setDraftPreviewUrl(url);
    } catch (err) {
      if (thisRevision !== previewRevision.current) return;
      setDraftPreviewError(err instanceof Error ? err.message : "Preview generation failed");
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
              <code className="text-xs bg-muted px-1 rounded">{"{{qr}}"}</code> as placeholders
            </span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!htmlBody.trim() || draftPreviewPending}
            onClick={handleDraftPreview}
          >
            {draftPreviewPending
              ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Rendering…</>
              : <><Eye className="w-3.5 h-3.5 mr-1.5" />Preview</>}
          </Button>
        </div>
        <textarea
          required
          className={`${inputCls} font-mono text-xs resize-y`}
          rows={16}
          value={htmlBody}
          onChange={(e) => { setHtmlBody(e.target.value); setDraftPreviewUrl(null); setDraftPreviewError(null); }}
          placeholder={"<!DOCTYPE html>\n<html lang=\"en\">\n<head>...</head>\n<body>...</body>\n</html>"}
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          The renderer substitutes placeholders then passes the resulting HTML to WeasyPrint. All fonts, logo,
          QR code, and background image are embedded as base64 data-URIs at render time.
        </p>

        {draftPreviewError && (
          <div className="flex items-start gap-2 text-sm text-destructive mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{draftPreviewError}</span>
          </div>
        )}

        {draftPreviewUrl && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Draft preview</p>
            <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
              <img src={draftPreviewUrl} alt="Draft template preview" className="w-full object-contain" />
            </div>
            <p className="text-xs text-muted-foreground">
              Rendered at 150&nbsp;dpi from the RGB intermediate PDF. The preview uses the default background photo.
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

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSaving} size="sm">
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

  // Template list
  const { data: templates = [], isLoading: loadingTemplates } = useQuery<AdTemplate[]>({
    queryKey: ["ad-templates"],
    queryFn: fetchTemplates,
  });

  // Selected template for rendering
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const effectiveId = selectedId ?? (templates.find((t) => t.isDefault)?.id ?? templates[0]?.id ?? null);
  const selectedTemplate = templates.find((t) => t.id === effectiveId) ?? null;

  // Background URL
  const [bgUrl, setBgUrl] = useState("");

  // Customise copy & colour
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [headline,    setHeadline]    = useState("");
  const [body,        setBody]        = useState("");
  const [accentColor, setAccentColor] = useState("");
  const customiseOpts: CustomiseOpts  = { headline, body, accentColor };

  // PDF / preview mutations
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevObjectUrl = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!effectiveId) throw new Error("No template selected");
      return generatePdf(effectiveId, bgUrl, customiseOpts);
    },
    onSuccess: (blob) => {
      const name = selectedTemplate
        ? `BDE-FarmTrac-${selectedTemplate.slug}-CMYK.pdf`
        : "BDE-FarmTrac-CMYK.pdf";
      triggerDownload(blob, name);
    },
  });

  const previewMutation = useMutation({
    mutationFn: () => {
      if (!effectiveId) throw new Error("No template selected");
      return fetchPreview(effectiveId, bgUrl, customiseOpts);
    },
    onSuccess: (url) => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = url;
      setPreviewUrl(url);
    },
  });

  function resetRendering() {
    mutation.reset();
    previewMutation.reset();
    setPreviewUrl(null);
  }

  // CRUD panel
  const [panel, setPanel] = useState<PanelMode>("none");

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ad-templates"] }); setPanel("none"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<AdTemplate, "id" | "createdAt" | "updatedAt"> }) =>
      updateTemplate(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ad-templates"] }); setPanel("none"); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ad-templates"] }); },
  });

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

      {/* ── Generator section ── */}
      <div className="space-y-6">
        {/* Template selector */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Ad template</label>
          {loadingTemplates ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />Loading templates…
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates yet — create one below.</p>
          ) : (
            <div className="relative">
              <select
                value={effectiveId ?? ""}
                onChange={(e) => { setSelectedId(Number(e.target.value)); resetRendering(); }}
                className="w-full text-sm border border-input rounded-md pl-3 pr-8 py-2 bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {templates.map((t) => (
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
              onChange={(e) => { setBgUrl(e.target.value); resetRendering(); }}
              placeholder="https://… (leave blank for default vineyard photo)"
              className="flex-1 text-sm border border-input rounded-md px-3 py-2 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
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
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => previewMutation.mutate()}
              disabled={!effectiveId || previewMutation.isPending || mutation.isPending}
              size="lg"
            >
              {previewMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rendering preview…</>
              ) : (
                <><Eye className="w-4 h-4 mr-2" />Preview</>
              )}
            </Button>

            <Button
              onClick={() => mutation.mutate()}
              disabled={!effectiveId || mutation.isPending || previewMutation.isPending}
              size="lg"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating — this takes about a minute…</>
              ) : (
                "Generate & Download CMYK PDF"
              )}
            </Button>
          </div>

          {(previewMutation.isPending || mutation.isPending) && (
            <p className="text-xs text-muted-foreground">
              Downloading fonts, rendering ad, converting colour space. Please wait — don't navigate away.
            </p>
          )}

          {previewMutation.isError && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {previewMutation.error instanceof Error
                  ? previewMutation.error.message
                  : "Preview generation failed — check the API server logs."}
              </span>
            </div>
          )}

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              PDF downloaded
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Generation failed — check the API server logs."}
              </span>
            </div>
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
          </div>
        )}
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
              <code className="text-xs bg-muted px-1 rounded">{"{{qr}}"}</code> in your HTML.
            </p>
          </div>
          {panel === "none" && (
            <Button size="sm" variant="outline" onClick={() => setPanel("create")}>
              <Plus className="w-4 h-4 mr-1.5" />New template
            </Button>
          )}
        </div>

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
                onSave={(data) => createMutation.mutate(data)}
                onCancel={() => setPanel("none")}
                isSaving={createMutation.isPending}
                saveError={createMutation.error instanceof Error ? createMutation.error.message : undefined}
              />
            ) : (
              <TemplateForm
                initial={(panel as { edit: AdTemplate }).edit}
                onSave={(data) => updateMutation.mutate({ id: (panel as { edit: AdTemplate }).edit.id, data })}
                onCancel={() => setPanel("none")}
                isSaving={updateMutation.isPending}
                saveError={updateMutation.error instanceof Error ? updateMutation.error.message : undefined}
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
            {templates.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 bg-background">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.widthMm}&nbsp;×&nbsp;{t.heightMm}&nbsp;mm · <code>{t.slug}</code>
                    {t.isDefault && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">default</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => setPanel({ edit: t })}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (!confirm(`Delete template "${t.name}"? This cannot be undone.`)) return;
                      deleteMutation.mutate(t.id);
                    }}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteMutation.isError && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{deleteMutation.error instanceof Error ? deleteMutation.error.message : "Delete failed"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
