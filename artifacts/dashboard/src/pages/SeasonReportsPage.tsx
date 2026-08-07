import { useState, useMemo } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { gradeLabel } from "@/lib/harvestGrades";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import {
  Printer, ChevronDown, ChevronRight, Wheat, Tractor, Sprout, FlaskConical,
  BarChart3, Beef, Milk, AlertCircle, AlertTriangle, Loader2, FileBarChart2,
  Bug, Leaf, CheckCircle2,
} from "lucide-react";
import { buildProReport, printProReport } from "@/lib/print-report";
import { useLocation } from "wouter";
import { useFarmMeta, FarmSettingsWarning } from "@/pages/viticulture/shared";

type Tab = "arable" | "livestock" | "ipm" | "organic" | "forage";
const SEASON_REPORTS_TAB_IDS: Tab[] = ["arable", "livestock", "ipm", "organic", "forage"];

const fmt2 = (n: number | null | undefined, dp = 2) => {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
};
const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtPence = (p: number | null | undefined) => {
  if (!p) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function StatCard({ label, value, sub, color = "#166534", bg = "#f0fdf4", border = "#bbf7d0" }: {
  label: string; value: string; sub?: string; color?: string; bg?: string; border?: string;
}) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "0.875rem 1.125rem" }}>
      <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ fontSize: "1.35rem", fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function MiniTable({ headers, rows, emptyMsg }: { headers: string[]; rows: (string | number | null | undefined)[][]; emptyMsg?: string }) {
  if (rows.length === 0) {
    return <p style={{ fontSize: "0.78rem", color: "#9ca3af", padding: "0.5rem 0", fontStyle: "italic" }}>{emptyMsg ?? "No records"}</p>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {headers.map(h => (
              <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? "#f9fafb" : "#fff" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "4px 8px", borderBottom: "1px solid #f3f4f6", color: "#374151", verticalAlign: "top", whiteSpace: j === 0 ? "nowrap" : undefined }}>
                  {cell ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FieldCard({ fieldData, defaultOpen = false }: { fieldData: any; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [section, setSection] = useState<"ops" | "sprays" | "drilling" | "harvest">("ops");
  const { field, assignments, sprays, drilling, operations, harvests, summary } = fieldData;
  const cropLabel = assignments.length > 0
    ? assignments.map((a: any) => `${a.cropName}${a.cropVariety ? ` (${a.cropVariety})` : ""}`).join(", ")
    : "—";

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: open ? "#f0fdf4" : "#fff", cursor: "pointer", border: "none", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a3a1a" }}>{field.name}</span>
          {field.fieldReference && <span style={{ fontSize: "0.72rem", background: "#e5e7eb", color: "#374151", padding: "1px 6px", borderRadius: 4 }}>{field.fieldReference}</span>}
          <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{fmt2(parseFloat(field.areaHectares), 2)} ha</span>
          <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 500 }}>{cropLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {summary.totalYieldTonnes > 0 && (
            <span style={{ fontSize: "0.78rem", color: "#166534", fontWeight: 600 }}>
              {fmt2(summary.totalYieldTonnes, 2)} t · {fmt2(summary.yieldTHa, 2)} t/ha
            </span>
          )}
          {summary.totalMachineHours > 0 && (
            <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{fmt2(summary.totalMachineHours, 1)} mach. hrs</span>
          )}
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 12 }}>
            <StatCard label="Total Yield" value={summary.totalYieldTonnes > 0 ? `${fmt2(summary.totalYieldTonnes, 2)} t` : "—"} sub={summary.yieldTHa > 0 ? `${fmt2(summary.yieldTHa, 2)} t/ha` : undefined} color="#166534" bg="#f0fdf4" border="#bbf7d0" />
            <StatCard label="Area Harvested" value={summary.totalAreaHarvestedHa > 0 ? `${fmt2(summary.totalAreaHarvestedHa, 2)} ha` : "—"} color="#1e40af" bg="#eff6ff" border="#bfdbfe" />
            <StatCard label="Machine Hours" value={summary.totalMachineHours > 0 ? fmt2(summary.totalMachineHours, 1) : "—"} sub={summary.totalLabourHours > 0 ? `${fmt2(summary.totalLabourHours, 1)} labour hrs` : undefined} color="#d97706" bg="#fffbeb" border="#fde68a" />
            <StatCard label="Operations Cost" value={summary.machineCostPence > 0 ? fmtPence(summary.machineCostPence) : "—"} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
            <StatCard label="Spray Applications" value={String(summary.sprayCount)} color="#0f766e" bg="#f0fdfa" border="#99f6e4" />
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {[
              { key: "ops", label: `Operations (${operations.length})`, icon: <Tractor className="w-3.5 h-3.5" /> },
              { key: "sprays", label: `Sprays (${sprays.length})`, icon: <FlaskConical className="w-3.5 h-3.5" /> },
              { key: "drilling", label: `Drilling (${drilling.length})`, icon: <Sprout className="w-3.5 h-3.5" /> },
              { key: "harvest", label: `Harvest (${harvests.length})`, icon: <Wheat className="w-3.5 h-3.5" /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSection(key as any)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: section === key ? 600 : 400, background: section === key ? "#1a3a1a" : "#f3f4f6", color: section === key ? "#fff" : "#374151", border: "none", cursor: "pointer" }}
              >{icon}{label}</button>
            ))}
          </div>

          {section === "ops" && (
            <MiniTable
              headers={["Date", "Operation", "Implement", "Area (ha)", "Mach. Hrs", "Labour Hrs", "Operator", "Cost"]}
              rows={operations.map((o: any) => [
                fmtDate(o.operationDate),
                o.operationType,
                o.implement ?? (o.vehicleDescription ?? "—"),
                o.areaHa ? fmt2(parseFloat(o.areaHa), 2) : "—",
                o.machineHours ? fmt2(parseFloat(o.machineHours), 1) : "—",
                o.labourHours ? fmt2(parseFloat(o.labourHours), 1) : "—",
                o.isContractor ? `Contractor${o.contractorName ? `: ${o.contractorName}` : ""}` : (o.operator ?? "—"),
                o.isContractor ? fmtPence(o.contractorCostPence) : (o.machineRatePence || o.labourRatePence ? fmtPence(Math.round((parseFloat(o.machineHours ?? "0") || 0) * (o.machineRatePence ?? 0)) + Math.round((parseFloat(o.labourHours ?? "0") || 0) * (o.labourRatePence ?? 0))) : "—"),
              ])}
              emptyMsg="No field operations recorded for this field in the selected year"
            />
          )}

          {section === "sprays" && (
            <MiniTable
              headers={["Date", "Product", "Category", "Rate", "Area (ha)", "Water (L)", "Operator"]}
              rows={sprays.map((s: any) => [
                fmtDate(s.applicationDate),
                s.productName ?? "—",
                s.category ?? "—",
                s.applicationRate ? `${fmt2(parseFloat(s.applicationRate), 3)} ${s.rateUnit ?? ""}`.trim() : "—",
                s.areaSprayedHa ? fmt2(parseFloat(s.areaSprayedHa), 2) : "—",
                s.waterVolumeLitres ? fmt2(parseFloat(s.waterVolumeLitres), 0) : "—",
                s.operatorName ?? "—",
              ])}
              emptyMsg="No spray applications recorded for this field in the selected year"
            />
          )}

          {section === "drilling" && (
            <MiniTable
              headers={["Date", "Crop", "Variety", "Lot No.", "Seed Rate", "Area Seeded (ha)", "Operator"]}
              rows={drilling.map((d: any) => [
                fmtDate(d.drillingDate),
                d.cropName,
                d.variety ?? "—",
                d.seedLotNumber ?? "—",
                d.seedRate ? `${fmt2(parseFloat(d.seedRate), 2)} ${d.seedRateUnit ?? ""}`.trim() : "—",
                d.areaSeededHa ? fmt2(parseFloat(d.areaSeededHa), 2) : "—",
                d.operator ?? "—",
              ])}
              emptyMsg="No drilling records for this field in the selected year"
            />
          )}

          {section === "harvest" && (
            <MiniTable
              headers={["Date", "Yield (t)", "Area (ha)", "Yield (t/ha)", "Moisture %", "Grade", "Operator"]}
              rows={harvests.map((h: any) => {
                const yt = parseFloat(h.yieldTonnes ?? "0") || 0;
                const ah = parseFloat(h.areaHarvestedHa ?? "0") || 0;
                return [
                  fmtDate(h.harvestDate),
                  yt > 0 ? fmt2(yt, 2) : "—",
                  ah > 0 ? fmt2(ah, 2) : "—",
                  yt > 0 && ah > 0 ? fmt2(yt / ah, 2) : "—",
                  h.moisturePercent ? `${fmt2(parseFloat(h.moisturePercent), 1)}%` : "—",
                  gradeLabel(h.qualityGrade),
                  h.operatorName ?? "—",
                ];
              })}
              emptyMsg="No harvest records for this field in the selected year"
            />
          )}
        </div>
      )}
    </div>
  );
}

function HerdCard({ herdData }: { herdData: any }) {
  const [open, setOpen] = useState(true);
  const [section, setSection] = useState<"movements" | "medicines" | "milk" | "feed">("movements");
  const { herd, movements, medicines, milk, mortality, feed, summary } = herdData;

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: open ? "#fef3c7" : "#fff", cursor: "pointer", border: "none", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#92400e" }}>{herd.name}</span>
          <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{herd.type ? herdSpeciesDisplayLabel(herd.type) + (herdProductionSubtype(herd.type) ? ` (${herdProductionSubtype(herd.type)})` : "") : "—"}{herd.breed ? ` · ${herd.breed}` : ""}</span>
          {herd.herdNumber && <span style={{ fontSize: "0.72rem", background: "#e5e7eb", color: "#374151", padding: "1px 6px", borderRadius: 4 }}>{herd.herdNumber}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: "0.72rem", color: "#059669" }}>↑{summary.movementIn} in</span>
          <span style={{ fontSize: "0.72rem", color: "#dc2626" }}>↓{summary.movementOut} out</span>
          {summary.deaths > 0 && <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{summary.deaths} deaths</span>}
          {summary.totalMilkLitres > 0 && <span style={{ fontSize: "0.72rem", color: "#3b82f6" }}>{Math.round(summary.totalMilkLitres).toLocaleString("en-GB")} L milk</span>}
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 12 }}>
            <StatCard label="Movements In" value={String(summary.movementIn)} color="#166534" bg="#f0fdf4" border="#bbf7d0" />
            <StatCard label="Movements Out" value={String(summary.movementOut)} color="#dc2626" bg="#fef2f2" border="#fecaca" />
            <StatCard label="Mortalities" value={String(summary.deaths)} color="#374151" bg="#f9fafb" border="#e5e7eb" />
            <StatCard label="Medicine Records" value={String(summary.medicineCount)} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
            {summary.totalMilkLitres > 0 && <StatCard label="Total Milk Yield" value={`${Math.round(summary.totalMilkLitres).toLocaleString("en-GB")} L`} color="#3b82f6" bg="#eff6ff" border="#bfdbfe" />}
            {summary.totalFeedKg > 0 && <StatCard label="Feed Used" value={`${Math.round(summary.totalFeedKg).toLocaleString("en-GB")} kg`} color="#d97706" bg="#fffbeb" border="#fde68a" />}
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {[
              { key: "movements", label: `Movements (${movements.length})`, icon: <Beef className="w-3.5 h-3.5" /> },
              { key: "medicines", label: `Medicines (${medicines.length})`, icon: <FlaskConical className="w-3.5 h-3.5" /> },
              { key: "milk", label: `Milk Records (${milk.length})`, icon: <Milk className="w-3.5 h-3.5" /> },
              { key: "feed", label: `Feed Records (${feed.length})`, icon: <Sprout className="w-3.5 h-3.5" /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSection(key as any)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: section === key ? 600 : 400, background: section === key ? "#92400e" : "#f3f4f6", color: section === key ? "#fff" : "#374151", border: "none", cursor: "pointer" }}
              >{icon}{label}</button>
            ))}
          </div>

          {section === "movements" && (
            <MiniTable
              headers={["Date", "Type", "No. Animals", "From", "To", "Licence No.", "Species"]}
              rows={movements.map((m: any) => [
                fmtDate(m.movementDate),
                m.movementType,
                m.numberOfAnimals ?? 1,
                m.fromLocation ?? "—",
                m.toLocation ?? "—",
                m.licenceNumber ?? "—",
                m.species ?? "—",
              ])}
              emptyMsg="No movements recorded for this enterprise in the selected year"
            />
          )}

          {section === "medicines" && (
            <MiniTable
              headers={["Date", "Medicine", "Dosage", "Route", "Animals Treated", "Withdrawal (days)", "Administered By"]}
              rows={medicines.map((m: any) => [
                fmtDate(m.administeredDate),
                m.medicineName,
                m.dosage ?? "—",
                m.administrationRoute ?? "—",
                m.treatedAnimalCount != null ? m.treatedAnimalCount : (m.treatmentScope ?? "—"),
                m.withdrawalPeriodDays ?? "—",
                m.administeredBy ?? "—",
              ])}
              emptyMsg="No medicine records for this enterprise in the selected year"
            />
          )}

          {section === "milk" && (
            <MiniTable
              headers={["Date", "Session", "Yield (L)", "Fat %", "Protein %", "Lactose %", "SCC (000s)", "Antibiotic Test"]}
              rows={milk.map((m: any) => [
                fmtDate(m.recordDate),
                m.sessionType ?? m.recordType ?? "—",
                m.yieldLitres ? fmt2(parseFloat(m.yieldLitres), 0) : "—",
                m.fatPercent ? `${fmt2(parseFloat(m.fatPercent), 2)}%` : "—",
                m.proteinPercent ? `${fmt2(parseFloat(m.proteinPercent), 2)}%` : "—",
                m.lactosePercent ? `${fmt2(parseFloat(m.lactosePercent), 2)}%` : "—",
                m.sccThousands ?? "—",
                m.antibioticResidueTestResult ?? "—",
              ])}
              emptyMsg="No milk records for this enterprise in the selected year"
            />
          )}

          {section === "feed" && (
            <MiniTable
              headers={["Date", "Feed Type", "Quantity (kg)", "Supplier", "Batch No."]}
              rows={feed.map((f: any) => [
                fmtDate(f.feedDate),
                f.feedType,
                f.quantityKg ? fmt2(parseFloat(f.quantityKg), 0) : "—",
                f.supplier ?? "—",
                f.batchNumber ?? "—",
              ])}
              emptyMsg="No feed records for this enterprise in the selected year"
            />
          )}
        </div>
      )}
    </div>
  );
}

function buildSeasonPrintDoc(data: any, year: number): string {
  const { farm, farmSummary, arableFields, livestockHerds } = data;
  const avgYield = farmSummary.arable.totalAreaHarvestedHa > 0
    ? farmSummary.arable.totalYieldTonnes / farmSummary.arable.totalAreaHarvestedHa
    : 0;

  let arableHtml = `
<div class="section-head">Arable Summary — Crop Year ${year}</div>
<table>
<thead><tr><th>Field</th><th>Ref</th><th>Area (ha)</th><th>Crop / Variety</th><th>Drilling Date</th><th>Harvest Date</th><th>Yield (t)</th><th>Yield (t/ha)</th><th>Moisture %</th><th>Mach. Hrs</th><th>Labour Hrs</th><th>Ops Cost</th><th>Spray Apps</th></tr></thead>
<tbody>
${arableFields.map((f: any) => {
  const crop = f.assignments.map((a: any) => `${a.cropName}${a.cropVariety ? ` (${a.cropVariety})` : ""}`).join(", ") || "—";
  const drillDate = f.drilling.length > 0 ? fmtDate(f.drilling[0].drillingDate) : (f.assignments.length > 0 && f.assignments[0].plantingDate ? fmtDate(f.assignments[0].plantingDate) : "—");
  const harvestDate = f.harvests.length > 0 ? fmtDate(f.harvests[0].harvestDate) : "—";
  const moisture = f.harvests.length > 0 && f.harvests[0].moisturePercent ? `${fmt2(parseFloat(f.harvests[0].moisturePercent), 1)}%` : "—";
  return `<tr>
<td>${f.field.name}</td>
<td>${f.field.fieldReference ?? "—"}</td>
<td>${fmt2(parseFloat(f.field.areaHectares ?? "0"), 2)}</td>
<td>${crop}</td>
<td>${drillDate}</td>
<td>${harvestDate}</td>
<td>${f.summary.totalYieldTonnes > 0 ? fmt2(f.summary.totalYieldTonnes, 2) : "—"}</td>
<td>${f.summary.yieldTHa > 0 ? fmt2(f.summary.yieldTHa, 2) : "—"}</td>
<td>${moisture}</td>
<td>${f.summary.totalMachineHours > 0 ? fmt2(f.summary.totalMachineHours, 1) : "—"}</td>
<td>${f.summary.totalLabourHours > 0 ? fmt2(f.summary.totalLabourHours, 1) : "—"}</td>
<td>${f.summary.machineCostPence > 0 ? fmtPence(f.summary.machineCostPence) : "—"}</td>
<td>${f.summary.sprayCount}</td>
</tr>`;
}).join("")}
<tr style="background:#1a3a1a;color:#fff;font-weight:700;">
<td colspan="2">TOTALS</td>
<td>${fmt2(farmSummary.arable.totalCroppedAreaHa, 2)}</td>
<td>—</td><td>—</td><td>—</td>
<td>${farmSummary.arable.totalYieldTonnes > 0 ? fmt2(farmSummary.arable.totalYieldTonnes, 2) : "—"}</td>
<td>${avgYield > 0 ? fmt2(avgYield, 2) : "—"}</td>
<td>—</td>
<td>${farmSummary.arable.totalMachineHours > 0 ? fmt2(farmSummary.arable.totalMachineHours, 1) : "—"}</td>
<td>${farmSummary.arable.totalLabourHours > 0 ? fmt2(farmSummary.arable.totalLabourHours, 1) : "—"}</td>
<td>${farmSummary.arable.totalMachCostPence > 0 ? fmtPence(farmSummary.arable.totalMachCostPence) : "—"}</td>
<td>${farmSummary.arable.totalSprayApps}</td>
</tr>
</tbody>
</table>`;

  arableFields.forEach((f: any) => {
    if (f.sprays.length === 0) return;
    arableHtml += `
<div class="section-head" style="margin-top:14px">${f.field.name} — Spray Applications</div>
<table>
<thead><tr><th>Date</th><th>Product</th><th>Category</th><th>Rate</th><th>Area (ha)</th><th>Water Vol (L)</th><th>Operator</th><th>Reason</th></tr></thead>
<tbody>
${f.sprays.map((s: any) => `<tr>
<td>${fmtDate(s.applicationDate)}</td>
<td>${s.productName ?? "—"}</td>
<td>${s.category ?? "—"}</td>
<td>${s.applicationRate ? `${fmt2(parseFloat(s.applicationRate), 3)} ${s.rateUnit ?? ""}`.trim() : "—"}</td>
<td>${s.areaSprayedHa ? fmt2(parseFloat(s.areaSprayedHa), 2) : "—"}</td>
<td>${s.waterVolumeLitres ? fmt2(parseFloat(s.waterVolumeLitres), 0) : "—"}</td>
<td>${s.operatorName ?? "—"}</td>
<td>${s.reasonForApplication ?? "—"}</td>
</tr>`).join("")}
</tbody></table>`;
  });

  let livestockHtml = "";
  if (livestockHerds.length > 0) {
    livestockHtml += `<div class="section-head" style="margin-top:18px">Livestock & Dairy Summary — ${year}</div>
<table>
<thead><tr><th>Enterprise</th><th>Type / Breed</th><th>Herd No.</th><th>Movements In</th><th>Movements Out</th><th>Mortalities</th><th>Medicine Records</th><th>Total Milk (L)</th><th>Total Feed (kg)</th></tr></thead>
<tbody>
${livestockHerds.map((h: any) => `<tr>
<td>${h.herd.name}</td>
<td>${h.herd.type ? herdSpeciesDisplayLabel(h.herd.type) + (herdProductionSubtype(h.herd.type) ? ` (${herdProductionSubtype(h.herd.type)})` : "") : "—"}${h.herd.breed ? ` / ${h.herd.breed}` : ""}</td>
<td>${h.herd.herdNumber ?? "—"}</td>
<td>${h.summary.movementIn}</td>
<td>${h.summary.movementOut}</td>
<td>${h.summary.deaths}</td>
<td>${h.summary.medicineCount}</td>
<td>${h.summary.totalMilkLitres > 0 ? Math.round(h.summary.totalMilkLitres).toLocaleString("en-GB") : "—"}</td>
<td>${h.summary.totalFeedKg > 0 ? Math.round(h.summary.totalFeedKg).toLocaleString("en-GB") : "—"}</td>
</tr>`).join("")}
</tbody></table>`;
  }

  return buildProReport({
    title: `Season Report — ${year}`,
    subtitle: `Full-season field and livestock summary for crop year ${year}`,
    farmName: farm?.name,
    cphNumber: farm?.cphNumber,
    tableHtml: arableHtml + livestockHtml,
    landscape: true,
    footerNote: `Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} · BDE Farm Trac · Barnett Davies Enterprises Ltd`,
  });
}

export default function SeasonReportsPage() {
  const { farmId: currentFarmId } = useAppStore();
  const farmId = currentFarmId;
  const [, navigateTo] = useLocation();
  const { farmRecord: srFarmRecord } = useFarmMeta(farmId ?? 0);
  const [tab, setTab] = usePersistedTab<Tab>({ page: "season-reports", farmId, validIds: SEASON_REPORTS_TAB_IDS, defaultTab: "arable" });
  const [year, setYear] = usePersistedNumberFilter({ page: "season-reports", filter: "year", farmId, defaultValue: new Date().getFullYear(), isValid: n => n >= 2000 && n <= 2100 });

  const { data: yearsData } = useQuery<{ years: number[] }>({
    queryKey: ["season-report-years", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/available-years`).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["season-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/season-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: fiveInFiveSummary } = useQuery<any>({
    queryKey: ["blackgrass-five-in-five-summary", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/blackgrass-five-in-five/summary`).then(r => r.ok ? r.json() : null),
    enabled: !!farmId,
  });

  const { data: ipmPlansRaw } = useQuery<any[]>({
    queryKey: ["ipm-plans-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ipm-plans`).then(r => r.json()).then(d => d.plans ?? d.records ?? []),
    enabled: !!farmId,
  });

  const { data: oaCertRaw } = useQuery<any[]>({
    queryKey: ["oa-cert-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-arable/certification`).then(r => r.ok ? r.json().then((d: any) => d.records ?? []) : []),
    enabled: !!farmId,
  });
  const { data: oaConvRaw } = useQuery<any[]>({
    queryKey: ["oa-conv-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-arable/field-conversion`).then(r => r.ok ? r.json().then((d: any) => d.records ?? []) : []),
    enabled: !!farmId,
  });
  const { data: oaHarvestRaw } = useQuery<any[]>({
    queryKey: ["oa-harvest-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-arable/harvest-declarations`).then(r => r.ok ? r.json().then((d: any) => d.records ?? []) : []),
    enabled: !!farmId,
  });
  const { data: oaInputRaw } = useQuery<any[]>({
    queryKey: ["oa-input-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-arable/input-records`).then(r => r.ok ? r.json().then((d: any) => d.records ?? []) : []),
    enabled: !!farmId,
  });

  const availableYears = useMemo(() => {
    if (!yearsData?.years?.length) return [new Date().getFullYear()];
    return yearsData.years;
  }, [yearsData]);

  const arableFields: any[] = data?.arableFields ?? [];
  const livestockHerds: any[] = data?.livestockHerds ?? [];
  const farmSummary = data?.farmSummary;
  const avgYield = farmSummary?.arable?.totalAreaHarvestedHa > 0
    ? farmSummary.arable.totalYieldTonnes / farmSummary.arable.totalAreaHarvestedHa
    : 0;

  const ipmPlans: any[] = ipmPlansRaw ?? [];
  const ipmPlansForYear = ipmPlans.filter(p => p.planYear === year || String(p.planYear) === String(year));
  const ipmAllPlansWithYear = ipmPlans.filter(p => p.planYear != null);

  const oaCert: any[] = oaCertRaw ?? [];
  const oaConv: any[] = oaConvRaw ?? [];
  const oaHarvest: any[] = oaHarvestRaw ?? [];
  const oaInput: any[] = oaInputRaw ?? [];
  const oaHarvestForYear = oaHarvest.filter(h => {
    const d = h.harvestDate || h.declarationDate || h.date || "";
    return d && new Date(d).getFullYear() === year;
  });
  const oaInputForYear = oaInput.filter(i => {
    const d = i.applicationDate || i.recordDate || i.date || "";
    return d && new Date(d).getFullYear() === year;
  });
  const certifiedCount = oaConv.filter(c => c.status === "certified" || c.conversionStatus === "certified").length;
  const inConversionCount = oaConv.filter(c => c.status === "in_conversion" || c.conversionStatus === "in_conversion").length;
  const latestCert = oaCert.length > 0 ? oaCert[oaCert.length - 1] : null;

  function handlePrint() {
    if (!data) return;
    const html = buildSeasonPrintDoc(data, year);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.addEventListener("afterprint", () => win.close()); win.print(); }, 600);
  }

  return (
    <AppLayout title="Season Reports">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileBarChart2 className="w-6 h-6 text-green-700" />
            <div>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a3a1a", margin: 0 }}>Season Reports</h1>
              <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0 }}>Field-by-field and enterprise-level review for the selected crop year</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Select value={String(year)} onValueChange={v => setYear(parseInt(v))}>
              <SelectTrigger style={{ width: 110 }}><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!data || isLoading}>
              <Printer className="w-4 h-4 mr-1.5" />Print Report
            </Button>
          </div>
        </div>

        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 10, color: "#6b7280" }}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading season data…</span>
          </div>
        )}

        {isError && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span style={{ fontSize: "0.85rem" }}>Failed to load season report data. Please try again.</span>
          </div>
        )}

        {!isLoading && !isError && (data || tab === "ipm" || tab === "organic" || tab === "forage") && (
          <>
            {(farmSummary != null || tab === "ipm" || tab === "organic" || tab === "forage") && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: "1.25rem" }}>
                {tab === "arable" && farmSummary ? (
                  <>
                    <StatCard label="Fields in Crop" value={String(farmSummary.arable.fieldCount)} sub={`${fmt2(farmSummary.arable.totalCroppedAreaHa, 1)} ha total`} />
                    <StatCard label="Total Harvested" value={farmSummary.arable.totalYieldTonnes > 0 ? `${fmt2(farmSummary.arable.totalYieldTonnes, 1)} t` : "—"} sub={farmSummary.arable.totalAreaHarvestedHa > 0 ? `from ${fmt2(farmSummary.arable.totalAreaHarvestedHa, 1)} ha` : undefined} />
                    <StatCard label="Average Yield" value={avgYield > 0 ? `${fmt2(avgYield, 2)} t/ha` : "—"} color="#0f766e" bg="#f0fdfa" border="#99f6e4" />
                    <StatCard label="Total Machine Hrs" value={farmSummary.arable.totalMachineHours > 0 ? fmt2(farmSummary.arable.totalMachineHours, 1) : "—"} sub={farmSummary.arable.totalLabourHours > 0 ? `${fmt2(farmSummary.arable.totalLabourHours, 1)} labour hrs` : undefined} color="#d97706" bg="#fffbeb" border="#fde68a" />
                    <StatCard label="Operations Cost" value={farmSummary.arable.totalMachCostPence > 0 ? fmtPence(farmSummary.arable.totalMachCostPence) : "—"} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
                    <StatCard label="Spray Applications" value={String(farmSummary.arable.totalSprayApps)} color="#0f766e" bg="#f0fdfa" border="#99f6e4" />
                  </>
                ) : tab === "livestock" && farmSummary ? (
                  <>
                    <StatCard label="Enterprises" value={String(farmSummary.livestock.herdCount)} color="#92400e" bg="#fffbeb" border="#fde68a" />
                    <StatCard label="Total Movements" value={String(farmSummary.livestock.totalMovements)} color="#166534" bg="#f0fdf4" border="#bbf7d0" />
                    <StatCard label="Medicine Records" value={String(farmSummary.livestock.totalMedicineRecords)} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
                    <StatCard label="Total Milk (L)" value={farmSummary.livestock.totalMilkLitres > 0 ? Math.round(farmSummary.livestock.totalMilkLitres).toLocaleString("en-GB") : "—"} color="#3b82f6" bg="#eff6ff" border="#bfdbfe" />
                  </>
                ) : tab === "ipm" ? (
                  <>
                    <StatCard label={`Plans — ${year}`} value={String(ipmPlansForYear.length)} sub={ipmPlans.length > ipmPlansForYear.length ? `${ipmPlans.length} total` : undefined} />
                    <StatCard label="Active" value={String(ipmPlansForYear.filter((p: any) => p.status === "active").length)} color="#166534" bg="#f0fdf4" border="#bbf7d0" />
                    <StatCard label="Review Due" value={String(ipmPlansForYear.filter((p: any) => p.status === "review_due" || p.status === "review").length)} color="#d97706" bg="#fffbeb" border="#fde68a" />
                    <StatCard label="All Years" value={String(ipmAllPlansWithYear.length)} sub="plans on file" color="#6b7280" bg="#f9fafb" border="#e5e7eb" />
                  </>
                ) : tab === "organic" ? (
                  <>
                    <StatCard label="Certified Fields" value={String(certifiedCount)} color="#166534" bg="#f0fdf4" border="#bbf7d0" />
                    <StatCard label="In Conversion" value={String(inConversionCount)} color="#d97706" bg="#fffbeb" border="#fde68a" />
                    <StatCard label={`Harvests ${year}`} value={String(oaHarvestForYear.length)} color="#0f766e" bg="#f0fdfa" border="#99f6e4" />
                    <StatCard label={`Inputs ${year}`} value={String(oaInputForYear.length)} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
                  </>
                ) : tab === "forage" && data?.forageSummary ? (
                  <>
                    <StatCard label="Straw Batches" value={String(data.forageSummary.strawBatchCount)} sub={data.forageSummary.strawTotalBales > 0 ? `${data.forageSummary.strawTotalBales} bales in` : undefined} color="#92400e" bg="#fffbeb" border="#fde68a" />
                    <StatCard label="Straw Remaining" value={String(data.forageSummary.strawBalesRemaining)} sub="bales" color="#d97706" bg="#fff7ed" border="#fed7aa" />
                    <StatCard label="Silage Entries" value={String(data.forageSummary.silageEntries)} sub={data.forageSummary.silageTotalTonnes > 0 ? `${fmt2(data.forageSummary.silageTotalTonnes, 1)} t` : undefined} color="#166534" bg="#f0fdf4" border="#bbf7d0" />
                    <StatCard label="Haylage Batches" value={String(data.forageSummary.haylageEntries)} color="#0f766e" bg="#f0fdfa" border="#99f6e4" />
                  </>
                ) : null}
              </div>
            )}

            <TabBar>
              <TabButton active={tab === "arable"} onClick={() => setTab("arable")}>
                <Wheat className="w-4 h-4 mr-1.5" />Arable &amp; Cropping
                {farmSummary && <span style={{ marginLeft: 6, fontSize: "0.72rem", background: tab === "arable" ? "#fff" : "#e5e7eb", color: tab === "arable" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }}>{farmSummary.arable.fieldCount}</span>}
              </TabButton>
              <TabButton active={tab === "livestock"} onClick={() => setTab("livestock")}>
                <Beef className="w-4 h-4 mr-1.5" />Livestock &amp; Dairy
                {farmSummary && <span style={{ marginLeft: 6, fontSize: "0.72rem", background: tab === "livestock" ? "#fff" : "#e5e7eb", color: tab === "livestock" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }}>{farmSummary.livestock.herdCount}</span>}
              </TabButton>
              <TabButton active={tab === "ipm"} onClick={() => setTab("ipm")}>
                <Bug className="w-4 h-4 mr-1.5" />IPM Plans
                {ipmPlansForYear.length > 0 && <span style={{ marginLeft: 6, fontSize: "0.72rem", background: tab === "ipm" ? "#fff" : "#e5e7eb", color: tab === "ipm" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }}>{ipmPlansForYear.length}</span>}
              </TabButton>
              <TabButton active={tab === "organic"} onClick={() => setTab("organic")}>
                <Leaf className="w-4 h-4 mr-1.5" />Organic Arable
                {oaConv.length > 0 && <span style={{ marginLeft: 6, fontSize: "0.72rem", background: tab === "organic" ? "#fff" : "#e5e7eb", color: tab === "organic" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }}>{oaConv.length}</span>}
              </TabButton>
              <TabButton active={tab === "forage"} onClick={() => setTab("forage")}>
                <Sprout className="w-4 h-4 mr-1.5" />Forage &amp; Straw
                {data?.forageSummary && (data.forageSummary.strawBatchCount + data.forageSummary.silageEntries) > 0 && (
                  <span style={{ marginLeft: 6, fontSize: "0.72rem", background: tab === "forage" ? "#fff" : "#e5e7eb", color: tab === "forage" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }}>{data.forageSummary.strawBatchCount + data.forageSummary.silageEntries}</span>
                )}
              </TabButton>
            </TabBar>

            {tab === "arable" && (
              <div style={{ marginTop: "1rem" }}>
                {fiveInFiveSummary && fiveInFiveSummary.totalRiskFields > 0 && (
                  <div style={{ marginBottom: "1.25rem", borderRadius: 10, border: "1px solid #d1fae5", background: "#f0fdf4", overflow: "hidden" }}>
                    <div style={{ padding: "0.75rem 1rem", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Sprout className="w-4 h-4" />
                        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Black-grass Five-in-Five — Farm Rollup</span>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                        {fiveInFiveSummary.fieldsMeetingTarget}/{fiveInFiveSummary.totalRiskFields} fields meeting {fiveInFiveSummary.targetPillarCount}+ pillars
                      </span>
                    </div>
                    <div style={{ padding: "0.9rem 1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                      {fiveInFiveSummary.fields.map((f: any) => {
                        const strong = f.distinctPillarCount >= 4;
                        const moderate = f.distinctPillarCount >= 2 && f.distinctPillarCount < 4;
                        const dotColor = strong ? "#16a34a" : moderate ? "#d97706" : "#dc2626";
                        const recs: any[] = f.recommendations ?? [];
                        return (
                          <div key={f.fieldId} style={{ padding: "0.5rem 0.7rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.8rem" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#1f2937" }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                                {f.fieldName}
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {f.moaRepetitionRisk && <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />}
                                <span style={{ fontWeight: 700, color: "#374151" }}>{f.distinctPillarCount}/5</span>
                              </span>
                            </div>
                            {recs.length > 0 && (
                              <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px dashed #e5e7eb", display: "flex", flexDirection: "column", gap: 3 }}>
                                {recs.slice(0, 3).map((r: any) => (
                                  <span key={r.key} style={{ fontSize: "0.72rem", color: r.severity === "high" ? "#b91c1c" : r.severity === "medium" ? "#b45309" : "#1d4ed8" }}>
                                    • {r.title}
                                  </span>
                                ))}
                                {recs.length > 3 && (
                                  <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>+{recs.length - 3} more recommendation{recs.length - 3 === 1 ? "" : "s"}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {arableFields.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
                    <Wheat className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p style={{ fontWeight: 500, color: "#374151", marginBottom: 4 }}>No arable data for {year}</p>
                    <p style={{ fontSize: "0.82rem" }}>Field operations, spray records, and harvest data logged in {year} will appear here.</p>
                  </div>
                ) : (
                  arableFields.map((f: any) => <FieldCard key={f.field.id} fieldData={f} defaultOpen={arableFields.length === 1} />)
                )}
              </div>
            )}

            {tab === "livestock" && (
              <div style={{ marginTop: "1rem" }}>
                <FarmSettingsWarning
                  missingFields={[
                    ...(!srFarmRecord?.cphNumber || String(srFarmRecord.cphNumber).trim() === "" ? ["CPH Number"] : []),
                    ...(!srFarmRecord?.sbiNumber || String(srFarmRecord.sbiNumber).trim() === "" ? ["SBI Number"] : []),
                    ...(
                      (!srFarmRecord?.herdMark || String(srFarmRecord.herdMark).trim() === "") &&
                      (!srFarmRecord?.flockMark || String(srFarmRecord.flockMark).trim() === "") &&
                      (!srFarmRecord?.pigHerdMark || String(srFarmRecord.pigHerdMark).trim() === "")
                        ? ["Herd / Flock Mark"]
                        : []
                    ),
                  ]}
                  settingsSection="Livestock"
                  onNavigate={() => navigateTo("/settings/farm")}
                />
                {livestockHerds.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
                    <Beef className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p style={{ fontWeight: 500, color: "#374151", marginBottom: 4 }}>No livestock data for {year}</p>
                    <p style={{ fontSize: "0.82rem" }}>Movements, medicine treatments, and milk records logged in {year} will appear here.</p>
                  </div>
                ) : (
                  livestockHerds.map((h: any) => <HerdCard key={h.herd.id} herdData={h} />)
                )}
              </div>
            )}

            {tab === "ipm" && (
              <div style={{ marginTop: "1rem" }}>
                {ipmPlans.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
                    <Bug className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p style={{ fontWeight: 500, color: "#374151", marginBottom: 4 }}>No IPM plans found</p>
                    <p style={{ fontSize: "0.82rem" }}>Create an IPM plan under <strong>Sprays &amp; Inputs → IPM</strong> to start recording monitoring observations and threshold breaches.</p>
                  </div>
                ) : (
                  <>
                    {ipmPlansForYear.length === 0 && ipmPlans.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: "1rem", fontSize: "0.85rem", color: "#92400e" }}>
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        No IPM plans recorded for {year}. Showing all plans below.
                      </div>
                    )}
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ padding: "0.75rem 1rem", background: "#1a3a1a", display: "flex", alignItems: "center", gap: 8 }}>
                        <Bug className="w-4 h-4 text-green-300" />
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
                          IPM Plans {ipmPlansForYear.length > 0 ? `— ${year}` : "— All Years"}
                        </span>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f9fafb" }}>
                            {["Plan Name", "Year", "Status", "Agronomist", "Valid From", "Valid To", "Review Date"].map(h => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(ipmPlansForYear.length > 0 ? ipmPlansForYear : ipmPlans).map((p: any, i: number) => {
                            const statusColor = p.status === "active" ? { color: "#166534", bg: "#dcfce7" } :
                              p.status === "review_due" || p.status === "review" ? { color: "#92400e", bg: "#fef3c7" } :
                              p.status === "expired" ? { color: "#991b1b", bg: "#fee2e2" } :
                              { color: "#6b7280", bg: "#f3f4f6" };
                            const fmtD = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                            return (
                              <tr key={p.id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.85rem" }}>
                                  {p.name || p.planName || p.cropType || `Plan #${p.id}`}
                                </td>
                                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{p.planYear ?? "—"}</td>
                                <td style={{ padding: "10px 12px" }}>
                                  {p.status ? (
                                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600, background: statusColor.bg, color: statusColor.color }}>
                                      {p.status.replace(/_/g, " ")}
                                    </span>
                                  ) : "—"}
                                </td>
                                <td style={{ padding: "10px 12px", color: "#374151", fontSize: "0.82rem" }}>{p.agronomist || p.agronomistName || "—"}</td>
                                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{fmtD(p.validFrom || p.startDate)}</td>
                                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{fmtD(p.validTo || p.endDate)}</td>
                                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{fmtD(p.reviewDate)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "1rem", padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: "0.82rem", color: "#166534" }}>
                      <FlaskConical className="w-4 h-4 flex-shrink-0" />
                      <span>Pest threshold entries and monitoring log observations are recorded under <strong>Sprays &amp; Inputs → IPM</strong>. Use the monitoring log as evidence for SFI CIPM actions.</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "organic" && (
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {latestCert && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <CheckCircle2 className="w-4 h-4 text-green-700" />
                      <span style={{ fontWeight: 600, color: "#14532d", fontSize: "0.9rem" }}>Organic Certification</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, fontSize: "0.82rem" }}>
                      {[
                        ["Certification Body", latestCert.certificationBody || latestCert.body || "—"],
                        ["Certificate Number", latestCert.certificationNumber || latestCert.certNumber || "—"],
                        ["Standard", latestCert.standard || latestCert.certificationStandard || "—"],
                        ["Expiry", latestCert.expiryDate ? new Date(latestCert.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
                      ].map(([label, val]) => (
                        <div key={label as string}>
                          <p style={{ color: "#6b7280", fontSize: "0.72rem", margin: "0 0 2px" }}>{label}</p>
                          <p style={{ fontWeight: 600, color: "#15803d", margin: 0 }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {oaConv.length > 0 && (
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "0.65rem 1rem", background: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                      <Leaf className="w-4 h-4 text-green-200" />
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>Field Conversion Status</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          {["Field / Parcel", "Area (ha)", "Status", "Conversion Start", "Certified From", "Notes"].map(h => (
                            <th key={h} style={{ padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {oaConv.map((c: any, i: number) => {
                          const st = c.status || c.conversionStatus || "";
                          const stColor = st.includes("certified") ? "#166534" : st.includes("conversion") ? "#92400e" : "#6b7280";
                          const stBg = st.includes("certified") ? "#dcfce7" : st.includes("conversion") ? "#fef3c7" : "#f3f4f6";
                          const fmtD = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                          return (
                            <tr key={c.id ?? i} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }}>{c.fieldName || c.parcelRef || c.field || `Field ${i + 1}`}</td>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{c.areaHa != null ? fmt2(c.areaHa, 2) : "—"}</td>
                              <td style={{ padding: "8px 12px" }}>
                                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600, background: stBg, color: stColor }}>{st ? st.replace(/_/g, " ") : "—"}</span>
                              </td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{fmtD(c.conversionStartDate || c.startDate)}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{fmtD(c.certifiedFromDate || c.certifiedFrom)}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem", maxWidth: 200 }}>{c.notes || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {oaHarvestForYear.length > 0 && (
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "0.65rem 1rem", background: "#0f766e", display: "flex", alignItems: "center", gap: 8 }}>
                      <Tractor className="w-4 h-4 text-teal-200" />
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>Harvest Declarations — {year}</span>
                      <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#99f6e4" }}>{oaHarvestForYear.length} record{oaHarvestForYear.length !== 1 ? "s" : ""}</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          {["Harvest Date", "Crop", "Field / Parcel", "Yield (t)", "Buyer / Destination", "Declaration Ref"].map(h => (
                            <th key={h} style={{ padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {oaHarvestForYear.map((h: any, i: number) => {
                          const d = h.harvestDate || h.declarationDate || h.date || "";
                          return (
                            <tr key={h.id ?? i} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</td>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }}>{h.cropType || h.crop || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{h.fieldName || h.parcelRef || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{h.yieldTonnes != null ? fmt2(h.yieldTonnes, 2) : "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{h.buyerName || h.buyer || h.destination || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{h.declarationRef || h.reference || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {oaInputForYear.length > 0 && (
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "0.65rem 1rem", background: "#7c3aed", display: "flex", alignItems: "center", gap: 8 }}>
                      <FlaskConical className="w-4 h-4 text-purple-200" />
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>Input Records — {year}</span>
                      <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#ddd6fe" }}>{oaInputForYear.length} record{oaInputForYear.length !== 1 ? "s" : ""}</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          {["Date", "Product", "Active Substance", "MAPP / PCS No.", "Quantity", "Field / Crop"].map(h => (
                            <th key={h} style={{ padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {oaInputForYear.map((inp: any, i: number) => {
                          const d = inp.applicationDate || inp.recordDate || inp.date || "";
                          return (
                            <tr key={inp.id ?? i} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</td>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }}>{inp.productName || inp.product || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{inp.activeSubstance || inp.activeName || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{inp.mappNumber || inp.pcsNumber || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{inp.quantity != null ? `${inp.quantity} ${inp.unit || inp.uom || ""}`.trim() : "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{inp.fieldName || inp.cropType || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {oaConv.length === 0 && oaHarvestForYear.length === 0 && oaInputForYear.length === 0 && !latestCert && (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
                    <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p style={{ fontWeight: 500, color: "#374151", marginBottom: 4 }}>No organic arable records found</p>
                    <p style={{ fontSize: "0.82rem" }}>Add field conversion status, harvest declarations and approved input records under <strong>Organic Arable</strong> in the main menu.</p>
                  </div>
                )}
              </div>
            )}

            {tab === "forage" && (
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* ── Straw Bale Inventory ──────────────────────────────────── */}
                {data?.strawBales && data.strawBales.length > 0 ? (
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "0.65rem 1rem", background: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
                      <Wheat className="w-4 h-4 text-amber-200" />
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>Straw Bale Inventory — {year}</span>
                      <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#fde68a" }}>{data.strawBales.length} batch{data.strawBales.length !== 1 ? "es" : ""}</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          {["Batch Ref", "Type", "Format", "Harvest", "Bales In", "Remaining", "Storage", "Biomass"].map(h => (
                            <th key={h} style={{ padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.strawBales.map((b: any, i: number) => (
                          <tr key={b.id ?? i} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                            <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }}>{b.batchRef ?? `Batch ${i + 1}`}</td>
                            <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{b.strawType ?? "—"}</td>
                            <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{b.baleFormat ?? "—"}</td>
                            <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{b.harvestDate ? new Date(b.harvestDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</td>
                            <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{b.quantityBales ?? "—"}</td>
                            <td style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
                              <span style={{ color: (b.quantityRemaining ?? b.quantityBales) > 0 ? "#166534" : "#6b7280", fontWeight: 600 }}>{b.quantityRemaining ?? b.quantityBales ?? "—"}</span>
                            </td>
                            <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{b.storageLocation ?? "—"}</td>
                            <td style={{ padding: "8px 12px", fontSize: "0.82rem" }}>{b.biomassContract ? <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600, background: "#dcfce7", color: "#166534" }}>Yes</span> : <span style={{ color: "#9ca3af" }}>—</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1.25rem 1.5rem", textAlign: "center" }}>
                    <Wheat className="w-8 h-8 mx-auto mb-2 text-amber-400 opacity-60" />
                    <p style={{ fontWeight: 500, color: "#92400e", marginBottom: 4, fontSize: "0.9rem" }}>No straw bale inventory for {year}</p>
                    <p style={{ fontSize: "0.8rem", color: "#d97706" }}>Add batches under Straw Management.</p>
                  </div>
                )}

                {/* ── Silage & Haylage Stock ────────────────────────────────── */}
                {data?.silageStock && data.silageStock.length > 0 ? (
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "0.65rem 1rem", background: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                      <Sprout className="w-4 h-4 text-green-200" />
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>Silage &amp; Haylage Stock — {year}</span>
                      <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#bbf7d0" }}>{data.silageStock.length} entr{data.silageStock.length !== 1 ? "ies" : "y"}</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          {["Type", "Cut", "Source Field", "Harvest", "Qty In", "Used", "Remaining", "DM%", "Clamp"].map(h => (
                            <th key={h} style={{ padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.silageStock.map((s: any, i: number) => {
                          const isBales = s.quantityBales != null;
                          const qtyIn = isBales ? `${s.quantityBales ?? 0} bales` : s.quantityTonnes != null ? `${fmt2(parseFloat(String(s.quantityTonnes)), 1)} t` : "—";
                          const used = isBales ? `${s.usedBales ?? 0} bales` : `${fmt2(s.usedTonnes ?? 0, 1)} t`;
                          const rem = isBales ? (s.remainingBales != null ? `${s.remainingBales} bales` : "—") : (s.remainingTonnes != null ? `${fmt2(parseFloat(String(s.remainingTonnes)), 1)} t` : "—");
                          const low = isBales ? (s.quantityBales && (s.remainingBales ?? s.quantityBales) / s.quantityBales < 0.2) : (s.quantityTonnes && (s.remainingTonnes ?? s.quantityTonnes) / parseFloat(String(s.quantityTonnes)) < 0.2);
                          return (
                            <tr key={s.id ?? i} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }}>{s.cropType ?? "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{s.cutNumber ? `${s.cutNumber}` : "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{s.fieldOfOrigin ?? "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{s.harvestDate ? new Date(s.harvestDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{qtyIn}</td>
                              <td style={{ padding: "8px 12px", color: "#d97706", fontSize: "0.82rem" }}>{used}</td>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: low ? "#dc2626" : "#166534", fontSize: "0.82rem" }}>{rem}</td>
                              <td style={{ padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }}>{s.dryMatterPercent != null ? `${s.dryMatterPercent}%` : "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }}>{s.storeName ?? "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1.25rem 1.5rem", textAlign: "center" }}>
                    <Sprout className="w-8 h-8 mx-auto mb-2 text-green-400 opacity-60" />
                    <p style={{ fontWeight: 500, color: "#166534", marginBottom: 4, fontSize: "0.9rem" }}>No silage or haylage stock recorded for {year}</p>
                    <p style={{ fontSize: "0.8rem", color: "#15803d" }}>Log cuts via Silage &amp; Haylage in the Environmental module or via the mobile app.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
