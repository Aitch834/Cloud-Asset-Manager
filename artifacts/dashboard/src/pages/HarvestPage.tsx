import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
} from "lucide-react";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDateTime = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const QUALITY_GRADES = ["Grade 1 (Premium)", "Grade 2 (Standard)", "Grade 3 (Feed)", "Rejected", "Pending Assessment"];

type TabKey = "log" | "transport" | "storage" | "print";

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.5rem 1.125rem",
        fontSize: "0.875rem",
        fontWeight: active ? 600 : 400,
        color: active ? "#15803d" : "#6b7280",
        background: "none",
        borderBottomWidth: active ? 2 : 0,
        borderBottomStyle: "solid" as const,
        borderBottomColor: active ? "#15803d" : "transparent",
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
        transition: "color 0.15s",
      }}
    >
      {children}
    </button>
  );
}

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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
          <StatCard icon={<Wheat size={18} color="#15803d" />} label="Harvests Logged" value={harvests.length} bg="#f0fdf4" iconBg="#dcfce7" />
          <StatCard icon={<Truck size={18} color="#1d4ed8" />} label="Transport Legs" value={transports.length} bg="#eff6ff" iconBg="#dbeafe" />
          <StatCard icon={<Warehouse size={18} color="#7c3aed" />} label="Storage Records" value={storages.length} bg="#f5f3ff" iconBg="#ede9fe" />
        </div>

        <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex", gap: 0, marginBottom: "1.25rem", overflowX: "auto" }}>
          <TabButton active={tab === "log"} onClick={() => setTab("log")}>Harvest Log</TabButton>
          <TabButton active={tab === "transport"} onClick={() => setTab("transport")}>Transport Legs</TabButton>
          <TabButton active={tab === "storage"} onClick={() => setTab("storage")}>Storage Records</TabButton>
          <TabButton active={tab === "print"} onClick={() => setTab("print")}>Print / Export</TabButton>
        </div>

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
          <PrintTab harvests={harvests} transports={transports} storages={storages} />
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ icon, label, value, bg, iconBg }: { icon: React.ReactNode; label: string; value: number; bg: string; iconBg: string }) {
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
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const emptyForm = {
    fieldCropAssignmentId: "",
    harvestDate: "",
    equipmentId: "",
    operatorName: "",
    yieldTonnes: "",
    areaHarvestedHa: "",
    moisturePercent: "",
    qualityGrade: "",
    recordedBy: "",
    notes: "",
  };
  const [form, setForm] = useState<any>(emptyForm);

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
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save harvest record", variant: "destructive" }),
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

  const filtered = harvests.filter((r: any) => {
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

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search harvests..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
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
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr style={{ background: "#fafafa" }}>
                      <td colSpan={10} style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, fontSize: "0.8rem" }}>
                          {[
                            ["Field Ref", r.field?.fieldReference],
                            ["Area Harvested", r.areaHarvestedHa ? `${r.areaHarvestedHa} ha` : null],
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

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm(emptyForm); }}>
        <DialogContent style={{ maxWidth: 580 }}>
          <DialogHeader><DialogTitle>Log Harvest Record</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Field & Crop <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.fieldCropAssignmentId} onValueChange={v => setForm((f: any) => ({ ...f, fieldCropAssignmentId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select field / crop..." /></SelectTrigger>
                  <SelectContent>
                    {fieldCrops.map((fc: any) => (
                      <SelectItem key={fc.id} value={String(fc.id)}>
                        {fc.fieldName || `Field #${fc.fieldId}`} — {fc.cropName || `Crop #${fc.cropId}`}
                        {fc.year ? ` (${fc.year})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Harvest Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" value={form.harvestDate} onChange={e => setForm((f: any) => ({ ...f, harvestDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Machinery Used</Label>
                <Select value={form.equipmentId} onValueChange={v => setForm((f: any) => ({ ...f, equipmentId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select machinery..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None / not recorded</SelectItem>
                    {equipment.map((eq: any) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        {eq.name} {eq.registrationNumber ? `(${eq.registrationNumber})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Operator Name</Label>
                <Input placeholder="e.g. John Smith" value={form.operatorName} onChange={e => setForm((f: any) => ({ ...f, operatorName: e.target.value }))} />
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
                    {QUALITY_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMut.mutate(form)}
              disabled={!form.fieldCropAssignmentId || !form.harvestDate || createMut.isPending}
            >
              Save Harvest Record
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
              <Select value={form.harvestRecordId} onValueChange={v => setForm((f: any) => ({ ...f, harvestRecordId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select harvest to link..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not linked to a specific harvest</SelectItem>
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
              <Input placeholder="e.g. Grain Store A, Barn 2, On-farm Bin 3" value={form.storageFacility} onChange={e => setForm((f: any) => ({ ...f, storageFacility: e.target.value }))} />
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

function PrintTab({ harvests, transports, storages }: any) {
  const printRef = useRef<HTMLDivElement>(null);
  const farmName = "Farm";

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Harvest Records — Red Tractor Audit</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 2cm; }
        h1 { font-size: 16px; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 4px; }
        h2 { font-size: 13px; margin-top: 20px; margin-bottom: 6px; color: #166534; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f3f4f6; padding: 5px 8px; text-align: left; font-size: 11px; border: 1px solid #d1d5db; }
        td { padding: 4px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 30px; font-size: 10px; color: #9ca3af; }
        @media print { .no-print { display: none; } }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Button size="sm" onClick={handlePrint}>
          <Printer size={14} className="mr-1" />Print / Export PDF
        </Button>
      </div>

      <div ref={printRef} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "2rem" }}>
        <h1 style={{ fontSize: "1.125rem", fontWeight: 700, borderBottom: "2px solid #333", paddingBottom: 8, marginBottom: 4 }}>
          Harvest Records — Red Tractor Compliance Report
        </h1>
        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "1.5rem" }}>
          Printed: {today} &nbsp;|&nbsp; BDE Farm Trac
        </p>

        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#166534", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8, marginTop: 20 }}>
          Harvest Log ({harvests.length} records)
        </h2>
        {harvests.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: 16 }}>No harvests recorded.</p>
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
                  <td style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>{r.qualityGrade || "—"}</td>
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

function GradeBadge({ grade }: { grade: string }) {
  const color = grade.includes("Premium") ? "#166534" : grade.includes("Standard") ? "#1d4ed8" : grade.includes("Feed") ? "#92400e" : grade.includes("Rejected") ? "#991b1b" : "#6b7280";
  const bg = grade.includes("Premium") ? "#dcfce7" : grade.includes("Standard") ? "#dbeafe" : grade.includes("Feed") ? "#fef3c7" : grade.includes("Rejected") ? "#fee2e2" : "#f3f4f6";
  return (
    <Badge style={{ background: bg, color, border: "none", fontSize: "0.72rem" }}>
      {grade.replace(" (Premium)", "").replace(" (Standard)", "").replace(" (Feed)", "")}
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
