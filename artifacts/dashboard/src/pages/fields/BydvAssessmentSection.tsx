import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink, Pencil, Plus, ShieldCheck, Trash2, Wheat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import type { FieldCropAssignment, FieldRecord } from "./shared";

const AHDB_BYDV_URL = "https://bydvtool.ahdb.org.uk/";

type BydvAssessment = {
  id: number;
  farmId: number;
  fieldId: number;
  fieldName: string;
  fieldReference: string | null;
  assessmentDate: string;
  assessmentMode: "spray_decision" | "sow_decision";
  cropType: "winter_wheat" | "winter_barley";
  variety: string | null;
  sowDate: string;
  emergenceDate: string | null;
  surroundedByArable: boolean;
  insecticideProgramme: string | null;
  resultStatus: "high_risk" | "moderate_risk" | "lower_risk" | "action_window" | "other";
  resultNotes: string | null;
  internalDecision: "monitor_crop" | "review_spray_programme" | "review_sowing_timing" | "seek_agronomist_advice" | "no_change" | "other";
  assessorName: string | null;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
};

type BydvForm = {
  fieldId: string;
  assessmentDate: string;
  assessmentMode: BydvAssessment["assessmentMode"];
  cropType: BydvAssessment["cropType"];
  variety: string;
  sowDate: string;
  emergenceDate: string;
  surroundedByArable: boolean;
  insecticideProgramme: string;
  resultStatus: BydvAssessment["resultStatus"];
  resultNotes: string;
  internalDecision: BydvAssessment["internalDecision"];
  assessorName: string;
};

const RESULT_LABELS: Record<BydvAssessment["resultStatus"], string> = {
  high_risk: "High-risk period shown",
  moderate_risk: "Moderate risk shown",
  lower_risk: "Lower risk shown",
  action_window: "Action / monitoring window shown",
  other: "Other result",
};

const DECISION_LABELS: Record<BydvAssessment["internalDecision"], string> = {
  monitor_crop: "Monitor the crop",
  review_spray_programme: "Review the spray programme",
  review_sowing_timing: "Review sowing timing",
  seek_agronomist_advice: "Seek agronomist advice",
  no_change: "No change recorded",
  other: "Other decision",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): BydvForm {
  return {
    fieldId: "",
    assessmentDate: today(),
    assessmentMode: "spray_decision",
    cropType: "winter_wheat",
    variety: "",
    sowDate: "",
    emergenceDate: "",
    surroundedByArable: false,
    insecticideProgramme: "",
    resultStatus: "lower_risk",
    resultNotes: "",
    internalDecision: "monitor_crop",
    assessorName: "",
  };
}

async function checkedJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

function cropLabel(cropType: BydvAssessment["cropType"]): string {
  return cropType === "winter_barley" ? "Winter barley" : "Winter wheat";
}

function modeLabel(mode: BydvAssessment["assessmentMode"]): string {
  return mode === "sow_decision" ? "Sowing decision" : "Spray decision";
}

export function BydvAssessmentSection({
  farmId,
  fields,
  assignments,
}: {
  farmId: number;
  fields: FieldRecord[];
  assignments: FieldCropAssignment[];
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BydvAssessment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BydvAssessment | null>(null);
  const [form, setForm] = useState<BydvForm>(emptyForm);

  const queryKey = ["bydv-assessments", farmId] as const;
  const assessmentsQ = useQuery<{ records: BydvAssessment[] }>({
    queryKey,
    queryFn: () => fetch(`/api/farms/${farmId}/bydv-assessments`).then(response => checkedJson<{ records: BydvAssessment[] }>(response)),
    enabled: !!farmId,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ recordId, data }: { recordId?: number; data: BydvForm }) => {
      const response = await fetch(`/api/farms/${farmId}/bydv-assessments${recordId ? `/${recordId}` : ""}`, {
        method: recordId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, fieldId: Number(data.fieldId) }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm());
      toast({ title: "BYDV assessment recorded" });
    },
    onError: () => toast({ title: "Could not save BYDV assessment", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/farms/${farmId}/bydv-assessments/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setPendingDelete(null);
      toast({ title: "BYDV assessment deleted" });
    },
    onError: () => toast({ title: "Could not delete BYDV assessment", variant: "destructive" }),
  });

  const activeFields = useMemo(
    () => fields.filter(field => field.isActive !== false).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [fields],
  );

  const cerealAssignmentByField = useMemo(() => {
    const map = new Map<number, FieldCropAssignment>();
    const sorted = [...assignments].sort((a, b) => (b.plantingDate ?? "").localeCompare(a.plantingDate ?? ""));
    for (const assignment of sorted) {
      const crop = assignment.cropName.toLowerCase();
      if (!map.has(assignment.fieldId) && (crop.includes("wheat") || crop.includes("barley"))) {
        map.set(assignment.fieldId, assignment);
      }
    }
    return map;
  }, [assignments]);

  function selectField(fieldId: string) {
    const assignment = cerealAssignmentByField.get(Number(fieldId));
    setForm(current => ({
      ...current,
      fieldId,
      cropType: assignment?.cropName.toLowerCase().includes("barley") ? "winter_barley" : current.cropType,
      variety: assignment?.variety ?? current.variety,
      sowDate: assignment?.plantingDate?.slice(0, 10) ?? current.sowDate,
    }));
  }

  function openNew() {
    saveMutation.reset();
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(record: BydvAssessment) {
    saveMutation.reset();
    setEditing(record);
    setForm({
      fieldId: String(record.fieldId),
      assessmentDate: record.assessmentDate,
      assessmentMode: record.assessmentMode,
      cropType: record.cropType,
      variety: record.variety ?? "",
      sowDate: record.sowDate,
      emergenceDate: record.emergenceDate ?? "",
      surroundedByArable: record.surroundedByArable,
      insecticideProgramme: record.insecticideProgramme ?? "",
      resultStatus: record.resultStatus,
      resultNotes: record.resultNotes ?? "",
      internalDecision: record.internalDecision,
      assessorName: record.assessorName ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    saveMutation.reset();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.fieldId || !form.assessmentDate || !form.sowDate) {
      toast({ title: "Select a field and enter the assessment and sowing dates", variant: "destructive" });
      return;
    }
    saveMutation.mutate({ recordId: editing?.id, data: form });
  }

  const records = assessmentsQ.data?.records ?? [];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-amber-200 bg-gradient-to-r from-amber-50 to-white">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AHDB BYDV decision support</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Run the assessment in AHDB&apos;s hosted tool, then record its outcome and your farm decision here. BDE does not calculate BYDV risk or recommend pesticide use.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" asChild className="gap-2 bg-white">
              <a href={AHDB_BYDV_URL} target="_blank" rel="noreferrer">
                Open AHDB tool <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" /> Record assessment
            </Button>
          </div>
        </div>
      </Card>

      {showForm && (
        <Card className="border-primary/20">
          <form onSubmit={submit} className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{editing ? "Edit BYDV assessment" : "Record AHDB BYDV assessment"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Record what AHDB showed and the decision made on the farm.</p>
              </div>
              <button type="button" onClick={closeForm} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close form">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="bydv-field">Field *</Label>
                <select id="bydv-field" required value={form.fieldId} onChange={event => selectField(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                  <option value="">Select field</option>
                  {activeFields.map(field => <option key={field.id} value={field.id}>{field.name}{field.fieldReference ? ` (${field.fieldReference})` : ""}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="bydv-mode">AHDB assessment mode *</Label>
                <select id="bydv-mode" value={form.assessmentMode} onChange={event => setForm({ ...form, assessmentMode: event.target.value as BydvForm["assessmentMode"] })} className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                  <option value="spray_decision">Spray decision</option>
                  <option value="sow_decision">Sowing decision</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bydv-assessment-date">Assessment date *</Label>
                <Input id="bydv-assessment-date" type="date" required className="mt-1.5" value={form.assessmentDate} onChange={event => setForm({ ...form, assessmentDate: event.target.value })} />
              </div>
              <div>
                <Label htmlFor="bydv-crop">Crop *</Label>
                <select id="bydv-crop" value={form.cropType} onChange={event => setForm({ ...form, cropType: event.target.value as BydvForm["cropType"] })} className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                  <option value="winter_wheat">Winter wheat</option>
                  <option value="winter_barley">Winter barley</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bydv-variety">Variety</Label>
                <Input id="bydv-variety" className="mt-1.5" value={form.variety} onChange={event => setForm({ ...form, variety: event.target.value })} placeholder="From crop assignment where available" />
              </div>
              <div>
                <Label htmlFor="bydv-surroundings">Field surroundings *</Label>
                <select id="bydv-surroundings" value={form.surroundedByArable ? "yes" : "no"} onChange={event => setForm({ ...form, surroundedByArable: event.target.value === "yes" })} className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                  <option value="no">Not exclusively surrounded by arable</option>
                  <option value="yes">Exclusively surrounded by arable</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bydv-sow-date">Sowing date *</Label>
                <Input id="bydv-sow-date" type="date" required className="mt-1.5" value={form.sowDate} onChange={event => setForm({ ...form, sowDate: event.target.value })} />
              </div>
              <div>
                <Label htmlFor="bydv-emergence-date">Emergence date</Label>
                <Input id="bydv-emergence-date" type="date" className="mt-1.5" value={form.emergenceDate} onChange={event => setForm({ ...form, emergenceDate: event.target.value })} />
              </div>
              <div>
                <Label htmlFor="bydv-assessor">Recorded by</Label>
                <Input id="bydv-assessor" className="mt-1.5" value={form.assessorName} onChange={event => setForm({ ...form, assessorName: event.target.value })} placeholder="Name" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="bydv-programme">Insecticide programme entered in AHDB</Label>
                <Textarea id="bydv-programme" className="mt-1.5 min-h-24" value={form.insecticideProgramme} onChange={event => setForm({ ...form, insecticideProgramme: event.target.value })} placeholder="Products and dates already entered into the AHDB assessment, if any" />
              </div>
              <div>
                <Label htmlFor="bydv-result-notes">AHDB result details</Label>
                <Textarea id="bydv-result-notes" className="mt-1.5 min-h-24" value={form.resultNotes} onChange={event => setForm({ ...form, resultNotes: event.target.value })} placeholder="Record the wording, timing window, assumptions or other details shown by AHDB" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="bydv-result">Recorded AHDB result *</Label>
                <select id="bydv-result" value={form.resultStatus} onChange={event => setForm({ ...form, resultStatus: event.target.value as BydvForm["resultStatus"] })} className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                  {Object.entries(RESULT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="bydv-decision">Farm decision *</Label>
                <select id="bydv-decision" value={form.internalDecision} onChange={event => setForm({ ...form, internalDecision: event.target.value as BydvForm["internalDecision"] })} className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                  {Object.entries(DECISION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>This is an internal decision-support record. Always use the AHDB tool alongside local knowledge, product labels and appropriate agronomic advice.</p>
            </div>

            <DialogMutationError mutation={saveMutation} message="The BYDV assessment was not saved — your entries are still here." />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving…" : editing ? "Save changes" : "Record assessment"}</Button>
            </div>
          </form>
        </Card>
      )}

      {assessmentsQ.isLoading ? (
        <Card><div className="p-8 text-center text-sm text-muted-foreground">Loading BYDV assessments…</div></Card>
      ) : assessmentsQ.isError ? (
        <Card className="border-red-200"><div className="flex items-center gap-2 p-5 text-sm text-red-700"><AlertTriangle className="h-4 w-4" />Could not load BYDV assessments.</div></Card>
      ) : records.length === 0 ? (
        <Card className="border-dashed">
          <div className="p-10 text-center">
            <Wheat className="mx-auto h-8 w-8 text-amber-600" />
            <h3 className="mt-3 font-medium">No BYDV assessments recorded</h3>
            <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">Open AHDB&apos;s tool for a susceptible winter wheat or winter barley crop, then return here to preserve the result and farm decision.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {records.map(record => (
            <Card key={record.id}>
              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{record.fieldName}</h3>
                    {record.fieldReference && <span className="text-xs text-muted-foreground">{record.fieldReference}</span>}
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{RESULT_LABELS[record.resultStatus]}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/75">
                    {cropLabel(record.cropType)}{record.variety ? ` · ${record.variety}` : ""} · {modeLabel(record.assessmentMode)} · Assessed {new Date(`${record.assessmentDate}T00:00:00`).toLocaleDateString("en-GB")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Farm decision: {DECISION_LABELS[record.internalDecision]}{record.assessorName ? ` · ${record.assessorName}` : ""}</p>
                  {record.resultNotes && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{record.resultNotes}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <a href={record.sourceUrl || AHDB_BYDV_URL} target="_blank" rel="noreferrer">AHDB tool <ExternalLink className="h-3.5 w-3.5" /></a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(record)} className="gap-1.5"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => setPendingDelete(record)} className="gap-1.5 text-red-700 hover:text-red-800"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete BYDV assessment"
        message={`Delete the BYDV assessment${pendingDelete?.fieldName ? ` for ${pendingDelete.fieldName}` : ""}?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteMutation}
        onConfirm={() => { if (pendingDelete) deleteMutation.mutate(pendingDelete.id); }}
        onCancel={() => { setPendingDelete(null); deleteMutation.reset(); }}
      />
    </div>
  );
}