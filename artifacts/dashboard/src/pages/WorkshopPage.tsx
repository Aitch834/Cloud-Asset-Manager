import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Plus, QrCode, Printer, Wrench, AlertTriangle, Clock, CheckCircle2, XCircle, Loader2, Pencil, Trash2, ChevronDown, Zap, Flame, ShieldAlert, FlaskConical, Paperclip, File as FileIcon, Package, ArrowDownToLine, ArrowUpFromLine, History, TriangleAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Redirect } from "wouter";
import { cn } from "@/lib/utils";

const api = (path: string) => `/api/${path}`;

function assetNumber(equip: { id: number; assetNumber?: string | null }) {
  return equip.assetNumber || `EQ-${String(equip.id).padStart(4, "0")}`;
}

// ─── Status / priority helpers ─────────────────────────────────────────────────

const JOB_STATUS: Record<string, { label: string; colour: string }> = {
  open:            { label: "Open",            colour: "bg-blue-100 text-blue-700" },
  "in-progress":   { label: "In Progress",     colour: "bg-amber-100 text-amber-700" },
  "awaiting-parts":{ label: "Awaiting Parts",  colour: "bg-purple-100 text-purple-700" },
  completed:       { label: "Completed",       colour: "bg-green-100 text-green-700" },
  cancelled:       { label: "Cancelled",       colour: "bg-gray-100 text-gray-500" },
};

const PRIORITY: Record<string, { label: string; colour: string }> = {
  low:      { label: "Low",      colour: "bg-gray-100 text-gray-600" },
  medium:   { label: "Medium",   colour: "bg-amber-100 text-amber-700" },
  high:     { label: "High",     colour: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", colour: "bg-red-100 text-red-700" },
};

const EQUIP_STATUS: Record<string, { label: string; colour: string }> = {
  active:        { label: "Operational",    colour: "bg-green-100 text-green-700" },
  broken:        { label: "Broken Down",    colour: "bg-red-100 text-red-700" },
  "in-service":  { label: "In Service",     colour: "bg-amber-100 text-amber-700" },
  retired:       { label: "Retired",        colour: "bg-gray-100 text-gray-500" },
  sold:          { label: "Sold",           colour: "bg-gray-100 text-gray-500" },
};

function StatusBadge({ value, map }: { value: string; map: Record<string, { label: string; colour: string }> }) {
  const s = map[value] ?? { label: value, colour: "bg-gray-100 text-gray-600" };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", s.colour)}>{s.label}</span>;
}

// ─── QR Label dialog ───────────────────────────────────────────────────────────

function QRDialog({ equip, onClose }: { equip: { id: number; assetNumber?: string | null; name: string; make?: string | null; model?: string | null }; onClose: () => void }) {
  const an = assetNumber(equip);
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win || !printRef.current) return;
    win.document.write(`<html><head><title>Asset Label — ${an}</title>
      <style>body{font-family:sans-serif;padding:24px;text-align:center}
        h2{font-size:18px;margin:8px 0}p{font-size:13px;color:#555;margin:4px 0}
        svg{display:block;margin:0 auto}</style></head>
      <body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>Asset QR Label</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2" ref={printRef}>
          <QRCodeSVG value={an} size={200} />
          <p className="text-2xl font-bold tracking-widest">{an}</p>
          <p className="text-sm text-gray-600 font-medium">{equip.name}</p>
          {(equip.make || equip.model) && <p className="text-xs text-gray-400">{[equip.make, equip.model].filter(Boolean).join(" ")}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-1" />Print Label</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assets tab ────────────────────────────────────────────────────────────────

interface Equipment {
  id: number;
  farmId: number;
  assetNumber: string | null;
  name: string;
  type: string;
  make: string | null;
  model: string | null;
  serialNumber: string | null;
  registrationNumber: string | null;
  yearOfManufacture: number | null;
  currentHours: number | null;
  odometerKm: number | null;
  status: string;
  location: string | null;
  isActive: boolean;
}

function AssetsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [qrEquip, setQrEquip] = useState<Equipment | null>(null);

  const { data, isLoading } = useQuery<{ records: Equipment[] }>({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then(r => r.json()),
  });

  const assignNumber = useMutation({
    mutationFn: async (equip: Equipment) => {
      const an = `EQ-${String(equip.id).padStart(4, "0")}`;
      await fetch(api(`farms/${farmId}/equipment/${equip.id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...equip, assetNumber: an }),
      });
      return an;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipment", farmId] }),
  });

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  const equipment = data?.records ?? [];

  return (
    <div>
      {qrEquip && <QRDialog equip={qrEquip} onClose={() => setQrEquip(null)} />}
      {equipment.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No equipment registered. Add equipment on the Equipment page first.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Asset No.</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Make / Model</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Hours</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">QR</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {equipment.map(eq => (
                <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {eq.assetNumber ? (
                      <span className="font-mono font-semibold text-primary">{eq.assetNumber}</span>
                    ) : (
                      <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                        onClick={() => assignNumber.mutate(eq)} disabled={assignNumber.isPending}>
                        Generate
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{eq.name}</td>
                  <td className="px-4 py-3 text-gray-500">{eq.type}</td>
                  <td className="px-4 py-3 text-gray-500">{[eq.make, eq.model].filter(Boolean).join(" ") || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge value={eq.status} map={EQUIP_STATUS} /></td>
                  <td className="px-4 py-3 text-gray-500">{eq.currentHours != null ? `${eq.currentHours} hrs` : "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{eq.location || "—"}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setQrEquip(eq)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Job Cards tab ─────────────────────────────────────────────────────────────

interface WorkshopJob {
  job: {
    id: number; farmId: number; equipmentId: number | null; jobNumber: string;
    jobType: string; title: string; description: string | null; priority: string; status: string;
    reportedBy: string | null; assignedTo: string | null; openedAt: string;
    estimatedCompletionDate: string | null; completedAt: string | null;
    labourHours: number | null; labourCostPence: number | null; partsCostPence: number | null;
    partsUsed: string | null; rootCause: string | null; notes: string | null;
  };
  equipmentName: string | null;
  assetNumber: string | null;
}

const EMPTY_JOB = { jobType: "repair", title: "", priority: "medium", status: "open" };

function JobCardsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkshopJob["job"] | null>(null);
  const [form, setForm] = useState<Partial<WorkshopJob["job"]>>(EMPTY_JOB);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [issuePartId, setIssuePartId] = useState("");
  const [issueQty, setIssueQty] = useState("");
  const [issueBy, setIssueBy] = useState("");

  const { data: equipData } = useQuery<{ records: Equipment[] }>({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then(r => r.json()),
  });

  const { data, isLoading } = useQuery<{ jobs: WorkshopJob[] }>({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: workshopParts = [] } = useQuery<Part[]>({
    queryKey: ["workshop-parts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/parts`), { credentials: "include" }).then(r => r.json()),
    enabled: open && !!editing,
  });

  const issuePartsToJob = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/workshop/parts/use`), {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockItemId: parseInt(issuePartId), quantity: parseFloat(issueQty), jobId: editing?.id, performedBy: issueBy }),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      // Refresh the editing job's partsCostPence
      const updatedJob = data?.jobs.find(j => j.job.id === editing?.id);
      if (updatedJob) setTimeout(() => qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }), 300);
      setIssuePartId(""); setIssueQty(""); setIssueBy("");
    },
  });

  const save = useMutation({
    mutationFn: async (body: Partial<WorkshopJob["job"]>) => {
      const url = editing
        ? api(`farms/${farmId}/workshop/jobs/${editing.id}`)
        : api(`farms/${farmId}/workshop/jobs`);
      const method = editing ? "PUT" : "POST";
      await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }); setOpen(false); setEditing(null); setForm(EMPTY_JOB); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/jobs/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }),
  });

  function openAdd() { setEditing(null); setForm(EMPTY_JOB); setOpen(true); }
  function openEdit(j: WorkshopJob["job"]) {
    setEditing(j);
    setForm({ ...j, openedAt: j.openedAt?.slice(0, 10), estimatedCompletionDate: j.estimatedCompletionDate?.slice(0, 10), completedAt: j.completedAt?.slice(0, 10) });
    setOpen(true);
  }
  function set(k: keyof WorkshopJob["job"], v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const equipment = equipData?.records ?? [];
  const allJobs = data?.jobs ?? [];
  const filtered = statusFilter === "all" ? allJobs : allJobs.filter(j => j.job.status === statusFilter);

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", "open", "in-progress", "awaiting-parts", "completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
              {s === "all" ? "All Jobs" : JOB_STATUS[s]?.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />New Job</Button>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No job cards found. Log a repair or service with "New Job".</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ job, equipmentName, assetNumber: an }) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-gray-400">{job.jobNumber}</p>
                    <CardTitle className="text-sm mt-0.5 leading-snug">{job.title}</CardTitle>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(job)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => del.mutate(job.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {equipmentName && <p className="text-xs text-gray-500">{an ? `${an} — ` : ""}{equipmentName}</p>}
                {job.description && <p className="text-xs text-gray-600 line-clamp-2">{job.description}</p>}
                <div className="flex gap-2 flex-wrap pt-1">
                  <StatusBadge value={job.status} map={JOB_STATUS} />
                  <StatusBadge value={job.priority} map={PRIORITY} />
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 capitalize">{job.jobType}</span>
                </div>
                {job.assignedTo && <p className="text-xs text-gray-400">Assigned: {job.assignedTo}</p>}
                {job.estimatedCompletionDate && (
                  <p className="text-xs text-gray-400">Due: {new Date(job.estimatedCompletionDate).toLocaleDateString("en-GB")}</p>
                )}
                {job.labourHours != null && <p className="text-xs text-gray-400">Labour: {job.labourHours} hrs</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "58rem" }}>
          <DialogHeader><DialogTitle>{editing ? `Edit ${editing.jobNumber}` : "New Job Card"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div><Label>Job Title *</Label><Input value={form.title || ""} onChange={e => set("title", e.target.value)} placeholder="e.g. Replace front tyre — JD 6175R" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Job Type</Label>
                  <Select value={form.jobType || "repair"} onValueChange={v => set("jobType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="service">Scheduled Service</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="commissioning">Commissioning</SelectItem>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="modification">Modification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority || "medium"} onValueChange={v => set("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Equipment</Label>
                <Select value={form.equipmentId ? String(form.equipmentId) : ""} onValueChange={v => set("equipmentId", v ? parseInt(v) : null)}>
                  <SelectTrigger><SelectValue placeholder="Select equipment..." /></SelectTrigger>
                  <SelectContent>
                    {equipment.map(eq => <SelectItem key={eq.id} value={String(eq.id)}>{assetNumber(eq)} — {eq.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} placeholder="Describe the fault or work required" /></div>
              <div><Label>Root Cause</Label><Input value={form.rootCause || ""} onChange={e => set("rootCause", e.target.value)} placeholder="e.g. Impact damage, normal wear, operator error" /></div>
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status || "open"} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(JOB_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Reported By</Label><Input value={form.reportedBy || ""} onChange={e => set("reportedBy", e.target.value)} /></div>
                <div><Label>Assigned To</Label><Input value={form.assignedTo || ""} onChange={e => set("assignedTo", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Opened Date</Label><Input type="date" value={form.openedAt?.slice(0, 10) || ""} onChange={e => set("openedAt", e.target.value)} /></div>
                <div><Label>Est. Completion</Label><Input type="date" value={form.estimatedCompletionDate || ""} onChange={e => set("estimatedCompletionDate", e.target.value)} /></div>
              </div>
              {(form.status === "completed" || form.status === "cancelled") && (
                <div><Label>Completed Date</Label><Input type="date" value={form.completedAt || ""} onChange={e => set("completedAt", e.target.value)} /></div>
              )}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Labour Hours</Label><Input type="number" step="0.5" value={form.labourHours ?? ""} onChange={e => set("labourHours", e.target.value ? parseFloat(e.target.value) : null)} /></div>
                  <div><Label>Labour Cost (£)</Label><Input type="number" step="0.01" value={form.labourCostPence != null ? form.labourCostPence / 100 : ""} onChange={e => set("labourCostPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
                  <div className="col-span-2"><Label>Parts Cost (£)</Label><Input type="number" step="0.01" value={form.partsCostPence != null ? form.partsCostPence / 100 : ""} onChange={e => set("partsCostPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
                </div>
              </div>
              {editing && workshopParts.length > 0 && (
                <div className="rounded-md border border-blue-100 bg-blue-50/50 p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1"><Package className="h-3.5 w-3.5" />Issue Parts from Store</p>
                  <div className="grid grid-cols-[1fr_80px_auto] gap-2 items-end">
                    <div>
                      <Select value={issuePartId} onValueChange={setIssuePartId}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select part…" /></SelectTrigger>
                        <SelectContent>
                          {workshopParts.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} — {parseFloat(p.currentQuantity)} {p.unit ?? ""} in stock
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Input className="h-8 text-xs" type="number" step="0.01" min="0.01" value={issueQty} onChange={e => setIssueQty(e.target.value)} placeholder="Qty" />
                    </div>
                    <Button size="sm" className="h-8 text-xs" onClick={() => issuePartsToJob.mutate()} disabled={!issuePartId || !issueQty || issuePartsToJob.isPending}>
                      {issuePartsToJob.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><ArrowUpFromLine className="h-3.5 w-3.5 mr-1" />Issue</>}
                    </Button>
                  </div>
                  <Input className="h-7 text-xs" value={issueBy} onChange={e => setIssueBy(e.target.value)} placeholder="Issued by (optional)" />
                  {editing.partsCostPence != null && editing.partsCostPence > 0 && (
                    <p className="text-xs text-blue-600">Parts cost accumulated: <strong>£{(editing.partsCostPence / 100).toFixed(2)}</strong></p>
                  )}
                </div>
              )}
              <div><Label>Additional Parts Notes</Label><Textarea value={form.partsUsed || ""} onChange={e => set("partsUsed", e.target.value)} rows={2} placeholder="e.g. Sourced externally — front tyre 480/70 R30 x1" /></div>
              <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.title}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Create Job Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Service Schedule tab ──────────────────────────────────────────────────────

interface ServiceEntry {
  log: {
    id: number; equipmentId: number; maintenanceType: string; description: string;
    performedBy: string | null; performedDate: string; nextDueDate: string | null;
    costPence: number | null; partsUsed: string | null; notes: string | null;
  };
  equipmentName: string;
  assetNumber: string | null;
  equipmentType: string;
}

function ServiceScheduleTab({ farmId }: { farmId: number }) {
  const { data, isLoading } = useQuery<{ services: ServiceEntry[] }>({
    queryKey: ["workshop-schedule", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/schedule`), { credentials: "include" }).then(r => r.json()),
  });

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  const today = new Date();
  const services = data?.services ?? [];

  function dueStatus(dateStr: string) {
    const d = new Date(dateStr);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return { label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""}`, colour: "bg-red-100 text-red-700", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> };
    if (diff <= 14) return { label: `Due in ${diff} day${diff !== 1 ? "s" : ""}`, colour: "bg-amber-100 text-amber-700", icon: <Clock className="h-4 w-4 text-amber-500" /> };
    return { label: `Due ${d.toLocaleDateString("en-GB")}`, colour: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> };
  }

  if (services.length === 0) {
    return <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No upcoming service dates found. Add a "Next Due Date" to maintenance records on the Equipment page to populate this schedule.</CardContent></Card>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Upcoming and overdue service items across all registered equipment. Add maintenance records with a "Next Due Date" on the Equipment page.</p>
      {services.map(({ log, equipmentName, assetNumber: an, equipmentType }) => {
        const due = dueStatus(log.nextDueDate!);
        return (
          <Card key={log.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="pt-0.5">{due.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{log.maintenanceType}</span>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", due.colour)}>{due.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{an ? `${an} — ` : ""}{equipmentName} <span className="text-gray-400">({equipmentType})</span></p>
                  <p className="text-xs text-gray-400 mt-1">Last done: {new Date(log.performedDate).toLocaleDateString("en-GB")}{log.performedBy ? ` by ${log.performedBy}` : ""}</p>
                  {log.description && <p className="text-xs text-gray-500 mt-1">{log.description}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Fleet Overview tab ────────────────────────────────────────────────────────

function FleetOverviewTab({ farmId }: { farmId: number }) {
  const { data: equipData } = useQuery<{ records: Equipment[] }>({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: jobData } = useQuery<{ jobs: WorkshopJob[] }>({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()),
  });

  const equipment = equipData?.records ?? [];
  const jobs = jobData?.jobs ?? [];

  const byStatus = equipment.reduce((acc, eq) => { acc[eq.status] = (acc[eq.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const byType = equipment.reduce((acc, eq) => { acc[eq.type] = (acc[eq.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  const openJobs = jobs.filter(j => j.job.status === "open").length;
  const inProgressJobs = jobs.filter(j => j.job.status === "in-progress").length;
  const awaitingParts = jobs.filter(j => j.job.status === "awaiting-parts").length;

  const totalLabourCost = jobs.reduce((sum, j) => sum + (j.job.labourCostPence || 0), 0);
  const totalPartsCost = jobs.reduce((sum, j) => sum + (j.job.partsCostPence || 0), 0);

  function StatCard({ title, value, sub, colour }: { title: string; value: number | string; sub?: string; colour: string }) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className={cn("text-3xl font-bold", colour)}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Fleet Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Assets" value={equipment.length} colour="text-gray-900" />
          <StatCard title="Operational" value={byStatus["active"] || 0} colour="text-green-600" sub={`${Math.round(((byStatus["active"] || 0) / Math.max(equipment.length, 1)) * 100)}% availability`} />
          <StatCard title="Broken Down" value={byStatus["broken"] || 0} colour="text-red-600" />
          <StatCard title="In Service" value={byStatus["in-service"] || 0} colour="text-amber-600" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Workshop Jobs</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Open Jobs" value={openJobs} colour="text-blue-600" />
          <StatCard title="In Progress" value={inProgressJobs} colour="text-amber-600" />
          <StatCard title="Awaiting Parts" value={awaitingParts} colour="text-purple-600" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Workshop Costs (all time)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Labour</span><span className="font-medium">£{(totalLabourCost / 100).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Parts</span><span className="font-medium">£{(totalPartsCost / 100).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2"><span>Total</span><span>£{((totalLabourCost + totalPartsCost) / 100).toFixed(2)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Equipment by Type</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(byType).length === 0 ? <p className="text-sm text-gray-400">No equipment registered.</p> : (
              <div className="space-y-1.5">
                {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="flex-1 text-sm text-gray-600 capitalize">{type}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / equipment.length) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── PAT Testing tab ──────────────────────────────────────────────────────────

function DocCell({ endpoint, queryKey, documentPath, documentName }: {
  endpoint: string;
  queryKey: unknown[];
  documentPath: string | null;
  documentName: string | null;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }),
      });
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
      const fileName = objectPath.split("/").pop() ?? file.name;
      await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ documentPath: objectPath, documentName: fileName }) });
      qc.invalidateQueries({ queryKey });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ documentPath: null, documentName: null }) });
    qc.invalidateQueries({ queryKey });
  }

  return (
    <div className="flex items-center gap-1">
      {documentPath ? (
        <>
          <a href={`/api/storage${documentPath}`} target="_blank" rel="noopener noreferrer" title={documentName || "View document"} className="flex items-center text-blue-600 p-1">
            <FileIcon className="h-3.5 w-3.5" />
          </a>
          <button onClick={handleRemove} title="Remove document" className="text-gray-300 hover:text-gray-500 p-1 leading-none" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>×</button>
        </>
      ) : (
        <>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          {uploading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
            : <button onClick={() => fileRef.current?.click()} title="Attach certificate copy" className="text-gray-300 hover:text-gray-500 p-1" style={{ background: "none", border: "none", cursor: "pointer" }}><Paperclip className="h-3.5 w-3.5" /></button>
          }
        </>
      )}
    </div>
  );
}

interface PatTest {
  id: number; farmId: number; itemName: string; equipmentId: number | null;
  location: string | null; testDate: string | null; testerName: string | null;
  testerCompany: string | null; certificateNumber: string | null;
  result: string; nextDueDate: string | null; notes: string | null;
  documentPath: string | null; documentName: string | null; createdAt: string;
}

const PAT_RESULT: Record<string, { label: string; colour: string }> = {
  pass:     { label: "Pass",     colour: "bg-green-100 text-green-700" },
  fail:     { label: "Fail",     colour: "bg-red-100 text-red-700" },
  advisory: { label: "Advisory", colour: "bg-amber-100 text-amber-700" },
};

const EMPTY_PAT = { itemName: "", location: "", testDate: "", testerName: "", testerCompany: "", certificateNumber: "", result: "pass", nextDueDate: "", notes: "" };

function PatTestingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PatTest | null>(null);
  const [form, setForm] = useState(EMPTY_PAT);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: PatTest[] }>({
    queryKey: ["workshop-pat", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/pat-tests`), { credentials: "include" }).then(r => r.json()),
  });

  const createMut = useMutation({
    mutationFn: (body: typeof form) => fetch(api(`farms/${farmId}/workshop/pat-tests`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-pat", farmId] }); setShowForm(false); setForm(EMPTY_PAT); },
  });

  const updateMut = useMutation({
    mutationFn: (body: typeof form) => fetch(api(`farms/${farmId}/workshop/pat-tests/${editing!.id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-pat", farmId] }); setShowForm(false); setEditing(null); setForm(EMPTY_PAT); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/pat-tests/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-pat", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: PatTest) {
    setEditing(r);
    setForm({ itemName: r.itemName, location: r.location ?? "", testDate: r.testDate ? r.testDate.slice(0, 10) : "", testerName: r.testerName ?? "", testerCompany: r.testerCompany ?? "", certificateNumber: r.certificateNumber ?? "", result: r.result, nextDueDate: r.nextDueDate ? r.nextDueDate.slice(0, 10) : "", notes: r.notes ?? "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    editing ? updateMut.mutate(form) : createMut.mutate(form);
  }

  const today = new Date();
  const records = data?.records ?? [];
  const overdue = records.filter(r => r.nextDueDate && new Date(r.nextDueDate) < today).length;

  if (isLoading) return <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Track annual Portable Appliance Testing for all workshop electrical equipment. Red Tractor requires evidence that portable appliances are maintained safely.</p>
          {overdue > 0 && <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {overdue} item{overdue !== 1 ? "s" : ""} overdue for testing</p>}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm(EMPTY_PAT); setShowForm(true); }} className="gap-1"><Plus className="h-4 w-4" />Log PAT Test</Button>
      </div>

      {records.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-400 text-sm">No PAT test records yet. Log the first test to start tracking compliance.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
              <tr>
                {["Item / Appliance", "Location", "Test Date", "Tester", "Cert No.", "Result", "Next Due", "Cert Doc", ""].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => {
                const due = r.nextDueDate ? new Date(r.nextDueDate) : null;
                const isOverdue = due && due < today;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.itemName}</td>
                    <td className="px-4 py-3 text-gray-500">{r.location || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{r.testDate ? new Date(r.testDate).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{[r.testerName, r.testerCompany].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.certificateNumber || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge value={r.result} map={PAT_RESULT} /></td>
                    <td className="px-4 py-3">
                      {due ? (
                        <span className={cn("text-xs font-medium", isOverdue ? "text-red-600" : "text-gray-500")}>
                          {isOverdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                          {due.toLocaleDateString("en-GB")}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-2 py-3">
                      <DocCell
                        endpoint={`/api/farms/${farmId}/workshop/pat-tests/${r.id}`}
                        queryKey={["workshop-pat", farmId]}
                        documentPath={r.documentPath ?? null}
                        documentName={r.documentName ?? null}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "40rem" }} aria-describedby={undefined}>
            <DialogHeader><DialogTitle>{editing ? "Edit PAT Test" : "Log PAT Test"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Item / Appliance Name *</Label><Input required value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} placeholder="e.g. Angle Grinder, Extension Lead, Welder" /></div>
                <div><Label>Location in Workshop</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Main workshop, Store room" /></div>
                <div>
                  <Label>Result</Label>
                  <Select value={form.result} onValueChange={v => setForm(f => ({ ...f, result: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="pass">Pass</SelectItem><SelectItem value="fail">Fail</SelectItem><SelectItem value="advisory">Advisory</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Test Date</Label><Input type="date" value={form.testDate} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} /></div>
                <div><Label>Next Test Due</Label><Input type="date" value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} /></div>
                <div><Label>Tester Name</Label><Input value={form.testerName} onChange={e => setForm(f => ({ ...f, testerName: e.target.value }))} /></div>
                <div><Label>Tester Company</Label><Input value={form.testerCompany} onChange={e => setForm(f => ({ ...f, testerCompany: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Certificate Number</Label><Input value={form.certificateNumber} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} className="font-mono" /></div>
                <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save" : "Add Record"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Delete PAT Record?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">This will permanently remove the PAT test record. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Fire Safety tab ───────────────────────────────────────────────────────────

interface FireExtinguisher {
  id: number; farmId: number; location: string; type: string;
  capacityKg: string | null; serialNumber: string | null;
  lastServiceDate: string | null; engineerName: string | null;
  engineerCompany: string | null; nextServiceDue: string | null; notes: string | null; createdAt: string;
}

const FIRE_TYPES: { value: string; label: string }[] = [
  { value: "co2",          label: "CO₂ (Red/Black) — electrical fires" },
  { value: "dry_powder",   label: "Dry Powder (Red/Blue) — general purpose" },
  { value: "water",        label: "Water (Red) — paper/wood fires" },
  { value: "foam",         label: "Foam (Red/Cream) — liquid fires" },
  { value: "wet_chemical", label: "Wet Chemical (Red/Yellow) — cooking oils" },
];

const FIRE_TYPE_LABEL: Record<string, string> = { co2: "CO₂", dry_powder: "Dry Powder", water: "Water", foam: "Foam", wet_chemical: "Wet Chemical" };

const EMPTY_FIRE = { location: "", type: "co2", capacityKg: "", serialNumber: "", lastServiceDate: "", engineerName: "", engineerCompany: "", nextServiceDue: "", notes: "" };

function FireSafetyTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FireExtinguisher | null>(null);
  const [form, setForm] = useState(EMPTY_FIRE);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: FireExtinguisher[] }>({
    queryKey: ["workshop-fire", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/fire-extinguishers`), { credentials: "include" }).then(r => r.json()),
  });

  const createMut = useMutation({
    mutationFn: (body: typeof form) => fetch(api(`farms/${farmId}/workshop/fire-extinguishers`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-fire", farmId] }); setShowForm(false); setForm(EMPTY_FIRE); },
  });

  const updateMut = useMutation({
    mutationFn: (body: typeof form) => fetch(api(`farms/${farmId}/workshop/fire-extinguishers/${editing!.id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-fire", farmId] }); setShowForm(false); setEditing(null); setForm(EMPTY_FIRE); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/fire-extinguishers/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-fire", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: FireExtinguisher) {
    setEditing(r);
    setForm({ location: r.location, type: r.type, capacityKg: r.capacityKg ?? "", serialNumber: r.serialNumber ?? "", lastServiceDate: r.lastServiceDate ? r.lastServiceDate.slice(0, 10) : "", engineerName: r.engineerName ?? "", engineerCompany: r.engineerCompany ?? "", nextServiceDue: r.nextServiceDue ? r.nextServiceDue.slice(0, 10) : "", notes: r.notes ?? "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    editing ? updateMut.mutate(form) : createMut.mutate(form);
  }

  const today = new Date();
  const records = data?.records ?? [];
  const overdue = records.filter(r => r.nextServiceDue && new Date(r.nextServiceDue) < today).length;
  const dueSoon = records.filter(r => { if (!r.nextServiceDue) return false; const d = new Date(r.nextServiceDue); const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000); return diff >= 0 && diff <= 60; }).length;

  if (isLoading) return <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Register all fire extinguishers on the holding. Red Tractor expects extinguishers to be serviced annually by a competent person.</p>
          {overdue > 0 && <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {overdue} extinguisher{overdue !== 1 ? "s" : ""} overdue for service</p>}
          {overdue === 0 && dueSoon > 0 && <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {dueSoon} extinguisher{dueSoon !== 1 ? "s" : ""} due for service within 60 days</p>}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm(EMPTY_FIRE); setShowForm(true); }} className="gap-1"><Plus className="h-4 w-4" />Add Extinguisher</Button>
      </div>

      {records.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-400 text-sm">No extinguishers registered yet. Add each extinguisher on the holding to track annual service dates.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
              <tr>
                {["Location", "Type", "Capacity", "Serial No.", "Last Service", "Engineer", "Next Service Due", ""].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => {
                const due = r.nextServiceDue ? new Date(r.nextServiceDue) : null;
                const isOverdue = due && due < today;
                const diff = due ? Math.ceil((due.getTime() - today.getTime()) / 86400000) : null;
                const isSoon = diff !== null && diff >= 0 && diff <= 60;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.location}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", r.type === "co2" ? "bg-gray-100 text-gray-700" : r.type === "dry_powder" ? "bg-blue-100 text-blue-700" : r.type === "foam" ? "bg-yellow-100 text-yellow-700" : r.type === "wet_chemical" ? "bg-orange-100 text-orange-700" : "bg-red-50 text-red-700")}>
                        {FIRE_TYPE_LABEL[r.type] ?? r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.capacityKg ? `${r.capacityKg} kg` : "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.serialNumber || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{r.lastServiceDate ? new Date(r.lastServiceDate).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{[r.engineerName, r.engineerCompany].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3">
                      {due ? (
                        <span className={cn("text-xs font-medium flex items-center gap-1", isOverdue ? "text-red-600" : isSoon ? "text-amber-600" : "text-gray-500")}>
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                          {isSoon && !isOverdue && <Clock className="h-3 w-3" />}
                          {due.toLocaleDateString("en-GB")}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "40rem" }} aria-describedby={undefined}>
            <DialogHeader><DialogTitle>{editing ? "Edit Fire Extinguisher" : "Add Fire Extinguisher"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Location *</Label><Input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Main workshop entrance, Grain store, Chemical store" /></div>
                <div>
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FIRE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Capacity (kg)</Label><Input value={form.capacityKg} onChange={e => setForm(f => ({ ...f, capacityKg: e.target.value }))} placeholder="e.g. 2, 6" /></div>
                <div><Label>Serial Number</Label><Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} className="font-mono" /></div>
                <div><Label>Last Service Date</Label><Input type="date" value={form.lastServiceDate} onChange={e => setForm(f => ({ ...f, lastServiceDate: e.target.value }))} /></div>
                <div><Label>Next Service Due</Label><Input type="date" value={form.nextServiceDue} onChange={e => setForm(f => ({ ...f, nextServiceDue: e.target.value }))} /></div>
                <div><Label>Engineer Name</Label><Input value={form.engineerName} onChange={e => setForm(f => ({ ...f, engineerName: e.target.value }))} /></div>
                <div><Label>Engineer Company</Label><Input value={form.engineerCompany} onChange={e => setForm(f => ({ ...f, engineerCompany: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save" : "Add Extinguisher"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Remove Extinguisher?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">This will permanently remove the extinguisher record. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Workshop Risk Assessments tab ────────────────────────────────────────────

interface RiskAssessment {
  id: number; farmId: number; title: string; area: string | null;
  hazardDescription: string | null; riskLevel: string; controlMeasures: string | null;
  assessedBy: string | null; assessmentDate: string | null; reviewDate: string | null; status: string;
}

const RISK_LEVEL: Record<string, { label: string; colour: string }> = {
  low:      { label: "Low",      colour: "bg-green-100 text-green-700" },
  medium:   { label: "Medium",   colour: "bg-amber-100 text-amber-700" },
  high:     { label: "High",     colour: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", colour: "bg-red-100 text-red-700" },
};

const WORKSHOP_ACTIVITIES = ["Welding", "Grinding & cutting", "Working under vehicles (jacking)", "Compressed air use", "Hydraulic work", "Lifting operations (crane, forklift)", "Electrical work", "Flammable liquids (fuels, solvents)", "Power tools", "Manual handling", "Chemical storage", "Other"];

const EMPTY_RISK = { title: "", area: "Workshop", hazardDescription: "", riskLevel: "medium", controlMeasures: "", assessedBy: "", assessmentDate: "", reviewDate: "", status: "active" };

function WorkshopRisksTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RiskAssessment | null>(null);
  const [form, setForm] = useState(EMPTY_RISK);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: RiskAssessment[] }>({
    queryKey: ["risk-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/risk-assessments`, { credentials: "include" }).then(r => r.json()),
    select: d => ({ records: (d.records ?? []).filter((r: RiskAssessment) => r.area === "Workshop") }),
  });

  const createMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/risk-assessments`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] }); setShowForm(false); setForm(EMPTY_RISK); },
  });

  const updateMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/risk-assessments/${editing!.id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] }); setShowForm(false); setEditing(null); setForm(EMPTY_RISK); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/risk-assessments/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risk-assessments", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: RiskAssessment) {
    setEditing(r);
    setForm({ title: r.title, area: r.area ?? "Workshop", hazardDescription: r.hazardDescription ?? "", riskLevel: r.riskLevel, controlMeasures: r.controlMeasures ?? "", assessedBy: r.assessedBy ?? "", assessmentDate: r.assessmentDate ? r.assessmentDate.slice(0, 10) : "", reviewDate: r.reviewDate ? r.reviewDate.slice(0, 10) : "", status: r.status });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    editing ? updateMut.mutate({ ...form, area: "Workshop" }) : createMut.mutate({ ...form, area: "Workshop" });
  }

  const today = new Date();
  const records = data?.records ?? [];
  const overdueReview = records.filter(r => r.reviewDate && new Date(r.reviewDate) < today && r.status === "active").length;

  if (isLoading) return <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Workshop-specific risk assessments for hazardous activities — welding, grinding, lifting, compressed air and more. Red Tractor requires documented risk assessments for all significant workshop hazards.</p>
          {overdueReview > 0 && <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {overdueReview} assessment{overdueReview !== 1 ? "s" : ""} overdue for review</p>}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm(EMPTY_RISK); setShowForm(true); }} className="gap-1"><Plus className="h-4 w-4" />Add Assessment</Button>
      </div>

      {records.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-400 text-sm">No workshop risk assessments yet. Add one for each significant hazard in your workshop.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
              <tr>{["Activity / Hazard", "Risk Level", "Assessed By", "Assessment Date", "Review Due", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => {
                const due = r.reviewDate ? new Date(r.reviewDate) : null;
                const isOverdue = due && due < today && r.status === "active";
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.title}</td>
                    <td className="px-4 py-3"><StatusBadge value={r.riskLevel} map={RISK_LEVEL} /></td>
                    <td className="px-4 py-3 text-gray-500">{r.assessedBy || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-4 py-3">
                      {due ? (
                        <span className={cn("text-xs font-medium flex items-center gap-1", isOverdue ? "text-red-600" : "text-gray-500")}>
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                          {due.toLocaleDateString("en-GB")}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3"><span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", r.status === "active" ? "bg-green-100 text-green-700" : r.status === "under-review" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500")}>{r.status === "under-review" ? "Under Review" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "44rem" }} aria-describedby={undefined}>
            <DialogHeader><DialogTitle>{editing ? "Edit Risk Assessment" : "Add Workshop Risk Assessment"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Activity / Hazard *</Label>
                  <Select value={form.title} onValueChange={v => setForm(f => ({ ...f, title: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select activity…" /></SelectTrigger>
                    <SelectContent>{WORKSHOP_ACTIVITIES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Risk Level</Label>
                  <Select value={form.riskLevel} onValueChange={v => setForm(f => ({ ...f, riskLevel: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-2"><Label>Hazard Description (who/what could be harmed)</Label><Textarea value={form.hazardDescription} onChange={e => setForm(f => ({ ...f, hazardDescription: e.target.value }))} rows={2} /></div>
                <div className="col-span-2"><Label>Control Measures (PPE, training, engineering controls)</Label><Textarea value={form.controlMeasures} onChange={e => setForm(f => ({ ...f, controlMeasures: e.target.value }))} rows={2} /></div>
                <div><Label>Assessed By</Label><Input value={form.assessedBy} onChange={e => setForm(f => ({ ...f, assessedBy: e.target.value }))} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="under-review">Under Review</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Assessment Date</Label><Input type="date" value={form.assessmentDate} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
                <div><Label>Review Date</Label><Input type="date" value={form.reviewDate} onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save" : "Add Assessment"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Delete Assessment?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">This will permanently delete this risk assessment.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Workshop COSHH tab ────────────────────────────────────────────────────────

interface CoshhRecord {
  id: number; farmId: number; substanceName: string; manufacturer: string | null;
  hazardClassification: string | null; usageArea: string | null; storageLocation: string | null;
  controlMeasures: string | null; ppe: string | null; emergencyProcedures: string | null;
  assessedBy: string | null; assessmentDate: string | null; reviewDate: string | null;
}

const WORKSHOP_SUBSTANCES = ["Engine oil / gear oil", "Diesel / fuel", "Brake fluid", "Antifreeze / coolant", "Battery acid", "Welding gas (acetylene, propane, argon)", "Aerosol lubricant (WD-40 etc.)", "Paint / primer", "Solvent / degreaser", "Hydraulic fluid", "Grease / penetrating oil", "Other"];

const EMPTY_COSHH = { substanceName: "", manufacturer: "", hazardClassification: "", usageArea: "Workshop", storageLocation: "", controlMeasures: "", ppe: "", emergencyProcedures: "", assessedBy: "", assessmentDate: "", reviewDate: "" };

function WorkshopCoshhTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CoshhRecord | null>(null);
  const [form, setForm] = useState(EMPTY_COSHH);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: CoshhRecord[] }>({
    queryKey: ["coshh", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/coshh`, { credentials: "include" }).then(r => r.json()),
    select: d => ({ records: (d.records ?? []).filter((r: CoshhRecord) => r.usageArea === "Workshop") }),
  });

  const createMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/coshh`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["coshh", farmId] }); setShowForm(false); setForm(EMPTY_COSHH); },
  });

  const updateMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/coshh/${editing!.id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["coshh", farmId] }); setShowForm(false); setEditing(null); setForm(EMPTY_COSHH); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/coshh/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["coshh", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: CoshhRecord) {
    setEditing(r);
    setForm({ substanceName: r.substanceName, manufacturer: r.manufacturer ?? "", hazardClassification: r.hazardClassification ?? "", usageArea: "Workshop", storageLocation: r.storageLocation ?? "", controlMeasures: r.controlMeasures ?? "", ppe: r.ppe ?? "", emergencyProcedures: r.emergencyProcedures ?? "", assessedBy: r.assessedBy ?? "", assessmentDate: r.assessmentDate ? r.assessmentDate.slice(0, 10) : "", reviewDate: r.reviewDate ? r.reviewDate.slice(0, 10) : "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    editing ? updateMut.mutate({ ...form, usageArea: "Workshop" }) : createMut.mutate({ ...form, usageArea: "Workshop" });
  }

  const records = data?.records ?? [];

  if (isLoading) return <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">COSHH assessments for oils, fuels, solvents, welding gases and other hazardous substances used in the workshop. Required under the Control of Substances Hazardous to Health Regulations 2002.</p>
        <Button size="sm" onClick={() => { setEditing(null); setForm(EMPTY_COSHH); setShowForm(true); }} className="gap-1"><Plus className="h-4 w-4" />Add COSHH Assessment</Button>
      </div>

      {records.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-400 text-sm">No workshop COSHH assessments yet. Add one for each hazardous substance used or stored in your workshop.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
              <tr>{["Substance", "Manufacturer", "Hazard Class", "Storage", "PPE Required", "Assessed By", ""].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.substanceName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.manufacturer || "—"}</td>
                  <td className="px-4 py-3">{r.hazardClassification ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">{r.hazardClassification}</span> : "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.storageLocation || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{r.ppe || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{r.assessedBy || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); } }}>
          <DialogContent style={{ maxWidth: "44rem" }} aria-describedby={undefined}>
            <DialogHeader><DialogTitle>{editing ? "Edit COSHH Assessment" : "Add Workshop COSHH Assessment"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Substance / Product *</Label>
                  <Select value={form.substanceName} onValueChange={v => setForm(f => ({ ...f, substanceName: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select substance…" /></SelectTrigger>
                    <SelectContent>{WORKSHOP_SUBSTANCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Manufacturer / Supplier</Label><Input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} /></div>
                <div><Label>Hazard Classification</Label><Input value={form.hazardClassification} onChange={e => setForm(f => ({ ...f, hazardClassification: e.target.value }))} placeholder="e.g. Flammable, Irritant, Harmful" /></div>
                <div><Label>Storage Location</Label><Input value={form.storageLocation} onChange={e => setForm(f => ({ ...f, storageLocation: e.target.value }))} placeholder="e.g. Locked metal cabinet, fuel store" /></div>
                <div className="col-span-2"><Label>Control Measures</Label><Textarea value={form.controlMeasures} onChange={e => setForm(f => ({ ...f, controlMeasures: e.target.value }))} rows={2} placeholder="Engineering controls, ventilation, substitution…" /></div>
                <div className="col-span-2"><Label>PPE Required</Label><Textarea value={form.ppe} onChange={e => setForm(f => ({ ...f, ppe: e.target.value }))} rows={2} placeholder="e.g. Nitrile gloves, eye protection, respirator…" /></div>
                <div className="col-span-2"><Label>Emergency Procedures (spill, first aid)</Label><Textarea value={form.emergencyProcedures} onChange={e => setForm(f => ({ ...f, emergencyProcedures: e.target.value }))} rows={2} /></div>
                <div><Label>Assessed By</Label><Input value={form.assessedBy} onChange={e => setForm(f => ({ ...f, assessedBy: e.target.value }))} /></div>
                <div><Label>Assessment Date</Label><Input type="date" value={form.assessmentDate} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
                <div><Label>Review Date</Label><Input type="date" value={form.reviewDate} onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Save" : "Add Assessment"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Delete COSHH Assessment?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">This will permanently delete this COSHH assessment record.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

// ─── Parts Store tab ───────────────────────────────────────────────────────────

interface Part {
  id: number; name: string; category: string | null; productCode: string | null;
  unit: string | null; reorderLevel: string | null; unitCostPence: number | null;
  storageLocation: string | null; defaultSupplierId: number | null; supplierName: string | null;
  notes: string | null; currentQuantity: string;
}

interface Movement {
  id: number; stockItemId: number; partName: string; unit: string | null;
  movementType: string; quantityChange: string; referenceType: string | null;
  referenceId: number | null; performedBy: string | null; notes: string | null;
  movedAt: string;
}

const PART_CATEGORIES = ["Filters", "Belts & Drives", "Bearings", "Seals & Gaskets", "Fasteners", "Electrical", "Hydraulics", "Tyres & Wheels", "Lubricants & Oils", "Welding Supplies", "Safety Equipment", "Tools", "Other"];

const EMPTY_PART = { name: "", category: "", productCode: "", unit: "", reorderLevel: "", unitCostPence: "", storageLocation: "", defaultSupplierId: "", notes: "" };

function PartsStoreTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();

  const [view, setView] = useState<"catalogue" | "history">("catalogue");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [form, setForm] = useState<Record<string, string>>(EMPTY_PART);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receivePart, setReceivePart] = useState<Part | null>(null);
  const [receiveForm, setReceiveForm] = useState({ qty: "", unitCostPence: "", supplierId: "", invoiceRef: "", date: new Date().toISOString().slice(0, 10), notes: "", performedBy: "" });
  const [useOpen, setUseOpen] = useState(false);
  const [usePart, setUsePart] = useState<Part | null>(null);
  const [useForm, setUseForm] = useState({ qty: "", jobId: "", performedBy: "", notes: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: parts = [], isLoading } = useQuery<Part[]>({ queryKey: ["workshop-parts", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/parts`), { credentials: "include" }).then(r => r.json()) });
  const { data: movements = [] } = useQuery<Movement[]>({ queryKey: ["workshop-parts-movements", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/parts/movements`), { credentials: "include" }).then(r => r.json()), enabled: view === "history" });
  const { data: jobsData } = useQuery<{ jobs: { job: { id: number; jobNumber: string; title: string; status: string } }[] }>({ queryKey: ["workshop-jobs", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()) });
  const { data: suppliersData } = useQuery<any[]>({ queryKey: ["suppliers-list", farmId], queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then(r => { if (!r.ok) return []; return r.json().then(d => Array.isArray(d) ? d : []); }) });

  const openJobs = (jobsData?.jobs ?? []).filter(j => !["completed", "cancelled"].includes(j.job.status));
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const savePart = useMutation({
    mutationFn: async (body: Record<string, string>) => {
      const supplierId = body.defaultSupplierId && body.defaultSupplierId !== "__none__" ? body.defaultSupplierId : null;
      const payload = { ...body, unitCostPence: body.unitCostPence ? Math.round(parseFloat(body.unitCostPence) * 100) : null, reorderLevel: body.reorderLevel || null, defaultSupplierId: supplierId };
      const url = editing ? api(`farms/${farmId}/workshop/parts/${editing.id}`) : api(`farms/${farmId}/workshop/parts`);
      return fetch(url, { method: editing ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); setAddOpen(false); setEditing(null); setForm(EMPTY_PART); },
  });

  const deletePart = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/parts/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); setDeleteId(null); },
  });

  const receive = useMutation({
    mutationFn: (body: Record<string, string>) => fetch(api(`farms/${farmId}/workshop/parts/receive`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockItemId: receivePart?.id, quantity: body.qty, supplierId: body.supplierId || null, unitCostPence: body.unitCostPence || null, invoiceReference: body.invoiceRef, deliveryDate: body.date, notes: body.notes, performedBy: body.performedBy }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); qc.invalidateQueries({ queryKey: ["workshop-parts-movements", farmId] }); setReceiveOpen(false); setReceiveForm({ qty: "", unitCostPence: "", supplierId: "", invoiceRef: "", date: new Date().toISOString().slice(0, 10), notes: "", performedBy: "" }); },
  });

  const useParts = useMutation({
    mutationFn: (body: Record<string, string>) => fetch(api(`farms/${farmId}/workshop/parts/use`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockItemId: usePart?.id, quantity: body.qty, jobId: body.jobId || null, performedBy: body.performedBy, notes: body.notes }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); qc.invalidateQueries({ queryKey: ["workshop-parts-movements", farmId] }); qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }); setUseOpen(false); setUseForm({ qty: "", jobId: "", performedBy: "", notes: "" }); },
  });

  const lowStock = parts.filter(p => p.reorderLevel && parseFloat(p.currentQuantity) <= parseFloat(p.reorderLevel));

  function openAdd() { setEditing(null); setForm(EMPTY_PART); setAddOpen(true); }
  function openEdit(p: Part) { setEditing(p); setForm({ name: p.name, category: p.category ?? "", productCode: p.productCode ?? "", unit: p.unit ?? "", reorderLevel: p.reorderLevel ?? "", unitCostPence: p.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : "", storageLocation: p.storageLocation ?? "", defaultSupplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", notes: p.notes ?? "" }); setAddOpen(true); }
  function openReceive(p: Part) { setReceivePart(p); setReceiveForm({ qty: "", unitCostPence: p.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : "", supplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", invoiceRef: "", date: new Date().toISOString().slice(0, 10), notes: "", performedBy: "" }); setReceiveOpen(true); }
  function openUse(p: Part) { setUsePart(p); setUseForm({ qty: "", jobId: "", performedBy: "", notes: "" }); setUseOpen(true); }

  function fmtQty(qty: string, unit: string | null) { const n = parseFloat(qty); return `${isNaN(n) ? 0 : n}${unit ? ` ${unit}` : ""}`; }
  function fmtCost(pence: number | null) { return pence ? `£${(pence / 100).toFixed(2)}` : "—"; }
  function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {/* Sub-nav + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(["catalogue", "history"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === v ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
              {v === "catalogue" ? <><Package className="h-3 w-3 inline-block mr-1" />Parts Catalogue</> : <><History className="h-3 w-3 inline-block mr-1" />Movement History</>}
            </button>
          ))}
        </div>
        {view === "catalogue" && <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Part</Button>}
      </div>

      {/* Low-stock alert banner */}
      {view === "catalogue" && lowStock.length > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
          <TriangleAlert className="h-4 w-4 text-amber-500 shrink-0" />
          <span><strong>{lowStock.length} part{lowStock.length > 1 ? "s" : ""}</strong> at or below reorder level: {lowStock.map(p => p.name).join(", ")}</span>
        </div>
      )}

      {/* Parts Catalogue */}
      {view === "catalogue" && (
        parts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500 mb-1">No parts registered yet</p>
            <p className="text-sm">Add parts to track stock levels, receive deliveries, and log usage against job cards.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Part / Part No.", "Category", "Location", "In Stock", "Reorder At", "Unit Cost", "Supplier", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parts.map(p => {
                  const qty = parseFloat(p.currentQuantity);
                  const reorder = p.reorderLevel ? parseFloat(p.reorderLevel) : null;
                  const isLow = reorder !== null && qty <= reorder;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.name}</p>
                        {p.productCode && <p className="text-xs text-gray-400 font-mono">{p.productCode}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.category || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{p.storageLocation || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("font-semibold", isLow ? "text-amber-600" : "text-gray-900")}>
                          {fmtQty(p.currentQuantity, p.unit)}
                        </span>
                        {isLow && <span className="ml-1.5 text-xs text-amber-500 font-medium">Low</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.reorderLevel ? fmtQty(p.reorderLevel, p.unit) : "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtCost(p.unitCostPence)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.supplierName || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => openReceive(p)} title="Receive stock">
                            <ArrowDownToLine className="h-3 w-3" />In
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => openUse(p)} title="Use / issue">
                            <ArrowUpFromLine className="h-3 w-3" />Use
                          </Button>
                          <button onClick={() => openEdit(p)} className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Movement History */}
      {view === "history" && (
        movements.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <History className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No movements recorded yet</p>
            <p className="text-sm">Stock receipts and usage will appear here.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Date", "Part", "Type", "Qty Change", "Reference", "Performed By", "Notes"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map(m => {
                  const qty = parseFloat(m.quantityChange);
                  const isIn = qty > 0;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(m.movedAt)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{m.partName}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5", isIn ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}>
                          {isIn ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}
                          {isIn ? "Received" : "Issued"}
                        </span>
                      </td>
                      <td className={cn("px-4 py-3 font-semibold tabular-nums", isIn ? "text-green-700" : "text-blue-700")}>
                        {isIn ? "+" : ""}{qty}{m.unit ? ` ${m.unit}` : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {m.referenceType === "workshop_job" && m.referenceId ? `Job #${m.referenceId}` : m.referenceType === "workshop_delivery" ? "Delivery" : m.referenceType || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.performedBy || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{m.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Add / Edit Part Dialog */}
      {addOpen && (
        <Dialog open onOpenChange={() => { setAddOpen(false); setEditing(null); setForm(EMPTY_PART); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Part" : "Add New Part"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="col-span-2"><Label>Part Name *</Label><Input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. Oil Filter — Massey 5710" /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setF("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{PART_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Part / Product Code</Label><Input value={form.productCode} onChange={e => setF("productCode", e.target.value)} placeholder="e.g. OFS-1234" /></div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setF("unit", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{["each", "pair", "set", "litre", "kg", "metre", "box"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unit Cost (£)</Label><Input type="number" step="0.01" min="0" value={form.unitCostPence} onChange={e => setF("unitCostPence", e.target.value)} placeholder="0.00" /></div>
              <div><Label>Reorder Level</Label><Input type="number" step="1" min="0" value={form.reorderLevel} onChange={e => setF("reorderLevel", e.target.value)} placeholder="e.g. 2" /></div>
              <div><Label>Storage Location</Label><Input value={form.storageLocation} onChange={e => setF("storageLocation", e.target.value)} placeholder="e.g. Shelf A3, Drawer 2" /></div>
              <div className="col-span-2">
                <Label>Default Supplier</Label>
                <Select value={form.defaultSupplierId || "__none__"} onValueChange={v => setF("defaultSupplierId", v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => savePart.mutate(form)} disabled={!form.name || savePart.isPending}>{savePart.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Add Part"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Receive Stock Dialog */}
      {receiveOpen && receivePart && (
        <Dialog open onOpenChange={() => setReceiveOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Receive Stock — {receivePart.name}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><Label>Quantity Received *</Label><Input type="number" step="0.01" min="0.01" value={receiveForm.qty} onChange={e => setReceiveForm(f => ({ ...f, qty: e.target.value }))} placeholder={`e.g. 4 ${receivePart.unit ?? ""}`} /></div>
              <div><Label>Unit Cost (£ per {receivePart.unit ?? "unit"})</Label><Input type="number" step="0.01" min="0" value={receiveForm.unitCostPence} onChange={e => setReceiveForm(f => ({ ...f, unitCostPence: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>Delivery Date</Label><Input type="date" value={receiveForm.date} onChange={e => setReceiveForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div>
                <Label>Supplier</Label>
                <Select value={receiveForm.supplierId || "__none__"} onValueChange={v => setReceiveForm(f => ({ ...f, supplierId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Invoice / Order Reference</Label><Input value={receiveForm.invoiceRef} onChange={e => setReceiveForm(f => ({ ...f, invoiceRef: e.target.value }))} placeholder="e.g. INV-2025-001" /></div>
              <div className="col-span-2"><Label>Received By</Label><Input value={receiveForm.performedBy} onChange={e => setReceiveForm(f => ({ ...f, performedBy: e.target.value }))} placeholder="Name of person" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={receiveForm.notes} onChange={e => setReceiveForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReceiveOpen(false)}>Cancel</Button>
              <Button onClick={() => receive.mutate(receiveForm)} disabled={!receiveForm.qty || receive.isPending}>{receive.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowDownToLine className="h-4 w-4 mr-1" />Receive Stock</>}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Use / Issue Parts Dialog */}
      {useOpen && usePart && (
        <Dialog open onOpenChange={() => setUseOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Issue Parts — {usePart.name}</DialogTitle></DialogHeader>
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <Package className="h-4 w-4 text-gray-400" />
              Current stock: <span className="font-semibold text-gray-900">{fmtQty(usePart.currentQuantity, usePart.unit)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><Label>Quantity Used *</Label><Input type="number" step="0.01" min="0.01" value={useForm.qty} onChange={e => setUseForm(f => ({ ...f, qty: e.target.value }))} placeholder={`e.g. 1 ${usePart.unit ?? ""}`} /></div>
              <div>
                <Label>Link to Job Card</Label>
                <Select value={useForm.jobId || "__none__"} onValueChange={v => setUseForm(f => ({ ...f, jobId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No job</SelectItem>
                    {openJobs.map(j => <SelectItem key={j.job.id} value={String(j.job.id)}>{j.job.jobNumber} — {j.job.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Issued By</Label><Input value={useForm.performedBy} onChange={e => setUseForm(f => ({ ...f, performedBy: e.target.value }))} placeholder="Name of person" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={useForm.notes} onChange={e => setUseForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUseOpen(false)}>Cancel</Button>
              <Button onClick={() => useParts.mutate(useForm)} disabled={!useForm.qty || useParts.isPending}>{useParts.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowUpFromLine className="h-4 w-4 mr-1" />Issue Parts</>}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <Dialog open onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Part</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-2">This will remove the part from the catalogue. Stock movement history is retained.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deletePart.mutate(deleteId!)} disabled={deletePart.isPending}>{deletePart.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

type Tab = "assets" | "jobs" | "schedule" | "overview" | "pat" | "fire" | "risks" | "coshh" | "parts";

export default function WorkshopPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("assets");

  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Workshop & Assets">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Workshop & Asset Management</h1>
          <p className="text-gray-500 text-sm mt-1">Asset numbers, QR labels, job cards, service schedules, PAT testing, fire safety, risk assessments and COSHH.</p>
        </div>

        <TabBar>
          <TabButton active={tab === "assets"} onClick={() => setTab("assets")}><Wrench className="h-3.5 w-3.5 mr-1 inline-block" />Assets & QR Codes</TabButton>
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")}>Job Cards</TabButton>
          <TabButton active={tab === "schedule"} onClick={() => setTab("schedule")}>Service Schedule</TabButton>
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Fleet Overview</TabButton>
          <TabButton active={tab === "pat"} onClick={() => setTab("pat")}><Zap className="h-3.5 w-3.5 mr-1 inline-block" />PAT Testing</TabButton>
          <TabButton active={tab === "fire"} onClick={() => setTab("fire")}><Flame className="h-3.5 w-3.5 mr-1 inline-block" />Fire Safety</TabButton>
          <TabButton active={tab === "risks"} onClick={() => setTab("risks")}><ShieldAlert className="h-3.5 w-3.5 mr-1 inline-block" />Risk Assessments</TabButton>
          <TabButton active={tab === "coshh"} onClick={() => setTab("coshh")}><FlaskConical className="h-3.5 w-3.5 mr-1 inline-block" />COSHH</TabButton>
          <TabButton active={tab === "parts"} onClick={() => setTab("parts")}><Package className="h-3.5 w-3.5 mr-1 inline-block" />Parts Store</TabButton>
        </TabBar>

        <div className="mt-6">
          {tab === "assets" && <AssetsTab farmId={farmId} />}
          {tab === "jobs" && <JobCardsTab farmId={farmId} />}
          {tab === "schedule" && <ServiceScheduleTab farmId={farmId} />}
          {tab === "overview" && <FleetOverviewTab farmId={farmId} />}
          {tab === "pat" && <PatTestingTab farmId={farmId} />}
          {tab === "fire" && <FireSafetyTab farmId={farmId} />}
          {tab === "risks" && <WorkshopRisksTab farmId={farmId} />}
          {tab === "coshh" && <WorkshopCoshhTab farmId={farmId} />}
          {tab === "parts" && <PartsStoreTab farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}
