import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import {
  Plus, Search, Loader2, Pencil, Trash2, HeartPulse, Printer,
  AlertTriangle, Clock, CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

type TabKey = "records" | "print";

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}
function formatDateLong(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return val; }
}
function addDays(dateStr: string, days: number): string {
  if (!dateStr || !days) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}
function isInWithdrawal(endDate: string | null | undefined): boolean {
  if (!endDate) return false;
  return daysUntil(endDate) !== null && daysUntil(endDate)! >= 0;
}

interface Herd { id: number; name: string; type: string; }
interface MedicineRecord {
  id: number; farmId: number; animalId: number | null; herdId: number | null;
  medicineName: string; batchNumber: string | null; dosage: string | null;
  administrationRoute: string | null; administeredBy: string | null;
  administeredDate: string; withdrawalPeriodDays: number | null;
  withdrawalEndDate: string | null; reason: string | null;
  vetName: string | null; notes: string | null; createdAt: string;
}
interface Farm { id: number; name: string; address: string | null; postcode: string | null; cphNumber: string | null; redTractorId: string | null; }

const EMPTY_FORM = {
  herdId: "", medicineName: "", batchNumber: "", dosage: "", administrationRoute: "",
  administeredBy: "", administeredDate: new Date().toISOString().slice(0, 10),
  withdrawalPeriodDays: "", reason: "", vetName: "", notes: "",
};

const ADMIN_ROUTES = ["Oral", "Subcutaneous injection", "Intramuscular injection", "Intravenous injection", "Intramammary", "Topical / Pour-on", "Intrauterine", "Ocular", "Nasal", "Other"];

function RecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MedicineRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const herdsQ = useQuery<{ records: Herd[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()),
  });
  const medicineQ = useQuery<{ records: MedicineRecord[] }>({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`).then(r => r.json()),
  });

  const herds: Herd[] = herdsQ.data?.records ?? [];
  const records: MedicineRecord[] = medicineQ.data?.records ?? [];

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/medicine-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); },
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/medicine-records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); },
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/medicine-records/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setDeleteId(null); },
  });

  const activeWithdrawals = records.filter(r => isInWithdrawal(r.withdrawalEndDate));

  const filtered = records.filter(r => !search
    || r.medicineName.toLowerCase().includes(search.toLowerCase())
    || r.vetName?.toLowerCase().includes(search.toLowerCase())
    || r.reason?.toLowerCase().includes(search.toLowerCase())
    || herds.find(h => h.id === r.herdId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const calcWithdrawalEnd = (date: string, days: string) => {
    if (!date || !days) return "";
    return addDays(date, Number(days));
  };

  function openEdit(r: MedicineRecord) {
    setEditing(r);
    setForm({
      herdId: r.herdId ? String(r.herdId) : "",
      medicineName: r.medicineName, batchNumber: r.batchNumber ?? "",
      dosage: r.dosage ?? "", administrationRoute: r.administrationRoute ?? "",
      administeredBy: r.administeredBy ?? "", administeredDate: r.administeredDate?.slice(0, 10) ?? "",
      withdrawalPeriodDays: r.withdrawalPeriodDays ? String(r.withdrawalPeriodDays) : "",
      reason: r.reason ?? "", vetName: r.vetName ?? "", notes: r.notes ?? "",
    });
    setFormOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wdDays = form.withdrawalPeriodDays ? Number(form.withdrawalPeriodDays) : null;
    const wdEnd = wdDays && form.administeredDate ? new Date(addDays(form.administeredDate, wdDays)).toISOString() : null;
    const body = {
      herdId: form.herdId ? Number(form.herdId) : null,
      medicineName: form.medicineName, batchNumber: form.batchNumber || null,
      dosage: form.dosage || null, administrationRoute: form.administrationRoute || null,
      administeredBy: form.administeredBy || null,
      administeredDate: form.administeredDate ? new Date(form.administeredDate).toISOString() : null,
      withdrawalPeriodDays: wdDays, withdrawalEndDate: wdEnd,
      reason: form.reason || null, vetName: form.vetName || null, notes: form.notes || null,
    };
    if (editing) { updateM.mutate({ id: editing.id, body }); } else { createM.mutate(body); }
  }
  const isSubmitting = createM.isPending || updateM.isPending;
  const previewWithdrawalEnd = calcWithdrawalEnd(form.administeredDate, form.withdrawalPeriodDays);

  return (
    <>
      {/* Active withdrawal alert */}
      {activeWithdrawals.length > 0 && (
        <div className="mb-6 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {activeWithdrawals.length} active withdrawal period{activeWithdrawals.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {activeWithdrawals.map(r => {
                const days = daysUntil(r.withdrawalEndDate);
                return `${r.medicineName} — ${days} day${days !== 1 ? "s" : ""} remaining (ends ${formatDate(r.withdrawalEndDate)})`;
              }).join(" · ")}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search medicine, herd, reason..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setFormOpen(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Record
        </Button>
      </div>

      {medicineQ.isLoading ? (
        <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <HeartPulse className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/80 mb-1">No medicine records</h3>
            <p className="text-foreground/50 text-sm">{search ? "No records match your search." : "Record all veterinary medicines administered to your livestock."}</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Medicine", "Herd / Group", "Date", "Dosage / Route", "Withdrawal Period", "Withdrawal Ends", "Vet", ""].map(h => (
                    <th key={h} className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const inWd = isInWithdrawal(r.withdrawalEndDate);
                  const wdDays = r.withdrawalEndDate ? daysUntil(r.withdrawalEndDate) : null;
                  const herdName = herds.find(h => h.id === r.herdId)?.name ?? (r.herdId ? `Herd #${r.herdId}` : "—");
                  return (
                    <tr key={r.id} className={`border-b border-border/50 hover:bg-black/[0.02] transition-colors ${inWd ? "bg-amber-50/40" : ""}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {inWd && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                          <span className="text-sm font-medium">{r.medicineName}</span>
                        </div>
                        {r.batchNumber && <p className="text-xs text-foreground/40 font-mono mt-0.5">Batch: {r.batchNumber}</p>}
                      </td>
                      <td className="p-4 text-sm text-foreground/70">{herdName}</td>
                      <td className="p-4 text-sm text-foreground/70 whitespace-nowrap">{formatDate(r.administeredDate)}</td>
                      <td className="p-4 text-sm text-foreground/70">
                        {r.dosage && <span>{r.dosage}</span>}
                        {r.administrationRoute && <span className="text-foreground/50"> · {r.administrationRoute}</span>}
                        {!r.dosage && !r.administrationRoute && "—"}
                      </td>
                      <td className="p-4 text-sm text-foreground/70">
                        {r.withdrawalPeriodDays ? `${r.withdrawalPeriodDays} days` : "None"}
                      </td>
                      <td className="p-4 text-sm">
                        {r.withdrawalEndDate ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-foreground/70 whitespace-nowrap">{formatDate(r.withdrawalEndDate)}</span>
                            {inWd ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200">
                                <Clock className="w-3 h-3" />{wdDays}d remaining
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                                <CheckCircle2 className="w-3 h-3" />Cleared
                              </span>
                            )}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="p-4 text-sm text-foreground/70">{r.vetName || "—"}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-primary" />
              {editing ? "Edit Medicine Record" : "Add Medicine Record"}
            </DialogTitle>
            <DialogDescription>
              Record veterinary medicines administered — required under Red Tractor Livestock Standards. Ensure withdrawal periods are observed before slaughter or milk sale.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Medicine Name <span className="text-red-500">*</span></label>
                <Input placeholder="e.g. Alamycin 300, Metacam 20mg/ml" value={form.medicineName} onChange={e => setForm(f => ({ ...f, medicineName: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Batch / Licence Number</label>
                <Input placeholder="e.g. UK/V/0083451/0001" value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Herd / Animal Group</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.herdId} onChange={e => setForm(f => ({ ...f, herdId: e.target.value }))}>
                  <option value="">Select herd (optional)...</option>
                  {herds.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Date Administered <span className="text-red-500">*</span></label>
                <Input type="date" value={form.administeredDate} onChange={e => setForm(f => ({ ...f, administeredDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Dosage</label>
                <Input placeholder="e.g. 5ml/100kg, 10ml per animal" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Administration Route</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.administrationRoute} onChange={e => setForm(f => ({ ...f, administrationRoute: e.target.value }))}>
                  <option value="">Select route...</option>
                  {ADMIN_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Administered By</label>
                <Input placeholder="Name or 'Attending vet'" value={form.administeredBy} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Prescribing Vet</label>
                <Input placeholder="Vet name / practice" value={form.vetName} onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))} />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">Withdrawal Period</p>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Withdrawal Period (days)</label>
                  <Input type="number" min="0" max="999" placeholder="e.g. 21" value={form.withdrawalPeriodDays} onChange={e => setForm(f => ({ ...f, withdrawalPeriodDays: e.target.value }))} />
                </div>
                <div className="pb-1">
                  {previewWithdrawalEnd ? (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-foreground/60 text-xs">Withdrawal ends</p>
                        <p className="font-semibold text-amber-700">{formatDate(previewWithdrawalEnd)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/40 italic">Withdrawal end date calculated automatically</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Reason for Treatment</label>
              <Input placeholder="e.g. Respiratory infection, Mastitis treatment, Preventive" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
              <Input placeholder="Additional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); setForm(EMPTY_FORM); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? "Update Record" : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Medicine Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteM.mutate(deleteId)} disabled={deleteM.isPending}>
              {deleteM.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PrintTab({ farmId }: { farmId: number }) {
  const medicineQ = useQuery<{ records: MedicineRecord[] }>({ queryKey: ["medicine-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`).then(r => r.json()) });
  const herdsQ = useQuery<{ records: Herd[] }>({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()) });
  const farmQ = useQuery<{ record: Farm }>({ queryKey: ["farm", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()) });

  const records: MedicineRecord[] = medicineQ.data?.records ?? [];
  const herds: Herd[] = herdsQ.data?.records ?? [];
  const farm = farmQ.data?.record;
  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <style>{`@media print { .no-print { display: none !important; } body { font-size: 11px; } }`}</style>
      <div className="no-print flex justify-end mb-6">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" /> Print / Export PDF
        </Button>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #16a34a", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>{farm?.name ?? "Farm"}</p>
            {farm?.address && <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 0" }}>{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
            {farm?.cphNumber && <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "1px 0 0" }}>CPH: {farm.cphNumber}</p>}
          </div>
          <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#6b7280" }}>
            <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111", margin: 0 }}>Medicine Register</p>
            <p style={{ margin: "2px 0 0" }}>Printed: {printedDate}</p>
          </div>
        </div>

        {records.length === 0 ? (
          <p style={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", padding: "2rem 0" }}>No medicine records to display.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr style={{ background: "#f0fdf4" }}>
                {["Medicine", "Herd / Group", "Date Admin.", "Dosage", "Route", "Batch No.", "Withdrawal Period", "Withdrawal Ends", "Vet / Auth.", "Reason"].map(h => (
                  <th key={h} style={{ border: "1px solid #e5e7eb", padding: "5px 8px", textAlign: "left", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", fontSize: "0.65rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const herdName = herds.find(h => h.id === r.herdId)?.name ?? "—";
                const inWd = isInWithdrawal(r.withdrawalEndDate);
                return (
                  <tr key={r.id} style={{ background: inWd ? "#fffbeb" : i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px", fontWeight: 600 }}>{r.medicineName}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px" }}>{herdName}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px", whiteSpace: "nowrap" }}>{formatDateLong(r.administeredDate)}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px" }}>{r.dosage ?? "—"}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px" }}>{r.administrationRoute ?? "—"}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px", fontFamily: "monospace" }}>{r.batchNumber ?? "—"}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px" }}>{r.withdrawalPeriodDays ? `${r.withdrawalPeriodDays} days` : "None"}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px", whiteSpace: "nowrap", color: inWd ? "#b45309" : "#374151", fontWeight: inWd ? 700 : 400 }}>
                      {r.withdrawalEndDate ? formatDateLong(r.withdrawalEndDate) : "—"}
                      {inWd && " ⚠"}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px" }}>{r.vetName ?? "—"}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px" }}>{r.reason ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "1.5rem", display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#9ca3af" }}>
          <span style={{ fontStyle: "italic" }}>Medicine register required by Red Tractor Livestock Standards. Retain for minimum 5 years. Withdrawal periods must be observed before slaughter, milk sale or egg collection.</span>
          <span>BDE Farm Trac · {printedDate}</span>
        </div>
      </div>
    </div>
  );
}

export default function MedicinePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<TabKey>("records");
  if (!farmId) return <Redirect href="/select" />;
  return (
    <AppLayout title="Medicine Records">
      <TabBar className="mb-6">
        <TabButton active={tab === "records"} onClick={() => setTab("records")}>Records</TabButton>
        <TabButton active={tab === "print"} onClick={() => setTab("print")}>Print / Export</TabButton>
      </TabBar>
      {tab === "records" && <RecordsTab farmId={farmId} />}
      {tab === "print" && <PrintTab farmId={farmId} />}
    </AppLayout>
  );
}
