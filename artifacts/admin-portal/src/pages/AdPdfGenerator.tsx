import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getSecret } from "@/lib/auth";
import { Megaphone, ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type Format = "horizontal" | "portrait";

const FORMATS: { value: Format; label: string; dims: string; desc: string }[] = [
  {
    value: "horizontal",
    label: "Half Page Horizontal",
    dims: "190 × 133 mm",
    desc: "Landscape. Current Vineyard magazine booking.",
  },
  {
    value: "portrait",
    label: "Half Page Vertical",
    dims: "90 × 267 mm",
    desc: "Portrait strip. Confirm trim with publisher before use.",
  },
];

const DEFAULT_BG: Record<Format, string> = {
  horizontal: "https://images.pexels.com/photos/943700/pexels-photo-943700.jpeg?auto=compress&cs=tinysrgb&w=1920",
  portrait:   "https://images.pexels.com/photos/442116/pexels-photo-442116.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

const FILENAME: Record<Format, string> = {
  horizontal: "BDE-FarmTrac-HalfPage-Horizontal-CMYK.pdf",
  portrait:   "BDE-FarmTrac-HalfPage-Vertical-CMYK.pdf",
};

async function generatePdf(format: Format, bgUrl: string): Promise<Blob> {
  const secret = getSecret() ?? "";
  const res = await fetch("/api/admin/ad-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    body: JSON.stringify({ format, bgUrl: bgUrl.trim() || undefined }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.blob();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdPdfGenerator() {
  const [format, setFormat] = useState<Format>("horizontal");
  const [bgUrl, setBgUrl]   = useState("");

  const mutation = useMutation({
    mutationFn: () => generatePdf(format, bgUrl),
    onSuccess: (blob) => {
      triggerDownload(blob, FILENAME[format]);
    },
  });

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
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

      <div className="mt-8 space-y-6">
        {/* Format selector */}
        <fieldset>
          <legend className="text-sm font-medium mb-3">Ad format</legend>
          <div className="grid grid-cols-2 gap-3">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setFormat(f.value); mutation.reset(); }}
                className={`text-left rounded-lg border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  format === f.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <p className="font-medium text-sm">{f.label}</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{f.dims}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </button>
            ))}
          </div>
        </fieldset>

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
              onChange={(e) => { setBgUrl(e.target.value); mutation.reset(); }}
              placeholder={DEFAULT_BG[format]}
              className="flex-1 text-sm border border-input rounded-md px-3 py-2 bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Leave blank to use the default Pexels vineyard photo. Must be a publicly accessible JPEG URL.
          </p>
        </div>

        {/* Spec summary */}
        <div className="rounded-lg bg-muted/50 border border-border p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground mb-1.5">Output specification</p>
          <p>Format · PDF&nbsp;1.3, DeviceCMYK</p>
          <p>Trim · {FORMATS.find((f) => f.value === format)?.dims}</p>
          <p>Fonts · Inter (body) + Playfair&nbsp;Display (headlines) — embedded</p>
          <p>Resolution · 300&nbsp;dpi equivalent (vector text, rasterised photo)</p>
          <p>Pipeline · WeasyPrint&nbsp;→&nbsp;RGB&nbsp;PDF · Ghostscript&nbsp;→&nbsp;CMYK&nbsp;PDF&nbsp;1.3</p>
        </div>

        {/* Action */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            size="lg"
            className="w-full sm:w-auto"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating — this takes about a minute…
              </>
            ) : (
              "Generate &amp; Download CMYK PDF"
            )}
          </Button>

          {mutation.isPending && (
            <p className="text-xs text-muted-foreground">
              Downloading fonts, rendering ad, converting to CMYK. Please wait — don't navigate away.
            </p>
          )}

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              PDF downloaded — {FILENAME[format]}
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
      </div>
    </div>
  );
}
