// @ts-nocheck
import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Eye, Leaf, Award, Map, Package, FileQuestion } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";

const api = (path: string) => `/api/${path}`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CERTIFYING_BODIES = ["Soil Association", "OF&G (Organic Farmers & Growers)", "Biodynamic Association", "OF&G Scotland", "Other"];
const CERT_TYPES = ["Venison / Deer Park", "Full Holding — All Products", "Specific Enterprise Only", "In-Conversion Certificate"];
const CERT_STATUSES = ["active", "pending", "suspended", "withdrawn", "expired"];
const CONVERSION_STATUSES = ["pre-conversion", "year-1-in-conversion", "year-2-in-conversion", "certified organic", "suspended", "withdrawn"];
const PRODUCT_TYPES = ["Mineral supplement", "Salt lick", "Hay / forage", "Concentrate feed", "Organic concentrate", "Drench / liquid supplement", "Other"];
const ORGANIC_APPROVAL_STATUSES = ["Certified organic", "Approved for organic use (non-organic ingredient)", "Derogation required", "Not permitted"];
const DEROGATION_STATUSES = ["pending", "approved", "refused", "withdrawn", "expired"];

// ─── SHARED UI HELPERS ────────────────────────────────────────────────────────
function TabBar({ children }: { children: ReactNode }) {
  return <div className="flex gap-1 flex-wrap border-b border-border mb-4 pb-2">{children}</div>;
}
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
      {children}
    </button>
  );
}
function SectionHeader({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button size="sm" onClick={onAdd}><Plus className="w-4 h-4 mr-1" />{addLabel}</Button>
    </div>
  );
}
function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground text-sm">
      <Icon className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
const fmt = (val: unknown) => (val == null || val === "" ? "—" : String(val));
const fmtDate = (val: unknown) => {
  if (!val) return "—";
  try { return new Date(String(val)).toLocaleDateString("en-GB"); } catch { return String(val); }
};
function FieldView({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}
function statusColor(s: string) {
  if (s === "active" || s === "certified organic" || s === "approved") return "bg-green-100 text-green-800 border-green-200";
  if (s === "pending" || s.includes("in-conversion")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (s === "refused" || s === "withdrawn" || s === "suspended" || s === "expired") return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

// ─── CERTIFICATION TAB ────────────────────────────────────────────────────────
function CertificationTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["org-venison-cert", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/certification`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/organic-venison/certification${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-cert", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-venison/certification/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-cert", farmId] }); toast({ title: "Deleted" }); },
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { status: "active", certificateType: "Venison / Deer Park" } : row);
  };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const active = records.filter((r: any) => r.status === "active").length;

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <Leaf className="inline w-4 h-4 mr-1" />
        <strong>Organic Venison Certification</strong> — Record your certifying body details, certificate numbers, and renewal dates. Farmed deer enterprises can be certified organic by Soil Association, OF&G, or other approved bodies under UK Organic Regulations (retained from EC No. 834/2007). Wild venison cannot hold organic status.
      </div>
      {active > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {records.filter((r: any) => r.status === "active").map((r: any) => (
            <div key={r.id} className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{fmt(r.certifyingBody)}</p>
                  <p className="text-xs text-muted-foreground">{fmt(r.certificateType)}</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                <div><span className="font-medium">Cert. No.:</span> {fmt(r.certificateNumber)}</div>
                <div><span className="font-medium">Expires:</span> {fmtDate(r.expiryDate)}</div>
                {r.scope && <div className="col-span-2"><span className="font-medium">Scope:</span> {r.scope}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <SectionHeader title="Certificate Register" onAdd={() => open("add")} addLabel="Add Certificate" />
      {records.length === 0 ? (
        <EmptyState icon={Award} message="No organic certificates recorded yet. Add your first certifying body record above." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Certifying Body", "Certificate Type", "Cert. No.", "Issue Date", "Expiry Date", "Scope", "Status", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 font-medium">{fmt(r.certifyingBody)}</td>
                  <td className="py-2 px-3 text-xs">{fmt(r.certificateType)}</td>
                  <td className="py-2 px-3">{fmt(r.certificateNumber)}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.issueDate)}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.expiryDate)}</td>
                  <td className="py-2 px-3 text-xs max-w-[160px] truncate">{fmt(r.scope)}</td>
                  <td className="py-2 px-3"><Badge variant="outline" className={`text-xs ${statusColor(r.status || "")}`}>{fmt(r.status)}</Badge></td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("view", r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("edit", r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => mutDel.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={dlg.open} onOpenChange={o => !o && setDlg({ open: false, mode: "add", row: {} })}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Organic Certificate" : dlg.mode === "edit" ? "Edit Certificate" : "Add Certificate"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <FieldView label="Certifying Body" value={fmt(dlg.row.certifyingBody)} />
              <FieldView label="Certificate Type" value={fmt(dlg.row.certificateType)} />
              <FieldView label="Certificate Number" value={fmt(dlg.row.certificateNumber)} />
              <FieldView label="Status" value={fmt(dlg.row.status)} />
              <FieldView label="Issue Date" value={fmtDate(dlg.row.issueDate)} />
              <FieldView label="Expiry Date" value={fmtDate(dlg.row.expiryDate)} />
              {dlg.row.scope && <div className="col-span-2"><FieldView label="Scope" value={fmt(dlg.row.scope)} /></div>}
              {dlg.row.notes && <div className="col-span-2"><FieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Certifying Body *</Label>
                <Select value={String(form.certifyingBody || "")} onValueChange={v => sf("certifyingBody", v)}>
                  <SelectTrigger><SelectValue placeholder="Select certifying body" /></SelectTrigger>
                  <SelectContent>{CERTIFYING_BODIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Certificate Type</Label>
                <Select value={String(form.certificateType || "Venison / Deer Park")} onValueChange={v => sf("certificateType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CERT_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={String(form.status || "active")} onValueChange={v => sf("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CERT_STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Certificate Number</Label><Input placeholder="SA / OF&G certificate number" value={String(form.certificateNumber || "")} onChange={e => sf("certificateNumber", e.target.value)} /></div>
              <div><Label>Issue Date</Label><Input type="date" value={String(form.issueDate || "")} onChange={e => sf("issueDate", e.target.value)} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={String(form.expiryDate || "")} onChange={e => sf("expiryDate", e.target.value)} /></div>
              <div className="col-span-2"><Label>Scope</Label><Input placeholder="e.g. Farmed red and fallow deer for venison, Deer Park compartments A–D" value={String(form.scope || "")} onChange={e => sf("scope", e.target.value)} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })} disabled={mutSave.isPending || !form.certifyingBody}>
                {mutSave.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : null}
                {dlg.mode === "edit" ? "Update" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── LAND REGISTER TAB ────────────────────────────────────────────────────────
function LandRegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["org-venison-land", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/land-register`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/organic-venison/land-register${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-land", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-venison/land-register/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-land", farmId] }); toast({ title: "Deleted" }); },
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { conversionStatus: "pre-conversion" } : row);
  };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const totalArea = records.reduce((s: number, r: any) => s + (Number(r.areaHa) || 0), 0);
  const certifiedArea = records.filter((r: any) => r.conversionStatus === "certified organic").reduce((s: number, r: any) => s + (Number(r.areaHa) || 0), 0);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-green-800">{records.length}</p>
            <p className="text-xs text-green-700 mt-0.5">Compartments</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-blue-800">{totalArea.toFixed(1)} ha</p>
            <p className="text-xs text-blue-700 mt-0.5">Total Area</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-amber-800">{certifiedArea.toFixed(1)} ha</p>
            <p className="text-xs text-amber-700 mt-0.5">Certified Organic</p>
          </div>
        </div>
      )}
      <SectionHeader title="Deer Grazing Compartment Register" onAdd={() => open("add")} addLabel="Add Compartment" />
      {records.length === 0 ? (
        <EmptyState icon={Map} message="No compartments registered yet. Add your first grazing compartment or deer park block above." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Compartment Name", "Area (ha)", "Conversion Status", "Conversion Start", "Certified Organic Date", "Certifying Body", "Cert. Reference", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 font-medium">{fmt(r.compartmentName)}</td>
                  <td className="py-2 px-3">{r.areaHa ? `${r.areaHa} ha` : "—"}</td>
                  <td className="py-2 px-3"><Badge variant="outline" className={`text-xs ${statusColor(r.conversionStatus || "")}`}>{fmt(r.conversionStatus)}</Badge></td>
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.conversionStartDate)}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.certifiedOrganicDate)}</td>
                  <td className="py-2 px-3 text-xs">{fmt(r.certifyingBody)}</td>
                  <td className="py-2 px-3 text-xs">{fmt(r.certifierReference)}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("view", r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("edit", r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => mutDel.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={dlg.open} onOpenChange={o => !o && setDlg({ open: false, mode: "add", row: {} })}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Compartment" : dlg.mode === "edit" ? "Edit Compartment" : "Add Compartment"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <FieldView label="Compartment Name" value={fmt(dlg.row.compartmentName)} />
              <FieldView label="Area (ha)" value={dlg.row.areaHa ? `${dlg.row.areaHa} ha` : "—"} />
              <FieldView label="Conversion Status" value={fmt(dlg.row.conversionStatus)} />
              <FieldView label="Conversion Start Date" value={fmtDate(dlg.row.conversionStartDate)} />
              <FieldView label="Certified Organic Date" value={fmtDate(dlg.row.certifiedOrganicDate)} />
              <FieldView label="Certifying Body" value={fmt(dlg.row.certifyingBody)} />
              <FieldView label="Certifier Reference" value={fmt(dlg.row.certifierReference)} />
              <FieldView label="Previous Land Use" value={fmt(dlg.row.previousLandUse)} />
              {dlg.row.notes && <div className="col-span-2"><FieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2"><Label>Compartment Name *</Label><Input placeholder="e.g. North Deer Park, Block A" value={String(form.compartmentName || "")} onChange={e => sf("compartmentName", e.target.value)} /></div>
              <div><Label>Area (ha)</Label><Input type="number" step="0.01" placeholder="0.00" value={String(form.areaHa || "")} onChange={e => sf("areaHa", e.target.value)} /></div>
              <div>
                <Label>Conversion Status</Label>
                <Select value={String(form.conversionStatus || "pre-conversion")} onValueChange={v => sf("conversionStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONVERSION_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Conversion Start Date</Label><Input type="date" value={String(form.conversionStartDate || "")} onChange={e => sf("conversionStartDate", e.target.value)} /></div>
              <div><Label>Certified Organic Date</Label><Input type="date" value={String(form.certifiedOrganicDate || "")} onChange={e => sf("certifiedOrganicDate", e.target.value)} /></div>
              <div>
                <Label>Certifying Body</Label>
                <Select value={String(form.certifyingBody || "")} onValueChange={v => sf("certifyingBody", v)}>
                  <SelectTrigger><SelectValue placeholder="Select body" /></SelectTrigger>
                  <SelectContent>{CERTIFYING_BODIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Certifier Reference</Label><Input placeholder="Parcel / compartment ref" value={String(form.certifierReference || "")} onChange={e => sf("certifierReference", e.target.value)} /></div>
              <div className="col-span-2"><Label>Previous Land Use</Label><Input placeholder="e.g. Conventional arable, improved pasture" value={String(form.previousLandUse || "")} onChange={e => sf("previousLandUse", e.target.value)} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })} disabled={mutSave.isPending || !form.compartmentName}>
                {mutSave.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : null}
                {dlg.mode === "edit" ? "Update" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FEED & SUPPLEMENTS TAB ───────────────────────────────────────────────────
function FeedSupplementsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["org-venison-feed", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/feed-supplements`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/organic-venison/feed-supplements${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-feed", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-venison/feed-supplements/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-feed", farmId] }); toast({ title: "Deleted" }); },
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { organicApprovalStatus: "Certified organic" } : row);
  };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const derogationRequired = records.filter((r: any) => r.organicApprovalStatus === "Derogation required").length;

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      {derogationRequired > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>{derogationRequired}</strong> feed or supplement record{derogationRequired > 1 ? "s" : ""} marked as requiring a derogation. Raise a formal derogation request in the Derogations tab.
        </div>
      )}
      <SectionHeader title="Feed & Supplement Records" onAdd={() => open("add")} addLabel="Add Record" />
      {records.length === 0 ? (
        <EmptyState icon={Package} message="No feed or supplement records yet. Log all supplementary feed inputs including mineral licks and concentrates." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Date", "Product Name", "Type", "Organic Approval Status", "Certifier Approval Ref", "Qty (kg)", "Area / Herd", "Supplier", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.applicationDate)}</td>
                  <td className="py-2 px-3 font-medium">{fmt(r.productName)}</td>
                  <td className="py-2 px-3 text-xs">{fmt(r.productType)}</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className={`text-xs ${statusColor(r.organicApprovalStatus || "")}`}>
                      {fmt(r.organicApprovalStatus)}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-xs">{fmt(r.certifierApprovalReference)}</td>
                  <td className="py-2 px-3">{r.quantityKg ? `${r.quantityKg} kg` : "—"}</td>
                  <td className="py-2 px-3">{fmt(r.areaOrHerd)}</td>
                  <td className="py-2 px-3">{fmt(r.supplierName)}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("view", r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("edit", r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => mutDel.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={dlg.open} onOpenChange={o => !o && setDlg({ open: false, mode: "add", row: {} })}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Feed / Supplement Record" : dlg.mode === "edit" ? "Edit Record" : "Add Feed / Supplement"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <FieldView label="Application Date" value={fmtDate(dlg.row.applicationDate)} />
              <FieldView label="Product Name" value={fmt(dlg.row.productName)} />
              <FieldView label="Product Type" value={fmt(dlg.row.productType)} />
              <FieldView label="Organic Approval Status" value={fmt(dlg.row.organicApprovalStatus)} />
              <FieldView label="Certifier Approval Reference" value={fmt(dlg.row.certifierApprovalReference)} />
              <FieldView label="Quantity (kg)" value={dlg.row.quantityKg ? `${dlg.row.quantityKg} kg` : "—"} />
              <FieldView label="Area / Herd" value={fmt(dlg.row.areaOrHerd)} />
              <FieldView label="Supplier" value={fmt(dlg.row.supplierName)} />
              {dlg.row.notes && <div className="col-span-2"><FieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div><Label>Application Date *</Label><Input type="date" value={String(form.applicationDate || "")} onChange={e => sf("applicationDate", e.target.value)} /></div>
              <div><Label>Product Name *</Label><Input placeholder="Product name" value={String(form.productName || "")} onChange={e => sf("productName", e.target.value)} /></div>
              <div>
                <Label>Product Type</Label>
                <Select value={String(form.productType || "")} onValueChange={v => sf("productType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{PRODUCT_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Organic Approval Status *</Label>
                <Select value={String(form.organicApprovalStatus || "Certified organic")} onValueChange={v => sf("organicApprovalStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORGANIC_APPROVAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Certifier Approval Reference</Label><Input placeholder="Approval reference number" value={String(form.certifierApprovalReference || "")} onChange={e => sf("certifierApprovalReference", e.target.value)} /></div>
              <div><Label>Quantity (kg)</Label><Input type="number" step="0.1" placeholder="0.0" value={String(form.quantityKg || "")} onChange={e => sf("quantityKg", e.target.value)} /></div>
              <div><Label>Area / Herd</Label><Input placeholder="e.g. North Deer Park, full herd" value={String(form.areaOrHerd || "")} onChange={e => sf("areaOrHerd", e.target.value)} /></div>
              <div><Label>Supplier Name</Label><Input placeholder="Supplier" value={String(form.supplierName || "")} onChange={e => sf("supplierName", e.target.value)} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })} disabled={mutSave.isPending || !form.applicationDate || !form.productName}>
                {mutSave.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : null}
                {dlg.mode === "edit" ? "Update" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DEROGATIONS TAB ──────────────────────────────────────────────────────────
function DerogationsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["org-venison-derog", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/organic-venison/derogations${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-venison/derogations/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] }); toast({ title: "Deleted" }); },
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { status: "pending" } : row);
  };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        <FileQuestion className="inline w-4 h-4 mr-1" />
        <strong>Derogation Case Register</strong> — Record all requests to use non-organic inputs or practices where no organic alternative is available. Derogations must be applied for before the input is used and approved in writing by your certifying body. Each approved derogation has a defined scope and expiry date.
      </div>
      <SectionHeader title="Input Derogation Cases" onAdd={() => open("add")} addLabel="New Derogation" />
      {records.length === 0 ? (
        <EmptyState icon={FileQuestion} message="No derogation cases recorded yet. Add a case if you need to use an input that is not certified organic." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Case Ref", "Input Name", "Input Type", "Certifying Body", "Application Date", "Status", "Decision Date", "Expiry Date", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 font-mono text-xs">{fmt(r.caseReference)}</td>
                  <td className="py-2 px-3 font-medium">{fmt(r.inputName)}</td>
                  <td className="py-2 px-3 text-xs">{fmt(r.inputType)}</td>
                  <td className="py-2 px-3 text-xs">{fmt(r.certifyingBody)}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.applicationDate)}</td>
                  <td className="py-2 px-3"><Badge variant="outline" className={`text-xs ${statusColor(r.status || "")}`}>{fmt(r.status)}</Badge></td>
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.decisionDate)}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.expiryDate)}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("view", r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("edit", r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => mutDel.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={dlg.open} onOpenChange={o => !o && setDlg({ open: false, mode: "add", row: {} })}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Derogation Case" : dlg.mode === "edit" ? "Edit Derogation" : "New Derogation Case"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <FieldView label="Case Reference" value={fmt(dlg.row.caseReference)} />
              <FieldView label="Status" value={fmt(dlg.row.status)} />
              <FieldView label="Input Name" value={fmt(dlg.row.inputName)} />
              <FieldView label="Input Type" value={fmt(dlg.row.inputType)} />
              <FieldView label="Regulatory Basis" value={fmt(dlg.row.regulatoryBasis)} />
              <FieldView label="Certifying Body" value={fmt(dlg.row.certifyingBody)} />
              <FieldView label="Application Date" value={fmtDate(dlg.row.applicationDate)} />
              <FieldView label="Decision Date" value={fmtDate(dlg.row.decisionDate)} />
              <FieldView label="Expiry Date" value={fmtDate(dlg.row.expiryDate)} />
              {dlg.row.justification && <div className="col-span-2"><FieldView label="Justification" value={fmt(dlg.row.justification)} /></div>}
              {dlg.row.approvalConditions && <div className="col-span-2"><FieldView label="Approval Conditions" value={fmt(dlg.row.approvalConditions)} /></div>}
              {dlg.row.notes && <div className="col-span-2"><FieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div><Label>Case Reference</Label><Input placeholder="e.g. DERG-2025-001" value={String(form.caseReference || "")} onChange={e => sf("caseReference", e.target.value)} /></div>
              <div>
                <Label>Status</Label>
                <Select value={String(form.status || "pending")} onValueChange={v => sf("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DEROGATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Input Name *</Label><Input placeholder="Name of input / treatment" value={String(form.inputName || "")} onChange={e => sf("inputName", e.target.value)} /></div>
              <div><Label>Input Type</Label><Input placeholder="e.g. Antibiotic, mineral supplement" value={String(form.inputType || "")} onChange={e => sf("inputType", e.target.value)} /></div>
              <div><Label>Regulatory Basis</Label><Input placeholder="e.g. UK Organic Reg Art. 24" value={String(form.regulatoryBasis || "")} onChange={e => sf("regulatoryBasis", e.target.value)} /></div>
              <div>
                <Label>Certifying Body</Label>
                <Select value={String(form.certifyingBody || "")} onValueChange={v => sf("certifyingBody", v)}>
                  <SelectTrigger><SelectValue placeholder="Select body" /></SelectTrigger>
                  <SelectContent>{CERTIFYING_BODIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Application Date</Label><Input type="date" value={String(form.applicationDate || "")} onChange={e => sf("applicationDate", e.target.value)} /></div>
              <div><Label>Decision Date</Label><Input type="date" value={String(form.decisionDate || "")} onChange={e => sf("decisionDate", e.target.value)} /></div>
              <div className="col-span-2"><Label>Expiry Date (if approved)</Label><Input type="date" value={String(form.expiryDate || "")} onChange={e => sf("expiryDate", e.target.value)} /></div>
              <div className="col-span-2"><Label>Justification</Label><Textarea rows={2} placeholder="Why no organic alternative is available" value={String(form.justification || "")} onChange={e => sf("justification", e.target.value)} /></div>
              <div className="col-span-2"><Label>Approval Conditions (if approved)</Label><Textarea rows={2} placeholder="Conditions or restrictions attached to the approval" value={String(form.approvalConditions || "")} onChange={e => sf("approvalConditions", e.target.value)} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })} disabled={mutSave.isPending || !form.inputName}>
                {mutSave.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : null}
                {dlg.mode === "edit" ? "Update" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function OrganicVenisonPage() {
  const { selectedFarm } = useAppStore();
  const farmId = selectedFarm?.id;
  const [tab, setTab] = useState<"certification" | "land" | "feed" | "derogations">("certification");

  if (!farmId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Select a farm to continue.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Organic Venison</h1>
          <p className="text-sm text-muted-foreground mt-1">Certification records, grazing compartment conversion register, feed & supplement log, and derogation case management</p>
        </div>
        <TabBar>
          <TabButton active={tab === "certification"} onClick={() => setTab("certification")}><Award className="w-3.5 h-3.5" />Certification</TabButton>
          <TabButton active={tab === "land"} onClick={() => setTab("land")}><Map className="w-3.5 h-3.5" />Land Register</TabButton>
          <TabButton active={tab === "feed"} onClick={() => setTab("feed")}><Package className="w-3.5 h-3.5" />Feed & Supplements</TabButton>
          <TabButton active={tab === "derogations"} onClick={() => setTab("derogations")}><FileQuestion className="w-3.5 h-3.5" />Derogations</TabButton>
        </TabBar>
        <div className="rounded-md border p-4 bg-card">
          {tab === "certification" && <CertificationTab farmId={farmId} />}
          {tab === "land" && <LandRegisterTab farmId={farmId} />}
          {tab === "feed" && <FeedSupplementsTab farmId={farmId} />}
          {tab === "derogations" && <DerogationsTab farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}
