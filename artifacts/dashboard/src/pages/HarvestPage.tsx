import React, { useState, useRef } from "react";
import { Link } from "wouter";
import { printFromRef } from "@/lib/print-report";
import { QUALITY_GRADE_OPTIONS, gradeLabel, gradeColors } from "@/lib/harvestGrades";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { VEHICLE_TYPES } from "@/lib/equipmentTypes";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Tractor,
  Warehouse,
  Truck,
  Printer,
  Trash2,
  Wheat,
  ChevronDown,
  ChevronRight,
  Pencil,
  Scale,
  MapPin,
} from "lucide-react";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDateTime = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

type TabKey = "log" | "dayview" | "transport" | "storage" | "print";


export default function HarvestPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabKey>("log");
  const harvestQ = useQuery({
    queryKey: ["harvests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvests`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const transportQ = useQuery({
    queryKey: ["harvest-transport", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvest-transport`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const storageQ = useQuery({
    queryKey: ["harvest-storage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvest-storage`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const fieldCropQ = useQuery({
    queryKey: ["field-crops", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-crops`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farmRecord = farmQ.data?.record ?? null;

  const harvests: any[] = harvestQ.data ?? [];
  const transports: any[] = transportQ.data ?? [];
  const storages: any[] = storageQ.data ?? [];
  const equipment: any[] = equipmentQ.data ?? [];
  const fieldCrops: any[] = fieldCropQ.data ?? [];

  return (
    <AppLayout title="Harvest Records">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Complete harvest audit trail — machinery used, operator, yield, transport legs, and storage intake. Required for Red Tractor Combinable Crops assessments.
          </p>
        </div>

        {(() => {
          const yr = currentCropYear();
          const thisSeasonHarvests = harvests.filter((r: any) => isInCropYear(r.harvestDate, yr));
          const thisSeasonFields = new Set(thisSeasonHarvests.map((r: any) => r.field?.name).filter(Boolean)).size;

          const cropYieldMap: Record<string, number> = {};
          for (const r of thisSeasonHarvests) {
            const cropName = r.crop?.name || "Unknown Crop";
            const variety = r.crop?.variety;
            const key = variety ? `${cropName} (${variety})` : cropName;
            cropYieldMap[key] = (cropYieldMap[key] || 0) + (parseFloat(r.yieldTonnes) || 0);
          }
          const cropYieldEntries = Object.entries(cropYieldMap).sort((a, b) => b[1] - a[1]);

          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              <StatCard icon={<Wheat size={18} color="#15803d" />} label={`Harvests — ${cropYearLabel(yr)}`} value={thisSeasonHarvests.length} bg="#f0fdf4" iconBg="#dcfce7" />
              <div style={{ background: "#eff6ff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", gap: 12 }}>
                <div style={{ background: "#dbeafe", borderRadius: 8, padding: 8, flexShrink: 0, alignSelf: "flex-start" }}>
                  <Scale size={18} color="#1d4ed8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 6 }}>Yield This Season</p>
                  {cropYieldEntries.length === 0 ? (
                    <p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>—</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 110, overflowY: "auto" }}>
                      {cropYieldEntries.map(([crop, tonnes]) => (
                        <div key={crop} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                          <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{crop}</span>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1d4ed8", flexShrink: 0 }}>{tonnes.toFixed(1)} t</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <StatCard icon={<MapPin size={18} color="#7c3aed" />} label="Fields Harvested" value={thisSeasonFields > 0 ? thisSeasonFields : "—"} bg="#f5f3ff" iconBg="#ede9fe" />
            </div>
          );
        })()}

        <TabBar className="mb-5">
          <TabButton active={tab === "log"} onClick={() => setTab("log")}>Harvest Log</TabButton>
          <TabButton active={tab === "dayview"} onClick={() => setTab("dayview")}>Day View</TabButton>
          <TabButton active={tab === "transport"} onClick={() => setTab("transport")}>Transport Legs</TabButton>
          <TabButton active={tab === "storage"} onClick={() => setTab("storage")}>Storage Records</TabButton>
          <TabButton active={tab === "print"} onClick={() => setTab("print")}>Print / Export</TabButton>
        </TabBar>

        {tab === "dayview" && (
          <DayViewTab harvests={harvests} fieldCrops={fieldCrops} loading={harvestQ.isLoading} />
        )}
        {tab === "log" && (
          <HarvestLogTab
            harvests={harvests}
            equipment={equipment}
            fieldCrops={fieldCrops}
            farmId={farmId}
            loading={harvestQ.isLoading}
            onRefresh={() => qc.invalidateQueries({ queryKey: ["harvests", farmId] })}
            toast={toast}
          />
        )}
        {tab === "transport" && (
          <TransportTab
            transports={transports}
            harvests={harvests}
            farmId={farmId}
            loading={transportQ.isLoading}
            onRefresh={() => qc.invalidateQueries({ queryKey: ["harvest-transport", farmId] })}
            toast={toast}
          />
        )}
        {tab === "storage" && (
          <StorageTab
            storages={storages}
            harvests={harvests}
            farmId={farmId}
            loading={storageQ.isLoading}
            onRefresh={() => qc.invalidateQueries({ queryKey: ["harvest-storage", farmId] })}
            toast={toast}
          />
        )}
        {tab === "print" && (
          <PrintTab harvests={harvests} transports={transports} storages={storages} farm={farmRecord} />
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ icon, label, value, bg, iconBg }: { icon: React.ReactNode; label: string; value: number | string; bg: string; iconBg: string }) {
  return (
    <div style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ background: iconBg, borderRadius: 8, padding: 8 }}>{icon}</div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{value}</p>
      </div>
    </div>
  );
}

function HarvestLogTab({ harvests, equipment, fieldCrops, farmId, loading, onRefresh, toast }: any) {
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames: string[] = (membersData?.members ?? []).filter((m: any) => m.isActive).map(memberFullName);
  const { displayName: currentUserName } = useUserRole();
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const emptyForm = {
    fieldCropAssignmentId: "",
    harvestDate: "",
    startTime: "",
    endTime: "",
    equipmentId: "",
    operatorName: "",
    yieldTonnes: "",
    areaHarvestedHa: "",
    moisturePercent: "",
    qualityGrade: "",
    recordedBy: "",
    notes: "",
    isOrganicCertified: false,
    organicCertRef: "",
  };
  const [form, setForm] = useState<any>(emptyForm);
  const formOpen = addOpen || !!editRecord;
  function openEdit(r: any) {
    setEditRecord(r);
    setForm({
      fieldCropAssignmentId: r.fieldCropAssignmentId ? String(r.fieldCropAssignmentId) : "",
      harvestDate: r.harvestDate ? r.harvestDate.slice(0, 10) : "",
      startTime: r.startTime || "",
      endTime: r.endTime || "",
      equipmentId: r.equipmentId ? String(r.equipmentId) : "",
      operatorName: r.operatorName || "",
      yieldTonnes: r.yieldTonnes != null ? String(r.yieldTonnes) : "",
      areaHarvestedHa: r.areaHarvestedHa != null ? String(r.areaHarvestedHa) : "",
      moisturePercent: r.moisturePercent != null ? String(r.moisturePercent) : "",
      qualityGrade: r.qualityGrade || "",
      recordedBy: r.recordedBy || "",
      notes: r.notes || "",
      isOrganicCertified: r.isOrganicCertified ?? false,
      organicCertRef: r.organicCertRef ?? "",
    });
  }
  function closeForm() { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }

  const createMut = useMutation({
    mutationFn: (body: any) =>
      fetch(`/api/farms/${farmId}/harvests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast({ title: "Harvest record saved" });
      onRefresh();
      closeForm();
    },
    onError: () => toast({ title: "Failed to save harvest record", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      fetch(`/api/farms/${farmId}/harvests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast({ title: "Harvest record updated" });
      onRefresh();
      closeForm();
    },
    onError: () => toast({ title: "Failed to update harvest record", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/harvests/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Record deleted" });
      onRefresh();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const vehicleEquipment: any[] = equipment.filter((e: any) => VEHICLE_TYPES.has(e.type));

  const filtered = harvests.filter((r: any) => {
    if (!isInCropYear(r.harvestDate, cropYear)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.field?.name?.toLowerCase().includes(s) ||
      r.crop?.name?.toLowerCase().includes(s) ||
      r.operatorName?.toLowerCase().includes(s) ||
      r.equipment?.name?.toLowerCase().includes(s) ||
      r.qualityGrade?.toLowerCase().includes(s)
    );
  });

  // Derive the UK crop year from the selected harvest date (Aug–Jul season).
  // Crop Year Y = 1 Aug (Y-1) → 31 Jul Y.
  const harvestCropYear: number | null = form.harvestDate
    ? (() => {
        const d = new Date(form.harvestDate);
        return (d.getMonth() + 1) >= 8 ? d.getFullYear() + 1 : d.getFullYear();
      })()
    : null;

  // Only show field-crop assignments that belong to the same crop season as
  // the chosen harvest date. When no date is selected yet, show all.
  const relevantFieldCrops: any[] = harvestCropYear
    ? fieldCrops.filter((fc: any) => !fc.year || fc.year === harvestCropYear)
    : fieldCrops;

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search harvests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} />
        <Button size="sm" onClick={() => { setForm({ ...emptyForm, recordedBy: currentUserName || "" }); setEditRecord(null); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" />Log Harvest
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Wheat size={28} color="#9ca3af" />} title="No harvests recorded yet" subtitle="Log your first harvest to begin your Red Tractor audit trail." />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["", "Date", "Field", "Crop", "Machinery", "Operator", "Yield (t)", "Moisture %", "Grade", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, i: number) => (
                <React.Fragment key={r.id}>
                  <tr
                    style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <td style={{ padding: "0.5rem 0.5rem 0.5rem 0.75rem", width: 24, color: "#9ca3af" }}>
                      {expandedId === r.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280" }}>{fmt(r.harvestDate)}</td>
                    <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.field?.name || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      <span style={{ fontWeight: 500 }}>{r.crop?.name || "—"}</span>
                      {r.crop?.variety ? <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}> ({r.crop.variety})</span> : null}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#374151" }}>
                      {r.equipment ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Tractor size={12} color="#6b7280" />
                          {r.equipment.name}
                          {r.equipment.registrationNumber ? <span style={{ color: "#9ca3af", fontSize: "0.7rem" }}>({r.equipment.registrationNumber})</span> : null}
                        </span>
                      ) : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.operatorName || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", fontWeight: 600, color: "#166534" }}>{r.yieldTonnes ? `${r.yieldTonnes}t` : "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.moisturePercent ? `${r.moisturePercent}%` : "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      {r.qualityGrade ? <GradeBadge grade={r.qualityGrade} /> : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.5rem" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr style={{ background: "#fafafa" }}>
                      <td colSpan={10} style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, fontSize: "0.8rem" }}>
                          {[
                            ["Field Ref", r.field?.fieldReference],
                            ["Area Harvested", r.areaHarvestedHa ? `${r.areaHarvestedHa} ha` : null],
                            ["Start Time", r.startTime],
                            ["End Time", r.endTime],
                            ["Season / Year", r.fieldCropAssignment?.season && r.fieldCropAssignment?.year ? `${r.fieldCropAssignment.season} ${r.fieldCropAssignment.year}` : null],
                            ["Equipment Type", r.equipment?.type],
                            ["Equipment Serial", r.equipment?.serialNumber],
                            ["Recorded By", r.recordedBy],
                            ["Notes", r.notes],
                          ].map(([k, v]) => v ? (
                            <div key={k}>
                              <span style={{ color: "#9ca3af", display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>{k}</span>
                              <span style={{ color: "#374151", fontWeight: 500 }}>{v}</span>
                            </div>
                          ) : null)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) closeForm(); }}>
        <DialogContent style={{ maxWidth: 580 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Harvest Record" : "Log Harvest Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Harvest Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input
                  type="date"
                  value={form.harvestDate}
                  onChange={e => {
                    const newDate = e.target.value;
                    const newYear = newDate
                      ? (() => { const d = new Date(newDate); return (d.getMonth() + 1) >= 8 ? d.getFullYear() + 1 : d.getFullYear(); })()
                      : null;
                    const validIds = newYear
                      ? new Set(fieldCrops.filter((fc: any) => !fc.year || fc.year === newYear).map((fc: any) => String(fc.id)))
                      : null;
                    setForm((f: any) => {
                      const keepSelection = !validIds || validIds.has(f.fieldCropAssignmentId);
                      return {
                        ...f,
                        harvestDate: newDate,
                        fieldCropAssignmentId: keepSelection ? f.fieldCropAssignmentId : "",
                        areaHarvestedHa: keepSelection ? f.areaHarvestedHa : "",
                      };
                    });
                  }}
                />
              </div>
              <div>
                <Label>Field & Crop <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select
                  value={form.fieldCropAssignmentId}
                  onValueChange={v => {
                    const fc = relevantFieldCrops.find((x: any) => String(x.id) === v);
                    const area = fc?.areaHectares ? parseFloat(String(fc.areaHectares)).toFixed(2) : "";
                    setForm((f: any) => ({ ...f, fieldCropAssignmentId: v, areaHarvestedHa: area }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder={harvestCropYear ? "Select field / crop..." : "Set harvest date first…"} /></SelectTrigger>
                  <SelectContent>
                    {relevantFieldCrops.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                        No crops recorded for the {harvestCropYear ? `${harvestCropYear - 1}/${String(harvestCropYear).slice(2)} season` : "selected period"}
                      </div>
                    ) : (
                      relevantFieldCrops.map((fc: any) => (
                        <SelectItem key={fc.id} value={String(fc.id)}>
                          {fc.fieldName || `Field #${fc.fieldId}`} — {fc.cropName || `Crop #${fc.cropId}`}
                          {fc.year ? ` (${fc.year - 1}/${String(fc.year).slice(2)})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input type="time" placeholder="e.g. 09:30" value={form.startTime} onChange={e => setForm((f: any) => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" placeholder="e.g. 18:00" value={form.endTime} onChange={e => setForm((f: any) => ({ ...f, endTime: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Machinery Used</Label>
                <Select value={form.equipmentId} onValueChange={v => setForm((f: any) => ({ ...f, equipmentId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select machinery..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None / not recorded</SelectItem>
                    {vehicleEquipment.map((eq: any) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        {eq.name} {eq.registrationNumber ? `(${eq.registrationNumber})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Operator Name</Label>
                <StaffSelect
                  value={form.operatorName}
                  onChange={v => setForm((f: any) => ({ ...f, operatorName: v }))}
                  staffNames={staffNames}
                  loading={membersLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Yield (tonnes)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={form.yieldTonnes} onChange={e => setForm((f: any) => ({ ...f, yieldTonnes: e.target.value }))} />
              </div>
              <div>
                <Label>Area Harvested (ha)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={form.areaHarvestedHa} onChange={e => setForm((f: any) => ({ ...f, areaHarvestedHa: e.target.value }))} />
              </div>
              <div>
                <Label>Moisture %</Label>
                <Input type="number" step="0.1" placeholder="0.0" value={form.moisturePercent} onChange={e => setForm((f: any) => ({ ...f, moisturePercent: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quality Grade</Label>
                <Select value={form.qualityGrade} onValueChange={v => setForm((f: any) => ({ ...f, qualityGrade: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select grade..." /></SelectTrigger>
                  <SelectContent>
                    {QUALITY_GRADE_OPTIONS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recorded By</Label>
                <Input placeholder="Name of person completing record" value={form.recordedBy} onChange={e => setForm((f: any) => ({ ...f, recordedBy: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Conditions on day, issues encountered, etc." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>

            {/* ─── Organic Certification ─────────────────────────────────── */}
            <div className={`rounded-xl border-2 p-3 transition-colors ${form.isOrganicCertified ? "border-green-400 bg-green-50" : "border-dashed border-border"}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isOrganicCertified ?? false}
                  onChange={e => setForm((f: any) => ({ ...f, isOrganicCertified: e.target.checked }))}
                  className="w-4 h-4 accent-green-600"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Organic Certified Harvest</p>
                  <p className="text-xs text-muted-foreground">Mark this yield as organic — required for Red Tractor organic produce traceability.</p>
                </div>
              </label>
              {form.isOrganicCertified && (
                <div className="mt-3">
                  <Label>Organic Certification Reference</Label>
                  <Input
                    placeholder="e.g. SA-CERT-12345 or OF&G operator number"
                    value={form.organicCertRef}
                    onChange={e => setForm((f: any) => ({ ...f, organicCertRef: e.target.value }))}
                    className="mt-1 border-green-300 focus:border-green-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your certifier's reference number for this organic crop — links this harvest to your organic certification record.</p>
                </div>
              )}
            </div>
          </div>
          {editRecord && farmId && (
            <RecordAttachments farmId={farmId} recordType="harvest_record" recordId={editRecord.id} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
            <Button
              onClick={() => editRecord ? updateMut.mutate({ id: editRecord.id, body: form }) : createMut.mutate(form)}
              disabled={!form.fieldCropAssignmentId || !form.harvestDate || createMut.isPending || updateMut.isPending}
            >
              {editRecord ? (updateMut.isPending ? "Saving…" : "Save Changes") : (createMut.isPending ? "Saving…" : "Save Harvest Record")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Harvest Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This will permanently delete the harvest record. Transport and storage records linked to it may also be affected.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TransportTab({ transports, harvests, farmId, loading, onRefresh, toast }: any) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = {
    harvestRecordId: "",
    vehicleRegistration: "",
    driverName: "",
    weightTonnes: "",
    departureTime: "",
    arrivalTime: "",
    notes: "",
  };
  const [form, setForm] = useState<any>(emptyForm);

  const createMut = useMutation({
    mutationFn: (body: any) =>
      fetch(`/api/farms/${farmId}/harvest-transport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast({ title: "Transport leg saved" });
      onRefresh();
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save transport record", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/harvest-transport/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Transport record deleted" });
      onRefresh();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }} disabled={harvests.length === 0}>
          <Plus size={14} className="mr-1" />Add Transport Leg
        </Button>
      </div>
      {harvests.length === 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e" }}>
          Log a harvest record first before adding transport legs.
        </div>
      )}
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
      ) : transports.length === 0 ? (
        <EmptyState icon={<Truck size={28} color="#9ca3af" />} title="No transport legs recorded" subtitle="Record each vehicle movement from field to store or buyer." />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Harvest", "Field", "Crop", "Vehicle Reg.", "Driver", "Weight (t)", "Departure", "Arrival", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transports.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < transports.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.harvest?.harvestDate)}</td>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.field?.name || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#374151" }}>{r.crop?.name || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>
                    {r.vehicleRegistration ? (
                      <Badge style={{ background: "#f3f4f6", color: "#374151", border: "none", fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {r.vehicleRegistration.toUpperCase()}
                      </Badge>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.driverName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 600, color: "#166534" }}>{r.weightTonnes ? `${r.weightTonnes}t` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }}>{fmtDateTime(r.departureTime)}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }}>{fmtDateTime(r.arrivalTime)}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm(emptyForm); }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Add Transport Leg</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Harvest Record <span style={{ color: "#ef4444" }}>*</span></Label>
              <Select value={form.harvestRecordId} onValueChange={v => setForm((f: any) => ({ ...f, harvestRecordId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select harvest..." /></SelectTrigger>
                <SelectContent>
                  {harvests.map((h: any) => (
                    <SelectItem key={h.id} value={String(h.id)}>
                      {fmt(h.harvestDate)} — {h.field?.name || "Field"} / {h.crop?.name || "Crop"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vehicle Registration</Label>
                <Input placeholder="e.g. AB12 CDE" value={form.vehicleRegistration} onChange={e => setForm((f: any) => ({ ...f, vehicleRegistration: e.target.value }))} />
              </div>
              <div>
                <Label>Driver Name</Label>
                <Input placeholder="e.g. John Smith" value={form.driverName} onChange={e => setForm((f: any) => ({ ...f, driverName: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Weight Loaded (tonnes)</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={form.weightTonnes} onChange={e => setForm((f: any) => ({ ...f, weightTonnes: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Departure Date / Time</Label>
                <Input type="datetime-local" value={form.departureTime} onChange={e => setForm((f: any) => ({ ...f, departureTime: e.target.value }))} />
              </div>
              <div>
                <Label>Arrival Date / Time</Label>
                <Input type="datetime-local" value={form.arrivalTime} onChange={e => setForm((f: any) => ({ ...f, arrivalTime: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Destination, haulier details, etc." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.harvestRecordId || createMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Transport Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this transport leg?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StorageTab({ storages, harvests, farmId, loading, onRefresh, toast }: any) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const locationsQ = useQuery<{ records: { id: number; name: string; isActive: boolean }[] }>({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const activeLocations = (locationsQ.data?.records ?? []).filter(l => l.isActive);

  const binsQ = useQuery<{ id: number; binName: string }[]>({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const bins = Array.isArray(binsQ.data) ? binsQ.data : [];

  const emptyForm = {
    harvestRecordId: "",
    storageFacility: "",
    quantityTonnes: "",
    dateIn: "",
    dateOut: "",
    temperatureC: "",
    moisturePercent: "",
    notes: "",
  };
  const [form, setForm] = useState<any>(emptyForm);

  const createMut = useMutation({
    mutationFn: (body: any) =>
      fetch(`/api/farms/${farmId}/harvest-storage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast({ title: "Storage record saved" });
      onRefresh();
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save storage record", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/harvest-storage/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Storage record deleted" });
      onRefresh();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" />Add Storage Record
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
      ) : storages.length === 0 ? (
        <EmptyState icon={<Warehouse size={28} color="#9ca3af" />} title="No storage records yet" subtitle="Record where harvested grain or produce is stored, including intake moisture and temperature." />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Facility", "Crop", "Quantity (t)", "Date In", "Date Out", "Moisture %", "Temp (°C)", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storages.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < storages.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.storageFacility}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#374151" }}>{r.crop?.name || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 600, color: "#7c3aed" }}>{r.quantityTonnes ? `${r.quantityTonnes}t` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.dateIn)}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>{r.dateOut ? fmt(r.dateOut) : <span style={{ color: "#d1d5db" }}>In store</span>}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.moisturePercent ? `${r.moisturePercent}%` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.temperatureC != null ? `${r.temperatureC}°C` : "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm(emptyForm); }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Add Storage Record</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Linked Harvest (optional)</Label>
              <Select value={form.harvestRecordId} onValueChange={v => setForm((f: any) => ({ ...f, harvestRecordId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select harvest to link..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not linked to a specific harvest</SelectItem>
                  {harvests.map((h: any) => (
                    <SelectItem key={h.id} value={String(h.id)}>
                      {fmt(h.harvestDate)} — {h.field?.name || "Field"} / {h.crop?.name || "Crop"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Storage Facility / Location <span style={{ color: "#ef4444" }}>*</span></Label>
              <Select
                value={form.storageFacility || "__none__"}
                onValueChange={v => setForm((f: any) => ({ ...f, storageFacility: v === "__none__" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a storage location or bin…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a location…</SelectItem>
                  {activeLocations.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-xs text-muted-foreground font-semibold px-2 py-1">Storage Locations</SelectLabel>
                      {activeLocations.map(l => (
                        <SelectItem key={`loc-${l.id}`} value={l.name}>{l.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {bins.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-xs text-muted-foreground font-semibold px-2 py-1">Grain Storage Bins</SelectLabel>
                      {bins.map(b => (
                        <SelectItem key={`bin-${b.id}`} value={b.binName}>{b.binName}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {activeLocations.length === 0 && bins.length === 0 && (
                    <SelectItem value="__loading__" disabled>No locations set up yet</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Manage locations in{" "}
                <Link href="/storage-locations" className="underline hover:text-foreground">Storage Locations</Link>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity (tonnes)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={form.quantityTonnes} onChange={e => setForm((f: any) => ({ ...f, quantityTonnes: e.target.value }))} />
              </div>
              <div>
                <Label>Moisture at Intake %</Label>
                <Input type="number" step="0.1" placeholder="0.0" value={form.moisturePercent} onChange={e => setForm((f: any) => ({ ...f, moisturePercent: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date In <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" value={form.dateIn} onChange={e => setForm((f: any) => ({ ...f, dateIn: e.target.value }))} />
              </div>
              <div>
                <Label>Date Out (leave blank if still in store)</Label>
                <Input type="date" value={form.dateOut} onChange={e => setForm((f: any) => ({ ...f, dateOut: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Temperature at Intake (°C)</Label>
              <Input type="number" step="0.1" placeholder="e.g. 14.5" value={form.temperatureC} onChange={e => setForm((f: any) => ({ ...f, temperatureC: e.target.value }))} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Any treatment applied, pest observations, etc." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.storageFacility || !form.dateIn || createMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Storage Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this storage record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PrintTab({ harvests, transports, storages, farm }: any) {
  const printRef = useRef<HTMLDivElement>(null);
  const [reportType, setReportType] = useState<"summary" | "detail">("summary");

  const isDetail = reportType === "detail";

  const handlePrint = () => {
    printFromRef(printRef, "Harvest Records — Red Tractor Audit", !isDetail);
  };

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const SECTION_HEAD: React.CSSProperties = {
    fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
    color: "#fff", background: "#1a3a1a", padding: "3px 8px", marginBottom: 6, borderRadius: 3,
  };
  const FIELD_LABEL: React.CSSProperties = { fontSize: "0.68rem", color: "#6b7280", display: "block", marginBottom: 1 };
  const FIELD_VALUE: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 500, color: "#111827" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>Format</span>
          <div style={{ display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", border: "1px solid #d1d5db" }}>
            {(["summary", "detail"] as const).map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                style={{
                  padding: "5px 14px", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                  background: reportType === type ? "#1a3a1a" : "#fff",
                  color: reportType === type ? "#fff" : "#374151",
                  border: "none", borderRight: type === "summary" ? "1px solid #d1d5db" : "none",
                }}
              >
                {type === "summary" ? "Summary Table" : "Full Detail Report"}
              </button>
            ))}
          </div>
          <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
            {isDetail
              ? "Portrait A4 · full card per harvest record (includes equipment serial, season, notes)"
              : "Landscape A4 · one row per harvest record"}
          </span>
        </div>
        <Button size="sm" onClick={handlePrint}>
          <Printer size={14} className="mr-1" />Print / Export PDF
        </Button>
      </div>

      <div ref={printRef} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "2rem" }}>
        <h1 style={{ fontSize: "1.125rem", fontWeight: 700, borderBottom: "2px solid #333", paddingBottom: 8, marginBottom: 4 }}>
          Harvest Records — Red Tractor Compliance Report{isDetail ? " (Full Detail)" : ""}
        </h1>
        {farm && (
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827", marginBottom: 2 }}>
            {farm.name}{farm.cphNumber ? ` · CPH: ${farm.cphNumber}` : ""}{farm.redTractorId ? ` · Red Tractor ID: ${farm.redTractorId}` : ""}
          </p>
        )}
        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "1.5rem" }}>
          Printed: {today} &nbsp;|&nbsp; BDE Farm Trac
        </p>

        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#166534", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8, marginTop: 20 }}>
          Harvest Log ({harvests.length} records)
        </h2>

        {harvests.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: 16 }}>No harvests recorded.</p>
        ) : isDetail ? (
          <div>
            {harvests.map((r: any, idx: number) => (
              <div key={r.id} className="record-card" style={{
                border: "1px solid #d1d5db", borderRadius: 6, marginBottom: 14,
                pageBreakInside: "avoid", breakInside: "avoid", overflow: "hidden",
              }}>
                <div style={{ background: "#f3f4f6", borderBottom: "1px solid #d1d5db", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>
                    #{idx + 1} &nbsp;{fmt(r.harvestDate)} — {r.field?.name || "Unknown Field"} — {r.crop?.name || "Unknown Crop"}{r.crop?.variety ? ` (${r.crop.variety})` : ""}
                  </span>
                  {r.qualityGrade && (
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: gradeColors(r.qualityGrade).bg, color: gradeColors(r.qualityGrade).color, border: "1px solid #e5e7eb" }}>
                      Grade: {gradeLabel(r.qualityGrade)}
                    </span>
                  )}
                </div>
                <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>

                  <div>
                    <p style={SECTION_HEAD}>Harvest Details</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                      {[
                        ["Date", fmt(r.harvestDate)],
                        ["Field", r.field?.name || "—"],
                        ["Field Reference", r.field?.fieldReference || "—"],
                        ["Season / Year", r.fieldCropAssignment?.season && r.fieldCropAssignment?.year ? `${r.fieldCropAssignment.season} ${r.fieldCropAssignment.year}` : "—"],
                        ["Crop", r.crop?.name || "—"],
                        ["Variety", r.crop?.variety || "—"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <span style={FIELD_LABEL}>{label}</span>
                          <span style={FIELD_VALUE}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={SECTION_HEAD}>Harvest Results</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                      {[
                        ["Yield (t)", r.yieldTonnes ? `${r.yieldTonnes} t` : "—"],
                        ["Area Harvested", r.areaHarvestedHa ? `${r.areaHarvestedHa} ha` : "—"],
                        ["Start Time", r.startTime || "—"],
                        ["End Time", r.endTime || "—"],
                        ["Moisture %", r.moisturePercent ? `${r.moisturePercent}%` : "—"],
                        ["Quality Grade", gradeLabel(r.qualityGrade)],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <span style={FIELD_LABEL}>{label}</span>
                          <span style={FIELD_VALUE}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={SECTION_HEAD}>Equipment Used</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                      {[
                        ["Machine Name", r.equipment?.name || "—"],
                        ["Type", r.equipment?.type || "—"],
                        ["Registration", r.equipment?.registrationNumber || "—"],
                        ["Serial Number", r.equipment?.serialNumber || "—"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <span style={FIELD_LABEL}>{label}</span>
                          <span style={FIELD_VALUE}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={SECTION_HEAD}>Personnel</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                      {[
                        ["Operator", r.operatorName || "—"],
                        ["Recorded By", r.recordedBy || "—"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <span style={FIELD_LABEL}>{label}</span>
                          <span style={FIELD_VALUE}>{value}</span>
                        </div>
                      ))}
                    </div>
                    {r.notes && (
                      <div style={{ marginTop: 10 }}>
                        <p style={SECTION_HEAD}>Notes</p>
                        <p style={{ fontSize: "0.78rem", color: "#374151", margin: 0, lineHeight: 1.5 }}>{r.notes}</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["Date", "Field", "Crop / Variety", "Machinery", "Operator", "Yield (t)", "Area (ha)", "Moisture %", "Grade", "Recorded By"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: "0.72rem", border: "1px solid #d1d5db" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {harvests.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{fmt(r.harvestDate)}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.field?.name}{r.field?.fieldReference ? ` (${r.field.fieldReference})` : ""}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.crop?.name}{r.crop?.variety ? ` — ${r.crop.variety}` : ""}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.equipment ? `${r.equipment.name}${r.equipment.registrationNumber ? ` (${r.equipment.registrationNumber})` : ""}` : "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.operatorName || "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.yieldTonnes || "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.areaHarvestedHa || "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.moisturePercent ? `${r.moisturePercent}%` : "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{gradeLabel(r.qualityGrade)}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.recordedBy || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1d4ed8", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8, marginTop: 20 }}>
          Transport Records ({transports.length} legs)
        </h2>
        {transports.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: 16 }}>No transport legs recorded.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#eff6ff" }}>
                {["Harvest Date", "Field / Crop", "Vehicle Reg.", "Driver", "Weight (t)", "Departure", "Arrival", "Notes"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: "0.72rem", border: "1px solid #bfdbfe" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transports.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ padding: "4px 8px", border: "1px solid #dbeafe", whiteSpace: "nowrap" }}>{fmt(r.harvest?.harvestDate)}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #dbeafe" }}>{r.field?.name} / {r.crop?.name}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #dbeafe", fontFamily: "monospace" }}>{r.vehicleRegistration?.toUpperCase() || "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #dbeafe" }}>{r.driverName || "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #dbeafe" }}>{r.weightTonnes || "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #dbeafe", whiteSpace: "nowrap" }}>{fmtDateTime(r.departureTime)}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #dbeafe", whiteSpace: "nowrap" }}>{fmtDateTime(r.arrivalTime)}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #dbeafe" }}>{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#7c3aed", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8, marginTop: 20 }}>
          Storage Records ({storages.length} entries)
        </h2>
        {storages.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: 16 }}>No storage records recorded.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#f5f3ff" }}>
                {["Facility", "Crop", "Quantity (t)", "Moisture %", "Temp (°C)", "Date In", "Date Out", "Notes"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: "0.72rem", border: "1px solid #ddd6fe" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storages.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ padding: "4px 8px", border: "1px solid #ede9fe" }}>{r.storageFacility}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #ede9fe" }}>{r.crop?.name || "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #ede9fe" }}>{r.quantityTonnes || "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #ede9fe" }}>{r.moisturePercent ? `${r.moisturePercent}%` : "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #ede9fe" }}>{r.temperatureC != null ? `${r.temperatureC}°C` : "—"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #ede9fe", whiteSpace: "nowrap" }}>{fmt(r.dateIn)}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #ede9fe", whiteSpace: "nowrap" }}>{r.dateOut ? fmt(r.dateOut) : "In store"}</td>
                  <td style={{ padding: "4px 8px", border: "1px solid #ede9fe" }}>{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 32, fontSize: "0.72rem", color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: 8 }}>
          Generated by BDE Farm Trac — Red Tractor Compliance Platform &nbsp;|&nbsp; Printed {today}
        </div>
      </div>
    </div>
  );
}

function DayViewTab({ harvests, fieldCrops, loading }: { harvests: any[]; fieldCrops: any[]; loading: boolean }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const dayRecords = harvests.filter((r: any) => {
    if (!r.harvestDate) return false;
    return new Date(r.harvestDate).toISOString().slice(0, 10) === selectedDate;
  });

  const totalHa = dayRecords.reduce((s: number, r: any) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
  const totalTonnes = dayRecords.reduce((s: number, r: any) => s + (parseFloat(r.yieldTonnes) || 0), 0);
  const avgMoisture = dayRecords.filter((r: any) => r.moisturePercent).length
    ? dayRecords.filter((r: any) => r.moisturePercent).reduce((s: number, r: any) => s + parseFloat(r.moisturePercent), 0) /
      dayRecords.filter((r: any) => r.moisturePercent).length
    : null;
  const avgYieldHa = totalHa > 0 ? totalTonnes / totalHa : null;

  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isToday = selectedDate === todayStr;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "0.4rem 0.75rem", fontSize: "0.875rem", background: "#fff", color: "#111827" }}
          />
        </div>
        <div style={{ paddingTop: 18 }}>
          <button
            onClick={() => setSelectedDate(todayStr)}
            style={{
              background: isToday ? "#dcfce7" : "#f3f4f6",
              color: isToday ? "#166534" : "#374151",
              border: "none", borderRadius: 8, padding: "0.4rem 0.9rem",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer"
            }}
          >
            Today
          </button>
        </div>
        <div style={{ paddingTop: 18, marginLeft: "auto" }}>
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{displayDate}</span>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
      ) : dayRecords.length === 0 ? (
        <EmptyState
          icon={<Wheat size={28} color="#9ca3af" />}
          title={`No harvest activity on ${displayDate}`}
          subtitle="Select a different date or log a harvest for this day."
        />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
            {[
              { label: "Fields Cut", value: dayRecords.length.toString(), color: "#15803d", bg: "#f0fdf4", iconBg: "#dcfce7" },
              { label: "Total Area", value: `${totalHa.toFixed(1)} ha`, color: "#1d4ed8", bg: "#eff6ff", iconBg: "#dbeafe" },
              { label: "Total Yield", value: `${totalTonnes.toFixed(1)} t`, color: "#7c3aed", bg: "#f5f3ff", iconBg: "#ede9fe" },
              { label: avgMoisture !== null ? "Avg Moisture" : "Yield / ha", value: avgMoisture !== null ? `${avgMoisture.toFixed(1)}%` : avgYieldHa !== null ? `${avgYieldHa.toFixed(2)} t/ha` : "—", color: "#92400e", bg: "#fffbeb", iconBg: "#fef3c7" },
            ].map(({ label, value, color, bg, iconBg }) => (
              <div key={label} style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }}>
                <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {dayRecords.map((r: any) => (
              <div key={r.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>{r.field?.name || "Unknown Field"}</p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 1 }}>
                      {r.crop?.name || "Unknown Crop"}{r.crop?.variety ? ` · ${r.crop.variety}` : ""}
                    </p>
                  </div>
                  {r.qualityGrade && <GradeBadge grade={r.qualityGrade} />}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["Area Harvested", r.areaHarvestedHa ? `${parseFloat(r.areaHarvestedHa).toFixed(2)} ha` : "—"],
                    ["Yield", r.yieldTonnes ? `${r.yieldTonnes} t` : "—"],
                    ["Moisture", r.moisturePercent ? `${r.moisturePercent}%` : "—"],
                    ["Yield / ha", r.yieldTonnes && r.areaHarvestedHa ? `${(parseFloat(r.yieldTonnes) / parseFloat(r.areaHarvestedHa)).toFixed(2)} t/ha` : "—"],
                    ["Operator", r.operatorName || "—"],
                    ["Machinery", r.equipment?.name || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }}>{k}</span>
                      <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                {r.notes && (
                  <p style={{ marginTop: 10, fontSize: "0.78rem", color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 8 }}>{r.notes}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const { bg, color } = gradeColors(grade);
  return (
    <Badge style={{ background: bg, color, border: "none", fontSize: "0.72rem" }}>
      {gradeLabel(grade)}
    </Badge>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
      <div style={{ background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}>{icon}</div>
      <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400 }}>{subtitle}</p>
    </div>
  );
}
