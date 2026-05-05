import React, { useState } from "react";
import { printProReport } from "@/lib/print-report";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tent, Plus, Trash2, Camera, File, Upload, Loader2, MapPin, Phone, Printer, ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";

const STATUSES = [
  { value: "active", label: "Active", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  { value: "legal_action", label: "Legal Action", bg: "#fefce8", color: "#92400e", border: "#fde68a" },
  { value: "resolved", label: "Resolved", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
];

const POLICE_ACTIONS = [
  "Section 61 direction served (CJPOA 1994 / PCSC Act 2022)",
  "Section 62A direction served — alternative site",
  "Declined to act — civil matter",
  "Officers attended — verbal warning only",
  "Criminal investigation opened",
  "Arrests made",
  "Other — see notes",
];

const LEGAL_NOTICE_TYPES = [
  "Section 61 CJPOA direction",
  "Notice to Quit served",
  "Injunction obtained (High Court)",
  "Possession order (Part 55 CPR)",
  "Trespass notice served",
  "Emergency injunction ex parte",
];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const LAND_CONDITIONS = [
  "No damage observed — land in good order",
  "Minor soiling or waste — removed by farm staff",
  "Damage to fencing or gates",
  "Crop damage or soil compaction",
  "Significant land damage — remediation underway",
  "Fully remediated",
];

interface Field { id: number; name: string; fieldReference: string | null; }
interface InsurancePolicy { id: number; policyType: string; insurer: string | null; policyNumber: string | null; }
interface Photo { id: number; objectPath: string; fileName: string | null; }
interface Encampment {
  id: number;
  farmId: number;
  discoveredAt: string;
  locationDescription: string;
  fieldId: number | null;
  fieldParcel: string | null;
  latitude: string | null;
  longitude: string | null;
  entryPoint: string | null;
  vehicleCount: number | null;
  personCount: number | null;
  caravanCount: number | null;
  vehicleDescriptions: string | null;
  landDamageDescription: string | null;
  cropsAffected: boolean;
  estimatedDamage: string | null;
  policeNotified: boolean;
  policeRefNumber: string | null;
  policeAction: string | null;
  councilNotified: boolean;
  councilRefNumber: string | null;
  legalActionTaken: boolean;
  legalActionDetails: string | null;
  solicitorInstructed: boolean;
  courtOrderObtained: boolean;
  courtOrderRef: string | null;
  vacatedAt: string | null;
  landConditionAfter: string | null;
  insuranceClaimMade: boolean;
  insurancePolicyId: number | null;
  insuranceClaimRef: string | null;
  remediationRequired: boolean;
  remediationNotes: string | null;
  remediationCost: string | null;
  status: string;
  notes: string | null;
  photos: Photo[];
}

function PhotoPanel({ incidentId, farmId, photos }: { incidentId: number; farmId: number; photos: Photo[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const deleteMut = useMutation({
    mutationFn: (photoId: number) => fetch(`/api/farms/${farmId}/encampments/${incidentId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["encampments", farmId] }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/encampments/${incidentId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() }),
      });
      qc.invalidateQueries({ queryKey: ["encampments", farmId] });
      toast({ title: "Photo uploaded" });
    },
  });

  return (
    <div style={{ padding: "10px 14px 12px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }}>Evidence Photos</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }}>
        {photos.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }}>
            <File size={12} style={{ color: "#2563eb" }} />
            <a href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }}>
              {p.fileName ?? "photo"}
            </a>
            <button onClick={() => deleteMut.mutate(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
        {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
        {isUploading ? `Uploading… ${progress}%` : "Add Photo"}
        <input type="file" accept="image/*,application/pdf" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      </label>
    </div>
  );
}

const EMPTY: Omit<Encampment, "id" | "farmId" | "photos"> = {
  discoveredAt: new Date().toISOString().slice(0, 10),
  locationDescription: "",
  fieldId: null,
  fieldParcel: "",
  latitude: "",
  longitude: "",
  entryPoint: "",
  vehicleCount: null,
  personCount: null,
  caravanCount: null,
  vehicleDescriptions: "",
  landDamageDescription: "",
  cropsAffected: false,
  estimatedDamage: "",
  policeNotified: false,
  policeRefNumber: "",
  policeAction: "",
  councilNotified: false,
  councilRefNumber: "",
  legalActionTaken: false,
  legalActionDetails: "",
  solicitorInstructed: false,
  courtOrderObtained: false,
  courtOrderRef: "",
  vacatedAt: "",
  landConditionAfter: "",
  insuranceClaimMade: false,
  insurancePolicyId: null,
  insuranceClaimRef: "",
  remediationRequired: false,
  remediationNotes: "",
  remediationCost: "",
  status: "active",
  notes: "",
};

export default function EncampmentPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: farmData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farm = farmData?.record;

  const q = useQuery<{ records: Encampment[] }>({
    queryKey: ["encampments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/encampments`).then(r => r.json()),
    enabled: !!farmId,
  });
  const incidents: Encampment[] = q.data?.records ?? [];

  const fieldsQ = useQuery<{ records: Field[] }>({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
    enabled: !!farmId,
  });
  const fields: Field[] = fieldsQ.data?.records ?? [];

  const insuranceQ = useQuery<{ records: InsurancePolicy[] }>({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then(r => r.json()),
    enabled: !!farmId,
  });
  const policies: InsurancePolicy[] = insuranceQ.data?.records ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Encampment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [raiseTaskFor, setRaiseTaskFor] = useState<Encampment | null>(null);
  const [form, setForm] = useState<Omit<Encampment, "id" | "farmId" | "photos">>({ ...EMPTY });

  function openAdd() {
    setForm({ ...EMPTY, discoveredAt: new Date().toISOString().slice(0, 10) });
    setAddOpen(true);
  }

  function openEdit(r: Encampment) {
    setForm({
      discoveredAt: r.discoveredAt,
      locationDescription: r.locationDescription,
      fieldId: r.fieldId ?? null,
      fieldParcel: r.fieldParcel ?? "",
      latitude: r.latitude ?? "",
      longitude: r.longitude ?? "",
      entryPoint: r.entryPoint ?? "",
      vehicleCount: r.vehicleCount,
      personCount: r.personCount,
      caravanCount: r.caravanCount,
      vehicleDescriptions: r.vehicleDescriptions ?? "",
      landDamageDescription: r.landDamageDescription ?? "",
      cropsAffected: r.cropsAffected,
      estimatedDamage: r.estimatedDamage ?? "",
      policeNotified: r.policeNotified,
      policeRefNumber: r.policeRefNumber ?? "",
      policeAction: r.policeAction ?? "",
      councilNotified: r.councilNotified,
      councilRefNumber: r.councilRefNumber ?? "",
      legalActionTaken: r.legalActionTaken,
      legalActionDetails: r.legalActionDetails ?? "",
      solicitorInstructed: r.solicitorInstructed,
      courtOrderObtained: r.courtOrderObtained,
      courtOrderRef: r.courtOrderRef ?? "",
      vacatedAt: r.vacatedAt ?? "",
      landConditionAfter: r.landConditionAfter ?? "",
      insuranceClaimMade: r.insuranceClaimMade,
      insurancePolicyId: r.insurancePolicyId ?? null,
      insuranceClaimRef: r.insuranceClaimRef ?? "",
      remediationRequired: r.remediationRequired,
      remediationNotes: r.remediationNotes ?? "",
      remediationCost: r.remediationCost ?? "",
      status: r.status,
      notes: r.notes ?? "",
    });
    setEditItem(r);
  }

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/encampments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["encampments", farmId] }); setAddOpen(false); toast({ title: "Encampment logged" }); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/encampments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["encampments", farmId] }); setEditItem(null); toast({ title: "Record updated" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/encampments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["encampments", farmId] }); setDeleteId(null); toast({ title: "Record deleted" }); },
  });

  function handleSave() {
    const body = { ...form };
    if (editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }

  const filtered = statusFilter === "all" ? incidents : incidents.filter(i => i.status === statusFilter);
  const activeCount = incidents.filter(i => i.status !== "resolved").length;

  function statusStyle(status: string) {
    const s = STATUSES.find(x => x.value === status);
    return s ? { background: s.bg, color: s.color, border: `1px solid ${s.border}` } : {};
  }
  function statusLabel(status: string) {
    return STATUSES.find(x => x.value === status)?.label ?? status;
  }

  function handlePrint() {
    const printList = statusFilter === "all" ? incidents : filtered;
    const rows = printList.map(r => `<tr>
      <td style="white-space:nowrap">${fmt(r.discoveredAt)}</td>
      <td>${r.locationDescription}${r.fieldParcel ? ` — ${r.fieldParcel}` : ""}</td>
      <td>${r.vehicleCount ?? "—"} vehicles / ${r.personCount ?? "—"} persons / ${r.caravanCount ?? "—"} caravans</td>
      <td>${r.policeNotified ? `Yes — ${r.policeRefNumber || "ref TBC"}` : "No"}</td>
      <td>${r.legalActionTaken ? (r.legalActionDetails || "Yes") : "No"}</td>
      <td style="white-space:nowrap">${r.vacatedAt ? fmt(r.vacatedAt) : "—"}</td>
      <td>${statusLabel(r.status)}</td>
    </tr>`).join("");
    const tableHtml = `<table><thead><tr>
      <th>Discovered</th><th>Location / Field</th><th>Persons &amp; Vehicles</th>
      <th>Police Ref</th><th>Legal Action</th><th>Vacated</th><th>Status</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: "Unauthorized Encampments Register",
      subtitle: "Criminal Justice and Public Order Act 1994",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      recordCount: printList.length,
      recordLabel: "incident",
      extraMeta: `Active / In Legal Process: ${printList.filter(r => r.status !== "resolved").length}  ·  Resolved: ${printList.filter(r => r.status === "resolved").length}`,
      tableHtml,
      footerNote: "Retain all documentation relating to legal action and police involvement. Keep records securely as evidence for any future proceedings.",
    });
  }

  const isDialogOpen = addOpen || !!editItem;
  const isSaving = createMut.isPending || updateMut.isPending;

  const ff = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <AppLayout title="Unauthorized Encampments">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Tent size={22} style={{ color: "#b91c1c" }} />
            <div>
              <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
                {activeCount > 0 ? <><span style={{ fontWeight: 700, color: "#b91c1c" }}>{activeCount}</span> active or in legal process</> : "No active encampments"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer size={14} className="mr-1.5" /> Print Register</Button>
            <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1.5" /> Log Encampment</Button>
          </div>
        </div>

        {/* Notice */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Phone size={15} style={{ color: "#92400e", flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: "0.82rem", color: "#78350f" }}>
            <strong>Immediate action:</strong> Call police on 101 (or 999 if violence threatened) and request a Section 61 CJPOA / PCSC Act 2022 direction. Contact your solicitor if a court injunction or possession order (Part 55 CPR) may be needed. Document everything contemporaneously — evidence is time-critical for legal proceedings.
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[{ v: "all", l: "All" }, ...STATUSES.map(s => ({ v: s.value, l: s.label }))].map(({ v, l }) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              style={{ padding: "4px 14px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 500, cursor: "pointer",
                background: statusFilter === v ? "#1a3d2b" : "#f3f4f6",
                color: statusFilter === v ? "#fff" : "#374151",
                border: statusFilter === v ? "1px solid #1a3d2b" : "1px solid #e5e7eb" }}>
              {l} {v !== "all" && `(${incidents.filter(i => i.status === v).length})`}
            </button>
          ))}
        </div>

        {/* List */}
        {q.isLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Loader2 className="animate-spin" size={28} style={{ color: "#9ca3af" }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, background: "#f9fafb", borderRadius: 12, border: "1px dashed #e5e7eb" }}>
            <Tent size={36} style={{ color: "#d1d5db", margin: "0 auto 12px" }} />
            <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No encampment records{statusFilter !== "all" ? ` with status "${statusLabel(statusFilter)}"` : ""}.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(r => {
              const expanded = expandedId === r.id;
              return (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" }}
                    onClick={() => setExpandedId(expanded ? null : r.id)}>
                    <Tent size={18} style={{ color: "#b91c1c", flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{r.locationDescription}</span>
                        <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: 12, fontWeight: 600, ...statusStyle(r.status) }}>{statusLabel(r.status)}</span>
                        {r.cropsAffected && <span style={{ fontSize: "0.72rem", padding: "2px 8px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 12, fontWeight: 600 }}>Crops Affected</span>}
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.8rem", color: "#6b7280" }}>
                        <span>Discovered: <strong>{fmt(r.discoveredAt)}</strong></span>
                        {r.vehicleCount != null && <span>{r.vehicleCount} vehicles · {r.personCount ?? "?"} persons · {r.caravanCount ?? "?"} caravans</span>}
                        {r.policeNotified && <span style={{ color: "#1d4ed8" }}>Police: {r.policeRefNumber || "Ref TBC"}</span>}
                        {r.legalActionTaken && <span style={{ color: "#92400e" }}>Legal action taken</span>}
                        {r.vacatedAt && <span style={{ color: "#15803d" }}>Vacated: {fmt(r.vacatedAt)}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); setDeleteId(r.id); }}
                        style={{ color: "#ef4444", borderColor: "#fecaca" }}><Trash2 size={13} /></Button>
                      {r.status !== "resolved" && (
                        <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); setRaiseTaskFor(r); }}
                          style={{ color: "#f59e0b", borderColor: "#fde68a" }} title="Raise Task"><ClipboardList size={13} /></Button>
                      )}
                      {expanded ? <ChevronUp size={16} style={{ color: "#9ca3af" }} /> : <ChevronDown size={16} style={{ color: "#9ca3af" }} />}
                    </div>
                  </div>

                  {expanded && (
                    <div style={{ borderTop: "1px solid #f3f4f6" }}>
                      <div style={{ padding: "12px 16px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px 20px", fontSize: "0.82rem" }}>
                        {r.fieldParcel && <InfoRow label="Field / Parcel" value={r.fieldParcel} />}
                        {(r.latitude || r.longitude) && <InfoRow label="GPS" value={`${r.latitude}, ${r.longitude}`} />}
                        {r.entryPoint && <InfoRow label="Entry Point" value={r.entryPoint} />}
                        {r.vehicleDescriptions && <InfoRow label="Vehicle Descriptions" value={r.vehicleDescriptions} span />}
                        {r.landDamageDescription && <InfoRow label="Land Damage" value={r.landDamageDescription} span />}
                        {r.estimatedDamage && <InfoRow label="Estimated Damage" value={r.estimatedDamage} />}
                        {r.policeNotified && <InfoRow label="Police Action" value={r.policeAction || "—"} span />}
                        {r.councilNotified && <InfoRow label="Council Ref" value={r.councilRefNumber || "—"} />}
                        {r.legalActionTaken && <InfoRow label="Legal Action Details" value={r.legalActionDetails || "—"} span />}
                        {r.courtOrderObtained && <InfoRow label="Court Order Ref" value={r.courtOrderRef || "—"} />}
                        {r.landConditionAfter && <InfoRow label="Land Condition After" value={r.landConditionAfter} span />}
                        {r.insuranceClaimMade && (
                          <InfoRow label="Insurance" value={[
                            r.insurancePolicyId ? (policies.find(p => p.id === r.insurancePolicyId)?.policyType ?? null) : null,
                            r.insuranceClaimRef || null,
                          ].filter(Boolean).join(" — ") || "Claim made"} />
                        )}
                        {r.remediationRequired && <InfoRow label="Remediation" value={`${r.remediationNotes || "Required"}${r.remediationCost ? ` — £${r.remediationCost}` : ""}`} span />}
                        {r.notes && <InfoRow label="Notes" value={r.notes} span />}
                      </div>
                      <PhotoPanel incidentId={r.id} farmId={farmId!} photos={r.photos} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={open => { if (!open) { setAddOpen(false); setEditItem(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit Encampment Record" : "Log Unauthorized Encampment"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">

              <Section title="Incident Details">
                <Row2>
                  <Field label="Date Discovered *">
                    <Input type="date" value={form.discoveredAt} onChange={e => ff("discoveredAt", e.target.value)} />
                  </Field>
                  <Field label="Status">
                    <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.status} onChange={e => ff("status", e.target.value)}>
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                </Row2>
                <Field label="Location Description *">
                  <Input value={form.locationDescription} onChange={e => ff("locationDescription", e.target.value)} placeholder="e.g. Lower Meadow, off Elm Lane" />
                </Field>
                <Row2>
                  <Field label="Field / Parcel Reference">
                    {fields.length > 0 && (
                      <select
                        className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 mb-2"
                        value={form.fieldId ?? ""}
                        onChange={e => {
                          const id = e.target.value ? Number(e.target.value) : null;
                          const found = fields.find(f => f.id === id);
                          ff("fieldId", id);
                          if (found) ff("fieldParcel", [found.name, found.fieldReference].filter(Boolean).join(" — "));
                          else if (!id) ff("fieldParcel", "");
                        }}
                      >
                        <option value="">— Select registered field…</option>
                        {fields.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                    <Input value={form.fieldParcel ?? ""} onChange={e => ff("fieldParcel", e.target.value)} placeholder={fields.length > 0 ? "Or enter manually — e.g. OS 1234 / Field 7" : "e.g. OS 1234 / Field 7"} />
                  </Field>
                  <Field label="Entry Point">
                    <Input value={form.entryPoint ?? ""} onChange={e => ff("entryPoint", e.target.value)} placeholder="e.g. Cut hedge on north boundary" />
                  </Field>
                </Row2>
                <Row2>
                  <Field label="Latitude">
                    <Input value={form.latitude ?? ""} onChange={e => ff("latitude", e.target.value)} placeholder="51.5074" />
                  </Field>
                  <Field label="Longitude">
                    <Input value={form.longitude ?? ""} onChange={e => ff("longitude", e.target.value)} placeholder="-1.8043" />
                  </Field>
                </Row2>
              </Section>

              <Section title="Persons & Vehicles">
                <Row3>
                  <Field label="No. of Vehicles">
                    <Input type="number" min="0" value={form.vehicleCount ?? ""} onChange={e => ff("vehicleCount", e.target.value ? parseInt(e.target.value) : null)} />
                  </Field>
                  <Field label="No. of Persons (approx)">
                    <Input type="number" min="0" value={form.personCount ?? ""} onChange={e => ff("personCount", e.target.value ? parseInt(e.target.value) : null)} />
                  </Field>
                  <Field label="No. of Caravans">
                    <Input type="number" min="0" value={form.caravanCount ?? ""} onChange={e => ff("caravanCount", e.target.value ? parseInt(e.target.value) : null)} />
                  </Field>
                </Row3>
                <Field label="Vehicle Descriptions (make, colour, registration if visible)">
                  <Textarea rows={2} value={form.vehicleDescriptions ?? ""} onChange={e => ff("vehicleDescriptions", e.target.value)} placeholder="e.g. White Transit van DP12 XYZ, Silver Audi estate..." />
                </Field>
              </Section>

              <Section title="Land Damage">
                <Field label="Description of Damage">
                  <Textarea rows={2} value={form.landDamageDescription ?? ""} onChange={e => ff("landDamageDescription", e.target.value)} placeholder="Gates damaged, fencing cut, soil compaction, waste left, crops driven over..." />
                </Field>
                <Row2>
                  <CheckField label="Crops affected?" checked={form.cropsAffected} onChange={v => ff("cropsAffected", v)} />
                  <Field label="Estimated Damage Value (£)">
                    <div style={{ display: "flex", alignItems: "center", border: "2px solid hsl(var(--border))", borderRadius: "0.75rem", overflow: "hidden" }}>
                      <span style={{ padding: "0 10px", color: "#6b7280", fontSize: "0.95rem", flexShrink: 0 }}>£</span>
                      <input type="number" min="0" step="0.01"
                        style={{ flex: 1, border: "none", outline: "none", padding: "0 12px 0 0", height: "3rem", fontSize: "1rem", background: "transparent" }}
                        value={form.estimatedDamage ?? ""}
                        onChange={e => ff("estimatedDamage", e.target.value)}
                        placeholder="0.00" />
                    </div>
                  </Field>
                </Row2>
              </Section>

              <Section title="Police">
                <Row2>
                  <CheckField label="Police notified?" checked={form.policeNotified} onChange={v => ff("policeNotified", v)} />
                  <Field label="Police Incident / Crime Ref">
                    <Input value={form.policeRefNumber ?? ""} onChange={e => ff("policeRefNumber", e.target.value)} placeholder="e.g. 01/CRI-2025-12345" />
                  </Field>
                </Row2>
                {form.policeNotified && (
                  <Field label="Police Action Taken">
                    <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.policeAction ?? ""} onChange={e => ff("policeAction", e.target.value)}>
                      <option value="">Select action…</option>
                      {POLICE_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </Field>
                )}
              </Section>

              <Section title="Local Council">
                <Row2>
                  <CheckField label="Council notified?" checked={form.councilNotified} onChange={v => ff("councilNotified", v)} />
                  <Field label="Council Reference">
                    <Input value={form.councilRefNumber ?? ""} onChange={e => ff("councilRefNumber", e.target.value)} placeholder="e.g. ENF-2025-0042" />
                  </Field>
                </Row2>
              </Section>

              <Section title="Legal Action">
                <Row2>
                  <CheckField label="Legal action taken?" checked={form.legalActionTaken} onChange={v => ff("legalActionTaken", v)} />
                  <CheckField label="Solicitor instructed?" checked={form.solicitorInstructed} onChange={v => ff("solicitorInstructed", v)} />
                </Row2>
                {form.legalActionTaken && (
                  <Field label="Legal Action Details">
                    <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 mb-2"
                      value={form.legalActionDetails ?? ""} onChange={e => ff("legalActionDetails", e.target.value)}>
                      <option value="">Select notice / order type…</option>
                      {LEGAL_NOTICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                )}
                <Row2>
                  <CheckField label="Court order obtained?" checked={form.courtOrderObtained} onChange={v => ff("courtOrderObtained", v)} />
                  {form.courtOrderObtained && (
                    <Field label="Court Order Reference">
                      <Input value={form.courtOrderRef ?? ""} onChange={e => ff("courtOrderRef", e.target.value)} placeholder="e.g. HC-2025-001234" />
                    </Field>
                  )}
                </Row2>
              </Section>

              <Section title="Resolution">
                <Row2>
                  <Field label="Date Vacated">
                    <Input type="date" value={form.vacatedAt ?? ""} onChange={e => ff("vacatedAt", e.target.value)} />
                  </Field>
                </Row2>
                <Field label="Land Condition After Vacation">
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={form.landConditionAfter ?? ""} onChange={e => ff("landConditionAfter", e.target.value)}>
                    <option value="">— Select condition…</option>
                    {LAND_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </Section>

              <Section title="Insurance & Remediation">
                <CheckField label="Insurance claim made?" checked={form.insuranceClaimMade} onChange={v => { ff("insuranceClaimMade", v); if (!v) { ff("insurancePolicyId", null); ff("insuranceClaimRef", ""); } }} />
                {form.insuranceClaimMade && (
                  <Row2>
                    <Field label="Linked Insurance Policy">
                      <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        value={form.insurancePolicyId ?? ""}
                        onChange={e => ff("insurancePolicyId", e.target.value ? Number(e.target.value) : null)}>
                        <option value="">— Select registered policy…</option>
                        {policies.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.policyType}{p.insurer ? ` — ${p.insurer}` : ""}{p.policyNumber ? ` (${p.policyNumber})` : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Claim Reference (issued by insurer)">
                      <Input value={form.insuranceClaimRef ?? ""} onChange={e => ff("insuranceClaimRef", e.target.value)} placeholder="e.g. CLM-2025-00123" />
                    </Field>
                  </Row2>
                )}
                <Row2>
                  <CheckField label="Remediation required?" checked={form.remediationRequired} onChange={v => ff("remediationRequired", v)} />
                  {form.remediationRequired && (
                    <Field label="Remediation Cost (£)">
                      <div style={{ display: "flex", alignItems: "center", border: "2px solid hsl(var(--border))", borderRadius: "0.75rem", overflow: "hidden" }}>
                        <span style={{ padding: "0 10px", color: "#6b7280", fontSize: "0.95rem", flexShrink: 0 }}>£</span>
                        <input type="number" min="0" step="0.01"
                          style={{ flex: 1, border: "none", outline: "none", padding: "0 12px 0 0", height: "3rem", fontSize: "1rem", background: "transparent" }}
                          value={form.remediationCost ?? ""}
                          onChange={e => ff("remediationCost", e.target.value)}
                          placeholder="0.00" />
                      </div>
                    </Field>
                  )}
                </Row2>
                {form.remediationRequired && (
                  <Field label="Remediation Notes">
                    <Textarea rows={2} value={form.remediationNotes ?? ""} onChange={e => ff("remediationNotes", e.target.value)} placeholder="What remediation work is required or has been carried out?" />
                  </Field>
                )}
              </Section>

              <Section title="Additional Notes">
                <Textarea rows={3} value={form.notes ?? ""} onChange={e => ff("notes", e.target.value)} placeholder="Any further details about the incident, interactions with occupants, etc." />
              </Section>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.locationDescription || !form.discoveredAt || isSaving}>
                {isSaving ? <><Loader2 size={14} className="animate-spin mr-1.5" />Saving…</> : editItem ? "Save Changes" : "Log Encampment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Encampment Record?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This will permanently remove this record and all associated photos.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteId && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null} Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <RaiseTaskDialog
          farmId={farmId!}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={raiseTaskFor ? `Encampment ${raiseTaskFor.status === "legal_action" ? "Legal Follow-up" : "Action"} — ${raiseTaskFor.locationDescription}` : ""}
          defaultDescription={raiseTaskFor ? `Discovered: ${fmt(raiseTaskFor.discoveredAt)}. Status: ${statusLabel(raiseTaskFor.status)}.${raiseTaskFor.remediationRequired ? " Remediation required." : ""}` : ""}
          module="environment"
        />
      </div>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 10 }}>{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground/70">{label}</Label>
      {children}
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Row3({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{children}</div>;
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded border-gray-300 accent-green-700" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function InfoRow({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div style={span ? { gridColumn: "1 / -1" } : {}}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.82rem", color: "#374151" }}>{value}</p>
    </div>
  );
}
