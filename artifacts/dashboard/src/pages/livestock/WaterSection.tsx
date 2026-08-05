import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";

const WATER_SOURCE_LABELS: Record<string, string> = {
  mains: "Mains Supply", borehole: "Borehole / Well", stream: "Stream / River",
  reservoir: "Farm Reservoir / Pond", rainwater: "Rainwater Harvesting",
  bowser: "Water Bowser / Tanker", other: "Other",
};

const EMPTY_WATER = {
  waterSource: "", sourceDescription: "", testDate: new Date().toISOString().slice(0, 10),
  testResult: "", testPass: "true", notes: "",
};

interface WaterAttachment {
  id: number;
  title: string;
  referenceNumber: string | null;
  filePath: string | null;
  mimeType: string | null;
  notes: string | null;
  createdAt: string;
}

function WaterCertificatesDialog({
  farmId,
  record,
  onClose,
}: {
  farmId: number;
  record: WaterRecord;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [labRef, setLabRef] = useState("");
  const [certTitle, setCertTitle] = useState("");

  const qKey = ["water-attachments", record.id];
  const { data, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ attachments: WaterAttachment[] }>;
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (docId: number) => {
      await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments/${docId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const title = certTitle.trim() || (labRef.trim() ? `Lab Certificate — ${labRef.trim()}` : "Lab Certificate");
      await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          filePath: response.objectPath,
          referenceNumber: labRef.trim() || null,
          notes: null,
        }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      qc.invalidateQueries({ queryKey: qKey });
      setLabRef("");
      setCertTitle("");
    },
  });

  const attachments = data?.attachments ?? [];
  const sourceLabel = WATER_SOURCE_LABELS[record.waterSource] ?? record.waterSource;
  const testDateStr = record.testDate ? new Date(record.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <Dialog open onOpenChange={(o) => { if (!o) { onClose(); deleteMut.reset(); } }}>
      <DialogContent style={{ maxWidth: "42rem" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-blue-600" />
            Lab Certificates
          </DialogTitle>
          <DialogDescription>
            {sourceLabel} · {testDateStr}
            {record.testResult ? ` · ${record.testResult}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {/* Attached certificates */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attached Certificates</p>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : attachments.length === 0 ? (
              <div className="text-sm text-muted-foreground italic py-2 border border-dashed rounded-lg px-3">
                No certificates attached yet. Upload the lab report below to link it to this test record.
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-start justify-between bg-muted/40 rounded-lg px-3 py-2.5 gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <a
                          href={att.filePath ? `/api/storage${att.filePath}` : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-700 hover:underline block truncate"
                        >
                          {att.title}
                        </a>
                        {att.referenceNumber && (
                          <p className="text-xs text-muted-foreground">Ref: {att.referenceNumber}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(att.createdAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-red-50 h-7 px-2"
                      onClick={() => deleteMut.mutate(att.id)}
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload form */}
          <div className="border border-dashed rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attach Lab Certificate</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <Label className="text-xs">Lab Reference Number</Label>
                <Input
                  placeholder="e.g. WA-2026-00291"
                  value={labRef}
                  onChange={(e) => setLabRef(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Certificate Title</Label>
                <Input
                  placeholder="e.g. Annual water test — Borehole"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                  e.target.value = "";
                }}
                disabled={isUploading}
              />
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" disabled={isUploading} asChild>
                <span>
                  {isUploading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading {progress}%</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" /> Choose File</>
                  )}
                </span>
              </Button>
              <span className="text-xs text-muted-foreground">PDF, JPG, PNG accepted</span>
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Uploaded certificates are stored securely and linked to this specific water quality test record. They will appear in audit exports.
          </p>
        </div>

        <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WaterSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/water-records`;
  const { data, isLoading } = useQuery<{ records: WaterRecord[] }>({
    queryKey: ["water-records", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const [search, setSearch] = useState("");
  const [yearFilterWater, setYearFilterWater] = usePersistedFilter({ page: "livestock-water", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsWater = useMemo(() => Array.from(new Set(records.map(r => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WaterRecord | null>(null);
  const [form, setForm] = useState(EMPTY_WATER);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [certRecord, setCertRecord] = useState<WaterRecord | null>(null);
  const [waterLabId, setWaterLabId] = useState<number | null>(null);
  const [waterLabName, setWaterLabName] = useState<string | null>(null);
  const [mode, setMode] = useState<"log" | "result" | "edit">("log");

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_WATER & { labSupplierId?: number | null }) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, testPass: body.testPass === "true" }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setShowForm(false); setForm(EMPTY_WATER); setWaterLabId(null); setWaterLabName(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_WATER & { id: number; labSupplierId?: number | null }) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, testPass: body.testPass === "true" }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_WATER); setWaterLabId(null); setWaterLabName(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water-records", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(r: WaterRecord) {
    setEditing(r);
    setForm({
      waterSource: r.waterSource, sourceDescription: r.sourceDescription ?? "",
      testDate: r.testDate?.slice(0, 10) ?? "",
      testResult: r.testResult ?? "", testPass: r.testPass === false ? "false" : "true", notes: r.notes ?? "",
    });
    setWaterLabId(r.labSupplierId ?? null);
    setWaterLabName(null);
    setMode("edit");
    setShowForm(true);
  }

  function openEnterResult(r: WaterRecord) {
    setEditing(r);
    setForm({
      waterSource: r.waterSource, sourceDescription: r.sourceDescription ?? "",
      testDate: r.testDate?.slice(0, 10) ?? "",
      testResult: r.testResult ?? "", testPass: r.testPass === false ? "false" : "true", notes: r.notes ?? "",
    });
    setWaterLabId(r.labSupplierId ?? null);
    setWaterLabName(null);
    setMode("result");
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, labSupplierId: waterLabId ?? undefined };
    if (editing) updateMut.mutate({ ...payload, id: editing.id });
    else createMut.mutate(payload);
  }

  const filtered = records.filter(r =>
    ((WATER_SOURCE_LABELS[r.waterSource] ?? r.waterSource).toLowerCase().includes(search.toLowerCase()) ||
    (r.testResult ?? "").toLowerCase().includes(search.toLowerCase())) &&
    (yearFilterWater === "all" || String(r.testDate ?? "").startsWith(yearFilterWater))
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by source or result…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterWater} onValueChange={setYearFilterWater}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsWater.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setForm(EMPTY_WATER); setMode("log"); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Log Sample
          </Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
        <Paperclip className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          <strong>Annual testing required</strong> for pigs and poultry, and for all species where the water source is not mains supply.
          Use the <strong>Lab Certs</strong> button on each record to attach your lab certificate — certificates are stored against the specific test and included in audit exports.
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Droplets className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? "No matching records." : "No water quality records yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Test Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Water Source</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location / Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Result</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{formatDate(r.testDate)}</td>
                  <td className="px-4 py-3 font-medium">{WATER_SOURCE_LABELS[r.waterSource] ?? r.waterSource}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{r.sourceDescription || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.testResult || "—"}</td>
                  <td className="px-4 py-3">
                    {!r.testResult ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Awaiting results</span>
                    ) : r.testPass === null ? <span className="text-muted-foreground text-xs">—</span>
                      : r.testPass
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" /> Pass</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3" /> Fail</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{r.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {!r.testResult && (
                        <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => openEnterResult(r)}>
                          Enter results
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                        onClick={() => setCertRecord(r)}
                        title="Attach or view lab certificates"
                      >
                        <Paperclip className="h-3 w-3" /> Lab Certs
                      </Button>
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
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); createMut.reset(); updateMut.reset(); } }}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader>
              <DialogTitle>
                {mode === "log" ? "Log Water Quality Sample" : mode === "result" ? "Enter Water Test Results" : "Edit Water Record"}
              </DialogTitle>
              <DialogDescription>
                {mode === "log"
                  ? "Record the sampling event now. Return to enter laboratory results once the report arrives."
                  : mode === "result" && editing
                  ? `Sample from ${formatDate(editing.testDate ?? "")}. Enter results from your lab report.`
                  : "Log water source and annual test results for Red Tractor compliance."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {mode !== "result" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div><Label>Water Source *</Label>
                    <Select value={form.waterSource || undefined} onValueChange={v => setField("waterSource", v)}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(WATER_SOURCE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Test Date</Label><Input type="date" value={form.testDate} onChange={e => setField("testDate", e.target.value)} /></div>
                </div>
              )}
              {mode !== "result" && (
                <div>
                  <Label>Source Location / Description</Label>
                  <Input value={form.sourceDescription} onChange={e => setField("sourceDescription", e.target.value)}
                    placeholder={
                      form.waterSource === "borehole" ? "Name, depth (m), grid reference" :
                      form.waterSource === "stream" ? "River / stream name and location" :
                      form.waterSource === "reservoir" ? "Reservoir name and location" :
                      form.waterSource === "bowser" ? "Vehicle registration and supplier" :
                      form.waterSource === "mains" ? "Meter/supply point reference (optional)" :
                      "Specific location or description of this source"
                    }
                  />
                </div>
              )}
              {mode !== "result" && (
                <div>
                  <Label>Testing Laboratory</Label>
                  <LabSelector farmId={farmId} value={waterLabId ?? undefined} labName={waterLabName ?? undefined}
                    onChange={(id, name) => { setWaterLabId(id ?? null); setWaterLabName(name ?? null); }} />
                </div>
              )}
              {mode !== "log" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div><Label>Test Result / Lab Reference</Label><Input value={form.testResult} onChange={e => setField("testResult", e.target.value)} placeholder="e.g. Pass — E. coli &lt;1 CFU/100ml" /></div>
                  <div><Label>Overall Outcome</Label>
                    <Select value={form.testPass} onValueChange={v => setField("testPass", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Pass — Suitable for livestock</SelectItem>
                        <SelectItem value="false">Fail — Action required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Lab reference, remedial actions, retest date, etc." rows={2} /></div>
              <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
              <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Water Record?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
            <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {certRecord && (
        <WaterCertificatesDialog
          farmId={farmId}
          record={certRecord}
          onClose={() => setCertRecord(null)}
        />
      )}
    </>
  );
}

