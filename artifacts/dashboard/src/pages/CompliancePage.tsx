import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, AlertTriangle, Package, Edit2, Printer,
  Plus, Trash2, Phone, Mail, Save, Info, Bug, Target,
} from "lucide-react";

type Tab = "biosecurity" | "contingency" | "disease" | "recalls";

function parseAltSuppliers(raw: unknown): Array<{ name: string; phone?: string; notes?: string }> | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) return parsed;
  } catch { /* fall through */ }
  return null;
}

function parseEmergencyContacts(raw: unknown): Array<{ name: string; role?: string; phone?: string }> | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) return parsed;
  } catch { /* fall through */ }
  return null;
}

function altSuppliersToText(raw: unknown): string {
  const parsed = parseAltSuppliers(raw);
  if (parsed) {
    return parsed.map(s => [s.name, s.phone ? `Phone: ${s.phone}` : "", s.notes ? `Notes: ${s.notes}` : ""].filter(Boolean).join("\n")).join("\n\n");
  }
  return raw ? String(raw) : "";
}

function emergencyContactsToText(raw: unknown): string {
  const parsed = parseEmergencyContacts(raw);
  if (parsed) {
    return parsed.map(c => [c.name, c.role ? `Role: ${c.role}` : "", c.phone ? `Phone: ${c.phone}` : ""].filter(Boolean).join("\n")).join("\n\n");
  }
  return raw ? String(raw) : "";
}

const SPECIES = ["cattle", "sheep", "pigs", "poultry", "horses", "goats", "mixed", "other"];

const INCIDENT_TYPES = [
  { value: "disease_suspicion", label: "Disease Suspicion" },
  { value: "notifiable_disease", label: "Notifiable Disease" },
  { value: "illness_outbreak", label: "Illness Outbreak" },
  { value: "injury", label: "Injury" },
  { value: "other", label: "Other" },
];

const NOTIFIABLE_DISEASES = [
  "Foot and Mouth Disease (FMD)",
  "Bluetongue",
  "Avian Influenza (AI)",
  "African Swine Fever (ASF)",
  "Classical Swine Fever",
  "Brucellosis",
  "Bovine Tuberculosis (bTB)",
  "Anthrax",
  "Swine Vesicular Disease",
  "Newcastle Disease",
  "Lumpy Skin Disease",
  "Sheep and Goat Pox",
  "Other notifiable disease",
];

const CONCERN_TYPES = [
  { value: "contamination", label: "Suspected Contamination" },
  { value: "mislabelling", label: "Mislabelling / Wrong Product" },
  { value: "supplier_recall", label: "Supplier-Issued Recall" },
  { value: "disease_link", label: "Linked to Disease Incident" },
  { value: "regulatory_advice", label: "Regulatory / APHA Advice" },
  { value: "other", label: "Other" },
];

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}

function StatusBadge({ status }: { status: string }) {
  if (status === "open") return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Open</Badge>;
  if (status === "monitoring") return <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>Monitoring</Badge>;
  if (status === "resolved") return <Badge className="text-xs" style={{ background: "#dcfce7", color: "#166534", border: "none" }}>Resolved</Badge>;
  return <Badge className="text-xs">{status}</Badge>;
}

function NotifiableBadge() {
  return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>⚠ Notifiable Disease</Badge>;
}

function PlanSection({ title, value, onEdit }: { title: string; value?: string | null; onEdit?: () => void }) {
  if (!value && !onEdit) return null;
  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
      {value
        ? <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
        : <p className="text-sm text-gray-400 italic">Not completed — click Edit Plan to add this section.</p>}
    </div>
  );
}

function ReviewBadge({ date }: { date?: string | null }) {
  if (!date) return null;
  const due = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Review overdue</Badge>;
  if (diffDays <= 30) return <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>Review due soon</Badge>;
  return <Badge className="text-xs" style={{ background: "#dcfce7", color: "#166534", border: "none" }}>Review up to date</Badge>;
}

const SPECIES_OPTIONS = [
  { value: "cattle", label: "Cattle" },
  { value: "sheep", label: "Sheep" },
  { value: "pigs", label: "Pigs" },
  { value: "poultry", label: "Poultry" },
  { value: "horses", label: "Horses / Equine" },
  { value: "goats", label: "Goats" },
  { value: "mixed", label: "Mixed species" },
  { value: "all", label: "All species (total farm)" },
];

function SpeciesStockCard({
  target,
  stockRows,
  pendingFpoCount,
  onEdit,
  onDelete,
}: {
  target: Record<string, unknown>;
  stockRows: Array<{ currentStockKg: string; speciesIntended: string | null }>;
  pendingFpoCount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const species = String(target.species ?? "");
  const label = target.label ? String(target.label) : (SPECIES_OPTIONS.find(o => o.value === species)?.label ?? species);
  const dailyKg = parseFloat(String(target.dailyConsumptionKg ?? "0"));
  const minDays = Number(target.minimumStockDaysTarget ?? 0);
  const threshKg = target.alertThresholdKg ? parseFloat(String(target.alertThresholdKg)) : null;
  const relevant = species === "all" ? stockRows : stockRows.filter(r => r.speciesIntended === species);
  const totalKg = relevant.reduce((sum, r) => sum + parseFloat(r.currentStockKg ?? "0"), 0);
  const daysRemaining = dailyKg > 0 ? Math.floor(totalKg / dailyKg) : null;
  const isCritical = daysRemaining !== null && minDays > 0 && daysRemaining < Math.floor(minDays / 2);
  const isWarning = daysRemaining !== null && minDays > 0 && daysRemaining < minDays && !isCritical;
  const barPct = daysRemaining !== null && minDays > 0
    ? Math.min(100, Math.round((daysRemaining / (minDays * 2)) * 100))
    : daysRemaining !== null ? 100 : null;
  const barColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
  const bg = isCritical ? "#fff5f5" : isWarning ? "#fffbeb" : "#f0fdf4";
  const border = isCritical ? "#fca5a5" : isWarning ? "#fde68a" : "#bbf7d0";
  const textColor = isCritical ? "#b91c1c" : isWarning ? "#92400e" : "#166534";
  return (
    <div className="rounded-lg p-4" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="text-sm font-semibold text-gray-800">{label}</h5>
          {String(target.label ?? "") && <p className="text-xs text-gray-500 capitalize">{species} feed stocks</p>}
        </div>
        <div className="flex items-center gap-1">
          {daysRemaining !== null && (
            <span className="text-xs font-bold px-2 py-0.5 rounded mr-1" style={{ background: barColor, color: "#fff" }}>
              {isCritical ? "CRITICAL" : isWarning ? "BELOW TARGET" : "OK"}
            </span>
          )}
          {onEdit && (
            <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 p-1 rounded" title="Edit target">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1 rounded" title="Remove target">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center mb-2.5">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Stock on farm</p>
          <p className="text-base font-bold text-gray-800">{Math.round(totalKg).toLocaleString()} kg</p>
          {threshKg !== null && totalKg < threshKg && (
            <p className="text-xs mt-0.5" style={{ color: "#b91c1c" }}>Below {Math.round(threshKg).toLocaleString()} kg alert</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Days remaining</p>
          {daysRemaining !== null
            ? <p className="text-xl font-bold" style={{ color: barColor }}>{daysRemaining}</p>
            : <p className="text-xs text-gray-400 mt-1.5">Set daily usage</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Min. target</p>
          <p className="text-base font-bold text-gray-800">{minDays > 0 ? `${minDays} days` : "—"}</p>
          {dailyKg > 0 && <p className="text-xs text-gray-500">{dailyKg} kg/day</p>}
        </div>
      </div>
      {barPct !== null && (
        <div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.5)" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${barPct}%`, background: barColor }} />
          </div>
          {isCritical && (
            <p className="text-xs mt-1" style={{ color: textColor }}>
              Critically low — order urgently and activate your contingency plan.{" "}
              {pendingFpoCount && pendingFpoCount > 0
                ? <a href="/dashboard/feed?tab=orders" className="underline font-medium" style={{ color: textColor }}>{pendingFpoCount} order{pendingFpoCount !== 1 ? "s" : ""} pending →</a>
                : <a href="/dashboard/feed?tab=orders" className="underline font-medium" style={{ color: textColor }}>Raise a feed order →</a>
              }
            </p>
          )}
          {isWarning && (
            <p className="text-xs mt-1" style={{ color: textColor }}>
              Stock is below your {minDays}-day minimum. Consider placing an order now.{" "}
              {pendingFpoCount && pendingFpoCount > 0
                ? <a href="/dashboard/feed?tab=orders" className="underline font-medium" style={{ color: textColor }}>{pendingFpoCount} order{pendingFpoCount !== 1 ? "s" : ""} pending →</a>
                : <a href="/dashboard/feed?tab=orders" className="underline font-medium" style={{ color: textColor }}>Raise a feed order →</a>
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompliancePage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("biosecurity");

  // ── Biosecurity plan state
  const [editingBio, setEditingBio] = useState(false);
  const [bioForm, setBioForm] = useState<Record<string, string>>({});

  // ── Contingency plan state
  const [editingContingency, setEditingContingency] = useState(false);
  const [contingencyForm, setContingencyForm] = useState<Record<string, string>>({});

  // ── Disease incident state
  const [showDiseaseDialog, setShowDiseaseDialog] = useState(false);
  const [editDisease, setEditDisease] = useState<Record<string, unknown> | null>(null);
  const [diseaseForm, setDiseaseForm] = useState<Record<string, string>>({});

  // ── Feed recall state
  const [showRecallDialog, setShowRecallDialog] = useState(false);
  const [editRecall, setEditRecall] = useState<Record<string, unknown> | null>(null);
  const [recallForm, setRecallForm] = useState<Record<string, string>>({});

  // ── Species stock target state
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [targetForm, setTargetForm] = useState<Record<string, string>>({});

  // ── Data queries
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const bioQ = useQuery({
    queryKey: ["biosecurity-plan", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biosecurity-plan`).then(r => r.json()),
    enabled: !!farmId,
  });
  const contingencyQ = useQuery({
    queryKey: ["feed-contingency-plan", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-contingency-plan`).then(r => r.json()),
    enabled: !!farmId,
  });
  const diseaseQ = useQuery({
    queryKey: ["disease-incidents", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/disease-incidents`).then(r => r.json()),
    enabled: !!farmId,
  });
  const recallsQ = useQuery({
    queryKey: ["feed-recalls", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-recalls`).then(r => r.json()),
    enabled: !!farmId,
  });
  const suppliersQ = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const vetPlansQ = useQuery({
    queryKey: ["vet-health-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-health-plans`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const deliveriesQ = useQuery({
    queryKey: ["feed-deliveries-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-deliveries`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const feedStockQ = useQuery<{ records: Array<{ currentStockKg: string; speciesIntended: string | null }> }>({
    queryKey: ["feed-stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then(r => r.json()),
    enabled: !!farmId && tab === "contingency",
  });
  const feedStockTargetsQ = useQuery<{ records: Record<string, unknown>[] }>({
    queryKey: ["feed-stock-targets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock-targets`).then(r => r.json()),
    enabled: !!farmId && tab === "contingency",
  });
  const feedFpoQ = useQuery<Record<string, unknown>[]>({
    queryKey: ["feed-purchase-orders-compliance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-purchase-orders`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId && tab === "contingency",
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["biosecurity-plan", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-contingency-plan", farmId] });
    qc.invalidateQueries({ queryKey: ["disease-incidents", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-recalls", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] });
  }

  const addTargetM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/feed-stock-targets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] }); toast({ title: "Species target added" }); },
  });
  const updateTargetM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/feed-stock-targets/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] }); toast({ title: "Target updated" }); },
  });
  const deleteTargetM = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/feed-stock-targets/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] }); toast({ title: "Target removed" }); },
  });

  const farmDetail = farmQ.data?.record ?? farmQ.data?.farm ?? null;
  const bio = bioQ.data?.plan ?? null;
  const contingency = contingencyQ.data?.plan ?? null;
  const diseases: Record<string, unknown>[] = diseaseQ.data?.records ?? [];
  const recalls: Record<string, unknown>[] = recallsQ.data?.records ?? [];
  const speciesTargets: Record<string, unknown>[] = feedStockTargetsQ.data?.records ?? [];
  const allFpos: Record<string, unknown>[] = feedFpoQ.data ?? [];
  const activeFpos = allFpos.filter(o => !["received", "cancelled"].includes(String(o.status)));
  function fpoCountForSpecies(species: string) {
    if (species === "all") return activeFpos.length;
    return activeFpos.filter(o => String(o.speciesIntended ?? "") === species).length;
  }

  const allSuppliers: Record<string, unknown>[] = (suppliersQ.data ?? []).filter((s: Record<string, unknown>) => s.isActive !== false);
  const vetRecords: Record<string, unknown>[] = vetPlansQ.data ?? [];
  const knownVetNames: string[] = [...new Set(vetRecords.map((v) => String(v.vetName ?? "")).filter(Boolean))];
  const knownHerdNames: string[] = [...new Set((herdsQ.data ?? []).map((h: Record<string, unknown>) => String(h.name ?? "")).filter(Boolean))];
  const knownFeedProducts: string[] = [...new Set((deliveriesQ.data ?? []).map((d: Record<string, unknown>) => String(d.productName ?? "")).filter(Boolean))];

  // ── Mutations: biosecurity plan
  const bioMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/biosecurity-plan`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setEditingBio(false); toast({ title: "Biosecurity plan saved" }); },
    onError: () => toast({ title: "Error saving plan", variant: "destructive" }),
  });

  // ── Mutations: contingency plan
  const contingencyMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/feed-contingency-plan`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setEditingContingency(false); toast({ title: "Contingency plan saved" }); },
    onError: () => toast({ title: "Error saving plan", variant: "destructive" }),
  });

  // ── Mutations: disease incidents
  const diseaseMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editDisease ? `/api/farms/${farmId}/disease-incidents/${editDisease.id}` : `/api/farms/${farmId}/disease-incidents`;
      const res = await fetch(url, { method: editDisease ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowDiseaseDialog(false); toast({ title: editDisease ? "Incident updated" : "Incident logged" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const delDiseaseMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/disease-incidents/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Record deleted" }); },
  });

  // ── Mutations: feed recalls
  const recallMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editRecall ? `/api/farms/${farmId}/feed-recalls/${editRecall.id}` : `/api/farms/${farmId}/feed-recalls`;
      const res = await fetch(url, { method: editRecall ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowRecallDialog(false); toast({ title: editRecall ? "Recall updated" : "Recall incident raised" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const delRecallMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/feed-recalls/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Recall record deleted" }); },
  });

  // ── Helpers: open dialogs
  function openDiseaseAdd() {
    setEditDisease(null);
    setDiseaseForm({ incidentType: "disease_suspicion", status: "open", incidentDate: new Date().toISOString().substring(0, 10) });
    setShowDiseaseDialog(true);
  }
  function openDiseaseEdit(r: Record<string, unknown>) {
    setEditDisease(r);
    const form: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) {
      if (v !== null && v !== undefined) {
        if (typeof v === "boolean") form[k] = v ? "true" : "false";
        else form[k] = String(v).substring(0, 10) === String(v).substring(0, 10) && /^\d{4}-\d{2}-\d{2}T/.test(String(v)) ? String(v).substring(0, 10) : String(v);
      }
    }
    setDiseaseForm(form);
    setShowDiseaseDialog(true);
  }

  function openRecallAdd() {
    setEditRecall(null);
    setRecallForm({ status: "open", concernType: "contamination", raisedDate: new Date().toISOString().substring(0, 10) });
    setShowRecallDialog(true);
  }
  function openRecallEdit(r: Record<string, unknown>) {
    setEditRecall(r);
    const form: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) {
      if (v !== null && v !== undefined) {
        if (typeof v === "boolean") form[k] = v ? "true" : "false";
        else form[k] = String(v);
      }
    }
    setRecallForm(form);
    setShowRecallDialog(true);
  }

  // ── Start editing plan
  function startEditBio() {
    const p = bio ?? {};
    setBioForm(Object.fromEntries(
      Object.entries(p).map(([k, v]) => [k, v === null || v === undefined ? "" : String(v)])
    ));
    setEditingBio(true);
  }
  function startEditContingency() {
    const p = contingency ?? {};
    const form: Record<string, string> = {};
    for (const [k, v] of Object.entries(p)) {
      if (k === "alternativeSuppliers") { form[k] = altSuppliersToText(v); }
      else if (k === "emergencyContacts") { form[k] = emergencyContactsToText(v); }
      else { form[k] = v === null || v === undefined ? "" : String(v); }
    }
    setContingencyForm(form);
    setEditingContingency(true);
  }

  // ── Print
  function printPlan() { window.print(); }

  function printDeclarationForm() {
    const fd = farmDetail as Record<string, unknown> | null;
    const farmName  = fd ? String(fd.name  ?? "") : "";
    const farmAddr  = fd ? String(fd.address  ?? "") : "";
    const farmPost  = fd ? String(fd.postcode  ?? "") : "";
    const farmCph   = fd ? String(fd.cphNumber ?? "") : "";
    const b = bio as Record<string, unknown> | null;
    const restrictedAreas   = b ? String(b.restrictedAreas   ?? "") : "";
    const visitorProcedures = b ? String(b.visitorProcedures ?? "") : "";
    const footwearHygiene   = b ? String(b.footwearHygieneProcedures ?? "") : "";
    const vetName  = b ? String(b.farmVetName  ?? "") : "";
    const vetPhone = b ? String(b.farmVetPhone ?? "") : "";
    const aphaPhone = b ? String(b.aphaPhone ?? "03000 200 301") : "03000 200 301";

    function ruleLines(text: string, fallback: string): string {
      if (!text.trim()) return `<li>${fallback}</li>`;
      return text.split(/\n+/).filter(Boolean).slice(0, 5).map(l => `<li>${l.trim()}</li>`).join("");
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Visitor Biosecurity Declaration — ${farmName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; background: #fff; }
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }

  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a5c2e; padding-bottom: 8px; margin-bottom: 10px; }
  .header-left h1 { font-size: 18pt; font-weight: 800; color: #1a5c2e; line-height: 1.1; }
  .header-left p  { font-size: 9pt; color: #444; margin-top: 2px; }
  .header-right   { text-align: right; font-size: 9pt; color: #444; }
  .header-right strong { display: block; font-size: 11pt; color: #1a5c2e; }

  .warning-banner { background: #fff3cd; border: 1.5px solid #f0ad4e; border-radius: 5px; padding: 6px 10px; font-size: 9pt; font-weight: 700; color: #7c5800; margin-bottom: 10px; }
  .warning-banner span { font-weight: 400; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .box { border: 1.5px solid #c8d8c8; border-radius: 5px; padding: 8px 10px; }
  .box h2 { font-size: 10pt; font-weight: 700; color: #1a5c2e; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.3px; }
  .box ul { padding-left: 16px; }
  .box ul li { font-size: 9pt; color: #222; margin-bottom: 3px; line-height: 1.35; }

  .declaration-box { border: 2px solid #1a5c2e; border-radius: 5px; padding: 8px 12px; margin-bottom: 10px; }
  .declaration-box h2 { font-size: 10pt; font-weight: 700; color: #1a5c2e; text-transform: uppercase; margin-bottom: 6px; }
  .declaration-box ol { padding-left: 18px; }
  .declaration-box ol li { font-size: 9.5pt; margin-bottom: 4px; line-height: 1.35; }

  .table-section h2 { font-size: 10pt; font-weight: 700; color: #1a5c2e; text-transform: uppercase; margin-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a5c2e; color: #fff; font-size: 8.5pt; font-weight: 700; padding: 5px 4px; text-align: left; white-space: nowrap; }
  td { border: 1px solid #bbb; font-size: 8.5pt; padding: 0; height: 24px; }
  td.writeable { min-width: 0; }
  tr:nth-child(even) td { background: #f6faf6; }

  .footer { margin-top: 8px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt; color: #666; border-top: 1px solid #ccc; padding-top: 5px; }
  .emergency { font-size: 8.5pt; }
  .emergency strong { color: #c00; }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>Visitor &amp; Contractor<br>Biosecurity Declaration</h1>
    <p>${farmName}${farmAddr ? " · " + farmAddr : ""}${farmPost ? ", " + farmPost : ""}</p>
  </div>
  <div class="header-right">
    ${farmCph ? `<strong>CPH: ${farmCph}</strong>` : ""}
    <div>Form version: ${new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
    <div>Red Tractor Assured</div>
  </div>
</div>

<div class="warning-banner">
  &#9888; ALL visitors and contractors must read these rules and sign below before entering the farm.
  <span>Failure to comply may require you to leave the premises.</span>
</div>

<div class="two-col">
  <div class="box">
    <h2>&#128683; Restricted Areas</h2>
    <ul>
      ${ruleLines(restrictedAreas, "Only proceed to areas you have been authorised to enter.")}
      <li>Do not enter livestock buildings unless accompanied by farm staff.</li>
    </ul>
  </div>
  <div class="box">
    <h2>&#9755; Before You Enter</h2>
    <ul>
      ${ruleLines(visitorProcedures, "Report to the farmhouse or office before going anywhere on the farm.")}
      ${ruleLines(footwearHygiene, "Clean and disinfect all footwear using the facilities provided.")}
    </ul>
  </div>
</div>

<div class="declaration-box">
  <h2>&#9989; Declaration — Please read carefully before signing</h2>
  <ol>
    <li>I have <strong>not been in contact with livestock</strong> or visited a farm, livestock market, abattoir, or agricultural show in a <strong>foreign country in the past 7 days</strong>.</li>
    <li>I have <strong>not been in contact with pigs</strong> (or pig premises) in the past 48 hours, unless I have cleaned and disinfected all clothing and footwear used at that time.</li>
    <li>I have <strong>cleaned and disinfected my footwear</strong> before entering or I will use the foot dip / overshoes provided.</li>
    <li>I will follow all farm biosecurity rules as explained to me and <strong>will not deviate from agreed routes</strong> on this farm.</li>
    <li>I will <strong>report immediately</strong> any sign of disease, injury, dead animals, or unusual odour to the farm contact named below.</li>
    <li>I understand that <strong>food, drink, and smoking</strong> are not permitted in livestock buildings or feed stores.</li>
    <li>I confirm that I have read and understood this declaration and agree to abide by it.</li>
  </ol>
</div>

<div class="table-section">
  <h2>&#9998; Visitor / Contractor Sign-In Register</h2>
  <table>
    <thead>
      <tr>
        <th style="width:16%">Full Name</th>
        <th style="width:16%">Company / Organisation</th>
        <th style="width:14%">Reason for Visit</th>
        <th style="width:10%">Vehicle Reg</th>
        <th style="width:9%">Date</th>
        <th style="width:6%">Time In</th>
        <th style="width:6%">Time Out</th>
        <th style="width:12%">Mobile Number</th>
        <th style="width:11%">Signature</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from({ length: 9 }).map(() => "<tr>" + "<td class='writeable'></td>".repeat(9) + "</tr>").join("")}
    </tbody>
  </table>
</div>

<div class="footer">
  <div class="emergency">
    <strong>Emergency contacts:</strong>&nbsp;
    Farm contact: <strong>${vetName || "See farm office"}</strong>${vetPhone ? " — " + vetPhone : ""}&nbsp;&nbsp;|&nbsp;&nbsp;
    APHA (disease suspicion): <strong>${aphaPhone}</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
    Emergency services: <strong>999</strong>
  </div>
  <div>Please leave this form with the farm contact when you depart.</div>
</div>

</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) { alert("Please allow pop-ups to print the declaration form."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  return (
    <AppLayout title="Compliance & Contingency Plans">
      <p className="text-sm text-gray-500 mb-4">
        Written plans and incident records required for Red Tractor, APHA, and cross-compliance inspections.
      </p>

      <TabBar className="mb-6">
        <TabButton active={tab === "biosecurity"} onClick={() => setTab("biosecurity")}><ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />Biosecurity Plan</TabButton>
        <TabButton active={tab === "contingency"} onClick={() => setTab("contingency")}><Package className="w-3.5 h-3.5 mr-1 inline" />Feed Contingency Plan</TabButton>
        <TabButton active={tab === "disease"} onClick={() => setTab("disease")}><Bug className="w-3.5 h-3.5 mr-1 inline" />Disease &amp; Incident Log ({diseases.length})</TabButton>
        <TabButton active={tab === "recalls"} onClick={() => setTab("recalls")}><AlertTriangle className="w-3.5 h-3.5 mr-1 inline" />Feed Recalls ({recalls.length})</TabButton>
      </TabBar>

      {/* ══ TAB 1: BIOSECURITY PLAN ══════════════════════════════════════════ */}
      {tab === "biosecurity" && (
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Farm Biosecurity Plan</h3>
              <p className="text-xs text-gray-500">Required by Red Tractor for all livestock sectors. Review annually and after any significant change to farm operations.</p>
            </div>
            <div className="flex gap-2">
              {!editingBio && <Button variant="outline" size="sm" onClick={printDeclarationForm}><Printer className="w-3.5 h-3.5 mr-1" />Visitor Declaration Form</Button>}
              {!editingBio && <Button variant="outline" size="sm" onClick={printPlan}><Printer className="w-3.5 h-3.5 mr-1" />Print Plan</Button>}
              {!editingBio && <Button className="bg-green-800 hover:bg-green-900 text-white" size="sm" onClick={startEditBio}><Edit2 className="w-3.5 h-3.5 mr-1" />{bio ? "Edit Plan" : "Create Plan"}</Button>}
              {editingBio && <Button variant="outline" size="sm" onClick={() => setEditingBio(false)}>Cancel</Button>}
              {editingBio && <Button className="bg-green-800 hover:bg-green-900 text-white" size="sm" onClick={() => bioMut.mutate(bioForm)} disabled={bioMut.isPending}><Save className="w-3.5 h-3.5 mr-1" />Save Plan</Button>}
            </div>
          </div>

          {/* Compliance status */}
          {bio && (
            <div className="flex flex-wrap gap-2 mb-4">
              <ReviewBadge date={String(bio.nextReviewDate ?? "")} />
              {bio.planAuthor && <span className="text-xs text-gray-500">Author: {String(bio.planAuthor)}</span>}
              {bio.approvedBy && <span className="text-xs text-gray-500">Approved by: {String(bio.approvedBy)}</span>}
              {bio.versionNumber && <span className="text-xs text-gray-500">v{String(bio.versionNumber)}</span>}
              {bio.lastReviewedDate && <span className="text-xs text-gray-500">Last reviewed: {fmtDate(String(bio.lastReviewedDate))}</span>}
            </div>
          )}

          {editingBio ? (
            <div className="grid gap-5">
              {/* Emergency contacts */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-red-800 mb-3">Emergency Contacts</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Farm Vet Name</Label>
                    <Input
                      list="vet-names-list"
                      value={bioForm.farmVetName ?? ""}
                      onChange={e => {
                        const name = e.target.value;
                        const match = vetRecords.find(v => String(v.vetName ?? "") === name);
                        setBioForm(f => ({
                          ...f,
                          farmVetName: name,
                          ...(match ? { farmVetPhone: String(match.practicePhone ?? f.farmVetPhone ?? "") } : {}),
                        }));
                      }}
                      placeholder="Select or type vet name"
                    />
                    <datalist id="vet-names-list">{knownVetNames.map(n => <option key={n} value={n} />)}</datalist>
                  </div>
                  <div><Label>Vet Phone</Label><Input value={bioForm.farmVetPhone ?? ""} onChange={e => setBioForm(f => ({ ...f, farmVetPhone: e.target.value }))} /></div>
                  <div><Label>Vet Email</Label><Input value={bioForm.farmVetEmail ?? ""} onChange={e => setBioForm(f => ({ ...f, farmVetEmail: e.target.value }))} /></div>
                  <div><Label>APHA Area Office</Label><Input value={bioForm.aphaAreaOffice ?? ""} onChange={e => setBioForm(f => ({ ...f, aphaAreaOffice: e.target.value }))} placeholder="e.g. APHA Worcester" /></div>
                  <div><Label>APHA Phone</Label><Input value={bioForm.aphaPhone ?? ""} onChange={e => setBioForm(f => ({ ...f, aphaPhone: e.target.value }))} placeholder="03000 200 301" /></div>
                </div>
              </div>

              {/* Plan sections */}
              {[
                { key: "restrictedAreas", label: "1. Restricted Areas & Access Points", placeholder: "Describe which areas of the farm are restricted to farm personnel only. Where are the farm boundaries? Where should visitors be directed?" },
                { key: "visitorProcedures", label: "2. Visitor & Personnel Procedures", placeholder: "What must visitors do before entering? (sign-in, biosecurity declaration, clothing/footwear requirements, 48-hour livestock exclusion etc.)" },
                { key: "vehicleEntryProcedures", label: "3. Vehicle & Equipment Entry Controls", placeholder: "What cleaning or disinfection is required before vehicles enter? Where is the vehicle wash? Lorries, tractors, contractors' vehicles?" },
                { key: "footwearHygieneProcedures", label: "4. Footwear & Clothing Hygiene", placeholder: "When are overalls/boots required? Where are foot dips located? What disinfectant is used? How often are dips replenished?" },
                { key: "cleaningProtocols", label: "5. Cleaning & Disinfection Protocols", placeholder: "How and when are livestock housing, equipment, and vehicles cleaned and disinfected? Which products are approved?" },
                { key: "pestManagementApproach", label: "6. Pest Management", placeholder: "How is pest activity monitored and controlled? Who is the appointed pest contractor? What records are kept?" },
                { key: "newAnimalIsolationProcedures", label: "7. New Animal Isolation Procedures", placeholder: "How long are purchased animals isolated? In which building/area? What health checks are performed before introduction to the main herd?" },
                { key: "feedSecurityProcedures", label: "8. Feed Security & Contamination Prevention", placeholder: "How is feed stored and protected from vermin, chemicals, and cross-contamination? What checks are made on delivery?" },
                { key: "diseaseResponsePlan", label: "9. Disease Outbreak Response", placeholder: "Step-by-step actions if a disease outbreak is suspected: who to call first, how to isolate animals, movement restrictions, record-keeping, when to contact APHA." },
                { key: "diseaseSuspicionProcedures", label: "10. Notifiable Disease Suspicion Procedures", placeholder: "What are the clinical signs the farm team must know? Who to call immediately if a notifiable disease is suspected? APHA reporting obligation details." },
                { key: "wasteManagementProcedures", label: "11. Waste Management", placeholder: "How is farm waste (slurry, carcasses, medicines, sharps, packaging) managed and disposed of? Who are the licensed contractors?" },
                { key: "waterSourceProtection", label: "12. Water Source Protection", placeholder: "How are water sources protected from contamination? What treatment or testing is carried out?" },
                { key: "staffResponsibilities", label: "13. Staff Responsibilities & Training", placeholder: "Who is responsible for each area of biosecurity? What training do staff receive? How are contractors briefed?" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label className="text-sm font-medium">{label}</Label>
                  <Textarea className="mt-1" rows={4} value={bioForm[key] ?? ""} onChange={e => setBioForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                </div>
              ))}

              {/* Document control */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Document Control</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Plan Author</Label><Input value={bioForm.planAuthor ?? ""} onChange={e => setBioForm(f => ({ ...f, planAuthor: e.target.value }))} /></div>
                  <div><Label>Approved By</Label><Input value={bioForm.approvedBy ?? ""} onChange={e => setBioForm(f => ({ ...f, approvedBy: e.target.value }))} /></div>
                  <div><Label>Version</Label><Input value={bioForm.versionNumber ?? ""} onChange={e => setBioForm(f => ({ ...f, versionNumber: e.target.value }))} placeholder="e.g. 1.2" /></div>
                  <div><Label>Last Reviewed</Label><Input type="date" value={bioForm.lastReviewedDate ?? ""} onChange={e => setBioForm(f => ({ ...f, lastReviewedDate: e.target.value }))} /></div>
                  <div><Label>Next Review Due</Label><Input type="date" value={bioForm.nextReviewDate ?? ""} onChange={e => setBioForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
                  <div><Label>Notes</Label><Input value={bioForm.notes ?? ""} onChange={e => setBioForm(f => ({ ...f, notes: e.target.value }))} /></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-5 print:shadow-none print:border-none">
              {!bio ? (
                <div className="text-center py-16 text-gray-400">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No biosecurity plan on record</p>
                  <p className="text-sm mb-4">A written biosecurity plan is a Red Tractor requirement. Click Create Plan to document your farm's procedures.</p>
                  <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={startEditBio}><Plus className="w-4 h-4 mr-1" />Create Biosecurity Plan</Button>
                </div>
              ) : (
                <>
                  {/* Emergency contacts card */}
                  {(bio.farmVetName || bio.aphaAreaOffice) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
                      <h4 className="text-sm font-semibold text-red-800 mb-2">Emergency Contacts</h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {bio.farmVetName && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Farm Vet</p>
                            <p className="font-semibold">{String(bio.farmVetName)}</p>
                            {bio.farmVetPhone && <p className="flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3" />{String(bio.farmVetPhone)}</p>}
                            {bio.farmVetEmail && <p className="flex items-center gap-1 text-gray-600"><Mail className="w-3 h-3" />{String(bio.farmVetEmail)}</p>}
                          </div>
                        )}
                        {bio.aphaAreaOffice && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium">APHA</p>
                            <p className="font-semibold">{String(bio.aphaAreaOffice)}</p>
                            {bio.aphaPhone && <p className="flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3" />{String(bio.aphaPhone)}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <PlanSection title="1. Restricted Areas & Access Points" value={String(bio.restrictedAreas ?? "")} />
                  <PlanSection title="2. Visitor & Personnel Procedures" value={String(bio.visitorProcedures ?? "")} />
                  <PlanSection title="3. Vehicle & Equipment Entry Controls" value={String(bio.vehicleEntryProcedures ?? "")} />
                  <PlanSection title="4. Footwear & Clothing Hygiene" value={String(bio.footwearHygieneProcedures ?? "")} />
                  <PlanSection title="5. Cleaning & Disinfection Protocols" value={String(bio.cleaningProtocols ?? "")} />
                  <PlanSection title="6. Pest Management" value={String(bio.pestManagementApproach ?? "")} />
                  <PlanSection title="7. New Animal Isolation Procedures" value={String(bio.newAnimalIsolationProcedures ?? "")} />
                  <PlanSection title="8. Feed Security & Contamination Prevention" value={String(bio.feedSecurityProcedures ?? "")} />
                  <PlanSection title="9. Disease Outbreak Response" value={String(bio.diseaseResponsePlan ?? "")} />
                  <PlanSection title="10. Notifiable Disease Suspicion Procedures" value={String(bio.diseaseSuspicionProcedures ?? "")} />
                  <PlanSection title="11. Waste Management" value={String(bio.wasteManagementProcedures ?? "")} />
                  <PlanSection title="12. Water Source Protection" value={String(bio.waterSourceProtection ?? "")} />
                  <PlanSection title="13. Staff Responsibilities & Training" value={String(bio.staffResponsibilities ?? "")} />
                  {bio.notes && <PlanSection title="Additional Notes" value={String(bio.notes)} />}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB 2: FEED CONTINGENCY PLAN ══════════════════════════════════════ */}
      {tab === "contingency" && (
        <div className="max-w-4xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Feed Supply Contingency Plan</h3>
              <p className="text-xs text-gray-500">Required by Red Tractor. Documents what you will do if your primary feed supply is disrupted — supplier failure, contamination, extreme weather, or a recall.</p>
            </div>
            <div className="flex gap-2">
              {!editingContingency && <Button variant="outline" size="sm" onClick={printPlan}><Printer className="w-3.5 h-3.5 mr-1" />Print Plan</Button>}
              {!editingContingency && <Button className="bg-green-800 hover:bg-green-900 text-white" size="sm" onClick={startEditContingency}><Edit2 className="w-3.5 h-3.5 mr-1" />{contingency ? "Edit Plan" : "Create Plan"}</Button>}
              {editingContingency && <Button variant="outline" size="sm" onClick={() => setEditingContingency(false)}>Cancel</Button>}
              {editingContingency && <Button className="bg-green-800 hover:bg-green-900 text-white" size="sm" onClick={() => contingencyMut.mutate(contingencyForm)} disabled={contingencyMut.isPending}><Save className="w-3.5 h-3.5 mr-1" />Save Plan</Button>}
            </div>
          </div>

          {contingency && !editingContingency && (
            <div className="flex flex-wrap gap-2 mb-4">
              <ReviewBadge date={String(contingency.nextReviewDate ?? "")} />
              {contingency.minimumStockDaysTarget && <Badge className="text-xs" style={{ background: "#dbeafe", color: "#1e40af", border: "none" }}>Minimum stock target: {String(contingency.minimumStockDaysTarget)} days</Badge>}
              {contingency.dailyConsumptionKg && <Badge className="text-xs" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>Daily usage: {String(contingency.dailyConsumptionKg)} kg/day</Badge>}
              {contingency.planAuthor && <span className="text-xs text-gray-500">Author: {String(contingency.planAuthor)}</span>}
              {contingency.lastReviewedDate && <span className="text-xs text-gray-500">Last reviewed: {fmtDate(String(contingency.lastReviewedDate))}</span>}
            </div>
          )}

          {editingContingency ? (
            <div className="grid gap-5">
              {/* Stock targets */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Stock Resilience Targets</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Minimum stock days target</Label>
                    <Input type="number" value={contingencyForm.minimumStockDaysTarget ?? ""} onChange={e => setContingencyForm(f => ({ ...f, minimumStockDaysTarget: e.target.value }))} placeholder="e.g. 14 (two weeks)" min="1" />
                    <p className="text-xs text-gray-400 mt-1">Minimum days' feed to hold on farm at all times.</p>
                  </div>
                  <div>
                    <Label>Daily consumption (kg/day)</Label>
                    <Input type="number" value={contingencyForm.dailyConsumptionKg ?? ""} onChange={e => setContingencyForm(f => ({ ...f, dailyConsumptionKg: e.target.value }))} placeholder="e.g. 180" min="0" step="1" />
                    <p className="text-xs text-gray-400 mt-1">Total feed used across all livestock groups per day.</p>
                  </div>
                  <div>
                    <Label>Alert threshold (kg)</Label>
                    <Input type="number" value={contingencyForm.alertThresholdKg ?? ""} onChange={e => setContingencyForm(f => ({ ...f, alertThresholdKg: e.target.value }))} placeholder="Total kg across all bins" min="0" />
                    <p className="text-xs text-gray-400 mt-1">Total stock level at which the contingency plan is activated.</p>
                  </div>
                </div>
              </div>

              {/* Primary supplier */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Primary Feed Supplier</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Supplier name</Label>
                    {allSuppliers.length > 0 ? (
                      <Select
                        value={contingencyForm.primarySupplierName ?? "__none__"}
                        onValueChange={v => {
                          const name = v === "__none__" ? "" : v;
                          const match = allSuppliers.find(s => String(s.name ?? "") === name);
                          setContingencyForm(f => ({
                            ...f,
                            primarySupplierName: name,
                            ...(match ? {
                              primarySupplierPhone: String(match.phone ?? f.primarySupplierPhone ?? ""),
                              primarySupplierEmail: String(match.email ?? f.primarySupplierEmail ?? ""),
                            } : {}),
                          }));
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Select supplier —</SelectItem>
                          {allSuppliers.map(s => <SelectItem key={String(s.id)} value={String(s.name ?? s.id)}>{String(s.name ?? s.id)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={contingencyForm.primarySupplierName ?? ""} onChange={e => setContingencyForm(f => ({ ...f, primarySupplierName: e.target.value }))} placeholder="Type supplier name" />
                    )}
                  </div>
                  <div><Label>Phone</Label><Input value={contingencyForm.primarySupplierPhone ?? ""} onChange={e => setContingencyForm(f => ({ ...f, primarySupplierPhone: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input value={contingencyForm.primarySupplierEmail ?? ""} onChange={e => setContingencyForm(f => ({ ...f, primarySupplierEmail: e.target.value }))} /></div>
                </div>
              </div>

              {/* Alternative suppliers */}
              <div>
                <Label className="text-sm font-medium">Alternative / Emergency Suppliers</Label>
                <Textarea className="mt-1" rows={4} value={contingencyForm.alternativeSuppliers ?? ""} onChange={e => setContingencyForm(f => ({ ...f, alternativeSuppliers: e.target.value }))}
                  placeholder={"List each alternative supplier on a new line, e.g.:\nFarm Direct Feeds — 01234 567890 — can deliver within 48 hrs\nCounty Mill — 01234 678901 — bulk maize available"} />
                <p className="text-xs text-gray-400 mt-1">List suppliers you could switch to quickly if your primary supplier fails. Include phone number and typical lead time.</p>
              </div>

              {/* Emergency contacts */}
              <div>
                <Label className="text-sm font-medium">Key Emergency Contacts</Label>
                <Textarea className="mt-1" rows={4} value={contingencyForm.emergencyContacts ?? ""} onChange={e => setContingencyForm(f => ({ ...f, emergencyContacts: e.target.value }))}
                  placeholder={"List contacts to notify if feed supply is disrupted, e.g.:\nFarm Manager — John Smith — 07700 900000\nVet — Manydown Vets — 01256 780000\nAHDB Crisis Line — 03000 200 301"} />
              </div>

              {/* Plan sections */}
              {[
                { key: "triggerConditions", label: "1. Trigger Conditions", placeholder: "What events will activate this plan? (e.g. stock falls below X days' supply, supplier goes into administration, product recall issued, extreme weather prevents delivery)" },
                { key: "immediateActions", label: "2. Immediate Actions", placeholder: "Step-by-step actions when the plan is triggered:\n1. Assess current stock levels across all bins\n2. Contact alternative suppliers\n3. Notify farm manager and owner\n..." },
                { key: "rationingProcedures", label: "3. Rationing Procedures", placeholder: "If stock is low, how will you prioritise which animals are fed? Which feed types can be reduced or substituted? What are the minimum nutritional requirements for each group?" },
                { key: "communicationPlan", label: "4. Communication Plan", placeholder: "Who needs to be notified and in what order? (Farm owner, farm manager, vet, bank/lender if extended disruption, Red Tractor assessor if compliance is affected)" },
                { key: "recordKeepingDuringIncident", label: "5. Record Keeping During Incident", placeholder: "What records must be kept during a supply disruption? (Daily stock counts, rationing decisions, communications with suppliers and authorities, animal welfare checks)" },
                { key: "recoveryActions", label: "6. Recovery & Return to Normal Operations", placeholder: "How will you rebuild stock to normal levels after the incident? What review will take place? Should the plan be updated?" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label className="text-sm font-medium">{label}</Label>
                  <Textarea className="mt-1" rows={4} value={contingencyForm[key] ?? ""} onChange={e => setContingencyForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                </div>
              ))}

              {/* Document control */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Document Control</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Plan Author</Label><Input value={contingencyForm.planAuthor ?? ""} onChange={e => setContingencyForm(f => ({ ...f, planAuthor: e.target.value }))} /></div>
                  <div><Label>Approved By</Label><Input value={contingencyForm.approvedBy ?? ""} onChange={e => setContingencyForm(f => ({ ...f, approvedBy: e.target.value }))} /></div>
                  <div><Label>Version</Label><Input value={contingencyForm.versionNumber ?? ""} onChange={e => setContingencyForm(f => ({ ...f, versionNumber: e.target.value }))} placeholder="e.g. 1.0" /></div>
                  <div><Label>Last Reviewed</Label><Input type="date" value={contingencyForm.lastReviewedDate ?? ""} onChange={e => setContingencyForm(f => ({ ...f, lastReviewedDate: e.target.value }))} /></div>
                  <div><Label>Next Review Due</Label><Input type="date" value={contingencyForm.nextReviewDate ?? ""} onChange={e => setContingencyForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-5 print:shadow-none print:border-none">
              {!contingency ? (
                <div className="text-center py-16 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No feed contingency plan on record</p>
                  <p className="text-sm mb-4">A written plan for feed supply disruption is a requirement under Red Tractor Feed Assurance. Click Create Plan to start.</p>
                  <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={startEditContingency}><Plus className="w-4 h-4 mr-1" />Create Contingency Plan</Button>
                </div>
              ) : (
                <>
                  {/* Live feed stock monitoring */}
                  {(() => {
                    const stocks = feedStockQ.data?.records ?? [];
                    const hasStocks = stocks.length > 0;
                    if (!hasStocks && !feedStockQ.isLoading && speciesTargets.length === 0) return null;
                    return (
                      <div className="mb-5">
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-gray-500" />
                            <h4 className="text-sm font-semibold text-gray-700">
                              {speciesTargets.length > 0 ? "Per-Species Stock Monitoring" : "Current Feed Stock Status"}
                            </h4>
                          </div>
                          <button
                            onClick={() => {
                              setEditTarget(null);
                              setTargetForm({ species: "cattle", dailyConsumptionKg: "", minimumStockDaysTarget: "", alertThresholdKg: "", label: "", notes: "" });
                              setShowTargetDialog(true);
                            }}
                            className="flex items-center gap-1 text-xs text-green-800 hover:text-green-900 font-medium border border-green-200 rounded px-2 py-1 hover:bg-green-50 print:hidden"
                          >
                            <Plus className="w-3 h-3" />Add species target
                          </button>
                        </div>

                        {/* Species cards (when targets configured) */}
                        {speciesTargets.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {speciesTargets.map(t => (
                              <SpeciesStockCard
                                key={String(t.id)}
                                target={t}
                                stockRows={stocks}
                                pendingFpoCount={fpoCountForSpecies(String(t.species ?? ""))}
                                onEdit={() => {
                                  setEditTarget(t);
                                  setTargetForm({
                                    species: String(t.species ?? "cattle"),
                                    label: String(t.label ?? ""),
                                    dailyConsumptionKg: String(t.dailyConsumptionKg ?? ""),
                                    minimumStockDaysTarget: String(t.minimumStockDaysTarget ?? ""),
                                    alertThresholdKg: String(t.alertThresholdKg ?? ""),
                                    notes: String(t.notes ?? ""),
                                  });
                                  setShowTargetDialog(true);
                                }}
                                onDelete={() => {
                                  if (confirm(`Remove ${t.label ?? t.species} monitoring target?`)) {
                                    deleteTargetM.mutate(Number(t.id));
                                  }
                                }}
                              />
                            ))}
                            <p className="text-xs text-gray-400">Based on live bin stock records. Only bins assigned to each species in Feed Management are counted.</p>
                          </div>
                        ) : (
                          /* Aggregate meter fallback (no species targets) */
                          (() => {
                            const totalKg = stocks.reduce((s, r) => s + parseFloat(r.currentStockKg ?? "0"), 0);
                            const dailyKg = contingency.dailyConsumptionKg ? parseFloat(String(contingency.dailyConsumptionKg)) : null;
                            const minDays = contingency.minimumStockDaysTarget ? Number(contingency.minimumStockDaysTarget) : null;
                            const daysRemaining = dailyKg && dailyKg > 0 ? Math.floor(totalKg / dailyKg) : null;
                            const isCritical = daysRemaining !== null && minDays !== null && daysRemaining < Math.floor(minDays / 2);
                            const isWarning = daysRemaining !== null && minDays !== null && daysRemaining < minDays && !isCritical;
                            const isOk = daysRemaining !== null && minDays !== null && daysRemaining >= minDays;
                            const barPct = daysRemaining !== null && minDays !== null
                              ? Math.min(100, Math.round((daysRemaining / (minDays * 1.5)) * 100))
                              : null;
                            const barColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
                            const bg = isCritical ? "#fff5f5" : isWarning ? "#fffbeb" : "#f0fdf4";
                            const border = isCritical ? "#fca5a5" : isWarning ? "#fde68a" : "#bbf7d0";
                            const textColor = isCritical ? "#b91c1c" : isWarning ? "#92400e" : "#166534";
                            if (!hasStocks && !feedStockQ.isLoading) return null;
                            return (
                              <div>
                                <div className="rounded-lg p-4" style={{ background: bg, border: `1px solid ${border}` }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-sm font-semibold" style={{ color: textColor }}>All Species (Combined)</h5>
                                    {daysRemaining !== null && (
                                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: barColor, color: "#fff" }}>
                                        {isCritical ? "CRITICAL" : isWarning ? "BELOW TARGET" : "OK"}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 text-center mb-3">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-0.5">Total stock on farm</p>
                                      <p className="text-lg font-bold text-gray-800">{Math.round(totalKg).toLocaleString()} kg</p>
                                    </div>
                                    {daysRemaining !== null ? (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Days of feed remaining</p>
                                        <p className="text-2xl font-bold" style={{ color: barColor }}>{daysRemaining}</p>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Days remaining</p>
                                        <p className="text-sm text-gray-400 mt-1">Set daily usage rate to calculate</p>
                                      </div>
                                    )}
                                    {minDays !== null ? (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Minimum target</p>
                                        <p className="text-lg font-bold text-gray-800">{minDays} days</p>
                                      </div>
                                    ) : <div />}
                                  </div>
                                  {barPct !== null && (
                                    <div>
                                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div className="h-2.5 rounded-full transition-all" style={{ width: `${barPct}%`, background: barColor }} />
                                      </div>
                                      {isCritical && (
                                        <p className="text-xs mt-1.5" style={{ color: textColor }}>
                                          Feed stock is critically low — order urgently and activate your contingency plan.{" "}
                                          <a href="/dashboard/feed" className="underline font-medium" style={{ color: textColor }}>Log a delivery in Feed Management →</a>
                                        </p>
                                      )}
                                      {isWarning && (
                                        <p className="text-xs mt-1.5" style={{ color: textColor }}>
                                          Stock is below your {minDays}-day minimum reserve. Consider placing an order now.{" "}
                                          <a href="/dashboard/feed" className="underline font-medium" style={{ color: textColor }}>Log a delivery in Feed Management →</a>
                                        </p>
                                      )}
                                      {isOk && <p className="text-xs mt-1.5 text-green-700">Stock is above your {minDays}-day minimum reserve. No action required.</p>}
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-400 mt-2">Based on live feed stock records. Update your bin levels in Feed Management to keep this accurate.</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Tip: use "Add species target" above to track cattle, sheep and other species separately with individual minimum stock targets.</p>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    );
                  })()}

                  {/* Quick-glance supplier contacts */}
                  {(contingency.primarySupplierName || contingency.alternativeSuppliers) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Supplier Contacts</h4>
                      {contingency.primarySupplierName && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 font-medium">Primary Supplier</p>
                          <p className="text-sm font-semibold">{String(contingency.primarySupplierName)}</p>
                          <div className="flex gap-4 text-xs text-gray-600 mt-0.5">
                            {contingency.primarySupplierPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{String(contingency.primarySupplierPhone)}</span>}
                            {contingency.primarySupplierEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{String(contingency.primarySupplierEmail)}</span>}
                          </div>
                        </div>
                      )}
                      {contingency.alternativeSuppliers && (() => {
                        const altParsed = parseAltSuppliers(contingency.alternativeSuppliers);
                        return (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mt-2">Alternative Suppliers</p>
                            {altParsed ? (
                              <div className="flex flex-col gap-1.5 mt-1">
                                {altParsed.map((s, i) => (
                                  <div key={i} className="rounded-md bg-white border border-blue-100 px-3 py-2">
                                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                                    {s.phone && <span className="flex items-center gap-1 text-xs text-gray-600 mt-0.5"><Phone className="w-3 h-3" />{s.phone}</span>}
                                    {s.notes && <p className="text-xs text-gray-500 mt-0.5">{s.notes}</p>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap mt-1">{String(contingency.alternativeSuppliers)}</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <PlanSection title="1. Trigger Conditions" value={String(contingency.triggerConditions ?? "")} />
                  <PlanSection title="2. Immediate Actions" value={String(contingency.immediateActions ?? "")} />
                  <PlanSection title="3. Rationing Procedures" value={String(contingency.rationingProcedures ?? "")} />
                  <PlanSection title="4. Communication Plan" value={String(contingency.communicationPlan ?? "")} />
                  <PlanSection title="5. Record Keeping During Incident" value={String(contingency.recordKeepingDuringIncident ?? "")} />
                  <PlanSection title="6. Recovery & Return to Normal" value={String(contingency.recoveryActions ?? "")} />
                  {contingency.emergencyContacts && (() => {
                    const ecParsed = parseEmergencyContacts(contingency.emergencyContacts);
                    if (ecParsed) {
                      return (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Emergency Contacts</h4>
                          <div className="flex flex-col gap-1.5">
                            {ecParsed.map((c, i) => (
                              <div key={i} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                <p className="text-sm font-medium text-gray-800">{c.name}</p>
                                {c.role && <p className="text-xs text-gray-500">{c.role}</p>}
                                {c.phone && <span className="flex items-center gap-1 text-xs text-gray-600 mt-0.5"><Phone className="w-3 h-3" />{c.phone}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return <PlanSection title="Emergency Contacts" value={String(contingency.emergencyContacts)} />;
                  })()}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB 3: DISEASE & INCIDENT LOG ════════════════════════════════════ */}
      {tab === "disease" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Disease & Health Incident Log</h3>
              <p className="text-xs text-gray-500">Timestamped record of all disease suspicions, confirmed illnesses, notifiable disease events, and actions taken. Required for APHA and Red Tractor.</p>
            </div>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={openDiseaseAdd}><Plus className="w-4 h-4 mr-1" />Log Incident</Button>
          </div>

          {/* Notifiable diseases banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 mb-4 flex gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Legal obligation:</strong> If you suspect a notifiable disease (FMD, Bluetongue, AI, ASF, Brucellosis, Anthrax etc.) you must contact APHA immediately — do not wait for laboratory confirmation. Failure to report is an offence. APHA Helpline: <strong>03000 200 301</strong></span>
          </div>

          {diseases.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bug className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No incidents logged</p>
              <p className="text-sm">Log any disease suspicion, illness outbreak, or notifiable disease event here as it occurs.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {diseases.map((r) => (
                <div key={String(r.id)} className={`rounded-xl border p-4 ${r.isNotifiableDisease ? "bg-red-50 border-red-200" : r.status === "open" ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{INCIDENT_TYPES.find(t => t.value === r.incidentType)?.label ?? String(r.incidentType)}</span>
                        <StatusBadge status={String(r.status ?? "open")} />
                        {r.isNotifiableDisease === true || r.isNotifiableDisease === "true" ? <NotifiableBadge /> : null}
                        {r.vetCalled === true || r.vetCalled === "true" ? <Badge className="text-xs" style={{ background: "#dbeafe", color: "#1e40af", border: "none" }}>Vet called</Badge> : null}
                        {r.reportedToAPHA === true || r.reportedToAPHA === "true" ? <Badge className="text-xs" style={{ background: "#f3e8ff", color: "#6b21a8", border: "none" }}>APHA reported</Badge> : null}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{fmtDate(String(r.incidentDate))} — {r.species ? `${String(r.species)}, ` : ""}{r.animalCount ? `${String(r.animalCount)} animals` : ""}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{String(r.symptomsObserved ?? "")}</p>
                      {r.confirmedDiagnosis && <p className="text-xs text-gray-500 mt-1">Confirmed: <span className="font-medium">{String(r.confirmedDiagnosis)}</span></p>}
                      {r.notifiableDiseaseType && <p className="text-xs text-red-700 mt-1 font-medium">Disease type: {String(r.notifiableDiseaseType)}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => openDiseaseEdit(r)} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => delDiseaseMut.mutate(Number(r.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB 4: FEED RECALLS ═══════════════════════════════════════════════ */}
      {tab === "recalls" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Feed Recall & Withdrawal Incidents</h3>
              <p className="text-xs text-gray-500">Log any feed that has been withdrawn, recalled, or raised a concern — contamination, mislabelling, supplier recall, or disease link.</p>
            </div>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={openRecallAdd}><Plus className="w-4 h-4 mr-1" />Raise Incident</Button>
          </div>

          {recalls.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No feed recall incidents on record</p>
              <p className="text-sm">Use this section to log any feed safety concern or withdrawal, even if resolved quickly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recalls.map((r) => (
                <div key={String(r.id)} className={`rounded-xl border p-4 ${r.status === "open" ? "bg-orange-50 border-orange-200" : r.status === "resolved" ? "bg-white border-gray-200" : "bg-yellow-50 border-yellow-200"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{String(r.productName ?? "Feed incident")}</span>
                        <StatusBadge status={String(r.status ?? "open")} />
                        {r.feedWithdrawn === true || r.feedWithdrawn === "true" ? <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Feed withdrawn</Badge> : null}
                        {r.reportedToAuthority === true || r.reportedToAuthority === "true" ? <Badge className="text-xs" style={{ background: "#f3e8ff", color: "#6b21a8", border: "none" }}>Authority notified</Badge> : null}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        Raised: {fmtDate(String(r.raisedDate))}
                        {r.feedBatchRef ? ` — Batch: ${String(r.feedBatchRef)}` : ""}
                        {r.supplierName ? ` — Supplier: ${String(r.supplierName)}` : ""}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{String(r.reasonForConcern ?? "")}</p>
                      {r.estimatedAnimalsAffected && <p className="text-xs text-gray-500 mt-1">Est. animals affected: {String(r.estimatedAnimalsAffected)}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => openRecallEdit(r)} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => delRecallMut.mutate(Number(r.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ DISEASE INCIDENT DIALOG ════════════════════════════════════════ */}
      <Dialog open={showDiseaseDialog} onOpenChange={setShowDiseaseDialog}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editDisease ? "Edit Incident Record" : "Log Disease / Health Incident"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Incident date *</Label>
                <Input type="date" value={diseaseForm.incidentDate ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, incidentDate: e.target.value }))} />
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={diseaseForm.incidentType ?? "disease_suspicion"} onValueChange={v => setDiseaseForm(f => ({ ...f, incidentType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INCIDENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={diseaseForm.status ?? "open"} onValueChange={v => setDiseaseForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Species</Label>
                <Select value={diseaseForm.species ?? "__none__"} onValueChange={v => setDiseaseForm(f => ({ ...f, species: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select species…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {SPECIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Animals affected</Label><Input type="number" value={diseaseForm.animalCount ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, animalCount: e.target.value }))} /></div>
              <div><Label>Reported by</Label><Input value={diseaseForm.reportedBy ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, reportedBy: e.target.value }))} /></div>
            </div>

            <div>
              <Label>Herds / groups affected</Label>
              <Input
                list="disease-herds-list"
                value={diseaseForm.affectedHerds ?? ""}
                onChange={e => setDiseaseForm(f => ({ ...f, affectedHerds: e.target.value }))}
                placeholder="e.g. Dairy herd, Young cattle building"
              />
              <datalist id="disease-herds-list">{knownHerdNames.map(n => <option key={n} value={n} />)}</datalist>
            </div>
            <div><Label>Symptoms observed *</Label><Textarea rows={3} value={diseaseForm.symptomsObserved ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, symptomsObserved: e.target.value }))} placeholder="Describe what was seen — be specific about clinical signs, onset, severity, and affected body systems" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Suspected diagnosis</Label><Input value={diseaseForm.suspectedDiagnosis ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, suspectedDiagnosis: e.target.value }))} /></div>
              <div><Label>Confirmed diagnosis</Label><Input value={diseaseForm.confirmedDiagnosis ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, confirmedDiagnosis: e.target.value }))} /></div>
            </div>

            {/* Notifiable disease */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <Label className="text-red-800 font-semibold">Is this a notifiable disease?</Label>
                <Select value={diseaseForm.isNotifiableDisease ?? "false"} onValueChange={v => setDiseaseForm(f => ({ ...f, isNotifiableDisease: v }))}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes — notifiable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {diseaseForm.isNotifiableDisease === "true" && (
                <>
                  <div className="bg-red-100 border border-red-300 rounded p-2 text-xs text-red-800 mb-2">
                    <strong>You must contact APHA immediately:</strong> 03000 200 301. Do not wait for laboratory confirmation.
                  </div>
                  <div>
                    <Label>Notifiable disease type</Label>
                    <Select value={diseaseForm.notifiableDiseaseType ?? "__none__"} onValueChange={v => setDiseaseForm(f => ({ ...f, notifiableDiseaseType: v === "__none__" ? "" : v }))}>
                      <SelectTrigger><SelectValue placeholder="Select disease…" /></SelectTrigger>
                      <SelectContent>{NOTIFIABLE_DISEASES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Vet */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800 mb-2">Veterinary Response</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Vet called?</Label>
                  <Select value={diseaseForm.vetCalled ?? "false"} onValueChange={v => setDiseaseForm(f => ({ ...f, vetCalled: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Not yet</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {diseaseForm.vetCalled === "true" && <>
                  <div>
                    <Label>Vet name</Label>
                    <Input
                      list="disease-vet-list"
                      value={diseaseForm.vetName ?? ""}
                      onChange={e => setDiseaseForm(f => ({ ...f, vetName: e.target.value }))}
                      placeholder="Select or type vet name"
                    />
                    <datalist id="disease-vet-list">{knownVetNames.map(n => <option key={n} value={n} />)}</datalist>
                  </div>
                  <div><Label>Date called</Label><Input type="date" value={diseaseForm.vetCallDate ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, vetCallDate: e.target.value }))} /></div>
                  <div><Label>Vet visit date</Label><Input type="date" value={diseaseForm.vetVisitDate ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, vetVisitDate: e.target.value }))} /></div>
                  <div className="col-span-2"><Label>Vet advice</Label><Input value={diseaseForm.vetAdvice ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, vetAdvice: e.target.value }))} /></div>
                  <div><Label>Prescription ref</Label><Input value={diseaseForm.prescriptionRef ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, prescriptionRef: e.target.value }))} /></div>
                </>}
              </div>
              {diseaseForm.vetCalled === "true" && (
                <div className="mt-2"><Label>Treatment given</Label><Textarea rows={2} value={diseaseForm.treatmentGiven ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, treatmentGiven: e.target.value }))} /></div>
              )}
            </div>

            {/* Biosecurity response */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Biosecurity Response</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Isolation applied?</Label>
                  <Select value={diseaseForm.isolationApplied ?? "false"} onValueChange={v => setDiseaseForm(f => ({ ...f, isolationApplied: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {diseaseForm.isolationApplied === "true" && <>
                  <div><Label>Isolation date</Label><Input type="date" value={diseaseForm.isolationDate ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, isolationDate: e.target.value }))} /></div>
                  <div className="col-span-2"><Label>Isolation location</Label><Input value={diseaseForm.isolationLocation ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, isolationLocation: e.target.value }))} /></div>
                </>}
                <div>
                  <Label>Movement restriction?</Label>
                  <Select value={diseaseForm.movementRestricted ?? "false"} onValueChange={v => setDiseaseForm(f => ({ ...f, movementRestricted: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {diseaseForm.movementRestricted === "true" && <>
                  <div><Label>Restriction date</Label><Input type="date" value={diseaseForm.movementRestrictionDate ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, movementRestrictionDate: e.target.value }))} /></div>
                  <div className="col-span-2"><Label>Restriction details</Label><Input value={diseaseForm.movementRestrictionDetails ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, movementRestrictionDetails: e.target.value }))} /></div>
                </>}
              </div>
            </div>

            {/* APHA reporting */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Reported to APHA?</Label>
                <Select value={diseaseForm.reportedToAPHA ?? "false"} onValueChange={v => setDiseaseForm(f => ({ ...f, reportedToAPHA: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {diseaseForm.reportedToAPHA === "true" && <>
                <div><Label>APHA reference</Label><Input value={diseaseForm.aphaRef ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, aphaRef: e.target.value }))} /></div>
                <div><Label>Date notified</Label><Input type="date" value={diseaseForm.aphaNotifiedDate ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, aphaNotifiedDate: e.target.value }))} /></div>
              </>}
            </div>

            {/* Resolution */}
            {diseaseForm.status === "resolved" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Resolved date</Label><Input type="date" value={diseaseForm.resolvedDate ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, resolvedDate: e.target.value }))} /></div>
                <div><Label>Mortalities</Label><Input type="number" value={diseaseForm.mortalityCount ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, mortalityCount: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Outcome summary</Label><Textarea rows={2} value={diseaseForm.outcomeSummary ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, outcomeSummary: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Lesson learned</Label><Textarea rows={2} value={diseaseForm.lessonLearned ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, lessonLearned: e.target.value }))} /></div>
              </div>
            )}
            <div><Label>Notes</Label><Textarea rows={2} value={diseaseForm.notes ?? ""} onChange={e => setDiseaseForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiseaseDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!diseaseForm.symptomsObserved?.trim()) {
                toast({ title: "Symptoms observed is required", variant: "destructive" });
                return;
              }
              const data: Record<string, unknown> = { ...diseaseForm };
              data.vetCalled = diseaseForm.vetCalled === "true";
              data.isolationApplied = diseaseForm.isolationApplied === "true";
              data.movementRestricted = diseaseForm.movementRestricted === "true";
              data.reportedToAPHA = diseaseForm.reportedToAPHA === "true";
              data.isNotifiableDisease = diseaseForm.isNotifiableDisease === "true";
              data.cleaningDisinfectionCarriedOut = diseaseForm.cleaningDisinfectionCarriedOut === "true";
              data.officialMovementOrderIssued = diseaseForm.officialMovementOrderIssued === "true";
              diseaseMut.mutate(data);
            }}>{editDisease ? "Save Changes" : "Log Incident"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ FEED RECALL DIALOG ════════════════════════════════════════════ */}
      <Dialog open={showRecallDialog} onOpenChange={setShowRecallDialog}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRecall ? "Edit Recall / Withdrawal Record" : "Raise Feed Recall Incident"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Date raised *</Label><Input type="date" value={recallForm.raisedDate ?? ""} onChange={e => setRecallForm(f => ({ ...f, raisedDate: e.target.value }))} /></div>
              <div>
                <Label>Concern type *</Label>
                <Select value={recallForm.concernType ?? "contamination"} onValueChange={v => setRecallForm(f => ({ ...f, concernType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONCERN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={recallForm.status ?? "open"} onValueChange={v => setRecallForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feed identification */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Feed Identification</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Product name</Label>
                  <Input
                    list="recall-products-list"
                    value={recallForm.productName ?? ""}
                    onChange={e => setRecallForm(f => ({ ...f, productName: e.target.value }))}
                    placeholder="Select or type product name"
                  />
                  <datalist id="recall-products-list">{knownFeedProducts.map(n => <option key={n} value={n} />)}</datalist>
                </div>
                <div>
                  <Label>Supplier name</Label>
                  {allSuppliers.length > 0 ? (
                    <Select
                      value={recallForm.supplierName ?? "__none__"}
                      onValueChange={v => setRecallForm(f => ({ ...f, supplierName: v === "__none__" ? "" : v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Select supplier —</SelectItem>
                        {allSuppliers.map(s => <SelectItem key={String(s.id)} value={String(s.name ?? s.id)}>{String(s.name ?? s.id)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={recallForm.supplierName ?? ""} onChange={e => setRecallForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="Type supplier name" />
                  )}
                </div>
                <div><Label>Batch / lot number</Label><Input value={recallForm.feedBatchRef ?? ""} onChange={e => setRecallForm(f => ({ ...f, feedBatchRef: e.target.value }))} placeholder="Matches delivery batch number" /></div>
                <div><Label>Delivery note ref</Label><Input value={recallForm.deliveryNoteRef ?? ""} onChange={e => setRecallForm(f => ({ ...f, deliveryNoteRef: e.target.value }))} /></div>
                <div><Label>Quantity affected (kg)</Label><Input type="number" value={recallForm.quantityKgAffected ?? ""} onChange={e => setRecallForm(f => ({ ...f, quantityKgAffected: e.target.value }))} /></div>
                <div><Label>Raised by</Label><Input value={recallForm.raisedBy ?? ""} onChange={e => setRecallForm(f => ({ ...f, raisedBy: e.target.value }))} /></div>
              </div>
            </div>

            <div><Label>Reason for concern *</Label><Textarea rows={3} value={recallForm.reasonForConcern ?? ""} onChange={e => setRecallForm(f => ({ ...f, reasonForConcern: e.target.value }))} placeholder="Describe the specific concern in detail — what was observed, what prompted the withdrawal decision" /></div>

            {/* Impact */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-800 mb-2">Impact Assessment</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Feed withdrawn?</Label>
                  <Select value={recallForm.feedWithdrawn ?? "false"} onValueChange={v => setRecallForm(f => ({ ...f, feedWithdrawn: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No — still in use</SelectItem>
                      <SelectItem value="true">Yes — withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {recallForm.feedWithdrawn === "true" && <div><Label>Withdrawal date</Label><Input type="date" value={recallForm.withdrawalDate ?? ""} onChange={e => setRecallForm(f => ({ ...f, withdrawalDate: e.target.value }))} /></div>}
                <div><Label>Est. animals affected</Label><Input type="number" value={recallForm.estimatedAnimalsAffected ?? ""} onChange={e => setRecallForm(f => ({ ...f, estimatedAnimalsAffected: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label>Herds / groups affected</Label>
                  <Input
                    list="recall-herds-list"
                    value={recallForm.affectedHerds ?? ""}
                    onChange={e => setRecallForm(f => ({ ...f, affectedHerds: e.target.value }))}
                    placeholder="Type or select herd name"
                  />
                  <datalist id="recall-herds-list">{knownHerdNames.map(n => <option key={n} value={n} />)}</datalist>
                </div>
                <div>
                  <Label>Animal health impact observed?</Label>
                  <Select value={recallForm.animalHealthImpactObserved ?? "false"} onValueChange={v => setRecallForm(f => ({ ...f, animalHealthImpactObserved: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {recallForm.animalHealthImpactObserved === "true" && (
                  <div className="col-span-2"><Label>Health impact description</Label><Textarea rows={2} value={recallForm.healthImpactDescription ?? ""} onChange={e => setRecallForm(f => ({ ...f, healthImpactDescription: e.target.value }))} /></div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div><Label>Actions taken</Label><Textarea rows={3} value={recallForm.actionsTaken ?? ""} onChange={e => setRecallForm(f => ({ ...f, actionsTaken: e.target.value }))} placeholder="What was done with the affected feed? Who was contacted? What replacement was sourced?" /></div>

            {/* Notifications */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800 mb-2">Notifications</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Supplier notified?</Label>
                  <Select value={recallForm.reportedToSupplier ?? "false"} onValueChange={v => setRecallForm(f => ({ ...f, reportedToSupplier: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {recallForm.reportedToSupplier === "true" && <>
                  <div><Label>Date notified</Label><Input type="date" value={recallForm.supplierNotifiedDate ?? ""} onChange={e => setRecallForm(f => ({ ...f, supplierNotifiedDate: e.target.value }))} /></div>
                  <div><Label>Supplier reference</Label><Input value={recallForm.supplierReference ?? ""} onChange={e => setRecallForm(f => ({ ...f, supplierReference: e.target.value }))} /></div>
                </>}
                <div>
                  <Label>Authority notified?</Label>
                  <Select value={recallForm.reportedToAuthority ?? "false"} onValueChange={v => setRecallForm(f => ({ ...f, reportedToAuthority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {recallForm.reportedToAuthority === "true" && <>
                  <div>
                    <Label>Authority</Label>
                    <Select value={recallForm.authorityName ?? "__none__"} onValueChange={v => setRecallForm(f => ({ ...f, authorityName: v === "__none__" ? "" : v }))}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APHA">APHA</SelectItem>
                        <SelectItem value="Trading Standards">Trading Standards</SelectItem>
                        <SelectItem value="FSA">Food Standards Agency (FSA)</SelectItem>
                        <SelectItem value="DEFRA">DEFRA</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Authority reference</Label><Input value={recallForm.authorityReference ?? ""} onChange={e => setRecallForm(f => ({ ...f, authorityReference: e.target.value }))} /></div>
                  <div><Label>Date notified</Label><Input type="date" value={recallForm.authorityNotifiedDate ?? ""} onChange={e => setRecallForm(f => ({ ...f, authorityNotifiedDate: e.target.value }))} /></div>
                </>}
                <div>
                  <Label>Vet notified?</Label>
                  <Select value={recallForm.reportedToVet ?? "false"} onValueChange={v => setRecallForm(f => ({ ...f, reportedToVet: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {recallForm.reportedToVet === "true" && <>
                  <div><Label>Vet name</Label><Input value={recallForm.vetName ?? ""} onChange={e => setRecallForm(f => ({ ...f, vetName: e.target.value }))} /></div>
                  <div><Label>Date notified</Label><Input type="date" value={recallForm.vetNotifiedDate ?? ""} onChange={e => setRecallForm(f => ({ ...f, vetNotifiedDate: e.target.value }))} /></div>
                </>}
              </div>
            </div>

            {/* Resolution */}
            {recallForm.status === "resolved" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Resolved date</Label><Input type="date" value={recallForm.resolvedDate ?? ""} onChange={e => setRecallForm(f => ({ ...f, resolvedDate: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Resolution summary</Label><Textarea rows={2} value={recallForm.resolutionSummary ?? ""} onChange={e => setRecallForm(f => ({ ...f, resolutionSummary: e.target.value }))} /></div>
              </div>
            )}
            <div><Label>Notes</Label><Textarea rows={2} value={recallForm.notes ?? ""} onChange={e => setRecallForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecallDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!recallForm.reasonForConcern?.trim()) {
                toast({ title: "Reason for concern is required", variant: "destructive" });
                return;
              }
              const data: Record<string, unknown> = { ...recallForm };
              data.feedWithdrawn = recallForm.feedWithdrawn === "true";
              data.animalHealthImpactObserved = recallForm.animalHealthImpactObserved === "true";
              data.reportedToSupplier = recallForm.reportedToSupplier === "true";
              data.reportedToAuthority = recallForm.reportedToAuthority === "true";
              data.reportedToVet = recallForm.reportedToVet === "true";
              recallMut.mutate(data);
            }}>{editRecall ? "Save Changes" : "Raise Incident"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Species stock target dialog */}
      <Dialog open={showTargetDialog} onOpenChange={setShowTargetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Species Target" : "Add Species Monitoring Target"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div>
              <Label>Species</Label>
              <Select value={targetForm.species ?? "cattle"} onValueChange={v => setTargetForm(f => ({ ...f, species: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Display label <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input className="mt-1" value={targetForm.label ?? ""} onChange={e => setTargetForm(f => ({ ...f, label: e.target.value }))} placeholder={`e.g. Beef Cattle, Dairy Herd, Ewes & Lambs`} />
              <p className="text-xs text-gray-400 mt-0.5">Shown on the monitoring card instead of the species name.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Daily consumption (kg/day)</Label>
                <Input className="mt-1" type="number" min="0" step="0.1" value={targetForm.dailyConsumptionKg ?? ""} onChange={e => setTargetForm(f => ({ ...f, dailyConsumptionKg: e.target.value }))} placeholder="e.g. 180" />
              </div>
              <div>
                <Label>Minimum stock target (days)</Label>
                <Input className="mt-1" type="number" min="1" step="1" value={targetForm.minimumStockDaysTarget ?? ""} onChange={e => setTargetForm(f => ({ ...f, minimumStockDaysTarget: e.target.value }))} placeholder="e.g. 14" />
              </div>
            </div>
            <div>
              <Label>Alert threshold (kg) <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input className="mt-1" type="number" min="0" step="1" value={targetForm.alertThresholdKg ?? ""} onChange={e => setTargetForm(f => ({ ...f, alertThresholdKg: e.target.value }))} placeholder="e.g. 2520" />
              <p className="text-xs text-gray-400 mt-0.5">Triggers an additional alert if stock falls below this kg value, regardless of days remaining.</p>
            </div>
            <div>
              <Label>Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea className="mt-1" rows={2} value={targetForm.notes ?? ""} onChange={e => setTargetForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Includes finisher nuts, soya blend and molasses — order threshold is 2 pallets" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTargetDialog(false)}>Cancel</Button>
            <Button
              className="bg-green-800 hover:bg-green-900 text-white"
              disabled={!targetForm.species || !targetForm.dailyConsumptionKg || !targetForm.minimumStockDaysTarget}
              onClick={() => {
                const body: Record<string, unknown> = {
                  species: targetForm.species,
                  label: targetForm.label || null,
                  dailyConsumptionKg: targetForm.dailyConsumptionKg,
                  minimumStockDaysTarget: parseInt(targetForm.minimumStockDaysTarget),
                  alertThresholdKg: targetForm.alertThresholdKg || null,
                  notes: targetForm.notes || null,
                };
                if (editTarget) {
                  updateTargetM.mutate({ id: Number(editTarget.id), body }, { onSuccess: () => setShowTargetDialog(false) });
                } else {
                  addTargetM.mutate(body, { onSuccess: () => setShowTargetDialog(false) });
                }
              }}
            >
              {editTarget ? "Save Changes" : "Add Target"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
