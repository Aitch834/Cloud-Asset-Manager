// @ts-nocheck
import { useState, useMemo, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Eye, Crosshair, ShoppingCart, Users, HeartPulse, ShieldCheck, BarChart3, AlertTriangle, Printer } from "lucide-react";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DocAttach } from "@/components/DocAttach";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { VenisonEnterpriseReport } from "@/components/VenisonEnterpriseReport";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";

const api = (path: string) => `/api/${path}`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEER_SPECIES = ["Red Deer", "Roe Deer", "Fallow Deer", "Sika Deer", "Muntjac", "Chinese Water Deer", "Reindeer", "Other"];
const VEN_COLORS = ["#15803d", "#92400e", "#1d4ed8", "#7c3aed", "#b91c1c", "#0e7490", "#6d28d9"];
const CULL_REASONS = ["Population management (annual cull plan)", "Damage control", "Welfare — injured or sick", "Sporting cull", "Licenced out-of-season emergency"];
const FOOD_SAFETY_RESULTS = ["Passed — clean bill of health", "Conditionally passed — abnormality noted, parts condemned", "Failed — carcass condemned", "Not inspected / not for human consumption"];
const AGE_CLASSES = ["Calf / Fawn / Kid", "Yearling (Pricket / Knobber)", "Adult", "Unknown"];
const SEX_OPTIONS = ["Stag", "Hind", "Buck", "Doe", "Calf", "Fawn", "Kid", "Unknown"];
const CULL_METHODS = ["Rifle (stalking)", "Driven / sika drive", "Trap (licensed)"];
const FACILITY_TYPES = ["On-farm approved larder", "AGHE (Approved Game Handling Establishment)", "Licensed Game Handling Establishment (GHE)", "Direct on-farm slaughter"];
const DESTINATION_TYPES = ["Game dealer", "Butcher / butchery", "Wholesale", "Direct consumer sale", "Restaurant / catering", "Export", "Own consumption"];
const SURVEY_METHODS = ["Driven count", "Thermal imaging (ground-based)", "Fixed point count (vantage point)", "ADE count (aerial)", "Thermal drone survey", "Camera trap census"];
const HEALTH_EVENT_TYPES = ["Vaccination", "Vet visit / health check", "bTB skin test (SICCT)", "bTB gamma-interferon blood test", "Post mortem examination", "Worming treatment", "Parasite treatment", "Other vet treatment"];
const BTB_RESULTS = ["Clear / negative", "Standard reactor", "Inconclusive reactor", "Not applicable"];
const CERT_TYPES = [
  "Section 1 Firearms Certificate (FC)",
  "Section 2 Shotgun Certificate (SGC)",
  "Deer Stalking Certificate Level 1 (DSC1)",
  "Deer Stalking Certificate Level 2 (DSC2)",
  "Scottish Stalking Certificate",
  "Hunter Food Hygiene Certificate (WGMI)",
  "Larder Hygiene Certificate",
  "Other",
];

// ─── SHARED UI HELPERS ────────────────────────────────────────────────────────
function VPTabBar({ children }: { children: ReactNode }) {
  return <div className="flex gap-1 flex-wrap border-b border-border mb-4 pb-2">{children}</div>;
}
function VPTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
function VPSectionHeader({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button size="sm" onClick={onAdd}><Plus className="w-4 h-4 mr-1" />{addLabel}</Button>
    </div>
  );
}
function VPEmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground text-sm">
      <Icon className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
function VPKpiCard({ label, value, bg, text, sub }: { label: string; value: any; bg: string; text: string; sub: string }) {
  return (
    <div className={`${bg} rounded-xl border p-4 text-center`}>
      <p className={`text-xl font-bold ${text}`}>{value}</p>
      <p className={`text-xs mt-0.5 ${sub}`}>{label}</p>
    </div>
  );
}
const fmt = (val: unknown) => (val == null || val === "" ? "—" : String(val));
const fmtDate = (val: unknown) => {
  if (!val) return "—";
  try { return new Date(String(val)).toLocaleDateString("en-GB"); } catch { return String(val); }
};
const fmtGbp = (val: unknown) => {
  if (!val) return "—";
  return `£${Number(val).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
function VPFieldView({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}

// ─── HERDS TAB ────────────────────────────────────────────────────────────────
function HerdsTab({ farmId }: { farmId: number }) {
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herd-flock-register`), { credentials: "include" }).then(r => r.json()),
  });
  const deerHerds = herds.filter((h: any) =>
    /deer|venison|fallow|red|roe|sika|muntjac|chinese water|reindeer/i.test(String(h.species || "")) ||
    /deer|venison/i.test(String(h.name || ""))
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Deer Herd Register</p>
        <p>Deer herds are registered in <strong>Livestock → Herds & Animals</strong>. Set the species to <em>Deer</em> (or a specific deer species) when creating a herd. All records in this Venison Production module link back to herds from that register.</p>
      </div>
      {deerHerds.length === 0 ? (
        <VPEmptyState icon={Crosshair} message="No deer herds found. Add a deer herd in Livestock → Herds & Animals first." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deerHerds.map((h: any) => (
            <div key={h.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{h.name}</span>
                <Badge variant="outline" className="text-xs">{h.status || "Active"}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><span className="font-medium">Species:</span> {fmt(h.species)}</div>
                <div><span className="font-medium">Breed:</span> {fmt(h.breed)}</div>
                <div><span className="font-medium">CPH:</span> {fmt(h.herdNumber)}</div>
                <div><span className="font-medium">Purpose:</span> {fmt(h.purpose)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CULL RECORDS TAB ─────────────────────────────────────────────────────────
function CullRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-cull", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-cull-records`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herd-flock-register`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/venison-cull-records${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-cull", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/venison-cull-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-cull", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => { setDlg({ open: true, mode, row }); setForm(row); };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const years = useMemo(() => {
    const s = new Set<string>(records.map((r: any) => String(r.cullDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [yearFilter, setYearFilter] = useState("all");
  const filtered = useMemo(() => yearFilter === "all" ? records : records.filter((r: any) => String(r.cullDate || "").startsWith(yearFilter)), [records, yearFilter]);

  const totalCarcassKg = filtered.reduce((s: number, r: any) => s + (Number(r.carcassWeightKg) || 0), 0);
  const foodSafetyIssues = filtered.filter((r: any) => String(r.foodSafetyInspectionResult || "").toLowerCase().includes("fail") || String(r.foodSafetyInspectionResult || "").toLowerCase().includes("condemn")).length;
  const notifiable = filtered.filter((r: any) => r.notifiableDiseaseSupect).length;

  const printCullRecords = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cull Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}h2{margin-bottom:8px}</style></head><body><h2>Stalking & Cull Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Stalker</th><th>Species</th><th>Sex</th><th>Age Class</th><th>Carcass Wt (kg)</th><th>Kill-out %</th><th>Food Safety</th><th>Notifiable</th></tr></thead><tbody>${filtered.map((r: any) => `<tr><td>${fmtDate(r.cullDate)}</td><td>${fmt(r.stalkerName)}</td><td>${fmt(r.species)}</td><td>${fmt(r.sex)}</td><td>${fmt(r.ageClass)}</td><td>${fmt(r.carcassWeightKg)}</td><td>${r.killoutPercent ? r.killoutPercent + "%" : "—"}</td><td>${fmt(r.foodSafetyInspectionResult)}</td><td>${r.notifiableDiseaseSupect ? "Yes" : "No"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <VPKpiCard label="Cull Records" value={filtered.length} bg="bg-green-50 border-green-100" text="text-green-800" sub="text-green-700" />
        <VPKpiCard label="Total Carcass Wt (kg)" value={totalCarcassKg > 0 ? `${totalCarcassKg.toFixed(1)} kg` : "—"} bg="bg-amber-50 border-amber-100" text="text-amber-800" sub="text-amber-700" />
        <VPKpiCard label="Food Safety Issues" value={foodSafetyIssues || "None"} bg={foodSafetyIssues > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"} text={foodSafetyIssues > 0 ? "text-red-800" : "text-gray-700"} sub={foodSafetyIssues > 0 ? "text-red-600" : "text-gray-500"} />
        <VPKpiCard label="Notifiable Suspect" value={notifiable || "None"} bg={notifiable > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"} text={notifiable > 0 ? "text-red-800" : "text-gray-700"} sub={notifiable > 0 ? "text-red-600" : "text-gray-500"} />
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-semibold">Stalking & Cull Records</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printCullRecords}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => open("add")}><Plus className="w-4 h-4 mr-1" />Add Cull Record</Button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <VPEmptyState icon={Crosshair} message="No cull records yet. Add your first stalking or cull record above." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Date", "Stalker", "Species", "Sex / Age", "Carcass Wt (kg)", "Kill-out %", "Food Safety", "Notifiable", "", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.cullDate)}</td>
                  <td className="py-2 px-3">{fmt(r.stalkerName)}</td>
                  <td className="py-2 px-3 font-medium">{fmt(r.species)}</td>
                  <td className="py-2 px-3">{fmt(r.sex)} / {fmt(r.ageClass)}</td>
                  <td className="py-2 px-3">{fmt(r.carcassWeightKg)}</td>
                  <td className="py-2 px-3">{r.killoutPercent ? `${r.killoutPercent}%` : "—"}</td>
                  <td className="py-2 px-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        String(r.foodSafetyInspectionResult || "").includes("Passed") ? "bg-green-100 text-green-800 border-green-200" :
                        String(r.foodSafetyInspectionResult || "").includes("Failed") || String(r.foodSafetyInspectionResult || "").includes("condemn") ? "bg-red-100 text-red-800 border-red-200" :
                        "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {String(r.foodSafetyInspectionResult || "—").split("—")[0].trim() || "—"}
                    </Badge>
                  </td>
                  <td className="py-2 px-3">{r.notifiableDiseaseSupect ? <span className="text-red-600 font-bold">⚠ Yes</span> : "No"}</td>
                  <td className="py-2 px-3">
                    <DocAttach farmId={farmId} endpoint="venison-cull-records" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["venison-cull", String(farmId)]} compact />
                  </td>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Cull Record" : dlg.mode === "edit" ? "Edit Cull Record" : "Add Cull Record"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <VPFieldView label="Cull Date" value={fmtDate(dlg.row.cullDate)} />
              <VPFieldView label="Stalker Name" value={fmt(dlg.row.stalkerName)} />
              <VPFieldView label="Species" value={fmt(dlg.row.species)} />
              <VPFieldView label="Sex" value={fmt(dlg.row.sex)} />
              <VPFieldView label="Age Class" value={fmt(dlg.row.ageClass)} />
              <VPFieldView label="Location / Beat" value={fmt(dlg.row.locationBeat)} />
              <VPFieldView label="Larder No." value={fmt(dlg.row.larderNumber)} />
              <VPFieldView label="Carcass No." value={fmt(dlg.row.carcassNumber)} />
              <VPFieldView label="Liveweight (kg)" value={fmt(dlg.row.liveweightKg)} />
              <VPFieldView label="Gralloch Wt (kg)" value={fmt(dlg.row.grallochWeightKg)} />
              <VPFieldView label="Carcass Wt (kg)" value={fmt(dlg.row.carcassWeightKg)} />
              <VPFieldView label="Kill-out %" value={dlg.row.killoutPercent ? `${dlg.row.killoutPercent}%` : "—"} />
              <VPFieldView label="Cull Method" value={fmt(dlg.row.cullMethod)} />
              <VPFieldView label="Cull Reason" value={fmt(dlg.row.cullReason)} />
              <VPFieldView label="Food Safety Inspection" value={fmt(dlg.row.foodSafetyInspectionResult)} />
              <VPFieldView label="Notifiable Disease Suspect" value={dlg.row.notifiableDiseaseSupect ? "Yes — APHA notified" : "No"} />
              {dlg.row.notes && <div className="col-span-2"><VPFieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
              {dlg.row.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="venison-cull" recordId={dlg.row.id as number} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div><Label>Cull Date *</Label><Input type="date" value={String(form.cullDate || "")} onChange={e => sf("cullDate", e.target.value)} /></div>
              <div><Label>Stalker Name</Label><Input placeholder="Full name" value={String(form.stalkerName || "")} onChange={e => sf("stalkerName", e.target.value)} /></div>
              <div>
                <Label>Species *</Label>
                <Select value={String(form.species || "")} onValueChange={v => sf("species", v)}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>{DEER_SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sex</Label>
                <Select value={String(form.sex || "")} onValueChange={v => sf("sex", v)}>
                  <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
                  <SelectContent>{SEX_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Age Class</Label>
                <Select value={String(form.ageClass || "")} onValueChange={v => sf("ageClass", v)}>
                  <SelectTrigger><SelectValue placeholder="Select age class" /></SelectTrigger>
                  <SelectContent>{AGE_CLASSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Herd (optional)</Label>
                <Select value={String(form.herdId || "")} onValueChange={v => sf("herdId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select herd" /></SelectTrigger>
                  <SelectContent>{herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Location / Beat</Label><Input placeholder="e.g. North beat, East block" value={String(form.locationBeat || "")} onChange={e => sf("locationBeat", e.target.value)} /></div>
              <div><Label>Larder Number</Label><Input placeholder="e.g. L001" value={String(form.larderNumber || "")} onChange={e => sf("larderNumber", e.target.value)} /></div>
              <div><Label>Carcass Number</Label><Input placeholder="e.g. C2025-001" value={String(form.carcassNumber || "")} onChange={e => sf("carcassNumber", e.target.value)} /></div>
              <div><Label>Liveweight (kg)</Label><Input type="number" step="0.1" placeholder="0.0" value={String(form.liveweightKg || "")} onChange={e => sf("liveweightKg", e.target.value)} /></div>
              <div><Label>Gralloch Weight (kg)</Label><Input type="number" step="0.1" placeholder="0.0" value={String(form.grallochWeightKg || "")} onChange={e => sf("grallochWeightKg", e.target.value)} /></div>
              <div><Label>Carcass Weight (kg)</Label><Input type="number" step="0.1" placeholder="0.0" value={String(form.carcassWeightKg || "")} onChange={e => sf("carcassWeightKg", e.target.value)} /></div>
              <div><Label>Kill-out %</Label><Input type="number" step="0.1" placeholder="0.0" value={String(form.killoutPercent || "")} onChange={e => sf("killoutPercent", e.target.value)} /></div>
              <div>
                <Label>Cull Method</Label>
                <Select value={String(form.cullMethod || "")} onValueChange={v => sf("cullMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>{CULL_METHODS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cull Reason *</Label>
                <Select value={String(form.cullReason || "")} onValueChange={v => sf("cullReason", v)}>
                  <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>{CULL_REASONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Food Safety Inspection Result</Label>
                <Select value={String(form.foodSafetyInspectionResult || "")} onValueChange={v => sf("foodSafetyInspectionResult", v)}>
                  <SelectTrigger><SelectValue placeholder="Select result" /></SelectTrigger>
                  <SelectContent>{FOOD_SAFETY_RESULTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox checked={Boolean(form.notifiableDiseaseSupect)} onCheckedChange={v => sf("notifiableDiseaseSupect", v)} id="nd-cull" />
                <Label htmlFor="nd-cull" className="text-sm">Notifiable disease suspected — contact APHA on 03000 200 301</Label>
              </div>
              {form.notifiableDiseaseSupect && (
                <div className="col-span-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  <AlertTriangle className="inline w-4 h-4 mr-1" />
                  <strong>APHA Advisory:</strong> If you suspect a notifiable disease (e.g. TB, foot-and-mouth, bluetongue), you must contact APHA immediately on <strong>03000 200 301</strong>. Mandatory notification must be made before laboratory confirmation.
                </div>
              )}
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button
                onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })}
                disabled={mutSave.isPending || !form.cullDate || !form.species || !form.cullReason}
              >
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

// ─── CARCASS SALES TAB ────────────────────────────────────────────────────────
function CarcassSalesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-sales", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-carcass-sales`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/venison-carcass-sales${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-sales", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/venison-carcass-sales/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-sales", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => { setDlg({ open: true, mode, row }); setForm(row); };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const salesYears = useMemo(() => {
    const s = new Set<string>(records.map((r: any) => String(r.saleDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [salesYearFilter, setSalesYearFilter] = useState("all");
  const filteredSales = useMemo(() => salesYearFilter === "all" ? records : records.filter((r: any) => String(r.saleDate || "").startsWith(salesYearFilter)), [records, salesYearFilter]);

  const totalValue = filteredSales.reduce((s: number, r: any) => s + (Number(r.totalValueGbp) || 0), 0);
  const totalCarcasses = filteredSales.reduce((s: number, r: any) => s + (Number(r.numberCarcasses) || 0), 0);

  const printSalesRecords = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carcass Sales</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Carcass Sales${salesYearFilter !== "all" ? ` — ${salesYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Facility</th><th>Species</th><th>Carcasses</th><th>Grade</th><th>Destination / Buyer</th><th>Weight (kg)</th><th>Value</th></tr></thead><tbody>${filteredSales.map((r: any) => `<tr><td>${fmtDate(r.saleDate)}</td><td>${fmt(r.facilityType)}</td><td>${fmt(r.species)}</td><td>${fmt(r.numberCarcasses)}</td><td>${fmt(r.gradeOrQuality)}</td><td>${fmt(r.destinationType)}${r.buyerName ? ` — ${r.buyerName}` : ""}</td><td>${fmt(r.totalWeightKg)}</td><td>${r.totalValueGbp ? fmtGbp(r.totalValueGbp) : "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <VPKpiCard label="Sale Records" value={filteredSales.length} bg="bg-green-50 border-green-100" text="text-green-800" sub="text-green-700" />
        <VPKpiCard label="Total Carcasses Sold" value={totalCarcasses || "—"} bg="bg-amber-50 border-amber-100" text="text-amber-800" sub="text-amber-700" />
        <VPKpiCard label="Total Sales Value" value={totalValue > 0 ? fmtGbp(totalValue) : "—"} bg="bg-blue-50 border-blue-100" text="text-blue-800" sub="text-blue-700" />
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-semibold">Carcass Processing & Venison Sales</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={salesYearFilter} onValueChange={setSalesYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {salesYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printSalesRecords}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => open("add")}><Plus className="w-4 h-4 mr-1" />Add Sale Record</Button>
        </div>
      </div>
      {filteredSales.length === 0 ? (
        <VPEmptyState icon={ShoppingCart} message="No sale records yet. Record your first venison sale or carcass processing event above." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Date", "Facility", "Species", "Carcasses", "Grade", "Destination / Buyer", "Weight (kg)", "Value", "", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.saleDate)}</td>
                  <td className="py-2 px-3 text-xs max-w-[140px] truncate">{fmt(r.facilityType)}</td>
                  <td className="py-2 px-3">{fmt(r.species)}</td>
                  <td className="py-2 px-3 text-center">{fmt(r.numberCarcasses)}</td>
                  <td className="py-2 px-3 text-xs">{String(r.gradeOrQuality || "—").split("—")[0].trim()}</td>
                  <td className="py-2 px-3">{fmt(r.destinationType)}{r.buyerName ? ` — ${r.buyerName}` : ""}</td>
                  <td className="py-2 px-3">{fmt(r.totalWeightKg)}</td>
                  <td className="py-2 px-3 font-medium">{r.totalValueGbp ? fmtGbp(r.totalValueGbp) : "—"}</td>
                  <td className="py-2 px-3">
                    <DocAttach farmId={farmId} endpoint="venison-carcass-sales" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["venison-sales", String(farmId)]} compact />
                  </td>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Carcass Sale Record" : dlg.mode === "edit" ? "Edit Sale Record" : "Add Sale Record"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <VPFieldView label="Sale Date" value={fmtDate(dlg.row.saleDate)} />
              <VPFieldView label="Facility Type" value={fmt(dlg.row.facilityType)} />
              <VPFieldView label="Species" value={fmt(dlg.row.species)} />
              <VPFieldView label="Number of Carcasses" value={fmt(dlg.row.numberCarcasses)} />
              <VPFieldView label="Carcass Numbers" value={fmt(dlg.row.carcassNumbers)} />
              <VPFieldView label="Grade / Quality" value={fmt(dlg.row.gradeOrQuality)} />
              <VPFieldView label="Destination" value={fmt(dlg.row.destinationType)} />
              <VPFieldView label="Buyer / Game Dealer" value={fmt(dlg.row.buyerName)} />
              <VPFieldView label="Price per kg (£)" value={dlg.row.pricePerKgGbp ? `£${dlg.row.pricePerKgGbp}/kg` : "—"} />
              <VPFieldView label="Total Weight (kg)" value={fmt(dlg.row.totalWeightKg)} />
              <VPFieldView label="Total Value" value={fmtGbp(dlg.row.totalValueGbp)} />
              <VPFieldView label="Invoice Reference" value={fmt(dlg.row.invoiceReference)} />
              <VPFieldView label="Wild Game Declaration No." value={fmt(dlg.row.wildGameDeclarationNumber)} />
              {dlg.row.notes && <div className="col-span-2"><VPFieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
              {dlg.row.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="venison-carcass-sales" recordId={dlg.row.id as number} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div><Label>Sale Date *</Label><Input type="date" value={String(form.saleDate || "")} onChange={e => sf("saleDate", e.target.value)} /></div>
              <div>
                <Label>Species</Label>
                <Select value={String(form.species || "")} onValueChange={v => sf("species", v)}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>{DEER_SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Facility Type *</Label>
                <Select value={String(form.facilityType || "")} onValueChange={v => sf("facilityType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger>
                  <SelectContent>{FACILITY_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Number of Carcasses *</Label><Input type="number" placeholder="0" value={String(form.numberCarcasses || "")} onChange={e => sf("numberCarcasses", e.target.value)} /></div>
              <div><Label>Carcass Numbers</Label><Input placeholder="e.g. C001, C002, C003" value={String(form.carcassNumbers || "")} onChange={e => sf("carcassNumbers", e.target.value)} /></div>
              <div>
                <Label>Grade / Quality</Label>
                <Select value={String(form.gradeOrQuality || "")} onValueChange={v => sf("gradeOrQuality", v)}>
                  <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>{["A — Premium grade", "B — Standard grade", "C — Out-grade / manufacturing", "Not graded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Destination Type *</Label>
                <Select value={String(form.destinationType || "")} onValueChange={v => sf("destinationType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                  <SelectContent>{DESTINATION_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Buyer / Game Dealer Name</Label><Input placeholder="Name of buyer or game dealer" value={String(form.buyerName || "")} onChange={e => sf("buyerName", e.target.value)} /></div>
              <div><Label>Price per kg (£)</Label><Input type="number" step="0.01" placeholder="0.00" value={String(form.pricePerKgGbp || "")} onChange={e => sf("pricePerKgGbp", e.target.value)} /></div>
              <div><Label>Total Weight (kg)</Label><Input type="number" step="0.1" placeholder="0.0" value={String(form.totalWeightKg || "")} onChange={e => sf("totalWeightKg", e.target.value)} /></div>
              <div><Label>Total Value (£)</Label><Input type="number" step="0.01" placeholder="0.00" value={String(form.totalValueGbp || "")} onChange={e => sf("totalValueGbp", e.target.value)} /></div>
              <div><Label>Invoice Reference</Label><Input placeholder="Invoice number" value={String(form.invoiceReference || "")} onChange={e => sf("invoiceReference", e.target.value)} /></div>
              <div><Label>Wild Game Declaration No.</Label><Input placeholder="WGD reference number" value={String(form.wildGameDeclarationNumber || "")} onChange={e => sf("wildGameDeclarationNumber", e.target.value)} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button
                onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })}
                disabled={mutSave.isPending || !form.saleDate || !form.facilityType || !form.numberCarcasses || !form.destinationType}
              >
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

// ─── HERD MONITORING TAB ──────────────────────────────────────────────────────
function HerdMonitoringTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-monitoring", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-herd-monitoring`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herd-flock-register`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/venison-herd-monitoring${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-monitoring", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/venison-herd-monitoring/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-monitoring", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => { setDlg({ open: true, mode, row }); setForm(row); };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const monYears = useMemo(() => {
    const s = new Set<string>(records.map((r: any) => String(r.surveyDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [monYearFilter, setMonYearFilter] = useState("all");
  const filteredMon = useMemo(() => monYearFilter === "all" ? records : records.filter((r: any) => String(r.surveyDate || "").startsWith(monYearFilter)), [records, monYearFilter]);

  const printMonitoring = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Herd Monitoring</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Herd Monitoring Surveys${monYearFilter !== "all" ? ` — ${monYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Method</th><th>Species</th><th>Males</th><th>Females</th><th>Young</th><th>Total</th><th>M:F Ratio</th><th>Recruitment %</th></tr></thead><tbody>${filteredMon.map((r: any) => `<tr><td>${fmtDate(r.surveyDate)}</td><td>${fmt(r.surveyMethod)}</td><td>${fmt(r.species)}</td><td>${fmt(r.maleCount)}</td><td>${fmt(r.femaleCount)}</td><td>${fmt(r.youngCount)}</td><td>${fmt(r.totalCount)}</td><td>${fmt(r.maleFemaleRatio)}</td><td>${r.recruitmentRatePercent ? r.recruitmentRatePercent + "%" : "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-semibold">Herd Population Surveys</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={monYearFilter} onValueChange={setMonYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {monYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printMonitoring}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => open("add")}><Plus className="w-4 h-4 mr-1" />Add Survey</Button>
        </div>
      </div>
      {filteredMon.length === 0 ? (
        <VPEmptyState icon={Users} message="No monitoring surveys yet. Record your first population count or herd survey above." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Survey Date", "Method", "Species", "Males", "Females", "Young", "Total", "M:F Ratio", "Recruitment %", "", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMon.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.surveyDate)}</td>
                  <td className="py-2 px-3 text-xs">{fmt(r.surveyMethod)}</td>
                  <td className="py-2 px-3">{fmt(r.species)}</td>
                  <td className="py-2 px-3 text-center">{fmt(r.maleCount)}</td>
                  <td className="py-2 px-3 text-center">{fmt(r.femaleCount)}</td>
                  <td className="py-2 px-3 text-center">{fmt(r.youngCount)}</td>
                  <td className="py-2 px-3 text-center font-medium">{fmt(r.totalCount)}</td>
                  <td className="py-2 px-3">{fmt(r.maleFemaleRatio)}</td>
                  <td className="py-2 px-3">{r.recruitmentRatePercent ? `${r.recruitmentRatePercent}%` : "—"}</td>
                  <td className="py-2 px-3">
                    <DocAttach farmId={farmId} endpoint="venison-herd-monitoring" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["venison-monitoring", String(farmId)]} compact />
                  </td>
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
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Herd Survey" : dlg.mode === "edit" ? "Edit Survey" : "Add Herd Survey"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <VPFieldView label="Survey Date" value={fmtDate(dlg.row.surveyDate)} />
              <VPFieldView label="Survey Method" value={fmt(dlg.row.surveyMethod)} />
              <VPFieldView label="Species" value={fmt(dlg.row.species)} />
              <VPFieldView label="Male Count (stags/bucks)" value={fmt(dlg.row.maleCount)} />
              <VPFieldView label="Female Count (hinds/does)" value={fmt(dlg.row.femaleCount)} />
              <VPFieldView label="Young Count (calves/fawns)" value={fmt(dlg.row.youngCount)} />
              <VPFieldView label="Total Count" value={fmt(dlg.row.totalCount)} />
              <VPFieldView label="Male:Female Ratio" value={fmt(dlg.row.maleFemaleRatio)} />
              <VPFieldView label="Recruitment Rate %" value={dlg.row.recruitmentRatePercent ? `${dlg.row.recruitmentRatePercent}%` : "—"} />
              <VPFieldView label="Observed By" value={fmt(dlg.row.observedBy)} />
              <VPFieldView label="Weather Conditions" value={fmt(dlg.row.weatherConditions)} />
              {dlg.row.notes && <div className="col-span-2"><VPFieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
              {dlg.row.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="venison-herd-monitoring" recordId={dlg.row.id as number} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div><Label>Survey Date *</Label><Input type="date" value={String(form.surveyDate || "")} onChange={e => sf("surveyDate", e.target.value)} /></div>
              <div>
                <Label>Species</Label>
                <Select value={String(form.species || "")} onValueChange={v => sf("species", v)}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>{DEER_SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Survey Method *</Label>
                <Select value={String(form.surveyMethod || "")} onValueChange={v => sf("surveyMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>{SURVEY_METHODS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Herd (optional)</Label>
                <Select value={String(form.herdId || "")} onValueChange={v => sf("herdId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select herd" /></SelectTrigger>
                  <SelectContent>{herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Observed By</Label><Input placeholder="Name of observer" value={String(form.observedBy || "")} onChange={e => sf("observedBy", e.target.value)} /></div>
              <div><Label>Male Count (stags/bucks)</Label><Input type="number" placeholder="0" value={String(form.maleCount || "")} onChange={e => sf("maleCount", e.target.value)} /></div>
              <div><Label>Female Count (hinds/does)</Label><Input type="number" placeholder="0" value={String(form.femaleCount || "")} onChange={e => sf("femaleCount", e.target.value)} /></div>
              <div><Label>Young Count (calves/fawns)</Label><Input type="number" placeholder="0" value={String(form.youngCount || "")} onChange={e => sf("youngCount", e.target.value)} /></div>
              <div><Label>Total Count</Label><Input type="number" placeholder="0" value={String(form.totalCount || "")} onChange={e => sf("totalCount", e.target.value)} /></div>
              <div><Label>Male:Female Ratio</Label><Input placeholder="e.g. 1:3.5" value={String(form.maleFemaleRatio || "")} onChange={e => sf("maleFemaleRatio", e.target.value)} /></div>
              <div><Label>Recruitment Rate %</Label><Input type="number" step="0.1" placeholder="0.0" value={String(form.recruitmentRatePercent || "")} onChange={e => sf("recruitmentRatePercent", e.target.value)} /></div>
              <div className="col-span-2"><Label>Weather Conditions</Label><Input placeholder="e.g. Clear, light wind, good visibility" value={String(form.weatherConditions || "")} onChange={e => sf("weatherConditions", e.target.value)} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })} disabled={mutSave.isPending || !form.surveyDate || !form.surveyMethod}>
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

// ─── HEALTH RECORDS TAB ───────────────────────────────────────────────────────
function HealthRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-health", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-health-records`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herd-flock-register`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/venison-health-records${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-health", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/venison-health-records/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-health", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => { setDlg({ open: true, mode, row }); setForm(row); };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const hrYears = useMemo(() => {
    const s = new Set<string>(records.map((r: any) => String(r.eventDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [hrYearFilter, setHrYearFilter] = useState("all");
  const filteredHr = useMemo(() => hrYearFilter === "all" ? records : records.filter((r: any) => String(r.eventDate || "").startsWith(hrYearFilter)), [records, hrYearFilter]);

  const printHealthRecords = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Health Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Health Records${hrYearFilter !== "all" ? ` — ${hrYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Event Type</th><th>Product / Description</th><th>No. Treated</th><th>Withdrawal (days)</th><th>bTB Result</th><th>APHA Ref</th></tr></thead><tbody>${filteredHr.map((r: any) => `<tr><td>${fmtDate(r.eventDate)}</td><td>${fmt(r.healthEventType)}</td><td>${fmt(r.productOrDescription)}</td><td>${fmt(r.numberTreated)}</td><td>${r.withdrawalPeriodDays ? r.withdrawalPeriodDays + "d" : "—"}</td><td>${fmt(r.btbTestResult)}</td><td>${fmt(r.aphaReference)}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-semibold">Health Records</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={hrYearFilter} onValueChange={setHrYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {hrYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printHealthRecords}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => open("add")}><Plus className="w-4 h-4 mr-1" />Add Health Record</Button>
        </div>
      </div>
      {filteredHr.length === 0 ? (
        <VPEmptyState icon={HeartPulse} message="No health records yet. Add vaccination, bTB test, or vet visit records above." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Date", "Event Type", "Product / Description", "No. Treated", "Withdrawal", "bTB Result", "APHA Ref", "", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHr.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.eventDate)}</td>
                  <td className="py-2 px-3">{fmt(r.healthEventType)}</td>
                  <td className="py-2 px-3">{fmt(r.productOrDescription)}</td>
                  <td className="py-2 px-3 text-center">{fmt(r.numberTreated)}</td>
                  <td className="py-2 px-3 text-center">
                    {r.withdrawalPeriodDays
                      ? <span className={Number(r.withdrawalPeriodDays) > 0 ? "text-amber-700 font-medium" : ""}>{r.withdrawalPeriodDays}d</span>
                      : "—"}
                  </td>
                  <td className="py-2 px-3">
                    {r.btbTestResult && r.btbTestResult !== "Not applicable" ? (
                      <Badge variant="outline" className={`text-xs ${String(r.btbTestResult).includes("Clear") ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                        {r.btbTestResult}
                      </Badge>
                    ) : "—"}
                  </td>
                  <td className="py-2 px-3 text-xs">{fmt(r.aphaReference)}</td>
                  <td className="py-2 px-3">
                    <DocAttach farmId={farmId} endpoint="venison-health-records" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["venison-health", String(farmId)]} compact />
                  </td>
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
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Health Record" : dlg.mode === "edit" ? "Edit Health Record" : "Add Health Record"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <VPFieldView label="Event Date" value={fmtDate(dlg.row.eventDate)} />
              <VPFieldView label="Event Type" value={fmt(dlg.row.healthEventType)} />
              <VPFieldView label="Product / Description" value={fmt(dlg.row.productOrDescription)} />
              <VPFieldView label="Batch Number" value={fmt(dlg.row.batchNumber)} />
              <VPFieldView label="Number Treated" value={fmt(dlg.row.numberTreated)} />
              <VPFieldView label="Withdrawal Period (days)" value={dlg.row.withdrawalPeriodDays ? `${dlg.row.withdrawalPeriodDays} days` : "—"} />
              <VPFieldView label="bTB Test Result" value={fmt(dlg.row.btbTestResult)} />
              <VPFieldView label="APHA Reference" value={fmt(dlg.row.aphaReference)} />
              <VPFieldView label="Vet Name" value={fmt(dlg.row.vetName)} />
              <VPFieldView label="Vet Prescribed" value={dlg.row.vetPrescribed ? "Yes (POM-V)" : "No"} />
              <VPFieldView label="Notifiable Disease Suspect" value={dlg.row.notifiableDiseaseSupect ? "Yes — APHA notified" : "No"} />
              {dlg.row.notes && <div className="col-span-2"><VPFieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
              {dlg.row.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="venison-health-records" recordId={dlg.row.id as number} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div><Label>Event Date *</Label><Input type="date" value={String(form.eventDate || "")} onChange={e => sf("eventDate", e.target.value)} /></div>
              <div>
                <Label>Health Event Type *</Label>
                <Select value={String(form.healthEventType || "")} onValueChange={v => sf("healthEventType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{HEALTH_EVENT_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Herd (optional)</Label>
                <Select value={String(form.herdId || "")} onValueChange={v => sf("herdId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select herd" /></SelectTrigger>
                  <SelectContent>{herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Product / Description</Label><Input placeholder="Vaccine, drug, or description" value={String(form.productOrDescription || "")} onChange={e => sf("productOrDescription", e.target.value)} /></div>
              <div><Label>Batch Number</Label><Input placeholder="Batch / lot number" value={String(form.batchNumber || "")} onChange={e => sf("batchNumber", e.target.value)} /></div>
              <div><Label>Number Treated</Label><Input type="number" placeholder="0" value={String(form.numberTreated || "")} onChange={e => sf("numberTreated", e.target.value)} /></div>
              <div><Label>Withdrawal Period (days)</Label><Input type="number" placeholder="0" value={String(form.withdrawalPeriodDays || "")} onChange={e => sf("withdrawalPeriodDays", e.target.value)} /></div>
              <div>
                <Label>bTB Test Result</Label>
                <Select value={String(form.btbTestResult || "")} onValueChange={v => sf("btbTestResult", v)}>
                  <SelectTrigger><SelectValue placeholder="Select result (if applicable)" /></SelectTrigger>
                  <SelectContent>{BTB_RESULTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>APHA Reference</Label><Input placeholder="APHA case / test reference" value={String(form.aphaReference || "")} onChange={e => sf("aphaReference", e.target.value)} /></div>
              <div><Label>Vet Name</Label><Input placeholder="Vet or prescribing vet name" value={String(form.vetName || "")} onChange={e => sf("vetName", e.target.value)} /></div>
              <div className="flex items-center gap-2 mt-5">
                <Checkbox checked={Boolean(form.vetPrescribed)} onCheckedChange={v => sf("vetPrescribed", v)} id="vet-presc" />
                <Label htmlFor="vet-presc">Vet prescribed (POM-V)</Label>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox checked={Boolean(form.notifiableDiseaseSupect)} onCheckedChange={v => sf("notifiableDiseaseSupect", v)} id="nd-health" />
                <Label htmlFor="nd-health">Notifiable disease suspected — contact APHA on 03000 200 301</Label>
              </div>
              {form.notifiableDiseaseSupect && (
                <div className="col-span-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  <AlertTriangle className="inline w-4 h-4 mr-1" />
                  <strong>APHA Advisory:</strong> Contact APHA immediately on <strong>03000 200 301</strong>. Mandatory notification must be made before laboratory confirmation.
                </div>
              )}
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })} disabled={mutSave.isPending || !form.eventDate || !form.healthEventType}>
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

// ─── FIREARMS REGISTER TAB ────────────────────────────────────────────────────
function FirearmsRegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<{ open: boolean; mode: "add" | "edit" | "view"; row: Record<string, unknown> }>({ open: false, mode: "add", row: {} });
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [yearFilter, setYearFilter] = useState("all");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-firearms", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-firearms-register`), { credentials: "include" }).then(r => r.json()),
  });

  const mutSave = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/venison-firearms-register${data.id ? `/${data.id}` : ""}`), {
        method: data.id ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-firearms", farmId] }); setDlg({ open: false, mode: "add", row: {} }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });
  const mutDel = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/venison-firearms-register/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["venison-firearms", farmId] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const open = (mode: "add" | "edit" | "view", row: Record<string, unknown> = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { status: "active" } : row);
  };
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const fireYears = useMemo(() => Array.from(new Set((records as any[]).map((r: any) => String(r.issueDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredFirearms = useMemo(() => yearFilter === "all" ? records as any[] : (records as any[]).filter((r: any) => String(r.issueDate ?? "").startsWith(yearFilter)), [records, yearFilter]);

  function printFirearms() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredFirearms.map((r: any) => `<tr><td>${String(r.holderName ?? "—")}</td><td>${String(r.certificateType ?? "—")}</td><td>${String(r.certificateNumber ?? "—")}</td><td>${String(r.issuingAuthority ?? "—")}</td><td>${fmtD(r.issueDate)}</td><td>${fmtD(r.expiryDate)}</td><td>${String(r.calibreOrDescription ?? "—")}</td><td>${String(r.status ?? "—")}</td></tr>`).join("");
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Firearms &amp; Stalking Certificates</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Firearms &amp; Stalking Certificates${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>${filteredFirearms.length} certificate${filteredFirearms.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Holder Name</th><th>Certificate Type</th><th>Cert. No.</th><th>Issuing Authority</th><th>Issue Date</th><th>Expiry Date</th><th>Calibre / Desc.</th><th>Status</th></tr></thead><tbody>${trs}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  }

  const today = new Date().toISOString().split("T")[0];
  const expiringSoon = records.filter((r: any) => r.expiryDate && r.expiryDate > today && r.expiryDate <= new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]).length;
  const expired = records.filter((r: any) => r.expiryDate && r.expiryDate < today && r.status === "active").length;

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="space-y-4">
      {(expiringSoon > 0 || expired > 0) && (
        <div className={`rounded-lg border p-3 text-sm ${expired > 0 ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
          <AlertTriangle className="inline w-4 h-4 mr-1" />
          {expired > 0 && <span><strong>{expired}</strong> certificate{expired > 1 ? "s" : ""} expired. </span>}
          {expiringSoon > 0 && <span><strong>{expiringSoon}</strong> certificate{expiringSoon > 1 ? "s" : ""} expiring within 90 days. </span>}
          Ensure all stalkers hold current, valid certificates before entering the field.
        </div>
      )}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        <ShieldCheck className="inline w-4 h-4 mr-1" />
        <strong>Legal requirement:</strong> All deer stalkers must hold a valid <strong>Section 1 Firearms Certificate (FC)</strong> for the calibre used. Commercial venison supply requires <strong>DSC2</strong> or equivalent and a <strong>Hunter Food Hygiene Certificate (WGMI)</strong>. FCs are renewed every 5 years by the local police authority.
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Firearms &amp; Stalking Certificates</span>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{fireYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filteredFirearms.length > 0 && <Button size="sm" variant="outline" onClick={printFirearms}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => open("add")}><Plus className="w-3.5 h-3.5 mr-1" />Add Certificate</Button>
        </div>
      </div>
      {filteredFirearms.length === 0 ? (
        <VPEmptyState icon={ShieldCheck} message="No certificates registered yet. Add firearms certificates and stalking qualifications for all stalkers above." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Holder Name", "Certificate Type", "Cert. No.", "Issuing Authority", "Issue Date", "Expiry Date", "Calibre / Description", "Status", "Doc", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFirearms.map((r: any) => {
                const isExpired = r.expiryDate && r.expiryDate < today;
                const isExpiringSoon = r.expiryDate && !isExpired && r.expiryDate <= new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0];
                return (
                  <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="py-2 px-3 font-medium">{fmt(r.holderName)}</td>
                    <td className="py-2 px-3 text-xs">{fmt(r.certificateType)}</td>
                    <td className="py-2 px-3">{fmt(r.certificateNumber)}</td>
                    <td className="py-2 px-3 text-xs">{fmt(r.issuingAuthority)}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{fmtDate(r.issueDate)}</td>
                    <td className={`py-2 px-3 whitespace-nowrap ${isExpired ? "text-red-700 font-bold" : isExpiringSoon ? "text-amber-700 font-medium" : ""}`}>
                      {fmtDate(r.expiryDate)}{isExpired ? " ⚠" : isExpiringSoon ? " ⏳" : ""}
                    </td>
                    <td className="py-2 px-3 text-xs">{fmt(r.calibreOrDescription)}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className={`text-xs ${isExpired ? "bg-red-100 text-red-800 border-red-200" : r.status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {isExpired ? "Expired" : fmt(r.status)}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <DocAttach farmId={farmId} endpoint="venison-firearms-register" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["venison-firearms", String(farmId)]} compact />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("view", r)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open("edit", r)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => mutDel.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={dlg.open} onOpenChange={o => !o && setDlg({ open: false, mode: "add", row: {} })}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dlg.mode === "view" ? "Certificate Record" : dlg.mode === "edit" ? "Edit Certificate" : "Add Certificate"}</DialogTitle></DialogHeader>
          {dlg.mode === "view" ? (
            <div className="grid grid-cols-2 gap-4 py-2">
              <VPFieldView label="Holder Name" value={fmt(dlg.row.holderName)} />
              <VPFieldView label="Certificate Type" value={fmt(dlg.row.certificateType)} />
              <VPFieldView label="Certificate Number" value={fmt(dlg.row.certificateNumber)} />
              <VPFieldView label="Issuing Authority" value={fmt(dlg.row.issuingAuthority)} />
              <VPFieldView label="Issue Date" value={fmtDate(dlg.row.issueDate)} />
              <VPFieldView label="Expiry Date" value={fmtDate(dlg.row.expiryDate)} />
              <VPFieldView label="Calibre / Description" value={fmt(dlg.row.calibreOrDescription)} />
              <VPFieldView label="Status" value={fmt(dlg.row.status)} />
              {dlg.row.notes && <div className="col-span-2"><VPFieldView label="Notes" value={fmt(dlg.row.notes)} /></div>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-2">
              <div><Label>Holder Name *</Label><Input placeholder="Full name of certificate holder" value={String(form.holderName || "")} onChange={e => sf("holderName", e.target.value)} /></div>
              <div>
                <Label>Status</Label>
                <Select value={String(form.status || "active")} onValueChange={v => sf("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["active", "expired", "surrendered"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Certificate Type *</Label>
                <Select value={String(form.certificateType || "")} onValueChange={v => sf("certificateType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{CERT_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Certificate Number</Label><Input placeholder="Certificate / registration number" value={String(form.certificateNumber || "")} onChange={e => sf("certificateNumber", e.target.value)} /></div>
              <div><Label>Issuing Authority</Label><Input placeholder="e.g. Northumbria Police, DSC Ltd" value={String(form.issuingAuthority || "")} onChange={e => sf("issuingAuthority", e.target.value)} /></div>
              <div><Label>Issue Date</Label><Input type="date" value={String(form.issueDate || "")} onChange={e => sf("issueDate", e.target.value)} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={String(form.expiryDate || "")} onChange={e => sf("expiryDate", e.target.value)} /></div>
              <div className="col-span-2"><Label>Calibre / Description</Label><Input placeholder="e.g. .243 Win, .308 Win; or certificate scope notes" value={String(form.calibreOrDescription || "")} onChange={e => sf("calibreOrDescription", e.target.value)} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={String(form.notes || "")} onChange={e => sf("notes", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            {dlg.mode !== "view" && (
              <Button onClick={() => mutSave.mutate({ ...form, id: dlg.row.id })} disabled={mutSave.isPending || !form.holderName || !form.certificateType}>
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

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
function VenisonAnalyticsTab({ farmId }: { farmId: number }) {
  const { data: cull = [] } = useQuery({ queryKey: ["venison-cull", farmId], queryFn: () => fetch(api(`farms/${farmId}/venison-cull-records`), { credentials: "include" }).then(r => r.json()) });
  const { data: sales = [] } = useQuery({ queryKey: ["venison-sales", farmId], queryFn: () => fetch(api(`farms/${farmId}/venison-carcass-sales`), { credentials: "include" }).then(r => r.json()) });
  const { data: monitoring = [] } = useQuery({ queryKey: ["venison-monitoring", farmId], queryFn: () => fetch(api(`farms/${farmId}/venison-herd-monitoring`), { credentials: "include" }).then(r => r.json()) });

  const speciesData = useMemo(() => {
    const counts: Record<string, number> = {};
    cull.forEach((r: any) => { if (r.species) counts[r.species] = (counts[r.species] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [cull]);

  const cullByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    cull.forEach((r: any) => {
      if (r.cullDate) {
        const m = String(r.cullDate).slice(0, 7);
        months[m] = (months[m] || 0) + 1;
      }
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([name, value]) => ({
      name: name.slice(5) + "/" + name.slice(2, 4), value,
    }));
  }, [cull]);

  const totalCarcassKg = useMemo(() => cull.reduce((s: number, r: any) => s + (Number(r.carcassWeightKg) || 0), 0), [cull]);
  const totalSalesValue = useMemo(() => sales.reduce((s: number, r: any) => s + (Number(r.totalValueGbp) || 0), 0), [sales]);
  const avgMonitoringCount = useMemo(() => {
    const valid = monitoring.filter((r: any) => r.totalCount);
    return valid.length ? Math.round(valid.reduce((s: number, r: any) => s + Number(r.totalCount), 0) / valid.length) : null;
  }, [monitoring]);

  if (cull.length === 0 && sales.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No data yet</p>
        <p className="text-xs mt-1">Add cull records and carcass sales to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <VPKpiCard label="Total Culls" value={cull.length} bg="bg-green-50 border-green-100" text="text-green-800" sub="text-green-700" />
        <VPKpiCard label="Total Carcass Wt (kg)" value={totalCarcassKg > 0 ? `${totalCarcassKg.toFixed(1)} kg` : "—"} bg="bg-amber-50 border-amber-100" text="text-amber-800" sub="text-amber-700" />
        <VPKpiCard label="Total Sales Value" value={totalSalesValue > 0 ? fmtGbp(totalSalesValue) : "—"} bg="bg-blue-50 border-blue-100" text="text-blue-800" sub="text-blue-700" />
        <VPKpiCard label="Avg Herd Count" value={avgMonitoringCount ?? "—"} bg="bg-purple-50 border-purple-100" text="text-purple-800" sub="text-purple-700" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {speciesData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Cull by Species</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={speciesData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {speciesData.map((_: any, i: number) => <Cell key={i} fill={VEN_COLORS[i % VEN_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} culls`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {cullByMonth.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Monthly Cull Trend (last 12 months)</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cullByMonth} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v} culls`, "Culls"]} />
                  <Bar dataKey="value" fill="#15803d" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {sales.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-3">Venison Sales Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold">{sales.length}</p><p className="text-xs text-muted-foreground">Sale Records</p></div>
            <div><p className="text-2xl font-bold">{sales.reduce((s: number, r: any) => s + (Number(r.numberCarcasses) || 0), 0)}</p><p className="text-xs text-muted-foreground">Total Carcasses</p></div>
            <div><p className="text-2xl font-bold">{totalSalesValue > 0 ? fmtGbp(totalSalesValue) : "—"}</p><p className="text-xs text-muted-foreground">Total Value</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function VenisonProductionPage() {
  const { selectedFarm } = useAppStore();
  const farmId = selectedFarm?.id;
  const [tab, setTab] = useState<"herds" | "cull" | "sales" | "monitoring" | "health" | "firearms" | "analytics" | "enterprise">("herds");

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
          <h1 className="text-2xl font-bold">Venison Production</h1>
          <p className="text-sm text-muted-foreground mt-1">Stalking & cull records, carcass processing & sales, herd monitoring, health records, and firearms register</p>
        </div>
        <VPTabBar>
          <VPTabButton active={tab === "herds"} onClick={() => setTab("herds")}>Herds</VPTabButton>
          <VPTabButton active={tab === "cull"} onClick={() => setTab("cull")}><Crosshair className="w-3.5 h-3.5" />Cull Records</VPTabButton>
          <VPTabButton active={tab === "sales"} onClick={() => setTab("sales")}><ShoppingCart className="w-3.5 h-3.5" />Carcass Sales</VPTabButton>
          <VPTabButton active={tab === "monitoring"} onClick={() => setTab("monitoring")}><Users className="w-3.5 h-3.5" />Herd Monitoring</VPTabButton>
          <VPTabButton active={tab === "health"} onClick={() => setTab("health")}><HeartPulse className="w-3.5 h-3.5" />Health</VPTabButton>
          <VPTabButton active={tab === "firearms"} onClick={() => setTab("firearms")}><ShieldCheck className="w-3.5 h-3.5" />Firearms & Licences</VPTabButton>
          <VPTabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><BarChart3 className="w-3.5 h-3.5" />Analytics</VPTabButton>
          <VPTabButton active={tab === "enterprise"} onClick={() => setTab("enterprise")}><BarChart3 className="w-3.5 h-3.5" />Enterprise Report</VPTabButton>
        </VPTabBar>
        <div className="rounded-md border p-4 bg-card">
          {tab === "herds" && <HerdsTab farmId={farmId} />}
          {tab === "cull" && <CullRecordsTab farmId={farmId} />}
          {tab === "sales" && <CarcassSalesTab farmId={farmId} />}
          {tab === "monitoring" && <HerdMonitoringTab farmId={farmId} />}
          {tab === "health" && <HealthRecordsTab farmId={farmId} />}
          {tab === "firearms" && <FirearmsRegisterTab farmId={farmId} />}
          {tab === "analytics" && <VenisonAnalyticsTab farmId={farmId} />}
          {tab === "enterprise" && <VenisonEnterpriseReport farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}
