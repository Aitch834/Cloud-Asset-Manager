import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, Printer } from "lucide-react";
import { DocAttach } from "@/components/DocAttach";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { openPrintWindow } from "@/lib/print-report";

const BASE = import.meta.env.BASE_URL;
const api = (path: string) => `${BASE}api/${path}`;

const JOHNES_TYPES = [
  { value: "bulk_milk_elisa", label: "Bulk Milk ELISA" },
  { value: "individual_milk_elisa", label: "Individual Milk ELISA" },
  { value: "individual_blood_elisa", label: "Individual Blood ELISA" },
  { value: "faecal_pcr", label: "Faecal PCR (individual)" },
  { value: "pooled_faecal_pcr", label: "Pooled Faecal PCR" },
  { value: "post_mortem", label: "Post-mortem confirmation" },
];

const JOHNES_RISK = [
  { value: "1_very_low", label: "1 — Very Low Risk" },
  { value: "2_low", label: "2 — Low Risk" },
  { value: "3_moderate", label: "3 — Moderate Risk" },
  { value: "4_high", label: "4 — High Risk" },
];

const JOHNES_SCHEMES = [
  { value: "johnes_management_in_milk", label: "Johne's Management in Milk (AHDB)" },
  { value: "farm_health_connect", label: "Farm Health Connect" },
  { value: "voluntary", label: "Voluntary / Vet-led" },
  { value: "other", label: "Other" },
];

const JOHNES_LABS_PRESETS = [
  "APHA Starcross",
  "APHA Weybridge",
  "APHA Lasswade (Scotland)",
  "SAC / SRUC Veterinary Services",
  "Biobest Laboratories",
  "Axiom Veterinary Laboratories",
  "Westgate Labs",
  "Quality Milk Laboratories",
];

const NJMP_STRATEGY_LABELS: Record<string, string> = {
  s1_test_cull: "S1 — Test & cull high-risk cows",
  s2_segregate: "S2 — Segregate high-risk cows",
  s3_purchased_animals: "S3 — Purchased animal management",
  s4_calf_colostrum: "S4 — Calf & colostrum management",
  s5_slurry_pasture: "S5 — Slurry & pasture management",
  s6_bespoke: "S6 — Bespoke vet-led strategy",
};

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); } catch { return d; }
}

function riskLabel(v: string | null | undefined) {
  return JOHNES_RISK.find(r => r.value === v)?.label ?? v ?? "—";
}

function typeLabel(v: string | null | undefined) {
  return JOHNES_TYPES.find(t => t.value === v)?.label ?? v ?? "—";
}

export function JohnesDeclarationSection({ farmId, allMonitoringRecords }: { farmId: number; allMonitoringRecords: any[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [ackOpen, setAckOpen] = useState(false);
  const [ackRec, setAckRec] = useState<any>(null);
  const [ackForm, setAckForm] = useState<any>({});
  const [form, setForm] = useState<any>({});
  const setF = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const qKey = ["johnes-declarations", farmId];
  const { data: declarations = [] } = useQuery({
    queryKey: qKey,
    queryFn: () =>
      fetch(api(`farms/${farmId}/johnes-declarations`), { credentials: "include" })
        .then(r => r.json()).then(d => d.declarations ?? []),
    enabled: !!farmId,
  });

  const latestNjmp = [...allMonitoringRecords]
    .filter(r => r.jmmEnrolled)
    .sort((a, b) => (b.testDate ?? "").localeCompare(a.testDate ?? ""))[0]
    ?? allMonitoringRecords.sort((a, b) => (b.testDate ?? "").localeCompare(a.testDate ?? ""))[0];

  function openAdd() {
    setEditing(null);
    setForm({
      declarationYear: new Date().getFullYear(),
      declarationDate: new Date().toISOString().split("T")[0],
      njmpSchemeRef: latestNjmp?.njmpSchemeRef ?? "",
      njmpRiskLevel: latestNjmp?.riskLevel ?? "",
      njmpControlStrategy: latestNjmp?.njmpControlStrategy ?? "",
      njmpPlanReviewedDate: latestNjmp?.njmpPlanDate ?? "",
      bajvaAdvisorName: latestNjmp?.njmpBajvaAdvisor ?? "",
    });
    setOpen(true);
  }

  async function save() {
    const url = editing
      ? api(`farms/${farmId}/johnes-declarations/${editing.id}`)
      : api(`farms/${farmId}/johnes-declarations`);
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: qKey });
    setOpen(false); setEditing(null);
  }

  async function del(id: number) {
    if (!confirm("Delete this declaration record?")) return;
    await fetch(api(`farms/${farmId}/johnes-declarations/${id}`), { method: "DELETE", credentials: "include" });
    qc.invalidateQueries({ queryKey: qKey });
  }

  async function saveAck() {
    await fetch(api(`farms/${farmId}/johnes-declarations/${ackRec.id}/acknowledge`), {
      method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(ackForm),
    });
    qc.invalidateQueries({ queryKey: qKey });
    setAckOpen(false); setAckRec(null);
  }

  function printDeclaration(rec: any) {
    const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "[not recorded]";
    const stratLabel = rec.njmpControlStrategy ? (NJMP_STRATEGY_LABELS[rec.njmpControlStrategy] ?? rec.njmpControlStrategy) : "[not recorded]";
    const rl = JOHNES_RISK.find(r => r.value === rec.njmpRiskLevel)?.label ?? rec.njmpRiskLevel ?? "[not recorded]";
    const html = `<!DOCTYPE html><html><head><title>NJMP Annual Declaration ${rec.declarationYear}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:32px 40px;max-width:680px}
  .logo-bar{border-bottom:3px solid #15803d;padding-bottom:8px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end}
  h1{font-size:15px;font-weight:700;margin:0}.scheme{font-size:10px;color:#15803d;font-weight:700;letter-spacing:0.04em;text-transform:uppercase}
  .to-block{margin:20px 0 16px;padding:10px 14px;border-left:3px solid #e5e7eb;font-size:10px;color:#374151}
  .ref-line{font-size:9px;color:#6b7280;margin-bottom:16px}
  .subject{font-size:12px;font-weight:700;text-decoration:underline;margin-bottom:14px}
  .body-para{margin:0 0 10px;line-height:1.55}
  table{width:100%;border-collapse:collapse;margin:14px 0}
  th,td{padding:5px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px}
  th{background:#f0fdf4;font-weight:700;color:#15803d;text-transform:uppercase;font-size:9px}
  .declaration-box{border:2px solid #15803d;border-radius:4px;padding:12px 16px;margin:18px 0;background:#f0fdf4}
  .declaration-box p{margin:0 0 4px;font-size:10.5px}
  .sig-block{margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .sig-line{border-bottom:1px solid #000;height:24px;margin-bottom:4px}
  .sig-label{font-size:9px;color:#6b7280}
  .footer{margin-top:28px;font-size:8px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
  @media print{@page{margin:2cm;size:A4}}
</style></head><body>
<div class="logo-bar">
  <div><div class="scheme">National Johne's Management Plan (NJMP)</div><h1>Annual Declaration — ${rec.declarationYear}</h1></div>
  <div style="text-align:right;font-size:9px;color:#6b7280">Date: ${fmtD(rec.declarationDate)}<br>${rec.njmpSchemeRef ? `Scheme Ref: <strong>${rec.njmpSchemeRef}</strong>` : ""}</div>
</div>
<div class="to-block"><strong>To:</strong> ${rec.milkPurchaser || "[Milk Purchaser Name]"}<br>${rec.milkPurchaserAddress ? rec.milkPurchaserAddress.replace(/\n/g, "<br>") : "[Milk Purchaser Address]"}</div>
<div class="ref-line">From: ${rec.farmerName || "[Farmer / Herd Operator Name]"}</div>
<p class="subject">Re: NJMP Annual Declaration — Herd Johne's Disease Management Plan — Year ${rec.declarationYear}</p>
<p class="body-para">I, the undersigned, hereby declare that the above-named herd is enrolled in the National Johne's Management Plan (NJMP) as administered by AHDB / BCVA, and that the following information is correct and up to date as of the date of this declaration.</p>
<div class="declaration-box"><p><strong>NJMP Enrolled Herd Declaration</strong></p><p>This declaration confirms that the herd identified above has an active written Johne's disease control plan, which has been reviewed in the 12-month period prior to the date of this declaration, and that the herd's NJMP compliance status is as follows:</p></div>
<table>
  <tr><th>Item</th><th>Detail</th></tr>
  <tr><td>NJMP Scheme / Enrolment Reference</td><td>${rec.njmpSchemeRef || "—"}</td></tr>
  <tr><td>Current NJMP Herd Risk Level</td><td>${rl}</td></tr>
  <tr><td>Active Control Strategy</td><td>${stratLabel}</td></tr>
  <tr><td>Written Plan Last Reviewed</td><td>${fmtD(rec.njmpPlanReviewedDate)}</td></tr>
  <tr><td>BAJVA / Accredited Veterinary Advisor</td><td>${rec.bajvaAdvisorName || "—"}</td></tr>
</table>
<p class="body-para">I confirm that the control plan has been formulated and is being implemented in conjunction with a BCVA Accredited Johne's Veterinary Advisor (BAJVA), that an annual on-farm risk assessment has been carried out within the past 12 months, and that the herd has been screened in accordance with NJMP requirements (minimum 60-cow individual milk ELISA — bulk milk ELISA alone is not accepted for NJMP risk status).</p>
<p class="body-para">I understand that this declaration must be submitted to my milk purchaser on an annual basis, and that failure to do so may affect my Red Tractor Dairy assurance status.</p>
${rec.notes ? `<p class="body-para"><em>Notes: ${rec.notes}</em></p>` : ""}
<div class="sig-block">
  <div><div class="sig-line"></div><div class="sig-label">Signature of Herd Operator / Farmer</div></div>
  <div><div class="sig-line"></div><div class="sig-label">Date</div></div>
  <div style="margin-top:16px"><div class="sig-line"></div><div class="sig-label">Print Name: ${rec.farmerName || "________________________________"}</div></div>
</div>
<div class="footer">NJMP Annual Declaration generated by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years. For NJMP queries contact AHDB Dairy or your BAJVA-accredited veterinary advisor.</div>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">NJMP Annual Declarations</h3>
          <p className="text-xs text-gray-500 mt-0.5">Record and print the annual declaration submitted to your milk purchaser. Keep a history for assurance auditors.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />New Annual Declaration</Button>
      </div>

      {(declarations as any[]).length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg text-sm text-gray-400">No declarations recorded yet. Click "New Annual Declaration" to log and print your first.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Year","Date Submitted","Milk Purchaser","Risk Level","Control Strategy","BAJVA Advisor","Acknowledged","Actions"].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {(declarations as any[]).map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold">{d.declarationYear}</td>
                  <td className="px-3 py-2">{d.declarationDate ? new Date(d.declarationDate).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-3 py-2">{d.milkPurchaser || "—"}</td>
                  <td className="px-3 py-2 text-xs">{JOHNES_RISK.find(r => r.value === d.njmpRiskLevel)?.label ?? d.njmpRiskLevel ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{NJMP_STRATEGY_LABELS[d.njmpControlStrategy] ?? d.njmpControlStrategy ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{d.bajvaAdvisorName || "—"}</td>
                  <td className="px-3 py-2">
                    {d.acknowledgementReceived
                      ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ {d.acknowledgementDate ? new Date(d.acknowledgementDate).toLocaleDateString("en-GB") : "Received"}</span>
                      : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Pending</span>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => printDeclaration(d)}><Printer className="w-3 h-3 mr-1" />Print</Button>
                      {!d.acknowledgementReceived && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-700 border-green-300 hover:bg-green-50" onClick={() => { setAckRec(d); setAckForm({ acknowledgementDate: new Date().toISOString().split("T")[0] }); setAckOpen(true); }}>
                          Record Ack.
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditing(d); setForm({ ...d }); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => del(d.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Annual Declaration" : "New NJMP Annual Declaration"}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">Fields are pre-filled from your most recent NJMP monitoring record. Review and adjust before saving and printing.</p>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <Label>Declaration Year *</Label>
              <Input type="number" min="2020" max="2099" value={form.declarationYear ?? new Date().getFullYear()} onChange={e => setF("declarationYear", parseInt(e.target.value))} />
            </div>
            <div>
              <Label>Declaration Date *</Label>
              <Input type="date" value={form.declarationDate || ""} onChange={e => setF("declarationDate", e.target.value)} />
            </div>
            <div>
              <Label>Farmer / Operator Name</Label>
              <Input value={form.farmerName || ""} onChange={e => setF("farmerName", e.target.value)} placeholder="Full name as will appear on declaration letter" />
            </div>
            <div>
              <Label>NJMP Scheme Reference</Label>
              <Input className="font-mono" value={form.njmpSchemeRef || ""} onChange={e => setF("njmpSchemeRef", e.target.value)} placeholder="e.g. AHDB-JMM-123456" />
            </div>
            <div>
              <Label>Milk Purchaser</Label>
              <Input value={form.milkPurchaser || ""} onChange={e => setF("milkPurchaser", e.target.value)} placeholder="e.g. Arla Foods UK, Müller Milk, First Milk" />
            </div>
            <div>
              <Label>Current NJMP Risk Level</Label>
              <Select value={form.njmpRiskLevel || "__none__"} onValueChange={v => setF("njmpRiskLevel", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not specified</SelectItem>
                  {JOHNES_RISK.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Milk Purchaser Address</Label>
              <Textarea rows={2} value={form.milkPurchaserAddress || ""} onChange={e => setF("milkPurchaserAddress", e.target.value)} placeholder="Purchaser address (appears on the printed declaration letter)" />
            </div>
            <div className="col-span-2">
              <Label>Active Control Strategy</Label>
              <Select value={form.njmpControlStrategy || "__none__"} onValueChange={v => setF("njmpControlStrategy", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select strategy" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not specified</SelectItem>
                  <SelectItem value="s1_test_cull">S1 — Test &amp; cull high-risk cows</SelectItem>
                  <SelectItem value="s2_segregate">S2 — Segregate high-risk cows</SelectItem>
                  <SelectItem value="s3_purchased_animals">S3 — Purchased animal management</SelectItem>
                  <SelectItem value="s4_calf_colostrum">S4 — Calf &amp; colostrum management</SelectItem>
                  <SelectItem value="s5_slurry_pasture">S5 — Slurry &amp; pasture management</SelectItem>
                  <SelectItem value="s6_bespoke">S6 — Bespoke vet-led strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Written Plan Last Reviewed</Label>
              <Input type="date" value={form.njmpPlanReviewedDate || ""} onChange={e => setF("njmpPlanReviewedDate", e.target.value)} />
            </div>
            <div>
              <Label>BAJVA Advisor Name</Label>
              <Input value={form.bajvaAdvisorName || ""} onChange={e => setF("bajvaAdvisorName", e.target.value)} placeholder="BCVA-accredited veterinary advisor" />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes || ""} onChange={e => setF("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Save Declaration"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Acknowledgement Dialog */}
      {ackOpen && ackRec && (
        <Dialog open onOpenChange={() => { setAckOpen(false); setAckRec(null); }}>
          <DialogContent style={{ maxWidth: "32rem" }}>
            <DialogHeader><DialogTitle>Record Acknowledgement — {ackRec.declarationYear} Declaration</DialogTitle></DialogHeader>
            <p className="text-xs text-muted-foreground">
              Record when {ackRec.milkPurchaser || "the milk purchaser"} confirmed receipt. The NJMP does not mandate a formal acknowledgement, but having it on file strengthens your audit trail.
            </p>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Acknowledgement Date</Label>
                <Input type="date" value={ackForm.acknowledgementDate || ""} onChange={e => setAckForm((f: any) => ({ ...f, acknowledgementDate: e.target.value }))} />
              </div>
              <div>
                <Label>Purchaser Reference <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                <Input value={ackForm.acknowledgementRef || ""} onChange={e => setAckForm((f: any) => ({ ...f, acknowledgementRef: e.target.value }))} placeholder="e.g. email ref, letter ref" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAckOpen(false); setAckRec(null); }}>Cancel</Button>
              <Button onClick={saveAck}>Save Acknowledgement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function JohnesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewRec, setViewRec] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [yearFilter, setYearFilter] = useState("all");

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const { data: allRecordsRaw = [], isLoading } = useQuery({
    queryKey: ["johnes-monitoring", farmId],
    queryFn: () =>
      fetch(api(`farms/${farmId}/johnes-monitoring`), { credentials: "include" })
        .then(r => r.json())
        .then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const allRecords: any[] = allRecordsRaw;

  const years = useMemo(() => {
    const s = new Set(
      allRecords.map((r: any) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean) as string[]
    );
    return Array.from(s).sort().reverse();
  }, [allRecords]);

  const records: any[] =
    yearFilter === "all"
      ? allRecords
      : allRecords.filter((r: any) => String(r.testDate ?? "").startsWith(yearFilter));

  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () =>
      fetch(api(`farms/${farmId}/herds`), { credentials: "include" })
        .then(r => r.json())
        .then(d =>
          (d.records ?? []).filter((h: any) => {
            const t = String(h.type ?? "").toLowerCase();
            return ["cattle", "beef", "dairy", "suckler", "bovine"].some(k => t.includes(k));
          })
        ),
    enabled: !!farmId,
  });

  const uniqueVetNames = [...new Set(allRecords.map((r: any) => r.vetName).filter(Boolean))] as string[];

  function openAdd() {
    setEditing(null);
    setForm({ testType: "bulk_milk_elisa", jmmEnrolled: false, vetSignOff: false, njmpColostrumMgmt: false, njmpPurchasedTesting: false });
    setOpen(true);
  }

  function openEdit(r: any) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }

  async function save() {
    const url = editing
      ? api(`farms/${farmId}/johnes-monitoring/${editing.id}`)
      : api(`farms/${farmId}/johnes-monitoring`);
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
    setOpen(false);
  }

  async function del(id: number) {
    if (!confirm("Delete this Johne's monitoring record?")) return;
    await fetch(api(`farms/${farmId}/johnes-monitoring/${id}`), {
      method: "DELETE",
      credentials: "include",
    });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
  }

  function printReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
    const rows = records
      .map(
        (r: any) => `<tr>
      <td>${fmtDate(r.testDate)}</td>
      <td>${typeLabel(r.testType)}</td>
      <td>${r.herdId ? (herds.find((h: any) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}`) : "—"}</td>
      <td>${riskLabel(r.riskLevel)}</td>
      <td>${r.animalsTestedCount ?? "—"}</td>
      <td>${r.positiveAnimalsCount ?? 0}</td>
      <td>${r.bulkMilkOd ?? "—"}</td>
      <td>${r.labName || "—"}</td>
      <td>${r.labRef || "—"}</td>
      <td>${fmtDate(r.nextTestDue)}</td>
      <td>${r.jmmEnrolled ? "Yes" : "No"}${r.jmmEnrolled && r.njmpSchemeRef ? ` (Ref: ${r.njmpSchemeRef})` : ""}</td>
      <td>${r.njmpPlanDate ? new Date(r.njmpPlanDate).toLocaleDateString("en-GB") : "—"}</td>
      <td>${r.njmpColostrumMgmt ? "✓" : ""}${r.njmpPurchasedTesting ? " / ✓" : ""}</td>
    </tr>`
      )
      .join("");
    const html = `<!DOCTYPE html><html><head><title>Johne's Disease Monitoring Register</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px}
  table{width:100%;border-collapse:collapse}
  th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #e5e7eb}
  th{font-size:8px;text-transform:uppercase;color:#6b7280;background:#f9fafb}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Johne's Disease Monitoring Register</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b>${yearFilter !== "all" ? `<br>Year: ${yearFilter}` : ""}<br>Printed: ${printedDate}</div>
</div>
<table>
  <tr><th>Test Date</th><th>Test Type</th><th>Herd</th><th>Risk Level</th><th>Tested</th><th>Positive</th><th>Bulk Milk OD</th><th>Lab</th><th>Lab Ref</th><th>Next Due</th><th>NJMP/JMM</th><th>Plan Reviewed</th><th>Protocols</th></tr>
  ${rows || "<tr><td colspan='11'>No records</td></tr>"}
</table>
<p class="note">Johne's monitoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires a documented Johne's monitoring programme. Retain for a minimum of 3 years. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  const totalAnimals = records.reduce(
    (s: number, r: any) => s + (r.animalsTestedCount ? Number(r.animalsTestedCount) : 0),
    0
  );
  const totalPositive = records.reduce(
    (s: number, r: any) => s + (r.positiveAnimalsCount ? Number(r.positiveAnimalsCount) : 0),
    0
  );
  const prevalence =
    totalAnimals > 0 ? ((totalPositive / totalAnimals) * 100).toFixed(1) : null;
  const highRisk = records.filter(
    (r: any) => r.riskLevel && (r.riskLevel.startsWith("3") || r.riskLevel.startsWith("4"))
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Johne's Disease Monitoring Register</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Red Tractor Dairy requires a documented Johne's monitoring programme. Record each test
            with result and risk level classification.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={printReport}
            disabled={records.length === 0}
          >
            <Printer className="w-3.5 h-3.5 mr-1" />Print
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" />Add Test
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {!isLoading && records.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Tests Recorded</p>
            <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }}>{records.length}</p>
          </div>
          {totalAnimals > 0 && (
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Animals Tested</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>{totalAnimals.toLocaleString()}</p>
            </div>
          )}
          {totalAnimals > 0 && (
            <div style={{ background: totalPositive > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${totalPositive > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: totalPositive > 0 ? "#b91c1c" : "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>
                Positives{prevalence ? ` (${prevalence}%)` : ""}
              </p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: totalPositive > 0 ? "#7f1d1d" : "#14532d", lineHeight: 1, margin: 0 }}>{totalPositive}</p>
            </div>
          )}
          {highRisk > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }}>High / Elevated Risk</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }}>{highRisk}</p>
            </div>
          )}
        </div>
      )}

      {/* Table / empty state */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="font-medium text-gray-600">
            No Johne's monitoring records{yearFilter !== "all" ? ` for ${yearFilter}` : ""} yet
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Add your first test result to start tracking your herd's Johne's status.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>
                {["Test Date","Test Type","Herd","Risk Level","Animals Tested","Positive","Bulk Milk OD","Next Test Due","Doc","Actions"].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.testDate)}</td>
                  <td className="px-3 py-2">{typeLabel(r.testType)}</td>
                  <td className="px-3 py-2">
                    {r.herdId
                      ? (herds.find((h: any) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}`)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.riskLevel ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.riskLevel.startsWith("4")
                          ? "bg-red-100 text-red-800"
                          : r.riskLevel.startsWith("3")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {riskLabel(r.riskLevel)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2">{r.animalsTestedCount ?? "—"}</td>
                  <td className="px-3 py-2">{r.positiveAnimalsCount ?? 0}</td>
                  <td className="px-3 py-2">{r.bulkMilkOd ?? "—"}</td>
                  <td className="px-3 py-2">{fmtDate(r.nextTestDue)}</td>
                  <td className="px-3 py-2">
                    <DocAttach
                      farmId={farmId}
                      endpoint="johnes-monitoring"
                      recordId={r.id as number}
                      documentPath={(r as any).documentPath ?? null}
                      documentName={(r as any).documentName ?? null}
                      queryKey={["johnes-monitoring", farmId]}
                      compact
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setViewRec(r)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => del(r.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View dialog */}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Johne's Monitoring — ${fmtDate(viewRec.testDate)}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Date</p><p className="font-medium">${fmtDate(viewRec.testDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Type</p><p className="font-medium">${typeLabel(viewRec.testType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd</p><p className="font-medium">{viewRec.herdId ? (herds.find((h: any) => h.id === viewRec.herdId)?.name ?? `Herd #${viewRec.herdId}`) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Risk Level</p><p className="font-medium">${riskLabel(viewRec.riskLevel)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animals Tested</p><p className="font-medium">{viewRec.animalsTestedCount ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Positive Animals</p><p className="font-medium">{viewRec.positiveAnimalsCount ?? 0}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bulk Milk OD</p><p className="font-medium">{viewRec.bulkMilkOd ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab</p><p className="font-medium">{viewRec.labName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Reference</p><p className="font-medium">{viewRec.labRef || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scheme</p><p className="font-medium">{JOHNES_SCHEMES.find(s => s.value === viewRec.scheme)?.label ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet</p><p className="font-medium">{viewRec.vetName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Test Due</p><p className="font-medium">${fmtDate(viewRec.nextTestDue)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">NJMP / JMM Enrolled</p><p className="font-medium">{viewRec.jmmEnrolled ? "Yes" : "No"}</p></div>
              {viewRec.jmmEnrolled && viewRec.njmpSchemeRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">NJMP Scheme Ref</p><p className="font-medium font-mono">{viewRec.njmpSchemeRef}</p></div>}
              {viewRec.jmmEnrolled && viewRec.njmpPlanDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Plan Last Reviewed</p><p className="font-medium">{fmtDate(viewRec.njmpPlanDate)}</p></div>}
              {viewRec.jmmEnrolled && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum Protocol</p><p className="font-medium">{viewRec.njmpColostrumMgmt ? "✓ Documented" : "Not confirmed"}</p></div>}
              {viewRec.jmmEnrolled && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Purchased Animal Testing</p><p className="font-medium">{viewRec.njmpPurchasedTesting ? "✓ Protocol in place" : "Not confirmed"}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Sign-off</p><p className="font-medium">{viewRec.vetSignOff ? "Yes" : "No"}</p></div>
              {viewRec.actionsTaken && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Actions Taken</p>
                  <p className="font-medium">{viewRec.actionsTaken}</p>
                </div>
              )}
              {viewRec.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p>
                  <p className="font-medium">{viewRec.notes}</p>
                </div>
              )}
              {viewRec.id && (
                <div className="col-span-2 border-t pt-3">
                  <RecordAttachments farmId={farmId} recordType="johnes-monitoring" recordId={viewRec.id as number} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Johne's Monitoring Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Test Date *</Label>
              <Input type="date" value={form.testDate || ""} onChange={e => set("testDate", e.target.value)} />
            </div>
            <div>
              <Label>Test Type *</Label>
              <Select value={form.testType || ""} onValueChange={v => set("testType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {JOHNES_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.testType === "bulk_milk_elisa" && (
                <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  ⚠ <strong>NJMP note:</strong> Bulk milk ELISA is <strong>not accepted</strong> for NJMP herd risk status determination. A minimum 60-cow individual milk ELISA screen is required for NJMP status.
                </p>
              )}
            </div>
            <div>
              <Label>Herd</Label>
              <Select
                value={String(form.herdId || "__none__")}
                onValueChange={v => set("herdId", v === "__none__" ? null : Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="Select herd (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— All herds</SelectItem>
                  {herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Risk Level</Label>
              <Select
                value={form.riskLevel || "__none__"}
                onValueChange={v => set("riskLevel", v === "__none__" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not classified</SelectItem>
                  {JOHNES_RISK.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lab Name</Label>
              <Select
                value={JOHNES_LABS_PRESETS.includes(form.labName) ? form.labName : (form.labName ? "__other__" : "")}
                onValueChange={v => set("labName", v === "__other__" ? "" : v)}
              >
                <SelectTrigger><SelectValue placeholder="Select laboratory…" /></SelectTrigger>
                <SelectContent>
                  {JOHNES_LABS_PRESETS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  <SelectItem value="__other__">Other (enter below)</SelectItem>
                </SelectContent>
              </Select>
              {(!JOHNES_LABS_PRESETS.includes(form.labName) || form.labName === "") && (
                <Input className="mt-1 text-xs" value={form.labName || ""} onChange={e => set("labName", e.target.value)} placeholder="Enter lab name manually" />
              )}
            </div>
            <div>
              <Label>Lab Reference</Label>
              <Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} placeholder="Lab submission reference" />
            </div>
            <div>
              <Label>Animals Tested</Label>
              <Input type="number" min="0" value={form.animalsTestedCount ?? ""} onChange={e => set("animalsTestedCount", e.target.value)} />
            </div>
            <div>
              <Label>Positive Animals</Label>
              <Input type="number" min="0" value={form.positiveAnimalsCount ?? 0} onChange={e => set("positiveAnimalsCount", e.target.value)} />
            </div>
            <div>
              <Label>Bulk Milk OD</Label>
              <Input type="number" step="0.001" value={form.bulkMilkOd ?? ""} onChange={e => set("bulkMilkOd", e.target.value)} placeholder="Optical density reading" />
            </div>
            <div>
              <Label>Monitoring Scheme</Label>
              <Select
                value={form.scheme || "__none__"}
                onValueChange={v => set("scheme", v === "__none__" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None</SelectItem>
                  {JOHNES_SCHEMES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vet Name</Label>
              {uniqueVetNames.length > 0 ? (
                <>
                  <Select
                    value={uniqueVetNames.includes(form.vetName) ? form.vetName : (form.vetName ? "__other__" : "")}
                    onValueChange={v => set("vetName", v === "__other__" ? "" : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select vet…" /></SelectTrigger>
                    <SelectContent>
                      {uniqueVetNames.map((v: string) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      <SelectItem value="__other__">Other (enter below)</SelectItem>
                    </SelectContent>
                  </Select>
                  {(!uniqueVetNames.includes(form.vetName) || form.vetName === "") && (
                    <Input className="mt-1 text-xs" value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="Enter vet name manually" />
                  )}
                </>
              ) : (
                <Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="e.g. Mr J Smith BVSc MRCVS" />
              )}
            </div>
            <div>
              <Label>Next Test Due</Label>
              <Input type="date" value={form.nextTestDue || ""} onChange={e => set("nextTestDue", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="jmm" checked={!!form.jmmEnrolled} onChange={e => set("jmmEnrolled", e.target.checked)} className="rounded" />
                <Label htmlFor="jmm">Enrolled in NJMP / JMM Scheme</Label>
              </div>
              {form.jmmEnrolled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                  <p className="text-xs font-semibold text-green-800">National Johne's Management Plan (NJMP) Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">NJMP / Scheme Reference No.</Label>
                      <Input className="h-8 text-xs font-mono" placeholder="e.g. AHDB-JMM-123456" value={form.njmpSchemeRef || ""} onChange={e => set("njmpSchemeRef", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Written Plan Last Reviewed</Label>
                      <Input type="date" className="h-8 text-xs" value={form.njmpPlanDate || ""} onChange={e => set("njmpPlanDate", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">BAJVA Advisor Name <span className="text-gray-500 font-normal">(BCVA Accredited Johne's Veterinary Advisor)</span></Label>
                      <Input className="h-8 text-xs" placeholder="e.g. Dr A Jones MRCVS — BAJVA accredited" value={form.njmpBajvaAdvisor || ""} onChange={e => set("njmpBajvaAdvisor", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Control Strategy <span className="text-gray-500 font-normal">(select the NJMP approved strategy in place)</span></Label>
                      <Select value={form.njmpControlStrategy || "__none__"} onValueChange={v => set("njmpControlStrategy", v === "__none__" ? null : v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select strategy…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Not specified</SelectItem>
                          <SelectItem value="s1_test_cull">S1 — Test &amp; cull high-risk cows</SelectItem>
                          <SelectItem value="s2_segregate">S2 — Segregate high-risk cows</SelectItem>
                          <SelectItem value="s3_purchased_animals">S3 — Purchased animal management</SelectItem>
                          <SelectItem value="s4_calf_colostrum">S4 — Calf &amp; colostrum management</SelectItem>
                          <SelectItem value="s5_slurry_pasture">S5 — Slurry &amp; pasture management</SelectItem>
                          <SelectItem value="s6_bespoke">S6 — Bespoke vet-led strategy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Annual Risk Assessment Date</Label>
                      <Input type="date" className="h-8 text-xs" value={form.njmpRiskAssessmentDate || ""} onChange={e => set("njmpRiskAssessmentDate", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Annual Declaration Submitted</Label>
                      <Input type="date" className="h-8 text-xs" value={form.njmpDeclarationDate || ""} onChange={e => set("njmpDeclarationDate", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Declaration Recipient <span className="text-gray-500 font-normal">(milk purchaser / processor)</span></Label>
                      <Input className="h-8 text-xs" placeholder="e.g. Arla Foods UK, Müller Milk, First Milk…" value={form.njmpDeclarationRecipient || ""} onChange={e => set("njmpDeclarationRecipient", e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={!!form.njmpColostrumMgmt} onChange={e => set("njmpColostrumMgmt", e.target.checked)} className="rounded" />
                      <span className="font-medium">Colostrum management protocol documented</span>
                      <span className="text-gray-500">(NJMP — prevent calf-to-calf transmission)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={!!form.njmpPurchasedTesting} onChange={e => set("njmpPurchasedTesting", e.target.checked)} className="rounded" />
                      <span className="font-medium">Purchased animal testing protocol in place</span>
                      <span className="text-gray-500">(NJMP — test/quarantine bought-in cattle)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="vetso" checked={!!form.vetSignOff} onChange={e => set("vetSignOff", e.target.checked)} className="rounded" />
              <Label htmlFor="vetso">Vet sign-off obtained</Label>
            </div>
            <div className="col-span-2">
              <Label>Actions Taken</Label>
              <Textarea
                rows={2}
                value={form.actionsTaken || ""}
                onChange={e => set("actionsTaken", e.target.value)}
                placeholder="Management actions, culling decisions, biosecurity changes…"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Add Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <JohnesDeclarationSection farmId={farmId} allMonitoringRecords={allRecords} />
    </div>
  );
}
