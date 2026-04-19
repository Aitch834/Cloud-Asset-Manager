import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@workspace/object-storage-web";
import {
  CheckCircle2, AlertCircle, Plus, Trash2, Search, ClipboardCheck,
  Truck, FileCheck2, ShieldCheck, FileText as FileTextIcon, PenLine
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChecklistMovement {
  id: number;
  movementType: string;
  movementDate: string;
  species: string | null;
  numberOfAnimals: number | null;
  fromLocation: string | null;
  toLocation: string | null;
  licenceNumber: string | null;
  // Haulier
  haulageRecordId: number | null;
  vehicleRegistration: string | null;
  driverName: string | null;
  haulierCompany: string | null;
  operatorLicenceNo: string | null;
  // FCI / VD
  fciCompleted: boolean | null;
  fciWithdrawalsClear: boolean | null;
  fciCompletedBy: string | null;
  // Welfare & compliance
  allAnimalsTagged: boolean | null;
  vehicleClean: boolean | null;
  atcRequired: boolean | null;
  atcNumber: string | null;
  journeyTimeHours: string | null;
  driverCompetencyCertNo: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  welfareCheckComplete: boolean | null;
  // Document
  movementDocumentUrl: string | null;
  // Sign-off
  checklistCompletedBy: string | null;
  checklistCompletedAt: string | null;
}

interface MovementAnimal {
  id: number;
  animalId: number | null;
  tagNumber: string | null;
  eidNumber: string | null;
  species: string | null;
  breed: string | null;
  sex: string | null;
  animalCode: string | null;
  animalName: string | null;
  notes: string | null;
}

interface RegisteredAnimal {
  id: number;
  animalCode: string;
  name: string | null;
  tagNumber: string | null;
  eidNumber: string | null;
  species: string | null;
  breed: string | null;
  sex: string | null;
  dateOfBirth: string | null;
  status: string | null;
}

interface Props {
  farmId: number;
  movementId: number;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Bool({ val }: { val: boolean | null | undefined }) {
  if (val === null || val === undefined) return <span style={{ color: "#9ca3af" }}>Not set</span>;
  return val
    ? <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Yes</span>
    : <span style={{ color: "#dc2626", fontWeight: 600 }}>✗ No</span>;
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean | null | undefined; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
        border: `1px solid ${checked ? "#bbf7d0" : "#e5e7eb"}`,
        borderRadius: 8, cursor: "pointer",
        background: checked ? "#f0fdf4" : "#fff",
        transition: "all 0.15s",
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
        border: `2px solid ${checked ? "#16a34a" : "#d1d5db"}`,
        background: checked ? "#16a34a" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <CheckCircle2 size={12} color="#fff" />}
      </div>
      <span style={{ fontSize: "0.875rem", color: checked ? "#166534" : "#374151" }}>{label}</span>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, colour = "#1a6b3a" }: { icon: React.ElementType; label: string; colour?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "2px solid #f0fdf4", marginBottom: 12 }}>
      <Icon size={16} color={colour} />
      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: colour, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LivestockDispatchChecklist({ farmId, movementId, onClose }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { upload, uploading } = useUpload();

  // ── Fetch checklist data ────────────────────────────────────────────────────
  const { data: movData, isLoading: movLoading } = useQuery({
    queryKey: ["movement-detail", farmId, movementId],
    queryFn: () => fetch(`/api/farms/${farmId}/movements/${movementId}`).then(r => r.json()),
  });
  const movement: ChecklistMovement | null = movData?.record ?? null;

  const { data: animalsData, isLoading: animalsLoading } = useQuery({
    queryKey: ["movement-animals", farmId, movementId],
    queryFn: () => fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/animals`).then(r => r.json()),
  });
  const movementAnimals: MovementAnimal[] = animalsData?.animals ?? [];

  const isCattle = movement?.species?.toLowerCase().includes("cattle") ?? false;

  // Only fetch registered animals when it's cattle
  const { data: registeredData } = useQuery({
    queryKey: ["animals-register", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then(r => r.json()),
    enabled: isCattle,
  });
  const registeredAnimals: RegisteredAnimal[] = registeredData?.records ?? [];

  // ── Local form state ────────────────────────────────────────────────────────
  const [form, setForm] = useState<Partial<ChecklistMovement>>({});
  const [animalSearch, setAnimalSearch] = useState("");
  const [newTagNumber, setNewTagNumber] = useState("");
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [signedOffBy, setSignedOffBy] = useState("");

  // Merge server data into form on first load
  React.useEffect(() => {
    if (movement && Object.keys(form).length === 0) {
      setForm({
        vehicleRegistration: movement.vehicleRegistration,
        driverName: movement.driverName,
        haulierCompany: movement.haulierCompany,
        operatorLicenceNo: movement.operatorLicenceNo,
        fciCompleted: movement.fciCompleted,
        fciWithdrawalsClear: movement.fciWithdrawalsClear,
        fciCompletedBy: movement.fciCompletedBy,
        allAnimalsTagged: movement.allAnimalsTagged,
        vehicleClean: movement.vehicleClean,
        atcRequired: movement.atcRequired,
        atcNumber: movement.atcNumber,
        journeyTimeHours: movement.journeyTimeHours,
        driverCompetencyCertNo: movement.driverCompetencyCertNo,
        emergencyContactName: movement.emergencyContactName,
        emergencyContactPhone: movement.emergencyContactPhone,
        welfareCheckComplete: movement.welfareCheckComplete,
        movementDocumentUrl: movement.movementDocumentUrl,
      });
      if (movement.checklistCompletedBy) setSignedOffBy(movement.checklistCompletedBy);
    }
  }, [movement]);

  const set = (key: keyof typeof form, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  // ── Mutations ───────────────────────────────────────────────────────────────
  const saveChecklist = async (signOff = false) => {
    setSavingChecklist(true);
    try {
      const body = { ...form, ...(signOff ? { checklistCompletedBy: signedOffBy } : {}) };
      await fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      qc.invalidateQueries({ queryKey: ["movements", farmId] });
      qc.invalidateQueries({ queryKey: ["movement-detail", farmId, movementId] });
      toast({ title: signOff ? "Checklist signed off" : "Checklist saved" });
      if (signOff) onClose();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSavingChecklist(false);
    }
  };

  const addAnimalFromRegister = useMutation({
    mutationFn: (animal: RegisteredAnimal) =>
      fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/animals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{
          animalId: animal.id,
          tagNumber: animal.tagNumber,
          eidNumber: animal.eidNumber,
          species: animal.species,
          breed: animal.breed,
          sex: animal.sex,
          dateOfBirth: animal.dateOfBirth,
        }]),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["movement-animals", farmId, movementId] }),
  });

  const addAnimalManual = useMutation({
    mutationFn: () =>
      fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/animals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ tagNumber: newTagNumber, species: movement?.species }]),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["movement-animals", farmId, movementId] }); setNewTagNumber(""); },
  });

  const removeAnimal = useMutation({
    mutationFn: (rowId: number) =>
      fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/animals/${rowId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["movement-animals", farmId, movementId] }),
  });

  const handleDocUpload = async (file: File) => {
    const result = await upload(file, "livestock-movement-docs");
    if (result?.path) {
      set("movementDocumentUrl", result.path);
      await fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movementDocumentUrl: result.path }),
      });
      qc.invalidateQueries({ queryKey: ["movement-detail", farmId, movementId] });
      toast({ title: "Document uploaded" });
    }
  };

  // ── Derive completion score ─────────────────────────────────────────────────
  const completionItems = [
    !!form.vehicleRegistration,
    !!form.driverName,
    form.fciCompleted === true,
    form.fciWithdrawalsClear === true,
    form.allAnimalsTagged === true,
    form.vehicleClean === true,
    form.welfareCheckComplete === true,
    !!form.movementDocumentUrl,
    !isCattle || movementAnimals.length > 0,
  ];
  const completionPct = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);
  const isComplete = movement?.checklistCompletedAt != null;

  const filteredAnimals = registeredAnimals
    .filter(a => {
      const addedIds = new Set(movementAnimals.map(m => m.animalId).filter(Boolean));
      return !addedIds.has(a.id);
    })
    .filter(a => {
      if (!animalSearch) return true;
      const s = animalSearch.toLowerCase();
      return (a.animalCode || "").toLowerCase().includes(s)
        || (a.tagNumber || "").toLowerCase().includes(s)
        || (a.name || "").toLowerCase().includes(s);
    });

  if (movLoading) return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 680 }}>
        <DialogHeader><DialogTitle>Dispatch Checklist</DialogTitle></DialogHeader>
        <div style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}>
        <DialogHeader>
          <DialogTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClipboardCheck size={18} color="#1a6b3a" />
            Livestock Dispatch Checklist
            {isComplete && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", borderRadius: 12, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 600, marginLeft: 8 }}>
                <CheckCircle2 size={12} /> Signed Off
              </span>
            )}
          </DialogTitle>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>
            {movement?.species || "Livestock"} · {movement?.numberOfAnimals ?? "?"} animals · {movement?.fromLocation || "this holding"} → {movement?.toLocation || "?"}
          </p>
        </DialogHeader>

        {/* Progress bar */}
        <div style={{ background: "#f3f4f6", borderRadius: 8, overflow: "hidden", height: 8, marginBottom: 4 }}>
          <div style={{ height: "100%", width: `${completionPct}%`, background: completionPct === 100 ? "#16a34a" : "#f59e0b", transition: "width 0.3s" }} />
        </div>
        <p style={{ fontSize: "0.75rem", color: completionPct === 100 ? "#166534" : "#92400e", marginBottom: 16 }}>
          {completionPct}% complete {completionPct === 100 ? "— ready to sign off" : "— complete all items before signing off"}
        </p>

        <div className="space-y-5">

          {/* ── Section 1: Haulier & Vehicle ───────────────────────────────── */}
          <section>
            <SectionHeader icon={Truck} label="1 · Haulier & Vehicle" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-foreground/60 mb-1 block">Vehicle Registration <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input
                  placeholder="e.g. YD23 XKP"
                  value={form.vehicleRegistration ?? ""}
                  onChange={e => set("vehicleRegistration", e.target.value)}
                  style={{ textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.05em" }}
                />
              </div>
              <div>
                <Label className="text-xs text-foreground/60 mb-1 block">Driver Name <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="Full name" value={form.driverName ?? ""} onChange={e => set("driverName", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-foreground/60 mb-1 block">Haulier Company</Label>
                <Input placeholder="Company name" value={form.haulierCompany ?? ""} onChange={e => set("haulierCompany", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-foreground/60 mb-1 block">Operator Licence No.</Label>
                <Input placeholder="e.g. OB0001234" value={form.operatorLicenceNo ?? ""} onChange={e => set("operatorLicenceNo", e.target.value)} style={{ fontFamily: "monospace" }} />
              </div>
              <div>
                <Label className="text-xs text-foreground/60 mb-1 block">Driver Competency Cert. No.</Label>
                <Input placeholder="Certificate number" value={form.driverCompetencyCertNo ?? ""} onChange={e => set("driverCompetencyCertNo", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-foreground/60 mb-1 block">Estimated Journey Time (hours)</Label>
                <Input type="number" step="0.5" min="0" placeholder="e.g. 2.5" value={form.journeyTimeHours ?? ""} onChange={e => set("journeyTimeHours", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-foreground/60 mb-1 block">Emergency Contact Name</Label>
                <Input placeholder="Name" value={form.emergencyContactName ?? ""} onChange={e => set("emergencyContactName", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-foreground/60 mb-1 block">Emergency Contact Phone</Label>
                <Input type="tel" placeholder="+44..." value={form.emergencyContactPhone ?? ""} onChange={e => set("emergencyContactPhone", e.target.value)} />
              </div>
            </div>
            {/* ATC */}
            <div style={{ marginTop: 10 }}>
              <CheckItem
                label="Animal Transport Certificate (ATC) required for this journey"
                checked={form.atcRequired ?? false}
                onChange={v => set("atcRequired", v)}
              />
              {form.atcRequired && (
                <div style={{ marginTop: 8 }}>
                  <Label className="text-xs text-foreground/60 mb-1 block">ATC Reference Number</Label>
                  <Input placeholder="ATC number" value={form.atcNumber ?? ""} onChange={e => set("atcNumber", e.target.value)} style={{ fontFamily: "monospace" }} />
                </div>
              )}
            </div>
          </section>

          {/* ── Haulage cross-link ────────────────────────────────────────── */}
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
            <Label className="text-xs text-foreground/60 mb-1 block" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Truck size={12} /> Link to Haulage / Transport Record (optional)
            </Label>
            <Input
              type="number"
              placeholder="HR number e.g. 42"
              value={form.haulageRecordId ?? ""}
              onChange={e => set("haulageRecordId", e.target.value ? parseInt(e.target.value) : null)}
              style={{ fontFamily: "monospace", maxWidth: 200 }}
            />
            <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 4 }}>
              If this movement was arranged via the haulage/transport module, enter the HR record number to cross-reference the two records.
            </p>
          </div>

          {/* ── Section 2: FCI / Vendor Declaration ────────────────────────── */}
          <section>
            <SectionHeader icon={FileCheck2} label="2 · Food Chain Information (FCI) / Vendor Declaration" colour="#92400e" />
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 10, marginBottom: 10 }}>
              <p style={{ fontSize: "0.8rem", color: "#78350f" }}>
                <strong>Red Tractor Requirement:</strong> A completed FCI / Vendor Declaration must accompany all movements off the holding.
                Confirm that any withdrawal periods for medicines are clear before signing.
              </p>
            </div>
            <div className="space-y-2">
              <CheckItem
                label="FCI / Vendor Declaration has been completed and signed"
                checked={form.fciCompleted ?? false}
                onChange={v => set("fciCompleted", v)}
              />
              <CheckItem
                label="All medicine withdrawal periods are clear — no animals under withdrawal"
                checked={form.fciWithdrawalsClear ?? false}
                onChange={v => set("fciWithdrawalsClear", v)}
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <Label className="text-xs text-foreground/60 mb-1 block">FCI Completed By</Label>
              <Input placeholder="Name of person completing FCI" value={form.fciCompletedBy ?? ""} onChange={e => set("fciCompletedBy", e.target.value)} />
            </div>
          </section>

          {/* ── Section 3: Animal Welfare Checks ───────────────────────────── */}
          <section>
            <SectionHeader icon={ShieldCheck} label="3 · Animal Welfare & Compliance" colour="#1d4ed8" />
            <div className="space-y-2">
              <CheckItem
                label="All animals are correctly identified / ear-tagged (EID where required)"
                checked={form.allAnimalsTagged ?? false}
                onChange={v => set("allAnimalsTagged", v)}
              />
              <CheckItem
                label="Vehicle is clean, disinfected and fit for purpose (Animal Transport Welfare regs.)"
                checked={form.vehicleClean ?? false}
                onChange={v => set("vehicleClean", v)}
              />
              <CheckItem
                label="Pre-movement welfare check completed — all animals fit to travel"
                checked={form.welfareCheckComplete ?? false}
                onChange={v => set("welfareCheckComplete", v)}
              />
            </div>
          </section>

          {/* ── Section 4: Per-animal list (cattle only) ────────────────────── */}
          {isCattle && (
            <section>
              <SectionHeader icon={ClipboardCheck} label="4 · Individual Animals (BCMS / Cattle Tracing)" colour="#7c3aed" />
              <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                <p style={{ fontSize: "0.8rem", color: "#5b21b6" }}>
                  <strong>BCMS Requirement:</strong> For cattle movements you must record each individual animal. Select from your herd register or enter a tag number manually.
                </p>
              </div>

              {/* Already added */}
              {movementAnimals.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Animals on this movement ({movementAnimals.length})
                  </p>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    {movementAnimals.map((a, i) => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: i < movementAnimals.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>{a.tagNumber || a.animalCode || "—"}</span>
                          {a.animalName && <span style={{ color: "#6b7280", fontSize: "0.8rem", marginLeft: 8 }}>{a.animalName}</span>}
                          {a.breed && <span style={{ color: "#9ca3af", fontSize: "0.75rem", marginLeft: 8 }}>{a.breed}</span>}
                          {a.sex && <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: 8 }}>({a.sex})</span>}
                        </div>
                        <button
                          onClick={() => removeAnimal.mutate(a.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}
                          title="Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add from register */}
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>Add from herd register</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <Input
                      style={{ paddingLeft: 30, fontSize: "0.85rem" }}
                      placeholder="Search by tag, code or name…"
                      value={animalSearch}
                      onChange={e => setAnimalSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                  {filteredAnimals.length === 0 ? (
                    <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                      {animalSearch ? "No animals match your search" : "All registered animals already added, or no cattle registered"}
                    </div>
                  ) : filteredAnimals.slice(0, 50).map((a, i) => (
                    <div
                      key={a.id}
                      onClick={() => addAnimalFromRegister.mutate(a)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", cursor: "pointer", background: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}
                    >
                      <Plus size={13} color="#1a6b3a" />
                      <span style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 600 }}>{a.animalCode}</span>
                      {a.tagNumber && <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>{a.tagNumber}</span>}
                      {a.name && <span style={{ color: "#374151", fontSize: "0.8rem" }}>{a.name}</span>}
                      {a.breed && <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{a.breed}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual tag entry */}
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>Or enter tag number manually</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input
                    placeholder="e.g. UK123456 78901"
                    value={newTagNumber}
                    onChange={e => setNewTagNumber(e.target.value)}
                    style={{ fontFamily: "monospace", flex: 1 }}
                    onKeyDown={e => { if (e.key === "Enter" && newTagNumber.trim()) addAnimalManual.mutate(); }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => { if (newTagNumber.trim()) addAnimalManual.mutate(); }}
                    disabled={!newTagNumber.trim() || addAnimalManual.isPending}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <Plus size={14} /> Add Tag
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* ── Section 5: Movement Document ───────────────────────────────── */}
          <section>
            <SectionHeader icon={FileTextIcon} label={isCattle ? "5 · Movement Document" : "4 · Movement Document"} colour="#374151" />
            {form.movementDocumentUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
                <CheckCircle2 size={15} color="#16a34a" />
                <span style={{ flex: 1, fontSize: "0.875rem", color: "#166534" }}>Movement document uploaded</span>
                <a
                  href={`/api/storage${form.movementDocumentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.8rem", color: "#1a6b3a", textDecoration: "underline" }}
                >
                  View
                </a>
                <button
                  onClick={() => set("movementDocumentUrl", null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }}>
                  Upload the signed AML2 / movement licence or eAML2 reference document.
                </p>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f3f4f6", border: "1px dashed #d1d5db", borderRadius: 8, padding: "10px 16px", cursor: uploading ? "wait" : "pointer", fontSize: "0.875rem", color: "#374151" }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleDocUpload(f); }}
                    disabled={uploading}
                  />
                  {uploading ? "Uploading…" : "Upload movement document (PDF / image)"}
                </label>
              </div>
            )}
          </section>

          {/* ── Section 6: Sign-off ─────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={PenLine} label={isCattle ? "6 · Sign Off" : "5 · Sign Off"} colour="#374151" />
            {isComplete ? (
              <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px" }}>
                <p style={{ fontSize: "0.875rem", color: "#166534", fontWeight: 600 }}>
                  ✓ Checklist signed off by {movement?.checklistCompletedBy}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#16a34a", marginTop: 2 }}>
                  {movement?.checklistCompletedAt ? new Date(movement.checklistCompletedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                </p>
              </div>
            ) : (
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px" }}>
                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: 10 }}>
                  By signing off you confirm all compliance checks have been completed for this dispatch.
                  This record is retained as part of Red Tractor traceability requirements.
                </p>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <Label className="text-xs text-foreground/60 mb-1 block">Your Name</Label>
                    <Input placeholder="Full name of person signing off" value={signedOffBy} onChange={e => setSignedOffBy(e.target.value)} />
                  </div>
                  <Button
                    onClick={() => saveChecklist(true)}
                    disabled={!signedOffBy.trim() || savingChecklist || completionPct < 70}
                    style={{ background: "#1a6b3a", color: "#fff", whiteSpace: "nowrap" }}
                  >
                    <CheckCircle2 size={14} style={{ marginRight: 4 }} />
                    Sign Off Checklist
                  </Button>
                </div>
                {completionPct < 70 && (
                  <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: 6 }}>
                    <AlertCircle size={11} style={{ display: "inline", marginRight: 4 }} />
                    Complete more items before signing off ({completionPct}% done)
                  </p>
                )}
              </div>
            )}
          </section>

        </div>

        <DialogFooter className="mt-4" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => saveChecklist(false)} disabled={savingChecklist}>
            {savingChecklist ? "Saving…" : "Save Progress"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
