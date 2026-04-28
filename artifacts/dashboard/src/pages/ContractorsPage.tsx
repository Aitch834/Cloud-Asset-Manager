import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Redirect } from "wouter";
import { Plus, Printer, AlertTriangle, Loader2, Eye, Pencil, Trash2, CheckCircle2, XCircle, ShieldCheck, FileText } from "lucide-react";
import { printProReport } from "@/lib/print-report";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

interface Contractor {
  id: number;
  farmId: number;
  companyName: string;
  contactName: string | null;
  tradeType: string;
  phone: string | null;
  email: string | null;
  pliNumber: string | null;
  pliInsurer: string | null;
  pliCoverAmountGbp: string | null;
  pliExpiryDate: string | null;
  pliDocumentUrl: string | null;
  pliDocumentName: string | null;
  ramsReceived: boolean;
  ramsReceivedDate: string | null;
  ramsReviewedBy: string | null;
  ramsDocumentUrl: string | null;
  ramsDocumentName: string | null;
  lastOnSiteDate: string | null;
  notes: string | null;
  isActive: boolean;
}

const EMPTY: Omit<Contractor, "id" | "farmId"> = {
  companyName: "", contactName: null, tradeType: "general", phone: null, email: null,
  pliNumber: null, pliInsurer: null, pliCoverAmountGbp: null, pliExpiryDate: null,
  pliDocumentUrl: null, pliDocumentName: null, ramsReceived: false, ramsReceivedDate: null,
  ramsReviewedBy: null, ramsDocumentUrl: null, ramsDocumentName: null,
  lastOnSiteDate: null, notes: null, isActive: true,
};

const TRADE_TYPES: Record<string, string> = {
  "general": "General Building / Maintenance",
  "electrical": "Electrical",
  "plumbing": "Plumbing / Heating",
  "roofing": "Roofing",
  "groundworks": "Groundworks / Drainage",
  "agri-contractor": "Agricultural Contractor",
  "machinery-dealer": "Machinery Dealer / Engineer",
  "haulier": "Haulage / Transport",
  "pest-control": "Pest Control",
  "tree-surgeon": "Tree Surgeon / Arborist",
  "cleaning": "Cleaning / Hygiene",
  "security": "Security / CCTV",
  "it-telecoms": "IT / Telecoms",
  "fuel-delivery": "Fuel / LPG Delivery",
  "waste-removal": "Waste Removal",
  "other": "Other",
};

function isPliExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 60;
}

function isPliExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function ContractorsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();

  if (!farmId) return <Redirect href="/select" />;

  const base = `/api/farms/${farmId}/contractors`;

  const { data, isLoading } = useQuery<{ contractors: Contractor[] }>({
    queryKey: ["contractors-hs", farmId],
    queryFn: () => fetch(`${base}?showInactive=false`).then(r => r.json()),
  });
  const [showInactive, setShowInactive] = useState(false);
  const { data: allData } = useQuery<{ contractors: Contractor[] }>({
    queryKey: ["contractors-hs-all", farmId],
    queryFn: () => fetch(`${base}?showInactive=true`).then(r => r.json()),
    enabled: showInactive,
  });

  const contractors: Contractor[] = (showInactive ? allData?.contractors : data?.contractors) ?? [];

  const [viewItem, setViewItem] = useState<Contractor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contractor | null>(null);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const createMut = useMutation({
    mutationFn: (b: typeof EMPTY) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }); qc.invalidateQueries({ queryKey: ["contractors-hs-all", farmId] }); setShowForm(false); setForm({ ...EMPTY }); },
  });
  const updateMut = useMutation({
    mutationFn: (b: typeof EMPTY & { id: number }) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }); qc.invalidateQueries({ queryKey: ["contractors-hs-all", farmId] }); setShowForm(false); setEditing(null); },
  });
  const deactivateMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }); qc.invalidateQueries({ queryKey: ["contractors-hs-all", farmId] }); setDeleteId(null); },
  });

  function openEdit(c: Contractor) {
    setEditing(c);
    setForm({ companyName: c.companyName, contactName: c.contactName ?? null, tradeType: c.tradeType, phone: c.phone ?? null, email: c.email ?? null, pliNumber: c.pliNumber ?? null, pliInsurer: c.pliInsurer ?? null, pliCoverAmountGbp: c.pliCoverAmountGbp ?? null, pliExpiryDate: c.pliExpiryDate ?? null, pliDocumentUrl: c.pliDocumentUrl ?? null, pliDocumentName: c.pliDocumentName ?? null, ramsReceived: c.ramsReceived, ramsReceivedDate: c.ramsReceivedDate ?? null, ramsReviewedBy: c.ramsReviewedBy ?? null, ramsDocumentUrl: c.ramsDocumentUrl ?? null, ramsDocumentName: c.ramsDocumentName ?? null, lastOnSiteDate: c.lastOnSiteDate ?? null, notes: c.notes ?? null, isActive: c.isActive });
    setShowForm(true);
  }

  const filtered = contractors.filter(c => !search || c.companyName.toLowerCase().includes(search.toLowerCase()) || (TRADE_TYPES[c.tradeType] ?? c.tradeType).toLowerCase().includes(search.toLowerCase()));

  function printReport() {
    const rows = filtered.map(c => `<tr><td>${c.companyName}</td><td>${TRADE_TYPES[c.tradeType] ?? c.tradeType}</td><td>${c.contactName ?? "—"}</td><td>${c.pliNumber ?? "—"}</td><td>${c.pliInsurer ?? "—"}</td><td>${fmt(c.pliExpiryDate)}</td><td>${c.ramsReceived ? "Yes" : "No"}</td><td>${fmt(c.lastOnSiteDate)}</td></tr>`).join("");
    printProReport({
      title: "Contractor H&S File",
      subtitle: `${filtered.length} contractors on record — Public Liability Insurance & RAMS register`,
      tableHtml: `<table><thead><tr><th>Company</th><th>Trade</th><th>Contact</th><th>PLI Number</th><th>Insurer</th><th>PLI Expiry</th><th>RAMS Received</th><th>Last On-Site</th></tr></thead><tbody>${rows}</tbody></table>`,
    });
  }

  const pliIssues = contractors.filter(c => c.isActive && (isPliExpired(c.pliExpiryDate) || isPliExpiringSoon(c.pliExpiryDate) || !c.pliNumber));
  const ramsIssues = contractors.filter(c => c.isActive && !c.ramsReceived);

  return (
    <AppLayout title="Contractors H&S File">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">Public liability insurance certificates and RAMS (Risk Assessments &amp; Method Statements) for all contractors working on the farm. Required under Red Tractor and Health &amp; Safety at Work Act 1974.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-3.5 w-3.5 mr-1" />Print Register</Button>
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />Add Contractor</Button>
        </div>
      </div>

      {(pliIssues.length > 0 || ramsIssues.length > 0) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <strong>Action required:</strong>
          {pliIssues.length > 0 && <span> {pliIssues.length} contractor{pliIssues.length > 1 ? "s" : ""} with missing, expired, or expiring PLI.</span>}
          {ramsIssues.length > 0 && <span> {ramsIssues.length} contractor{ramsIssues.length > 1 ? "s" : ""} without RAMS on file.</span>}
        </div>
      )}

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company or trade…" className="max-w-xs" />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="h-4 w-4" />
          Show inactive contractors
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-gray-700 mb-1">No contractors{search ? " matching search" : " added yet"}</p>
          <p className="text-sm text-muted-foreground">Add contractors working on the farm to maintain your H&amp;S file.</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trade</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">PLI No.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">PLI Expiry</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">RAMS</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last On-Site</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(c => {
                const pliExpired = isPliExpired(c.pliExpiryDate);
                const pliSoon = !pliExpired && isPliExpiringSoon(c.pliExpiryDate);
                return (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.companyName}</div>
                      {c.contactName && <div className="text-xs text-muted-foreground">{c.contactName}</div>}
                      {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{TRADE_TYPES[c.tradeType] ?? c.tradeType}</td>
                    <td className="px-4 py-3">
                      {c.pliNumber ? (
                        <span className="font-mono text-xs font-semibold text-primary">{c.pliNumber}</span>
                      ) : (
                        <span className="text-xs text-red-600 font-semibold">Not recorded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {c.pliExpiryDate ? (
                        <span className={pliExpired ? "text-red-600 font-semibold" : pliSoon ? "text-amber-600 font-semibold" : ""}>
                          {fmt(c.pliExpiryDate)}{pliExpired ? " ⚠ EXPIRED" : pliSoon ? " ⚠ Expiring soon" : ""}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.ramsReceived ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold"><CheckCircle2 className="h-3 w-3" />Received {fmt(c.ramsReceivedDate)}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold"><XCircle className="h-3 w-3" />Not received</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{fmt(c.lastOnSiteDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setViewItem(c)} title="View"><Eye className="h-3 w-3 text-blue-500" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewItem.companyName}</DialogTitle>
              <DialogDescription>{TRADE_TYPES[viewItem.tradeType] ?? viewItem.tradeType}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Contact Name</p><p className="font-medium">{viewItem.contactName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p><p className="font-medium">{viewItem.phone ?? "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p><p className="font-medium">{viewItem.email ?? "—"}</p></div>
              <div className="col-span-2 border-t pt-3"><p className="text-xs font-semibold text-gray-500 uppercase mb-2">Public Liability Insurance</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PLI Policy Number</p><p className="font-medium font-mono">{viewItem.pliNumber ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Insurer</p><p className="font-medium">{viewItem.pliInsurer ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cover Amount</p><p className="font-medium">{viewItem.pliCoverAmountGbp ? `£${Number(viewItem.pliCoverAmountGbp).toLocaleString()}` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PLI Expiry</p><p className={`font-medium ${isPliExpired(viewItem.pliExpiryDate) ? "text-red-600" : isPliExpiringSoon(viewItem.pliExpiryDate) ? "text-amber-600" : ""}`}>{fmt(viewItem.pliExpiryDate)}</p></div>
              {viewItem.pliDocumentName && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">PLI Certificate</p><a href={viewItem.pliDocumentUrl ?? "#"} target="_blank" rel="noreferrer" className="text-primary text-xs underline">{viewItem.pliDocumentName}</a></div>}
              <div className="col-span-2 border-t pt-3"><p className="text-xs font-semibold text-gray-500 uppercase mb-2">RAMS (Risk Assessment & Method Statement)</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">RAMS Status</p><p className={`font-semibold ${viewItem.ramsReceived ? "text-green-700" : "text-red-600"}`}>{viewItem.ramsReceived ? "Received" : "Not Received"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">RAMS Received Date</p><p className="font-medium">{fmt(viewItem.ramsReceivedDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reviewed By</p><p className="font-medium">{viewItem.ramsReviewedBy ?? "—"}</p></div>
              {viewItem.ramsDocumentName && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">RAMS Document</p><a href={viewItem.ramsDocumentUrl ?? "#"} target="_blank" rel="noreferrer" className="text-primary text-xs underline">{viewItem.ramsDocumentName}</a></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Last On-Site</p><p className="font-medium">{fmt(viewItem.lastOnSiteDate)}</p></div>
              {viewItem.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="whitespace-pre-line">{viewItem.notes}</p></div>}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { openEdit(viewItem); setViewItem(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Contractor" : "Add Contractor to H&S File"}</DialogTitle>
              <DialogDescription>Record PLI certificate and RAMS details for this contractor.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2"><Label>Company Name *</Label><Input value={form.companyName} onChange={e => setF("companyName", e.target.value)} placeholder="e.g. Smith Electrical Services Ltd" /></div>
              <div><Label>Contact Name</Label><Input value={form.contactName ?? ""} onChange={e => setF("contactName", e.target.value || null)} /></div>
              <div><Label>Trade Type *</Label>
                <Select value={form.tradeType} onValueChange={v => setF("tradeType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRADE_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Phone</Label><Input type="tel" value={form.phone ?? ""} onChange={e => setF("phone", e.target.value || null)} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={e => setF("email", e.target.value || null)} /></div>

              <div className="col-span-2 border-t pt-4"><p className="text-xs font-semibold text-gray-500 uppercase mb-3">Public Liability Insurance</p></div>
              <div><Label>PLI Policy Number</Label><Input value={form.pliNumber ?? ""} onChange={e => setF("pliNumber", e.target.value || null)} className="font-mono" placeholder="e.g. PLI-12345678" /></div>
              <div><Label>Insurer</Label><Input value={form.pliInsurer ?? ""} onChange={e => setF("pliInsurer", e.target.value || null)} /></div>
              <div><Label>Cover Amount (£)</Label><Input type="number" min={0} value={form.pliCoverAmountGbp ?? ""} onChange={e => setF("pliCoverAmountGbp", e.target.value || null)} placeholder="e.g. 5000000" /></div>
              <div><Label>PLI Expiry Date</Label><Input type="date" value={form.pliExpiryDate ?? ""} onChange={e => setF("pliExpiryDate", e.target.value || null)} /></div>
              <div><Label>PLI Certificate Name</Label><Input value={form.pliDocumentName ?? ""} onChange={e => setF("pliDocumentName", e.target.value || null)} placeholder="e.g. PLI Certificate 2025.pdf" /></div>
              <div><Label>PLI Certificate URL</Label><Input value={form.pliDocumentUrl ?? ""} onChange={e => setF("pliDocumentUrl", e.target.value || null)} placeholder="https://…" /></div>

              <div className="col-span-2 border-t pt-4"><p className="text-xs font-semibold text-gray-500 uppercase mb-3">RAMS (Risk Assessment &amp; Method Statement)</p></div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="ramsReceived" checked={form.ramsReceived} onChange={e => setF("ramsReceived", e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="ramsReceived">RAMS received and on file</Label>
              </div>
              {form.ramsReceived && <>
                <div><Label>RAMS Received Date</Label><Input type="date" value={form.ramsReceivedDate ?? ""} onChange={e => setF("ramsReceivedDate", e.target.value || null)} /></div>
                <div><Label>Reviewed By</Label><Input value={form.ramsReviewedBy ?? ""} onChange={e => setF("ramsReviewedBy", e.target.value || null)} /></div>
                <div><Label>RAMS Document Name</Label><Input value={form.ramsDocumentName ?? ""} onChange={e => setF("ramsDocumentName", e.target.value || null)} /></div>
                <div><Label>RAMS Document URL</Label><Input value={form.ramsDocumentUrl ?? ""} onChange={e => setF("ramsDocumentUrl", e.target.value || null)} placeholder="https://…" /></div>
              </>}

              <div><Label>Last On-Site Date</Label><Input type="date" value={form.lastOnSiteDate ?? ""} onChange={e => setF("lastOnSiteDate", e.target.value || null)} /></div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="contractorActive" checked={form.isActive} onChange={e => setF("isActive", e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="contractorActive">Active contractor</Label>
              </div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={2} /></div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)} disabled={!form.companyName || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editing ? "Update" : "Add Contractor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Deactivate Contractor?</DialogTitle><DialogDescription>The contractor will be marked as inactive and hidden from the main list. This does not delete any records.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deactivateMut.mutate(deleteId!)} disabled={deactivateMut.isPending}>
                {deactivateMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Deactivate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
