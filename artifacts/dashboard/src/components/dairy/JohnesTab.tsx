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
    </div>
  );
}
