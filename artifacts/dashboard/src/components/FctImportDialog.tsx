import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { apiUrl as api } from "@/lib/api";
import { parseCsvText } from "@/lib/bottling-csv";

/* ─── CSV parsing helpers ──────────────────────────────────────────────── */

function normKey(k: string): string {
  return k.toLowerCase().trim().replace(/[\s\-–]+/g, "_").replace(/[^a-z0-9_]/g, "");
}

const ALIASES: Record<string, string> = {
  report_year: "auditYear", year: "auditYear", audit_year: "auditYear", reporting_year: "auditYear",
  total_emissions_tco2e: "totalTco2e", gross_emissions_tco2e: "totalTco2e", total_tco2e: "totalTco2e",
  gross_tco2e: "totalTco2e", total_carbon_emissions: "totalTco2e", total_emissions: "totalTco2e",
  total_sequestration_tco2e: "seqTco2e", sequestration_tco2e: "seqTco2e",
  total_sequestration: "seqTco2e", sequestration: "seqTco2e",
  net_emissions_tco2e: "netTco2e", net_tco2e: "netTco2e", net_emissions: "netTco2e", net_carbon: "netTco2e",
  emissions_per_ha_tco2e: "intensityPerHa", tco2e_per_ha: "intensityPerHa", intensity_per_ha: "intensityPerHa",
  fuel_emissions_tco2e: "fuelTco2e", fuel_energy_tco2e: "fuelTco2e", energy_emissions: "fuelTco2e",
  fuel_tco2e: "fuelTco2e", energy_tco2e: "fuelTco2e",
  fertiliser_emissions_tco2e: "fertTco2e", fertilizer_emissions_tco2e: "fertTco2e",
  soil_emissions_tco2e: "fertTco2e", fertiliser_soil_tco2e: "fertTco2e", fertiliser_tco2e: "fertTco2e",
  livestock_emissions_tco2e: "livestockTco2e", livestock_tco2e: "livestockTco2e",
  enteric_emissions_tco2e: "entericTco2e", enteric_tco2e: "entericTco2e",
  manure_emissions_tco2e: "manureTco2e", manure_tco2e: "manureTco2e",
  inputs_emissions_tco2e: "inputsTco2e", purchased_inputs_tco2e: "inputsTco2e",
  supply_chain_tco2e: "inputsTco2e", inputs_tco2e: "inputsTco2e",
  transport_emissions_tco2e: "transportTco2e", transport_tco2e: "transportTco2e",
  woodland_ha: "woodlandHa", woodland_area_ha: "woodlandHa",
  hedgerow_km: "hedgerowKm", hedgerow_length_km: "hedgerowKm",
  grassland_ha: "grasslandHa", permanent_grassland_ha: "grasslandHa",
  woodland_sequestration_tco2e: "woodlandSeqTco2e",
  hedgerow_sequestration_tco2e: "hedgerowSeqTco2e",
  grassland_sequestration_tco2e: "grasslandSeqTco2e",
  peatland_sequestration_tco2e: "peatlandSeqTco2e", peatland_ha: "peatlandHa",
  agroforestry_ha: "agroforestryHa", agroforestry_sequestration_tco2e: "agroforestrySeqTco2e",
  farm_name: "farmName", report_name: "reportName",
  farm_type: "farmType", total_farm_area_ha: "farmAreaHa",
};

function mapRow(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    const mapped = ALIASES[normKey(k)] ?? normKey(k);
    out[mapped] = v;
  }
  return out;
}

function num(v: string | undefined): number | null {
  if (!v || v.trim() === "" || v === "—") return null;
  const n = parseFloat(v.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

/* ─── Derived import plan from mapped row ──────────────────────────────── */

interface ParsedAudit {
  auditYear: string;
  totalTco2e: number | null;
  seqTco2e: number | null;
  netTco2e: number | null;
  intensityPerHa: number | null;
  farmName: string;
}

interface ParsedEmissionRecord {
  category: string;
  scope: string;
  activityDescription: string;
  tonnesCo2e: number;
}

interface ParsedSeqRecord {
  featureType: string;
  areaHaOrLengthM: number | null;
  unit: string;
  tonnesCo2eSequestered: number | null;
}

interface ImportPlan {
  audit: ParsedAudit;
  emissions: ParsedEmissionRecord[];
  sequestration: ParsedSeqRecord[];
  unmappedCols: string[];
}

function buildPlan(mapped: Record<string, string>): ImportPlan {
  const audit: ParsedAudit = {
    auditYear: mapped.auditYear ?? "",
    totalTco2e: num(mapped.totalTco2e),
    seqTco2e: num(mapped.seqTco2e),
    netTco2e: num(mapped.netTco2e),
    intensityPerHa: num(mapped.intensityPerHa),
    farmName: mapped.farmName ?? mapped.reportName ?? "",
  };

  const emissions: ParsedEmissionRecord[] = [];
  const addEmission = (tco2eKey: string, category: string, scope: string, desc: string) => {
    const v = num(mapped[tco2eKey]);
    if (v != null && v > 0) emissions.push({ category, scope, activityDescription: desc, tonnesCo2e: v });
  };
  addEmission("fuelTco2e", "Fuel & Energy", "Scope 1", "Fuel & energy use (FCT import)");
  addEmission("fertTco2e", "Soil & Fertiliser N₂O", "Scope 1", "Fertiliser & soil emissions (FCT import)");
  if (mapped.entericTco2e && num(mapped.entericTco2e) != null) {
    addEmission("entericTco2e", "Livestock Enteric Fermentation", "Scope 1", "Livestock enteric fermentation (FCT import)");
    addEmission("manureTco2e", "Livestock Manure", "Scope 1", "Livestock manure management (FCT import)");
  } else {
    addEmission("livestockTco2e", "Livestock Enteric Fermentation", "Scope 1", "Livestock emissions (FCT import)");
  }
  addEmission("inputsTco2e", "Purchased Inputs", "Scope 3", "Purchased inputs & supply chain (FCT import)");
  addEmission("transportTco2e", "Transport", "Scope 3", "Transport emissions (FCT import)");

  const sequestration: ParsedSeqRecord[] = [];
  const addSeq = (seqKey: string, areaKey: string, featureType: string, unit: string) => {
    const tco2e = num(mapped[seqKey]);
    const area = num(mapped[areaKey]);
    if (tco2e != null || area != null) {
      sequestration.push({ featureType, areaHaOrLengthM: area, unit, tonnesCo2eSequestered: tco2e });
    }
  };
  addSeq("woodlandSeqTco2e", "woodlandHa", "Woodland", "ha");
  addSeq("hedgerowSeqTco2e", "hedgerowKm", "Hedgerow", "km");
  addSeq("grasslandSeqTco2e", "grasslandHa", "Permanent Grassland", "ha");
  addSeq("peatlandSeqTco2e", "peatlandHa", "Peatland", "ha");
  addSeq("agroforestrySeqTco2e", "agroforestryHa", "Agroforestry", "ha");

  if (sequestration.length === 0 && audit.seqTco2e != null && audit.seqTco2e > 0) {
    sequestration.push({ featureType: "Other", areaHaOrLengthM: null, unit: "ha", tonnesCo2eSequestered: audit.seqTco2e });
  }

  const knownMapped = new Set(Object.values(ALIASES));
  const unmappedCols = Object.keys(mapped).filter(k => !knownMapped.has(k) && mapped[k]?.trim() !== "");

  return { audit, emissions, sequestration, unmappedCols };
}

/* ─── Sample CSV template ──────────────────────────────────────────────── */

const SAMPLE_CSV = `report_year,farm_name,farm_type,total_farm_area_ha,fuel_emissions_tco2e,fertiliser_emissions_tco2e,livestock_emissions_tco2e,inputs_emissions_tco2e,woodland_ha,woodland_sequestration_tco2e,hedgerow_km,hedgerow_sequestration_tco2e,grassland_ha,grassland_sequestration_tco2e,total_emissions_tco2e,total_sequestration_tco2e,net_emissions_tco2e,emissions_per_ha_tco2e
2024,"Green Acres Farm",Mixed,320,45.2,82.1,205.7,38.3,8.5,18.4,4.2,6.8,120,36.9,371.3,62.1,309.2,0.97`;

function downloadTemplate() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "fct_import_template.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Main Dialog ──────────────────────────────────────────────────────── */

type Step = "upload" | "review" | "done";

interface Props {
  open: boolean;
  farmId: number;
  onClose: () => void;
}

export function FctImportDialog({ open, farmId, onClose }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [ignoredRows, setIgnoredRows] = useState(0);
  const [parseError, setParseError] = useState("");
  const [conductedBy, setConductedBy] = useState("");
  const [auditDate, setAuditDate] = useState(new Date().toISOString().slice(0, 10));
  const [supplyChain, setSupplyChain] = useState("");
  const [notes, setNotes] = useState("");
  const [importEmissions, setImportEmissions] = useState(true);
  const [importSeq, setImportSeq] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedCounts, setSavedCounts] = useState({ audit: 0, emissions: 0, seq: 0 });

  const reset = () => {
    setStep("upload"); setFileName(""); setPlan(null); setParseError(""); setIgnoredRows(0);
    setConductedBy(""); setAuditDate(new Date().toISOString().slice(0, 10));
    setSupplyChain(""); setNotes(""); setImportEmissions(true); setImportSeq(true);
    setSaving(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const processCsv = (text: string, name: string) => {
    setParseError("");
    try {
      const records = parseCsvText(text);
      if (records.length < 2) throw new Error("CSV must have a header row and at least one data row.");
      const headers = records[0];
      const values = records[1];
      const extraRows = records
        .slice(2)
        .filter(row => row.some(cell => cell != null && cell.trim() !== "")).length;
      const rawRow: Record<string, string> = {};
      headers.forEach((h, i) => { rawRow[h] = values[i] ?? ""; });
      const mapped = mapRow(rawRow);
      const importPlan = buildPlan(mapped);
      if (!importPlan.audit.auditYear && !importPlan.audit.totalTco2e) {
        throw new Error("Could not find audit year or emissions totals in this CSV. Please check the file or use the template.");
      }
      setFileName(name);
      setPlan(importPlan);
      setIgnoredRows(extraRows);
      setStep("review");
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Unknown parse error");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => processCsv(ev.target?.result as string, f.name);
    reader.readAsText(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) { setParseError("Please upload a .csv file."); return; }
    const reader = new FileReader();
    reader.onload = ev => processCsv(ev.target?.result as string, f.name);
    reader.readAsText(f);
  }, []);

  const doImport = async () => {
    if (!plan) return;
    setSaving(true);
    let emissionCount = 0;
    let seqCount = 0;
    try {
      const year = plan.audit.auditYear || String(new Date().getFullYear());
      await fetch(api(`farms/${farmId}/carbon-audits`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          auditYear: year,
          auditDate,
          conductedBy: conductedBy || "Farm Carbon Toolkit (FCT)",
          auditTool: "Farm Carbon Toolkit (FCT)",
          supplyChainRequirement: supplyChain,
          totalTonnesCo2e: plan.audit.totalTco2e,
          sequestrationTonnesCo2e: plan.audit.seqTco2e,
          netTonnesCo2e: plan.audit.netTco2e,
          notes: notes || `Imported from FCT CSV export (${fileName})`,
        }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });

      if (importEmissions) {
        for (const rec of plan.emissions) {
          await fetch(api(`farms/${farmId}/carbon-emissions`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              emissionYear: year,
              scope: rec.scope,
              category: rec.category,
              activityDescription: rec.activityDescription,
              tonnesCo2e: rec.tonnesCo2e,
              emissionFactorSource: "Farm Carbon Toolkit (FCT)",
            }),
          }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
          emissionCount++;
        }
      }

      if (importSeq) {
        for (const rec of plan.sequestration) {
          await fetch(api(`farms/${farmId}/carbon-sequestration`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              sequestrationYear: year,
              featureType: rec.featureType,
              featureName: `${rec.featureType} (FCT ${year})`,
              areaHaOrLengthM: rec.areaHaOrLengthM,
              unit: rec.unit,
              tonnesCo2eSequestered: rec.tonnesCo2eSequestered,
              sequestrationFactorSource: "Farm Carbon Toolkit (FCT)",
            }),
          }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
          seqCount++;
        }
      }

      qc.invalidateQueries({ queryKey: ["carbon-audits", farmId] });
      qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] });
      qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] });
      setSavedCounts({ audit: 1, emissions: emissionCount, seq: seqCount });
      setStep("done");
    } catch {
      setParseError("Import failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent style={{ maxWidth: "46rem" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Import from Farm Carbon Toolkit
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Upload ── */}
        {step === "upload" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your completed report from{" "}
              <a href="https://calculator.farmcarbontoolkit.org.uk" target="_blank" rel="noreferrer" className="underline text-green-700">
                calculator.farmcarbontoolkit.org.uk
              </a>{" "}
              as a CSV, then upload it here. We'll map the figures automatically.
            </p>

            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragOver ? "border-green-500 bg-green-50" : "border-muted-foreground/30 hover:border-green-400"}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Drop your FCT CSV here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">.csv files only</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />
            </div>

            {parseError && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button onClick={downloadTemplate} className="text-xs text-green-700 underline flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Download sample template
              </button>
              <p className="text-xs text-muted-foreground">Not sure of the format? Use the sample template as a guide.</p>
            </div>
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {step === "review" && plan && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Parsed <strong>{fileName}</strong> successfully. Review the data below before importing.</span>
            </div>

            {ignoredRows > 0 && (
              <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Only the first data row will be imported — {ignoredRows} additional data{" "}
                  {ignoredRows === 1 ? "row was" : "rows were"} found in this CSV and will be ignored.
                  To import another year, export it as a separate CSV and import it separately.
                </span>
              </div>
            )}

            {/* Carbon Audit summary */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Carbon Audit Record</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-muted/40 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Audit Year</p>
                  <p className="font-semibold">{plan.audit.auditYear || "—"}</p>
                </div>
                <div className="bg-orange-50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Gross Emissions</p>
                  <p className="font-semibold text-orange-700">{plan.audit.totalTco2e != null ? `${plan.audit.totalTco2e} tCO₂e` : "—"}</p>
                </div>
                <div className="bg-green-50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Sequestration</p>
                  <p className="font-semibold text-green-700">{plan.audit.seqTco2e != null ? `${plan.audit.seqTco2e} tCO₂e` : "—"}</p>
                </div>
                <div className="bg-blue-50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Net Emissions</p>
                  <p className="font-semibold text-blue-700">{plan.audit.netTco2e != null ? `${plan.audit.netTco2e} tCO₂e` : "—"}</p>
                </div>
                {plan.audit.intensityPerHa != null && (
                  <div className="bg-muted/40 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">Intensity/ha</p>
                    <p className="font-semibold">{plan.audit.intensityPerHa} tCO₂e/ha</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs">Audit Date *</Label>
                  <Input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)} className="mt-1 h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Conducted By</Label>
                  <Input value={conductedBy} onChange={e => setConductedBy(e.target.value)} placeholder="Farm Carbon Toolkit (FCT)" className="mt-1 h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Supply Chain Customer (optional)</Label>
                  <Input value={supplyChain} onChange={e => setSupplyChain(e.target.value)} placeholder="e.g. Tesco, ABP" className="mt-1 h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Annual FCT submission" className="mt-1 h-8 text-sm" />
                </div>
              </div>
            </div>

            {/* Emission breakdown */}
            {plan.emissions.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Emission Breakdown ({plan.emissions.length} records)
                  </p>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={importEmissions} onChange={e => setImportEmissions(e.target.checked)} />
                    Import these
                  </label>
                </div>
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left py-1 text-muted-foreground font-medium">Category</th><th className="text-left py-1 text-muted-foreground font-medium">Scope</th><th className="text-right py-1 text-muted-foreground font-medium">tCO₂e</th></tr></thead>
                  <tbody>{plan.emissions.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1">{r.category}</td>
                      <td className="py-1 text-muted-foreground">{r.scope}</td>
                      <td className="py-1 text-right font-medium">{r.tonnesCo2e.toFixed(2)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {/* Sequestration breakdown */}
            {plan.sequestration.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Sequestration ({plan.sequestration.length} records)
                  </p>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={importSeq} onChange={e => setImportSeq(e.target.checked)} />
                    Import these
                  </label>
                </div>
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left py-1 text-muted-foreground font-medium">Feature</th><th className="text-left py-1 text-muted-foreground font-medium">Area/Length</th><th className="text-right py-1 text-muted-foreground font-medium">tCO₂e Sequestered</th></tr></thead>
                  <tbody>{plan.sequestration.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1">{r.featureType}</td>
                      <td className="py-1 text-muted-foreground">{r.areaHaOrLengthM != null ? `${r.areaHaOrLengthM} ${r.unit}` : "—"}</td>
                      <td className="py-1 text-right font-medium">{r.tonnesCo2eSequestered != null ? r.tonnesCo2eSequestered.toFixed(2) : "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {plan.unmappedCols.length > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                <span className="font-medium">Columns not mapped:</span>{" "}
                {plan.unmappedCols.join(", ")} — these values won't be imported.
              </div>
            )}

            {parseError && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === "done" && (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <p className="font-semibold">Import complete</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{savedCounts.audit} Carbon Audit record created</p>
              {savedCounts.emissions > 0 && <p>{savedCounts.emissions} Emission records created</p>}
              {savedCounts.seq > 0 && <p>{savedCounts.seq} Sequestration records created</p>}
            </div>
            <p className="text-xs text-muted-foreground">Records are now visible in the Carbon Audits, Emissions, and Sequestration tabs.</p>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && <Button variant="outline" onClick={handleClose}>Cancel</Button>}
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => { setStep("upload"); setParseError(""); }} className="mr-auto">
                ← Back
              </Button>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={doImport} disabled={saving} className="bg-green-700 hover:bg-green-800">
                {saving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Importing…</> : `Import ${1 + (importEmissions ? plan!.emissions.length : 0) + (importSeq ? plan!.sequestration.length : 0)} records`}
              </Button>
            </>
          )}
          {step === "done" && <Button onClick={handleClose}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
