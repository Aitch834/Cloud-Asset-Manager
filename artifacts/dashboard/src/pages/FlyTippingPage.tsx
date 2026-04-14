import React, { useState } from "react";
import { printProReport } from "@/lib/print-report";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Trash2, Camera, File, Loader2, MapPin, Printer, ChevronDown, ChevronUp } from "lucide-react";

const WASTE_TYPES = [
  "Household waste (bags / loose)",
  "Commercial waste",
  "Construction / demolition debris",
  "Asbestos / fibrous material",
  "Tyres",
  "Electrical / WEEE",
  "Chemical containers / drums",
  "Clinical / medical waste",
  "Scrap metal / vehicles",
  "Garden / green waste",
  "Soil / hardcore",
  "Animal carcasses",
  "Fridges / white goods",
  "Mattresses / furniture",
  "Mixed waste",
];

const CLEARANCE_STATUSES = [
  { value: "pending", label: "Pending", bg: "#fef9c3", color: "#a16207", border: "#fde047" },
  { value: "arranged", label: "Clearance Arranged", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  { value: "cleared", label: "Cleared", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

interface Photo { id: number; objectPath: string; fileName: string | null; }
interface Incident {
  id: number;
  farmId: number;
  discoveredAt: string;
  locationDescription: string;
  latitude: string | null;
  longitude: string | null;
  wasteTypes: string | null;
  estimatedQuantity: string | null;
  isHazardous: boolean;
  accessPoint: string | null;
  policeReported: boolean;
  policeRefNumber: string | null;
  councilReported: boolean;
  councilRefNumber: string | null;
  eaReported: boolean;
  eaRefNumber: string | null;
  clearanceStatus: string;
  clearanceContractor: string | null;
  clearanceDate: string | null;
  wasteTransferNoteRef: string | null;
  notes: string | null;
  photos: Photo[];
}

function PhotoPanel({ incidentId, farmId, photos }: { incidentId: number; farmId: number; photos: Photo[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const deleteMut = useMutation({
    mutationFn: (photoId: number) => fetch(`/api/farms/${farmId}/fly-tipping/${incidentId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fly-tipping", farmId] }),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setIsUploading(true);
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/fly-tipping/${incidentId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath, fileName: file.name }),
      });
      qc.invalidateQueries({ queryKey: ["fly-tipping", farmId] });
      toast({ title: "Photo uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div style={{ padding: "10px 14px 12px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }}>Evidence Photos</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }}>
        {photos.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }}>
            <File size={12} style={{ color: "#2563eb" }} />
            <a href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }}>
              {p.fileName ?? "Photo"}
            </a>
            <button onClick={() => deleteMut.mutate(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, marginLeft: 2 }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <input
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          disabled={isUploading}
          onChange={handleFileChange}
        />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff" }}>
          {isUploading ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</> : <><Camera size={12} /> Add Photo</>}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>JPG, PNG or PDF</span>
      </label>
    </div>
  );
}

function viewField(label: string, value?: string | null | boolean) {
  return (
    <div>
      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value === true ? "Yes" : value === false ? "No" : (value as string) || "—"}</div>
    </div>
  );
}

function viewDialogContent(inc: Incident) {
  const types: string[] = inc.wasteTypes ? JSON.parse(inc.wasteTypes) : [];
  const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {inc.isHazardous && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "6px 12px", color: "#dc2626", fontWeight: 700, fontSize: "0.875rem" }}>⚠ HAZARDOUS WASTE</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {viewField("Date Discovered", fmtD(inc.discoveredAt))}
        {viewField("Clearance Status", inc.clearanceStatus?.replace(/-/g, " "))}
      </div>
      {viewField("Location", inc.locationDescription)}
      {inc.accessPoint && viewField("Access Point", inc.accessPoint)}
      <div>
        <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Waste Types</div>
        <div style={{ fontSize: "0.875rem", color: types.length ? "#111827" : "#d1d5db" }}>{types.length ? types.join(", ") : "—"}</div>
      </div>
      {inc.estimatedQuantity && viewField("Estimated Quantity", inc.estimatedQuantity)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {viewField("Police Reported", inc.policeReported ? `Yes${inc.policeRefNumber ? ` — ${inc.policeRefNumber}` : ""}` : "No")}
        {viewField("Council Reported", inc.councilReported ? `Yes${inc.councilRefNumber ? ` — ${inc.councilRefNumber}` : ""}` : "No")}
        {viewField("EA Reported", inc.eaReported ? `Yes${inc.eaRefNumber ? ` — ${inc.eaRefNumber}` : ""}` : "No")}
      </div>
      {inc.clearanceContractor && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {viewField("Clearance Contractor", inc.clearanceContractor)}
          {viewField("Clearance Date", fmtD(inc.clearanceDate))}
        </div>
      )}
      {inc.wasteTransferNoteRef && viewField("Waste Transfer Note Ref", inc.wasteTransferNoteRef)}
      {inc.notes && viewField("Notes", inc.notes)}
    </div>
  );
}

const EMPTY: Omit<Incident, "id" | "farmId" | "photos"> = {
  discoveredAt: new Date().toISOString().slice(0, 10),
  locationDescription: "",
  latitude: null,
  longitude: null,
  wasteTypes: null,
  estimatedQuantity: null,
  isHazardous: false,
  accessPoint: null,
  policeReported: false,
  policeRefNumber: null,
  councilReported: false,
  councilRefNumber: null,
  eaReported: false,
  eaRefNumber: null,
  clearanceStatus: "pending",
  clearanceContractor: null,
  clearanceDate: null,
  wasteTransferNoteRef: null,
  notes: null,
};

export default function FlyTippingPage({ farmId }: { farmId: number | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: farmData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farm = farmData?.record;

  const q = useQuery<{ records: Incident[] }>({
    queryKey: ["fly-tipping", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fly-tipping`).then(r => r.json()),
    enabled: !!farmId,
  });
  const incidents: Incident[] = q.data?.records ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Incident | null>(null);
  const [editItem, setEditItem] = useState<Incident | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [form, setForm] = useState<Omit<Incident, "id" | "farmId" | "photos">>({ ...EMPTY });

  function openAdd() {
    setEditItem(null);
    setSelectedWasteTypes([]);
    setForm({ ...EMPTY, discoveredAt: new Date().toISOString().slice(0, 10) });
    setAddOpen(true);
  }

  function openEdit(r: Incident) {
    setEditItem(r);
    const types = r.wasteTypes ? JSON.parse(r.wasteTypes) : [];
    setSelectedWasteTypes(types);
    setForm({
      discoveredAt: r.discoveredAt?.slice(0, 10) ?? "",
      locationDescription: r.locationDescription ?? "",
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      wasteTypes: r.wasteTypes ?? null,
      estimatedQuantity: r.estimatedQuantity ?? null,
      isHazardous: r.isHazardous ?? false,
      accessPoint: r.accessPoint ?? null,
      policeReported: r.policeReported ?? false,
      policeRefNumber: r.policeRefNumber ?? null,
      councilReported: r.councilReported ?? false,
      councilRefNumber: r.councilRefNumber ?? null,
      eaReported: r.eaReported ?? false,
      eaRefNumber: r.eaRefNumber ?? null,
      clearanceStatus: r.clearanceStatus ?? "pending",
      clearanceContractor: r.clearanceContractor ?? null,
      clearanceDate: r.clearanceDate?.slice(0, 10) ?? null,
      wasteTransferNoteRef: r.wasteTransferNoteRef ?? null,
      notes: r.notes ?? null,
    });
    setAddOpen(true);
  }

  function toggleWasteType(t: string) {
    setSelectedWasteTypes(prev => {
      const next = prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t];
      setForm(f => ({ ...f, wasteTypes: next.length ? JSON.stringify(next) : null }));
      return next;
    });
  }

  const mut = useMutation({
    mutationFn: async (vars: { action: "create"; body: any } | { action: "update"; id: number; body: any } | { action: "delete"; id: number }) => {
      if (vars.action === "create") return fetch(`/api/farms/${farmId}/fly-tipping`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vars.body) }).then(r => r.json());
      if (vars.action === "update") return fetch(`/api/farms/${farmId}/fly-tipping/${vars.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vars.body) }).then(r => r.json());
      return fetch(`/api/farms/${farmId}/fly-tipping/${vars.id}`, { method: "DELETE" });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["fly-tipping", farmId] });
      if (vars.action === "create") { toast({ title: "Incident recorded" }); setAddOpen(false); }
      if (vars.action === "update") { toast({ title: "Incident updated" }); setAddOpen(false); setEditItem(null); }
      if (vars.action === "delete") { toast({ title: "Incident deleted" }); setDeleteId(null); }
    },
  });

  function handleSave() {
    const body = { ...form, wasteTypes: form.wasteTypes };
    if (editItem) mut.mutate({ action: "update", id: editItem.id, body });
    else mut.mutate({ action: "create", body });
  }

  const filtered = (statusFilter === "all" ? incidents : incidents.filter(i => i.clearanceStatus === statusFilter))
    .filter(i => isInCropYear(i.discoveredAt, cropYear));
  const openCount = incidents.filter(i => i.clearanceStatus !== "cleared").length;

  function clearanceStyle(status: string) {
    const s = CLEARANCE_STATUSES.find(x => x.value === status);
    return s ? { background: s.bg, color: s.color, border: `1px solid ${s.border}` } : {};
  }
  function clearanceLabel(status: string) {
    return CLEARANCE_STATUSES.find(x => x.value === status)?.label ?? status;
  }

  function handlePrint() {
    const rows = filtered.map(i => {
      const types = i.wasteTypes ? (JSON.parse(i.wasteTypes) as string[]).join(", ") : "—";
      const reports = [
        i.policeReported ? `Police${i.policeRefNumber ? ` (${i.policeRefNumber})` : ""}` : "",
        i.councilReported ? `Council${i.councilRefNumber ? ` (${i.councilRefNumber})` : ""}` : "",
        i.eaReported ? `Environment Agency${i.eaRefNumber ? ` (${i.eaRefNumber})` : ""}` : "",
      ].filter(Boolean).join("; ") || "Not yet reported";
      return `<tr>
        <td style="white-space:nowrap">${fmt(i.discoveredAt)}</td>
        <td>${i.locationDescription}</td>
        <td>${types}</td>
        <td style="${i.isHazardous ? "color:#dc2626;font-weight:700" : ""}">${i.isHazardous ? "⚠ YES" : "No"}</td>
        <td>${reports}</td>
        <td>${clearanceLabel(i.clearanceStatus)}</td>
        <td>${i.photos.length > 0 ? `${i.photos.length} photo(s)` : "—"}</td>
      </tr>`;
    }).join("");
    const tableHtml = `<table><thead><tr>
      <th>Date Found</th><th>Location</th><th>Waste Types</th><th>Hazardous</th><th>Reported To</th><th>Status</th><th>Photos</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: "Fly-Tipping Incident Log",
      subtitle: "Environmental Protection Act 1990",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      recordCount: filtered.length,
      recordLabel: "incident",
      extraMeta: `Crop Year: ${cropYearLabel(cropYear)}`,
      tableHtml,
      footerNote: "Under the Environmental Protection Act 1990, landowners are responsible for removing fly-tipped waste from their land. Report to local council and Environment Agency (0800 80 70 60) for hazardous waste.",
    });
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={22} style={{ color: "#dc2626" }} /> Fly-Tipping Incident Log
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>
              Record and track illegal waste dumping on your land — evidence gathering, authority reporting, and clearance status.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!farmId}>
              <Printer size={14} className="mr-2" /> Print Register
            </Button>
            <Button size="sm" onClick={openAdd} disabled={!farmId}>
              <Plus size={14} className="mr-1" /> Report Incident
            </Button>
          </div>
        </div>

        {!farmId && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1, color: "#d97706" }} />
            <p style={{ fontSize: "0.875rem", color: "#92400e" }}>Select a farm from the dropdown in the sidebar to view and record fly-tipping incidents.</p>
          </div>
        )}

        {farmId && (
          <>
            {/* Legal reminder banner */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 8, background: "#fff7ed", border: "1px solid #fed7aa", marginBottom: 20 }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2, color: "#ea580c" }} />
              <div style={{ fontSize: "0.8125rem", color: "#7c2d12" }}>
                <strong>Landowner responsibility:</strong> Under the Environmental Protection Act 1990, you are responsible for clearing fly-tipped waste from your private land at your own cost — even though you didn't dump it.
                {" "}<strong>Hazardous waste</strong> (asbestos, chemicals) must be removed by a licensed contractor — do not move or burn it.
                {" "}Report all incidents to your local council, and the Environment Agency if hazardous (0800 80 70 60).
              </div>
            </div>

            {/* Status filter + summary */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
              {["all", "pending", "arranged", "cleared"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: "0.8125rem", cursor: "pointer", fontWeight: statusFilter === s ? 600 : 400,
                    background: statusFilter === s ? "#111827" : "#f3f4f6",
                    color: statusFilter === s ? "#fff" : "#374151",
                    border: "1px solid " + (statusFilter === s ? "#111827" : "#e5e7eb"),
                  }}
                >
                  {s === "all" ? `All (${incidents.length})` : clearanceLabel(s)}
                </button>
              ))}
              <CropYearSelector value={cropYear} onChange={setCropYear} />
              {openCount > 0 && (
                <Badge style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", marginLeft: "auto" }}>
                  <AlertTriangle size={11} className="mr-1" /> {openCount} open {openCount === 1 ? "incident" : "incidents"}
                </Badge>
              )}
            </div>

            {q.isLoading ? (
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
                <AlertTriangle size={32} style={{ margin: "0 auto 8px", opacity: 0.3, color: "#dc2626" }} />
                <p style={{ fontWeight: 600, color: "#374151" }}>
                  {statusFilter === "all" ? "No incidents recorded" : `No ${clearanceLabel(statusFilter).toLowerCase()} incidents`}
                </p>
                {statusFilter === "all" && (
                  <p style={{ fontSize: "0.875rem" }}>If you find fly-tipped waste on your land, use this log to record the incident, track authority reports, and manage clearance.</p>
                )}
              </div>
            ) : (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Date Found</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Location</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Waste / Volume</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Reported</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Status</th>
                      <th style={{ padding: "10px 14px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inc, i) => {
                      const types: string[] = inc.wasteTypes ? JSON.parse(inc.wasteTypes) : [];
                      const reports = [inc.policeReported && "Police", inc.councilReported && "Council", inc.eaReported && "Env. Agency"].filter(Boolean);
                      return (
                        <React.Fragment key={inc.id}>
                          <tr style={{ borderBottom: expandedId === inc.id ? undefined : (i < filtered.length - 1 ? "1px solid #f3f4f6" : undefined) }}>
                            <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                              <div>{fmt(inc.discoveredAt)}</div>
                            </td>
                            <td style={{ padding: "10px 14px", maxWidth: 200 }}>
                              <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                                <MapPin size={12} style={{ flexShrink: 0, marginTop: 2, color: "#6b7280" }} />
                                <span>{inc.locationDescription}</span>
                              </div>
                              {inc.isHazardous && (
                                <span style={{ display: "inline-block", marginTop: 4, padding: "1px 7px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                                  ⚠ HAZARDOUS
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ fontSize: "0.8125rem" }}>{types.length ? types.slice(0, 2).join(", ") + (types.length > 2 ? ` +${types.length - 2} more` : "") : "—"}</div>
                              {inc.estimatedQuantity && <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }}>{inc.estimatedQuantity}</div>}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              {reports.length === 0 ? (
                                <span style={{ fontSize: "0.8125rem", color: "#ef4444" }}>Not reported</span>
                              ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {reports.map(r => (
                                    <span key={r as string} style={{ padding: "1px 7px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>{r}</span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, ...clearanceStyle(inc.clearanceStatus) }}>
                                {clearanceLabel(inc.clearanceStatus)}
                              </span>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                                <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, display: "flex", alignItems: "center", gap: 3 }} onClick={() => setExpandedId(expandedId === inc.id ? null : inc.id)}>
                                  <Camera size={11} />{inc.photos.length > 0 ? inc.photos.length : ""} Photos
                                  {expandedId === inc.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                </Button>
                                <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => setViewItem(inc)}>View</Button>
                                <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#dc2626" }} onClick={() => setDeleteId(inc.id)}>Del</Button>
                              </div>
                            </td>
                          </tr>
                          {expandedId === inc.id && (
                            <tr style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : undefined }}>
                              <td colSpan={6} style={{ padding: 0 }}>
                                <PhotoPanel incidentId={inc.id} farmId={farmId} photos={inc.photos} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* View dialog */}
        {viewItem && (
          <Dialog open onOpenChange={() => setViewItem(null)}>
            <DialogContent style={{ maxWidth: 560 }}>
              <DialogHeader>
                <DialogTitle>Fly-Tipping Incident</DialogTitle>
              </DialogHeader>
              {viewDialogContent(viewItem)}
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
                <Button onClick={() => { const r = viewItem; setViewItem(null); openEdit(r); }}>Edit Incident</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add / Edit dialog */}
        {(addOpen) && (
          <Dialog open onOpenChange={open => { if (!open) { setAddOpen(false); setEditItem(null); } }}>
            <DialogContent style={{ maxWidth: 580, maxHeight: "85vh", overflowY: "auto" }}>
              <DialogHeader>
                <DialogTitle>{editItem ? "Edit Incident" : "Report Fly-Tipping Incident"}</DialogTitle>
              </DialogHeader>

              <div style={{ display: "grid", gap: 14 }}>
                {/* Date & location */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label>Date Discovered *</Label>
                    <Input type="date" className="mt-1" value={form.discoveredAt?.slice(0, 10) ?? ""} onChange={e => setForm(f => ({ ...f, discoveredAt: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Estimated Volume / Quantity</Label>
                    <Input className="mt-1" value={form.estimatedQuantity ?? ""} onChange={e => setForm(f => ({ ...f, estimatedQuantity: e.target.value || null }))} placeholder="e.g. 2 transit van loads" />
                  </div>
                </div>

                <div>
                  <Label>Location Description *</Label>
                  <Textarea className="mt-1" rows={2} value={form.locationDescription ?? ""} onChange={e => setForm(f => ({ ...f, locationDescription: e.target.value }))} placeholder="e.g. North-east corner of Top Field, adjacent to the public bridleway gate — OS grid ref TF123456" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label>GPS Latitude</Label>
                    <Input className="mt-1" value={form.latitude ?? ""} onChange={e => setForm(f => ({ ...f, latitude: e.target.value || null }))} placeholder="e.g. 53.2145" />
                  </div>
                  <div>
                    <Label>GPS Longitude</Label>
                    <Input className="mt-1" value={form.longitude ?? ""} onChange={e => setForm(f => ({ ...f, longitude: e.target.value || null }))} placeholder="e.g. -0.5432" />
                  </div>
                </div>

                <div>
                  <Label>Access Point / Entry Route</Label>
                  <Input className="mt-1" value={form.accessPoint ?? ""} onChange={e => setForm(f => ({ ...f, accessPoint: e.target.value || null }))} placeholder="e.g. Gate on Pottergate Road — padlock found cut" />
                </div>

                {/* Waste types */}
                <div>
                  <Label>Waste Types *</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {WASTE_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleWasteType(t)}
                        style={{
                          padding: "4px 10px", borderRadius: 20, fontSize: "0.8rem", cursor: "pointer",
                          background: selectedWasteTypes.includes(t) ? "#dc2626" : "#f3f4f6",
                          color: selectedWasteTypes.includes(t) ? "#fff" : "#374151",
                          border: "1px solid " + (selectedWasteTypes.includes(t) ? "#dc2626" : "#e5e7eb"),
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hazardous toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7 }}>
                  <input
                    type="checkbox"
                    id="hazardous"
                    checked={!!form.isHazardous}
                    onChange={e => setForm(f => ({ ...f, isHazardous: e.target.checked }))}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="hazardous" style={{ fontWeight: 600, color: "#dc2626", fontSize: "0.875rem", cursor: "pointer" }}>
                    ⚠ Hazardous waste present (asbestos, chemicals, clinical/medical, fuel/oil)
                  </label>
                </div>
                {form.isHazardous && (
                  <div style={{ padding: "8px 12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, fontSize: "0.8125rem", color: "#7c2d12" }}>
                    <strong>Do not touch or move hazardous waste.</strong> Contact the Environment Agency immediately on <strong>0800 80 70 60</strong>. Removal must be carried out by a licensed waste contractor.
                  </div>
                )}

                {/* Reporting */}
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 8 }}>Authority Reports</p>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      { key: "policeReported", refKey: "policeRefNumber", label: "Reported to Police", refLabel: "Crime Reference Number", hint: "Call 101 or report online" },
                      { key: "councilReported", refKey: "councilRefNumber", label: "Reported to Local Council", refLabel: "Council Reference Number", hint: "Use your district council's fly-tipping report form" },
                      { key: "eaReported", refKey: "eaRefNumber", label: "Reported to Environment Agency", refLabel: "EA Reference Number", hint: "Call 0800 80 70 60 — required for hazardous waste" },
                    ].map(({ key, refKey, label, refLabel, hint }) => (
                      <div key={key} style={{ border: "1px solid #e5e7eb", borderRadius: 7, overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: (form as any)[key] ? "#f0fdf4" : "#f9fafb" }}>
                          <input
                            type="checkbox"
                            id={key}
                            checked={!!(form as any)[key]}
                            onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                            style={{ width: 15, height: 15 }}
                          />
                          <label htmlFor={key} style={{ fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", flex: 1, color: "#111827" }}>{label}</label>
                          <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{hint}</span>
                        </div>
                        {(form as any)[key] && (
                          <div style={{ padding: "8px 12px", borderTop: "1px solid #e5e7eb" }}>
                            <Input
                              value={(form as any)[refKey] ?? ""}
                              onChange={e => setForm(f => ({ ...f, [refKey]: e.target.value || null }))}
                              placeholder={refLabel}
                              style={{ fontSize: "0.875rem" }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clearance */}
                <div>
                  <Label>Clearance Status</Label>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {CLEARANCE_STATUSES.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, clearanceStatus: s.value }))}
                        style={{
                          flex: 1, padding: "6px 8px", borderRadius: 7, fontSize: "0.8rem", cursor: "pointer", fontWeight: form.clearanceStatus === s.value ? 600 : 400,
                          background: form.clearanceStatus === s.value ? s.bg : "#f9fafb",
                          color: form.clearanceStatus === s.value ? s.color : "#6b7280",
                          border: `1px solid ${form.clearanceStatus === s.value ? s.border : "#e5e7eb"}`,
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.clearanceStatus !== "pending" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <Label>Clearance Contractor</Label>
                      <Input className="mt-1" value={form.clearanceContractor ?? ""} onChange={e => setForm(f => ({ ...f, clearanceContractor: e.target.value || null }))} placeholder="Contractor name" />
                    </div>
                    <div>
                      <Label>Clearance Date</Label>
                      <Input type="date" className="mt-1" value={form.clearanceDate ?? ""} onChange={e => setForm(f => ({ ...f, clearanceDate: e.target.value || null }))} />
                    </div>
                  </div>
                )}

                {form.clearanceStatus === "cleared" && (
                  <div>
                    <Label>Waste Transfer Note Reference</Label>
                    <Input className="mt-1" value={form.wasteTransferNoteRef ?? ""} onChange={e => setForm(f => ({ ...f, wasteTransferNoteRef: e.target.value || null }))} placeholder="WTN reference — keep the physical copy" />
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>A Waste Transfer Note is legally required for all collected waste under the Environmental Protection (Duty of Care) Regulations 1991.</p>
                  </div>
                )}

                <div>
                  <Label>Notes</Label>
                  <Textarea className="mt-1" rows={2} value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))} placeholder="Vehicle descriptions, witness details, any identifying material found in the waste, etc." />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
                <Button
                  onClick={handleSave}
                  disabled={!form.locationDescription?.trim() || !form.discoveredAt || !form.wasteTypes}
                >
                  {editItem ? "Update Incident" : "Record Incident"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete confirm */}
        {deleteId !== null && (
          <Dialog open onOpenChange={() => setDeleteId(null)}>
            <DialogContent style={{ maxWidth: 380 }}>
              <DialogHeader><DialogTitle>Delete Incident Record?</DialogTitle></DialogHeader>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>This will permanently remove this fly-tipping incident and all associated photos. This action cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => mut.mutate({ action: "delete", id: deleteId! })}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
