import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Printer, Loader2, Wheat, Sprout, Droplets,
  Tractor, Fuel, FlaskConical, Scale, BarChart2,
  Leaf, CloudRain, AlertCircle, Calendar,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportData {
  assignment: {
    id: number;
    fieldId: number;
    varietyId: number;
    plantingDate: string | null;
    expectedHarvestDate: string | null;
    seedRate: string | null;
    seedUnit: string | null;
    season: string | null;
    year: number | null;
    notes: string | null;
    fieldName: string;
    fieldReference: string | null;
    areaHectares: string | null;
    soilType: string | null;
    isOrganic: boolean | null;
    isNvz: boolean | null;
    cropName: string;
    varietyName: string | null;
    cropCategory: string | null;
  };
  sprays: Array<{
    id: number;
    applicationDate: string;
    productName: string;
    activeIngredient: string | null;
    category: string | null;
    applicationRate: string | null;
    rateUnit: string | null;
    areaSprayedHa: string | null;
    waterVolumeLitres: string | null;
    operatorName: string | null;
    equipmentUsed: string | null;
    reasonForApplication: string | null;
    growthStage: string | null;
    targetCrop: string | null;
    bufferZoneMetres: string | null;
    notes: string | null;
  }>;
  operations: Array<{
    id: number;
    operationDate: string;
    operationType: string;
    vehicleDescription: string | null;
    implement: string | null;
    workingDepthCm: number | null;
    passes: number | null;
    areaHa: string | null;
    operator: string | null;
    machineHours: string | null;
    labourHours: string | null;
    machineRatePence: number | null;
    labourRatePence: number | null;
    isContractor: boolean;
    contractorName: string | null;
    contractorCostPence: number | null;
    notes: string | null;
  }>;
  fertiliser: Array<{
    id: number;
    applicationDate: string;
    productName: string;
    productType: string;
    nitrogenKgHa: string;
    areaAppliedHa: string;
    totalNitrogenKg: string;
    applicationMethod: string | null;
    notes: string | null;
  }>;
  seedDrilling: Array<{
    id: number;
    drillingDate: string;
    cropName: string;
    variety: string | null;
    seedLotNumber: string | null;
    seedRate: string | null;
    seedRateUnit: string | null;
    isTreated: boolean;
    treatmentProduct: string | null;
    operator: string | null;
    areaSeededHa: string | null;
  }>;
  fuelUsage: Array<{
    id: number;
    usageDate: string;
    quantityLitres: string;
    purpose: string;
    vehicleName: string | null;
    tankName: string | null;
    notes: string | null;
  }>;
  harvests: Array<{
    id: number;
    harvestDate: string;
    startTime: string | null;
    endTime: string | null;
    operatorName: string | null;
    yieldTonnes: string | null;
    areaHarvestedHa: string | null;
    moisturePercent: string | null;
    qualityGrade: string | null;
    notes: string | null;
    isOrganicCertified: boolean;
    organicCertRef: string | null;
  }>;
  soilTests: Array<{
    id: number;
    sampleDate: string;
    sampleReference: string | null;
    laboratory: string | null;
    status: string;
    sampleDepthCm: number | null;
    sampledBy: string | null;
    notes: string | null;
    results: Array<{
      nutrient: string;
      value: string | null;
      unit: string | null;
      index: string | null;
      status: string | null;
    }>;
  }>;
  sisterFields: Array<{
    id: number;
    fieldName: string;
    fieldReference: string | null;
    areaHectares: string | null;
    plantingDate: string | null;
    expectedHarvestDate: string | null;
    totalYieldTonnes: number;
    yieldTha: number | null;
  }>;
  summary: {
    totalYieldTonnes: number;
    yieldTha: number | null;
    totalAreaHarvestedHa: number;
    totalSprayApplications: number;
    totalOperations: number;
    totalMachineHours: number;
    totalLabourHours: number;
    totalMachineCostPence: number;
    totalLabourCostPence: number;
    totalFuelLitres: number;
    totalNitrogenKg: number;
  };
  generatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtCost = (pence: number) => pence === 0 ? "—" : `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const n = (v: string | number | null | undefined, dp = 2) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = parseFloat(String(v));
  return isNaN(num) ? "—" : num.toFixed(dp);
};

const SectionHeader = ({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
    <span className="text-green-700">{icon}</span>
    <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase">{title}</h3>
    {count !== undefined && <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>}
  </div>
);

const Badge = ({ children, color = "gray" }: { children: React.ReactNode; color?: "green" | "amber" | "red" | "gray" | "blue" | "violet" }) => {
  const cls: Record<string, string> = {
    green: "bg-green-100 text-green-800 border-green-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    red: "bg-red-100 text-red-800 border-red-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
  };
  return <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cls[color]}`}>{children}</span>;
};

const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th className={`px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200 ${right ? "text-right" : "text-left"}`}>{children}</th>
);
const Td = ({ children, right, mono, colSpan }: { children?: React.ReactNode; right?: boolean; mono?: boolean; colSpan?: number }) => (
  <td colSpan={colSpan} className={`px-3 py-2 text-xs text-gray-700 border-b border-gray-100 ${right ? "text-right" : ""} ${mono ? "font-mono" : ""}`}>{children ?? null}</td>
);

const EmptySection = ({ msg }: { msg: string }) => (
  <p className="text-xs text-gray-400 italic py-3">{msg}</p>
);

// ── Print styles (injected once) ──────────────────────────────────────────────

const PRINT_STYLE_ID = "crop-season-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      body > *:not(#crop-season-report-print-root) { display: none !important; }
      #crop-season-report-print-root { display: block !important; position: fixed; inset: 0; overflow: auto; background: white; z-index: 99999; padding: 24px; }
      .no-print { display: none !important; }
      table { page-break-inside: avoid; }
      .report-section { page-break-inside: avoid; margin-bottom: 20px; }
    }
  `;
  document.head.appendChild(style);
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  assignmentId: number | null;
  onClose: () => void;
}

export default function CropSeasonReport({ assignmentId, onClose }: Props) {
  const { farmId } = useAppStore();
  const safeFarmId = farmId ?? 0;

  const { data, isLoading, isError } = useQuery<ReportData>({
    queryKey: ["crop-season-report", safeFarmId, assignmentId],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/crop-season-report?assignmentId=${assignmentId}`)
        .then(r => { if (!r.ok) throw new Error("Failed to load report"); return r.json(); }),
    enabled: !!farmId && !!assignmentId,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => { ensurePrintStyle(); }, []);

  const handlePrint = () => {
    const root = document.getElementById("crop-season-report-root");
    if (root) {
      const clone = root.cloneNode(true) as HTMLElement;
      clone.id = "crop-season-report-print-root";
      document.body.appendChild(clone);
      window.print();
      document.body.removeChild(clone);
    }
  };

  const open = assignmentId !== null;

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent
        className="max-w-5xl p-0 flex flex-col gap-0"
        style={{ maxHeight: "92vh", overflow: "hidden" }}
        aria-describedby={undefined}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-100 flex-shrink-0 no-print">
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Season Production Report
              </DialogTitle>
              {data && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {data.assignment.fieldName} · {data.assignment.cropName}{data.assignment.varietyName ? ` (${data.assignment.varietyName})` : ""} · {data.assignment.year ?? "—"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 no-print">
                <Printer className="w-3.5 h-3.5" />Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Compiling season report…</span>
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-center py-20 gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Could not load report data.</span>
            </div>
          )}

          {data && (
            <div id="crop-season-report-root" className="p-6 space-y-6">

              {/* ── HEADER ── */}
              <div className="report-section rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-green-700 text-white px-6 py-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="text-xl font-bold">{data.assignment.fieldName}</h1>
                      <p className="text-green-200 text-sm mt-0.5">
                        {data.assignment.cropName}{data.assignment.varietyName ? ` — ${data.assignment.varietyName}` : ""}
                        {data.assignment.year ? ` · ${data.assignment.year} Season` : ""}
                        {data.assignment.season ? ` · ${data.assignment.season}` : ""}
                      </p>
                    </div>
                    <div className="text-right text-xs text-green-200">
                      <p>Generated {fmt(data.generatedAt)}</p>
                      {data.assignment.fieldReference && <p>Ref: {data.assignment.fieldReference}</p>}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  {[
                    ["Field Area", data.assignment.areaHectares ? `${parseFloat(String(data.assignment.areaHectares)).toFixed(2)} ha` : "—"],
                    ["Soil Type", data.assignment.soilType ?? "—"],
                    ["NVZ Status", data.assignment.isNvz ? "NVZ — Nitrate Vulnerable Zone" : "Not in NVZ"],
                    ["Organic Status", data.assignment.isOrganic ? "Organic" : "Conventional"],
                    ["Planted", fmt(data.assignment.plantingDate)],
                    ["Expected Harvest", fmt(data.assignment.expectedHarvestDate)],
                    ["Seed Rate", data.assignment.seedRate ? `${data.assignment.seedRate} ${data.assignment.seedUnit ?? ""}` : "—"],
                    ["Season Notes", data.assignment.notes ?? "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-gray-500 font-medium min-w-[110px]">{label}:</span>
                      <span className="text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SUMMARY KPIs ── */}
              <div className="report-section">
                <SectionHeader icon={<BarChart2 className="w-4 h-4" />} title="Season Summary" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Yield", value: data.summary.totalYieldTonnes > 0 ? `${data.summary.totalYieldTonnes.toFixed(2)} t` : "—", sub: data.summary.yieldTha !== null ? `${data.summary.yieldTha.toFixed(2)} t/ha` : undefined, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
                    { label: "Spray Applications", value: String(data.summary.totalSprayApplications), color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
                    { label: "Machine Hours", value: data.summary.totalMachineHours > 0 ? `${data.summary.totalMachineHours.toFixed(1)} hr` : "—", sub: data.summary.totalLabourHours > 0 ? `${data.summary.totalLabourHours.toFixed(1)} hr labour` : undefined, color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
                    { label: "Total N Applied", value: data.summary.totalNitrogenKg > 0 ? `${data.summary.totalNitrogenKg.toFixed(0)} kg` : "—", color: "#0369a1", bg: "#eff6ff", border: "#bfdbfe" },
                    { label: "Fuel Used", value: data.summary.totalFuelLitres > 0 ? `${data.summary.totalFuelLitres.toFixed(0)} L` : "—", color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
                    { label: "Field Operations", value: String(data.summary.totalOperations), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
                    { label: "Machine Cost", value: fmtCost(data.summary.totalMachineCostPence), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
                    { label: "Labour Cost", value: fmtCost(data.summary.totalLabourCostPence), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
                  ].map(({ label, value, sub, color, bg, border }) => (
                    <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "10px 14px" }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6b7280", margin: "0 0 3px" }}>{label}</p>
                      <p style={{ fontSize: "1.15rem", fontWeight: 800, color, margin: 0, lineHeight: 1.1 }}>{value}</p>
                      {sub && <p style={{ fontSize: "0.65rem", color: "#6b7280", margin: "2px 0 0" }}>{sub}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── DRILLING ── */}
              <div className="report-section">
                <SectionHeader icon={<Sprout className="w-4 h-4" />} title="Seed Drilling & Planting" count={data.seedDrilling.length} />
                {data.seedDrilling.length === 0 ? <EmptySection msg="No seed drilling records found for this season." /> : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr>
                        <Th>Date</Th><Th>Crop</Th><Th>Variety</Th><Th right>Seed Rate</Th><Th right>Area (ha)</Th><Th>Treated?</Th><Th>Operator</Th><Th>Lot No.</Th>
                      </tr></thead>
                      <tbody>
                        {data.seedDrilling.map(r => (
                          <tr key={r.id}>
                            <Td>{fmt(r.drillingDate)}</Td>
                            <Td>{r.cropName}</Td>
                            <Td>{r.variety ?? "—"}</Td>
                            <Td right mono>{r.seedRate ? `${n(r.seedRate)} ${r.seedRateUnit ?? ""}` : "—"}</Td>
                            <Td right mono>{n(r.areaSeededHa)}</Td>
                            <Td>{r.isTreated ? <Badge color="amber">Treated{r.treatmentProduct ? ` — ${r.treatmentProduct}` : ""}</Badge> : "No"}</Td>
                            <Td>{r.operator ?? "—"}</Td>
                            <Td>{r.seedLotNumber ?? "—"}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── FIELD OPERATIONS ── */}
              <div className="report-section">
                <SectionHeader icon={<Tractor className="w-4 h-4" />} title="Field Operations" count={data.operations.length} />
                {data.operations.length === 0 ? <EmptySection msg="No field operations recorded for this season." /> : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr>
                        <Th>Date</Th><Th>Operation</Th><Th>Vehicle / Implement</Th><Th right>Depth</Th><Th right>Area (ha)</Th><Th right>Machine Hrs</Th><Th right>Labour Hrs</Th><Th right>Cost</Th><Th>Operator</Th>
                      </tr></thead>
                      <tbody>
                        {data.operations.map(op => {
                          const machineCost = op.isContractor && op.contractorCostPence ? op.contractorCostPence
                            : (op.machineHours && op.machineRatePence ? parseFloat(op.machineHours) * op.machineRatePence : 0);
                          const labourCost = op.labourHours && op.labourRatePence ? parseFloat(op.labourHours) * op.labourRatePence : 0;
                          const totalCost = machineCost + labourCost;
                          return (
                            <tr key={op.id}>
                              <Td>{fmt(op.operationDate)}</Td>
                              <Td><span className="font-medium text-gray-900">{op.operationType}</span>{op.passes && op.passes > 1 ? <span className="text-gray-400 ml-1">×{op.passes}</span> : null}</Td>
                              <Td>{[op.vehicleDescription, op.implement].filter(Boolean).join(" / ") || "—"}</Td>
                              <Td right mono>{op.workingDepthCm ? `${op.workingDepthCm} cm` : "—"}</Td>
                              <Td right mono>{n(op.areaHa)}</Td>
                              <Td right mono>{n(op.machineHours)}</Td>
                              <Td right mono>{n(op.labourHours)}</Td>
                              <Td right>{totalCost > 0 ? fmtCost(totalCost) : op.isContractor ? <Badge color="amber">Contractor</Badge> : "—"}</Td>
                              <Td>{op.isContractor ? op.contractorName ?? "Contractor" : op.operator ?? "—"}</Td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <Td><span className="font-semibold text-gray-700">Totals</span></Td>
                          <Td></Td><Td></Td><Td></Td><Td></Td>
                          <Td right mono><span className="font-semibold">{data.summary.totalMachineHours.toFixed(1)}</span></Td>
                          <Td right mono><span className="font-semibold">{data.summary.totalLabourHours.toFixed(1)}</span></Td>
                          <Td right><span className="font-semibold">{fmtCost(data.summary.totalMachineCostPence + data.summary.totalLabourCostPence)}</span></Td>
                          <Td></Td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* ── FERTILISER ── */}
              <div className="report-section">
                <SectionHeader icon={<Droplets className="w-4 h-4" />} title="Fertiliser Applications" count={data.fertiliser.length} />
                {data.fertiliser.length === 0 ? <EmptySection msg="No fertiliser applications recorded for this season." /> : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr>
                        <Th>Date</Th><Th>Product</Th><Th>Type</Th><Th>Method</Th><Th right>N Rate (kg/ha)</Th><Th right>Area (ha)</Th><Th right>Total N (kg)</Th>
                      </tr></thead>
                      <tbody>
                        {data.fertiliser.map(r => (
                          <tr key={r.id}>
                            <Td>{fmt(r.applicationDate)}</Td>
                            <Td><span className="font-medium text-gray-900">{r.productName}</span></Td>
                            <Td><Badge color="blue">{r.productType}</Badge></Td>
                            <Td>{r.applicationMethod ?? "—"}</Td>
                            <Td right mono>{n(r.nitrogenKgHa)}</Td>
                            <Td right mono>{n(r.areaAppliedHa)}</Td>
                            <Td right mono><span className="font-medium">{n(r.totalNitrogenKg)}</span></Td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <Td colSpan={6}><span className="font-semibold text-gray-700">Total Nitrogen</span></Td>
                          <Td right mono><span className="font-semibold">{data.summary.totalNitrogenKg.toFixed(1)} kg</span></Td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* ── SPRAYS ── */}
              <div className="report-section">
                <SectionHeader icon={<Leaf className="w-4 h-4" />} title="Spray Applications" count={data.sprays.length} />
                {data.sprays.length === 0 ? <EmptySection msg="No spray applications recorded for this season." /> : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr>
                        <Th>Date</Th><Th>Product</Th><Th>Category</Th><Th>Active Ingredient</Th><Th right>Rate</Th><Th right>Area (ha)</Th><Th right>Water (L)</Th><Th>Growth Stage</Th><Th>Operator</Th><Th>Equipment</Th>
                      </tr></thead>
                      <tbody>
                        {data.sprays.map(s => (
                          <tr key={s.id}>
                            <Td>{fmt(s.applicationDate)}</Td>
                            <Td><span className="font-medium text-gray-900">{s.productName}</span>{s.reasonForApplication ? <div className="text-gray-400 text-[10px] italic">{s.reasonForApplication}</div> : null}</Td>
                            <Td>{s.category ? <Badge color="violet">{s.category}</Badge> : "—"}</Td>
                            <Td>{s.activeIngredient ?? "—"}</Td>
                            <Td right mono>{s.applicationRate ? `${n(s.applicationRate, 3)} ${s.rateUnit ?? ""}` : "—"}</Td>
                            <Td right mono>{n(s.areaSprayedHa)}</Td>
                            <Td right mono>{n(s.waterVolumeLitres, 0)}</Td>
                            <Td>{s.growthStage ?? "—"}</Td>
                            <Td>{s.operatorName ?? "—"}</Td>
                            <Td>{s.equipmentUsed ?? "—"}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── FUEL ── */}
              {data.fuelUsage.length > 0 && (
                <div className="report-section">
                  <SectionHeader icon={<Fuel className="w-4 h-4" />} title="Fuel Usage" count={data.fuelUsage.length} />
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr>
                        <Th>Date</Th><Th>Purpose</Th><Th>Vehicle</Th><Th>Tank</Th><Th right>Quantity (L)</Th>
                      </tr></thead>
                      <tbody>
                        {data.fuelUsage.map(f => (
                          <tr key={f.id}>
                            <Td>{fmt(f.usageDate)}</Td>
                            <Td>{f.purpose}</Td>
                            <Td>{f.vehicleName ?? "—"}</Td>
                            <Td>{f.tankName ?? "—"}</Td>
                            <Td right mono>{n(f.quantityLitres, 1)}</Td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <Td colSpan={4}><span className="font-semibold text-gray-700">Total Fuel</span></Td>
                          <Td right mono><span className="font-semibold">{data.summary.totalFuelLitres.toFixed(1)} L</span></Td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* ── HARVEST ── */}
              <div className="report-section">
                <SectionHeader icon={<Wheat className="w-4 h-4" />} title="Harvest Results" count={data.harvests.length} />
                {data.harvests.length === 0 ? <EmptySection msg="No harvest records logged for this assignment." /> : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr>
                        <Th>Date</Th><Th>Operator</Th><Th right>Yield (t)</Th><Th right>Area (ha)</Th><Th right>Yield t/ha</Th><Th right>Moisture %</Th><Th>Grade</Th><Th>Organic</Th><Th>Notes</Th>
                      </tr></thead>
                      <tbody>
                        {data.harvests.map(h => {
                          const yieldTha = h.yieldTonnes && h.areaHarvestedHa
                            ? parseFloat(h.yieldTonnes) / parseFloat(h.areaHarvestedHa)
                            : null;
                          return (
                            <tr key={h.id}>
                              <Td>{fmt(h.harvestDate)}</Td>
                              <Td>{h.operatorName ?? "—"}</Td>
                              <Td right mono><span className="font-semibold text-green-700">{n(h.yieldTonnes)}</span></Td>
                              <Td right mono>{n(h.areaHarvestedHa)}</Td>
                              <Td right mono>{yieldTha !== null ? yieldTha.toFixed(2) : "—"}</Td>
                              <Td right mono>{n(h.moisturePercent, 1)}</Td>
                              <Td>{h.qualityGrade ? <Badge color="green">{h.qualityGrade}</Badge> : "—"}</Td>
                              <Td>{h.isOrganicCertified ? <Badge color="green">Organic{h.organicCertRef ? ` · ${h.organicCertRef}` : ""}</Badge> : "No"}</Td>
                              <Td>{h.notes ?? "—"}</Td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {data.harvests.length > 1 && (
                        <tfoot>
                          <tr className="bg-gray-50">
                            <Td colSpan={2}><span className="font-semibold text-gray-700">Total</span></Td>
                            <Td right mono><span className="font-semibold text-green-700">{data.summary.totalYieldTonnes.toFixed(2)}</span></Td>
                            <Td right mono><span className="font-semibold">{data.summary.totalAreaHarvestedHa.toFixed(2)}</span></Td>
                            <Td right mono><span className="font-semibold">{data.summary.yieldTha !== null ? data.summary.yieldTha.toFixed(2) : "—"}</span></Td>
                            <Td></Td><Td></Td><Td></Td><Td></Td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
              </div>

              {/* ── SOIL TESTS ── */}
              {data.soilTests.length > 0 && (
                <div className="report-section">
                  <SectionHeader icon={<FlaskConical className="w-4 h-4" />} title="Soil Test Profile (Most Recent)" count={data.soilTests.length} />
                  <div className="space-y-3">
                    {data.soilTests.map(test => (
                      <div key={test.id} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-xs text-gray-800"><Calendar className="w-3 h-3 inline mr-1 text-gray-400" />{fmt(test.sampleDate)}</span>
                          {test.sampleReference && <Badge color="gray">Ref: {test.sampleReference}</Badge>}
                          {test.laboratory && <Badge color="blue">Lab: {test.laboratory}</Badge>}
                          {test.sampleDepthCm && <Badge color="gray">{test.sampleDepthCm} cm depth</Badge>}
                          {test.sampledBy && <span className="text-xs text-gray-500">by {test.sampledBy}</span>}
                        </div>
                        {test.results.length > 0 ? (
                          <table className="w-full text-xs">
                            <thead><tr>
                              <Th>Nutrient</Th><Th right>Value</Th><Th>Unit</Th><Th>Index</Th><Th>Status</Th>
                            </tr></thead>
                            <tbody>
                              {test.results.map((r, i) => (
                                <tr key={i}>
                                  <Td><span className="font-medium">{r.nutrient}</span></Td>
                                  <Td right mono>{r.value ?? "—"}</Td>
                                  <Td>{r.unit ?? "—"}</Td>
                                  <Td>{r.index ? <Badge color="green">Index {r.index}</Badge> : "—"}</Td>
                                  <Td>{r.status ? <Badge color={r.status.toLowerCase().includes("low") ? "amber" : r.status.toLowerCase().includes("high") ? "red" : "green"}>{r.status}</Badge> : "—"}</Td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-xs text-gray-400 italic px-4 py-3">Test results not yet recorded.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CROSS-FIELD COMPARISON ── */}
              {data.sisterFields.length > 0 && (
                <div className="report-section">
                  <SectionHeader
                    icon={<Scale className="w-4 h-4" />}
                    title={`${data.assignment.cropName}${data.assignment.varietyName ? ` (${data.assignment.varietyName})` : ""} — All Fields This Season`}
                    count={data.sisterFields.length + 1}
                  />
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr>
                        <Th>Field</Th><Th>Ref.</Th><Th right>Field Area (ha)</Th><Th right>Yield (t)</Th><Th right>Yield (t/ha)</Th><Th>Notes</Th>
                      </tr></thead>
                      <tbody>
                        {/* This field first */}
                        <tr className="bg-green-50">
                          <Td><span className="font-semibold text-green-800">{data.assignment.fieldName} ★</span></Td>
                          <Td>{data.assignment.fieldReference ?? "—"}</Td>
                          <Td right mono>{n(data.assignment.areaHectares)}</Td>
                          <Td right mono><span className="font-semibold text-green-700">{data.summary.totalYieldTonnes > 0 ? data.summary.totalYieldTonnes.toFixed(2) : "—"}</span></Td>
                          <Td right mono><span className="font-semibold text-green-700">{data.summary.yieldTha !== null ? data.summary.yieldTha.toFixed(2) : "—"}</span></Td>
                          <Td>—</Td>
                        </tr>
                        {data.sisterFields.map(s => (
                          <tr key={s.id}>
                            <Td>{s.fieldName}</Td>
                            <Td>{s.fieldReference ?? "—"}</Td>
                            <Td right mono>{n(s.areaHectares)}</Td>
                            <Td right mono>{s.totalYieldTonnes > 0 ? s.totalYieldTonnes.toFixed(2) : "—"}</Td>
                            <Td right mono>{s.yieldTha !== null ? s.yieldTha.toFixed(2) : "—"}</Td>
                            <Td>—</Td>
                          </tr>
                        ))}
                        <tfoot>
                          <tr className="bg-gray-50">
                            <Td colSpan={3}><span className="font-semibold text-gray-700">Farm Total</span></Td>
                            <Td right mono>
                              <span className="font-semibold">
                                {(data.summary.totalYieldTonnes + data.sisterFields.reduce((s, f) => s + f.totalYieldTonnes, 0)).toFixed(2)}
                              </span>
                            </Td>
                            <Td></Td><Td></Td>
                          </tr>
                        </tfoot>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── FOOTER ── */}
              <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2">
                  <CloudRain className="w-3 h-3" />
                  <span>BDE Farm Trac — Season Production Report — {data.assignment.fieldName} — {data.assignment.cropName}{data.assignment.varietyName ? ` (${data.assignment.varietyName})` : ""} — {data.assignment.year}</span>
                </div>
                <p className="mt-0.5">Generated {new Date(data.generatedAt).toLocaleString("en-GB")}</p>
              </div>

            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
