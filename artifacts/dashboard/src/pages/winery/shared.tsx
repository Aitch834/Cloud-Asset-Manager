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

// ─── Local helpers ─────────────────────────────────────────────────────────────
import { apiUrl as api } from "@/lib/api";
export const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
export const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
export const fmtNum = (v: unknown, dp = 1) => (v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp));
export const today = new Date().toISOString().split("T")[0];

export function exportCSV(rows: Record<string, unknown>[], filename: string, cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[], prefixLines?: string[]) {
  const header = cols.map(c => `"${c.label}"`).join(",");
  const body = rows.map(r => cols.map(c => {
    const v = c.fmt ? c.fmt(r) : (r[c.key] ?? "");
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(",")).join("\n");
  const prefix = prefixLines && prefixLines.length > 0 ? prefixLines.join("\n") + "\n" : "";
  const blob = new Blob([prefix + header + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

// Filename-safe slug for embedding filter values in export filenames
export const csvSlug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// Quote-escaped single-cell comment row for CSV prefix blocks
export const csvComment = (s: string) => `"${s.replace(/"/g, '""')}"`;

// Sign-off columns — mirror the on-screen Sign-off badge (signed = audit_signature
// present). Shared by the pressing, fermentation, cellar-ops and bottling CSV
// exports so the four sign-off columns can't drift between registers.
export const SIGN_OFF_CSV_COLUMNS: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[] = [
  { key: "audit_signature", label: "Signed", fmt: (r: Record<string, unknown>) => (r.audit_signature != null && r.audit_signature !== "") ? "Yes" : "No" },
  { key: "audit_signer_name", label: "Signer Name" },
  { key: "audit_signer_role", label: "Signer Role" },
  { key: "audit_signer_date", label: "Signed At", fmt: (r: Record<string, unknown>) => {
    // Prefer the auditor-declared declaration date; fall back to the digital signature timestamp.
    if (r.audit_signer_date) {
      const s = String(r.audit_signer_date);
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      // Date-only values are parsed as local calendar dates to avoid UTC day-shift.
      const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
      return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-GB");
    }
    if (r.audit_signed_at) return fmtDate(r.audit_signed_at);
    return "";
  }},
];

// Farm display name for CSV/PDF headers comes from the shared useFarmName hook
// (single "farms-list" query) so the lookup can't silently drift per call site.

// Shared GET helper for the read queries below — rejects on non-2xx so failures
// surface as a query error state instead of silently returning empty data.
export async function fetchWineryJson(path: string): Promise<Record<string, unknown>> {
  const r = await fetch(api(path), { credentials: "include" });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error((e as { error?: string }).error || `Request failed (HTTP ${r.status})`);
  }
  return r.json();
}

export function useCrud<T extends Record<string, unknown>>(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery<T[]>({
    queryKey: [key, farmId],
    queryFn: async () => {
      const d = await fetchWineryJson(`farms/${farmId}/${endpoint}`);
      return (d.records ?? []) as T[];
    },
    enabled: !!farmId,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: [key, farmId] });
  const add = useMutation({
    mutationFn: async (body: Partial<T>) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); const err = new Error(e.error || "Save failed"); (err as Error & { code?: string }).code = e.code; throw err; }
      return r.json();
    },
    onSuccess: invalidate,
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const edit = useMutation({
    mutationFn: async ({ id, ...body }: Partial<T> & { id: number }) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); const err = new Error(e.error || "Save failed"); (err as Error & { code?: string }).code = e.code; throw err; }
      return r.json();
    },
    onSuccess: invalidate,
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Delete failed"); } },
    onSuccess: invalidate,
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  return { data: q.data ?? [], isLoading: q.isLoading, isError: q.isError, error: q.error, add, edit, remove };
}

export function useVessels(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-vessels", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-vessels`)).records ?? []) as Record<string, unknown>[],
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

export function useEquipment(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-equipment", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-equipment`)).records ?? []) as Record<string, unknown>[],
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

export function usePressing(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-pressing`)).records ?? []) as Record<string, unknown>[],
    enabled: !!farmId,
    staleTime: 60_000,
  });
}

export function useAdditionsSummary(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing-additions-summary", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-pressing/additions-summary`)).summary ?? []) as Record<string, unknown>[],
    enabled: !!farmId,
    staleTime: 30_000,
  });
}

export function useAllPressAdditions(farmId: number) {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-pressing-all-additions", farmId],
    queryFn: async () => ((await fetchWineryJson(`farms/${farmId}/winery-pressing/all-additions`)).additions ?? []) as Record<string, unknown>[],
    enabled: !!farmId,
    staleTime: 30_000,
  });
}

// Compact inline error banner for a failed read query — shown in place of data
// so failures are visible instead of rendering as silently-empty tables.
export function QueryErrorNotice({ label, error }: { label: string; error: unknown }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
      <span><strong>Failed to load {label}.</strong> {error instanceof Error ? error.message : "Please try again."}</span>
    </div>
  );
}

export function useStaff(farmId: number) {
  const { data, isLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  return {
    staffNames: (data?.staff ?? []).map((s: { name: string }) => s.name),
    isLoading,
  };
}

// Persist a tab's vintage year filter in localStorage, scoped to the farm.
// Same pattern as PressingRecordsTab's `pressing-year-filter-${farmId}` key:
// lazy initializer, wrapped setter, and a farmId re-sync effect (the component
// may stay mounted across farm switches).
export function usePersistedYearFilter(prefix: string, farmId: number): [string, (v: string) => void] {
  const storageKey = `${prefix}-year-filter-${farmId}`;
  const [yearFilter, setYearFilterRaw] = useState(() => {
    try { return localStorage.getItem(storageKey) ?? String(new Date().getFullYear()); } catch { return String(new Date().getFullYear()); }
  });
  useEffect(() => {
    try { setYearFilterRaw(localStorage.getItem(storageKey) ?? String(new Date().getFullYear())); } catch { /**/ }
  }, [storageKey]);
  const setYearFilter = (v: string) => { try { localStorage.setItem(storageKey, v); } catch { /**/ } setYearFilterRaw(v); };
  return [yearFilter, setYearFilter];
}

export function ViewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-medium text-sm">{value ?? "—"}</p>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t pt-3 mt-1">{children}</p>;
}

// Amber warning shown inside an edit dialog when the record being edited has
// already been signed off — same pattern as the pressing edit dialog.
export function SignedEditWarning({ signed }: { signed: unknown }) {
  if (!signed) return null;
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
      <span>
        <strong>This record has been signed off.</strong> The sign-off remains intact, but any change you save will be permanently recorded in the record's edit history for audit purposes.
      </span>
    </div>
  );
}

// Amber "Edited After Sign-Off" list shown in view dialogs — same pattern as the
// pressing view dialog. Renders nothing when the record has no edit history.
export function EditHistorySection({ history }: { history: unknown }) {
  if (!Array.isArray(history) || history.length === 0) return null;
  return (
    <div className="border-t pt-2 mt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Edited After Sign-Off</p>
      <ul className="mt-1 space-y-0.5">
        {(history as Record<string, unknown>[]).map((h, i) => (
          <li key={i} className="text-xs text-muted-foreground">
            {String(h.note ?? "")}
            {h.editedAt ? <span className="text-[10px] text-muted-foreground/70"> ({new Date(String(h.editedAt)).toLocaleString("en-GB")})</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Notes preview cell — same truncation pattern as the Pressing table's notes
// column: responsive max-width, single-line truncation with a dotted-underline
// cue, full text in a native `title` tooltip, 120-char cap, em-dash when empty.
export function NotesCell({ notes }: { notes: unknown }) {
  return (
    <td className="p-3 text-left text-muted-foreground max-w-[8rem] lg:max-w-[11rem] xl:max-w-[14rem]">
      {notes ? (
        <span className="truncate block cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2" title={String(notes)}>
          {String(notes).length > 120 ? `${String(notes).slice(0, 120)}…` : String(notes)}
        </span>
      ) : <span className="text-muted-foreground/50">—</span>}
    </td>
  );
}

export function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-40" />
      <p className="font-medium">{title}</p>
      <p className="text-xs mt-1">{sub}</p>
    </div>
  );
}

export function So2Badge({ compliant }: { compliant: unknown }) {
  if (compliant === true || compliant === "true" || compliant === 1 || compliant === "1") {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" />Compliant</span>;
  }
  if (compliant === false || compliant === "false" || compliant === 0 || compliant === "0") {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" />Exceeds Limit</span>;
  }
  return <span className="text-muted-foreground text-xs">—</span>;
}

// Tooltip for the pressing table sign-off badge. Prefers the auditor-declared
// declaration date (audit_signer_date, a date-only YYYY-MM-DD parsed as a local
// calendar date to avoid UTC day-shift), falling back to the digital timestamp
// (audit_signed_at). Signer name/role are included only when present.
export function fmtDDMonYYYY(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function signOffTooltip(r: Record<string, unknown>): string {
  let dateStr = "";
  if (r.audit_signer_date) {
    const s = String(r.audit_signer_date);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
    if (!isNaN(d.getTime())) dateStr = fmtDDMonYYYY(d);
  } else if (r.audit_signed_at) {
    const d = new Date(String(r.audit_signed_at));
    if (!isNaN(d.getTime())) dateStr = fmtDDMonYYYY(d);
  }
  const name = r.audit_signer_name ? String(r.audit_signer_name) : "";
  const role = r.audit_signer_role ? ` (${String(r.audit_signer_role)})` : "";
  if (name && dateStr) return `Signed by ${name}${role} on ${dateStr}`;
  if (name) return `Signed by ${name}${role}`;
  if (dateStr) return `Signed on ${dateStr}`;
  return "Signed";
}

// ─── Shared per-record audit sign-off (fermentation / cellar ops / bottling) ──
// Mirrors the pressing sign-off flow: same signature-pad dialog, the same
// PUT farms/:farmId/<endpoint>/:id/sign-off contract, and the same signed
// badge/tooltip as the Pressing table.
export function SignOffBadge({ r }: { r: Record<string, unknown> }) {
  return r.audit_signature
    ? (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 cursor-default"
        title={signOffTooltip(r)}
      >
        <ShieldCheck className="w-3 h-3" />Signed
      </span>
    )
    : <span className="text-xs text-muted-foreground/60">Unsigned</span>;
}

// Row action button opening the sign-off dialog — teal PenLine, disabled-title-on-span
// pattern is unnecessary here (never disabled), plain title suffices.
export function SignOffButton({ record, onClick }: { record: Record<string, unknown>; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-700" title={record.audit_signature ? "Re-sign this record" : "Sign off this record"} onClick={onClick}>
      <PenLine className="h-4 w-4" />
    </Button>
  );
}

// "Audit Sign-off" section for view dialogs — same layout as the batch-trail
// dialog's signature block: signature image + signer name/role + signed date.
export function AuditSignOffView({ record }: { record: Record<string, unknown> }) {
  if (!record.audit_signature) return null;
  const name = record.audit_signer_name ? String(record.audit_signer_name) : null;
  const role = record.audit_signer_role ? String(record.audit_signer_role) : null;
  let dateLine = "—";
  if (record.audit_signer_date) {
    const s = String(record.audit_signer_date);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
    if (!isNaN(d.getTime())) dateLine = fmtDDMonYYYY(d);
  } else if (record.audit_signed_at) {
    const d = new Date(String(record.audit_signed_at));
    if (!isNaN(d.getTime())) dateLine = d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  return (
    <div className="rounded-lg border px-4 py-3 space-y-2 mt-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-green-600" />Audit Sign-off
      </span>
      <div className="flex items-start gap-3 flex-wrap">
        <img src={String(record.audit_signature)} alt="Audit signature" className="border rounded bg-white max-h-16" />
        <div className="text-xs text-muted-foreground self-center space-y-0.5">
          {name && (
            <p className="font-medium text-foreground text-sm">
              {name}{role ? <span className="text-muted-foreground font-normal"> — {role}</span> : ""}
            </p>
          )}
          <p>Signed: {dateLine}</p>
        </div>
      </div>
    </div>
  );
}

// Signature-pad dialog for a single record. `endpoint` is the API path segment
// (winery-fermentation / winery-cellar-ops / winery-bottling); `queryKey` is the
// tab's useCrud key so the table refreshes with the new badge on success.
export function RecordSignOffDialog({ farmId, endpoint, queryKey, recordLabel, record, onClose }: {
  farmId: number; endpoint: string; queryKey: string; recordLabel: string;
  record: Record<string, unknown>; onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [signerName, setSignerName] = useState(record.audit_signer_name ? String(record.audit_signer_name) : "");
  const [signerRole, setSignerRole] = useState(record.audit_signer_role ? String(record.audit_signer_role) : "");
  const [signerDate, setSignerDate] = useState(() => {
    const s = record.audit_signer_date ? String(record.audit_signer_date) : "";
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : today;
  });
  const sigRef = useRef<SignatureCanvas | null>(null);

  const signOffMutation = useMutation({
    mutationFn: async ({ signatureDataUrl, name, role, date }: { signatureDataUrl: string; name: string; role: string; date: string }) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}/${record.id}/sign-off`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ auditSignature: signatureDataUrl, auditSignerName: name || null, auditSignerRole: role || null, auditSignerDate: date || null }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Sign-off failed"); }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey, farmId] });
      toast({ title: `${recordLabel} signed off`, description: "Signature saved successfully." });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Sign-off failed", description: err.message, variant: "destructive" });
    },
  });

  const handleConfirmSignature = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      toast({ title: "No signature", description: "Please draw your signature before confirming.", variant: "destructive" });
      return;
    }
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    signOffMutation.mutate({ signatureDataUrl: dataUrl, name: signerName, role: signerRole, date: signerDate });
  };

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><PenLine className="h-4 w-4" />Sign Off {recordLabel}</DialogTitle>
          <DialogDescription>Complete the fields below and draw your signature. These details will be saved against the record and shown alongside it for audit purposes.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Auditor Name</Label>
            <Input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="Full name" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Input value={signerRole} onChange={e => setSignerRole(e.target.value)} placeholder="e.g. Certification Inspector" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Date</Label>
            <Input type="date" value={signerDate} onChange={e => setSignerDate(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white touch-none" style={{ height: 180 }}>
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{ style: { width: "100%", height: "100%" }, className: "signature-pad" }}
            backgroundColor="white"
            penColor="#111827"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">Sign above — draw with your finger, stylus, or mouse</p>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => sigRef.current?.clear()}>Clear</Button>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleConfirmSignature} disabled={signOffMutation.isPending}>
            {signOffMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Confirm &amp; Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Batch-trail table button. The base Button applies `disabled:pointer-events-none`,
// which suppresses the native `title` tooltip on a disabled button — so the
// explanatory title lives on a wrapping <span>, which still receives hover events.
export function BatchTrailButton({ batchRef, onClick }: { batchRef: unknown; onClick: () => void }) {
  return (
    <span title={batchRef ? `View batch trail for ${String(batchRef)}` : "No batch reference — batch trail unavailable"} className="inline-flex">
      <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 disabled:opacity-40" disabled={!batchRef} onClick={onClick}><GitBranch className="h-4 w-4" /></Button>
    </span>
  );
}

// ─── Cross-tab "view additions" shortcut ──────────────────────────────────────
// Fermentation / Cellar Ops / Bottling rows carry a batch_ref but the Additions
// Report lives in the Pressing tab. The shortcut stores the requested scope in
// sessionStorage and fires an event; the parent page (ViticulturePage /
// OrganicViticulturePage) listens for the event and switches to the Pressing
// tab, whose mount effect consumes the stored scope and opens the report
// pre-filtered — same pre-fill behaviour as the pressing-row Beaker button.
export const WINERY_VIEW_ADDITIONS_EVENT = "winery:view-additions";
export const additionsShortcutKey = (farmId: number) => `winery-additions-shortcut-${farmId}`;
export function requestAdditionsReport(farmId: number, batchRef: unknown, vintageYear: unknown) {
  try {
    sessionStorage.setItem(additionsShortcutKey(farmId), JSON.stringify({
      batchRef: String(batchRef ?? ""),
      vintageYear: vintageYear != null && String(vintageYear) !== "" ? String(vintageYear) : null,
    }));
  } catch { /* storage unavailable — event alone still switches tab */ }
  window.dispatchEvent(new Event(WINERY_VIEW_ADDITIONS_EVENT));
}
// Row action button for the shortcut — same disabled-title-on-span pattern as
// BatchTrailButton, and the same amber Beaker styling as the pressing rows.
export function ViewAdditionsButton({ farmId, record }: { farmId: number; record: Record<string, unknown> }) {
  const batchRef = record.batch_ref;
  return (
    <span title={batchRef ? `View additions for ${String(batchRef)}` : "No batch reference — additions view unavailable"} className="inline-flex">
      <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 disabled:opacity-40" disabled={!batchRef}
        onClick={() => requestAdditionsReport(farmId, batchRef, record.vintage_year)}>
        <Beaker className="h-4 w-4" />
      </Button>
    </span>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const WINE_COLOUR_OPTIONS = ["Red", "White", "Rosé", "Sparkling", "Orange", "Other"];

// ─── Assign wine colour dialog ────────────────────────────────────────────────
// Inline colour picker for pressing batches whose derived wine colour is missing
// ("Unspecified" in the Additions Report / vintage pH-TA chart). Each row saves
// immediately via the single-column PUT .../wine-colour endpoint, so the rest of
// the pressing record can never be clobbered. Saves invalidate every winery
// query that groups by colour, so rows leave the Unspecified group without a
// manual refresh.
export function AssignWineColourDialog({ farmId, records, onClose }: {
  farmId: number;
  records: { id: number; batchRef: string; pressDate: string | null }[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saved, setSaved] = useState<Record<number, string>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);
  const assignMutation = useMutation({
    mutationFn: async ({ id, colour }: { id: number; colour: string }) => {
      const r = await fetch(api(`farms/${farmId}/winery-pressing/${id}/wine-colour`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ wineColour: colour }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as { error?: string }).error || "Save failed"); }
      return r.json();
    },
    onSuccess: (_d, vars) => {
      setSaved(s => ({ ...s, [vars.id]: vars.colour }));
      qc.invalidateQueries({ queryKey: ["winery-pressing", farmId] });
      qc.invalidateQueries({ queryKey: ["winery-pressing-additions-summary", farmId] });
      qc.invalidateQueries({ queryKey: ["winery-pressing-all-additions", farmId] });
      qc.invalidateQueries({ queryKey: ["winery-batch-trail", farmId] });
      toast({ title: "Wine colour saved" });
    },
    onSettled: () => setPendingId(null),
  });
  const handleClose = () => { assignMutation.reset(); onClose(); };
  return (
    <Dialog open onOpenChange={o => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wine className="h-4 w-4" />Assign Wine Colour</DialogTitle>
          <DialogDescription>
            These pressing batches have no recorded wine colour, so they appear as "Unspecified" in reports. Pick a colour to save it straight onto the batch record.
          </DialogDescription>
        </DialogHeader>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No pressing batches without a wine colour were found for this scope.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto divide-y rounded-md border">
            {records.map(rec => {
              const savedColour = saved[rec.id];
              return (
                <div key={rec.id} className="flex items-center gap-3 px-3 py-2" data-testid={`assign-colour-row-${rec.id}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-medium truncate">{rec.batchRef || "(no batch ref)"}</p>
                    {rec.pressDate && <p className="text-xs text-muted-foreground">Pressed {fmtDate(rec.pressDate)}</p>}
                  </div>
                  {savedColour ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3" />{savedColour}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {pendingId === rec.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      <Select
                        value=""
                        onValueChange={colour => { setPendingId(rec.id); assignMutation.mutate({ id: rec.id, colour }); }}
                        disabled={assignMutation.isPending}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Select colour…" /></SelectTrigger>
                        <SelectContent>{WINE_COLOUR_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <DialogMutationError mutation={assignMutation} message="The wine colour could not be saved." />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// Sentinel for "no wine colour recorded" — same value the vintage pH/TA chart
// uses for its Unspecified option, so persisted filters stay consistent.
export const UNSPECIFIED_COLOUR = "__unspecified__";
export const colourFilterLabel = (c: string) => (c === UNSPECIFIED_COLOUR ? "Unspecified" : c);
// Does a summary/pressing row match the active colour filter value?
export const rowMatchesColour = (r: Record<string, unknown>, filter: string) =>
  filter === UNSPECIFIED_COLOUR ? String(r.wine_colour ?? "") === "" : String(r.wine_colour ?? "") === filter;
export const ORGANIC_MAX_SO2: Record<string, string> = { "Red": "100", "White": "150", "Rosé": "150", "Sparkling": "185", "Orange": "150" };
// Shared "limit unverified" predicate — an organic-ceiling max_permitted with no
// batch_ref means the applicable limit can't be verified against a batch record.
// Used by the on-screen SO₂ table flag, the SO₂ register CSV column, the
// batch-trail CSV export, and the batch-trail PDF so2Rows builder, so the rule
// can never drift between surfaces.
export const SO2_ORGANIC_LIMIT_NUMBERS = new Set(Object.values(ORGANIC_MAX_SO2).map(v => parseFloat(v)));
export function so2LimitUnverified(r: Record<string, unknown>): boolean {
  if (r.batch_ref) return false;
  const maxVal = r.max_permitted_mg_l != null && r.max_permitted_mg_l !== "" ? parseFloat(String(r.max_permitted_mg_l)) : null;
  return maxVal != null && SO2_ORGANIC_LIMIT_NUMBERS.has(maxVal);
}
// Conventional (non-organic) total SO₂ ceilings — UK-retained Reg 1308/2013 Annex VIII Part B
export const CONVENTIONAL_MAX_SO2: Record<string, string> = { "Red": "150", "White": "200", "Rosé": "200", "Sparkling": "235", "Orange": "200" };
export const SOURCE_TYPE_OPTIONS = ["Own vineyard", "Contract grower", "Purchased grapes"];
export const GRAPE_CONDITION_OPTIONS = ["Excellent", "Good", "Fair", "Poor"];
export const PRESS_TYPE_OPTIONS = ["Pneumatic bladder", "Basket press", "Continuous screw", "Membrane press", "Other"];
export const JUICE_TURBIDITY_OPTIONS = ["Clear", "Slightly turbid", "Turbid"];
export const SETTLING_METHOD_OPTIONS = ["Static cold", "Static warm", "Centrifuge", "Flocculant", "None"];
export const FERMENTATION_TYPE_OPTIONS = ["Wild / spontaneous fermentation", "Inoculated — commercial yeast", "Inoculated — cultured indigenous yeast"];
export const VESSEL_TYPE_OPTIONS = ["Stainless steel tank", "Oak barrel (225L)", "Oak barrel (500L)", "Oak vat / foudre", "Amphora / clay", "Fibreglass tank", "HDPE tank", "Concrete tank", "Other"];
export const VESSEL_STATUS_OPTIONS = ["active", "retired", "sold"];
export const CLEAN_TYPE_OPTIONS = ["Rinse (water only)", "Hot water rinse", "CIP (Clean-in-place)", "Steam", "Chemical wash", "Ozone", "Other"];
export const CELLAR_OP_TYPES = ["racking", "topping", "sulfiting", "fining", "filtering", "cold-stabilisation", "other"];
export const CELLAR_OP_LABELS: Record<string, string> = {
  racking: "Racking (lees removal)", topping: "Topping up", sulfiting: "Sulfiting (SO₂ addition)",
  fining: "Fining", filtering: "Filtering", "cold-stabilisation": "Cold stabilisation", other: "Other",
};
export const CLOSURE_TYPE_OPTIONS = ["Natural cork", "Technical cork", "Agglomerate cork", "Screw cap (Stelvin)", "Crown cap", "Waxed cork", "Glass stopper", "Other"];
export const SO2_TEST_STAGES = ["at-pressing", "post-fermentation", "post-racking", "pre-bottling", "at-bottling", "other"];
export const SO2_TEST_STAGE_LABELS: Record<string, string> = {
  "at-pressing": "At pressing", "post-fermentation": "Post-fermentation", "post-racking": "Post-racking",
  "pre-bottling": "Pre-bottling", "at-bottling": "At bottling line", "other": "Other",
};
export const SO2_TEST_METHODS = ["On-site — Ripper titration", "On-site — Enzymatic kit", "On-site — Aeration-oxidation", "Third-party laboratory", "Not tested / not applicable"];
export const EQUIPMENT_TYPES = ["Ripper burette / titrator", "Enzymatic SO₂ analyser", "Aeration-oxidation apparatus", "Refractometer (Brix)", "pH meter", "Hydrometer / densimeter", "Other analytical equipment"];
export const EQUIPMENT_STATUS_OPTIONS = ["active", "out-of-service", "retired"];
export const CALIBRATION_RESULT_OPTIONS = ["pass", "fail", "adjusted"];
export const CALIBRATION_FREQ_OPTIONS = ["Per use", "Daily", "Weekly", "Monthly", "Quarterly", "Annually"];
export const TOASTING_OPTIONS = ["Light (L)", "Medium (M)", "Medium+ (M+)", "Heavy (H)", "Extra Heavy (EH)", "None"];

// ─── Press Additive Catalogue ─────────────────────────────────────────────────
// Limits per retained EU Reg 2019/934 (UK-retained law).
// maxPerUnit: per-unit conventional ceiling (hard limit — API rejects above this).
// organicMaxPerUnit: lower organic limit (UI warning only, not API enforced at this stage).
export interface PermittedAdditive {
  name: string; category: string; defaultUnit: string; units: string[];
  maxPerUnit?: Record<string, number>;
  organicMaxPerUnit?: Record<string, number>;
}
export const PERMITTED_ADDITIVES: PermittedAdditive[] = [
  { name: "SO₂ / Potassium metabisulphite (KMS)", category: "so2",           defaultUnit: "mg/kg", units: ["mg/kg", "mg/L"],        maxPerUnit: { "mg/kg": 200, "mg/L": 200 }, organicMaxPerUnit: { "mg/kg": 90, "mg/L": 90 } },
  { name: "Ascorbic acid",                         category: "ascorbic_acid", defaultUnit: "mg/L",  units: ["mg/L"],                 maxPerUnit: { "mg/L": 250 },               organicMaxPerUnit: { "mg/L": 250 } },
  { name: "Pectolytic enzyme (Pectinase)",         category: "pectolytic",    defaultUnit: "g/hL",  units: ["g/hL", "mL/hL"] },
  { name: "Bentonite (white must only)",           category: "fining",        defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Activated charcoal (white must only)",  category: "fining",        defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Diammonium phosphate (DAP)",            category: "nutrient",      defaultUnit: "g/hL",  units: ["g/hL"] },
  { name: "Tartaric acid",                         category: "acidification", defaultUnit: "g/L",   units: ["g/L", "g/hL"] },
  { name: "Other",                                 category: "other",         defaultUnit: "g/hL",  units: ["mg/kg", "mg/L", "g/hL", "g/L", "mL/hL"] },
];
export const ALL_DOSE_UNITS = ["mg/kg", "mg/L", "g/hL", "g/L", "mL/hL"];
export const ADDITIVE_CATEGORY_LABELS: Record<string, string> = {
  so2: "SO₂ / KMS",
  ascorbic_acid: "Ascorbic acid",
  pectolytic: "Pectolytic enzyme",
  fining: "Fining agents",
  nutrient: "Nutrients",
  acidification: "Acidification",
  other: "Other",
};
export interface AdditionRow { tempId: number; id?: number; additiveName: string; category: string; dose: string; unit: string; notes: string }

// ─── Pressing additive columns — single source of truth for PDF + CSV ─────────
// Both the batch-trail PDF (printBatchTrail "Press Additives" table) and the
// batch-trail CSV export (exportBatchTrailCsv "Pressing — Additive" rows) render
// their additive columns from this list. Add a new field here (and, if the CSV
// needs a new header column, to BATCH_TRAIL_CSV_HEADER) and both outputs pick
// it up together — they can no longer drift apart.
export type PressAdditiveField = "additive_name" | "category" | "dose" | "unit" | "notes";
export interface PressAdditiveColumn {
  /** Underlying additive record field — lookup key for the other winery reports */
  field: PressAdditiveField;
  /** Which batch-trail CSV header column this field fills */
  csvColumn: string;
  /** Header label in the printed PDF additives table */
  pdfLabel: string;
  align: "left" | "right";
  csvValue: (a: Record<string, unknown>) => string;
  /** PDF cell content (escaped by the renderer); defaults may differ from CSV (e.g. "—" vs "") */
  pdfValue: (a: Record<string, unknown>) => string;
  /** Extra inline styles for the PDF table cell */
  pdfCellStyle?: string;
}
export const PRESS_ADDITIVE_COLUMNS: PressAdditiveColumn[] = [
  {
    field: "additive_name",
    csvColumn: "Type / Additive", pdfLabel: "Additive", align: "left",
    csvValue: a => String(a.additive_name ?? ""),
    pdfValue: a => String(a.additive_name ?? ""),
    pdfCellStyle: "font-weight:500",
  },
  {
    field: "category",
    csvColumn: "Detail", pdfLabel: "Category", align: "left",
    csvValue: a => String(a.category ?? ""),
    pdfValue: a => ADDITIVE_CATEGORY_LABELS[String(a.category)] ?? String(a.category ?? ""),
    pdfCellStyle: "color:#6b7280",
  },
  {
    field: "dose",
    csvColumn: "SO₂ / Dose", pdfLabel: "Dose", align: "right",
    csvValue: a => (a.dose != null ? parseFloat(String(a.dose)).toFixed(2) : ""),
    pdfValue: a => (a.dose != null ? parseFloat(String(a.dose)).toFixed(2) : "—"),
    pdfCellStyle: "text-align:right;font-family:monospace",
  },
  {
    field: "unit",
    csvColumn: "Unit", pdfLabel: "Unit", align: "left",
    csvValue: a => String(a.unit ?? ""),
    pdfValue: a => String(a.unit ?? ""),
  },
  {
    field: "notes",
    csvColumn: "Notes", pdfLabel: "Notes", align: "left",
    csvValue: a => String(a.notes ?? ""),
    pdfValue: a => String(a.notes ?? ""),
    pdfCellStyle: "color:#6b7280;font-style:italic",
  },
];
// Field-keyed lookup into PRESS_ADDITIVE_COLUMNS. The Additive Usage Report,
// the SO₂ & Additive Transaction Log (PDF + CSV) and the Pressing Report all
// pull their additive value formatting from here, so a new/changed additive
// field edited in PRESS_ADDITIVE_COLUMNS updates every winery output together.
export const ADDITIVE_COL: Record<PressAdditiveField, PressAdditiveColumn> = Object.fromEntries(
  PRESS_ADDITIVE_COLUMNS.map(c => [c.field, c]),
) as Record<PressAdditiveField, PressAdditiveColumn>;
// exportCSV column for a shared additive field — generic label (the PDF label,
// not the batch-trail-specific CSV slot name) + the shared CSV value formatter.
export const additiveCsvCol = (field: PressAdditiveField) => ({
  key: field,
  label: ADDITIVE_COL[field].pdfLabel,
  fmt: (r: Record<string, unknown>) => ADDITIVE_COL[field].csvValue(r),
});
// The five fields the on-screen tables (batch-trail dialog press-additive rows,
// Transaction Log individual-records table) lay out with bespoke styling. Any
// field later added to PRESS_ADDITIVE_COLUMNS beyond these is rendered
// generically by those tables (label + shared pdfValue), so a new additive
// field shows up on screen together with the PDF/CSV exports instead of
// silently appearing only in the downloads.
export const STYLED_ADDITIVE_FIELDS: PressAdditiveField[] = ["additive_name", "category", "dose", "unit", "notes"];
export const EXTRA_ADDITIVE_COLUMNS = PRESS_ADDITIVE_COLUMNS.filter(c => !STYLED_ADDITIVE_FIELDS.includes(c.field));
// Batch-trail CSV header — the additive columns above map into these slots by name.
export const BATCH_TRAIL_CSV_HEADER = ["Stage", "Batch Ref", "Date", "Type / Additive", "Detail", "SO₂ / Dose", "Unit", "SO₂ Ceiling (mg/L)", "SO₂ Compliance", "pH", "TA (g/L)", "Vessel", "Operator", "Notes", "Running SO₂ Total (mg/L)"];

// ─── Harvest Reception columns — single source of truth ───────────────────────
// The export CSV (harvestCsvCols), the import template headers
// (HARVEST_IMPORT_HEADERS), the template example row, the import field aliases,
// and the bulk-import payload mapping are ALL derived from this one list.
// Adding or renaming a field requires only one edit here, and exports use the
// exact import headers + re-import-safe value formats (ISO date, Yes/No), so an
// exported CSV can always be re-imported.
export interface HarvestColumn {
  /** CSV header used by both the export and the import template */
  header: string;
  /** snake_case field name from the API rows — also accepted as an import header alias */
  dbKey: string;
  /** camelCase key expected by the bulk-import endpoint */
  recordKey: string;
  /** Example value in the downloadable import template */
  example: string;
  /** Optional export formatter — must produce a value the import understands */
  exportValue?: (r: Record<string, unknown>) => string;
}
export const HARVEST_COLUMNS: HarvestColumn[] = [
  {
    header: "Reception Date", dbKey: "reception_date", recordKey: "receptionDate", example: "2024-09-15",
    // ISO YYYY-MM-DD so the export can be re-imported (not locale dd/mm/yyyy)
    exportValue: r => (r.reception_date ? String(r.reception_date).split("T")[0] : ""),
  },
  { header: "Vintage Year",      dbKey: "vintage_year",          recordKey: "vintageYear",        example: "2024" },
  { header: "Variety",           dbKey: "variety",               recordKey: "variety",            example: "Bacchus" },
  { header: "Source Type",       dbKey: "source_type",           recordKey: "sourceType",         example: "Own vineyard" },
  { header: "Grower Name",       dbKey: "grower_name",           recordKey: "growerName",         example: "" },
  { header: "Gross Weight (kg)", dbKey: "gross_weight_kg",       recordKey: "grossWeightKg",      example: "5200" },
  { header: "Tare Weight (kg)",  dbKey: "tare_weight_kg",        recordKey: "tareWeightKg",       example: "1800" },
  { header: "Net Weight (kg)",   dbKey: "net_weight_kg",         recordKey: "netWeightKg",        example: "3400" },
  { header: "Brix",              dbKey: "brix",                  recordKey: "brix",               example: "19.5" },
  { header: "pH",                dbKey: "ph",                    recordKey: "ph",                 example: "3.45" },
  { header: "TA (g/L)",          dbKey: "titratable_acidity_gl", recordKey: "titratableAcidityGl", example: "7.2" },
  { header: "Temp (°C)",         dbKey: "intake_temperature_c",  recordKey: "intakeTemperatureC", example: "14" },
  { header: "Grape Condition",   dbKey: "grape_condition",       recordKey: "grapeCondition",     example: "Good" },
  {
    header: "Accepted (Yes/No)", dbKey: "accepted", recordKey: "accepted", example: "Yes",
    exportValue: r => (String(r.accepted) === "true" ? "Yes" : "No"),
  },
  { header: "Notes",             dbKey: "notes",                 recordKey: "notes",              example: "Example row — delete before importing" },
];
export const HARVEST_IMPORT_HEADERS = HARVEST_COLUMNS.map(c => c.header);
// Each canonical header also accepts its snake_case dbKey as an import alias
export const HARVEST_FIELD_ALIASES: Record<string, string[]> = Object.fromEntries(
  HARVEST_COLUMNS.map(c => [c.header, [c.header, c.dbKey]]),
);
export const resolveHarvestField = (row: Record<string, string>, canonical: string): string => {
  for (const alias of HARVEST_FIELD_ALIASES[canonical] ?? [canonical]) {
    if (row[alias] != null && row[alias] !== "") return row[alias];
  }
  return "";
};

// ─── Harvest Reception Tab ─────────────────────────────────────────────────────
