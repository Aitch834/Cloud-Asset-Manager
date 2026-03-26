import React, { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FlaskConical, Plus, ChevronLeft, Printer, Trash2, PlusCircle,
  Sprout, TestTube, Eye, Wheat, BarChart3, AlertTriangle, CheckCircle, Loader2,
  MapPin, Map, List, FileText, Navigation,
} from "lucide-react";
import { TrialMapView } from "@/components/crop-trials/TrialMapView";

const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  planned:   { label: "Planned",    bg: "#f9fafb",  color: "#6b7280", border: "#e5e7eb" },
  active:    { label: "Active",     bg: "#eff6ff",  color: "#2563eb", border: "#bfdbfe" },
  harvested: { label: "Harvested",  bg: "#f0fdf4",  color: "#16a34a", border: "#bbf7d0" },
  completed: { label: "Completed",  bg: "#fefce8",  color: "#a16207", border: "#fde047" },
  cancelled: { label: "Cancelled",  bg: "#fef2f2",  color: "#dc2626", border: "#fecaca" },
};

const TRIAL_PURPOSES = [
  "Variety comparison",
  "Input response (fertiliser)",
  "Input response (pesticide)",
  "Cultivation method comparison",
  "Seed rate trial",
  "Plant growth regulator response",
  "Fungicide programme comparison",
  "Cover crop establishment",
  "Irrigation response",
  "Other",
];
const TRIAL_TYPES = ["Replicated randomised", "Unreplicated strip", "Split plot", "Latin square", "Simple comparison", "Other"];
const TREATMENT_TYPES = ["Seed / variety", "Fertiliser", "Herbicide", "Fungicide", "Insecticide", "PGR", "Irrigation", "Cultivation", "Control", "Other"];
const GROWTH_STAGES = ["Pre-emergence", "GS11 (1st leaf)", "GS12-19 (Tillering)", "GS21-29 (Stem extension)", "GS31-39 (Jointing)", "GS41-49 (Flag leaf)", "GS51-59 (Heading)", "GS61-69 (Flowering)", "GS71-77 (Milk)", "GS83-87 (Dough)", "GS91-99 (Harvest)", "Other"];
const CONDITION_OPTIONS = ["Excellent", "Good", "Fair", "Poor"];

const CROP_OPTIONS = [
  "Winter wheat", "Spring wheat",
  "Winter barley", "Spring barley",
  "Winter oats", "Spring oats",
  "Oilseed rape",
  "Field peas", "Field beans", "Spring beans",
  "Sugar beet", "Potatoes",
  "Maize / forage maize",
  "Rye", "Triticale",
  "Linseed",
  "Grass / silage",
  "Cover crop mix",
  "Other",
];

function getSeasonOptions(): string[] {
  const base = currentCropYear();
  const out: string[] = [];
  for (let y = base - 1; y <= base + 4; y++) out.push(cropYearLabel(y));
  return out;
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  planned:   "Trial designed but not yet underway",
  active:    "Plots established, treatments being applied",
  harvested: "Harvest complete, yield data collected",
  completed: "All analysis done and results recorded",
  cancelled: "Trial abandoned or invalidated",
};

const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtNum = (v: string | number | null | undefined, dp = 2) => v != null && v !== "" ? parseFloat(String(v)).toFixed(dp) : "—";

interface Plot { id: number; plotNumber: string; treatmentLabel: string | null; isControl: boolean; areaHa: string | null; locationDescription: string | null; replicationBlock: string | null; latitude: string | null; longitude: string | null; notes: string | null; yields: Yield[]; }
interface Treatment { id: number; plotId: number; treatmentDate: string; treatmentType: string; productName: string | null; applicationRate: string | null; unit: string | null; notes: string | null; }
interface Observation { id: number; plotId: number; observationDate: string; growthStage: string | null; plantCount: number | null; diseasePresent: boolean; diseaseName: string | null; pestPresent: boolean; notes: string | null; }
interface Yield { id: number; plotId: number; harvestDate: string; freshWeightKg: string | null; moisturePercent: string | null; adjustedDryWeightKg: string | null; yieldTha: string | null; }
interface Trial { id: number; trialName: string; season: string | null; cropName: string | null; trialPurpose: string; trialType: string | null; trialsBody: string | null; contactName: string | null; numberOfTreatments: number | null; numberOfReplications: number | null; totalAreaHa: string | null; startDate: string | null; endDate: string | null; status: string; notes: string | null; plots: Plot[]; fieldId: number | null; }

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.planned;
  return <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>;
}

// ── Yield Comparison Table ────────────────────────────────────────────────────
function YieldComparisonTable({ plots }: { plots: Plot[] }) {
  const plotsWithYield = plots.filter(p => p.yields.length > 0);
  if (plotsWithYield.length === 0) return <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "24px 0" }}>No yield data recorded yet. Add harvest results to each plot.</p>;

  const control = plotsWithYield.find(p => p.isControl);
  const controlYield = control?.yields[0]?.yieldTha ? parseFloat(control.yields[0].yieldTha) : null;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
            <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Plot</th>
            <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Treatment</th>
            <th style={{ textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Yield (t/ha)</th>
            <th style={{ textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>vs Control</th>
            <th style={{ textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Moisture %</th>
            <th style={{ textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Fresh Wt (kg)</th>
          </tr>
        </thead>
        <tbody>
          {plotsWithYield.map((p, i) => {
            const y = p.yields[0];
            const yTha = y.yieldTha ? parseFloat(y.yieldTha) : null;
            const diff = controlYield && yTha && !p.isControl ? ((yTha - controlYield) / controlYield) * 100 : null;
            return (
              <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6", background: p.isControl ? "#fefce8" : undefined }}>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                  {p.plotNumber} {p.isControl && <span style={{ fontSize: "0.7rem", background: "#fde047", color: "#92400e", padding: "1px 6px", borderRadius: 8, marginLeft: 4, fontWeight: 700 }}>CTRL</span>}
                </td>
                <td style={{ padding: "10px 14px", color: "#6b7280" }}>{p.treatmentLabel || "—"}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600 }}>
                  {yTha != null ? yTha.toFixed(3) : "—"}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                  {p.isControl ? <span style={{ color: "#9ca3af" }}>—</span> : diff != null ? (
                    <span style={{ fontWeight: 600, color: diff >= 0 ? "#16a34a" : "#dc2626" }}>
                      {diff >= 0 ? "+" : ""}{diff.toFixed(1)}%
                    </span>
                  ) : "—"}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: "#6b7280" }}>{fmtNum(y.moisturePercent, 1)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: "#6b7280" }}>{fmtNum(y.freshWeightKg, 1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Trial Detail View ─────────────────────────────────────────────────────────
function TrialDetailView({ trial, farmId, onBack, fields }: { trial: Trial; farmId: number; onBack: () => void; fields: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [detailTab, setDetailTab] = useState<"plots" | "treatments" | "observations" | "results">("plots");
  const [addPlotOpen, setAddPlotOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [addTreatmentOpen, setAddTreatmentOpen] = useState(false);
  const [addObsOpen, setAddObsOpen] = useState(false);
  const [addYieldOpen, setAddYieldOpen] = useState(false);
  const [deletePlotId, setDeletePlotId] = useState<number | null>(null);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  const updateStatusMut = useMutation({
    mutationFn: (status: string) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    }).then(r => r.json()),
    onSuccess: (_, status) => { toast({ title: `Status updated to ${STATUS_MAP[status]?.label ?? status}` }); invalidate(); setStatusPickerOpen(false); },
  });

  const [plotForm, setPlotForm] = useState({ plotNumber: "", treatmentLabel: "", isControl: false, areaHa: "", locationDescription: "", replicationBlock: "", latitude: "", longitude: "" });
  const [gpsCapturing, setGpsCapturing] = useState(false);
  const [txForm, setTxForm] = useState({ treatmentDate: new Date().toISOString().slice(0, 10), treatmentType: "", productName: "", applicationRate: "", unit: "", notes: "" });
  const [obsForm, setObsForm] = useState({ observationDate: new Date().toISOString().slice(0, 10), growthStage: "", plantCount: "", plantHeightCm: "", diseasePresent: false, diseaseName: "", pestPresent: false, pestName: "", generalCondition: "", notes: "" });
  const [yieldForm, setYieldForm] = useState({ harvestDate: new Date().toISOString().slice(0, 10), freshWeightKg: "", moisturePercent: "", adjustedDryWeightKg: "", yieldTha: "", grainProteinPercent: "", specificWeight: "", notes: "" });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["crop-trials", farmId] });

  const EMPTY_PLOT_FORM = { plotNumber: "", treatmentLabel: "", isControl: false, areaHa: "", locationDescription: "", replicationBlock: "", latitude: "", longitude: "" };
  const addPlotMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Plot added" }); invalidate(); setAddPlotOpen(false); setPlotForm({ ...EMPTY_PLOT_FORM }); },
  });

  async function captureGPS() {
    if (!navigator.geolocation) { toast({ title: "GPS not available in this browser" }); return; }
    setGpsCapturing(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setPlotForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(7), longitude: pos.coords.longitude.toFixed(7) })); setGpsCapturing(false); },
      () => { toast({ title: "Could not get location", description: "Ensure location access is granted in your browser." }); setGpsCapturing(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function generateFullReport() {
    const field = fields.find((f: any) => f.id === trial.fieldId);
    const plotRows = trial.plots.map(p => {
      const latestYield = p.yields[0];
      return `<tr>
        <td>${p.plotNumber}</td>
        <td>${p.isControl ? "✓" : ""}</td>
        <td>${p.treatmentLabel ?? "—"}</td>
        <td>${p.replicationBlock ?? "—"}</td>
        <td>${p.areaHa ? parseFloat(p.areaHa).toFixed(4) + " ha" : "—"}</td>
        <td>${p.latitude && p.longitude ? parseFloat(p.latitude).toFixed(5) + ", " + parseFloat(p.longitude).toFixed(5) : "—"}</td>
        <td>${p.locationDescription ?? "—"}</td>
        <td style="font-weight:${latestYield?.yieldTha ? "700" : "400"}">${latestYield?.yieldTha ? parseFloat(latestYield.yieldTha).toFixed(3) + " t/ha" : "—"}</td>
        <td>${latestYield?.moisturePercent ? parseFloat(latestYield.moisturePercent).toFixed(1) + "%" : "—"}</td>
      </tr>`;
    }).join("");
    const statusInfo = STATUS_MAP[trial.status];
    const html = `<!DOCTYPE html><html><head>
      <title>Full Trial Report — ${trial.trialName}</title>
      <style>
        @page { margin: 18mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
        h1 { font-size: 18px; margin: 0 0 4px; } h2 { font-size: 13px; margin: 18px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 5px 7px; vertical-align: top; }
        th { background: #f0f0f0; font-size: 10px; text-transform: uppercase; font-weight: 600; }
        .meta { display: flex; flex-wrap: wrap; gap: 20px; padding: 10px 14px; background: #f9f9f9; border: 1px solid #e5e7eb; border-radius: 6px; margin: 10px 0; }
        .meta span { font-size: 11px; } .meta strong { font-weight: 700; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 700; background: ${statusInfo?.bg}; color: ${statusInfo?.color}; border: 1px solid ${statusInfo?.border}; }
        .footer { margin-top: 30px; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        .control-row { background: #fefce8; }
      </style>
    </head><body>
      <h1>Full Trial Report</h1>
      <p style="font-size:13px;font-weight:700;margin:0 0 4px">${trial.trialName} &nbsp; <span class="badge">${statusInfo?.label ?? trial.status}</span></p>
      <p style="color:#6b7280;margin:0 0 2px">${[trial.cropName, trial.season, trial.trialPurpose].filter(Boolean).join(" · ")}</p>
      ${field ? `<p style="color:#6b7280;margin:0">Field: <strong>${field.name}</strong></p>` : ""}

      <div class="meta">
        ${trial.trialsBody ? `<span><strong>Trials Body:</strong> ${trial.trialsBody}</span>` : ""}
        ${trial.contactName ? `<span><strong>Contact:</strong> ${trial.contactName}</span>` : ""}
        ${trial.trialType ? `<span><strong>Design:</strong> ${trial.trialType}</span>` : ""}
        ${trial.numberOfTreatments ? `<span><strong>Treatments:</strong> ${trial.numberOfTreatments}</span>` : ""}
        ${trial.numberOfReplications ? `<span><strong>Reps:</strong> ${trial.numberOfReplications}</span>` : ""}
        ${trial.totalAreaHa ? `<span><strong>Total Area:</strong> ${parseFloat(trial.totalAreaHa).toFixed(4)} ha</span>` : ""}
        ${trial.startDate ? `<span><strong>Start:</strong> ${fmt(trial.startDate)}</span>` : ""}
        ${trial.endDate ? `<span><strong>End:</strong> ${fmt(trial.endDate)}</span>` : ""}
      </div>

      <h2>Plot Results Summary (${trial.plots.length} plots)</h2>
      <table>
        <thead><tr><th>Plot</th><th>Control</th><th>Treatment</th><th>Block</th><th>Area</th><th>GPS</th><th>Location</th><th>Yield (t/ha)</th><th>Moisture</th></tr></thead>
        <tbody>${plotRows}</tbody>
      </table>

      ${trial.notes ? `<h2>Trial Notes</h2><p style="white-space:pre-wrap;font-size:11px">${trial.notes}</p>` : ""}

      <p class="footer">
        Generated by BDE Farm Trac &nbsp;|&nbsp; Printed: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        &nbsp;|&nbsp; This report is for on-farm records only and does not constitute an official trial result submission.
      </p>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  }
  const deletePlotMut = useMutation({
    mutationFn: (plotId: number) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots/${plotId}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Plot deleted" }); invalidate(); setDeletePlotId(null); setSelectedPlot(null); },
  });
  const addTreatmentMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots/${selectedPlot!.id}/treatments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Treatment recorded" }); invalidate(); setAddTreatmentOpen(false); },
  });
  const addObsMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots/${selectedPlot!.id}/observations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Observation saved" }); invalidate(); setAddObsOpen(false); },
  });
  const addYieldMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots/${selectedPlot!.id}/yields`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Yield data saved" }); invalidate(); setAddYieldOpen(false); },
  });

  function computeYieldTha() {
    const fw = parseFloat(yieldForm.freshWeightKg);
    const mo = parseFloat(yieldForm.moisturePercent);
    const area = parseFloat(String(selectedPlot?.areaHa ?? "0"));
    if (!isNaN(fw) && !isNaN(mo) && area > 0) {
      const dry = fw * (1 - mo / 100);
      return (dry / 1000 / area).toFixed(3);
    }
    return "";
  }

  const field = fields.find(f => f.id === trial.fieldId);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Button variant="outline" size="sm" onClick={onBack} style={{ flexShrink: 0, marginTop: 3 }}><ChevronLeft size={14} className="mr-1" /> All Trials</Button>
        {(trial.status === "harvested" || trial.status === "completed") && (
          <Button variant="outline" size="sm" onClick={generateFullReport} style={{ flexShrink: 0, marginTop: 3, gap: 6 }}>
            <FileText size={13} /> Full Trial Report
          </Button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>{trial.trialName}</h2>
            <div style={{ position: "relative" }}>
              <button onClick={() => setStatusPickerOpen(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                <StatusBadge status={trial.status} />
                <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>▼</span>
              </button>
              {statusPickerOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: 6, minWidth: 220 }}>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", padding: "2px 8px 6px", fontWeight: 500 }}>CHANGE STATUS</p>
                  {Object.entries(STATUS_MAP).map(([k, s]) => (
                    <button key={k} onClick={() => updateStatusMut.mutate(k)}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 5, border: "none", cursor: "pointer", background: trial.status === k ? s.bg : "transparent", textAlign: "left" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: trial.status === k ? 700 : 500, color: trial.status === k ? s.color : "#374151" }}>{s.label}</span>
                        <span style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af" }}>{STATUS_DESCRIPTIONS[k]}</span>
                      </span>
                      {trial.status === k && <CheckCircle size={13} style={{ color: s.color, flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }}>
            {trial.cropName && <>{trial.cropName} · </>}{trial.season && <>{trial.season} · </>}{trial.trialPurpose}
            {field && <> · {field.name}</>}
          </p>
        </div>
      </div>
      {statusPickerOpen && <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setStatusPickerOpen(false)} />}

      {/* Meta strip */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "12px 16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 20, fontSize: "0.8125rem", color: "#374151" }}>
        {trial.trialsBody && <span><strong>Body: </strong>{trial.trialsBody}</span>}
        {trial.contactName && <span><strong>Contact: </strong>{trial.contactName}</span>}
        {trial.numberOfTreatments && <span><strong>Treatments: </strong>{trial.numberOfTreatments}</span>}
        {trial.numberOfReplications && <span><strong>Reps: </strong>{trial.numberOfReplications}</span>}
        {trial.totalAreaHa && <span><strong>Total area: </strong>{fmtNum(trial.totalAreaHa)} ha</span>}
        {trial.startDate && <span><strong>Started: </strong>{fmt(trial.startDate)}</span>}
        {trial.endDate && <span><strong>Ends: </strong>{fmt(trial.endDate)}</span>}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "2px solid #e5e7eb", paddingBottom: 0 }}>
        {([["plots", "Plots", Sprout], ["treatments", "Treatments", TestTube], ["observations", "Observations", Eye], ["results", "Results", BarChart3]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setDetailTab(key)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: "0.875rem", fontWeight: detailTab === key ? 600 : 400,
              color: detailTab === key ? "#111827" : "#6b7280",
              borderBottom: detailTab === key ? "2px solid #111827" : "2px solid transparent",
              marginBottom: -2,
            }}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Plots tab */}
      {detailTab === "plots" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button size="sm" onClick={() => setAddPlotOpen(true)}><Plus size={13} className="mr-1" /> Add Plot</Button>
          </div>
          {trial.plots.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
              <Sprout size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
              <p style={{ fontWeight: 600, color: "#374151" }}>No plots added yet</p>
              <p style={{ fontSize: "0.875rem" }}>Add each trial plot — including the control — to start recording treatments, observations and yields.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {trial.plots.map(plot => (
                <div key={plot.id} style={{ border: "1px solid " + (plot.isControl ? "#fde047" : "#e5e7eb"), borderRadius: 8, padding: "14px", background: plot.isControl ? "#fefce8" : "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>Plot {plot.plotNumber}</p>
                      {plot.isControl && <span style={{ fontSize: "0.7rem", background: "#fde047", color: "#92400e", padding: "1px 8px", borderRadius: 8, fontWeight: 700 }}>CONTROL</span>}
                    </div>
                    <button onClick={() => setDeletePlotId(plot.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}><Trash2 size={13} /></button>
                  </div>
                  {plot.treatmentLabel && <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 4 }}>{plot.treatmentLabel}</p>}
                  {plot.areaHa && <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 2 }}>{fmtNum(plot.areaHa)} ha{plot.replicationBlock ? ` · Block ${plot.replicationBlock}` : ""}</p>}
                  {plot.latitude && plot.longitude && (
                    <p style={{ fontSize: "0.7rem", color: "#16a34a", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={10} /> {parseFloat(plot.latitude).toFixed(5)}, {parseFloat(plot.longitude).toFixed(5)}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    <button onClick={() => { setSelectedPlot(plot); setDetailTab("treatments"); setAddTreatmentOpen(true); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 8px", borderRadius: 5, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", color: "#374151" }}><TestTube size={11} /> Treatment</button>
                    <button onClick={() => { setSelectedPlot(plot); setDetailTab("observations"); setAddObsOpen(true); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 8px", borderRadius: 5, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", color: "#374151" }}><Eye size={11} /> Observe</button>
                    <button onClick={() => { setSelectedPlot(plot); setDetailTab("results"); setAddYieldOpen(true); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 8px", borderRadius: 5, border: "1px solid #22c55e", background: "#f0fdf4", cursor: "pointer", color: "#16a34a", fontWeight: 600 }}><Wheat size={11} /> Yield</button>
                  </div>
                  {plot.yields.length > 0 && (
                    <div style={{ marginTop: 8, padding: "6px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0" }}>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a" }}>Yield: {fmtNum(plot.yields[0].yieldTha, 3)} t/ha</p>
                      {plot.yields[0].moisturePercent && <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>Moisture: {fmtNum(plot.yields[0].moisturePercent, 1)}%</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Treatments tab */}
      {detailTab === "treatments" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>All treatment applications across all plots in this trial.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Select value={selectedPlot ? String(selectedPlot.id) : ""} onValueChange={v => setSelectedPlot(trial.plots.find(p => String(p.id) === v) ?? null)}>
                <SelectTrigger style={{ width: 180, fontSize: "0.875rem" }}><SelectValue placeholder="Select plot…" /></SelectTrigger>
                <SelectContent>{trial.plots.map(p => <SelectItem key={p.id} value={String(p.id)}>Plot {p.plotNumber}{p.isControl ? " (Control)" : ""}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" disabled={!selectedPlot} onClick={() => setAddTreatmentOpen(true)}><Plus size={13} className="mr-1" /> Log Treatment</Button>
            </div>
          </div>
          {trial.plots.every(p => true) && (
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "24px 0" }}>Select a plot above then click "Log Treatment" to record what was applied.</p>
          )}
        </div>
      )}

      {/* Observations tab */}
      {detailTab === "observations" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Growth stage assessments, disease and pest observations per plot.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Select value={selectedPlot ? String(selectedPlot.id) : ""} onValueChange={v => setSelectedPlot(trial.plots.find(p => String(p.id) === v) ?? null)}>
                <SelectTrigger style={{ width: 180, fontSize: "0.875rem" }}><SelectValue placeholder="Select plot…" /></SelectTrigger>
                <SelectContent>{trial.plots.map(p => <SelectItem key={p.id} value={String(p.id)}>Plot {p.plotNumber}{p.isControl ? " (Control)" : ""}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" disabled={!selectedPlot} onClick={() => setAddObsOpen(true)}><Plus size={13} className="mr-1" /> Record Observation</Button>
            </div>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "24px 0" }}>Select a plot above then click "Record Observation" to log growth stage and crop health data.</p>
        </div>
      )}

      {/* Results tab */}
      {detailTab === "results" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#111827", margin: 0 }}>Yield Comparison</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <Select value={selectedPlot ? String(selectedPlot.id) : ""} onValueChange={v => setSelectedPlot(trial.plots.find(p => String(p.id) === v) ?? null)}>
                <SelectTrigger style={{ width: 180, fontSize: "0.875rem" }}><SelectValue placeholder="Record yield for plot…" /></SelectTrigger>
                <SelectContent>{trial.plots.map(p => <SelectItem key={p.id} value={String(p.id)}>Plot {p.plotNumber}{p.isControl ? " (Control)" : ""}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" disabled={!selectedPlot} onClick={() => setAddYieldOpen(true)}><Wheat size={13} className="mr-1" /> Record Yield</Button>
            </div>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <YieldComparisonTable plots={trial.plots} />
          </div>
        </div>
      )}

      {/* Add Plot dialog */}
      <Dialog open={addPlotOpen} onOpenChange={o => { if (!o) setAddPlotOpen(false); }}>
        <DialogContent style={{ maxWidth: 460 }}>
          <DialogHeader><DialogTitle>Add Trial Plot</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Plot Number / ID *</Label><Input className="mt-1" value={plotForm.plotNumber} onChange={e => setPlotForm(f => ({ ...f, plotNumber: e.target.value }))} placeholder="e.g. T1, A1, Plot-3" /></div>
              <div><Label>Replication Block</Label><Input className="mt-1" value={plotForm.replicationBlock} onChange={e => setPlotForm(f => ({ ...f, replicationBlock: e.target.value }))} placeholder="e.g. Block 1, Rep A" /></div>
            </div>
            <div><Label>Treatment Label</Label><Input className="mt-1" value={plotForm.treatmentLabel} onChange={e => setPlotForm(f => ({ ...f, treatmentLabel: e.target.value }))} placeholder="e.g. Variety A @ 170 kg N/ha" /></div>
            <div><Label>Plot Area (ha)</Label><Input type="number" step="0.0001" className="mt-1" value={plotForm.areaHa} onChange={e => setPlotForm(f => ({ ...f, areaHa: e.target.value }))} placeholder="e.g. 0.1250" /></div>
            <div><Label>Location in Field</Label><Input className="mt-1" value={plotForm.locationDescription} onChange={e => setPlotForm(f => ({ ...f, locationDescription: e.target.value }))} placeholder="e.g. North strip, rows 1–8" /></div>
            {/* GPS coordinates */}
            <div style={{ padding: "10px 12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Label style={{ marginBottom: 0 }}>GPS Coordinates (optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={captureGPS} disabled={gpsCapturing} style={{ height: 26, fontSize: "0.75rem", gap: 4 }}>
                  {gpsCapturing ? <Loader2 size={11} className="animate-spin" /> : <Navigation size={11} />}
                  {gpsCapturing ? "Getting…" : "Use GPS"}
                </Button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <Label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Latitude</Label>
                  <Input className="mt-1" value={plotForm.latitude} onChange={e => setPlotForm(f => ({ ...f, latitude: e.target.value }))} placeholder="e.g. 52.4862" style={{ fontFamily: "monospace", fontSize: "0.8125rem" }} />
                </div>
                <div>
                  <Label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Longitude</Label>
                  <Input className="mt-1" value={plotForm.longitude} onChange={e => setPlotForm(f => ({ ...f, longitude: e.target.value }))} placeholder="e.g. -1.8904" style={{ fontFamily: "monospace", fontSize: "0.8125rem" }} />
                </div>
              </div>
              {plotForm.latitude && plotForm.longitude && (
                <p style={{ fontSize: "0.7rem", color: "#0369a1", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={10} /> {parseFloat(plotForm.latitude).toFixed(5)}, {parseFloat(plotForm.longitude).toFixed(5)}
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fefce8", border: "1px solid #fde047", borderRadius: 7 }}>
              <input type="checkbox" id="isControl" checked={plotForm.isControl} onChange={e => setPlotForm(f => ({ ...f, isControl: e.target.checked }))} style={{ width: 15, height: 15 }} />
              <label htmlFor="isControl" style={{ fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>This is the control plot (untreated / standard practice)</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPlotOpen(false)}>Cancel</Button>
            <Button disabled={!plotForm.plotNumber.trim()} onClick={() => addPlotMut.mutate(plotForm)}>Add Plot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete plot confirm */}
      {deletePlotId !== null && (
        <Dialog open onOpenChange={() => setDeletePlotId(null)}>
          <DialogContent style={{ maxWidth: 360 }}>
            <DialogHeader><DialogTitle>Delete Plot?</DialogTitle></DialogHeader>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>This will permanently remove this plot and all its treatments, observations and yield data.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletePlotId(null)}>Cancel</Button>
              <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deletePlotMut.mutate(deletePlotId!)}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Treatment dialog */}
      <Dialog open={addTreatmentOpen} onOpenChange={o => { if (!o) setAddTreatmentOpen(false); }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Log Treatment — Plot {selectedPlot?.plotNumber}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Date *</Label><Input type="date" className="mt-1" value={txForm.treatmentDate} onChange={e => setTxForm(f => ({ ...f, treatmentDate: e.target.value }))} /></div>
              <div>
                <Label>Treatment Type *</Label>
                <Select value={txForm.treatmentType} onValueChange={v => setTxForm(f => ({ ...f, treatmentType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{TREATMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Product / Variety Name</Label><Input className="mt-1" value={txForm.productName} onChange={e => setTxForm(f => ({ ...f, productName: e.target.value }))} placeholder="e.g. Crusoe, Kerb 500 SC, Latitude" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div><Label>Application Rate</Label><Input type="number" step="0.001" className="mt-1" value={txForm.applicationRate} onChange={e => setTxForm(f => ({ ...f, applicationRate: e.target.value }))} placeholder="e.g. 170" /></div>
              <div><Label>Unit</Label><Input className="mt-1" value={txForm.unit} onChange={e => setTxForm(f => ({ ...f, unit: e.target.value }))} placeholder="kg/ha, L/ha" /></div>
            </div>
            <div><Label>Notes</Label><Textarea rows={2} className="mt-1" value={txForm.notes} onChange={e => setTxForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTreatmentOpen(false)}>Cancel</Button>
            <Button disabled={!txForm.treatmentDate || !txForm.treatmentType || addTreatmentMut.isPending} onClick={() => addTreatmentMut.mutate(txForm)}>Save Treatment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Observation dialog */}
      <Dialog open={addObsOpen} onOpenChange={o => { if (!o) setAddObsOpen(false); }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Record Observation — Plot {selectedPlot?.plotNumber}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Date *</Label><Input type="date" className="mt-1" value={obsForm.observationDate} onChange={e => setObsForm(f => ({ ...f, observationDate: e.target.value }))} /></div>
              <div>
                <Label>Growth Stage (BBCH)</Label>
                <Select value={obsForm.growthStage} onValueChange={v => setObsForm(f => ({ ...f, growthStage: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{GROWTH_STAGES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><Label>Plant Count/m²</Label><Input type="number" className="mt-1" value={obsForm.plantCount} onChange={e => setObsForm(f => ({ ...f, plantCount: e.target.value }))} /></div>
              <div><Label>Height (cm)</Label><Input type="number" className="mt-1" value={obsForm.plantHeightCm} onChange={e => setObsForm(f => ({ ...f, plantHeightCm: e.target.value }))} /></div>
              <div>
                <Label>Condition</Label>
                <Select value={obsForm.generalCondition} onValueChange={v => setObsForm(f => ({ ...f, generalCondition: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{CONDITION_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" id="diseasePresent" checked={obsForm.diseasePresent} onChange={e => setObsForm(f => ({ ...f, diseasePresent: e.target.checked }))} />
                <label htmlFor="diseasePresent" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Disease present</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" id="pestPresent" checked={obsForm.pestPresent} onChange={e => setObsForm(f => ({ ...f, pestPresent: e.target.checked }))} />
                <label htmlFor="pestPresent" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Pest present</label>
              </div>
            </div>
            {obsForm.diseasePresent && <div><Label>Disease Name</Label><Input className="mt-1" value={obsForm.diseaseName} onChange={e => setObsForm(f => ({ ...f, diseaseName: e.target.value }))} placeholder="e.g. Septoria tritici, Fusarium, Mildew" /></div>}
            {obsForm.pestPresent && <div><Label>Pest Name</Label><Input className="mt-1" value={obsForm.pestName} onChange={e => setObsForm(f => ({ ...f, pestName: e.target.value }))} placeholder="e.g. BYDV aphids, Orange wheat blossom midge" /></div>}
            <div><Label>Notes</Label><Textarea rows={2} className="mt-1" value={obsForm.notes} onChange={e => setObsForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddObsOpen(false)}>Cancel</Button>
            <Button disabled={!obsForm.observationDate || addObsMut.isPending} onClick={() => addObsMut.mutate(obsForm)}>Save Observation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Yield dialog */}
      <Dialog open={addYieldOpen} onOpenChange={o => { if (!o) setAddYieldOpen(false); }}>
        <DialogContent style={{ maxWidth: 500 }}>
          <DialogHeader><DialogTitle>Record Harvest Yield — Plot {selectedPlot?.plotNumber}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12 }}>
            <div><Label>Harvest Date *</Label><Input type="date" className="mt-1" value={yieldForm.harvestDate} onChange={e => setYieldForm(f => ({ ...f, harvestDate: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Fresh Weight (kg)</Label><Input type="number" step="0.01" className="mt-1" value={yieldForm.freshWeightKg} onChange={e => { const v = e.target.value; setYieldForm(f => ({ ...f, freshWeightKg: v, yieldTha: "" })); }} placeholder="Total plot weight" /></div>
              <div><Label>Moisture %</Label><Input type="number" step="0.01" className="mt-1" value={yieldForm.moisturePercent} onChange={e => { const v = e.target.value; setYieldForm(f => ({ ...f, moisturePercent: v, yieldTha: "" })); }} placeholder="e.g. 15.2" /></div>
            </div>
            {yieldForm.freshWeightKg && yieldForm.moisturePercent && selectedPlot?.areaHa && (
              <div style={{ padding: "8px 12px", background: "#f0fdf4", borderRadius: 7, border: "1px solid #bbf7d0" }}>
                <p style={{ fontSize: "0.8125rem", color: "#16a34a", fontWeight: 600 }}>
                  Calculated yield: {computeYieldTha()} t/ha (at 14% moisture equivalent)
                </p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><Label>Yield (t/ha)</Label><Input type="number" step="0.001" className="mt-1" value={yieldForm.yieldTha || computeYieldTha()} onChange={e => setYieldForm(f => ({ ...f, yieldTha: e.target.value }))} placeholder="Override if known" /></div>
              <div><Label>Protein %</Label><Input type="number" step="0.01" className="mt-1" value={yieldForm.grainProteinPercent} onChange={e => setYieldForm(f => ({ ...f, grainProteinPercent: e.target.value }))} /></div>
              <div><Label>Spec. Weight</Label><Input type="number" step="0.1" className="mt-1" value={yieldForm.specificWeight} onChange={e => setYieldForm(f => ({ ...f, specificWeight: e.target.value }))} placeholder="kg/hl" /></div>
            </div>
            <div><Label>Notes</Label><Textarea rows={2} className="mt-1" value={yieldForm.notes} onChange={e => setYieldForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddYieldOpen(false)}>Cancel</Button>
            <Button disabled={!yieldForm.harvestDate || addYieldMut.isPending} onClick={() => addYieldMut.mutate({ ...yieldForm, yieldTha: yieldForm.yieldTha || computeYieldTha() || null })}>Save Yield</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const EMPTY_TRIAL = { trialName: "", season: cropYearLabel(currentCropYear()), cropName: "", cropOther: "", trialPurpose: "", trialType: "", trialsBody: "", contactName: "", numberOfTreatments: "", numberOfReplications: "", totalAreaHa: "", startDate: "", endDate: "", status: "planned", fieldId: "", notes: "" };

export default function CropTrialsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: farmData } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const fieldsQuery = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => (d.records ?? []) as any[],
  });
  const fields = fieldsQuery.data ?? [];

  const q = useQuery<{ records: Trial[] }>({
    queryKey: ["crop-trials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-trials`).then(r => r.json()),
    enabled: !!farmId,
  });
  const trials: Trial[] = q.data?.records ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Trial | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [form, setForm] = useState<typeof EMPTY_TRIAL>({ ...EMPTY_TRIAL });

  function openAdd() { setEditItem(null); setForm({ ...EMPTY_TRIAL }); setAddOpen(true); }
  function openEdit(t: Trial) {
    setEditItem(t);
    const existingCrop = t.cropName ?? "";
    const isKnown = CROP_OPTIONS.includes(existingCrop);
    setForm({
      trialName: t.trialName, season: t.season ?? cropYearLabel(currentCropYear()), cropName: isKnown ? existingCrop : (existingCrop ? "Other" : ""),
      cropOther: isKnown ? "" : existingCrop,
      trialPurpose: t.trialPurpose, trialType: t.trialType ?? "", trialsBody: t.trialsBody ?? "",
      contactName: t.contactName ?? "", numberOfTreatments: t.numberOfTreatments ? String(t.numberOfTreatments) : "",
      numberOfReplications: t.numberOfReplications ? String(t.numberOfReplications) : "",
      totalAreaHa: t.totalAreaHa ?? "", startDate: t.startDate ?? "", endDate: t.endDate ?? "",
      status: t.status, fieldId: t.fieldId ? String(t.fieldId) : "", notes: t.notes ?? "",
    });
    setAddOpen(true);
  }

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/crop-trials`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Trial created" }); qc.invalidateQueries({ queryKey: ["crop-trials", farmId] }); setAddOpen(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/crop-trials/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Trial updated" }); qc.invalidateQueries({ queryKey: ["crop-trials", farmId] }); setAddOpen(false); setEditItem(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/crop-trials/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Trial deleted" }); qc.invalidateQueries({ queryKey: ["crop-trials", farmId] }); setDeleteId(null); },
  });

  function handleSave() {
    const resolvedCrop = form.cropName === "Other" ? form.cropOther.trim() : form.cropName;
    const body = {
      ...form,
      cropName: resolvedCrop,
      fieldId: form.fieldId && form.fieldId !== "__none__" ? parseInt(form.fieldId) : null,
      numberOfTreatments: form.numberOfTreatments ? parseInt(String(form.numberOfTreatments)) : null,
      numberOfReplications: form.numberOfReplications ? parseInt(String(form.numberOfReplications)) : null,
    };
    if (editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }

  const seasonOptions = getSeasonOptions();

  // Refresh selected trial from latest data
  const currentTrial = selectedTrial ? (trials.find(t => t.id === selectedTrial.id) ?? null) : null;

  const filtered = (statusFilter === "all" ? trials : trials.filter(t => t.status === statusFilter))
    .filter(t => !t.startDate || isInCropYear(t.startDate, cropYear));

  function handlePrint() {
    const rows = filtered.map(t => {
      const field = fields.find((f: any) => f.id === t.fieldId);
      const plotsWithYield = t.plots.filter(p => p.yields.length > 0);
      const control = plotsWithYield.find(p => p.isControl);
      const ctrlY = control?.yields[0]?.yieldTha ? parseFloat(control.yields[0].yieldTha) : null;
      return `<tr>
        <td>${t.trialName}</td>
        <td>${t.season ?? "—"}</td>
        <td>${t.cropName ?? "—"}</td>
        <td>${field?.name ?? "—"}</td>
        <td>${t.trialPurpose}</td>
        <td>${t.trialsBody ?? "—"}</td>
        <td>${t.plots.length}</td>
        <td>${ctrlY != null ? ctrlY.toFixed(3) + " t/ha" : "—"}</td>
        <td>${STATUS_MAP[t.status]?.label ?? t.status}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Crop Trials Register — ${farmData?.record?.name ?? ""}</title>
    <style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px}h2{font-size:16px;margin-bottom:4px}
    table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ccc;padding:6px 8px;vertical-align:top}
    th{background:#f5f5f5;font-weight:600;font-size:10px;text-transform:uppercase}</style></head>
    <body><h2>Crop Trials Register</h2>
    <p><strong>Farm:</strong> ${farmData?.record?.name ?? "—"} ${farmData?.record?.cphNumber ? `&nbsp;|&nbsp; <strong>CPH:</strong> ${farmData.record.cphNumber}` : ""}</p>
    <p>Printed: ${new Date().toLocaleDateString("en-GB")} &nbsp;|&nbsp; Total trials: ${filtered.length}</p>
    <table><thead><tr><th>Trial Name</th><th>Season</th><th>Crop</th><th>Field</th><th>Purpose</th><th>Body</th><th>Plots</th><th>Control Yield</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  }

  if (currentTrial) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 8px" }}>
          <TrialDetailView trial={currentTrial} farmId={farmId!} onBack={() => setSelectedTrial(null)} fields={fields} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 8px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
              <FlaskConical size={22} style={{ color: "#2563eb" }} /> Crop Trials Register
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>
              Record on-farm variety and input trials — plot design, treatment applications, growth observations and yield comparisons.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!farmId}><Printer size={14} className="mr-2" /> Print Register</Button>
            <Button size="sm" onClick={openAdd} disabled={!farmId}><Plus size={14} className="mr-1" /> New Trial</Button>
          </div>
        </div>

        {!farmId ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1, color: "#d97706" }} />
            <p style={{ fontSize: "0.875rem", color: "#92400e" }}>Select a farm from the sidebar to view and manage crop trials.</p>
          </div>
        ) : (
          <>
            {/* Filter bar + View toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {(["all", "planned", "active", "harvested", "completed", "cancelled"] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.8125rem", cursor: "pointer", fontWeight: statusFilter === s ? 600 : 400,
                      background: statusFilter === s ? "#111827" : "#f3f4f6", color: statusFilter === s ? "#fff" : "#374151",
                      border: "1px solid " + (statusFilter === s ? "#111827" : "#e5e7eb") }}
                  >
                    {s === "all" ? `All (${trials.length})` : STATUS_MAP[s]?.label ?? s}
                  </button>
                ))}
                <CropYearSelector value={cropYear} onChange={setCropYear} />
              </div>
              <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                <button onClick={() => setViewMode("list")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500, background: viewMode === "list" ? "#111827" : "#f9fafb", color: viewMode === "list" ? "#fff" : "#374151" }}>
                  <List size={13} /> List
                </button>
                <button onClick={() => setViewMode("map")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", border: "none", borderLeft: "1px solid #e5e7eb", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500, background: viewMode === "map" ? "#111827" : "#f9fafb", color: viewMode === "map" ? "#fff" : "#374151" }}>
                  <Map size={13} /> Map
                </button>
              </div>
            </div>

            {viewMode === "map" ? (
              <TrialMapView trials={filtered} cropYear={cropYear} />
            ) : q.isLoading ? (
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }}>
                <FlaskConical size={40} style={{ margin: "0 auto 10px", opacity: 0.2, color: "#2563eb" }} />
                <p style={{ fontWeight: 600, color: "#374151", fontSize: "1rem" }}>No trials recorded</p>
                <p style={{ fontSize: "0.875rem" }}>
                  Use this register to log on-farm variety trials, input response trials, and agronomist or AHDB-coordinated plot experiments.
                </p>
                <Button size="sm" style={{ marginTop: 16 }} onClick={openAdd}><Plus size={13} className="mr-1" /> Create first trial</Button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {filtered.map(trial => {
                  const field = fields.find((f: any) => f.id === trial.fieldId);
                  const plotsWithYield = trial.plots.filter(p => p.yields.length > 0);
                  const control = plotsWithYield.find(p => p.isControl);
                  return (
                    <div key={trial.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px", background: "#fff", cursor: "pointer", transition: "box-shadow 0.15s" }}
                      onClick={() => setSelectedTrial(trial)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#111827", margin: 0 }}>{trial.trialName}</h3>
                            <StatusBadge status={trial.status} />
                          </div>
                          <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 4 }}>
                            {trial.cropName && <>{trial.cropName}<span style={{ margin: "0 6px" }}>·</span></>}
                            {trial.trialPurpose}<span style={{ margin: "0 6px" }}>·</span>
                            {field ? field.name : "No field assigned"}
                            {trial.season && <><span style={{ margin: "0 6px" }}>·</span>{trial.season}</>}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                          <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => openEdit(trial)}>Edit</Button>
                          <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#dc2626" }} onClick={() => setDeleteId(trial.id)}>Delete</Button>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151" }}>
                          <Sprout size={13} style={{ color: "#16a34a" }} />
                          <span><strong>{trial.plots.length}</strong> plots</span>
                        </div>
                        {trial.trialsBody && (
                          <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}><strong>Body:</strong> {trial.trialsBody}</div>
                        )}
                        {control?.yields[0]?.yieldTha && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151" }}>
                            <Wheat size={13} style={{ color: "#a16207" }} />
                            <span>Control: <strong>{parseFloat(control.yields[0].yieldTha).toFixed(3)} t/ha</strong></span>
                          </div>
                        )}
                        {trial.startDate && <div style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>{fmt(trial.startDate)}{trial.endDate ? ` – ${fmt(trial.endDate)}` : ""}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Add / Edit Trial dialog */}
        {addOpen && (
          <Dialog open onOpenChange={o => { if (!o) { setAddOpen(false); setEditItem(null); } }}>
            <DialogContent style={{ maxWidth: 560, maxHeight: "85vh", overflowY: "auto" }}>
              <DialogHeader><DialogTitle>{editItem ? "Edit Trial" : "Create New Trial"}</DialogTitle></DialogHeader>
              <div style={{ display: "grid", gap: 14 }}>
                {/* Auto-status suggestion banner */}
                {editItem && form.startDate && new Date(form.startDate) <= new Date() && form.status === "planned" && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 7, background: "#fffbeb", border: "1px solid #fde68a", fontSize: "0.8125rem", color: "#92400e" }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1, color: "#d97706" }} />
                    <span>The start date has passed — consider changing the status to <strong>Active</strong>.</span>
                  </div>
                )}
                {editItem && editItem.plots.some(p => p.yields.length > 0) && form.status === "active" && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 7, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "0.8125rem", color: "#166534" }}>
                    <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1, color: "#16a34a" }} />
                    <span>Yield data has been recorded on at least one plot — consider changing the status to <strong>Harvested</strong>.</span>
                  </div>
                )}

                <div><Label>Trial Name *</Label><Input className="mt-1" value={form.trialName} onChange={e => setForm(f => ({ ...f, trialName: e.target.value }))} placeholder="e.g. Winter wheat variety trial 2025/26" /></div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label>Crop</Label>
                    <Select value={form.cropName} onValueChange={v => setForm(f => ({ ...f, cropName: v, cropOther: v !== "Other" ? "" : f.cropOther }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select crop…" /></SelectTrigger>
                      <SelectContent>{CROP_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    {form.cropName === "Other" && (
                      <Input className="mt-2" value={form.cropOther} onChange={e => setForm(f => ({ ...f, cropOther: e.target.value }))} placeholder="Specify crop…" />
                    )}
                  </div>
                  <div>
                    <Label>Season</Label>
                    <Select value={form.season} onValueChange={v => setForm(f => ({ ...f, season: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select season…" /></SelectTrigger>
                      <SelectContent>
                        {seasonOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Trial Purpose *</Label>
                  <Select value={form.trialPurpose} onValueChange={v => setForm(f => ({ ...f, trialPurpose: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select purpose…" /></SelectTrigger>
                    <SelectContent>{TRIAL_PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label>Trial Design</Label>
                    <Select value={form.trialType} onValueChange={v => setForm(f => ({ ...f, trialType: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>{TRIAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Field</Label>
                    <Select value={form.fieldId || "__none__"} onValueChange={v => setForm(f => ({ ...f, fieldId: v === "__none__" ? "" : v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select field…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None specified</SelectItem>
                        {fields.map((fld: any) => <SelectItem key={fld.id} value={String(fld.id)}>{fld.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><Label>Conducting Body</Label><Input className="mt-1" value={form.trialsBody} onChange={e => setForm(f => ({ ...f, trialsBody: e.target.value }))} placeholder="e.g. AHDB, Agrii, own farm" /></div>
                  <div><Label>Contact / Agronomist</Label><Input className="mt-1" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} /></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <Label># Treatments</Label>
                    <Input type="number" min="1" className="mt-1" value={form.numberOfTreatments} onChange={e => setForm(f => ({ ...f, numberOfTreatments: e.target.value }))} />
                    <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }}>Number of different treatments or varieties being compared</p>
                  </div>
                  <div>
                    <Label># Reps / Blocks</Label>
                    <Input type="number" min="1" className="mt-1" value={form.numberOfReplications} onChange={e => setForm(f => ({ ...f, numberOfReplications: e.target.value }))} />
                    <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }}>How many times each treatment is repeated across the field</p>
                  </div>
                  <div>
                    <Label>Total Area (ha)</Label>
                    <Input type="number" step="0.0001" className="mt-1" value={form.totalAreaHa} onChange={e => setForm(f => ({ ...f, totalAreaHa: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><Label>Start Date</Label><Input type="date" className="mt-1" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                  <div><Label>End Date</Label><Input type="date" className="mt-1" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
                </div>

                <div>
                  <Label>Status</Label>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 2, marginBottom: 6 }}>Update manually as the trial progresses — no automatic changes occur.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {Object.entries(STATUS_MAP).map(([k, s]) => (
                      <button key={k} type="button" onClick={() => setForm(f => ({ ...f, status: k }))}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                          background: form.status === k ? s.bg : "#f9fafb", border: `1px solid ${form.status === k ? s.border : "#e5e7eb"}` }}>
                        <span style={{ minWidth: 80, fontWeight: 600, fontSize: "0.8125rem", color: form.status === k ? s.color : "#374151" }}>{s.label}</span>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{STATUS_DESCRIPTIONS[k]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
                <Button disabled={!form.trialName.trim() || !form.trialPurpose || createMut.isPending || updateMut.isPending} onClick={handleSave}>
                  {editItem ? "Update Trial" : "Create Trial"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete confirm */}
        {deleteId !== null && (
          <Dialog open onOpenChange={() => setDeleteId(null)}>
            <DialogContent style={{ maxWidth: 380 }}>
              <DialogHeader><DialogTitle>Delete Trial?</DialogTitle></DialogHeader>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>This will permanently remove this trial and all its plots, treatments, observations and yield data. This cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteMut.mutate(deleteId!)}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
