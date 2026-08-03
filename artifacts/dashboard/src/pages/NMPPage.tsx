import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Link } from "wouter";
import { printProReport } from "@/lib/print-report";
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
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, Leaf, Printer, Info, ArrowRight, Pencil, ExternalLink } from "lucide-react";

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
  const [entryCountByPlan, setEntryCountByPlan] = useState<Record<number, number>>({});
  const { data: farmDetailData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const currentFarm = farmDetailData?.record;

  const plansQ = useQuery({
    queryKey: ["nmp-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const entriesQ = useQuery({
    queryKey: ["nmp-entries", farmId, expandedPlanId],
    queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans/${expandedPlanId}/field-entries`).then(r => r.json()),
    enabled: !!farmId && !!expandedPlanId,
    select: d => d.entries ?? [],
  });
  useEffect(() => {
    const data: any[] = entriesQ.data ?? [];
    if (expandedPlanId) setEntryCountByPlan(prev => ({ ...prev, [expandedPlanId]: data.length }));
  }, [entriesQ.data, expandedPlanId]);

  const plans: any[] = plansQ.data ?? [];
  const fields: any[] = fieldsQ.data ?? [];
  const entries: any[] = entriesQ.data ?? [];

  const emptyPlan = { planYear: String(CURRENT_YEAR), preparedBy: "", approvedBy: "", approvedDate: "", notes: "" };
  const [planForm, setPlanForm] = useState<any>(emptyPlan);

  const emptyEntry = { fieldId: "", cropType: "", nitrogenKgHa: "", phosphorusKgHa: "", potassiumKgHa: "", organicManureType: "", organicManureRate: "", applicationMethod: "", timingNotes: "" };
  const [entryForm, setEntryForm] = useState<any>(emptyEntry);

  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [editEntryForm, setEditEntryForm] = useState<any>(emptyEntry);

  const createPlanMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nmp-plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (data: any) => {
      toast({ title: "Plan created — now add your field entries below" });
      qc.invalidateQueries({ queryKey: ["nmp-plans", farmId] });
      setAddPlanOpen(false);
      setPlanForm(emptyPlan);
      const newId = data.record?.id;
      if (newId) {
        setExpandedPlanId(newId);
        setTimeout(() => {
          setAddEntryPlanId(newId);
          setEntryForm(emptyEntry);
        }, 300);
      }
    },
    onError: () => toast({ title: "Failed to create plan", variant: "destructive" }),
  });

  const deletePlanMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/nmp-plans/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: (_data, id) => {
      toast({ title: "Plan deleted" });
      qc.invalidateQueries({ queryKey: ["nmp-plans", farmId] });
      setDeletePlanId(null);
      if (expandedPlanId === id) setExpandedPlanId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const createEntryMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nmp-plans/${addEntryPlanId}/field-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      toast({ title: "Field entry added" });
      qc.invalidateQueries({ queryKey: ["nmp-entries", farmId, addEntryPlanId] });
      setAddEntryPlanId(null);
      setEntryForm(emptyEntry);
    },
    onError: () => toast({ title: "Failed to add entry", variant: "destructive" }),
  });

  const deleteEntryMut = useMutation({
    mutationFn: ({ entryId }: { entryId: number }) =>
      fetch(`/api/farms/${farmId}/nmp-plans/${expandedPlanId}/field-entries/${entryId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      toast({ title: "Entry removed" });
      qc.invalidateQueries({ queryKey: ["nmp-entries", farmId, expandedPlanId] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const updateEntryMut = useMutation({
    mutationFn: ({ entryId, planId, body }: { entryId: number; planId: number; body: any }) =>
      fetch(`/api/farms/${farmId}/nmp-plans/${planId}/field-entries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      toast({ title: "Field entry updated" });
      qc.invalidateQueries({ queryKey: ["nmp-entries", farmId, expandedPlanId] });
      setEditEntry(null);
    },
    onError: () => toast({ title: "Failed to update entry", variant: "destructive" }),
  });

  return (
    <AppLayout title="Nutrient Management Plans">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Explanation banner */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.875rem 1.125rem", marginBottom: "1.25rem", display: "flex", gap: 10 }}>
          <Info size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: "0.875rem", color: "#166534", lineHeight: 1.5 }}>
            <strong>How NMP works:</strong> Create one plan per growing year — this is your farm-level NMP document (who prepared it, when it was approved). Then add a <strong>field entry</strong> for each field, recording the planned N, P and K nutrient budgets and any organic manure applications. Required under the Nitrates Action Programme and Red Tractor Crop Inputs standard.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Leaf size={18} color="#166534" />
            <span style={{ fontWeight: 600, color: "#111827" }}>{plans.length} plan{plans.length !== 1 ? "s" : ""} on record</span>
          </div>
          <Button size="sm" onClick={() => { setPlanForm(emptyPlan); setAddPlanOpen(true); }}>
            <Plus size={14} className="mr-1" />New NMP
          </Button>
        </div>

        {plansQ.isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : plans.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", textAlign: "center" }}>
            <div style={{ background: "#f0fdf4", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}>
              <Leaf size={28} color="#16a34a" />
            </div>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No nutrient management plans yet</p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 440, marginBottom: "1.25rem" }}>
              Start by creating a plan for the current growing year. You'll then add individual nutrient budgets for each of your fields within that plan.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", fontSize: "0.82rem", color: "#6b7280" }}>
              <span style={{ background: "#e5e7eb", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>Step 1</span>
              <span>Create the annual plan</span>
              <ArrowRight size={14} />
              <span style={{ background: "#e5e7eb", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>Step 2</span>
              <span>Add a field entry for each field</span>
            </div>
            <Button size="sm" onClick={() => setAddPlanOpen(true)}>
              <Plus size={14} className="mr-1" />Create First NMP
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan: any) => {
              const isExpanded = expandedPlanId === plan.id;
              const entryCount = entryCountByPlan[plan.id];
              return (
                <div key={plan.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  {/* Plan header row */}
                  <div
                    style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                    onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  >
                    <span style={{ color: "#9ca3af" }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                        {plan.planYear} Nutrient Management Plan
                      </span>
                      {plan.approvedDate
                        ? <Badge style={{ background: "#dcfce7", color: "#166534", border: "none", fontSize: "0.72rem" }}>Approved {fmt(plan.approvedDate)}</Badge>
                        : <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem" }}>Pending Approval</Badge>
                      }
                      {entryCount !== undefined && (
                        <Badge style={{ background: entryCount === 0 ? "#fef2f2" : "#f0fdf4", color: entryCount === 0 ? "#991b1b" : "#166534", border: "none", fontSize: "0.72rem" }}>
                          {entryCount} field{entryCount !== 1 ? "s" : ""} entered
                        </Badge>
                      )}
                      {plan.preparedBy && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Prepared by: {plan.preparedBy}</span>}
                      {plan.approvedBy && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Approved by: {plan.approvedBy}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => setPrintPlan(plan)}><Printer size={13} /></Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setAddEntryPlanId(plan.id); setExpandedPlanId(plan.id); setEntryForm(emptyEntry); }}
                      >
                        <Plus size={13} className="mr-1" />Add Field
                      </Button>
                      <button
                        onClick={() => setDeletePlanId(plan.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}
                        title="Delete plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded field entries */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #f3f4f6", padding: "1rem 1.25rem" }}>
                      {plan.notes && (
                        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem", background: "#f9fafb", borderRadius: 6, padding: "0.5rem 0.75rem" }}>
                          {plan.notes}
                        </p>
                      )}

                      {entriesQ.isLoading ? (
                        <p className="text-sm text-gray-400">Loading field entries...</p>
                      ) : entries.length === 0 ? (
                        <div style={{ border: "2px dashed #d1fae5", background: "#f0fdf4", borderRadius: 8, padding: "1.5rem", textAlign: "center" }}>
                          <Leaf size={22} color="#16a34a" style={{ margin: "0 auto 0.5rem" }} />
                          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#166534", marginBottom: 4 }}>
                            No field entries yet for this plan
                          </p>
                          <p style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "1rem", maxWidth: 380, margin: "0 auto 1rem" }}>
                            Add a nutrient budget for each field — select the field, then enter N, P and K values (kg/ha) and any organic manure application details.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => { setAddEntryPlanId(plan.id); setEntryForm(emptyEntry); }}
                          >
                            <Plus size={13} className="mr-1" />Add First Field Entry
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                              <thead>
                                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                  {["Field", "Crop", "N (kg/ha)", "P (kg/ha)", "K (kg/ha)", "Organic Manure", "Rate (t/ha)", "Method", "Timing Notes", ""].map((h, i) => (
                                    <th key={i} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", whiteSpace: "nowrap" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {entries.map((e: any, i: number) => (
                                  <tr key={e.id} style={{ borderBottom: i < entries.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "#1e40af" }}>
                                      {e.fieldName || `Field #${e.fieldId}`}
                                    </td>
                                    <td style={{ padding: "0.5rem 0.75rem", color: "#374151", fontWeight: 500 }}>
                                      {e.cropType || <span style={{ color: "#d1d5db" }}>—</span>}
                                    </td>
                                    <td style={{ padding: "0.5rem 0.75rem" }}>
                                      {e.nitrogenKgHa
                                        ? <NutrientBadge val={e.nitrogenKgHa} color="#1d4ed8" bg="#dbeafe" letter="N" />
                                        : <span style={{ color: "#d1d5db" }}>—</span>}
                                    </td>
                                    <td style={{ padding: "0.5rem 0.75rem" }}>
                                      {e.phosphorusKgHa
                                        ? <NutrientBadge val={e.phosphorusKgHa} color="#7c3aed" bg="#ede9fe" letter="P" />
                                        : <span style={{ color: "#d1d5db" }}>—</span>}
                                    </td>
                                    <td style={{ padding: "0.5rem 0.75rem" }}>
                                      {e.potassiumKgHa
                                        ? <NutrientBadge val={e.potassiumKgHa} color="#b45309" bg="#fef3c7" letter="K" />
                                        : <span style={{ color: "#d1d5db" }}>—</span>}
                                    </td>
                                    <td style={{ padding: "0.5rem 0.75rem", color: "#374151" }}>
                                      {e.organicManureType || <span style={{ color: "#d1d5db" }}>None</span>}
                                    </td>
                                    <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>
                                      {e.organicManureRate ? `${e.organicManureRate}` : "—"}
                                    </td>
                                    <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>
                                      {e.applicationMethod || "—"}
                                    </td>
                                    <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", minWidth: 160, maxWidth: 260 }}>
                                      {e.timingNotes || "—"}
                                    </td>
                                    <td style={{ padding: "0.375rem", whiteSpace: "nowrap" }}>
                                      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                                        <button
                                          onClick={() => {
                                            setEditEntry({ ...e, planId: expandedPlanId });
                                            setEditEntryForm({
                                              fieldId: e.fieldId ? String(e.fieldId) : "",
                                              cropType: e.cropType ?? "",
                                              nitrogenKgHa: e.nitrogenKgHa ?? "",
                                              phosphorusKgHa: e.phosphorusKgHa ?? "",
                                              potassiumKgHa: e.potassiumKgHa ?? "",
                                              organicManureType: e.organicManureType ?? "",
                                              organicManureRate: e.organicManureRate ?? "",
                                              applicationMethod: e.applicationMethod ?? "",
                                              timingNotes: e.timingNotes ?? "",
                                            });
                                          }}
                                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}
                                          title="Edit field entry"
                                        >
                                          <Pencil size={13} />
                                        </button>
                                        <Link href={`/sprays?field=${encodeURIComponent(e.fieldName ?? e.fieldId ?? "")}`} style={{ display: "flex", alignItems: "center", color: "#9ca3af", padding: 4 }} title="View spray applications for this field">
                                          <ExternalLink size={13} />
                                        </Link>
                                        <button
                                          onClick={() => deleteEntryMut.mutate({ entryId: e.id })}
                                          style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}
                                          title="Remove field entry"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setAddEntryPlanId(plan.id); setEntryForm(emptyEntry); }}
                            >
                              <Plus size={13} className="mr-1" />Add Another Field
                            </Button>
                          </div>

                          {entries.some((e: any) => e.nitrogenKgHa || e.phosphorusKgHa || e.potassiumKgHa) && (
                            <div style={{ marginTop: "1.25rem", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "1rem" }}>
                              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }}>N/P/K Budget by Field (kg/ha)</p>
                              <ResponsiveContainer width="100%" height={Math.max(180, entries.length * 44)}>
                                <BarChart
                                  data={entries.map((e: any) => ({
                                    field: e.fieldName || `Field #${e.fieldId}`,
                                    N: parseFloat(String(e.nitrogenKgHa || 0)),
                                    P: parseFloat(String(e.phosphorusKgHa || 0)),
                                    K: parseFloat(String(e.potassiumKgHa || 0)),
                                  }))}
                                  layout="vertical"
                                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                  <XAxis type="number" tick={{ fontSize: 11 }} unit=" kg/ha" />
                                  <YAxis type="category" dataKey="field" tick={{ fontSize: 11 }} width={120} />
                                  <Tooltip formatter={(v: number) => [`${v} kg/ha`, ""]} />
                                  <Legend />
                                  <Bar dataKey="N" fill="#1d4ed8" name="Nitrogen (N)" radius={[0, 2, 2, 0]} />
                                  <Bar dataKey="P" fill="#7c3aed" name="Phosphorus (P)" radius={[0, 2, 2, 0]} />
                                  <Bar dataKey="K" fill="#b45309" name="Potassium (K)" radius={[0, 2, 2, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Create Plan dialog ── */}
        <Dialog open={addPlanOpen} onOpenChange={o => { setAddPlanOpen(o); if (!o) { setPlanForm(emptyPlan); createPlanMut.reset(); } }}>
          <DialogContent style={{ maxWidth: 500 }}>
            <DialogHeader>
              <DialogTitle>Create Nutrient Management Plan</DialogTitle>
            </DialogHeader>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: "0.82rem", color: "#166534", display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>This creates the annual plan document. After saving, you'll add a separate nutrient budget for each field.</span>
            </div>
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
                <Textarea
                  placeholder="e.g. Based on FACTS-qualified analysis, SNS index 2 for all fields"
                  value={planForm.notes}
                  onChange={e => setPlanForm((f: any) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
            <DialogMutationError mutation={createPlanMut} message="Failed to create plan — your entries are still here." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddPlanOpen(false)}>Cancel</Button>
              <Button
                onClick={() => createPlanMut.mutate(planForm)}
                disabled={!planForm.planYear || createPlanMut.isPending}
              >
                Create Plan &amp; Add Fields
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Add Field Entry dialog ── */}
        <Dialog open={addEntryPlanId !== null} onOpenChange={o => { if (!o) { setAddEntryPlanId(null); createEntryMut.reset(); } }}>
          <DialogContent style={{ maxWidth: 540 }}>
            <DialogHeader>
              <DialogTitle>Add Field Nutrient Budget</DialogTitle>
            </DialogHeader>
            <div style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: 4 }}>
              Select the field and enter the planned nutrient applications. Repeat for each field in your NMP.
            </div>
            <div className="space-y-3 py-1">
              {/* Field selector — the key link between the plan and a farm field */}
              <div>
                <Label>Field <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={entryForm.fieldId} onValueChange={v => setEntryForm((f: any) => ({ ...f, fieldId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.length === 0 ? (
                      <SelectItem value="__none__" disabled>No fields registered — add fields in Fields &amp; Crops first</SelectItem>
                    ) : (
                      fields.map((f: any) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.name}{f.fieldReference ? ` — ${f.fieldReference}` : ""}
                          {f.areaHa ? ` (${f.areaHa} ha)` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {fields.length === 0 && (
                  <p style={{ fontSize: "0.78rem", color: "#f59e0b", marginTop: 4 }}>
                    You need to register fields in Fields &amp; Crops before adding NMP field entries.
                  </p>
                )}
              </div>

              {/* Crop type — Red Tractor requires crop-specific nutrient plans */}
              <div>
                <Label>Crop / Enterprise <span style={{ fontSize: "0.78rem", color: "#9ca3af", fontWeight: 400 }}>(recommended)</span></Label>
                <Input
                  placeholder="e.g. Winter Wheat, Oil Seed Rape, Spring Barley"
                  value={entryForm.cropType}
                  onChange={e => setEntryForm((f: any) => ({ ...f, cropType: e.target.value }))}
                />
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 3 }}>
                  If the same field has more than one crop (e.g. catch crop rotation), add a separate entry per crop.
                </p>
              </div>

              <div style={{ background: "#f9fafb", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#374151" }}>
                <strong>Planned nutrient applications</strong> — enter the target kg/ha for each nutrient. Leave blank if not applicable.
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
                <Textarea
                  placeholder="e.g. Apply pre-drilling September, avoid waterlogged conditions"
                  value={entryForm.timingNotes}
                  onChange={e => setEntryForm((f: any) => ({ ...f, timingNotes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
            <DialogMutationError mutation={createEntryMut} message="Failed to add field entry — your entries are still here." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddEntryPlanId(null)}>Done</Button>
              <Button
                onClick={() => createEntryMut.mutate(entryForm)}
                disabled={!entryForm.fieldId || createEntryMut.isPending}
              >
                Save &amp; Add Another Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Plan dialog ── */}
        <Dialog open={deletePlanId !== null} onOpenChange={o => { if (!o) { setDeletePlanId(null); deletePlanMut.reset(); } }}>
          <DialogContent style={{ maxWidth: 400 }}>
            <DialogHeader><DialogTitle>Delete NMP</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-2">
              This will permanently delete the plan and all its field entries. This cannot be undone.
            </p>
            <DialogMutationError mutation={deletePlanMut} message="Failed to delete the plan." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletePlanId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deletePlanId !== null && deletePlanMut.mutate(deletePlanId)}
                disabled={deletePlanMut.isPending}
              >
                Delete Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Field Entry dialog ── */}
        <Dialog open={!!editEntry} onOpenChange={o => { if (!o) { setEditEntry(null); updateEntryMut.reset(); } }}>
          <DialogContent style={{ maxWidth: 540 }}>
            <DialogHeader>
              <DialogTitle>Edit Field Nutrient Budget</DialogTitle>
            </DialogHeader>
            <div style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: 4 }}>
              Update the planned nutrient applications for <strong>{editEntry?.fieldName || "this field"}</strong>.
            </div>
            <div className="space-y-3 py-1">
              <div>
                <Label>Field</Label>
                <Select value={editEntryForm.fieldId} onValueChange={v => setEditEntryForm((f: any) => ({ ...f, fieldId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select a field..." /></SelectTrigger>
                  <SelectContent>
                    {fields.map((f: any) => (
                      <SelectItem key={f.id} value={String(f.id)}>
                        {f.name}{f.fieldReference ? ` — ${f.fieldReference}` : ""}{f.areaHa ? ` (${f.areaHa} ha)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Crop / Enterprise</Label>
                <Input placeholder="e.g. Winter Wheat, Oil Seed Rape" value={editEntryForm.cropType} onChange={e => setEditEntryForm((f: any) => ({ ...f, cropType: e.target.value }))} />
              </div>
              <div style={{ background: "#f9fafb", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#374151" }}>
                <strong>Planned nutrient applications</strong> — kg/ha targets
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Nitrogen N (kg/ha)</Label>
                  <Input type="number" step="0.1" placeholder="0" value={editEntryForm.nitrogenKgHa} onChange={e => setEditEntryForm((f: any) => ({ ...f, nitrogenKgHa: e.target.value }))} />
                </div>
                <div>
                  <Label>Phosphorus P (kg/ha)</Label>
                  <Input type="number" step="0.1" placeholder="0" value={editEntryForm.phosphorusKgHa} onChange={e => setEditEntryForm((f: any) => ({ ...f, phosphorusKgHa: e.target.value }))} />
                </div>
                <div>
                  <Label>Potassium K (kg/ha)</Label>
                  <Input type="number" step="0.1" placeholder="0" value={editEntryForm.potassiumKgHa} onChange={e => setEditEntryForm((f: any) => ({ ...f, potassiumKgHa: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Organic Manure Type</Label>
                  <Select value={editEntryForm.organicManureType || "__none__"} onValueChange={v => setEditEntryForm((f: any) => ({ ...f, organicManureType: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {MANURE_TYPES.filter(m => m !== "None").map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Manure Rate (t/ha or m³/ha)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 25" value={editEntryForm.organicManureRate} onChange={e => setEditEntryForm((f: any) => ({ ...f, organicManureRate: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Application Method</Label>
                <Select value={editEntryForm.applicationMethod || "__none__"} onValueChange={v => setEditEntryForm((f: any) => ({ ...f, applicationMethod: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {APP_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Timing Notes</Label>
                <Textarea
                  placeholder="e.g. Apply pre-drilling September, avoid waterlogged conditions"
                  value={editEntryForm.timingNotes}
                  onChange={e => setEditEntryForm((f: any) => ({ ...f, timingNotes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogMutationError mutation={updateEntryMut} message="Failed to update the entry — your changes are still here." />
            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setEditEntry(null)}>Cancel</Button>
              <Button
                onClick={() => updateEntryMut.mutate({ entryId: editEntry.id, planId: editEntry.planId, body: editEntryForm })}
                disabled={!editEntryForm.fieldId || updateEntryMut.isPending}
              >
                {updateEntryMut.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {printPlan && <PrintDialog plan={printPlan} farmId={farmId} farm={currentFarm} onClose={() => setPrintPlan(null)} />}
      </div>
    </AppLayout>
  );
}

function NutrientBadge({ val, color, bg, letter }: { val: string; color: string; bg: string; letter: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: bg, color, borderRadius: 5, padding: "2px 7px", fontSize: "0.78rem", fontWeight: 600 }}>
      <span style={{ fontWeight: 800 }}>{letter}</span>{val}
    </span>
  );
}

function PrintDialog({ plan, farmId, farm, onClose }: { plan: any; farmId: number | null; farm?: any; onClose: () => void }) {
  const entriesQ = useQuery({
    queryKey: ["nmp-entries-print", farmId, plan.id],
    queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans/${plan.id}/field-entries`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.entries ?? [],
  });
  const entries: any[] = entriesQ.data ?? [];
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const handlePrint = () => {
    const rows = entries.map((e: any) => `<tr>
      <td><strong>${e.fieldName || `Field #${e.fieldId}`}</strong></td>
      <td>${e.cropType || "—"}</td>
      <td>${e.nitrogenKgHa || "—"}</td>
      <td>${e.phosphorusKgHa || "—"}</td>
      <td>${e.potassiumKgHa || "—"}</td>
      <td>${e.organicManureType || "None"}</td>
      <td>${e.organicManureRate || "—"}</td>
      <td>${e.applicationMethod || "—"}</td>
      <td>${e.timingNotes || "—"}</td>
    </tr>`).join("");
    const metaBlock = [
      `<p style="font-size:7.5px;color:#374151;margin:0 0 2px"><strong>Prepared by:</strong> ${plan.preparedBy || "—"}  &nbsp;·&nbsp;  <strong>Approved by:</strong> ${plan.approvedBy || "—"}  &nbsp;·&nbsp;  <strong>Approval date:</strong> ${plan.approvedDate ? new Date(plan.approvedDate).toLocaleDateString("en-GB") : "Pending"}</p>`,
      plan.notes ? `<p style="font-size:7.5px;color:#6b7280;margin:2px 0;font-style:italic">Notes: ${plan.notes}</p>` : "",
    ].filter(Boolean).join("");
    const tableHtml = `${metaBlock}<table><thead><tr>
      <th>Field</th><th>Crop</th><th>N (kg/ha)</th><th>P (kg/ha)</th><th>K (kg/ha)</th>
      <th>Organic Manure</th><th>Rate</th><th>Method</th><th>Timing Notes</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: `Nutrient Management Plan — ${plan.planYear}`,
      subtitle: "RB209 Fertiliser Recommendations",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      redTractorId: farm?.redTractorId ?? undefined,
      recordCount: entries.length,
      recordLabel: "field entry",
      tableHtml,
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 400 }}>
        <DialogHeader><DialogTitle>Print NMP — {plan.planYear}</DialogTitle></DialogHeader>
        <p className="text-sm text-gray-600 py-2">
          {entriesQ.isLoading
            ? "Loading field entries..."
            : `${entries.length} field ${entries.length !== 1 ? "entries" : "entry"} will be included.`}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePrint} disabled={entriesQ.isLoading}>
            <Printer size={14} className="mr-1" />Print / Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
