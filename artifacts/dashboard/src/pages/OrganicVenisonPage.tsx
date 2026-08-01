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
function OVTabBar({ children }: { children: ReactNode }) {
  return <div className="flex gap-1 flex-wrap border-b border-border mb-4 pb-2">{children}</div>;
}
function OVTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
      {children}
    </button>
  );
}
function OVSectionHeader({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button size="sm" onClick={onAdd}><Plus className="w-4 h-4 mr-1" />{addLabel}</Button>
    </div>
  );
}
function OVEmptyState({ icon: Icon, message }: { icon: any; message: string }) {
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
function OVFieldView({ label, value }: { label: string; value: ReactNode }) {
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
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
      <OVSectionHeader title="Certificate Register" onAdd={() => open("add")} addLabel="Add Certificate" />
      {records.length === 0 ? (
        <OVEmptyState icon={Award} message="No organic certificates recorded yet. Add your first certifying body record above." />
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
              <OVFieldView label="Certifying Body" value={fmt(dlg.row.certifyingBody)} />
              <OVFieldView label="Certificate Type" value={fmt(dlg.row.certificateType)} />
              <OVFieldView label="Certificate Number" value={fmt(dlg.row.certificateNumber)} />
              <OVFieldView label="Status" value={fmt(dlg.row.status)} />
              <OVFieldView label="Issue Date" value={fmtDate(dlg.row.issueDate)} />
              <OVFieldView label="Expiry Date" value={fmtDate(dlg.row.expiryDate)} />
              {dlg.row.scope && <div className="col-span-2"><OVFieldView label="Scope" value={fmt(dlg.row.scope)} /></div>}
              {dlg.row.notes && <div className="col-span-2"><OVFieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
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
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
      <OVSectionHeader title="Deer Grazing Compartment Register" onAdd={() => open("add")} addLabel="Add Compartment" />
      {records.length === 0 ? (
        <OVEmptyState icon={Map} message="No compartments registered yet. Add your first grazing compartment or deer park block above." />
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
              <OVFieldView label="Compartment Name" value={fmt(dlg.row.compartmentName)} />
              <OVFieldView label="Area (ha)" value={dlg.row.areaHa ? `${dlg.row.areaHa} ha` : "—"} />
              <OVFieldView label="Conversion Status" value={fmt(dlg.row.conversionStatus)} />
              <OVFieldView label="Conversion Start Date" value={fmtDate(dlg.row.conversionStartDate)} />
              <OVFieldView label="Certified Organic Date" value={fmtDate(dlg.row.certifiedOrganicDate)} />
              <OVFieldView label="Certifying Body" value={fmt(dlg.row.certifyingBody)} />
              <OVFieldView label="Certifier Reference" value={fmt(dlg.row.certifierReference)} />
              <OVFieldView label="Previous Land Use" value={fmt(dlg.row.previousLandUse)} />
              {dlg.row.notes && <div className="col-span-2"><OVFieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
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
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
      <OVSectionHeader title="Feed & Supplement Records" onAdd={() => open("add")} addLabel="Add Record" />
      {records.length === 0 ? (
        <OVEmptyState icon={Package} message="No feed or supplement records yet. Log all supplementary feed inputs including mineral licks and concentrates." />
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
              <OVFieldView label="Application Date" value={fmtDate(dlg.row.applicationDate)} />
              <OVFieldView label="Product Name" value={fmt(dlg.row.productName)} />
              <OVFieldView label="Product Type" value={fmt(dlg.row.productType)} />
              <OVFieldView label="Organic Approval Status" value={fmt(dlg.row.organicApprovalStatus)} />
              <OVFieldView label="Certifier Approval Reference" value={fmt(dlg.row.certifierApprovalReference)} />
              <OVFieldView label="Quantity (kg)" value={dlg.row.quantityKg ? `${dlg.row.quantityKg} kg` : "—"} />
              <OVFieldView label="Area / Herd" value={fmt(dlg.row.areaOrHerd)} />
              <OVFieldView label="Supplier" value={fmt(dlg.row.supplierName)} />
              {dlg.row.notes && <div className="col-span-2"><OVFieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
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
const VENS_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-blue-100 text-blue-800" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-800" },
  refused: { label: "Refused", cls: "bg-red-100 text-red-800" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-800" },
  expired: { label: "Expired", cls: "bg-gray-100 text-gray-600" },
  withdrawn: { label: "Withdrawn", cls: "bg-gray-100 text-gray-600" },
};

function VensDerogCard({ farmId, c: rec, isExpanded, onToggle, qc }: {
  farmId: number; c: any; isExpanded: boolean; onToggle: () => void; qc: any;
}) {
  const { toast } = useToast();
  const [recordDecisionOpen, setRecordDecisionOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [corrOpen, setCorrOpen] = useState(false);
  const [editCorr, setEditCorr] = useState<any>(null);
  const [corrForm, setCorrForm] = useState<any>({ correspondenceDate: new Date().toISOString().slice(0,10), direction: "to-certifier", correspondenceType: "Application to Certifier", summary: "", reference: "", notes: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("Approval Letter");

  const { data: corrData } = useQuery({
    queryKey: ["vens-derog-corr", rec.id],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}/correspondence`), { credentials: "include" }).then(r => r.json()),
    enabled: isExpanded,
  });
  const { data: docsData } = useQuery({
    queryKey: ["vens-derog-docs", rec.id],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}/documents`), { credentials: "include" }).then(r => r.json()),
    enabled: isExpanded,
  });
  const corrItems = corrData?.items ?? [];
  const docs = docsData?.items ?? [];

  const saveEdit = useMutation({
    mutationFn: (body: any) => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] }); setEditOpen(false); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const saveDecision = useMutation({
    mutationFn: (body: any) => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] }); setRecordDecisionOpen(false); toast({ title: "Decision recorded" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delDerog = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  const saveCorr = useMutation({
    mutationFn: (body: any) => {
      const url = editCorr ? api(`farms/${farmId}/organic-venison/derogation-correspondence/${editCorr.id}`) : api(`farms/${farmId}/organic-venison/derogations/${rec.id}/correspondence`);
      return fetch(url, { method: editCorr ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vens-derog-corr", rec.id] }); setCorrOpen(false); setEditCorr(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delCorr = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-venison/derogation-correspondence/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vens-derog-corr", rec.id] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  const delDoc = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/organic-venison/derogation-documents/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vens-derog-docs", rec.id] }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const cfg = VENS_STATUS_CFG[rec.status] ?? VENS_STATUS_CFG.pending;
  const days = rec.expiryDate ? Math.ceil((new Date(rec.expiryDate).getTime() - Date.now()) / 86400000) : null;

  async function handleFileUpload(file: File, docType: string) {
    setUploading(true);
    try {
      const presignRes = await fetch(api("uploads/presign"), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type, recordType: "organic_venison_derogation" }) });
      const { uploadUrl, fileKey } = await presignRes.json();
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      await fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}/documents`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileKey, fileName: file.name, fileSize: file.size, mimeType: file.type, documentType: docType }) });
      qc.invalidateQueries({ queryKey: ["vens-derog-docs", rec.id] });
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    setUploading(false);
  }

  const [decisionStatus, setDecisionStatus] = useState("approved");
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().slice(0,10));
  const [decisionCertRef, setDecisionCertRef] = useState(rec.certifierRef ?? "");
  const [decisionConditions, setDecisionConditions] = useState(rec.approvalConditions ?? "");
  const [decisionExpiry, setDecisionExpiry] = useState(rec.expiryDate ?? "");
  const [decisionRejReason, setDecisionRejReason] = useState("");
  const [decisionRejRef, setDecisionRejRef] = useState("");

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 cursor-pointer" onClick={onToggle}>
        {isExpanded ? <span className="text-muted-foreground text-sm">▾</span> : <span className="text-muted-foreground text-sm">▸</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{rec.inputName}</span>
            {rec.caseReference && <span className="font-mono text-xs text-muted-foreground">{rec.caseReference}</span>}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls} border-current/20`}>{cfg.label}</span>
            {(rec.status === "rejected" || rec.status === "refused") && !rec.correctiveAction && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-300">Action Required</span>
            )}
            {days !== null && rec.status === "approved" && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${days < 0 ? "bg-red-100 text-red-700" : days <= 14 ? "bg-red-100 text-red-700" : days <= 60 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                {days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining`}
              </span>
            )}
            {docs.length > 0 && <span className="text-xs text-muted-foreground">📎 {docs.length}</span>}
          </div>
          <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
            {rec.certifyingBody && <span>Certifier: {rec.certifyingBody}</span>}
            {rec.certifierRef && <span>Ref: {rec.certifierRef}</span>}
            {rec.applicationDate && <span>Applied: {rec.applicationDate}</span>}
            {rec.expiryDate && <span>Expires: {rec.expiryDate}</span>}
          </div>
        </div>
        <div className="flex gap-1 shrink-0 items-center" onClick={e => e.stopPropagation()}>
          {(rec.status === "pending") && (
            <button className="text-xs px-2 py-1 border border-amber-300 text-amber-700 rounded hover:bg-amber-50" onClick={() => setRecordDecisionOpen(true)}>Record Decision</button>
          )}
          <Button variant="ghost" size="icon" onClick={() => { setEditForm({ ...rec }); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this derogation case and all its correspondence?")) delDerog.mutate(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/10 p-4 space-y-5">
          {(rec.status === "rejected" || rec.status === "refused") && !rec.correctiveAction && (
            <div className="rounded-md border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800">
              <strong>Action Required:</strong> This derogation was refused. Record a corrective action by editing this case.
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {rec.inputType && <div><span className="text-muted-foreground">Input type: </span>{rec.inputType}</div>}
            {rec.regulatoryBasis && <div><span className="text-muted-foreground">Regulatory basis: </span>{rec.regulatoryBasis}</div>}
            {rec.internalDecisionDate && <div><span className="text-muted-foreground">Internal decision: </span>{rec.internalDecisionDate}</div>}
            {rec.availabilitySearchDate && <div><span className="text-muted-foreground">Availability search: </span>{rec.availabilitySearchDate}</div>}
            {rec.availabilitySearchRef && <div><span className="text-muted-foreground">Search ref: </span>{rec.availabilitySearchRef}</div>}
            {rec.decisionDate && <div><span className="text-muted-foreground">Decision date: </span>{rec.decisionDate}</div>}
            {rec.approvalConditions && <div className="col-span-2"><span className="text-muted-foreground">Conditions: </span>{rec.approvalConditions}</div>}
            {rec.rejectionReason && <div className="col-span-2"><span className="text-muted-foreground">Rejection reason: </span><span className="text-red-700">{rec.rejectionReason}</span></div>}
            {rec.rejectionRef && <div><span className="text-muted-foreground">Rejection ref: </span>{rec.rejectionRef}</div>}
            {rec.correctiveAction && <div className="col-span-2"><span className="text-muted-foreground">Corrective action: </span><span className="text-green-700">{rec.correctiveAction}</span></div>}
            {rec.justification && <div className="col-span-2"><span className="text-muted-foreground">Justification: </span>{rec.justification}</div>}
            {rec.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes: </span>{rec.notes}</div>}
          </div>

          {/* Correspondence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Correspondence Log</h4>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditCorr(null); setCorrForm({ correspondenceDate: new Date().toISOString().slice(0,10), direction: "to-certifier", correspondenceType: "Application to Certifier", summary: "", reference: "", notes: "" }); setCorrOpen(true); }}>+ Add</Button>
            </div>
            {corrItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">No correspondence logged yet.</p>
            ) : corrItems.map((ci: any) => (
              <div key={ci.id} className="bg-white border rounded p-3 flex items-start justify-between gap-2">
                <div className="text-sm flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-medium">{ci.correspondenceDate}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{ci.direction}</span>
                    <span className="text-xs text-muted-foreground">{ci.correspondenceType}</span>
                  </div>
                  <p>{ci.summary}</p>
                  {ci.reference && <p className="text-xs text-muted-foreground">Ref: {ci.reference}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditCorr(ci); setCorrForm({ ...ci }); setCorrOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => delCorr.mutate(ci.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Documents</h4>
              <div className="flex items-center gap-2">
                <Select value={uploadType} onValueChange={setUploadType}>
                  <SelectTrigger className="h-7 w-44 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Approval Letter","Availability Search Evidence","Application Letter","Supporting Evidence","Rejection Notice","Conditions Letter","Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={uploading} onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"; inp.onchange = async () => { if (inp.files?.[0]) await handleFileUpload(inp.files[0], uploadType); }; inp.click(); }}>
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </div>
            </div>
            {docs.length === 0 ? <p className="text-xs text-muted-foreground">No documents uploaded yet.</p> : docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-2 rounded border bg-background px-3 py-2">
                <span className="text-muted-foreground text-sm">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">{doc.notes} · {new Date(doc.uploadedAt).toLocaleDateString("en-GB")}</p>
                </div>
                <a href={`/api${doc.fileKey}`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon" className="h-7 w-7">↗</Button></a>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => delDoc.mutate(doc.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Decision Dialog */}
      <Dialog open={recordDecisionOpen} onOpenChange={o => { if (!o) setRecordDecisionOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Certifier Decision</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Decision *</Label>
                <Select value={decisionStatus} onValueChange={setDecisionStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="refused">Refused</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="expired">Expired — no decision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Decision Date *</Label><Input type="date" className="mt-1" value={decisionDate} onChange={e => setDecisionDate(e.target.value)} /></div>
            </div>
            {decisionStatus === "approved" && (
              <>
                <div><Label>Certifier Reference</Label><Input className="mt-1" value={decisionCertRef} onChange={e => setDecisionCertRef(e.target.value)} /></div>
                <div><Label>Approval Conditions</Label><Textarea className="mt-1" value={decisionConditions} onChange={e => setDecisionConditions(e.target.value)} rows={2} /></div>
                <div><Label>Expiry Date</Label><Input type="date" className="mt-1" value={decisionExpiry} onChange={e => setDecisionExpiry(e.target.value)} /></div>
              </>
            )}
            {decisionStatus === "refused" && (
              <>
                <div><Label>Rejection Reason</Label><Textarea className="mt-1" value={decisionRejReason} onChange={e => setDecisionRejReason(e.target.value)} rows={2} /></div>
                <div><Label>Rejection Reference</Label><Input className="mt-1" value={decisionRejRef} onChange={e => setDecisionRejRef(e.target.value)} /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordDecisionOpen(false)}>Cancel</Button>
            <Button onClick={() => saveDecision.mutate({ ...rec, status: decisionStatus, decisionDate: decisionDate || null, certifierRef: decisionCertRef || null, approvalConditions: decisionConditions || null, expiryDate: decisionExpiry || null, rejectionReason: decisionRejReason || null, rejectionRef: decisionRejRef || null })} disabled={saveDecision.isPending}>
              {saveDecision.isPending ? "Saving…" : "Save Decision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Case Dialog */}
      <Dialog open={editOpen} onOpenChange={o => { if (!o) setEditOpen(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Derogation Case</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Case Reference</Label><Input value={String(editForm.caseReference || "")} onChange={e => setEditForm((f:any) => ({ ...f, caseReference: e.target.value }))} /></div>
            <div>
              <Label>Status</Label>
              <Select value={String(editForm.status || "pending")} onValueChange={v => setEditForm((f:any) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEROGATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Input Name *</Label><Input value={String(editForm.inputName || "")} onChange={e => setEditForm((f:any) => ({ ...f, inputName: e.target.value }))} /></div>
            <div><Label>Input Type</Label><Input value={String(editForm.inputType || "")} onChange={e => setEditForm((f:any) => ({ ...f, inputType: e.target.value }))} /></div>
            <div><Label>Regulatory Basis</Label><Input value={String(editForm.regulatoryBasis || "")} onChange={e => setEditForm((f:any) => ({ ...f, regulatoryBasis: e.target.value }))} /></div>
            <div>
              <Label>Certifying Body</Label>
              <Select value={String(editForm.certifyingBody || "")} onValueChange={v => setEditForm((f:any) => ({ ...f, certifyingBody: v }))}>
                <SelectTrigger><SelectValue placeholder="Select body" /></SelectTrigger>
                <SelectContent>{CERTIFYING_BODIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Certifier Ref</Label><Input value={String(editForm.certifierRef || "")} onChange={e => setEditForm((f:any) => ({ ...f, certifierRef: e.target.value }))} /></div>
            <div><Label>Internal Decision Date</Label><Input type="date" value={String(editForm.internalDecisionDate || "")} onChange={e => setEditForm((f:any) => ({ ...f, internalDecisionDate: e.target.value }))} /></div>
            <div><Label>Availability Search Date</Label><Input type="date" value={String(editForm.availabilitySearchDate || "")} onChange={e => setEditForm((f:any) => ({ ...f, availabilitySearchDate: e.target.value }))} /></div>
            <div><Label>Availability Search Ref</Label><Input value={String(editForm.availabilitySearchRef || "")} onChange={e => setEditForm((f:any) => ({ ...f, availabilitySearchRef: e.target.value }))} placeholder="OFAS / UKOAS ref" /></div>
            <div><Label>Application Date</Label><Input type="date" value={String(editForm.applicationDate || "")} onChange={e => setEditForm((f:any) => ({ ...f, applicationDate: e.target.value }))} /></div>
            <div><Label>Decision Date</Label><Input type="date" value={String(editForm.decisionDate || "")} onChange={e => setEditForm((f:any) => ({ ...f, decisionDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Expiry Date</Label><Input type="date" value={String(editForm.expiryDate || "")} onChange={e => setEditForm((f:any) => ({ ...f, expiryDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Justification</Label><Textarea rows={2} value={String(editForm.justification || "")} onChange={e => setEditForm((f:any) => ({ ...f, justification: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Approval Conditions</Label><Textarea rows={2} value={String(editForm.approvalConditions || "")} onChange={e => setEditForm((f:any) => ({ ...f, approvalConditions: e.target.value }))} /></div>
            {(editForm.status === "refused" || editForm.status === "rejected") && (
              <>
                <div className="col-span-2"><Label>Rejection Reason</Label><Textarea rows={2} value={String(editForm.rejectionReason || "")} onChange={e => setEditForm((f:any) => ({ ...f, rejectionReason: e.target.value }))} /></div>
                <div><Label>Rejection Reference</Label><Input value={String(editForm.rejectionRef || "")} onChange={e => setEditForm((f:any) => ({ ...f, rejectionRef: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Corrective Action Taken</Label><Textarea rows={2} value={String(editForm.correctiveAction || "")} onChange={e => setEditForm((f:any) => ({ ...f, correctiveAction: e.target.value }))} /></div>
              </>
            )}
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(editForm.notes || "")} onChange={e => setEditForm((f:any) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => saveEdit.mutate(editForm)} disabled={saveEdit.isPending || !editForm.inputName}>{saveEdit.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Correspondence Dialog */}
      <Dialog open={corrOpen} onOpenChange={o => { if (!o) { setCorrOpen(false); setEditCorr(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editCorr ? "Edit Correspondence" : "Add Correspondence"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Date *</Label><Input type="date" value={corrForm.correspondenceDate ?? ""} onChange={e => setCorrForm((f:any) => ({ ...f, correspondenceDate: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Direction</Label>
                <Select value={corrForm.direction ?? "to-certifier"} onValueChange={v => setCorrForm((f:any) => ({ ...f, direction: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to-certifier">To certifier</SelectItem>
                    <SelectItem value="from-certifier">From certifier</SelectItem>
                    <SelectItem value="internal">Internal note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={corrForm.correspondenceType ?? ""} onValueChange={v => setCorrForm((f:any) => ({ ...f, correspondenceType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{["Application to Certifier","Availability Search Evidence","Supporting Evidence","Certifier Query","Approval Letter","Rejection Notice","Conditions Letter","Renewal Request","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Summary *</Label><Textarea value={corrForm.summary ?? ""} onChange={e => setCorrForm((f:any) => ({ ...f, summary: e.target.value }))} rows={2} /></div>
            <div><Label>Reference</Label><Input value={corrForm.reference ?? ""} onChange={e => setCorrForm((f:any) => ({ ...f, reference: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={corrForm.notes ?? ""} onChange={e => setCorrForm((f:any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCorrOpen(false); setEditCorr(null); }}>Cancel</Button>
            <Button onClick={() => saveCorr.mutate(corrForm)} disabled={!corrForm.correspondenceDate || !corrForm.correspondenceType || !corrForm.summary || saveCorr.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DerogationsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<any>({ status: "pending" });
  const sf = (k: string, v: any) => setAddForm((f: any) => ({ ...f, [k]: v }));

  const { data, isLoading } = useQuery({
    queryKey: ["org-venison-derog", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations`), { credentials: "include" }).then(r => r.json()),
  });
  const records: any[] = data ?? [];

  const mutAdd = useMutation({
    mutationFn: (body: any) => fetch(api(`farms/${farmId}/organic-venison/derogations`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] }); setAddOpen(false); setAddForm({ status: "pending" }); toast({ title: "Case created" }); setExpandedId(d?.id ?? null); },
    onError: () => toast({ title: "Error creating case", variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        <strong>Derogation Case Register</strong> — Record all requests to use non-organic inputs or practices where no organic alternative is available. Each case tracks the availability search, certifier correspondence, decision, and supporting documents.
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(VENS_STATUS_CFG).map(([s, cfg]) => {
            const count = records.filter((r: any) => r.status === s).length;
            return count > 0 ? <span key={s} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls} border-current/20`}>{cfg.label}: {count}</span> : null;
          })}
          {records.length === 0 && <span className="text-sm text-muted-foreground">No derogation cases yet</span>}
        </div>
        <Button size="sm" onClick={() => { setAddForm({ status: "pending" }); setAddOpen(true); }}><Plus className="w-4 h-4 mr-1" />New Derogation</Button>
      </div>

      <div className="space-y-2">
        {records.map((r: any) => (
          <VensDerogCard
            key={r.id}
            farmId={farmId}
            c={r}
            isExpanded={expandedId === r.id}
            onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
            qc={qc}
          />
        ))}
      </div>

      {/* New Case Dialog */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) setAddOpen(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Derogation Case</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Case Reference</Label><Input value={addForm.caseReference || ""} onChange={e => sf("caseReference", e.target.value)} placeholder="e.g. VENS-DERG-2025-001" /></div>
            <div>
              <Label>Status</Label>
              <Select value={addForm.status || "pending"} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEROGATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Input Name *</Label><Input value={addForm.inputName || ""} onChange={e => sf("inputName", e.target.value)} placeholder="Name of input / treatment" /></div>
            <div><Label>Input Type</Label><Input value={addForm.inputType || ""} onChange={e => sf("inputType", e.target.value)} placeholder="e.g. Mineral supplement" /></div>
            <div><Label>Regulatory Basis</Label><Input value={addForm.regulatoryBasis || ""} onChange={e => sf("regulatoryBasis", e.target.value)} placeholder="e.g. UK Organic Reg Art. 24" /></div>
            <div>
              <Label>Certifying Body</Label>
              <Select value={addForm.certifyingBody || ""} onValueChange={v => sf("certifyingBody", v)}>
                <SelectTrigger><SelectValue placeholder="Select body" /></SelectTrigger>
                <SelectContent>{CERTIFYING_BODIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Internal Decision Date</Label><Input type="date" value={addForm.internalDecisionDate || ""} onChange={e => sf("internalDecisionDate", e.target.value)} /></div>
            <div><Label>Availability Search Date</Label><Input type="date" value={addForm.availabilitySearchDate || ""} onChange={e => sf("availabilitySearchDate", e.target.value)} /></div>
            <div className="col-span-2"><Label>Availability Search Ref (OFAS / UKOAS)</Label><Input value={addForm.availabilitySearchRef || ""} onChange={e => sf("availabilitySearchRef", e.target.value)} placeholder="Search reference number" /></div>
            <div><Label>Application Date</Label><Input type="date" value={addForm.applicationDate || ""} onChange={e => sf("applicationDate", e.target.value)} /></div>
            <div className="col-span-2"><Label>Justification</Label><Textarea rows={2} value={addForm.justification || ""} onChange={e => sf("justification", e.target.value)} placeholder="Why no organic alternative is available" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={addForm.notes || ""} onChange={e => sf("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => mutAdd.mutate(addForm)} disabled={mutAdd.isPending || !addForm.inputName}>{mutAdd.isPending ? "Saving…" : "Create Case"}</Button>
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
        <OVTabBar>
          <OVTabButton active={tab === "certification"} onClick={() => setTab("certification")}><Award className="w-3.5 h-3.5" />Certification</OVTabButton>
          <OVTabButton active={tab === "land"} onClick={() => setTab("land")}><Map className="w-3.5 h-3.5" />Land Register</OVTabButton>
          <OVTabButton active={tab === "feed"} onClick={() => setTab("feed")}><Package className="w-3.5 h-3.5" />Feed & Supplements</OVTabButton>
          <OVTabButton active={tab === "derogations"} onClick={() => setTab("derogations")}><FileQuestion className="w-3.5 h-3.5" />Derogations</OVTabButton>
        </OVTabBar>
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
