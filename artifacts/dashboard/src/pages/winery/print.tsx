import { fmtDate, SO2_TEST_STAGE_LABELS, PRESS_ADDITIVE_COLUMNS, CELLAR_OP_LABELS, so2LimitUnverified, so2Ceiling, bottlingSo2Verdict, ADDITIVE_COL } from "./shared";
import { BatchTrailData, fetchStageAttachmentsWithStatus, TrailAttachment, computeSo2Summary, computeVintagePhTaComparisonRows } from "./BatchTrail";
import { useState, useMemo, useEffect, useRef } from "react";
import { useFarmName } from "@/hooks/use-farm-name";
import { sumCellarSo2, cellarSo2RunningTotals } from "@/lib/so2-summary";
import { BOTTLING_COLUMNS, BOTTLING_IMPORT_HEADERS, resolveBottlingField, bottlingImportRecord, parseCsvText, parseBottlingCsv } from "@/lib/bottling-csv";
import { computePrimaryPhTa, computePhTaStagePoints } from "@/lib/ph-ta-stages";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil, Eye, FlaskConical, Wine, Beaker, Gauge, Thermometer, Package, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Wrench, ShieldCheck, FileDown, Printer, Settings2, RefreshCw, GitBranch, Leaf, Search, Upload, PenLine, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import SignatureCanvas from "react-signature-canvas";

import { apiUrl as api } from "@/lib/api";

export const SAFE_PNG_DATA_URL = /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/;
export const MAX_SIG_BYTES = 600_000;

export function sanitiseSignatureForHtml(sig: string | null | undefined): string | null {
  if (!sig) return null;
  if (!SAFE_PNG_DATA_URL.test(sig) || sig.length > MAX_SIG_BYTES) return null;
  return sig;
}

// ── Shared signature-embed decision ──────────────────────────────────────────
// Single source of truth for whether a printed report will embed a digital
// signature. Each report computes one SignatureEmbed and BOTH the button's
// ShieldCheck indicator and the print call consume it, so the indicator can
// never promise an embedded signature the PDF won't actually contain.
export type SignerInfo = { name: string | null; role: string | null; signedAt: string | null; signerDate: string | null };
export type SignatureEmbed = { willEmbed: boolean; sig: string | null; signerInfo: SignerInfo | undefined };
export const NO_EMBED: SignatureEmbed = { willEmbed: false, sig: null, signerInfo: undefined };
export function signatureEmbedFrom(record: Record<string, unknown> | null | undefined): SignatureEmbed {
  // Validate/sanitise first — the PDF helpers only embed signatures that pass
  // sanitiseSignatureForHtml, so willEmbed must be derived from the same
  // validated value or a malformed/oversized stored signature would show the
  // ShieldCheck indicator while the PDF silently omits the signature.
  const sig = record ? sanitiseSignatureForHtml(record.audit_signature ? String(record.audit_signature) : null) : null;
  if (!record || !sig) return NO_EMBED;
  return {
    willEmbed: true,
    sig,
    signerInfo: {
      name: record.audit_signer_name ? String(record.audit_signer_name) : null,
      role: record.audit_signer_role ? String(record.audit_signer_role) : null,
      signedAt: record.audit_signed_at ? String(record.audit_signed_at) : null,
      signerDate: record.audit_signer_date ? String(record.audit_signer_date) : null,
    },
  };
}

export async function printBatchTrail(farmId: number, pressing: Record<string, unknown>, data: BatchTrailData, farmName: string, auditSig?: string | null, signerInfo?: { name: string | null; role: string | null; signedAt: string | null; signerDate?: string | null }, vessels?: Record<string, unknown>[]) {
  // Fetch attachments for the pressing record(s) (best-effort — PDF still prints if this fails).
  // In vintage scope the trail spans every pressing session in data.pressings,
  // so attachments are fetched for ALL of them (keyed per pressing id) and
  // rendered per pressing session. Single-batch scope is unchanged.
  const isVintageScoped = data.scope === "vintageYear";
  const pressId = pressing.id != null ? Number(pressing.id) : null;
  const vintagePressings = isVintageScoped && Array.isArray(data.pressings) && data.pressings.length > 0
    ? data.pressings
    : [pressing];
  // Fermentation / cellar op / SO₂ test / bottling attachments — same best-effort
  // fetch, keyed per record so each stage section can list its own files. Lookup
  // failures don't block printing, but they surface as a visible warning banner
  // so users can tell "no attachments" apart from "lookup failed".
  const [pressingResult, fermResult, cellarResult, so2Result, bottlingResult] = await Promise.all([
    fetchStageAttachmentsWithStatus(farmId, "winery-pressing", vintagePressings),
    fetchStageAttachmentsWithStatus(farmId, "winery-fermentation", data.fermentation),
    fetchStageAttachmentsWithStatus(farmId, "winery-cellar-op", data.cellarOps),
    fetchStageAttachmentsWithStatus(farmId, "winery-so2-test", data.so2Tests),
    fetchStageAttachmentsWithStatus(farmId, "winery-bottling", data.bottling),
  ]);
  const pressingAttachmentsById = pressingResult.map;
  const fermAttachments = fermResult.map;
  const cellarAttachments = cellarResult.map;
  const so2Attachments = so2Result.map;
  const bottlingAttachments = bottlingResult.map;
  const attachmentLookupFailed = [pressingResult, fermResult, cellarResult, so2Result, bottlingResult].some(r => r.lookupFailed);
  // Visible note in the printed report when any attachment lookup failed — the
  // attachments sections below may be incomplete or missing, and the reader
  // must not mistake that for "this batch has no attachments".
  const attachmentWarningHtml = attachmentLookupFailed
    ? `<div style="border:1px solid #f59e0b;background:#fef3c7;border-radius:6px;padding:8px 10px;margin:0 0 10px">
        <p style="font-size:10px;font-weight:700;color:#92400e;margin:0 0 2px">⚠ Attachment list unavailable — lookup failed</p>
        <p style="font-size:9px;color:#92400e;margin:0">Some or all attachment lists could not be retrieved while preparing this report, so attachment sections may be incomplete or missing. Reprint the report to include them.</p>
      </div>`
    : "";
  const pressAttachments: TrailAttachment[] = pressId != null ? (pressingAttachmentsById.get(pressId) ?? []) : [];
  const batchRef = String(pressing.batch_ref ?? "");
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const vintage = pressing.vintage_year ? String(pressing.vintage_year) : null;
  const pressDate = pressing.press_date ? fmtDate(pressing.press_date) : "—";

  // Validate the signature before any HTML injection — reject anything that isn't
  // a strict PNG base64 data URL (guards against stored XSS via the sign-off API).
  const safeSig = sanitiseSignatureForHtml(auditSig);

  const batchRefBadge = (r: Record<string, unknown>) =>
    r.batch_ref
      ? `<span style="font-family:monospace;font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:3px;white-space:nowrap">${escHtml(String(r.batch_ref))}</span>`
      : `<span style="font-size:10px;background:#f3f4f6;color:#6b7280;padding:1px 5px;border-radius:3px">No ref</span>`;

  // ── Vessel lookup — capacity + fill status for cellar ops vessel column ──────
  // If the caller didn't pass pre-loaded vessel data (e.g. query not yet resolved
  // at the moment the print button was clicked), fetch it now so the PDF always
  // has the same data as the on-screen badges.
  let resolvedVessels: Record<string, unknown>[] = vessels ?? [];
  if (!vessels) {
    try {
      const vr = await fetch(api(`farms/${farmId}/winery-vessels`), { credentials: "include" });
      if (vr.ok) {
        const body = await vr.json() as unknown;
        const records = body != null && typeof body === "object" && Array.isArray((body as Record<string, unknown>).records)
          ? (body as Record<string, unknown>).records as Record<string, unknown>[]
          : Array.isArray(body) ? body as Record<string, unknown>[] : [];
        resolvedVessels = records;
      }
    } catch {
      // Non-fatal — PDF will still print with plain vessel refs
    }
  }
  const pdfVesselByRef = new Map<string, Record<string, unknown>>();
  for (const v of resolvedVessels) {
    const ref = v.vessel_ref != null ? String(v.vessel_ref).trim() : "";
    if (ref) pdfVesselByRef.set(ref.toLowerCase(), v);
  }
  // Renders a vessel ref as plain text + capacity badge using the same fill-tier
  // thresholds and labels as the on-screen vesselBadge (≤0% Empty, <25% Low,
  // <75% Partial, ≥75% Full). No interactivity in the PDF.
  const vesselRefWithCapacity = (ref: unknown): string => {
    if (ref == null || ref === "") return "—";
    const trimmed = String(ref).trim();
    const v = pdfVesselByRef.get(trimmed.toLowerCase());
    const capacityL = v?.capacity_litres != null && v.capacity_litres !== ""
      ? parseFloat(String(v.capacity_litres))
      : null;
    const currentVolL = v?.current_volume_litres != null && v.current_volume_litres !== ""
      ? parseFloat(String(v.current_volume_litres))
      : null;
    const isRetired = v ? String(v.status ?? "active") === "retired" : false;
    let capacityBadge = "";
    if (capacityL != null) {
      capacityBadge = `<span style="font-size:9px;background:#f3f4f6;color:#374151;padding:1px 4px;border-radius:3px;margin-left:3px;white-space:nowrap">${capacityL.toFixed(0)} L</span>`;
    }
    let fillBadge = "";
    if (capacityL != null && capacityL > 0 && currentVolL != null) {
      const pct = (currentVolL / capacityL) * 100;
      let fillLabel: string; let fillBg: string; let fillColor: string;
      if (pct <= 0)       { fillLabel = "Empty";   fillBg = "#f3f4f6"; fillColor = "#6b7280"; }
      else if (pct < 25)  { fillLabel = "Low";     fillBg = "#fef3c7"; fillColor = "#92400e"; }
      else if (pct < 75)  { fillLabel = "Partial"; fillBg = "#dbeafe"; fillColor = "#1e40af"; }
      else                { fillLabel = "Full";    fillBg = "#dcfce7"; fillColor = "#166534"; }
      fillBadge = `<span style="font-size:9px;background:${fillBg};color:${fillColor};padding:1px 4px;border-radius:3px;margin-left:3px;white-space:nowrap">${fillLabel}</span>`;
    }
    const retiredBadge = isRetired
      ? `<span style="font-size:9px;background:#fee2e2;color:#b91c1c;padding:1px 4px;border-radius:3px;margin-left:3px;white-space:nowrap">Retired</span>`
      : "";
    return `${escHtml(trimmed)}${capacityBadge}${fillBadge}${retiredBadge}`;
  };

  const sectionHtml = (id: string, title: string, rows: string) =>
    rows ? `<div class="section"><h2 id="${id}">${escHtml(title)}</h2><table>${rows}</table></div>` : "";

  // ── SO₂ compliance summary (computed client-side, same logic as the dialog) ──
  const s2 = computeSo2Summary(pressing, data);
  // compValue: most authoritative figure — drives the overall status badge and progress bar
  const compValue = s2.latestTestTotal ?? s2.runningEstimate;
  const pctOfLimit = s2.activeLimit > 0 ? (compValue / s2.activeLimit) * 100 : 0;
  const so2StatusColor = compValue > s2.activeLimit ? "#b91c1c" : pctOfLimit >= 75 ? "#92400e" : "#166534";
  const so2BgColor     = compValue > s2.activeLimit ? "#fee2e2" : pctOfLimit >= 75 ? "#fef3c7" : "#dcfce7";
  const so2StatusText  = compValue > s2.activeLimit ? "⚠ Exceeds limit" : pctOfLimit >= 75 ? "⚠ Approaching limit" : "✓ Within limit";
  const barPct = Math.min(pctOfLimit, 100).toFixed(0);
  const barColor = compValue > s2.activeLimit ? "#ef4444" : pctOfLimit >= 75 ? "#f59e0b" : "#22c55e";
  // estimateXxx: values based purely on the additions estimate — used for the cumulative row so that
  // the percentage and colour always reflect the running total regardless of test results.
  const estimatePct = s2.activeLimit > 0 ? (s2.runningEstimate / s2.activeLimit) * 100 : 0;
  const estimateBarPct = Math.min(estimatePct, 100).toFixed(0);
  const estimateColor = s2.runningEstimate > s2.activeLimit ? "#b91c1c" : estimatePct >= 75 ? "#92400e" : "#166534";

  // ── pH & TA Analytical History (stage merge logic shared via lib/ph-ta-stages) ──
  const PDF_STAGE_LABELS: Record<string, string> = {
    "at-pressing": "At pressing (juice)", "post-fermentation": "Post-fermentation", "at-bottling": "At bottling",
  };
  const pdfTrendStages = computePhTaStagePoints(
    computePrimaryPhTa(pressing, data.fermentation, data.bottling),
    data.so2Tests
  ).map(p => ({ label: PDF_STAGE_LABELS[p.key] ?? SO2_TEST_STAGE_LABELS[p.key] ?? p.key, ph: p.ph, ta: p.ta }));
  const phTaHasAny = pdfTrendStages.length > 0;

  // ── Vintage pH & TA Comparison (vintage scope only — mirrors the on-screen chart) ──
  // Row logic shared with the CSV export via computeVintagePhTaComparisonRows.
  let vintageComparisonHtml = "";
  if (isVintageScoped) {
    const cmpRows = computeVintagePhTaComparisonRows(data);
    if (cmpRows.length > 0) {
      vintageComparisonHtml = `
<div class="section">
  <h2>Vintage pH &amp; TA Comparison</h2>
  <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:6px;padding:10px 12px">
    <p style="font-size:10px;color:#6b7280;margin-bottom:6px">Per-batch pH and TA across the vintage — bottling values where available, otherwise fermentation-end values. ${cmpRows.length} batch${cmpRows.length !== 1 ? "es" : ""}.</p>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c7d2fe">Batch Ref</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c7d2fe;text-align:right">pH</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c7d2fe;text-align:right">TA (g/L)</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c7d2fe">Stage</th>
      </tr>
      ${cmpRows.map(r => `<tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e7ff;font-family:monospace">${escHtml(r.ref)}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e7ff;text-align:right;font-family:monospace">${r.ph != null ? r.ph.toFixed(2) : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e7ff;text-align:right;font-family:monospace">${r.ta != null ? r.ta.toFixed(1) : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e0e7ff;color:#6b7280">${escHtml(r.source ?? "—")}</td>
      </tr>`).join("")}
    </table>
  </div>
</div>`;
    }
  }

  const phTaHistoryHtml = phTaHasAny ? `
<div class="section">
  <h2>pH &amp; TA Analytical History</h2>
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 12px">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      ${pdfTrendStages.map(s => `
      <div style="background:rgba(255,255,255,0.7);border-radius:4px;padding:8px 10px">
        <p style="font-size:10px;font-weight:600;color:#6b7280;margin-bottom:4px">${s.label}</p>
        <p style="font-size:12px;font-family:monospace;font-weight:700;color:#1e40af">${s.ph != null ? `pH ${s.ph.toFixed(2)}` : `<span style="color:#9ca3af">pH —</span>`}</p>
        <p style="font-size:11px;font-family:monospace;color:#374151;margin-top:2px">${s.ta != null ? `TA ${s.ta.toFixed(1)} g/L` : `<span style="color:#9ca3af">TA —</span>`}</p>
      </div>`).join("")}
    </div>
  </div>
</div>` : "";

  const so2SummaryHtml = s2.hasAny ? `
<div class="section">
  <h2>SO₂ Compliance Summary</h2>
  <div style="background:${so2BgColor};border-radius:6px;padding:10px 12px;margin-bottom:4px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:11px;font-weight:600;color:#374151">Cumulative SO₂ additions vs. legal ceiling</span>
      <span style="font-size:11px;font-weight:700;color:${so2StatusColor}">${so2StatusText}</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb">Stage</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb;text-align:right">Amount</th>
        <th style="background:rgba(255,255,255,0.6);padding:5px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e5e7eb">Notes</th>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">SO₂ at pressing</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasPressingSo2 ? [s2.pressSo2MgKg > 0 ? `${s2.pressSo2MgKg.toFixed(1)} mg/kg` : "", s2.pressSo2MgL > 0 ? `${s2.pressSo2MgL.toFixed(1)} mg/L` : ""].filter(Boolean).join(" + ") : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">From press additions</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">SO₂ at fermentation</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasFermSo2 ? `${s2.fermSo2Total.toFixed(1)} mg/L` : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Sum across fermentation records</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb">Cellar sulfiting</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">${s2.hasCellarSo2 ? `${s2.cellarSo2TotalG.toFixed(1)} g${s2.cellarSo2MgL != null ? ` (≈ ${s2.cellarSo2MgL.toFixed(1)} mg/L)` : ""}` : "—"}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">${s2.hasCellarSo2 && s2.cellarSo2MgL != null && s2.cellarVolumeSource === "vessel" ? "Estimate using vessel capacity" : s2.hasCellarSo2 && s2.cellarSo2MgL != null && s2.cellarVolumeSource === "mixed" ? "Estimate: vessel capacity where available, volume moved otherwise" : s2.hasCellarSo2 && s2.cellarSo2MgL != null ? "Estimate using volume moved" : s2.hasCellarSo2 ? "Volume not recorded — no mg/L estimate" : "No sulfiting operations"}</td>
      </tr>
      <tr style="font-weight:700;background:rgba(255,255,255,0.5)">
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb">Cumulative additions (mg/L)</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;color:${estimateColor}">~${s2.runningEstimate.toFixed(1)} mg/L of ${s2.activeLimit} mg/L</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280">${estimateBarPct}% of ${s2.isOrganic ? "organic" : "conventional"} ceiling${s2.isOrganic ? ` · Conv. ceiling: ${s2.conventionalLimit} mg/L` : ""}</td>
      </tr>
      ${s2.latestTestTotal != null ? `<tr style="font-weight:700">
        <td style="padding:5px 8px">Latest SO₂ test (confirmed)</td>
        <td style="padding:5px 8px;text-align:right;font-family:monospace;color:${so2StatusColor}">${s2.latestTestTotal.toFixed(1)} mg/L${s2.latestTestDate ? ` (${fmtDate(s2.latestTestDate)})` : ""}</td>
        <td style="padding:5px 8px;color:#6b7280">Confirmed measurement — use in preference to estimate above</td>
      </tr>` : ""}
    </table>
    <div style="display:flex;gap:8px;margin-top:8px">
      <div style="flex:1;background:${s2.isOrganic ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"};border:${s2.isOrganic ? "2px solid #166534" : "1px solid #e5e7eb"};border-radius:6px;padding:6px 10px">
        <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280">Organic ceiling${s2.isOrganic ? ` <span style="color:#166534">· ACTIVE LIMIT</span>` : ""}</div>
        <div style="font-size:13px;font-weight:700;font-family:monospace;color:${s2.isOrganic ? "#166534" : "#374151"}">${s2.organicLimit} mg/L</div>
      </div>
      <div style="flex:1;background:${!s2.isOrganic ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"};border:${!s2.isOrganic ? "2px solid #166534" : "1px solid #e5e7eb"};border-radius:6px;padding:6px 10px">
        <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280">Conventional ceiling${!s2.isOrganic ? ` <span style="color:#166534">· ACTIVE LIMIT</span>` : ""}</div>
        <div style="font-size:13px;font-weight:700;font-family:monospace;color:${!s2.isOrganic ? "#166534" : "#374151"}">${s2.conventionalLimit} mg/L</div>
      </div>
    </div>
    <div style="font-size:9px;color:#6b7280;margin-top:3px">${s2.isOrganic ? `Organic batch — organic ceiling applies. Conventional ceiling shown for comparison (${(s2.conventionalLimit - s2.organicLimit).toFixed(0)} mg/L higher).` : `Conventional batch — conventional ceiling applies. Organic ceiling shown for comparison (${(s2.conventionalLimit - s2.organicLimit).toFixed(0)} mg/L lower).`}</div>
    <div style="margin-top:8px">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#6b7280;margin-bottom:2px">
        <span>${s2.wineColour ?? ""} · ${s2.isOrganic ? "Organic" : "Conventional"} ceiling: ${s2.activeLimit} mg/L${s2.isOrganic ? ` · Conv. ceiling: ${s2.conventionalLimit} mg/L` : ""}</span>
        <span>${barPct}% of limit</span>
      </div>
      <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
        <div style="height:6px;width:${barPct}%;background:${barColor};border-radius:3px"></div>
      </div>
    </div>
    ${s2.latestTestTotal == null ? `<p style="font-size:10px;color:#6b7280;font-style:italic;margin-top:6px">* Estimate from addition records only. Run a laboratory SO₂ test to confirm.</p>` : ""}
  </div>
</div>` : "";

  // Pressing summary — expanded block layout matching the on-screen "Pressing Record" card
  const pressingNotes = pressing.notes ? String(pressing.notes) : "";
  const isOrganicPress = pressing.is_organic === true || pressing.is_organic === "true" || pressing.is_organic === 1;

  // Helper: renders a single labelled field cell (label above, value below)
  const pField = (label: string, value: string) =>
    `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:4px;padding:7px 10px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:2px">${escHtml(label)}</p>
      <p style="font-size:11px;font-weight:500;color:#111">${escHtml(value)}</p>
    </div>`;

  // Group press additives by their pressing session. In vintage scope a trail
  // can span multiple pressings — each group renders its own sub-table with the
  // press date and batch ref, instead of one flat merged list.
  const pressAdditiveGroups: { key: string; pressDate: string; batchRef: string | null; operatorName: string | null; notes: string; attachments: TrailAttachment[]; additions: Record<string, unknown>[] }[] = [];
  {
    const groupIndex = new Map<string, number>();
    // Attachments for a pressing session, keyed off the group key (pressing id)
    const groupAttachments = (key: string) => {
      const n = Number(key);
      return Number.isFinite(n) ? (pressingAttachmentsById.get(n) ?? []) : [];
    };
    // In vintage scope, seed one group per pressing session (from data.pressings)
    // so sessions with zero additives — but non-empty notes or attachments —
    // still get a block.
    if (isVintageScoped) {
      for (const p of data.pressings ?? []) {
        const key = String(p.id);
        groupIndex.set(key, pressAdditiveGroups.length);
        pressAdditiveGroups.push({
          key,
          pressDate: p.press_date ? fmtDate(p.press_date) : "—",
          batchRef: p.batch_ref != null && String(p.batch_ref).trim() !== "" ? String(p.batch_ref).trim() : null,
          operatorName: p.operator_name != null && String(p.operator_name).trim() !== "" ? String(p.operator_name).trim() : null,
          notes: p.notes != null ? String(p.notes).trim() : "",
          attachments: groupAttachments(key),
          additions: [],
        });
      }
    }
    for (const a of data.pressAdditions) {
      const key = a.pressing_record_id != null ? String(a.pressing_record_id) : "unknown";
      let idx = groupIndex.get(key);
      if (idx == null) {
        idx = pressAdditiveGroups.length;
        groupIndex.set(key, idx);
        pressAdditiveGroups.push({
          key,
          pressDate: a.pressing_press_date ? fmtDate(a.pressing_press_date) : "—",
          batchRef: a.pressing_batch_ref != null && String(a.pressing_batch_ref).trim() !== "" ? String(a.pressing_batch_ref).trim() : null,
          operatorName: a.pressing_operator_name != null && String(a.pressing_operator_name).trim() !== "" ? String(a.pressing_operator_name).trim() : null,
          notes: a.pressing_notes != null ? String(a.pressing_notes).trim() : "",
          attachments: groupAttachments(key),
          additions: [],
        });
      }
      pressAdditiveGroups[idx].additions.push(a);
    }
    // Drop seeded sessions that ended up with no additives, notes or
    // attachments — they'd render an empty block.
    for (let i = pressAdditiveGroups.length - 1; i >= 0; i--) {
      const g = pressAdditiveGroups[i];
      if (g.additions.length === 0 && !g.notes && g.attachments.length === 0) pressAdditiveGroups.splice(i, 1);
    }
  }

  const pressingBlockHtml = `
<div class="section">
  <h2>Pressing Record</h2>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 12px">

    <!-- Identity row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px">
      ${pField("Press Date", pressDate)}
      ${pField("Batch Ref", batchRef || "—")}
      ${pField("Vintage", vintage ?? "—")}
      ${pField("Organic", isOrganicPress ? "Yes — organic limits" : "No — conventional")}
    </div>

    <!-- Process row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px">
      ${pField("Press Type", String(pressing.press_type ?? "—"))}
      ${pField("Operator", String(pressing.operator_name ?? "—"))}
      ${pField("Free Run Separated", (pressing.free_run_separated === true || pressing.free_run_separated === "true" || pressing.free_run_separated === 1) ? "Yes" : "No")}
      ${pField("Juice Turbidity", String(pressing.juice_turbidity ?? "—"))}
    </div>

    <!-- Yield row -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:6px">
      ${pField("Grapes Pressed (kg)", pressing.grapes_pressed_kg != null && pressing.grapes_pressed_kg !== "" ? parseFloat(String(pressing.grapes_pressed_kg)).toFixed(0) : "—")}
      ${pField("Free Run (L)", pressing.free_run_litres != null && pressing.free_run_litres !== "" ? parseFloat(String(pressing.free_run_litres)).toFixed(1) : "—")}
      ${pField("Press Wine (L)", pressing.press_wine_litres != null && pressing.press_wine_litres !== "" ? parseFloat(String(pressing.press_wine_litres)).toFixed(1) : "—")}
      ${pField("Total Juice (L)", pressing.total_juice_litres != null && pressing.total_juice_litres !== "" ? parseFloat(String(pressing.total_juice_litres)).toFixed(1) : "—")}
      ${pField("Press Efficiency (L/kg)", pressing.press_efficiency_l_per_kg != null && pressing.press_efficiency_l_per_kg !== "" ? parseFloat(String(pressing.press_efficiency_l_per_kg)).toFixed(3) : "—")}
    </div>

    <!-- Juice analysis row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px">
      ${pField("Brix °", pressing.juice_brix != null && pressing.juice_brix !== "" ? parseFloat(String(pressing.juice_brix)).toFixed(1) : "—")}
      ${pField("Juice pH", pressing.juice_ph != null && pressing.juice_ph !== "" ? parseFloat(String(pressing.juice_ph)).toFixed(2) : "—")}
      ${pField("Juice TA (g/L)", pressing.juice_ta_gl != null && pressing.juice_ta_gl !== "" ? parseFloat(String(pressing.juice_ta_gl)).toFixed(1) : "—")}
      ${pField("Analysis Source", String(pressing.juice_analysis_source ?? "—"))}
    </div>

    <!-- Settling row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px${((pressAttachments.length > 0 && !isVintageScoped) || pressAdditiveGroups.length > 0 || (pressingNotes && !isVintageScoped)) ? ";margin-bottom:8px" : ""}">
      ${pField("Settling Method", String(pressing.settling_method ?? "—"))}
      ${pField("Settling Vessel", String(pressing.settling_vessel ?? "—"))}
      ${pField("Settling Time (hrs)", pressing.settling_hours != null && pressing.settling_hours !== "" ? String(pressing.settling_hours) : "—")}
      <div></div>
    </div>

    ${pressAttachments.length > 0 && !isVintageScoped ? `
    <!-- Attachments — single-batch scope only. In vintage scope each pressing
         session's attachments render inside its own group below, so this block
         is skipped to avoid duplicating the primary pressing's files. -->
    <div style="border-top:1px solid #e5e7eb;padding-top:8px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:5px">Attachments (${pressAttachments.length})</p>
      <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px">
        ${pressAttachments.map(a => `<li style="font-size:10px;color:#374151;display:flex;align-items:center;gap:6px">
          <span style="display:inline-block;width:14px;height:14px;background:#dbeafe;border-radius:2px;flex-shrink:0;text-align:center;line-height:14px;font-size:9px;color:#1e40af">📎</span>
          <span style="font-family:monospace">${escHtml(String(a.fileName ?? ""))}</span>
          <span style="color:#9ca3af;font-size:9px">${a.uploadedAt ? fmtDate(a.uploadedAt) : ""}</span>
        </li>`).join("")}
      </ul>
    </div>` : ""}

    ${pressAdditiveGroups.length > 0 ? `
    <!-- Press additives — grouped inside this pressing record. In vintage scope
         a group renders for every pressing session with additives OR notes. -->
    <div style="border-top:1px solid #e5e7eb;padding-top:8px;margin-top:4px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:5px">Press Additives (${data.pressAdditions.length})</p>
      ${pressAdditiveGroups.map(g => `
      ${isVintageScoped ? `<p style="font-size:9px;font-weight:600;color:#374151;margin:6px 0 3px;display:flex;align-items:center;gap:6px">
        <span>Pressing — ${escHtml(g.pressDate)}</span>
        ${g.batchRef ? `<span style="font-family:monospace;font-size:9px;background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:3px">${escHtml(g.batchRef)}</span>` : `<span style="font-size:9px;background:#f3f4f6;color:#6b7280;padding:1px 5px;border-radius:3px">No ref</span>`}
        ${g.operatorName ? `<span style="font-weight:400;color:#6b7280">Operator: ${escHtml(g.operatorName)}</span>` : ""}
        <span style="font-weight:400;color:#9ca3af">(${g.additions.length})</span>
      </p>` : ""}
      ${g.additions.length > 0 ? `<table style="width:100%;border-collapse:collapse;margin-left:0">
        <tr style="background:#f9fafb">
          ${PRESS_ADDITIVE_COLUMNS.map(col => `<th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #d1d5db;text-align:${col.align}">${escHtml(col.pdfLabel)}</th>`).join("")}
        </tr>
        ${g.additions.map(a => `<tr>
          ${PRESS_ADDITIVE_COLUMNS.map(col => `<td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;${col.pdfCellStyle ?? ""}">${escHtml(col.pdfValue(a))}</td>`).join("")}
        </tr>`).join("")}
      </table>` : `<p style="font-size:10px;color:#9ca3af;font-style:italic;margin:2px 0 4px">No additives recorded for this pressing</p>`}
      ${isVintageScoped && g.attachments.length > 0 ? `
      <!-- Per-pressing attachments — vintage scope lists every pressing session's files -->
      <div style="margin:4px 0 6px">
        <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:3px">Attachments (${g.attachments.length})</p>
        <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px">
          ${g.attachments.map(a => `<li style="font-size:10px;color:#374151;display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:14px;height:14px;background:#dbeafe;border-radius:2px;flex-shrink:0;text-align:center;line-height:14px;font-size:9px;color:#1e40af">📎</span>
            <span style="font-family:monospace">${escHtml(String(a.fileName ?? ""))}</span>
            <span style="color:#9ca3af;font-size:9px">${a.uploadedAt ? fmtDate(a.uploadedAt) : ""}</span>
          </li>`).join("")}
        </ul>
      </div>` : ""}
      ${isVintageScoped && g.notes ? `
      <!-- Per-pressing notes — vintage scope mirrors the single-batch "Pressing Notes" block -->
      <div style="margin:4px 0 6px">
        <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:3px">Pressing Notes</p>
        <p style="font-size:11px;color:#374151;font-style:italic">${escHtml(g.notes)}</p>
      </div>` : ""}`).join("")}
    </div>` : ""}

    ${pressingNotes && !isVintageScoped ? `
    <!-- Notes — shown below the additives section so print matches the CSV export.
         In vintage scope each pressing session's notes render inside its own
         additive group above, so this single-batch block is skipped to avoid
         duplicating the same notes twice. -->
    <div style="border-top:1px solid #e5e7eb;padding-top:8px;margin-top:4px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:3px">Pressing Notes</p>
      <p style="font-size:11px;color:#374151;font-style:italic">${escHtml(pressingNotes)}</p>
    </div>` : ""}

  </div>
</div>`;

  // Post-sign-off edit trail — full-width amber row under any signed record that
  // was edited after sign-off (same pattern as the Pressing Report PDF).
  const editHistoryPdfRow = (r: Record<string, unknown>, colCount: number) => {
    const editHistory = Array.isArray(r.edit_history) ? (r.edit_history as Record<string, unknown>[]) : [];
    if (editHistory.length === 0) return "";
    return `<tr>
      <td colspan="${colCount}" style="padding:3px 7px 6px 20px;background:#fffbeb;border-bottom:1px solid #e5e7eb">
        <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#b45309;margin-right:8px">Edited after sign-off:</span>
        ${editHistory.map(h => `<span style="display:inline-block;margin-right:10px;font-size:9.5px;color:#92400e">${escHtml(String(h.note ?? ""))}</span>`).join("")}
      </td>
    </tr>`;
  };

  // Fermentation
  const fermRows = data.fermentation.map(r => `<tr>
    <td>${escHtml(r.start_date ? fmtDate(r.start_date) : "—")}${r.end_date ? ` → ${escHtml(fmtDate(r.end_date))}` : ""}</td>
    <td>${escHtml(r.wine_colour)}</td>
    <td>${vesselRefWithCapacity(r.vessel_ref)}</td>
    <td>${escHtml(r.fermentation_type)}</td>
    <td>${escHtml(r.yeast_strain)}</td>
    <td style="text-align:right">${r.volume_litres != null ? parseFloat(String(r.volume_litres)).toFixed(0) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.so2_at_fermentation_mg_l != null ? `${parseFloat(String(r.so2_at_fermentation_mg_l)).toFixed(1)} mg/L` : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.end_ph != null ? parseFloat(String(r.end_ph)).toFixed(2) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.end_ta_gl != null ? parseFloat(String(r.end_ta_gl)).toFixed(1) : "—"}</td>
    <td>${escHtml(r.operator_name)}</td>
    <td>${batchRefBadge(r as Record<string, unknown>)}</td>
  </tr>${editHistoryPdfRow(r as Record<string, unknown>, 11)}`).join("");

  const fermHeader = `<tr class="header-row"><th>Period</th><th>Colour</th><th>Vessel</th><th>Type</th><th>Yeast</th><th style="text-align:right">Volume (L)</th><th style="text-align:right">SO₂ @ ferm.</th><th style="text-align:right">End pH</th><th style="text-align:right">End TA (g/L)</th><th>Operator</th><th>Batch Ref</th></tr>`;

  // Cellar ops — compute per-op running SO₂ totals in chronological order so the
  // "Running total" column shows how the cumulative estimate built up event-by-event.
  const cellarOpsChrono = [...data.cellarOps].sort((a, b) => String(a.op_date ?? "").localeCompare(String(b.op_date ?? "")));
  const { perOp: cellarPerOp } = cellarSo2RunningTotals(cellarOpsChrono);
  const runningByOp = new Map<Record<string, unknown>, { contributed: boolean; runningMgL: number | null }>();
  cellarOpsChrono.forEach((op, i) => runningByOp.set(op, cellarPerOp[i]));

  const cellarRows = data.cellarOps.map(r => {
    const isSulfiting = String(r.op_type) === "sulfiting";
    const running = runningByOp.get(r);
    const runningCell = isSulfiting && running?.contributed && running.runningMgL != null
      ? `≈ ${running.runningMgL.toFixed(1)} mg/L`
      : "—";
    const so2Detail = r.so2_quantity_g != null
      ? `${parseFloat(String(r.so2_quantity_g)).toFixed(1)} g${r.free_so2_before_mg_l != null ? ` (${parseFloat(String(r.free_so2_before_mg_l)).toFixed(1)} → ${r.free_so2_after_mg_l != null ? parseFloat(String(r.free_so2_after_mg_l)).toFixed(1) : "?"} mg/L)` : ""}`
      : "—";
    return `<tr${isSulfiting ? ' style="background:#fefce8"' : ""}>
    <td>${escHtml(fmtDate(r.op_date))}</td>
    <td>${escHtml(CELLAR_OP_LABELS[String(r.op_type)] ?? r.op_type)}</td>
    <td>${[r.from_vessel_ref, r.to_vessel_ref].filter(v => v != null && v !== "").map(vesselRefWithCapacity).join(" → ")}</td>
    <td style="text-align:right">${r.volume_moved_litres != null ? parseFloat(String(r.volume_moved_litres)).toFixed(1) : "—"}</td>
    <td style="font-family:monospace">${isSulfiting ? so2Detail : "—"}</td>
    <td style="text-align:right;font-family:monospace">${runningCell}</td>
    <td>${escHtml(r.fining_agent)}</td>
    <td>${escHtml(r.operator_name)}</td>
    <td>${batchRefBadge(r as Record<string, unknown>)}</td>
  </tr>${editHistoryPdfRow(r as Record<string, unknown>, 9)}`;
  }).join("");

  const cellarHeader = `<tr class="header-row"><th>Date</th><th>Operation</th><th>Vessel(s)</th><th style="text-align:right">Volume (L)</th><th>SO₂ detail</th><th style="text-align:right">Running total after this op (cumulative mg/L)</th><th>Fining agent</th><th>Operator</th><th>Batch Ref</th></tr>`;

  // SO₂ tests — per-row sign-off presentation. Each signed test row shows a
  // green "✓ Signed" cell and, beneath it, a full-width signature sub-row with
  // the signature image + signer name/role/date — the same details the
  // batch-trail "Reviewed by (auditor)" signature block presents for the
  // pressing sign-off, so an auditor working from the printout can see who
  // verified each test. The signature is sanitised per-row (strict PNG data-URL
  // check) before any HTML injection, same guard as the report-level signature.
  const so2SignerDateStr = (r: Record<string, unknown>): string => {
    // Prefer the auditor-declared declaration date (date-only, parsed as a
    // local calendar date to avoid UTC day-shift), falling back to the
    // digital signature timestamp — same precedence as signOffTooltip / the
    // report signature block.
    if (r.audit_signer_date) {
      const s = String(r.audit_signer_date);
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
      if (!isNaN(d.getTime())) return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    if (r.audit_signed_at) {
      const d = new Date(String(r.audit_signed_at));
      if (!isNaN(d.getTime())) return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    return "";
  };
  const so2SignOffPdfRow = (r: Record<string, unknown>, colCount: number): string => {
    if (r.audit_signature == null || r.audit_signature === "") return "";
    const rowSig = sanitiseSignatureForHtml(String(r.audit_signature));
    const name = r.audit_signer_name ? String(r.audit_signer_name) : "";
    const role = r.audit_signer_role ? String(r.audit_signer_role) : "";
    const dateStr = so2SignerDateStr(r);
    return `<tr>
      <td colspan="${colCount}" style="padding:4px 7px 7px 20px;background:#f0fdf4;border-bottom:1px solid #e5e7eb">
        <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#166534;margin-right:10px;vertical-align:middle">Audit sign-off:</span>
        ${rowSig ? `<img src="${rowSig}" alt="Audit signature" style="max-height:32px;border:1px solid #d1d5db;border-radius:3px;background:#fff;vertical-align:middle;margin-right:10px" />` : ""}
        <span style="font-size:10px;color:#166534;vertical-align:middle">${name ? `Signed by <strong>${escHtml(name)}</strong>` : "Signed"}${role ? ` (${escHtml(role)})` : ""}${dateStr ? ` on ${escHtml(dateStr)}` : ""}${rowSig ? "" : name || dateStr ? " — signed digitally" : " digitally"}</span>
      </td>
    </tr>`;
  };
  let so2HasUnverifiedLimit = false;
  const so2Rows = data.so2Tests.map(r => {
    const compliant = r.so2_compliant === true || r.so2_compliant === "true" || r.so2_compliant === 1;
    const nonCompliant = r.so2_compliant === false || r.so2_compliant === "false" || r.so2_compliant === 0;
    const complianceStyle = nonCompliant ? ' style="color:#b91c1c;font-weight:600"' : (compliant ? ' style="color:#166534"' : "");
    const maxVal = r.max_permitted_mg_l != null && r.max_permitted_mg_l !== "" ? parseFloat(String(r.max_permitted_mg_l)) : null;
    const unverifiedLimit = so2LimitUnverified(r);
    if (unverifiedLimit) so2HasUnverifiedLimit = true;
    return `<tr${unverifiedLimit ? ' style="background:#fffbeb"' : ""}>
    <td>${escHtml(fmtDate(r.test_date))}</td>
    <td>${escHtml(SO2_TEST_STAGE_LABELS[String(r.test_stage)] ?? r.test_stage)}</td>
    <td>${vesselRefWithCapacity(r.vessel_ref)}</td>
    <td style="text-align:right;font-family:monospace">${r.free_so2_mg_l != null ? parseFloat(String(r.free_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.total_so2_mg_l != null ? parseFloat(String(r.total_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${maxVal != null ? maxVal.toFixed(0) : "—"}${unverifiedLimit ? '<br/><span style="color:#b45309;font-size:9px;white-space:nowrap">⚠ Limit unverified — no batch ref</span>' : ""}</td>
    <td${complianceStyle}>${nonCompliant ? "⚠ Exceeds limit" : compliant ? "✓ Compliant" : "—"}</td>
    <td>${escHtml(r.test_method)}</td>
    <td>${batchRefBadge(r as Record<string, unknown>)}</td>
    <td>${(r.audit_signature != null && r.audit_signature !== "") ? '<span style="color:#166534;font-weight:600;white-space:nowrap">✓ Signed</span>' : '<span style="color:#9ca3af">Unsigned</span>'}</td>
  </tr>${so2SignOffPdfRow(r as Record<string, unknown>, 10)}${editHistoryPdfRow(r as Record<string, unknown>, 10)}`;
  }).join("");

  const so2Header = `<tr class="header-row"><th>Date</th><th>Stage</th><th>Vessel</th><th style="text-align:right">Free SO₂ (mg/L)</th><th style="text-align:right">Total SO₂ (mg/L)</th><th style="text-align:right">Max permitted</th><th>Compliance</th><th>Method</th><th>Batch Ref</th><th>Sign-off</th></tr>`;

  // Bottling
  const bottlingRows = data.bottling.map(r => {
    // Shared verdict helper — same logic as the Bottling tab and Batch Trail
    const v = bottlingSo2Verdict(r as Record<string, unknown>);
    const isOrg = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
    const totalSo2 = r.total_so2_mg_l != null ? parseFloat(String(r.total_so2_mg_l)) : null;
    const hasCompliance = v?.compliant != null;
    const exceeds = v?.compliant === false;
    const complianceStyle = exceeds ? ' style="color:#b91c1c;font-weight:600"' : ' style="color:#166534"';
    const complianceText = hasCompliance ? (exceeds ? "⚠ Exceeds limit" : "✓ Compliant") : "—";
    return `<tr>
    <td>${escHtml(fmtDate(r.bottling_date))}</td>
    <td style="font-family:monospace">${escHtml(r.lot_code)}</td>
    <td>${escHtml(r.wine_colour)}</td>
    <td style="text-align:right">${r.volume_bottled_litres != null ? parseFloat(String(r.volume_bottled_litres)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${r.bottles_produced != null ? String(r.bottles_produced) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.free_so2_mg_l != null ? parseFloat(String(r.free_so2_mg_l)).toFixed(1) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${totalSo2 != null ? totalSo2.toFixed(1) : "—"}</td>
    <td style="text-align:right">${v ? `${v.ceiling.toFixed(0)} mg/L ${v.isOrganic ? "organic" : "conventional"}` : "—"}</td>
    <td${hasCompliance ? complianceStyle : ""}>${complianceText}</td>
    <td style="text-align:right;font-family:monospace">${r.ph != null ? parseFloat(String(r.ph)).toFixed(2) : "—"}</td>
    <td style="text-align:right;font-family:monospace">${r.titratable_acidity_gl != null ? parseFloat(String(r.titratable_acidity_gl)).toFixed(1) : "—"}</td>
    <td style="text-align:right">${r.actual_abv_pct != null ? `${parseFloat(String(r.actual_abv_pct)).toFixed(1)}%` : "—"}</td>
    <td>${escHtml(r.closure_type)}</td>
    <td>${isOrg ? "Yes — organic" : "No — conventional"}</td>
    <td>${batchRefBadge(r as Record<string, unknown>)}</td>
  </tr>${editHistoryPdfRow(r as Record<string, unknown>, 15)}`;
  }).join("");

  // Per-stage attachment blocks — rendered under the stage's own table, styled
  // like the pressing attachments block. Omitted entirely when no record in the
  // stage has attachments; records are labelled with date + batch ref.
  const stageAttachmentsHtml = (records: Record<string, unknown>[], attMap: Map<number, TrailAttachment[]>, dateField: string) => {
    const blocks = records.map(r => {
      const files = r.id != null ? attMap.get(Number(r.id)) : undefined;
      if (!files || files.length === 0) return "";
      return `<div style="margin-bottom:5px">
        <p style="font-size:9px;font-weight:600;color:#374151;margin-bottom:2px">${escHtml(fmtDate(r[dateField]))} ${batchRefBadge(r)}</p>
        <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px">
          ${files.map(a => `<li style="font-size:10px;color:#374151;display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:14px;height:14px;background:#dbeafe;border-radius:2px;flex-shrink:0;text-align:center;line-height:14px;font-size:9px;color:#1e40af">📎</span>
            <span style="font-family:monospace">${escHtml(String(a.fileName ?? ""))}</span>
            <span style="color:#9ca3af;font-size:9px">${a.uploadedAt ? fmtDate(a.uploadedAt) : ""}</span>
          </li>`).join("")}
        </ul>
      </div>`;
    }).filter(Boolean).join("");
    if (!blocks) return "";
    return `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;margin-top:-14px;margin-bottom:20px">
      <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin-bottom:5px">Attachments</p>
      ${blocks}
    </div>`;
  };
  const fermAttachmentsHtml = stageAttachmentsHtml(data.fermentation, fermAttachments, "start_date");
  const cellarAttachmentsHtml = stageAttachmentsHtml(data.cellarOps, cellarAttachments, "op_date");
  const so2AttachmentsHtml = stageAttachmentsHtml(data.so2Tests, so2Attachments, "test_date");
  const bottlingAttachmentsHtml = stageAttachmentsHtml(data.bottling, bottlingAttachments, "bottling_date");

  const bottlingHeader = `<tr class="header-row"><th>Date</th><th>Lot Code</th><th>Colour</th><th style="text-align:right">Volume (L)</th><th style="text-align:right">Bottles</th><th style="text-align:right">Free SO₂ (mg/L)</th><th style="text-align:right">Total SO₂ (mg/L)</th><th style="text-align:right">SO₂ ceiling</th><th>Compliance</th><th style="text-align:right">pH</th><th style="text-align:right">TA (g/L)</th><th style="text-align:right">ABV</th><th>Closure</th><th>Organic limits</th><th>Batch Ref</th></tr>`;

  // ── Barrel Provenance Section ─────────────────────────────────────────────
  // Shown only when the batch used an oak barrel as a source vessel for bottling.
  // Fills are grouped per vessel so a report with multiple barrels renders each
  // barrel's complete fill history in its own card. Cooperage maintenance records
  // are listed per barrel immediately after the fill history table.
  const barrelFills = Array.isArray(data.barrelFills) ? data.barrelFills : [];
  const barrelMaintenance = Array.isArray(data.barrelMaintenance) ? data.barrelMaintenance : [];
  const barrelCleaning = Array.isArray(data.barrelCleaning) ? data.barrelCleaning : [];
  const barrelVessels = Array.isArray(data.barrelVessels) ? data.barrelVessels : [];

  const WORK_TYPE_LABELS: Record<string, string> = {
    inspection: "Inspection",
    stave_repair: "Stave repair",
    head_replacement: "Head replacement",
    re_toast: "Re-toast",
    re_char: "Re-char",
    re_cooper: "Re-cooper",
    condemned: "Condemned",
  };

  const fillOakLabelPdf = (fillNumber: number): { label: string; bg: string; color: string } => {
    if (fillNumber === 1) return { label: "New oak (1st fill)", bg: "#fef3c7", color: "#92400e" };
    if (fillNumber === 2) return { label: "2nd fill", bg: "#fefce8", color: "#713f12" };
    if (fillNumber === 3) return { label: "3rd fill", bg: "#f0fdf4", color: "#166534" };
    if (fillNumber === 4) return { label: "4th fill", bg: "#eff6ff", color: "#1e40af" };
    return { label: `${fillNumber}th fill – neutral oak`, bg: "#f9fafb", color: "#6b7280" };
  };

  const barrelDurationLabel = (fillDate: unknown, rackOutDate: unknown): string => {
    const start = fillDate ? new Date(String(fillDate)) : null;
    if (!start || isNaN(start.getTime())) return "—";
    const end = rackOutDate ? new Date(String(rackOutDate)) : null;
    const days = end ? Math.round((end.getTime() - start.getTime()) / 86400000) : null;
    if (days == null) return "Still maturing";
    if (days < 0) return "—";
    if (days < 31) return `${days}d`;
    const months = Math.floor(days / 30.44);
    return months < 12 ? `${months} mo` : `${Math.floor(months / 12)}y ${months % 12}mo`;
  };

  // Vessels with at least one fill record (by vessel_id)
  const vesselIdsWithFills = new Set(barrelFills.map(f => Number(f.vessel_id)));
  // Barrel-type source vessels that were used in bottling but have NO fill records at all.
  // This can be non-empty even when other barrels in the same report do have fills, so the
  // warning must be computed per-vessel and shown alongside (not instead of) normal fill cards.
  const barrelVesselsWithoutFills = barrelVessels.filter(v => !vesselIdsWithFills.has(Number(v.id)));

  let barrelProvenanceHtml = "";
  if (barrelFills.length > 0 || barrelVesselsWithoutFills.length > 0) {
    // Group fills by vessel_id
    const vesselMap = new Map<number, Record<string, unknown>[]>();
    const vesselMeta = new Map<number, Record<string, unknown>>();
    for (const f of barrelFills) {
      const vid = Number(f.vessel_id);
      if (!vesselMap.has(vid)) {
        vesselMap.set(vid, []);
        vesselMeta.set(vid, f);
      }
      vesselMap.get(vid)!.push(f);
    }
    const vesselBlocks = Array.from(vesselMap.entries()).map(([vid, fills]) => {
      const meta = vesselMeta.get(vid)!;
      const cooperage = meta.cooperage ? String(meta.cooperage) : null;
      const oakOrigin = meta.oak_origin ? String(meta.oak_origin) : null;
      const toasting = meta.toasting_level ? String(meta.toasting_level) : null;
      const capacityL = meta.capacity_litres != null ? parseFloat(String(meta.capacity_litres)) : null;

      const metaItems = [
        cooperage ? `Cooperage: <strong>${escHtml(cooperage)}</strong>` : null,
        oakOrigin ? `Oak origin: <strong>${escHtml(oakOrigin)}</strong>` : null,
        toasting ? `Toasting: <strong>${escHtml(toasting)}</strong>` : null,
        capacityL != null ? `Capacity: <strong>${capacityL.toFixed(0)} L</strong>` : null,
      ].filter(Boolean).join(" &nbsp;·&nbsp; ");

      const fillRows = fills.map(f => {
        const fn = Number(f.fill_number);
        const oak = fillOakLabelPdf(fn);
        const inDate = f.fill_date ? fmtDate(f.fill_date) : "—";
        const outDate = f.rack_out_date ? fmtDate(f.rack_out_date) : "—";
        const duration = barrelDurationLabel(f.fill_date, f.rack_out_date);
        const stillIn = !f.rack_out_date;
        const volL = f.volume_litres != null ? parseFloat(String(f.volume_litres)) : null;
        const isCurrentBatch = !!f.fill_batch_ref && !!batchRef &&
          String(f.fill_batch_ref).trim() === batchRef.trim();
        const rowStyle = isCurrentBatch
          ? `background:#fefce8;border-left:4px solid #f59e0b;`
          : "";
        return `<tr style="${rowStyle}">
          <td><span style="display:inline-block;background:${oak.bg};color:${oak.color};font-weight:600;font-size:10px;padding:1px 6px;border-radius:3px">${escHtml(oak.label)}</span></td>
          <td>${f.wine_name ? escHtml(String(f.wine_name)) : "—"}${f.fill_vintage_year ? ` <span style="color:#6b7280">(${escHtml(String(f.fill_vintage_year))})</span>` : ""}</td>
          <td>${f.variety ? escHtml(String(f.variety)) : "—"}</td>
          <td>${inDate}</td>
          <td>${outDate}</td>
          <td style="font-family:monospace;font-weight:600${stillIn ? ";color:#166534" : ""}">${escHtml(duration)}</td>
          <td style="text-align:right">${volL != null ? volL.toFixed(0) + " L" : "—"}</td>
          <td>${f.fill_batch_ref ? `<span style="font-family:monospace;font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:3px">${escHtml(String(f.fill_batch_ref))}</span>` : "—"}${isCurrentBatch ? ` <span style="display:inline-block;font-size:8px;font-weight:700;background:#fef08a;color:#92400e;border:1px solid #f59e0b;padding:1px 4px;border-radius:3px;white-space:nowrap">★ This batch</span>` : ""}</td>
        </tr>`;
      }).join("");

      // Cooperage maintenance records for this vessel
      const vesselMaintRows = barrelMaintenance.filter(m => Number(m.vessel_id) === vid);
      const maintenanceTableHtml = vesselMaintRows.length > 0 ? `
        <div style="margin-top:8px;border-top:1px solid #fed7aa;padding-top:6px">
          <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#92400e;margin-bottom:4px">Cooperage Work (${vesselMaintRows.length})</p>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:rgba(0,0,0,0.04)">
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Date</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Work Type</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Cooperage</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:right">Cost</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Notes</th>
            </tr>
            ${vesselMaintRows.map(m => {
              const workLabel = WORK_TYPE_LABELS[String(m.work_type ?? "")] ?? escHtml(String(m.work_type ?? "—"));
              const costPence = m.cost_pence != null ? parseFloat(String(m.cost_pence)) : null;
              const costStr = costPence != null ? `£${(costPence / 100).toFixed(2)}` : "—";
              const isReToast = String(m.work_type) === "re_toast" || String(m.work_type) === "re_char";
              return `<tr>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${m.maintenance_date ? fmtDate(m.maintenance_date) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px"><span style="font-weight:600${isReToast ? ";color:#b45309" : ""}">${workLabel}</span></td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${m.cooperage_name ? escHtml(String(m.cooperage_name)) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;text-align:right;font-family:monospace">${costStr}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;color:#6b7280">${m.notes ? escHtml(String(m.notes)) : ""}</td>
              </tr>`;
            }).join("")}
          </table>
        </div>` : "";

      // Cleaning records for this vessel
      const vesselCleanRows = barrelCleaning.filter(c => Number(c.vessel_id) === vid);
      const cleaningTableHtml = vesselCleanRows.length > 0 ? `
        <div style="margin-top:8px;border-top:1px solid #fed7aa;padding-top:6px">
          <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#0369a1;margin-bottom:4px">Cleaning History (${vesselCleanRows.length})</p>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:rgba(0,0,0,0.04)">
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Date</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Method</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Product</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Operator</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Rinse</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Notes</th>
            </tr>
            ${vesselCleanRows.map(c => {
              const rinseCompleted = c.rinse_completed === true || c.rinse_completed === "true" || c.rinse_completed === 1;
              return `<tr>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${c.clean_date ? fmtDate(c.clean_date) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;font-weight:600">${c.clean_type ? escHtml(String(c.clean_type)) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${c.cleaning_product ? escHtml(String(c.cleaning_product)) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${c.operator_name ? escHtml(String(c.operator_name)) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${rinseCompleted ? '<span style="color:#166534;font-weight:600">✓ Yes</span>' : '<span style="color:#b91c1c">✗ No</span>'}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;color:#6b7280">${c.notes ? escHtml(String(c.notes)) : ""}</td>
              </tr>`;
            }).join("")}
          </table>
        </div>` : "";

      return `<div style="background:#fff8ed;border:1px solid #fed7aa;border-radius:6px;padding:10px 12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span style="font-size:12px;font-weight:700;color:#374151">🪵 ${escHtml(String(meta.vessel_ref ?? ""))}</span>
          ${metaItems ? `<span style="font-size:10px;color:#6b7280">${metaItems}</span>` : ""}
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr style="background:rgba(0,0,0,0.04)">
            <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Fill</th>
            <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Wine</th>
            <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Variety</th>
            <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">In</th>
            <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Out</th>
            <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Duration</th>
            <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:right">Volume</th>
            <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Batch Ref</th>
          </tr>
          ${fillRows}
        </table>
        ${maintenanceTableHtml}
        ${cleaningTableHtml}
      </div>`;
    }).join("");

    // ── Barrels with cooperage/maintenance or cleaning records but no fill history ──
    // These barrels have known work but fill entries are absent — an audit gap.
    // Rendered as their own amber card so the tables are still visible on the
    // printout, with a prominent ⚠ "No fill history" badge alongside the vessel header.
    // Mirrors the per-barrel warning emitted in exportBatchTrailCsv.
    const noFillMaintItems = barrelVesselsWithoutFills
      .map(v => ({
        v,
        maintRows: barrelMaintenance.filter(m => Number(m.vessel_id) === Number(v.id)),
        cleanRows: barrelCleaning.filter(c => Number(c.vessel_id) === Number(v.id)),
      }))
      .filter(({ maintRows, cleanRows }) => maintRows.length > 0 || cleanRows.length > 0);

    const noFillMaintBlocks = noFillMaintItems.map(({ v, maintRows, cleanRows }) => {
      const capacityL = v.capacity_litres != null ? parseFloat(String(v.capacity_litres)) : null;
      const metaItems = [
        v.cooperage ? `Cooperage: <strong>${escHtml(String(v.cooperage))}</strong>` : null,
        v.oak_origin ? `Oak origin: <strong>${escHtml(String(v.oak_origin))}</strong>` : null,
        v.toasting_level ? `Toasting: <strong>${escHtml(String(v.toasting_level))}</strong>` : null,
        capacityL != null ? `Capacity: <strong>${capacityL.toFixed(0)} L</strong>` : null,
      ].filter(Boolean).join(" &nbsp;·&nbsp; ");

      const maintTableRows = maintRows.map(m => {
        const workLabel = WORK_TYPE_LABELS[String(m.work_type ?? "")] ?? escHtml(String(m.work_type ?? "—"));
        const costPence = m.cost_pence != null ? parseFloat(String(m.cost_pence)) : null;
        const costStr = costPence != null ? `£${(costPence / 100).toFixed(2)}` : "—";
        const isReToast = String(m.work_type) === "re_toast" || String(m.work_type) === "re_char";
        return `<tr>
          <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${m.maintenance_date ? fmtDate(m.maintenance_date) : "—"}</td>
          <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px"><span style="font-weight:600${isReToast ? ";color:#b45309" : ""}">${workLabel}</span></td>
          <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${m.cooperage_name ? escHtml(String(m.cooperage_name)) : "—"}</td>
          <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;text-align:right;font-family:monospace">${costStr}</td>
          <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;color:#6b7280">${m.notes ? escHtml(String(m.notes)) : ""}</td>
        </tr>`;
      }).join("");

      const noFillCleanTableHtml = cleanRows.length > 0 ? `
        <div style="margin-top:8px;border-top:1px solid #bae6fd;padding-top:6px">
          <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#0369a1;margin-bottom:4px">Cleaning History (${cleanRows.length})</p>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:rgba(0,0,0,0.04)">
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Date</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Method</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Product</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Operator</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Rinse</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #bae6fd;text-align:left">Notes</th>
            </tr>
            ${cleanRows.map(c => {
              const rinseCompleted = c.rinse_completed === true || c.rinse_completed === "true" || c.rinse_completed === 1;
              return `<tr>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${c.clean_date ? fmtDate(c.clean_date) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;font-weight:600">${c.clean_type ? escHtml(String(c.clean_type)) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${c.cleaning_product ? escHtml(String(c.cleaning_product)) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${c.operator_name ? escHtml(String(c.operator_name)) : "—"}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px">${rinseCompleted ? '<span style="color:#166534;font-weight:600">✓ Yes</span>' : '<span style="color:#b91c1c">✗ No</span>'}</td>
                <td style="padding:4px 7px;border-bottom:1px solid #f3f4f6;font-size:10px;color:#6b7280">${c.notes ? escHtml(String(c.notes)) : ""}</td>
              </tr>`;
            }).join("")}
          </table>
        </div>` : "";

      return `<div style="background:#fff8ed;border:2px solid #f59e0b;border-radius:6px;padding:10px 12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
          <span style="font-size:12px;font-weight:700;color:#374151">🪵 ${escHtml(String(v.vessel_ref ?? ""))}</span>
          ${metaItems ? `<span style="font-size:10px;color:#6b7280">${metaItems}</span>` : ""}
          <span style="display:inline-flex;align-items:center;gap:4px;background:#fef3c7;border:1px solid #f59e0b;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700;color:#92400e;white-space:nowrap">⚠ No fill history recorded</span>
        </div>
        <div style="background:#fef3c7;border:1px solid #fed7aa;border-radius:4px;padding:6px 10px;margin-bottom:8px">
          <p style="font-size:10px;color:#92400e;margin:0">This barrel has cooperage or cleaning records but no fill history has been logged. Fill records may simply be missing. Auditors should verify the Vessel Register before signing off this report.</p>
        </div>
        ${maintRows.length > 0 ? `<div style="border-top:1px solid #fed7aa;padding-top:6px">
          <p style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#92400e;margin-bottom:4px">Cooperage Work (${maintRows.length})</p>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:rgba(0,0,0,0.04)">
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Date</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Work Type</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Cooperage</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:right">Cost</th>
              <th style="padding:4px 7px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #fed7aa;text-align:left">Notes</th>
            </tr>
            ${maintTableRows}
          </table>
        </div>` : ""}
        ${noFillCleanTableHtml}
      </div>`;
    }).join("");

    // Vessels with no fills AND no maintenance AND no cleaning records — shown as a plain
    // amber reference list (nothing to render in a card).
    const noFillNoMaintVessels = barrelVesselsWithoutFills.filter(
      v => !noFillMaintItems.some(item => Number(item.v.id) === Number(v.id))
    );

    // Per-vessel amber warning for any barrel source vessels that have no fill records
    // and no maintenance records (those with maintenance are rendered above as cards).
    // Rendered even when other barrels in the same section do have fills.
    const noFillWarningHtml = noFillNoMaintVessels.length > 0 ? `
    <div style="border:1px solid #f59e0b;background:#fef3c7;border-radius:6px;padding:10px 14px;margin-bottom:8px">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <span style="font-size:16px;line-height:1.2;flex-shrink:0">⚠</span>
        <div style="flex:1">
          <p style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:4px">No fill records found for ${noFillNoMaintVessels.length === 1 ? "this barrel" : "these barrels"}</p>
          <p style="font-size:10px;color:#92400e;margin-bottom:6px">The following barrel vessel${noFillNoMaintVessels.length === 1 ? " was" : "s were"} used as a source vessel for bottling in this batch trail, but no fill history has been logged. This may mean fill records are simply missing rather than oak genuinely being absent. Auditors should verify the Vessel Register before signing off this report.</p>
          <ul style="margin:0;padding:0;list-style:none">
            ${noFillNoMaintVessels.map(v => `<li style="font-size:10px;color:#92400e;padding:2px 0;display:flex;align-items:center;gap:6px">
              <span style="display:inline-block;width:14px;height:14px;background:#fde68a;border-radius:2px;flex-shrink:0;text-align:center;line-height:14px;font-size:9px">🪵</span>
              <strong>${escHtml(String(v.vessel_ref ?? ""))}</strong>
              ${v.vessel_type ? `<span style="color:#b45309;font-size:9px">(${escHtml(String(v.vessel_type))})</span>` : ""}
              ${v.cooperage ? `<span style="color:#92400e;font-size:9px">· ${escHtml(String(v.cooperage))}</span>` : ""}
              ${v.capacity_litres != null ? `<span style="color:#b45309;font-size:9px">· ${parseFloat(String(v.capacity_litres)).toFixed(0)} L</span>` : ""}
            </li>`).join("")}
          </ul>
          <p style="font-size:9px;color:#b45309;font-style:italic;margin-top:6px">To resolve: open the Vessel Register and log the fill history for the barrel${noFillNoMaintVessels.length === 1 ? "" : "s"} listed above, then reprint this report.</p>
        </div>
      </div>
    </div>` : "";

    barrelProvenanceHtml = `<div class="section">
  <h2>Barrel Provenance</h2>
  ${barrelFills.length > 0 ? `<p style="font-size:10px;color:#6b7280;margin-bottom:8px">Fill history for each oak barrel used as a source vessel for a bottling run in this batch trail. Fill numbers reflect how many times the barrel has been used — influencing oak extraction and wine character.</p>` : ""}
  ${vesselBlocks}${noFillMaintBlocks}${noFillWarningHtml}
</div>`;
  }

  const docTitle = isVintageScoped && vintage
    ? `Full Vintage Trail — Vintage ${escHtml(vintage)} — ${escHtml(farmName)}`
    : `Batch Trail — ${escHtml(batchRef)} — ${escHtml(farmName)}`;

  const coverTitle = isVintageScoped && vintage
    ? `Full Vintage Trail — Vintage ${escHtml(vintage)}`
    : "Batch Trail Report";

  const vintageScopeNote = isVintageScoped && vintage ? `
<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:9px 13px;margin-bottom:14px;display:flex;align-items:flex-start;gap:8px">
  <span style="font-size:15px;line-height:1">ℹ️</span>
  <div>
    <p style="font-size:11px;font-weight:700;color:#1e40af;margin-bottom:2px">Full-vintage view — Vintage ${escHtml(vintage)}</p>
    <p style="font-size:10px;color:#374151">This document covers <strong>all winery records for the entire ${escHtml(vintage)} vintage</strong>, not a single batch. All pressing records, fermentation runs, cellar operations, SO₂ tests, and bottling runs for this vintage year are included. Batch references are shown on each row where available.</p>
  </div>
</div>` : "";

  // Auto-sequencing section numbers — assigned in the order sections appear in
  // the output, not hard-coded into each title string. To add or reorder a
  // section, just adjust the template below; all subsequent numbers update
  // automatically without any manual label edits.
  let _sn = 0;
  const sn = (title: string) => `${++_sn}. ${title}`;
  // Patches the <h2> inside an already-assembled section HTML block (used for
  // pressingBlockHtml and barrelProvenanceHtml which are built earlier as strings).
  const numBlock = (block: string, bareTitle: string) => {
    const id = `s${_sn + 1}`;
    return block.replace(`<h2>${bareTitle}</h2>`, `<h2 id="${id}">${sn(bareTitle)}</h2>`);
  };

  // ── Table of contents — dry-run through the same section conditions to
  // collect (number, title) pairs, then reset _sn so the real h2 calls below
  // produce identical numbers. The TOC is omitted when there is only one section.
  const _tocEntries: { num: number; title: string }[] = [];
  {
    let _tn = 0;
    const te = (title: string) => { _tocEntries.push({ num: ++_tn, title }); };
    if (vintageComparisonHtml) te("Vintage pH & TA Comparison");
    if (so2SummaryHtml)        te("SO\u2082 Compliance Summary");
    if (phTaHistoryHtml)       te("pH & TA Analytical History");
    te("Pressing Record");
    if (fermRows)              te("Fermentation");
    if (cellarRows)            te("Cellar operations");
    if (so2Rows)               te("SO\u2082 tests");
    if (bottlingRows)          te("Bottling runs");
    if (barrelProvenanceHtml)  te("Barrel Provenance");
  }
  _sn = 0; // reset so the actual sn() calls below produce the same numbers
  const tocHtml = _tocEntries.length > 1 ? `
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:14px">
  <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;margin-bottom:5px">Contents</p>
  <div style="display:flex;flex-wrap:wrap;gap:3px 18px">
    ${_tocEntries.map(e => `<a href="#s${e.num}" style="font-size:10px;color:#374151;white-space:nowrap;text-decoration:none"><span style="font-weight:700;font-family:monospace;color:#6b7280">\u00a7${e.num}</span>\u2002${escHtml(e.title)}</a>`).join("")}
  </div>
</div>` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${docTitle}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; padding: 20px 28px; }
  h1 { font-size: 17px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 10px; margin-bottom: 14px; }
  .meta span { margin-right: 14px; }
  .section { margin-bottom: 20px; }
  h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
       color: #374151; border-bottom: 2px solid #d1d5db; padding-bottom: 4px; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f3f4f6; text-align: left; padding: 5px 7px; font-size: 10px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.03em; }
  td { padding: 5px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr.header-row th { border-bottom: 1px solid #d1d5db; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  a { color: inherit; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .signoff { display: none; }
  @media print {
    a[href]::after { content: none !important; }
    body { padding: 0; }
    @page { margin: 16mm 14mm; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>${coverTitle}</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  ${isVintageScoped && vintage ? `<span>Vintage: <strong>${escHtml(vintage)}</strong></span>` : `<span>Batch ref: <strong>${escHtml(batchRef)}</strong></span>${vintage ? `<span>Vintage: <strong>${escHtml(vintage)}</strong></span>` : ""}`}
  ${(pressing.is_organic === true || pressing.is_organic === "true" || pressing.is_organic === 1) ? `<span style="color:#166534;font-weight:600">🌿 Organic batch — reduced SO₂ ceilings apply</span>` : ""}
  <span>Printed: ${escHtml(printedOn)}</span>
</p>
${attachmentWarningHtml}
${vintageScopeNote}
${tocHtml}
${vintageComparisonHtml ? numBlock(vintageComparisonHtml, "Vintage pH &amp; TA Comparison") : ""}
${so2SummaryHtml ? numBlock(so2SummaryHtml, "SO₂ Compliance Summary") : ""}
${phTaHistoryHtml ? numBlock(phTaHistoryHtml, "pH &amp; TA Analytical History") : ""}
${numBlock(pressingBlockHtml, "Pressing Record")}
${fermRows ? sectionHtml(`s${_sn + 1}`, sn("Fermentation"), fermHeader + fermRows) : ""}
${fermAttachmentsHtml}
${cellarRows ? sectionHtml(`s${_sn + 1}`, sn("Cellar operations"), cellarHeader + cellarRows) : ""}
${cellarAttachmentsHtml}
${so2Rows ? sectionHtml(`s${_sn + 1}`, sn("SO₂ tests"), so2Header + so2Rows) : ""}
${so2Rows && so2HasUnverifiedLimit ? `<p style="font-size:9px;color:#b45309;margin:2px 0 8px">⚠ Limit unverified — one or more SO₂ tests carry an organic ceiling but have no batch reference, so the applicable limit cannot be verified against a batch record.</p>` : ""}
${so2AttachmentsHtml}
${bottlingRows ? sectionHtml(`s${_sn + 1}`, sn("Bottling runs"), bottlingHeader + bottlingRows) : ""}
${bottlingAttachmentsHtml}
${barrelProvenanceHtml ? numBlock(barrelProvenanceHtml, "Barrel Provenance") : ""}

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the records contained in this batch trail report are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        ${safeSig ? `<div style="margin-bottom:6px"><img src="${safeSig}" alt="Audit signature" style="max-height:56px;border:1px solid #d1d5db;border-radius:4px;background:#fff;display:block" /></div>` : `<div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Signature${safeSig ? ` — signed digitally` : ""}</p>
        ${signerInfo?.name ? `<div style="padding:4px 0 2px;font-size:11px;font-weight:600;color:#111827">${escHtml(signerInfo.name)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Name</p>
        ${signerInfo?.role ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.role)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Role</p>
        ${(signerInfo?.signerDate || signerInfo?.signedAt) ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.signerDate ? new Date(signerInfo.signerDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date(signerInfo.signedAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p class="footer">Generated by BDE Farm Trac · ${escHtml(printedOn)} · Batch: ${escHtml(batchRef)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── Additions Report — Print helper ─────────────────────────────────────────
export function escHtml(v: unknown): string {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export const SOURCE_LABELS: Record<string, string> = { pressing: "Pressing", fermentation: "Fermentation", cellar: "Cellar" };

// Most-common SO₂ unit per vintage, weighted by record count, computed only for
// vintages that mix units. Single source of truth for the on-screen amber unit
// badges, the printed PDF outlier markers, and the CSV "Unit Differs" column —
// all three use this exact map so they can never disagree.
export function computeSo2DominantUnitByVintage(rows: Record<string, unknown>[]): { mixedVintages: string[]; dominantUnitByVintage: Map<string, string> } {
  const byVintage = new Map<string, Map<string, number>>();
  rows.filter(r => r.category === "so2").forEach(r => {
    const v = String(r.vintage_year ?? "?");
    const u = String(r.unit ?? "");
    const n = Math.max(1, parseInt(String(r.batch_count ?? "1"), 10) || 1);
    if (!byVintage.has(v)) byVintage.set(v, new Map());
    const counts = byVintage.get(v)!;
    counts.set(u, (counts.get(u) ?? 0) + n);
  });
  const mixedVintages: string[] = [];
  const dominantUnitByVintage = new Map<string, string>();
  byVintage.forEach((counts, v) => {
    if (counts.size > 1) {
      mixedVintages.push(v);
      let best = ""; let bestN = -1;
      counts.forEach((n, u) => { if (n > bestN) { bestN = n; best = u; } });
      dominantUnitByVintage.set(v, best);
    }
  });
  return { mixedVintages: mixedVintages.sort(), dominantUnitByVintage };
}

// Shared unit-outlier test for a summary row (SO₂ row whose unit differs from
// the vintage's most common unit — only defined within mixed-unit vintages).
export function so2UnitOutlierDominant(row: Record<string, unknown>, dominantUnitByVintage: Map<string, string>): string | undefined {
  if (row.category !== "so2") return undefined;
  const dominant = dominantUnitByVintage.get(String(row.vintage_year ?? "?"));
  if (!dominant || String(row.unit ?? "") === dominant) return undefined;
  return dominant;
}

export function printAdditionsReport(
  rows: Record<string, unknown>[],
  farmName: string,
  vintageLabel: string,
  auditSig?: string | null,
  signerInfo?: { name: string | null; role: string | null; signedAt: string | null; signerDate?: string | null },
) {
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeSig = sanitiseSignatureForHtml(auditSig);
  const showVintage = rows.length > 0 && rows.some((r, i) => i > 0 && r.vintage_year !== rows[0].vintage_year);

  // Detect mixed SO₂ units per vintage — totals are meaningless when mg/kg and mg/L are combined
  const so2UnitsByVintage = new Map<string, Set<string>>();
  rows.filter(r => r.category === "so2").forEach(r => {
    const v = String(r.vintage_year ?? "?");
    const u = String(r.unit ?? "");
    if (!so2UnitsByVintage.has(v)) so2UnitsByVintage.set(v, new Set());
    so2UnitsByVintage.get(v)!.add(u);
  });
  const mixedUnitVintages = Array.from(so2UnitsByVintage.entries())
    .filter(([, units]) => units.size > 1)
    .map(([v]) => v)
    .sort();
  const hasMixedSo2Units = mixedUnitVintages.length > 0;
  // Unit-outlier flag — same computation as the on-screen amber unit badges
  const { dominantUnitByVintage } = computeSo2DominantUnitByVintage(rows);
  let hasUnitOutliers = false;
  const mixedUnitsNotice = hasMixedSo2Units
    ? `<div style="margin-bottom:14px;padding:10px 14px;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;display:flex;align-items:flex-start;gap:10px">
  <span style="font-size:16px;line-height:1.2">⚠</span>
  <div>
    <strong style="color:#92400e;font-size:12px">Mixed SO₂ units detected${mixedUnitVintages.length === 1 ? ` — vintage ${escHtml(mixedUnitVintages[0])}` : `: vintages ${mixedUnitVintages.map(escHtml).join(", ")}`}</strong>
    <p style="color:#78350f;font-size:11px;margin-top:3px">This report contains SO₂ / KMS records measured in both <strong>mg/kg</strong> (at pressing) and <strong>mg/L</strong> (post-fermentation / cellar). Total and average dose figures combine different units and <strong>cannot be compared or summed</strong>. Use the per-row <em>Unit</em> column to interpret each figure individually.</p>
  </div>
</div>`
    : "";

  const tableRows = rows.map(row => {
    const avgDose = parseFloat(String(row.avg_dose ?? 0));
    const wineColour = String(row.wine_colour ?? "");
    // Use the per-colour organic limit when the colour is known; fall back to 90 (most conservative)
    const organicLimit = so2Ceiling(wineColour, true) ?? 90;
    const warnConv  = row.category === "so2"          && avgDose > 200;
    const warnOrg   = row.category === "so2"          && !warnConv && avgDose > organicLimit;
    const warnAsc   = row.category === "ascorbic_acid" && avgDose > 250;
    const rowStyle  = warnConv ? 'style="background:#fee2e2"'
                    : (warnOrg || warnAsc) ? 'style="background:#fef3c7"' : "";

    // limitCell contains only trusted static text + escaped unit
    // (unit value comes from the shared PRESS_ADDITIVE_COLUMNS definition)
    const unitEsc = escHtml(ADDITIVE_COL.unit.pdfValue(row) || "mg/kg");
    const outlierDominant = so2UnitOutlierDominant(row, dominantUnitByVintage);
    if (outlierDominant) hasUnitOutliers = true;
    const unitCell = outlierDominant
      ? `<span style="color:#92400e;font-weight:600">${unitEsc} *</span><br /><span style="color:#92400e;font-size:9px">unit differs — most records for this vintage use ${escHtml(outlierDominant)}</span>`
      : unitEsc;
    let limitCell = "";
    if (warnConv)      limitCell = `<span style="color:#b91c1c;font-weight:600">⚠ Avg exceeds conv. max (200 ${unitEsc})</span>`;
    else if (warnOrg)  limitCell = `<span style="color:#92400e">⚠ Avg exceeds organic limit (${organicLimit} ${unitEsc})</span>`;
    else if (warnAsc)  limitCell = `<span style="color:#b91c1c;font-weight:600">⚠ Avg exceeds max (250 mg/L)</span>`;
    else if (row.category === "so2")          limitCell = `Conv. max 200 ${unitEsc} · Organic ${organicLimit}`;
    else if (row.category === "ascorbic_acid") limitCell = "Max 250 mg/L";

    const vintageCell = showVintage ? `<td>${escHtml(row.vintage_year ?? "—")}</td>` : "";
    const colourBadge = wineColour
      ? `<span style="display:inline-block;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:#f3e8ff;color:#6b21a8">${escHtml(wineColour)}</span>`
      : `<span style="color:#9ca3af">—</span>`;
    const src = String(row.source ?? "pressing");
    const sourceLabel = SOURCE_LABELS[src] ?? src;
    const sourceBadgeStyle = src === "pressing"
      ? 'background:#ede9fe;color:#5b21b6'
      : src === "fermentation"
      ? 'background:#dbeafe;color:#1d4ed8'
      : 'background:#d1fae5;color:#065f46';
    const sourceBadge = `<span style="display:inline-block;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;${sourceBadgeStyle}">${escHtml(sourceLabel)}</span>`;
    return `<tr ${rowStyle}>
      <td style="font-weight:500">${escHtml(ADDITIVE_COL.additive_name.pdfValue(row))}</td>
      ${vintageCell}
      <td>${colourBadge}</td>
      <td>${sourceBadge}</td>
      <td style="text-align:right">${escHtml(row.batch_count)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.total_dose ?? 0)).toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${avgDose.toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.min_dose ?? 0)).toFixed(1)}</td>
      <td style="text-align:right;font-family:monospace">${parseFloat(String(row.max_dose ?? 0)).toFixed(1)}</td>
      <td style="color:#6b7280;font-size:11px">${unitCell}</td>
      <td style="font-size:11px">${limitCell}</td>
    </tr>`;
  }).join("");

  const vintageHeader = showVintage ? "<th>Vintage</th>" : "";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Additive Usage Report — ${escHtml(farmName)} — ${escHtml(vintageLabel)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 24px 32px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }
  .meta span { margin-right: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 11px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #d1d5db; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .legend { margin-top: 16px; font-size: 10px; color: #6b7280; }
  .legend span { margin-right: 14px; }
  .signoff { display: none; }
  @media print {
    body { padding: 0; }
    @page { margin: 18mm 16mm; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>Additive Usage Report</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  <span>Vintage: <strong>${escHtml(vintageLabel)}</strong></span>
  <span>Printed: ${escHtml(printedOn)}</span>
  <span>${rows.length} additive row${rows.length !== 1 ? "s" : ""}</span>
  <span>Covers: pressing, fermentation &amp; cellar SO₂</span>
</p>
${mixedUnitsNotice}<table>
  <thead><tr>
    <th>Additive</th>
    ${vintageHeader}
    <th>Wine Colour</th>
    <th>Stage</th>
    <th style="text-align:right">Records</th>
    <th style="text-align:right">Total dose</th>
    <th style="text-align:right">Avg / record</th>
    <th style="text-align:right">Min</th>
    <th style="text-align:right">Max</th>
    <th>Unit</th>
    <th>Limit reference</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>
${rows.some(r => r.category === "so2") ? `<div style="margin-top:12px;padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:6px;font-size:10px;color:#6b7280;page-break-inside:avoid">
  <p style="font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#374151;margin-bottom:4px">SO₂ total limits (mg/L total SO₂)</p>
  <p style="margin-bottom:2px"><strong style="color:#15803d">🌿 Organic</strong> &nbsp; Red <strong style="color:#111">100</strong> · White / Rosé / Orange <strong style="color:#111">150</strong> · Sparkling <strong style="color:#111">185</strong></p>
  <p style="margin-bottom:2px"><strong style="color:#374151">Conventional</strong> &nbsp; Red <strong style="color:#111">150</strong> · White / Rosé / Orange <strong style="color:#111">200</strong> · Sparkling <strong style="color:#111">235</strong></p>
  <p style="color:#9ca3af">UK-retained Reg 2019/934 (organic) · Reg 1308/2013 Annex VIII Part B (conventional). Limits are for <em>total</em> SO₂ across the wine's life (mg/L). Individual doses above are recorded in stage-specific units — pressing mg/kg · fermentation mg/L · cellar g — see each row's Unit column.</p>
</div>` : ""}
<p class="legend">
  <span style="color:#b91c1c">⚠ Red = average dose exceeds conventional maximum</span>
  <span style="color:#92400e">⚠ Amber = average dose exceeds organic limit (per-colour: Red 100 · White/Rosé/Orange 150 · Sparkling 185 mg/kg)</span>
  <span>Source: EU Reg 2019/934 (UK-retained law)</span>
  <span>SO₂ units vary by stage: pressing mg/kg · fermentation mg/L · cellar g</span>
  ${hasUnitOutliers ? `<span style="color:#92400e">* Unit differs from the most common SO₂ unit used for that vintage</span>` : ""}
</p>

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the additive usage records contained in this report are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        ${safeSig ? `<div style="margin-bottom:6px"><img src="${safeSig}" alt="Audit signature" style="max-height:56px;border:1px solid #d1d5db;border-radius:4px;background:#fff;display:block" /></div>` : `<div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Signature${safeSig ? ` — signed digitally` : ""}</p>
        ${signerInfo?.name ? `<div style="padding:4px 0 2px;font-size:11px;font-weight:600;color:#111827">${escHtml(signerInfo.name)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Name</p>
        ${signerInfo?.role ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.role)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Role</p>
        ${(signerInfo?.signerDate || signerInfo?.signedAt) ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.signerDate ? new Date(signerInfo.signerDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date(signerInfo.signedAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p style="margin-top:20px;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px">Generated by BDE Farm Trac · ${escHtml(printedOn)} · Vintage: ${escHtml(vintageLabel)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── Pressing Report — Print helper ──────────────────────────────────────────
export function printPressingReport(rows: Record<string, unknown>[], farmName: string, vintageLabel: string, allAdditions: Record<string, unknown>[] = [], auditSig?: string | null, signerInfo?: { name: string | null; role: string | null; signedAt: string | null; signerDate?: string | null }) {
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeSig = sanitiseSignatureForHtml(auditSig);
  const COL_COUNT = 16;

  const tableRows = rows.map(r => {
    const isOrganic = r.is_organic === true || r.is_organic === "true" || r.is_organic === 1;
    const organicBadge = isOrganic
      ? `<span style="display:inline-block;padding:1px 5px;border-radius:9999px;font-size:9px;font-weight:600;background:#dcfce7;color:#166534;margin-left:4px">Organic</span>`
      : "";
    const additions = allAdditions.filter(a => a.pressing_record_id === r.id);
    const additionsRow = additions.length > 0
      ? `<tr class="additions-row">
          <td colspan="${COL_COUNT}" style="padding:3px 7px 6px 20px;background:#f9fafb;border-bottom:1px solid #e5e7eb">
            <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-right:8px">Additives:</span>
            ${additions.map(a => {
              // Values come from the shared PRESS_ADDITIVE_COLUMNS definitions
              const dose = a.dose === "" ? "" : ADDITIVE_COL.dose.csvValue(a);
              const unit = ADDITIVE_COL.unit.pdfValue(a);
              const notes = ADDITIVE_COL.notes.pdfValue(a);
              return `<span style="display:inline-block;margin-right:10px;font-size:9.5px;color:#374151">
                <strong>${escHtml(ADDITIVE_COL.additive_name.pdfValue(a))}</strong>&thinsp;${escHtml(dose)}${escHtml(unit ? "\u202f" + unit : "")}${notes ? `&ensp;<span style="color:#9ca3af">${escHtml(notes)}</span>` : ""}
              </span>`;
            }).join("")}
          </td>
        </tr>`
      : "";
    const editHistory = Array.isArray(r.edit_history) ? (r.edit_history as Record<string, unknown>[]) : [];
    const editHistoryRow = editHistory.length > 0
      ? `<tr class="additions-row">
          <td colspan="${COL_COUNT}" style="padding:3px 7px 6px 20px;background:#fffbeb;border-bottom:1px solid #e5e7eb">
            <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#b45309;margin-right:8px">Edited after sign-off:</span>
            ${editHistory.map(h =>
              `<span style="display:inline-block;margin-right:10px;font-size:9.5px;color:#92400e">${escHtml(String(h.note ?? ""))}</span>`
            ).join("")}
          </td>
        </tr>`
      : "";
    return `<tr>
      <td style="white-space:nowrap">${escHtml(r.press_date ? new Date(r.press_date as string).toLocaleDateString("en-GB") : "—")}</td>
      <td>${escHtml(r.vintage_year ?? "—")}</td>
      <td style="font-family:monospace;font-size:10px">${escHtml(r.batch_ref ?? "—")}${organicBadge}</td>
      <td>${escHtml(r.press_type ?? "—")}</td>
      <td style="text-align:right;font-family:monospace">${r.grapes_pressed_kg != null && r.grapes_pressed_kg !== "" ? parseFloat(String(r.grapes_pressed_kg)).toFixed(0) : "—"}</td>
      <td style="text-align:right;font-family:monospace">${r.free_run_litres != null && r.free_run_litres !== "" ? parseFloat(String(r.free_run_litres)).toFixed(1) : "—"}</td>
      <td style="text-align:right;font-family:monospace">${r.press_wine_litres != null && r.press_wine_litres !== "" ? parseFloat(String(r.press_wine_litres)).toFixed(1) : "—"}</td>
      <td style="text-align:right;font-family:monospace">${r.total_juice_litres != null && r.total_juice_litres !== "" ? parseFloat(String(r.total_juice_litres)).toFixed(1) : "—"}</td>
      <td style="text-align:right;font-family:monospace">${r.press_efficiency_l_per_kg != null && r.press_efficiency_l_per_kg !== "" ? parseFloat(String(r.press_efficiency_l_per_kg)).toFixed(3) : "—"}</td>
      <td style="text-align:right">${r.juice_brix != null && r.juice_brix !== "" ? parseFloat(String(r.juice_brix)).toFixed(1) : "—"}</td>
      <td style="text-align:right">${r.juice_ph != null && r.juice_ph !== "" ? parseFloat(String(r.juice_ph)).toFixed(2) : "—"}</td>
      <td style="text-align:right">${r.juice_ta_gl != null && r.juice_ta_gl !== "" ? parseFloat(String(r.juice_ta_gl)).toFixed(1) : "—"}</td>
      <td>${escHtml(r.juice_turbidity ?? "—")}</td>
      <td>${escHtml(r.operator_name ?? "—")}</td>
      <td>${escHtml(r.settling_method ?? "—")}</td>
      <td style="font-size:10px;color:#6b7280">${escHtml(r.notes ?? "")}</td>
    </tr>${additionsRow}${editHistoryRow}`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Pressing Report — ${escHtml(farmName)} — ${escHtml(vintageLabel)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; padding: 24px 32px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }
  .meta span { margin-right: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
  th { background: #f3f4f6; text-align: left; padding: 6px 7px; font-size: 10px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #d1d5db; white-space: nowrap; }
  td { padding: 5px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .signoff { display: none; }
  @media print {
    body { padding: 0; }
    @page { margin: 18mm 14mm; size: landscape; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>Pressing Report</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  <span>Vintage: <strong>${escHtml(vintageLabel)}</strong></span>
  <span>Printed: ${escHtml(printedOn)}</span>
  <span>${rows.length} record${rows.length !== 1 ? "s" : ""}</span>
</p>
<table>
  <thead><tr>
    <th>Date</th>
    <th>Vintage</th>
    <th>Batch Ref</th>
    <th>Press Type</th>
    <th style="text-align:right">Grapes (kg)</th>
    <th style="text-align:right">Free Run (L)</th>
    <th style="text-align:right">Press Wine (L)</th>
    <th style="text-align:right">Total Juice (L)</th>
    <th style="text-align:right">L/kg</th>
    <th style="text-align:right">Brix °</th>
    <th style="text-align:right">pH</th>
    <th style="text-align:right">TA (g/L)</th>
    <th>Turbidity</th>
    <th>Operator</th>
    <th>Settling</th>
    <th>Notes</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the pressing records contained in this report are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        ${safeSig ? `<div style="margin-bottom:6px"><img src="${safeSig}" alt="Audit signature" style="max-height:56px;border:1px solid #d1d5db;border-radius:4px;background:#fff;display:block" /></div>` : `<div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Signature${safeSig ? ` — signed digitally` : ""}</p>
        ${signerInfo?.name ? `<div style="padding:4px 0 2px;font-size:11px;font-weight:600;color:#111827">${escHtml(signerInfo.name)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Name</p>
        ${signerInfo?.role ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.role)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Role</p>
        ${(signerInfo?.signerDate || signerInfo?.signedAt) ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.signerDate ? new Date(signerInfo.signerDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date(signerInfo.signedAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p style="margin-top:20px;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px">Generated by BDE Farm Trac · ${escHtml(printedOn)} · Vintage: ${escHtml(vintageLabel)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── SO₂ Transaction Log — Print helper ──────────────────────────────────────
export function printSo2TransactionLog(
  rows: Record<string, unknown>[],
  farmName: string,
  scopeLabel: string,
  auditSig?: string | null,
  signerInfo?: { name: string | null; role: string | null; signedAt: string | null; signerDate?: string | null },
) {
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const safeSig = sanitiseSignatureForHtml(auditSig);

  // Unit-outlier audit cue — same dominant-unit map as the additions report PDF
  // and the transaction-log CSV (computeSo2DominantUnitByVintage), so the
  // printed audit copy carries the same marker as every other output.
  const { dominantUnitByVintage } = computeSo2DominantUnitByVintage(rows);
  let hasUnitOutliers = false;

  const tableRows = rows.map(r => {
    const src = String(r.source ?? "pressing");
    const stageLabel = SOURCE_LABELS[src] ?? src;
    // Dose/unit formatting comes from the shared PRESS_ADDITIVE_COLUMNS definitions
    const dosePdf = ADDITIVE_COL.dose.pdfValue(r);
    const unitEsc = escHtml(ADDITIVE_COL.unit.pdfValue(r));
    const outlierDominant = so2UnitOutlierDominant(r, dominantUnitByVintage);
    if (outlierDominant) hasUnitOutliers = true;
    const unitPart = outlierDominant
      ? `<span style="color:#92400e;font-weight:600">${unitEsc} *</span><br /><span style="color:#92400e;font-size:9px;font-family:'Segoe UI',Arial,sans-serif">unit differs — most records for this vintage use ${escHtml(outlierDominant)}</span>`
      : unitEsc;
    const doseVal = dosePdf === "—" || r.dose === ""
      ? "—"
      : `${dosePdf} ${unitPart}`;
    // Dose rate (mg/L) — cellar sulfiting rows only; mirrors on-screen table and CSV export
    let doseRateVal = "—";
    if (r.source === "cellar" && r.so2_quantity_g != null) {
      const g = parseFloat(String(r.so2_quantity_g));
      if (!isNaN(g)) {
        const capacity = r.vessel_capacity_litres != null ? parseFloat(String(r.vessel_capacity_litres)) : NaN;
        const moved = r.volume_moved_litres != null ? parseFloat(String(r.volume_moved_litres)) : NaN;
        if (!isNaN(capacity) && capacity > 0) doseRateVal = `${((g * 1000) / capacity).toFixed(1)}&nbsp;<span style="color:#6b7280">V</span>`;
        else if (!isNaN(moved) && moved > 0) doseRateVal = `${((g * 1000) / moved).toFixed(1)}&nbsp;<span style="color:#6b7280">M</span>`;
      }
    }
    return `<tr>
      <td style="white-space:nowrap">${escHtml(r.record_date ? new Date(r.record_date as string).toLocaleDateString("en-GB") : "—")}</td>
      <td style="font-family:monospace;font-size:10px">${escHtml(r.batch_ref ?? "—")}</td>
      <td>${escHtml(r.wine_colour ?? "—")}</td>
      <td>${escHtml(r.vintage_year ?? "—")}</td>
      <td>${escHtml(stageLabel)}</td>
      <td>${escHtml(ADDITIVE_COL.additive_name.pdfValue(r) || "—")}</td>
      <td style="text-align:right;font-family:monospace">${doseVal}</td>
      <td style="text-align:right;font-family:monospace">${doseRateVal}</td>
      <td>${escHtml(r.operator_name ?? "—")}</td>
      <td>${escHtml(r.vessel_ref ?? "—")}</td>
      <td style="font-size:10px;color:#6b7280">${escHtml(ADDITIVE_COL.notes.pdfValue(r))}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>SO₂ Transaction Log — ${escHtml(farmName)} — ${escHtml(scopeLabel)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; padding: 24px 32px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }
  .meta span { margin-right: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 10px; font-weight: 600;
       text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #d1d5db; white-space: nowrap; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .signoff { display: none; }
  @media print {
    body { padding: 0; }
    @page { margin: 18mm 14mm; size: landscape; }
    .signoff { display: block; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>SO₂ &amp; Additive Transaction Log</h1>
<p class="meta">
  <span><strong>${escHtml(farmName)}</strong></span>
  <span>Scope: <strong>${escHtml(scopeLabel)}</strong></span>
  <span>Printed: ${escHtml(printedOn)}</span>
  <span>${rows.length} row${rows.length !== 1 ? "s" : ""}</span>
</p>
<table>
  <thead><tr>
    <th>Date</th>
    <th>Batch Ref</th>
    <th>Wine Colour</th>
    <th>Vintage</th>
    <th>Stage</th>
    <th>Additive</th>
    <th style="text-align:right">Dose</th>
    <th style="text-align:right">Dose Rate (mg/L)*</th>
    <th>Operator</th>
    <th>Vessel</th>
    <th>Notes</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<p style="margin-top:6px;font-size:9px;color:#6b7280">* Dose Rate (mg/L) is estimated for cellar sulfiting rows only: <strong>V</strong> = based on vessel capacity, <strong>M</strong> = based on volume moved.</p>
${hasUnitOutliers ? `<p style="margin-top:4px;font-size:9px;color:#92400e">* Unit differs from the most common SO₂ unit used for that vintage</p>` : ""}

<div class="signoff">
  <div style="margin-top:28px;border-top:2px solid #374151;padding-top:16px">
    <p style="font-size:10px;font-style:italic;color:#374151;margin-bottom:18px">I confirm that the SO₂ and additive records contained in this transaction log are accurate to the best of my knowledge.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Winemaker declaration</p>
        <div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Signature</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Name</p>
        <div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:18px">Reviewed by (auditor)</p>
        ${safeSig ? `<div style="margin-bottom:6px"><img src="${safeSig}" alt="Audit signature" style="max-height:56px;border:1px solid #d1d5db;border-radius:4px;background:#fff;display:block" /></div>` : `<div style="border-bottom:1px solid #374151;height:28px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Signature${safeSig ? ` — signed digitally` : ""}</p>
        ${signerInfo?.name ? `<div style="padding:4px 0 2px;font-size:11px;font-weight:600;color:#111827">${escHtml(signerInfo.name)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Name</p>
        ${signerInfo?.role ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.role)}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Role</p>
        ${(signerInfo?.signerDate || signerInfo?.signedAt) ? `<div style="padding:4px 0 2px;font-size:11px;color:#374151">${escHtml(signerInfo.signerDate ? new Date(signerInfo.signerDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date(signerInfo.signedAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</div>` : `<div style="border-bottom:1px solid #374151;height:22px;margin-top:14px;margin-bottom:3px"></div>`}
        <p style="font-size:9px;color:#6b7280">Date</p>
      </div>
    </div>
  </div>
</div>

<p style="margin-top:20px;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px">Generated by BDE Farm Trac · ${escHtml(printedOn)} · ${escHtml(scopeLabel)}</p>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ─── Pressing Records Tab ─────────────────────────────────────────────────────
