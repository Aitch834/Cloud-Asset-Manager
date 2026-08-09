import React, { useState, useMemo, useRef, useEffect } from "react";
import { usePersistedFilter, usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { useSearch } from "wouter";
import { useSafeUser } from "@/hooks/use-safe-clerk";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ClipboardCheck, Search, CheckCircle2, AlertTriangle, AlertCircle, Eye, Filter, Camera, File, Trash2, Loader2, Plus, Pencil, UserPlus, ClipboardList, MoreHorizontal, CheckSquare, ChevronUp } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";

type ActionRequired = "none" | "monitor" | "treat" | "urgent";

// ── UK standardised crop list ─────────────────────────────────────────────────
const UK_CROP_TYPES = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Winter Oats", "Spring Oats", "Winter Rye", "Triticale",
  "Winter OSR", "Spring OSR", "Linseed",
  "Field Beans", "Spring Beans", "Peas",
  "Sugar Beet", "Fodder Beet", "Potatoes",
  "Maize", "Grass / Herbage", "Cover Crop", "Fallow / Bare", "Other",
];

type CropGroup = "cereal" | "osr" | "sugarbeet" | "potatoes" | "beans" | "peas" | "maize" | "grass" | "generic";

function getCropGroup(c: string): CropGroup {
  const l = c.toLowerCase();
  if (/wheat|barley|oat|rye|triticale/.test(l)) return "cereal";
  if (/osr|rapeseed/.test(l)) return "osr";
  if (/sugar beet/.test(l)) return "sugarbeet";
  if (/potato/.test(l)) return "potatoes";
  if (/bean/.test(l)) return "beans";
  if (/pea/.test(l)) return "peas";
  if (/maize|corn/.test(l)) return "maize";
  if (/grass|herbage/.test(l)) return "grass";
  return "generic";
}

const GROWTH_STAGES_BY_GROUP: Record<CropGroup, string[]> = {
  cereal: [
    "Pre-emergence", "GS10–19 (Seedling)", "GS20–29 (Tillering)",
    "GS30 (Stem extension)", "GS31 (1st node)", "GS32 (2nd node)",
    "GS37–39 (Flag leaf)", "GS41–49 (Booting)", "GS51–59 (Ear emergence)",
    "GS61–69 (Anthesis)", "GS71–79 (Grain fill)", "GS80–89 (Ripening)", "Harvest ripe",
  ],
  osr: [
    "Pre-emergence", "Cotyledon stage", "1–3 true leaves", "Rosette (Autumn)",
    "Over-wintered rosette", "Stem extension", "Green bud", "Yellow bud",
    "Full flower", "Pod fill", "Ripening", "Harvest ripe",
  ],
  sugarbeet: [
    "Pre-emergence", "Cotyledon stage", "2 true leaves", "4 true leaves",
    "6 leaves", "8 leaves", "Canopy closure", "Mid-season", "Mature / Harvest",
  ],
  potatoes: [
    "Pre-emergence", "Emergence", "Early vegetative", "Canopy development",
    "Canopy closure", "Flowering", "Tuber bulking", "Senescence", "Harvest ready",
  ],
  beans: [
    "Pre-emergence", "Germination", "Seedling (VC)", "2 true leaves",
    "Vegetative growth", "Flowering (R1)", "Pod set (R3)", "Pod fill (R5)", "Harvest ripe",
  ],
  peas: [
    "Pre-emergence", "Germination", "Seedling (1st node)", "2–4 nodes",
    "Tendrils", "Flowering", "Pod set", "Pod fill", "Harvest ripe",
  ],
  maize: [
    "Pre-emergence", "VE (Emergence)", "V2–V3", "V4–V6", "V8–V10",
    "V12 (Knee high)", "VT (Tasselling)", "R1 (Silking)",
    "R2–R3 (Grain fill)", "R4–R5 (Dough / Dent)", "R6 (Maturity)", "Harvest ripe",
  ],
  grass: [
    "Pre-growth / Dormant", "Early growth", "Vegetative", "Stem extension",
    "Heading", "Anthesis", "Post-cut recovery", "Post-grazing recovery",
  ],
  generic: [
    "Pre-emergence", "Germination", "Seedling", "Early vegetative",
    "Vegetative growth", "Flowering / Bolting", "Fruit / Seed / Tuber set", "Maturity", "Harvest ripe",
  ],
};

interface Photo { id: number; objectPath: string; fileName: string | null; }

interface FieldInspection {
  id: number;
  farmId: number;
  fieldName: string;
  inspectionDate: string;
  cropType: string | null;
  growthStage: string | null;
  pestDiseaseObservations: string | null;
  actionRequired: ActionRequired;
  recommendedAction: string | null;
  inspector: string | null;
  notes: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  photos: Photo[];
}

function InspectionPhotoPanel({ recordId, farmId, photos }: { recordId: number; farmId: number; photos: Photo[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const deleteMut = useMutation({
    mutationFn: (photoId: number) => fetch(`/api/farms/${farmId}/field-inspections/${recordId}/photos/${photoId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-inspections", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/field-inspections/${recordId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Photo uploaded" });
    },
  });

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Evidence Photos</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {photos.map(p => (
          <div key={p.id} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1">
            <File size={11} className="text-blue-500" />
            <a href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
              {p.fileName ?? "photo"}
            </a>
            <button onClick={() => deleteMut.mutate(p.id)} className="text-red-400 hover:text-red-600 ml-1" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-50">
        {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
        {isUploading ? `Uploading… ${progress}%` : "Add Photo"}
        <input type="file" accept="image/*,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      </label>
    </div>
  );
}

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const ACTION_LABELS: Record<ActionRequired, string> = {
  none: "No Action",
  monitor: "Monitor",
  treat: "Treat",
  urgent: "Urgent",
};

function ActionBadge({ action, resolved }: { action: ActionRequired; resolved: boolean }) {
  if (resolved) return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
  if (action === "urgent") return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
  if (action === "treat") return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Treat</Badge>;
  if (action === "monitor") return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Monitor</Badge>;
  return <Badge variant="outline">No Action</Badge>;
}

type StaffMember = { id: number; firstName: string; lastName: string; isActive: boolean; phone?: string | null };

function RaiseTaskDialog({
  inspection, farmId, staff, onClose, onRaised,
}: {
  inspection: FieldInspection; farmId: number; staff: StaffMember[];
  onClose: () => void; onRaised: () => void;
}) {
  const { toast } = useToast();
  const [memberId, setMemberId] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = useState("");
  const [titleOverride, setTitleOverride] = useState(
    `${ACTION_LABELS[inspection.actionRequired]} — ${inspection.fieldName}${inspection.cropType ? ` (${inspection.cropType})` : ""}`
  );
  const [error, setError] = useState("");

  const mut = useMutation({
    mutationFn: (body: object) =>
      fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (data) => {
      const member = staff.find(s => s.id === Number(memberId));
      const name = member ? `${member.firstName} ${member.lastName}` : "staff member";
      if (data.smsSent) {
        toast({ title: "Task raised & assigned", description: `${name} has been notified by SMS.` });
      } else {
        toast({ title: "Task raised & assigned", description: `${name} has been assigned. (No phone number on file — SMS not sent.)` });
      }
      onRaised();
      onClose();
    },
    onError: () => setError("Failed to raise task. Please try again."),
  });

  const activeStaff = staff.filter(s => s.isActive);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) { setError("Please select a staff member."); return; }
    if (!titleOverride.trim()) { setError("Please enter a task title."); return; }
    setError("");
    mut.mutate({
      assignedToMemberId: Number(memberId),
      title: titleOverride.trim(),
      description: [
        inspection.recommendedAction ? `Recommended action: ${inspection.recommendedAction}` : null,
        inspection.pestDiseaseObservations ? `Observations: ${inspection.pestDiseaseObservations}` : null,
      ].filter(Boolean).join("\n\n") || null,
      dueDate: dueDate || null,
      module: "Field Inspections",
      href: "/field-inspections",
      taskType: "field-inspection",
      taskSourceId: String(inspection.id),
      assignmentNote: note.trim() || null,
    });
  }

  return (
    <Dialog open onOpenChange={o => { if (!o) { mut.reset(); onClose(); } }}>
      <DialogContent style={{ maxWidth: "32rem" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Raise Task from Inspection
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
            <p className="font-semibold mb-0.5 flex items-center gap-1.5">
              <ActionBadge action={inspection.actionRequired} resolved={false} />
              {inspection.fieldName}{inspection.cropType ? ` — ${inspection.cropType}` : ""}
            </p>
            {inspection.recommendedAction && <p className="text-xs mt-1">{inspection.recommendedAction}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Task title</Label>
            <Input value={titleOverride} onChange={e => setTitleOverride(e.target.value)} placeholder="Task title…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assign to <span className="text-red-500">*</span></Label>
              <select
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select staff member…</option>
                {activeStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Note for staff member <span className="text-xs text-gray-400">(optional)</span></Label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Check North Field after rain…" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <DialogMutationError mutation={mut} message="Failed to raise task — your entries are still here." />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mut.isPending} className="bg-indigo-700 hover:bg-indigo-800 text-white">
              {mut.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Raising…</> : <><UserPlus className="w-3.5 h-3.5 mr-1.5" />Raise &amp; Assign Task</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FieldInspectionsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user } = useSafeUser();
  const inspectorName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.primaryEmailAddress?.emailAddress || "" : "";

  // Deep link from Task Board: /field-inspections?inspectionId=<id>
  const searchStr = useSearch();
  const targetInspectionId = (() => {
    const v = new URLSearchParams(searchStr).get("inspectionId");
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : null;
  })();
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const scrolledToTarget = useRef(false);

  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = usePersistedFilter({ page: "field-inspections", filter: "action", farmId, defaultValue: "all" });
  const [filterStatus, setFilterStatus] = usePersistedFilter({ page: "field-inspections", filter: "status", farmId, defaultValue: "all" });
  const [filterField, setFilterField] = usePersistedFilter({ page: "field-inspections", filter: "field", farmId, defaultValue: "__all__" });
  const [cropYear, setCropYear] = usePersistedNumberFilter({ page: "field-inspections", filter: "crop-year", farmId, defaultValue: currentCropYear() });
  const [allYears, setAllYears] = useState(false);
  const [resolvedThisMonthMode, setResolvedThisMonthMode] = useState(false);

  const [detailRecord, setDetailRecord] = useState<FieldInspection | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolvedBy, setResolvedBy] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FieldInspection | null>(null);
  const [fieldNameIsCustom, setFieldNameIsCustom] = useState(false);
  const emptyForm = () => ({ fieldName: "", inspectionDate: new Date().toISOString().slice(0, 10), cropType: "", growthStage: "", pestDiseaseObservations: "", actionRequired: "none" as ActionRequired, recommendedAction: "", inspector: inspectorName, notes: "" });
  const [form, setForm] = useState(emptyForm());
  const [cropAutoFilled, setCropAutoFilled] = useState(false);

  // Keep inspector pre-filled when Clerk loads asynchronously
  useEffect(() => {
    if (inspectorName && !form.inspector) setForm(f => ({ ...f, inspector: inspectorName }));
  }, [inspectorName]);
  const formOpen = addOpen || !!editRecord;
  function openEditInspection(r: FieldInspection) {
    setCropAutoFilled(false);
    setEditRecord(r);
    setFieldNameIsCustom(!!r.fieldName && registeredFields.length > 0 && !registeredFields.includes(r.fieldName));
    setForm({
      fieldName: r.fieldName,
      inspectionDate: r.inspectionDate ? r.inspectionDate.slice(0, 10) : "",
      cropType: r.cropType ?? "",
      growthStage: r.growthStage ?? "",
      pestDiseaseObservations: r.pestDiseaseObservations ?? "",
      actionRequired: r.actionRequired,
      recommendedAction: r.recommendedAction ?? "",
      inspector: r.inspector ?? "",
      notes: r.notes ?? "",
    });
  }
  function closeInspectionForm() { setAddOpen(false); setEditRecord(null); setForm(emptyForm()); setFieldNameIsCustom(false); setCropAutoFilled(false); }

  // Auto-populate crop from field register when field name + date change (new records only)
  useEffect(() => {
    if (!formOpen || !farmId || !form.fieldName || !form.inspectionDate || editRecord) return;
    let cancelled = false;
    const params = new URLSearchParams({ fieldName: form.fieldName, date: form.inspectionDate });
    fetch(`/api/farms/${farmId}/crop-for-field?${params}`)
      .then(r => r.json())
      .then((data: { found: boolean; cropName: string | null }) => {
        if (!cancelled && data.found && data.cropName) {
          const matched = UK_CROP_TYPES.find(c => c.toLowerCase() === (data.cropName ?? "").toLowerCase()) ?? data.cropName;
          setForm(f => ({ ...f, cropType: matched ?? "", growthStage: "" }));
          setCropAutoFilled(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [formOpen, farmId, form.fieldName, form.inspectionDate, editRecord]);

  const raiseAfterSave = useRef(false);

  const createInspMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/field-inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Inspection logged" });
      closeInspectionForm();
      if (raiseAfterSave.current && data?.id) {
        raiseAfterSave.current = false;
        setRaiseTaskRecord(data as FieldInspection);
      } else {
        raiseAfterSave.current = false;
      }
    },
    onError: () => { raiseAfterSave.current = false; toast({ title: "Failed to save inspection", variant: "destructive" }); },
  });

  const updateInspMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/field-inspections/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["field-inspections", farmId] }); toast({ title: "Inspection updated" }); closeInspectionForm(); },
    onError: () => toast({ title: "Failed to update inspection", variant: "destructive" }),
  });

  const deleteInspMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/field-inspections/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["field-inspections", farmId] }); toast({ title: "Inspection deleted" }); },
    onError: () => toast({ title: "Failed to delete inspection", variant: "destructive" }),
  });

  const [raiseTaskRecord, setRaiseTaskRecord] = useState<FieldInspection | null>(null);

  const { data: staffData } = useQuery<{ members: StaffMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()),
    enabled: !!farmId,
  });
  const staff: StaffMember[] = staffData?.members ?? [];

  const { data: tasksData } = useQuery<{ records: Array<{ taskType: string; taskSourceId: string | null; status: string }> }>({
    queryKey: ["task-assignments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/task-assignments`).then(r => r.json()),
    enabled: !!farmId,
  });

  const inspectionTaskMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const t of (tasksData?.records ?? [])) {
      if (t.taskType === "field-inspection" && t.taskSourceId && t.status !== "cancelled") {
        const id = Number(t.taskSourceId);
        map[id] = (map[id] ?? 0) + 1;
      }
    }
    return map;
  }, [tasksData]);

  function submitInspectionForm() {
    if (!form.fieldName || !form.inspectionDate) { toast({ title: "Field name and date are required", variant: "destructive" }); return; }
    const body = { fieldName: form.fieldName, inspectionDate: form.inspectionDate, cropType: form.cropType || null, growthStage: form.growthStage || null, pestDiseaseObservations: form.pestDiseaseObservations || null, actionRequired: form.actionRequired, recommendedAction: form.recommendedAction || null, inspector: form.inspector || null, notes: form.notes || null };
    if (editRecord) { updateInspMut.mutate({ id: editRecord.id, body }); } else { createInspMut.mutate(body); }
  }

  function submitAndRaiseTask() {
    if (!form.fieldName || !form.inspectionDate) { toast({ title: "Field name and date are required", variant: "destructive" }); return; }
    raiseAfterSave.current = true;
    const body = { fieldName: form.fieldName, inspectionDate: form.inspectionDate, cropType: form.cropType || null, growthStage: form.growthStage || null, pestDiseaseObservations: form.pestDiseaseObservations || null, actionRequired: form.actionRequired, recommendedAction: form.recommendedAction || null, inspector: form.inspector || null, notes: form.notes || null };
    createInspMut.mutate(body);
  }

  const canRaiseTask = (form.actionRequired === "monitor" || form.actionRequired === "treat" || form.actionRequired === "urgent");

  const { data: fieldsData } = useQuery<{ records: Array<{ id: number; name: string; isActive?: boolean }> }>({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
    enabled: !!farmId,
  });
  const registeredFields = (fieldsData?.records ?? []).filter(f => f.isActive !== false).map(f => f.name).sort();

  const { data, isLoading } = useQuery({
    queryKey: ["field-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-inspections`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const records: FieldInspection[] = data?.records ?? [];

  const openActions = records.filter((r) => !r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent")).length;
  const monitored = records.filter((r) => !r.isResolved && r.actionRequired === "monitor").length;
  const resolvedThisMonth = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return records.filter((r) => r.isResolved && r.resolvedAt && new Date(r.resolvedAt) >= start).length;
  })();

  const thisMonthStart = (() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); })();
  const thisMonthLabel = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  // Scroll to and temporarily highlight a deep-linked inspection once records load.
  useEffect(() => {
    if (targetInspectionId == null || scrolledToTarget.current || records.length === 0) return;
    if (!records.some(r => r.id === targetInspectionId)) return;
    scrolledToTarget.current = true;
    setHighlightId(targetInspectionId);
    setTimeout(() => {
      document.getElementById(`inspection-row-${targetInspectionId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    const t = setTimeout(() => setHighlightId(null), 4000);
    return () => clearTimeout(t);
  }, [targetInspectionId, records]);

  const filtered = records.filter((r) => {
    // Never filter out a deep-linked inspection — it must be visible to be highlighted.
    if (r.id === targetInspectionId) return true;
    if (!allYears && !isInCropYear(r.inspectionDate, cropYear)) return false;
    if (resolvedThisMonthMode) {
      if (!r.isResolved || !r.resolvedAt || new Date(r.resolvedAt) < thisMonthStart) return false;
    }
    const matchSearch = !search || r.fieldName.toLowerCase().includes(search.toLowerCase()) || r.inspector?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "all" || r.actionRequired === filterAction;
    const matchField = filterField === "__all__" || r.fieldName === filterField;
    const matchStatus = filterStatus === "all"
      ? true
      : filterStatus === "open"
        ? !r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent")
        : filterStatus === "resolved"
          ? r.isResolved
          : filterStatus === "monitor"
            ? r.actionRequired === "monitor" && !r.isResolved
            : true;
    return matchSearch && matchAction && matchField && matchStatus;
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/field-inspections/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolvedBy, resolutionNotes }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
      toast({ title: "Inspection resolved", description: "The action has been marked as resolved." });
      setResolveOpen(false);
      setDetailRecord(null);
      setResolvedBy("");
      setResolutionNotes("");
    },
    onError: () => toast({ title: "Error", description: "Failed to resolve the inspection.", variant: "destructive" }),
  });

  function openResolve(r: FieldInspection) {
    setDetailRecord(r);
    setResolvedBy(inspectorName);
    setResolveOpen(true);
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-green-700" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">Field Inspections</h1>
            <p className="text-sm text-gray-500">Track crop inspection findings and resolve field actions</p>
          </div>
          <Button size="sm" onClick={() => { setForm(emptyForm()); setEditRecord(null); setAddOpen(true); }}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />Log Inspection
          </Button>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Total Inspections</p>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          </div>
          <button
            onClick={() => { setFilterStatus("open"); setAllYears(true); setFilterAction("all"); setSearch(""); setResolvedThisMonthMode(false); }}
            className="bg-white rounded-lg border p-4 text-left transition-all"
            style={{
              borderColor: allYears && filterStatus === "open" ? "#dc2626" : "#fecaca",
              background: allYears && filterStatus === "open" ? "#fff1f1" : "#fff",
              cursor: "pointer",
              boxShadow: allYears && filterStatus === "open" ? "0 0 0 2px #fca5a5" : "none",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Open Actions</p>
              </div>
              <span style={{ fontSize: "0.65rem", color: "#9ca3af", fontStyle: "italic" }}>click to view all</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{openActions}</p>
            <p className="text-xs text-gray-500 mt-0.5">Treat or urgent — unresolved · all years</p>
          </button>
          <button
            onClick={() => { setFilterStatus("monitor"); setAllYears(true); setFilterAction("all"); setSearch(""); setResolvedThisMonthMode(false); }}
            className="bg-white rounded-lg border p-4 text-left transition-all"
            style={{
              borderColor: allYears && filterStatus === "monitor" ? "#d97706" : "#fde68a",
              background: allYears && filterStatus === "monitor" ? "#fffbeb" : "#fff",
              cursor: "pointer",
              boxShadow: allYears && filterStatus === "monitor" ? "0 0 0 2px #fcd34d" : "none",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-yellow-600" />
                <p className="text-xs text-yellow-600 uppercase tracking-wide font-medium">Monitoring</p>
              </div>
              <span style={{ fontSize: "0.65rem", color: "#9ca3af", fontStyle: "italic" }}>click to view all</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{monitored}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active monitoring flags · all years</p>
          </button>
          <button
            onClick={() => { setResolvedThisMonthMode(true); setFilterStatus("resolved"); setAllYears(true); setFilterAction("all"); setSearch(""); }}
            className="bg-white rounded-lg border p-4 text-left transition-all"
            style={{
              borderColor: resolvedThisMonthMode ? "#16a34a" : "#bbf7d0",
              background: resolvedThisMonthMode ? "#f0fdf4" : "#fff",
              cursor: "pointer",
              boxShadow: resolvedThisMonthMode ? "0 0 0 2px #86efac" : "none",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Resolved This Month</p>
              </div>
              <span style={{ fontSize: "0.65rem", color: "#9ca3af", fontStyle: "italic" }}>click to view</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{resolvedThisMonth}</p>
            <p className="text-xs text-gray-500 mt-0.5">Resolved in {thisMonthLabel} · all years</p>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {(allYears || resolvedThisMonthMode) && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8,
              background: resolvedThisMonthMode ? "#f0fdf4" : filterStatus === "open" ? "#fff1f1" : "#fffbeb",
              border: `1px solid ${resolvedThisMonthMode ? "#86efac" : filterStatus === "open" ? "#fca5a5" : "#fcd34d"}`,
              fontSize: "0.8125rem",
              color: resolvedThisMonthMode ? "#15803d" : filterStatus === "open" ? "#991b1b" : "#92400e",
              fontWeight: 500, marginBottom: 8,
            }}>
              <span>
                {resolvedThisMonthMode
                  ? `🟢 Resolved in ${thisMonthLabel} — all years (${filtered.length} record${filtered.length !== 1 ? "s" : ""})`
                  : filterStatus === "open"
                    ? `🔴 Showing all years — Open Actions (${filtered.length} records)`
                    : `🟡 Showing all years — Monitoring (${filtered.length} records)`}
              </span>
              <button
                onClick={() => { setAllYears(false); setFilterStatus("all"); setResolvedThisMonthMode(false); }}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "inherit", padding: "0 2px", lineHeight: 1 }}
                title="Clear — return to crop year view"
              >
                ✕ Clear
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by field or inspector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterField} onValueChange={setFilterField}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All fields" />
              </SelectTrigger>
              <SelectContent className="max-h-64 overflow-y-auto">
                <SelectItem value="__all__">All fields</SelectItem>
                {registeredFields.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setAllYears(false); setResolvedThisMonthMode(false); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open actions</SelectItem>
                <SelectItem value="monitor">Monitoring</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <CropYearSelector value={cropYear} onChange={(y) => { setCropYear(y); setAllYears(false); setResolvedThisMonthMode(false); }} />
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="treat">Treat</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="none">No action</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading inspections…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <ClipboardCheck className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">No inspections found</p>
              <p className="text-gray-400 text-xs">Field inspections logged from the mobile app will appear here</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Field</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Crop</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Observations</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Inspector</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    id={`inspection-row-${r.id}`}
                    className={`border-b border-gray-50 transition-colors ${highlightId === r.id ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{r.fieldName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.inspectionDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.cropType || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <span className="line-clamp-2">{r.pestDiseaseObservations || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <ActionBadge action={r.actionRequired} resolved={r.isResolved} />
                        {!r.isResolved && (inspectionTaskMap[r.id] ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 w-fit">
                            <ClipboardList className="w-2.5 h-2.5" />{inspectionTaskMap[r.id]} task{inspectionTaskMap[r.id] !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.inspector || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setDetailRecord(r); setResolveOpen(false); }}>
                            <Eye className="w-3.5 h-3.5 mr-2" />View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditInspection(r)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />Edit
                          </DropdownMenuItem>
                          {!r.isResolved && (r.actionRequired === "treat" || r.actionRequired === "urgent" || r.actionRequired === "monitor") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-indigo-700 focus:text-indigo-700" onClick={() => setRaiseTaskRecord(r)}>
                                <UserPlus className="w-3.5 h-3.5 mr-2" />Raise Task
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-green-700 focus:text-green-700" onClick={() => openResolve(r)}>
                                <CheckSquare className="w-3.5 h-3.5 mr-2" />Mark as Resolved
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail / View dialog */}
      {detailRecord && !resolveOpen && (
        <Dialog open onOpenChange={() => setDetailRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-green-600" />
                Field Inspection — {detailRecord.fieldName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Date</p>
                  <p>{fmt(detailRecord.inspectionDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Inspector</p>
                  <p>{detailRecord.inspector || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Crop</p>
                  <p>{detailRecord.cropType || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Growth Stage</p>
                  <p>{detailRecord.growthStage || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Observations</p>
                <p className="text-gray-700 whitespace-pre-line">{detailRecord.pestDiseaseObservations || "None recorded"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Recommended Action</p>
                <p className="text-gray-700">{detailRecord.recommendedAction || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Action Required</p>
                <ActionBadge action={detailRecord.actionRequired} resolved={detailRecord.isResolved} />
              </div>
              {detailRecord.notes && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Notes</p>
                  <p className="text-gray-700 whitespace-pre-line">{detailRecord.notes}</p>
                </div>
              )}
              {detailRecord.isResolved && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Resolution</p>
                  <p className="text-gray-700">{detailRecord.resolutionNotes || "—"}</p>
                  <p className="text-xs text-gray-500">Resolved by {detailRecord.resolvedBy || "—"} on {fmt(detailRecord.resolvedAt)}</p>
                </div>
              )}
            </div>
            {farmId && <InspectionPhotoPanel recordId={detailRecord.id} farmId={farmId} photos={detailRecord.photos ?? []} />}
            {!detailRecord.isResolved && (inspectionTaskMap[detailRecord.id] ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-3 py-2 mb-1">
                <ClipboardList className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{inspectionTaskMap[detailRecord.id]} task{inspectionTaskMap[detailRecord.id] !== 1 ? "s" : ""} already raised — visible on the Task Board.</span>
              </div>
            )}
            <DialogFooter>
              {!detailRecord.isResolved && (detailRecord.actionRequired === "treat" || detailRecord.actionRequired === "urgent" || detailRecord.actionRequired === "monitor") && (
                <>
                  <Button variant="outline" className="text-indigo-700 border-indigo-300 hover:bg-indigo-50" onClick={() => { setRaiseTaskRecord(detailRecord); setDetailRecord(null); }}>
                    <UserPlus className="w-3.5 h-3.5 mr-1" />Raise Task
                  </Button>
                  <Button variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" onClick={() => { setResolveOpen(true); }}>
                    Mark as Resolved
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => { openEditInspection(detailRecord); setDetailRecord(null); }}>
                <Pencil className="w-3.5 h-3.5 mr-1" />Edit
              </Button>
              <Button variant="ghost" onClick={() => setDetailRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Resolve dialog */}
      {detailRecord && resolveOpen && (
        <Dialog open onOpenChange={o => { if (!o) { setResolveOpen(false); setDetailRecord(null); resolveMutation.reset(); } }}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Resolve Action — {detailRecord.fieldName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                <p className="font-medium mb-0.5">Action: {ACTION_LABELS[detailRecord.actionRequired]}</p>
                {detailRecord.pestDiseaseObservations && <p className="text-xs mt-1">{detailRecord.pestDiseaseObservations}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resolvedBy">Resolved by</Label>
                <Input
                  id="resolvedBy"
                  placeholder="Your name"
                  value={resolvedBy}
                  onChange={(e) => setResolvedBy(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resolutionNotes">Resolution notes</Label>
                <Textarea
                  id="resolutionNotes"
                  placeholder="Describe what action was taken to resolve this issue…"
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogMutationError mutation={resolveMutation} message="Failed to resolve — your entries are still here." />
            <DialogFooter>
              <Button variant="ghost" onClick={() => { setResolveOpen(false); setDetailRecord(null); }}>Cancel</Button>
              <Button
                className="bg-green-700 hover:bg-green-800 text-white"
                disabled={!resolvedBy || resolveMutation.isPending}
                onClick={() => resolveMutation.mutate(detailRecord.id)}
              >
                {resolveMutation.isPending ? "Saving…" : "Mark Resolved"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Add / Edit Inspection dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { closeInspectionForm(); createInspMut.reset(); updateInspMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 640 }}>
          <DialogHeader>
            <DialogTitle>{editRecord ? "Edit Inspection" : "Log Field Inspection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Field Name <span className="text-red-500">*</span></Label>
                {registeredFields.length > 0 && !fieldNameIsCustom ? (
                  <Select
                    value={form.fieldName || "__none__"}
                    onValueChange={v => {
                      if (v === "__custom__") { setFieldNameIsCustom(true); setForm(f => ({ ...f, fieldName: "" })); }
                      else { setForm(f => ({ ...f, fieldName: v === "__none__" ? "" : v })); }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select field…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Select field —</SelectItem>
                      {registeredFields.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      <SelectItem value="__custom__">✏ Enter manually…</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="e.g. North Field"
                      value={form.fieldName}
                      onChange={e => setForm(f => ({ ...f, fieldName: e.target.value }))}
                    />
                    {registeredFields.length > 0 && (
                      <Button type="button" variant="ghost" size="sm" className="px-2 text-xs text-gray-400 hover:text-gray-600 shrink-0" onClick={() => { setFieldNameIsCustom(false); setForm(f => ({ ...f, fieldName: "" })); }}>↩</Button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label>Inspection Date <span className="text-red-500">*</span></Label>
                <Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.inspectionDate} onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))} />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  Crop
                  {cropAutoFilled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 leading-none">
                      Auto-filled
                    </span>
                  )}
                </Label>
                <Select value={form.cropType || "__none__"} onValueChange={v => { setForm(f => ({ ...f, cropType: v === "__none__" ? "" : v, growthStage: "" })); setCropAutoFilled(false); }}>
                  <SelectTrigger><SelectValue placeholder="Select crop…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {UK_CROP_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Growth Stage</Label>
                <Select
                  value={form.growthStage || "__none__"}
                  onValueChange={v => setForm(f => ({ ...f, growthStage: v === "__none__" ? "" : v }))}
                  disabled={!form.cropType}
                >
                  <SelectTrigger><SelectValue placeholder={form.cropType ? "Select stage…" : "Select crop first"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {(form.cropType ? GROWTH_STAGES_BY_GROUP[getCropGroup(form.cropType)] : []).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Pest / Disease Observations</Label>
              <Textarea rows={3} placeholder="Describe what was observed in the field…" value={form.pestDiseaseObservations} onChange={e => setForm(f => ({ ...f, pestDiseaseObservations: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Action Required</Label>
                <Select value={form.actionRequired} onValueChange={(v) => setForm(f => ({ ...f, actionRequired: v as ActionRequired }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No action</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="treat">Treat</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                {canRaiseTask && (
                  <p className="text-xs text-indigo-600 mt-1">Use "Save &amp; Raise Task" to assign this to a staff member with SMS notification.</p>
                )}
              </div>
              <div>
                <Label>Inspector</Label>
                <Select value={form.inspector || ""} onValueChange={v => setForm(f => ({ ...f, inspector: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select inspector…" /></SelectTrigger>
                  <SelectContent>
                    {staff.filter(s => s.isActive).map(s => {
                      const name = `${s.firstName} ${s.lastName}`.trim();
                      return <SelectItem key={s.id} value={name}>{name}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.actionRequired !== "none" && (
              <div>
                <Label>Recommended Action</Label>
                <Input placeholder="e.g. Apply fungicide within 48 hours" value={form.recommendedAction} onChange={e => setForm(f => ({ ...f, recommendedAction: e.target.value }))} />
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea rows={2} placeholder="Additional notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogMutationError mutation={createInspMut} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={updateInspMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={closeInspectionForm}>Cancel</Button>
            {!editRecord && canRaiseTask && (
              <Button
                variant="outline"
                className="text-indigo-700 border-indigo-300 hover:bg-indigo-50"
                onClick={submitAndRaiseTask}
                disabled={!form.fieldName || !form.inspectionDate || createInspMut.isPending}
              >
                {createInspMut.isPending && raiseAfterSave.current
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</>
                  : <><UserPlus className="w-3.5 h-3.5 mr-1.5" />Save &amp; Raise Task</>}
              </Button>
            )}
            <Button onClick={submitInspectionForm} disabled={!form.fieldName || !form.inspectionDate || createInspMut.isPending || updateInspMut.isPending}>
              {createInspMut.isPending || updateInspMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Log Inspection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskRecord && farmId && (
        <RaiseTaskDialog
          inspection={raiseTaskRecord}
          farmId={farmId}
          staff={staff}
          onClose={() => setRaiseTaskRecord(null)}
          onRaised={() => {
            qc.invalidateQueries({ queryKey: ["task-assignments", farmId] });
            qc.invalidateQueries({ queryKey: ["field-inspections", farmId] });
          }}
        />
      )}
    </AppLayout>
  );
}
