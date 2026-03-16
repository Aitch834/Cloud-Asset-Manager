import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, Leaf, Printer } from "lucide-react";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const MANURE_TYPES = ["Cattle FYM", "Pig Slurry", "Cattle Slurry", "Poultry Manure", "Digestate", "Compost", "Sewage Sludge", "Green Waste Compost", "None"];
const APP_METHODS = ["Injected", "Band spread", "Broadcast (surface)", "Trailing shoe", "Dribble bar", "Foliar application"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i);

export default function NMPPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [addEntryPlanId, setAddEntryPlanId] = useState<number | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);
  const [printPlan, setPrintPlan] = useState<any | null>(null);

  const plansQ = useQuery({ queryKey: ["nmp-plans", farmId], queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const entriesQ = useQuery({ queryKey: ["nmp-entries", farmId, expandedPlanId], queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans/${expandedPlanId}/field-entries`).then(r => r.json()), enabled: !!farmId && !!expandedPlanId, select: d => d.entries ?? [] });

  const plans: any[] = plansQ.data ?? [];
  const fields: any[] = fieldsQ.data ?? [];
  const entries: any[] = entriesQ.data ?? [];

  const emptyPlan = { planYear: String(CURRENT_YEAR), preparedBy: "", approvedBy: "", approvedDate: "", notes: "" };
  const [planForm, setPlanForm] = useState<any>(emptyPlan);

  const emptyEntry = { fieldId: "", nitrogenKgHa: "", phosphorusKgHa: "", potassiumKgHa: "", organicManureType: "", organicManureRate: "", applicationMethod: "", timingNotes: "" };
  const [entryForm, setEntryForm] = useState<any>(emptyEntry);

  const createPlanMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nmp-plans`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Plan created" }); qc.invalidateQueries({ queryKey: ["nmp-plans", farmId] }); setAddPlanOpen(false); setPlanForm(emptyPlan); },
    onError: () => toast({ title: "Failed to create plan", variant: "destructive" }),
  });

  const deletePlanMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/nmp-plans/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Plan deleted" }); qc.invalidateQueries({ queryKey: ["nmp-plans", farmId] }); setDeletePlanId(null); if (expandedPlanId === deletePlanId) setExpandedPlanId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const createEntryMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nmp-plans/${addEntryPlanId}/field-entries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Field entry added" }); qc.invalidateQueries({ queryKey: ["nmp-entries", farmId, addEntryPlanId] }); setAddEntryPlanId(null); setEntryForm(emptyEntry); },
    onError: () => toast({ title: "Failed to add entry", variant: "destructive" }),
  });

  const deleteEntryMut = useMutation({
    mutationFn: ({ entryId }: { entryId: number }) => fetch(`/api/farms/${farmId}/nmp-plans/${expandedPlanId}/field-entries/${entryId}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Entry removed" }); qc.invalidateQueries({ queryKey: ["nmp-entries", farmId, expandedPlanId] }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <AppLayout title="Nutrient Management Plans">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Annual nutrient management plans per field, covering nitrogen, phosphorus and potassium budgets and organic manure applications. Required under the Nitrates Action Programme and Red Tractor Crop Inputs standard.
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Leaf size={18} color="#166534" />
            <span style={{ fontWeight: 600, color: "#111827" }}>{plans.length} plan{plans.length !== 1 ? "s" : ""} on record</span>
          </div>
          <Button size="sm" onClick={() => { setPlanForm(emptyPlan); setAddPlanOpen(true); }}><Plus size={14} className="mr-1" />New NMP</Button>
        </div>

        {plansQ.isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : plans.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
            <div style={{ background: "#f0fdf4", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}><Leaf size={28} color="#16a34a" /></div>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No nutrient management plans yet</p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400, marginBottom: "1.25rem" }}>Create a plan for each growing year. Add per-field nutrient budgets including N, P and K targets and organic manure applications.</p>
            <Button size="sm" onClick={() => setAddPlanOpen(true)}><Plus size={14} className="mr-1" />Create First NMP</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan: any) => {
              const isExpanded = expandedPlanId === plan.id;
              return (
                <div key={plan.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  <div
                    style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                    onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  >
                    <span style={{ color: "#9ca3af" }}>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>{plan.planYear} Nutrient Management Plan</span>
                      {plan.approvedDate && <Badge style={{ background: "#dcfce7", color: "#166534", border: "none", fontSize: "0.72rem" }}>Approved {fmt(plan.approvedDate)}</Badge>}
                      {!plan.approvedDate && <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem" }}>Pending Approval</Badge>}
                      {plan.preparedBy && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Prepared by: {plan.preparedBy}</span>}
                      {plan.approvedBy && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Approved by: {plan.approvedBy}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => setPrintPlan(plan)}><Printer size={13} /></Button>
                      <Button size="sm" variant="outline" onClick={() => { setAddEntryPlanId(plan.id); setExpandedPlanId(plan.id); setEntryForm(emptyEntry); }}><Plus size={13} className="mr-1" />Add Field</Button>
                      <button onClick={() => setDeletePlanId(plan.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete plan"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #f3f4f6", padding: "1rem 1.25rem" }}>
                      {plan.notes && <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem", background: "#f9fafb", borderRadius: 6, padding: "0.5rem 0.75rem" }}>{plan.notes}</p>}
                      {entriesQ.isLoading ? (
                        <p className="text-sm text-gray-400">Loading field entries...</p>
                      ) : entries.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "1.5rem", background: "#f9fafb", borderRadius: 8 }}>
                          <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "0.75rem" }}>No field entries yet. Add individual field nutrient budgets for this plan.</p>
                          <Button size="sm" variant="outline" onClick={() => { setAddEntryPlanId(plan.id); setEntryForm(emptyEntry); }}><Plus size={13} className="mr-1" />Add First Field</Button>
                        </div>
                      ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                          <thead>
                            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                              {["Field", "N (kg/ha)", "P (kg/ha)", "K (kg/ha)", "Organic Manure", "Rate (t/ha)", "Method", "Timing", ""].map((h, i) => (
                                <th key={i} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", whiteSpace: "nowrap" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((e: any, i: number) => (
                              <tr key={e.id} style={{ borderBottom: i < entries.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>{e.fieldName || `Field #${e.fieldId}`}</td>
                                <td style={{ padding: "0.5rem 0.75rem" }}>{e.nitrogenKgHa ? <NutrientBadge val={e.nitrogenKgHa} color="#1d4ed8" bg="#dbeafe" letter="N" /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                                <td style={{ padding: "0.5rem 0.75rem" }}>{e.phosphorusKgHa ? <NutrientBadge val={e.phosphorusKgHa} color="#7c3aed" bg="#ede9fe" letter="P" /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                                <td style={{ padding: "0.5rem 0.75rem" }}>{e.potassiumKgHa ? <NutrientBadge val={e.potassiumKgHa} color="#b45309" bg="#fef3c7" letter="K" /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                                <td style={{ padding: "0.5rem 0.75rem", color: "#374151" }}>{e.organicManureType || <span style={{ color: "#d1d5db" }}>None</span>}</td>
                                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{e.organicManureRate ? `${e.organicManureRate}` : "—"}</td>
                                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{e.applicationMethod || "—"}</td>
                                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.timingNotes || "—"}</td>
                                <td style={{ padding: "0.375rem" }}>
                                  <button onClick={() => deleteEntryMut.mutate({ entryId: e.id })} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Remove"><Trash2 size={13} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={addPlanOpen} onOpenChange={o => { setAddPlanOpen(o); if (!o) setPlanForm(emptyPlan); }}>
          <DialogContent style={{ maxWidth: 480 }}>
            <DialogHeader><DialogTitle>Create Nutrient Management Plan</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Plan Year <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={planForm.planYear} onValueChange={v => setPlanForm((f: any) => ({ ...f, planYear: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prepared By</Label>
                  <Input placeholder="Name or FACTS adviser" value={planForm.preparedBy} onChange={e => setPlanForm((f: any) => ({ ...f, preparedBy: e.target.value }))} />
                </div>
                <div>
                  <Label>Approved By</Label>
                  <Input placeholder="Farm manager or agronomist" value={planForm.approvedBy} onChange={e => setPlanForm((f: any) => ({ ...f, approvedBy: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Approval Date</Label>
                <Input type="date" value={planForm.approvedDate} onChange={e => setPlanForm((f: any) => ({ ...f, approvedDate: e.target.value }))} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="e.g. Based on FACTS-qualified analysis, SNS index 2 for all fields" value={planForm.notes} onChange={e => setPlanForm((f: any) => ({ ...f, notes: e.target.value }))} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddPlanOpen(false)}>Cancel</Button>
              <Button onClick={() => createPlanMut.mutate(planForm)} disabled={!planForm.planYear || createPlanMut.isPending}>Create Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addEntryPlanId !== null} onOpenChange={o => { if (!o) setAddEntryPlanId(null); }}>
          <DialogContent style={{ maxWidth: 520 }}>
            <DialogHeader><DialogTitle>Add Field Nutrient Budget</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Field <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={entryForm.fieldId} onValueChange={v => setEntryForm((f: any) => ({ ...f, fieldId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select field..." /></SelectTrigger>
                  <SelectContent>{fields.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem", fontSize: "0.8rem", color: "#166534" }}>
                Enter the planned nutrient applications for this field. Leave blank if not applicable.
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Nitrogen N (kg/ha)</Label>
                  <Input type="number" step="0.1" placeholder="0" value={entryForm.nitrogenKgHa} onChange={e => setEntryForm((f: any) => ({ ...f, nitrogenKgHa: e.target.value }))} />
                </div>
                <div>
                  <Label>Phosphorus P (kg/ha)</Label>
                  <Input type="number" step="0.1" placeholder="0" value={entryForm.phosphorusKgHa} onChange={e => setEntryForm((f: any) => ({ ...f, phosphorusKgHa: e.target.value }))} />
                </div>
                <div>
                  <Label>Potassium K (kg/ha)</Label>
                  <Input type="number" step="0.1" placeholder="0" value={entryForm.potassiumKgHa} onChange={e => setEntryForm((f: any) => ({ ...f, potassiumKgHa: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Organic Manure Type</Label>
                  <Select value={entryForm.organicManureType} onValueChange={v => setEntryForm((f: any) => ({ ...f, organicManureType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{MANURE_TYPES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Manure Rate (t/ha or m³/ha)</Label>
                  <Input type="number" step="0.1" placeholder="0.0" value={entryForm.organicManureRate} onChange={e => setEntryForm((f: any) => ({ ...f, organicManureRate: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Application Method</Label>
                <Select value={entryForm.applicationMethod} onValueChange={v => setEntryForm((f: any) => ({ ...f, applicationMethod: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
                  <SelectContent>{APP_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Timing Notes</Label>
                <Textarea placeholder="e.g. Apply pre-drilling September, avoid waterlogged conditions" value={entryForm.timingNotes} onChange={e => setEntryForm((f: any) => ({ ...f, timingNotes: e.target.value }))} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddEntryPlanId(null)}>Cancel</Button>
              <Button onClick={() => createEntryMut.mutate(entryForm)} disabled={!entryForm.fieldId || createEntryMut.isPending}>Add Field Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deletePlanId !== null} onOpenChange={o => { if (!o) setDeletePlanId(null); }}>
          <DialogContent style={{ maxWidth: 400 }}>
            <DialogHeader><DialogTitle>Delete NMP</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-2">This will delete the plan and all its field entries. This cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletePlanId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deletePlanId !== null && deletePlanMut.mutate(deletePlanId)} disabled={deletePlanMut.isPending}>Delete Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {printPlan && <PrintDialog plan={printPlan} farmId={farmId} onClose={() => setPrintPlan(null)} />}
      </div>
    </AppLayout>
  );
}

function NutrientBadge({ val, color, bg, letter }: { val: string; color: string; bg: string; letter: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: bg, color, borderRadius: 5, padding: "2px 6px", fontSize: "0.78rem", fontWeight: 600 }}>
      <span style={{ fontWeight: 800 }}>{letter}</span>{val}
    </span>
  );
}

function PrintDialog({ plan, farmId, onClose }: { plan: any; farmId: number | null; onClose: () => void }) {
  const entriesQ = useQuery({ queryKey: ["nmp-entries-print", farmId, plan.id], queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans/${plan.id}/field-entries`).then(r => r.json()), enabled: !!farmId, select: d => d.entries ?? [] });
  const entries: any[] = entriesQ.data ?? [];
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const handlePrint = () => {
    const rows = entries.map((e: any) => `<tr><td>${e.fieldName || `Field #${e.fieldId}`}</td><td>${e.nitrogenKgHa || "—"}</td><td>${e.phosphorusKgHa || "—"}</td><td>${e.potassiumKgHa || "—"}</td><td>${e.organicManureType || "None"}</td><td>${e.organicManureRate || "—"}</td><td>${e.applicationMethod || "—"}</td><td>${e.timingNotes || "—"}</td></tr>`).join("");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>NMP ${plan.planYear}</title><style>body{font-family:Arial,sans-serif;font-size:11px;margin:2cm}h1{font-size:14px;border-bottom:2px solid #333;padding-bottom:5px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#f3f4f6;padding:5px 6px;text-align:left;font-size:10px;border:1px solid #d1d5db}td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top}tr:nth-child(even){background:#f9fafb}.meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;font-size:11px;margin:10px 0}.footer{margin-top:24px;font-size:9px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}</style></head><body><h1>Nutrient Management Plan — ${plan.planYear}</h1><div class="meta"><div><b>Prepared by:</b> ${plan.preparedBy || "—"}</div><div><b>Approved by:</b> ${plan.approvedBy || "—"}</div><div><b>Approval date:</b> ${plan.approvedDate ? new Date(plan.approvedDate).toLocaleDateString("en-GB") : "Pending"}</div><div><b>Printed:</b> ${today}</div></div>${plan.notes ? `<p style="font-size:11px;background:#f9fafb;padding:6px 8px;border-radius:4px">${plan.notes}</p>` : ""}<table><thead><tr><th>Field</th><th>N (kg/ha)</th><th>P (kg/ha)</th><th>K (kg/ha)</th><th>Organic Manure</th><th>Rate</th><th>Method</th><th>Timing Notes</th></tr></thead><tbody>${rows}</tbody></table><div class="footer">BDE Farm Trac — Red Tractor Compliance Platform | ${today}</div></body></html>`);
    win.document.close(); win.focus(); win.print();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 400 }}>
        <DialogHeader><DialogTitle>Print NMP — {plan.planYear}</DialogTitle></DialogHeader>
        <p className="text-sm text-gray-600 py-2">{entriesQ.isLoading ? "Loading field entries..." : `${entries.length} field entries will be included in the print.`}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePrint} disabled={entriesQ.isLoading}><Printer size={14} className="mr-1" />Print / Export PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
