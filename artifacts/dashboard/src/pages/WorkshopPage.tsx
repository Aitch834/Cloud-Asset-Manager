import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Plus, QrCode, Printer, Wrench, AlertTriangle, Clock, CheckCircle2, XCircle, Loader2, Pencil, Trash2, ChevronDown, Package, ArrowDownToLine, ArrowUpFromLine, History, TriangleAlert } from "lucide-react";
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

type Tab = "assets" | "jobs" | "schedule" | "overview" | "parts";

export default function WorkshopPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("assets");

  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Workshop & Assets">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Workshop & Asset Management</h1>
          <p className="text-gray-500 text-sm mt-1">Asset numbers, QR labels, job cards, service schedules, parts store, and fleet overview.</p>
        </div>

        <TabBar>
          <TabButton active={tab === "assets"} onClick={() => setTab("assets")}><Wrench className="h-3.5 w-3.5 mr-1 inline-block" />Assets & QR Codes</TabButton>
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")}>Job Cards</TabButton>
          <TabButton active={tab === "schedule"} onClick={() => setTab("schedule")}>Service Schedule</TabButton>
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Fleet Overview</TabButton>
          <TabButton active={tab === "parts"} onClick={() => setTab("parts")}><Package className="h-3.5 w-3.5 mr-1 inline-block" />Parts Store</TabButton>
        </TabBar>

        <div className="mt-6">
          {tab === "assets" && <AssetsTab farmId={farmId} />}
          {tab === "jobs" && <JobCardsTab farmId={farmId} />}
          {tab === "schedule" && <ServiceScheduleTab farmId={farmId} />}
          {tab === "overview" && <FleetOverviewTab farmId={farmId} />}
          {tab === "parts" && <PartsStoreTab farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}
