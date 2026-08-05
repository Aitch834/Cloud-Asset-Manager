import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Badge } from "@/components/ui/badge";
import {
  Fuel, Plus, AlertTriangle, CheckCircle2, XCircle, Droplets,
  Truck, ClipboardCheck, Gauge, ShieldAlert, Trash2, Zap,
  Flame, Wind, Edit2, Plug, ChevronDown, ChevronRight, ClipboardList,
  Eye, Paperclip, Filter, X as XIcon, ExternalLink, Camera, FileText,
  Sun, PoundSterling, Files, Upload, MapPin
} from "lucide-react";
import { SelectGroup, SelectLabel } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area } from "recharts";
import { useUpload } from "@workspace/object-storage-web";
import { IMPLEMENT_TYPES } from "@/lib/equipmentTypes";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";

function getCropYear(date: Date): { label: string; start: Date; end: Date } {
  const aug = new Date(date.getFullYear(), 7, 1);
  const startYear = date >= aug ? date.getFullYear() : date.getFullYear() - 1;
  return {
    label: `${startYear}/${String(startYear + 1).slice(-2)}`,
    start: new Date(startYear, 7, 1),
    end: new Date(startYear + 1, 6, 31, 23, 59, 59),
  };
}
function buildCropYearOptions(): { label: string; start: Date; end: Date }[] {
  const now = new Date();
  const options: { label: string; start: Date; end: Date }[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(now.getFullYear() - i, now.getMonth(), 1);
    const cy = getCropYear(d);
    if (!options.find(o => o.label === cy.label)) options.push(cy);
  }
  return options;
}

type Tab = "tanks" | "deliveries" | "usage" | "inspections" | "grid-energy" | "solar" | "reports";

const TECH_TYPES = [
  { value: "solar_pv", label: "Solar PV (Photovoltaic)" },
  { value: "wind_turbine", label: "Wind Turbine" },
  { value: "hydro", label: "Hydroelectric" },
  { value: "biomass_boiler", label: "Biomass Boiler" },
  { value: "anaerobic_digester", label: "Anaerobic Digester (AD)" },
  { value: "other", label: "Other" },
];

const FUEL_TYPES = [
  "red_diesel", "white_diesel", "heating_oil", "lpg_bulk", "lpg_bottles",
  "AdBlue", "petrol", "other"
];
const FUEL_TYPE_LABELS: Record<string, string> = {
  red_diesel: "Red Diesel (Gas Oil)",
  white_diesel: "Road Diesel (DERV)",
  heating_oil: "Heating Oil (Kerosene)",
  lpg_bulk: "LPG — Bulk Tank (Calor / Flogas)",
  lpg_bottles: "LPG — Bottled / Cylinder",
  AdBlue: "AdBlue",
  petrol: "Petrol",
  other: "Other",
};
const FUEL_TYPE_REGS: Record<string, string> = {
  red_diesel: "Oil Storage Regs 2001 + HMRC Fuel Duty",
  white_diesel: "HMRC Fuel Duty",
  heating_oil: "Oil Storage Regs 2001",
  lpg_bulk: "DSEAR 2002 / HSE LPGR + UKLPG CoP",
  lpg_bottles: "DSEAR 2002 / HSE — store upright in ventilated cage",
  AdBlue: "No fuel duty implications",
  petrol: "HMRC Fuel Duty",
};
const QUALIFYING_ACTIVITIES = [
  "agriculture", "forestry", "horticulture", "commercial_fishing", "rail", "non_commercial"
];

const METER_TYPES = [
  { value: "electricity", label: "Electricity (Grid)", icon: "⚡", unit: "kWh" },
  { value: "natural_gas", label: "Natural Gas (Grid)", icon: "🔥", unit: "kWh / m³" },
  { value: "lpg_mains", label: "LPG Mains Network", icon: "🔥", unit: "kWh / kg" },
];

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function fmtL(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  return `${parseFloat(String(v)).toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`;
}
function fmtKwh(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  return `${parseFloat(String(v)).toLocaleString("en-GB", { maximumFractionDigits: 0 })} kWh`;
}
function fmtCost(p: number | null | undefined) {
  if (!p) return "—";
  return `£${(p / 100).toFixed(2)}`;
}
function pct(current: string | number, capacity: string | number) {
  const c = parseFloat(String(current));
  const cap = parseFloat(String(capacity));
  if (!cap) return 0;
  return Math.min(100, Math.round((c / cap) * 100));
}

function TankGauge({ current, capacity }: { current: string | number; capacity: string | number }) {
  const p = pct(current, capacity);
  const colour = p < 20 ? "#ef4444" : p < 40 ? "#f97316" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2" style={{ minWidth: 80 }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${p}%`, background: colour }} />
      </div>
      <span className="text-xs font-medium" style={{ color: colour }}>{p}%</span>
    </div>
  );
}

function ResultBadge({ result }: { result: string }) {
  if (result === "pass") return <Badge className="text-xs" style={{ background: "#d1fae5", color: "#065f46", border: "none" }}>Pass</Badge>;
  if (result === "advisory") return <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>Advisory</Badge>;
  return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Fail</Badge>;
}

function CheckRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-50">
      <span className="text-xs text-gray-600">{label}</span>
      {value
        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
        : <XCircle className="w-4 h-4 text-red-500" />
      }
    </div>
  );
}

function MeterTypeIcon({ type }: { type: string }) {
  if (type === "electricity") return <Zap className="w-5 h-5 text-yellow-500" />;
  if (type === "natural_gas") return <Flame className="w-5 h-5 text-orange-500" />;
  if (type === "lpg_mains") return <Flame className="w-5 h-5 text-blue-500" />;
  return <Plug className="w-5 h-5 text-gray-400" />;
}

const QA_LABELS: Record<string, string> = {
  agriculture: "Agriculture",
  forestry: "Forestry",
  horticulture: "Horticulture",
  commercial_fishing: "Commercial Fishing",
  rail: "Rail / Off-road Transport",
  non_commercial: "Non-commercial / Own use",
};

function printReport(title: string, htmlBody: string) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; color: #111; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  h2 { font-size: 14px; margin-top: 20px; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  p.meta { font-size: 11px; color: #555; margin: 0 0 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
  th { background: #f1f5f9; text-align: left; padding: 5px 8px; font-weight: 600; border-bottom: 1px solid #cbd5e1; }
  td { padding: 4px 8px; border-bottom: 1px solid #e2e8f0; }
  tr:last-child td { border-bottom: none; }
  .warn { background: #fff7ed; }
  .alert { background: #fef2f2; }
  .ok { background: #f0fdf4; }
  .total { font-weight: bold; background: #f1f5f9; }
  .footer { margin-top: 24px; font-size: 10px; color: #888; border-top: 1px solid #e2e8f0; padding-top: 8px; }
  @media print { body { margin: 12px; } }
</style></head><body>${htmlBody}
<div class="footer">Barnett Davies Enterprises Ltd — BDE Farm Trac — Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</div>
<script>window.onload = function() { window.print(); }; window.onafterprint = function() { window.close(); };<\/script>
</body></html>`);
  win.document.close();
}

function ReportsTab({
  tanks, deliveries, usages, inspections, stockChecks, readings, meters
}: {
  tanks: Record<string, unknown>[];
  deliveries: Record<string, unknown>[];
  usages: Record<string, unknown>[];
  inspections: Record<string, unknown>[];
  stockChecks: Record<string, unknown>[];
  readings: Record<string, unknown>[];
  meters: Record<string, unknown>[];
}) {
  const cropYearOptions = buildCropYearOptions();
  const [reportCropYear, setReportCropYear] = useState(cropYearOptions[0]?.label ?? "");
  const selectedCY = cropYearOptions.find(o => o.label === reportCropYear) ?? cropYearOptions[0];

  const cyDeliveries = deliveries.filter(d => {
    if (!d.deliveryDate || !selectedCY) return false;
    const dt = new Date(d.deliveryDate as string);
    return dt >= selectedCY.start && dt <= selectedCY.end;
  });
  const cyUsages = usages.filter(u => {
    if (!u.usageDate || !selectedCY) return false;
    const dt = new Date(u.usageDate as string);
    return dt >= selectedCY.start && dt <= selectedCY.end;
  });

  const totalDeliveredL = cyDeliveries.reduce((s, d) => s + parseFloat(String(d.quantityLitres ?? 0)), 0);
  const totalUsedL = cyUsages.reduce((s, u) => s + parseFloat(String(u.quantityLitres ?? 0)), 0);

  const usageByActivity: Record<string, number> = {};
  for (const u of cyUsages) {
    const k = String(u.qualifyingActivity ?? "unspecified");
    usageByActivity[k] = (usageByActivity[k] ?? 0) + parseFloat(String(u.quantityLitres ?? 0));
  }

  const discrepancies = stockChecks.filter(s => {
    const v = parseFloat(String(s.varianceLitres ?? 0));
    return v < -50;
  });

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  function printHMRC() {
    const tankMap: Record<string, string> = {};
    for (const t of tanks) tankMap[String(t.id)] = String(t.name ?? `Tank ${t.id}`);
    const meterMap: Record<string, string> = {};
    for (const m of meters) meterMap[String(m.id)] = String(m.name ?? `Meter ${m.id}`);

    const deliveryRows = cyDeliveries.map(d =>
      `<tr>
        <td>${fmtDate(d.deliveryDate as string)}</td>
        <td>${String(d.supplierName ?? "—")}</td>
        <td>${String(d.deliveryNote ?? "—")}</td>
        <td>${tankMap[String(d.tankId)] ?? "—"}</td>
        <td>${FUEL_TYPE_LABELS[String(d.fuelType)] ?? String(d.fuelType ?? "—")}</td>
        <td style="text-align:right">${parseFloat(String(d.quantityLitres ?? 0)).toLocaleString("en-GB")}</td>
        <td>${String(d.invoiceReference ?? "—")}</td>
      </tr>`
    ).join("") || "<tr><td colspan='7' style='text-align:center;color:#888'>No deliveries in this period</td></tr>";

    const usageRows = cyUsages.map(u =>
      `<tr>
        <td>${fmtDate(u.usageDate as string)}</td>
        <td>${tankMap[String(u.tankId)] ?? String(u.tankName ?? "—")}</td>
        <td>${String(u.vehicleName ?? "—")}</td>
        <td>${String(u.purpose ?? "—")}</td>
        <td>${QA_LABELS[String(u.qualifyingActivity)] ?? String(u.qualifyingActivity ?? "—")}</td>
        <td style="text-align:right">${parseFloat(String(u.quantityLitres ?? 0)).toLocaleString("en-GB")}</td>
        <td>${String(u.recordedBy ?? "—")}</td>
      </tr>`
    ).join("") || "<tr><td colspan='7' style='text-align:center;color:#888'>No usage records in this period</td></tr>";

    const summaryRows = Object.entries(usageByActivity).map(([k, v]) =>
      `<tr><td>${QA_LABELS[k] ?? k}</td><td style="text-align:right">${v.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td></tr>`
    ).join("");

    const energyRows = readings.map(r => {
      const mname = meterMap[String(r.meterId)] ?? `Meter ${r.meterId}`;
      return `<tr>
        <td>${fmtDate(r.readingDate as string)}</td>
        <td>${mname}</td>
        <td style="text-align:right">${String(r.currentReading ?? "—")}</td>
        <td style="text-align:right">${String(r.consumptionSinceLast ?? "—")}</td>
        <td>${String(r.readingType ?? "actual")}</td>
        <td>${String(r.recordedBy ?? "—")}</td>
      </tr>`;
    }).join("") || "<tr><td colspan='6' style='text-align:center;color:#888'>No energy readings recorded</td></tr>";

    const html = `
      <h1>HMRC Fuel Duty Register — Crop Year ${reportCropYear}</h1>
      <p class="meta">Farm: Barnett Davies Enterprises Ltd &nbsp;|&nbsp; Generated: ${today} &nbsp;|&nbsp; Period: ${selectedCY?.start.toLocaleDateString("en-GB")} – ${selectedCY?.end.toLocaleDateString("en-GB")}</p>
      <p class="meta" style="margin-bottom:16px">This register demonstrates qualifying use of rebated fuel (red diesel / gas oil) in accordance with HMRC Excise Notice 75. Retain for 6 years from the accounting period end.</p>

      <h2>Section 1 — Fuel Deliveries</h2>
      <table>
        <thead><tr><th>Date</th><th>Supplier</th><th>Delivery Note</th><th>Tank</th><th>Fuel Type</th><th style="text-align:right">Qty (L)</th><th>Invoice Ref</th></tr></thead>
        <tbody>${deliveryRows}</tbody>
        <tfoot><tr class="total"><td colspan="5">Total Delivered</td><td style="text-align:right">${totalDeliveredL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td><td></td></tr></tfoot>
      </table>

      <h2>Section 2 — Fuel Usage Log</h2>
      <table>
        <thead><tr><th>Date</th><th>Tank</th><th>Vehicle / Machine</th><th>Purpose / Activity</th><th>Qualifying Activity</th><th style="text-align:right">Qty (L)</th><th>Recorded By</th></tr></thead>
        <tbody>${usageRows}</tbody>
        <tfoot><tr class="total"><td colspan="5">Total Used</td><td style="text-align:right">${totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td><td></td></tr></tfoot>
      </table>

      <h2>Section 3 — Usage Summary by Qualifying Activity</h2>
      <table>
        <thead><tr><th>Qualifying Activity</th><th style="text-align:right">Litres Used</th></tr></thead>
        <tbody>${summaryRows || "<tr><td colspan='2' style='text-align:center;color:#888'>No usage records</td></tr>"}</tbody>
        <tfoot><tr class="total"><td>Total</td><td style="text-align:right">${totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td></tr></tfoot>
      </table>

      <h2>Section 4 — Grid Energy Meter Readings</h2>
      <table>
        <thead><tr><th>Date</th><th>Meter</th><th style="text-align:right">Reading</th><th style="text-align:right">Consumption</th><th>Type</th><th>Recorded By</th></tr></thead>
        <tbody>${energyRows}</tbody>
      </table>
    `;
    printReport(`HMRC Fuel Duty Register ${reportCropYear}`, html);
  }

  function printTankCompliance() {
    const inspByTank: Record<string, Record<string, unknown>[]> = {};
    for (const ins of inspections) {
      const tk = String(ins.tankId ?? "");
      if (!inspByTank[tk]) inspByTank[tk] = [];
      inspByTank[tk].push(ins);
    }

    const tankRows = tanks.map(t => {
      const bunded = t.isBunded === true || t.isBunded === "true";
      const inspDue = t.nextInspectionDue ? fmtDate(t.nextInspectionDue as string) : "Not set";
      const inspOverdue = t.nextInspectionDue && new Date(t.nextInspectionDue as string) < new Date();
      const lastInsp = (inspByTank[String(t.id)] ?? []).sort((a, b) => String(b.inspectionDate ?? "").localeCompare(String(a.inspectionDate ?? ""))).at(0);
      const lastInspDate = lastInsp ? fmtDate(lastInsp.inspectionDate as string) : "None recorded";
      const lastInspResult = lastInsp ? String(lastInsp.overallResult ?? "—") : "—";
      const cap = parseFloat(String(t.capacityLitres ?? 0));
      const osr = cap >= 200 ? (bunded ? "Compliant — bunded" : `<b style="color:#dc2626">Non-compliant — bunding required for ${cap}+ L tanks</b>`) : (bunded ? "Bunded (not required for &lt;200 L)" : "Not bunded (OK for &lt;200 L)");
      return `<tr class="${inspOverdue ? "alert" : ""}">
        <td>${String(t.name ?? "")}</td>
        <td>${FUEL_TYPE_LABELS[String(t.fuelType)] ?? String(t.fuelType ?? "")}</td>
        <td style="text-align:right">${cap.toLocaleString("en-GB")} L</td>
        <td>${String(t.location ?? "—")}</td>
        <td>${osr}</td>
        <td>${lastInspDate} — ${lastInspResult}</td>
        <td class="${inspOverdue ? "" : ""}">${inspDue}${inspOverdue ? " <b>(OVERDUE)</b>" : ""}</td>
      </tr>`;
    }).join("") || "<tr><td colspan='7' style='text-align:center;color:#888'>No tanks registered</td></tr>";

    const html = `
      <h1>Tank Compliance Summary — Red Tractor / Oil Storage Regulations 2001</h1>
      <p class="meta">Farm: Barnett Davies Enterprises Ltd &nbsp;|&nbsp; Generated: ${today}</p>
      <p class="meta" style="margin-bottom:16px">The Control of Pollution (Oil Storage) (England) Regulations 2001 require oil storage containers of 200 litres or more used at agricultural premises to be bunded. All tanks should be inspected annually. This summary demonstrates compliance with Red Tractor Assured Food Standards — Fuel Storage requirements.</p>

      <h2>Tank Register</h2>
      <table>
        <thead><tr><th>Tank Name</th><th>Fuel Type</th><th style="text-align:right">Capacity</th><th>Location</th><th>Bunding / OSR 2001</th><th>Last Inspection</th><th>Next Inspection Due</th></tr></thead>
        <tbody>${tankRows}</tbody>
      </table>

      <p><b>Legend:</b> Rows highlighted red indicate inspection is overdue. All tanks ≥200 L must be bunded under OSR 2001.</p>
    `;
    printReport("Tank Compliance Summary", html);
  }

  function printDiscrepancyReport() {
    const tankMap: Record<string, string> = {};
    for (const t of tanks) tankMap[String(t.id)] = String(t.name ?? `Tank ${t.id}`);

    const rows = discrepancies.map(s => {
      const v = Math.abs(parseFloat(String(s.varianceLitres ?? 0)));
      const isLarge = v >= 200;
      return `<tr class="${isLarge ? "alert" : "warn"}">
        <td>${fmtDate(s.checkDate as string)}</td>
        <td>${tankMap[String(s.tankId)] ?? `Tank ${s.tankId}`}</td>
        <td style="text-align:right">${parseFloat(String(s.measuredLitres ?? 0)).toLocaleString("en-GB")} L</td>
        <td style="text-align:right">${s.calculatedLitres ? parseFloat(String(s.calculatedLitres)).toLocaleString("en-GB") + " L" : "—"}</td>
        <td style="text-align:right;${isLarge ? "color:#dc2626;font-weight:bold" : "color:#d97706"}">${v.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L shortage</td>
        <td>${String(s.method ?? "dip_stick").replace("_", " ")}</td>
        <td>${String(s.checkedBy ?? "—")}</td>
        <td>${isLarge ? "Significant — investigate theft/leak" : "Investigate records"}</td>
      </tr>`;
    }).join("") || "<tr class='ok'><td colspan='8' style='text-align:center'>No significant discrepancies recorded — all stock checks within tolerance</td></tr>";

    const html = `
      <h1>Fuel Stock Discrepancy Report</h1>
      <p class="meta">Farm: Barnett Davies Enterprises Ltd &nbsp;|&nbsp; Generated: ${today}</p>
      <p class="meta" style="margin-bottom:16px">Showing all stock checks where physically measured stock is more than 50 litres below the calculated figure. Shortfalls ≥200 L are highlighted as significant and may indicate theft or a leak. Records should be retained for HMRC compliance — unexplained losses may need to be declared as misuse of rebated fuel duty relief.</p>

      <h2>Discrepancies Requiring Investigation (Shortfall &gt;50 L)</h2>
      <table>
        <thead><tr><th>Check Date</th><th>Tank</th><th style="text-align:right">Measured</th><th style="text-align:right">Expected</th><th style="text-align:right">Shortfall</th><th>Method</th><th>Checked By</th><th>Action Required</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p><b>Legend:</b> Yellow = investigate. Red = significant (≥200 L) — consider police report and HMRC notification.</p>
    `;
    printReport("Fuel Stock Discrepancy Report", html);
  }

  function printVehicleReport() {
    const tankMap: Record<string, string> = {};
    for (const t of tanks) tankMap[String(t.id)] = String(t.name ?? `Tank ${t.id}`);

    const usageByVehicle: Record<string, { litres: number; rows: Record<string, unknown>[] }> = {};
    for (const u of cyUsages) {
      const vName = String(u.vehicleName || "No vehicle / machine recorded");
      if (!usageByVehicle[vName]) usageByVehicle[vName] = { litres: 0, rows: [] };
      usageByVehicle[vName].litres += parseFloat(String(u.quantityLitres ?? 0));
      usageByVehicle[vName].rows.push(u);
    }

    const vehicleSections = Object.entries(usageByVehicle)
      .sort((a, b) => b[1].litres - a[1].litres)
      .map(([vName, data]) => {
        const detailRows = data.rows
          .sort((a, b) => String(a.usageDate ?? "").localeCompare(String(b.usageDate ?? "")))
          .map(u =>
            `<tr>
              <td>${fmtDate(u.usageDate as string)}</td>
              <td>${tankMap[String(u.tankId)] ?? String(u.tankName ?? "—")}</td>
              <td>${String(u.purpose ?? "—")}</td>
              <td>${QA_LABELS[String(u.qualifyingActivity)] ?? String(u.qualifyingActivity ?? "—")}</td>
              <td style="text-align:right">${parseFloat(String(u.quantityLitres ?? 0)).toLocaleString("en-GB")} L</td>
              <td>${String(u.recordedBy ?? "—")}</td>
            </tr>`
          ).join("");
        return `
          <h2>${vName} — ${data.litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L total</h2>
          <table>
            <thead><tr><th>Date</th><th>Tank</th><th>Purpose / Activity</th><th>Qualifying Activity</th><th style="text-align:right">Qty (L)</th><th>Recorded By</th></tr></thead>
            <tbody>${detailRows}</tbody>
            <tfoot><tr class="total"><td colspan="4">Subtotal — ${vName}</td><td style="text-align:right">${data.litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td><td></td></tr></tfoot>
          </table>`;
      }).join("");

    const summaryRows = Object.entries(usageByVehicle)
      .sort((a, b) => b[1].litres - a[1].litres)
      .map(([vName, data]) =>
        `<tr><td>${vName}</td><td style="text-align:right">${data.rows.length}</td><td style="text-align:right">${data.litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td></tr>`
      ).join("");

    const html = `
      <h1>Vehicle &amp; Machine Fuel Usage Report — Crop Year ${reportCropYear}</h1>
      <p class="meta">Farm: Barnett Davies Enterprises Ltd &nbsp;|&nbsp; Generated: ${today} &nbsp;|&nbsp; Period: ${selectedCY?.start.toLocaleDateString("en-GB")} – ${selectedCY?.end.toLocaleDateString("en-GB")}</p>
      <p class="meta" style="margin-bottom:16px">Fuel usage grouped by vehicle or machine for the selected crop year. Use this report to identify fuel costs per asset, cross-check machinery utilisation records, and support HMRC qualifying use evidence.</p>

      <h2>Summary by Vehicle / Machine</h2>
      <table>
        <thead><tr><th>Vehicle / Machine</th><th style="text-align:right">Draw-Downs</th><th style="text-align:right">Total Litres</th></tr></thead>
        <tbody>${summaryRows || "<tr><td colspan='3' style='text-align:center;color:#888'>No usage records in this period</td></tr>"}</tbody>
        <tfoot><tr class="total"><td>Grand Total</td><td style="text-align:right">${cyUsages.length}</td><td style="text-align:right">${totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</td></tr></tfoot>
      </table>

      ${vehicleSections || "<p style='color:#888'>No usage records for this crop year.</p>"}
    `;
    printReport(`Vehicle Fuel Usage Report ${reportCropYear}`, html);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Fuel & Energy Reports</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Printable compliance reports for HMRC fuel duty inspections and Red Tractor audits.
            Reports are generated from your live data and open in a new window ready to print or save as PDF.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Crop year</span>
          <select
            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
            value={reportCropYear}
            onChange={e => setReportCropYear(e.target.value)}
          >
            {cropYearOptions.map(o => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4">

        {/* HMRC */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">HMRC Fuel Duty Register</h4>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  Demonstrates qualifying use of rebated fuel (red diesel / gas oil) under HMRC Excise Notice 75.
                  Shows all deliveries, usage log with qualifying activities, usage summary by activity type, and grid energy meter readings.
                  Must be retained for 6 years.
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span><span className="font-medium text-gray-700">{cyDeliveries.length}</span> deliveries — {totalDeliveredL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L delivered</span>
                  <span><span className="font-medium text-gray-700">{cyUsages.length}</span> usage records — {totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L used</span>
                  <span>Crop year <span className="font-medium text-gray-700">{reportCropYear}</span></span>
                </div>
              </div>
            </div>
            <Button onClick={printHMRC} className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Red Tractor Tank Compliance */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Tank Compliance Summary</h4>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  Red Tractor Assured / Oil Storage Regulations 2001 compliance document. Lists all tanks with bunding status,
                  inspection history and next inspection due date. Flags overdue inspections and any non-compliant bunding.
                  Suitable for Red Tractor audits and HSE inspections.
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span><span className="font-medium text-gray-700">{tanks.length}</span> tanks registered</span>
                  <span><span className="font-medium text-gray-700">{tanks.filter(t => t.isBunded === true || t.isBunded === "true").length}</span> bunded</span>
                  <span><span className="font-medium text-gray-700">{tanks.filter(t => t.nextInspectionDue && new Date(t.nextInspectionDue as string) < new Date()).length}</span> inspections overdue</span>
                </div>
              </div>
            </div>
            <Button onClick={printTankCompliance} className="bg-green-700 hover:bg-green-800 text-white flex-shrink-0">
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Stock Discrepancy */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${discrepancies.length > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <AlertTriangle className={`w-5 h-5 ${discrepancies.length > 0 ? "text-red-500" : "text-gray-400"}`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Fuel Stock Discrepancy Log</h4>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  Shows all stock checks where physically measured stock is more than 50 litres below the calculated figure.
                  Significant shortfalls (&ge;200 L) are flagged for theft or leak investigation. Required for HMRC compliance — unexplained losses in rebated fuel
                  may need to be declared and could result in retrospective full duty liability.
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span><span className="font-medium text-gray-700">{stockChecks.length}</span> total stock checks</span>
                  <span>
                    <span className={`font-medium ${discrepancies.length > 0 ? "text-red-600" : "text-gray-700"}`}>{discrepancies.length}</span> discrepanc{discrepancies.length === 1 ? "y" : "ies"} &gt;50 L
                  </span>
                  {discrepancies.filter(s => Math.abs(parseFloat(String(s.varianceLitres ?? 0))) >= 200).length > 0 && (
                    <span className="text-red-600 font-medium">
                      {discrepancies.filter(s => Math.abs(parseFloat(String(s.varianceLitres ?? 0))) >= 200).length} significant (&ge;200 L) — urgent investigation required
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={printDiscrepancyReport} variant="outline" className="border-gray-300 flex-shrink-0">
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Vehicle Fuel Usage */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Vehicle &amp; Machine Fuel Usage</h4>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  Fuel usage broken down by vehicle or machine for the selected crop year. Includes a summary table of total litres per asset and
                  full draw-down detail for each vehicle. Useful for machinery cost analysis, operator accountability, and supporting HMRC qualifying-use evidence.
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span><span className="font-medium text-gray-700">{cyUsages.length}</span> usage records in {reportCropYear}</span>
                  <span><span className="font-medium text-gray-700">{new Set(cyUsages.map(u => String(u.vehicleName || "")).filter(Boolean)).size}</span> vehicles / machines with fuel records</span>
                </div>
              </div>
            </div>
            <Button onClick={printVehicleReport} variant="outline" className="border-gray-300 flex-shrink-0">
              Print / Save PDF
            </Button>
          </div>
        </div>

      </div>

      {/* Compliance note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
        <p className="font-semibold mb-1">HMRC Compliance Note — Rebated Fuel (Red Diesel)</p>
        <p>
          HMRC may conduct unannounced fuel duty compliance checks at any time. You must be able to produce your fuel delivery records,
          usage logs and stock reconciliation at short notice. Records must be kept for a minimum of 6 years.
          Unexplained losses or evidence of misuse of rebated fuel (e.g. using red diesel in road vehicles) may result in retrospective
          full duty assessment plus penalties. Contact your fuel duty consultant or HMRC if you have concerns.
        </p>
      </div>
    </div>
  );
}

function SolarRenewablesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}`;
  type SolarSubTab = "installations" | "generation" | "payments" | "analytics";
  const [subTab, setSubTab] = useState<SolarSubTab>("installations");
  const [analyticInstallId, setAnalyticInstallId] = useState<string>("__all__");

  const EMPTY_INSTALL = { installationName: "", technologyType: "solar_pv", installedCapacityKw: "", installationDate: "", installerName: "", installerSupplierId: null as number | null, gridConnectionRef: "", fitOrSegContractRef: "", tariffProvider: "", tariffRatePence: "", maintenanceContractor: "", maintenanceContractorSupplierId: null as number | null, nextServiceDate: "", notes: "", panelCount: "", mcsCertificateNumber: "", installerMcsNumber: "", buildingName: "", locationId: null as number | null, locationIdType: "" };
  const EMPTY_GEN = { readingDate: "", installationId: "", generationKwh: "", exportKwh: "", selfConsumedKwh: "", fitPaymentPeriod: "", fitPaymentAmount: "", meterReference: "", notes: "" };
  const EMPTY_PAYMENT = { paymentDate: "", installationId: "", periodFrom: "", periodTo: "", exportKwh: "", rateUsedPencePerKwh: "", paymentAmountPence: "", paymentReference: "", supplierName: "", notes: "" };

  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [editInstall, setEditInstall] = useState<any | null>(null);
  const [deleteInstallId, setDeleteInstallId] = useState<number | null>(null);
  const [installForm, setInstallForm] = useState<any>(EMPTY_INSTALL);
  const [docsInstall, setDocsInstall] = useState<any | null>(null);
  const [showDocsDialog, setShowDocsDialog] = useState(false);
  const [docUploadType, setDocUploadType] = useState("other");
  const [docUploadNotes, setDocUploadNotes] = useState("");
  const [locationPickerValue, setLocationPickerValue] = useState("__custom__");

  const [showGenDialog, setShowGenDialog] = useState(false);
  const [editGen, setEditGen] = useState<any | null>(null);
  const [deleteGenId, setDeleteGenId] = useState<number | null>(null);
  const [genForm, setGenForm] = useState<any>(EMPTY_GEN);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editPayment, setEditPayment] = useState<any | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<number | null>(null);
  const [paymentForm, setPaymentForm] = useState<any>(EMPTY_PAYMENT);

  const { data: installsData, isLoading: installsLoading } = useQuery({
    queryKey: ["solar-installations", farmId],
    queryFn: () => fetch(`${base}/solar-installations`).then(r => r.json()),
    enabled: !!farmId,
  });
  const installs: any[] = Array.isArray(installsData) ? installsData : [];

  const { data: installLocationsData } = useQuery({
    queryKey: ["installation-locations", farmId],
    queryFn: () => fetch(`${base}/installation-locations`).then(r => r.json()),
    enabled: !!farmId,
  });
  const installLocations = installLocationsData ?? { farmLocations: [], storageLocations: [], fields: [] };

  const { data: installerSuggestions } = useQuery({
    queryKey: ["solar-installer-suggestions", farmId],
    queryFn: () => fetch(`${base}/solar-installer-suggestions`).then(r => r.json()),
    enabled: !!farmId,
  });
  const suggestionsList: string[] = Array.isArray(installerSuggestions) ? installerSuggestions : [];

  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ["solar-install-docs", farmId, docsInstall?.id],
    queryFn: () => fetch(`${base}/solar-installations/${docsInstall!.id}/documents`).then(r => r.json()),
    enabled: !!farmId && !!docsInstall,
  });
  const installDocs: any[] = Array.isArray(docsData) ? docsData : [];

  const { data: genData, isLoading: genLoading } = useQuery({
    queryKey: ["solar-generation", farmId],
    queryFn: () => fetch(`${base}/solar-generation`).then(r => r.json()),
    enabled: !!farmId,
  });
  const genReadings: any[] = Array.isArray(genData) ? genData : [];

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["solar-payments", farmId],
    queryFn: () => fetch(`${base}/solar-export-payments`).then(r => r.json()),
    enabled: !!farmId,
  });
  const payments: any[] = Array.isArray(paymentsData) ? paymentsData : [];

  const totalCapacityKw = installs.filter(i => i.isActive !== false).reduce((s, i) => s + parseFloat(String(i.installedCapacityKw || "0")), 0);
  const currentYear = new Date().getFullYear();
  const ytdGen = genReadings.filter(r => r.readingDate && new Date(r.readingDate).getFullYear() === currentYear).reduce((s, r) => s + parseFloat(String(r.generationKwh || "0")), 0);
  const ytdExport = genReadings.filter(r => r.readingDate && new Date(r.readingDate).getFullYear() === currentYear).reduce((s, r) => s + parseFloat(String(r.exportKwh || "0")), 0);
  const ytdSegIncome = payments.filter(p => p.paymentDate && new Date(p.paymentDate).getFullYear() === currentYear).reduce((s, p) => s + (Number(p.paymentAmountPence) || 0), 0);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["solar-installations", farmId] });
    qc.invalidateQueries({ queryKey: ["solar-generation", farmId] });
    qc.invalidateQueries({ queryKey: ["solar-payments", farmId] });
  };

  const createInstallMut = useMutation({ mutationFn: (b: any) => fetch(`${base}/solar-installations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Installation added" }); qc.invalidateQueries({ queryKey: ["solar-installations", farmId] }); setShowInstallDialog(false); setInstallForm(EMPTY_INSTALL); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateInstallMut = useMutation({ mutationFn: (b: any) => fetch(`${base}/solar-installations/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Installation updated" }); qc.invalidateQueries({ queryKey: ["solar-installations", farmId] }); setShowInstallDialog(false); setEditInstall(null); setInstallForm(EMPTY_INSTALL); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteInstallMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/solar-installations/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: ["solar-installations", farmId] }); setDeleteInstallId(null); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  const { uploadFile, isUploading: isInstallDocUploading } = useUpload();
  const createDocMut = useMutation({
    mutationFn: (body: { installationId: number; documentType: string; fileName: string; storageKey: string; notes?: string }) =>
      fetch(`${base}/solar-installations/${body.installationId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Document saved" }); refetchDocs(); setDocUploadNotes(""); setDocUploadType("other"); },
    onError: () => toast({ title: "Upload failed", variant: "destructive" }),
  });
  const deleteDocMut = useMutation({
    mutationFn: ({ installId, docId }: { installId: number; docId: number }) =>
      fetch(`${base}/solar-installations/${installId}/documents/${docId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Document removed" }); refetchDocs(); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function resolveLocationName(inst: any): string {
    if (inst.locationId && inst.locationIdType) {
      const id = Number(inst.locationId);
      if (inst.locationIdType === "farm_location") {
        return (installLocations.farmLocations as any[]).find((x: any) => x.id === id)?.name ?? inst.buildingName ?? "—";
      }
      if (inst.locationIdType === "storage_location") {
        return (installLocations.storageLocations as any[]).find((x: any) => x.id === id)?.name ?? inst.buildingName ?? "—";
      }
      if (inst.locationIdType === "field") {
        return (installLocations.fields as any[]).find((x: any) => x.id === id)?.name ?? inst.buildingName ?? "—";
      }
    }
    return inst.buildingName || "—";
  }

  function pickToForm(val: string) {
    if (val === "__custom__") {
      setInstallForm((f: any) => ({ ...f, locationId: null, locationIdType: "" }));
    } else {
      const [type, id] = val.split(":");
      setInstallForm((f: any) => ({ ...f, locationId: parseInt(id), locationIdType: type, buildingName: "" }));
    }
    setLocationPickerValue(val);
  }

  const DOC_TYPES = [
    { value: "mcs_certificate", label: "MCS Certificate" },
    { value: "dno_connection", label: "DNO Connection Agreement" },
    { value: "seg_fit_contract", label: "SEG / FiT Contract" },
    { value: "installation_photo", label: "Installation Photo" },
    { value: "maintenance_report", label: "Maintenance Report" },
    { value: "other", label: "Other Document" },
  ];

  const createGenMut = useMutation({ mutationFn: (b: any) => fetch(`${base}/solar-generation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Reading logged" }); qc.invalidateQueries({ queryKey: ["solar-generation", farmId] }); setShowGenDialog(false); setGenForm(EMPTY_GEN); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateGenMut = useMutation({ mutationFn: (b: any) => fetch(`${base}/solar-generation/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Reading updated" }); qc.invalidateQueries({ queryKey: ["solar-generation", farmId] }); setShowGenDialog(false); setEditGen(null); setGenForm(EMPTY_GEN); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteGenMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/solar-generation/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: ["solar-generation", farmId] }); setDeleteGenId(null); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  const createPaymentMut = useMutation({ mutationFn: (b: any) => fetch(`${base}/solar-export-payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, paymentAmountPence: b.paymentAmountPence ? Math.round(parseFloat(b.paymentAmountPence) * 100) : 0 }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Payment recorded" }); qc.invalidateQueries({ queryKey: ["solar-payments", farmId] }); setShowPaymentDialog(false); setPaymentForm(EMPTY_PAYMENT); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updatePaymentMut = useMutation({ mutationFn: (b: any) => fetch(`${base}/solar-export-payments/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, paymentAmountPence: b.paymentAmountPence ? Math.round(parseFloat(b.paymentAmountPence) * 100) : undefined }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Payment updated" }); qc.invalidateQueries({ queryKey: ["solar-payments", farmId] }); setShowPaymentDialog(false); setEditPayment(null); setPaymentForm(EMPTY_PAYMENT); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deletePaymentMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/solar-export-payments/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: ["solar-payments", farmId] }); setDeletePaymentId(null); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  void invalidateAll;
  const techLabel = (t: string) => TECH_TYPES.find(x => x.value === t)?.label ?? t;

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Capacity</p>
          <p className="text-2xl font-bold text-gray-900">{totalCapacityKw.toFixed(2)} kW</p>
          <p className="text-xs text-gray-400">{installs.filter(i => i.isActive !== false).length} active installation{installs.filter(i => i.isActive !== false).length !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">YTD Generation</p>
          <p className="text-2xl font-bold text-amber-600">{ytdGen.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh</p>
          <p className="text-xs text-gray-400">Jan–Dec {currentYear}</p>
        </div>
        <div className="bg-white border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">YTD Export</p>
          <p className="text-2xl font-bold text-blue-600">{ytdExport.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh</p>
          <p className="text-xs text-gray-400">exported to grid</p>
        </div>
        <div className="bg-white border border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">YTD SEG Income</p>
          <p className="text-2xl font-bold text-green-700">£{(ytdSegIncome / 100).toFixed(2)}</p>
          <p className="text-xs text-gray-400">Smart Export Guarantee</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
        <Sun className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>Smart Export Guarantee (SEG)</strong> — Any farm generating electricity from a certified (MCS) installation and exporting to the grid must register with a licensed SEG provider. Payments are typically quarterly. Log your MCS certificate number, tariff provider, and SEG rate on each installation. Record quarterly payments in the Export Payments tab to track your total SEG income.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        {(["installations", "generation", "payments", "analytics"] as SolarSubTab[]).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${subTab === t ? "border-green-700 text-green-800" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t === "installations" ? `Installations (${installs.length})` : t === "generation" ? `Generation Log (${genReadings.length})` : t === "payments" ? `Export Payments (${payments.length})` : "Analytics"}
          </button>
        ))}
      </div>

      {/* ─── INSTALLATIONS ─── */}
      {subTab === "installations" && (
        <div>
          <div className="flex justify-end mb-3">
            <Button onClick={() => { setEditInstall(null); setInstallForm(EMPTY_INSTALL); setShowInstallDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
              <Plus className="w-4 h-4 mr-1" />Add Installation
            </Button>
          </div>
          {installsLoading ? <p className="text-sm text-gray-400 text-center py-10">Loading…</p> : installs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Sun className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600">No renewable energy installations registered</p>
              <p className="text-sm">Add a Solar PV array, wind turbine, or other installation to get started</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {installs.map((inst: any) => {
                const isSolar = String(inst.technologyType) === "solar_pv";
                return (
                  <div key={inst.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {isSolar ? <Sun className="w-5 h-5 text-amber-500" /> : <Wind className="w-5 h-5 text-blue-500" />}
                        <div>
                          <p className="font-semibold text-gray-900">{String(inst.installationName)}</p>
                          <p className="text-xs text-gray-400">{techLabel(String(inst.technologyType))}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" title="Manage documents" onClick={() => { setDocsInstall(inst); setShowDocsDialog(true); }}><Files className="w-3.5 h-3.5 text-blue-500" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditInstall(inst); const pv = inst.locationId && inst.locationIdType ? `${inst.locationIdType}:${inst.locationId}` : "__custom__"; setLocationPickerValue(pv); setInstallForm({ ...inst, installedCapacityKw: inst.installedCapacityKw ?? "", panelCount: inst.panelCount ?? "", tariffRatePence: inst.tariffRatePence ?? "" }); setShowInstallDialog(true); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteInstallId(Number(inst.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-gray-400">Capacity</span>
                      <span className="font-medium">{inst.installedCapacityKw ? `${parseFloat(String(inst.installedCapacityKw)).toFixed(2)} kW${isSolar ? "p" : ""}` : "—"}</span>
                      {isSolar && <><span className="text-gray-400">Panel count</span><span className="font-medium">{inst.panelCount ?? "—"}</span></>}
                      <span className="text-gray-400">Building / location</span>
                      <span className="font-medium">{resolveLocationName(inst)}</span>
                      <span className="text-gray-400">Install date</span>
                      <span className="font-medium">{inst.installationDate ? new Date(inst.installationDate).toLocaleDateString("en-GB") : "—"}</span>
                      <span className="text-gray-400">MCS cert</span>
                      <span className="font-medium">{inst.mcsCertificateNumber || "—"}</span>
                      <span className="text-gray-400">SEG / FiT rate</span>
                      <span className="font-medium">{inst.tariffRatePence ? `${parseFloat(String(inst.tariffRatePence)).toFixed(2)}p/kWh` : "—"}</span>
                      <span className="text-gray-400">Tariff provider</span>
                      <span className="font-medium">{inst.tariffProvider || "—"}</span>
                      {inst.nextServiceDate && <><span className="text-gray-400">Next service</span><span className="font-medium text-amber-600">{new Date(inst.nextServiceDate).toLocaleDateString("en-GB")}</span></>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── GENERATION LOG ─── */}
      {subTab === "generation" && (
        <div>
          <div className="flex justify-end mb-3">
            <Button onClick={() => { setEditGen(null); setGenForm(EMPTY_GEN); setShowGenDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
              <Plus className="w-4 h-4 mr-1" />Log Reading
            </Button>
          </div>
          {genLoading ? <p className="text-sm text-gray-400 text-center py-10">Loading…</p> : genReadings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600">No generation readings recorded</p>
              <p className="text-sm">Log monthly meter readings to track generation, export, and self-consumption</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Date", "Installation", "Generated (kWh)", "Exported (kWh)", "Self-used (kWh)", "FiT/SEG Period", "Payment (£)", ""].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {genReadings.map((r: any, i: number) => {
                    const inst = installs.find(x => Number(x.id) === Number(r.installationId));
                    return (
                      <tr key={r.id} className={i < genReadings.length - 1 ? "border-b border-gray-100" : ""}>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.readingDate ? new Date(r.readingDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="px-3 py-2 font-medium">{inst?.installationName ?? "—"}</td>
                        <td className="px-3 py-2 text-amber-700 font-medium">{r.generationKwh ? parseFloat(String(r.generationKwh)).toLocaleString() : "—"}</td>
                        <td className="px-3 py-2 text-blue-700">{r.exportKwh ? parseFloat(String(r.exportKwh)).toLocaleString() : "—"}</td>
                        <td className="px-3 py-2 text-green-700">{r.selfConsumedKwh ? parseFloat(String(r.selfConsumedKwh)).toLocaleString() : "—"}</td>
                        <td className="px-3 py-2 text-gray-500">{r.fitPaymentPeriod || "—"}</td>
                        <td className="px-3 py-2 font-medium text-green-700">{r.fitPaymentAmount ? `£${parseFloat(String(r.fitPaymentAmount)).toFixed(2)}` : "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditGen(r); setGenForm({ ...r, generationKwh: r.generationKwh ?? "", exportKwh: r.exportKwh ?? "", selfConsumedKwh: r.selfConsumedKwh ?? "", fitPaymentAmount: r.fitPaymentAmount ?? "", installationId: r.installationId ? String(r.installationId) : "" }); setShowGenDialog(true); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteGenId(Number(r.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── EXPORT PAYMENTS ─── */}
      {subTab === "payments" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            {payments.length > 0 && <p className="text-sm text-gray-500">YTD SEG income: <span className="font-semibold text-green-700">£{(ytdSegIncome / 100).toFixed(2)}</span></p>}
            <div className="ml-auto">
              <Button onClick={() => { setEditPayment(null); setPaymentForm(EMPTY_PAYMENT); setShowPaymentDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                <Plus className="w-4 h-4 mr-1" />Record SEG Payment
              </Button>
            </div>
          </div>
          {paymentsLoading ? <p className="text-sm text-gray-400 text-center py-10">Loading…</p> : payments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <PoundSterling className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600">No SEG payments recorded yet</p>
              <p className="text-sm">Record each quarterly Smart Export Guarantee payment received from your energy supplier</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Payment Date", "Period", "Installation", "kWh Exported", "Rate", "Amount", "Reference", "Supplier", ""].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any, i: number) => {
                    const inst = installs.find(x => Number(x.id) === Number(p.installationId));
                    const periodStr = (p.periodFrom && p.periodTo) ? `${new Date(p.periodFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${new Date(p.periodTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}` : "—";
                    return (
                      <tr key={p.id} className={i < payments.length - 1 ? "border-b border-gray-100" : ""}>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{periodStr}</td>
                        <td className="px-3 py-2 font-medium">{inst?.installationName ?? "—"}</td>
                        <td className="px-3 py-2 text-blue-700">{p.exportKwh ? parseFloat(String(p.exportKwh)).toLocaleString() : "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{p.rateUsedPencePerKwh ? `${parseFloat(String(p.rateUsedPencePerKwh)).toFixed(2)}p/kWh` : "—"}</td>
                        <td className="px-3 py-2 font-semibold text-green-700">£{((Number(p.paymentAmountPence) || 0) / 100).toFixed(2)}</td>
                        <td className="px-3 py-2 text-gray-500">{p.paymentReference || "—"}</td>
                        <td className="px-3 py-2 text-gray-500">{p.supplierName || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditPayment(p); setPaymentForm({ ...p, exportKwh: p.exportKwh ?? "", rateUsedPencePerKwh: p.rateUsedPencePerKwh ?? "", paymentAmountPence: p.paymentAmountPence ? (Number(p.paymentAmountPence) / 100).toFixed(2) : "", installationId: p.installationId ? String(p.installationId) : "" }); setShowPaymentDialog(true); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeletePaymentId(Number(p.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── ANALYTICS ─── */}
      {subTab === "analytics" && (() => {
        const filteredGen = analyticInstallId === "__all__" ? genReadings : genReadings.filter((r: any) => String(r.installationId) === analyticInstallId);
        const filteredPay = analyticInstallId === "__all__" ? payments : payments.filter((p: any) => String(p.installationId) === analyticInstallId);
        const selectedInstall = installs.find((i: any) => String(i.id) === analyticInstallId);

        const totalGenKwh = filteredGen.reduce((s: number, r: any) => s + parseFloat(String(r.generationKwh || 0)), 0);
        const totalExportKwh = filteredGen.reduce((s: number, r: any) => s + parseFloat(String(r.exportKwh || 0)), 0);
        const totalSelfKwh = filteredGen.reduce((s: number, r: any) => s + parseFloat(String(r.selfConsumedKwh || 0)), 0);
        const totalIncomeP = filteredPay.reduce((s: number, p: any) => s + (Number(p.paymentAmountPence) || 0), 0);
        const co2Saved = totalSelfKwh * 0.233;

        type MonthBucket = { month: string; label: string; generated: number; exported: number; selfUsed: number; income: number };
        const monthMap = new Map<string, MonthBucket>();

        filteredGen.forEach((r: any) => {
          if (!r.readingDate) return;
          const d = new Date(r.readingDate);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
          if (!monthMap.has(key)) monthMap.set(key, { month: key, label, generated: 0, exported: 0, selfUsed: 0, income: 0 });
          const b = monthMap.get(key)!;
          b.generated += parseFloat(String(r.generationKwh || 0));
          b.exported += parseFloat(String(r.exportKwh || 0));
          b.selfUsed += parseFloat(String(r.selfConsumedKwh || 0));
        });

        filteredPay.forEach((p: any) => {
          if (!p.paymentDate) return;
          const d = new Date(p.paymentDate);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
          if (!monthMap.has(key)) monthMap.set(key, { month: key, label, generated: 0, exported: 0, selfUsed: 0, income: 0 });
          const b = monthMap.get(key)!;
          b.income += Number(p.paymentAmountPence) / 100;
        });

        const chartData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ ...v, generated: parseFloat(v.generated.toFixed(1)), exported: parseFloat(v.exported.toFixed(1)), selfUsed: parseFloat(v.selfUsed.toFixed(1)), income: parseFloat(v.income.toFixed(2)) }));

        const hasGen = filteredGen.length > 0;
        const hasPay = filteredPay.length > 0;

        return (
          <div className="space-y-6">
            {/* Installation selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 shrink-0">Installation</label>
              <Select value={analyticInstallId} onValueChange={setAnalyticInstallId}>
                <SelectTrigger className="w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All installations (combined)</SelectItem>
                  {installs.map((i: any) => <SelectItem key={String(i.id)} value={String(i.id)}>{String(i.installationName)}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedInstall && (
                <span className="text-xs text-gray-400">{selectedInstall.installedCapacityKw ? `${parseFloat(String(selectedInstall.installedCapacityKw)).toFixed(2)} kW` : ""} · installed {selectedInstall.installationDate ? new Date(selectedInstall.installationDate).toLocaleDateString("en-GB") : "unknown"}</span>
              )}
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Generated</p>
                <p className="text-2xl font-bold text-amber-700">{totalGenKwh.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-gray-400">kWh lifetime</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Exported</p>
                <p className="text-2xl font-bold text-blue-700">{totalExportKwh.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-gray-400">kWh to grid</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">SEG / FiT Income</p>
                <p className="text-2xl font-bold text-green-700">£{(totalIncomeP / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-400">lifetime payments</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">CO₂ Avoided</p>
                <p className="text-2xl font-bold text-emerald-700">{co2Saved >= 1000 ? `${(co2Saved / 1000).toFixed(1)} t` : `${co2Saved.toFixed(0)} kg`}</p>
                <p className="text-xs text-gray-400">from self-consumed kWh</p>
              </div>
            </div>

            {/* Generation chart */}
            {!hasGen ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">No generation readings yet — log meter readings in the Generation Log tab to see charts here.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Monthly Generation — Exported vs. Self-Consumed (kWh)</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => `${v}`} tick={{ fontSize: 11 }} unit=" kWh" width={70} />
                    <Tooltip formatter={(v: number, name: string) => [`${v.toLocaleString("en-GB", { maximumFractionDigits: 1 })} kWh`, name === "exported" ? "Exported to Grid" : name === "selfUsed" ? "Self-Consumed" : "Generated"]} />
                    <Legend formatter={(v: string) => v === "exported" ? "Exported to Grid" : v === "selfUsed" ? "Self-Consumed" : "Generated"} />
                    <Bar dataKey="selfUsed" stackId="a" fill="#16a34a" name="selfUsed" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="exported" stackId="a" fill="#3b82f6" name="exported" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-2 text-center">Stacked: green = on-site use, blue = exported. Where self-consumed kWh isn't logged separately, only export is shown.</p>
              </div>
            )}

            {/* SEG / FiT income chart */}
            {!hasPay ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <PoundSterling className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">No export payments recorded yet — log quarterly SEG/FiT receipts in the Export Payments tab to see income trends here.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">SEG / FiT Income by Month (£)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={chartData.filter(d => d.income > 0)} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => `£${v.toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v: number) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "SEG / FiT Payment"]} />
                    <Area type="monotone" dataKey="income" fill="#dcfce7" stroke="#16a34a" strokeWidth={2} name="income" />
                    <Bar dataKey="income" fill="#16a34a" opacity={0.7} radius={[3, 3, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Cumulative income line */}
            {hasPay && (() => {
              let running = 0;
              const cumData = chartData.filter(d => d.income > 0).map(d => { running += d.income; return { label: d.label, cumulative: parseFloat(running.toFixed(2)) }; });
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Cumulative SEG / FiT Income (£)</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={cumData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v: number) => `£${v.toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
                      <Tooltip formatter={(v: number) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Running total"]} />
                      <Line type="monotone" dataKey="cumulative" stroke="#15803d" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* ─── INSTALLATION DIALOG ─── */}
      <Dialog open={showInstallDialog} onOpenChange={o => { if (!o) { setShowInstallDialog(false); setEditInstall(null); setInstallForm(EMPTY_INSTALL); createInstallMut.reset(); updateInstallMut.reset(); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editInstall ? "Edit Installation" : "Register New Installation"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Installation name *</Label><Input value={installForm.installationName ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, installationName: e.target.value }))} placeholder="e.g. Grain Store South Array" /></div>
              <div><Label>Technology type *</Label>
                <Select value={installForm.technologyType ?? "solar_pv"} onValueChange={v => setInstallForm((f: any) => ({ ...f, technologyType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TECH_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Capacity (kW{installForm.technologyType === "solar_pv" ? "p" : ""})</Label><Input type="number" step="0.01" value={installForm.installedCapacityKw ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, installedCapacityKw: e.target.value }))} placeholder="e.g. 49.92" /></div>
              {installForm.technologyType === "solar_pv" && <div><Label>Panel count</Label><Input type="number" value={installForm.panelCount ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, panelCount: e.target.value }))} placeholder="e.g. 144" /></div>}
            </div>
            <div>
              <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />Building / location</Label>
              <Select value={locationPickerValue} onValueChange={pickToForm}>
                <SelectTrigger><SelectValue placeholder="Select a location…" /></SelectTrigger>
                <SelectContent>
                  {(installLocations.farmLocations as any[]).length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Farm Buildings &amp; Locations</SelectLabel>
                      {(installLocations.farmLocations as any[]).map((loc: any) => (
                        <SelectItem key={`farm_location:${loc.id}`} value={`farm_location:${loc.id}`}>{loc.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {(installLocations.storageLocations as any[]).length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Storage Locations</SelectLabel>
                      {(installLocations.storageLocations as any[]).map((loc: any) => (
                        <SelectItem key={`storage_location:${loc.id}`} value={`storage_location:${loc.id}`}>{loc.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {(installLocations.fields as any[]).length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Fields</SelectLabel>
                      {(installLocations.fields as any[]).map((loc: any) => (
                        <SelectItem key={`field:${loc.id}`} value={`field:${loc.id}`}>{loc.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  <SelectItem value="__custom__">Custom / other (type below)</SelectItem>
                </SelectContent>
              </Select>
              {locationPickerValue === "__custom__" && (
                <Input className="mt-1.5" value={installForm.buildingName ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, buildingName: e.target.value }))} placeholder="e.g. Main grain store south roof" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Installation date</Label><Input type="date" value={installForm.installationDate ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, installationDate: e.target.value }))} /></div>
              <div>
                <Label>Installer name</Label>
                {farmId && <BuyerCombobox farmId={farmId} types={["contractor", "general"]} valueId={(installForm as any).installerSupplierId ?? null} valueName={installForm.installerName ?? ""} onChange={(id, name) => setInstallForm((f: any) => ({ ...f, installerSupplierId: id, installerName: name }))} />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>MCS certificate no.</Label><Input value={installForm.mcsCertificateNumber ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, mcsCertificateNumber: e.target.value }))} placeholder="MCS-..." /></div>
              <div><Label>Installer MCS no.</Label><Input value={installForm.installerMcsNumber ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, installerMcsNumber: e.target.value }))} placeholder="MCSXXXX" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>SEG / FiT tariff provider</Label><Input value={installForm.tariffProvider ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, tariffProvider: e.target.value }))} placeholder="e.g. Octopus Energy" /></div>
              <div><Label>SEG / FiT rate (p/kWh)</Label><Input type="number" step="0.01" value={installForm.tariffRatePence ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, tariffRatePence: e.target.value }))} placeholder="e.g. 7.50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>FiT / SEG contract ref</Label><Input value={installForm.fitOrSegContractRef ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, fitOrSegContractRef: e.target.value }))} /></div>
              <div><Label>DNO grid connection ref</Label><Input value={installForm.gridConnectionRef ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, gridConnectionRef: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Maintenance contractor</Label>
                {farmId && <BuyerCombobox farmId={farmId} types={["contractor", "general"]} valueId={(installForm as any).maintenanceContractorSupplierId ?? null} valueName={installForm.maintenanceContractor ?? ""} onChange={(id, name) => setInstallForm((f: any) => ({ ...f, maintenanceContractorSupplierId: id, maintenanceContractor: name }))} />}
              </div>
              <div><Label>Next service date</Label><Input type="date" value={installForm.nextServiceDate ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, nextServiceDate: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={installForm.notes ?? ""} onChange={e => setInstallForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowInstallDialog(false); setEditInstall(null); setInstallForm(EMPTY_INSTALL); }}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" disabled={createInstallMut.isPending || updateInstallMut.isPending} onClick={() => {
              if (!installForm.installationName || !installForm.technologyType) { toast({ title: "Name and technology type are required", variant: "destructive" }); return; }
              const body = { ...installForm, installedCapacityKw: installForm.installedCapacityKw || null, panelCount: installForm.panelCount ? parseInt(String(installForm.panelCount)) : null, tariffRatePence: installForm.tariffRatePence || null, nextServiceDate: installForm.nextServiceDate || null, installationDate: installForm.installationDate || null };
              if (editInstall) updateInstallMut.mutate({ ...body, id: editInstall.id });
              else createInstallMut.mutate(body);
            }}>{editInstall ? "Save Changes" : "Add Installation"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── INSTALLATION DOCUMENTS DIALOG ─── */}
      <Dialog open={showDocsDialog} onOpenChange={o => { if (!o) { setShowDocsDialog(false); setDocsInstall(null); setDocUploadNotes(""); setDocUploadType("other"); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Files className="w-4 h-4 text-blue-500" />
              Documents — {docsInstall?.installationName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {installDocs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No documents attached yet. Upload certificates, agreements, or photos below.</p>
            ) : (
              <div className="space-y-2">
                {installDocs.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{DOC_TYPES.find(t => t.value === doc.documentType)?.label ?? doc.documentType}</Badge>
                        {doc.notes && <span className="text-xs text-gray-400 truncate">{doc.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a href={`/api/storage${doc.storageKey}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors">
                        <ExternalLink className="w-3 h-3" />View
                      </a>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 h-7 w-7 p-0" disabled={deleteDocMut.isPending} onClick={() => deleteDocMut.mutate({ installId: docsInstall.id, docId: doc.id })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Upload a document</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label>Document type</Label>
                  <Select value={docUploadType} onValueChange={setDocUploadType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Input value={docUploadNotes} onChange={e => setDocUploadNotes(e.target.value)} placeholder="e.g. MCS-12345" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{isInstallDocUploading ? "Uploading…" : "Click to choose a file (PDF, image, Word)"}</span>
                <input type="file" className="hidden" accept="image/*,application/pdf,.doc,.docx" disabled={isInstallDocUploading || !docsInstall} onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file || !docsInstall) return;
                  const result = await uploadFile(file);
                  if (result) {
                    createDocMut.mutate({ installationId: docsInstall.id, documentType: docUploadType, fileName: file.name, storageKey: result.objectPath, notes: docUploadNotes || undefined });
                  }
                  e.target.value = "";
                }} />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDocsDialog(false); setDocsInstall(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── GENERATION DIALOG ─── */}
      <Dialog open={showGenDialog} onOpenChange={o => { if (!o) { setShowGenDialog(false); setEditGen(null); setGenForm(EMPTY_GEN); createGenMut.reset(); updateGenMut.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editGen ? "Edit Reading" : "Log Generation Reading"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Reading date *</Label><Input type="date" value={genForm.readingDate ?? ""} onChange={e => setGenForm((f: any) => ({ ...f, readingDate: e.target.value }))} /></div>
              <div><Label>Installation *</Label>
                <Select value={String(genForm.installationId || "__none__")} onValueChange={v => setGenForm((f: any) => ({ ...f, installationId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select installation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {installs.map((i: any) => <SelectItem key={String(i.id)} value={String(i.id)}>{String(i.installationName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Generated (kWh)</Label><Input type="number" step="0.01" value={genForm.generationKwh ?? ""} onChange={e => setGenForm((f: any) => ({ ...f, generationKwh: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>Exported (kWh)</Label><Input type="number" step="0.01" value={genForm.exportKwh ?? ""} onChange={e => setGenForm((f: any) => ({ ...f, exportKwh: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>Self-used (kWh)</Label><Input type="number" step="0.01" value={genForm.selfConsumedKwh ?? ""} onChange={e => setGenForm((f: any) => ({ ...f, selfConsumedKwh: e.target.value }))} placeholder="0.00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>FiT / SEG period</Label><Input value={genForm.fitPaymentPeriod ?? ""} onChange={e => setGenForm((f: any) => ({ ...f, fitPaymentPeriod: e.target.value }))} placeholder="e.g. Q1 2025" /></div>
              <div><Label>FiT / SEG payment (£)</Label><Input type="number" step="0.01" value={genForm.fitPaymentAmount ?? ""} onChange={e => setGenForm((f: any) => ({ ...f, fitPaymentAmount: e.target.value }))} placeholder="0.00" /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={genForm.notes ?? ""} onChange={e => setGenForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowGenDialog(false); setEditGen(null); setGenForm(EMPTY_GEN); }}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" disabled={createGenMut.isPending || updateGenMut.isPending} onClick={() => {
              if (!genForm.readingDate || !genForm.installationId || genForm.installationId === "__none__") { toast({ title: "Date and installation are required", variant: "destructive" }); return; }
              const body = { ...genForm, installationId: parseInt(String(genForm.installationId)), generationKwh: genForm.generationKwh || null, exportKwh: genForm.exportKwh || null, selfConsumedKwh: genForm.selfConsumedKwh || null, fitPaymentAmount: genForm.fitPaymentAmount || null };
              if (editGen) updateGenMut.mutate({ ...body, id: editGen.id });
              else createGenMut.mutate(body);
            }}>{editGen ? "Save Changes" : "Log Reading"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── PAYMENT DIALOG ─── */}
      <Dialog open={showPaymentDialog} onOpenChange={o => { if (!o) { setShowPaymentDialog(false); setEditPayment(null); setPaymentForm(EMPTY_PAYMENT); createPaymentMut.reset(); updatePaymentMut.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editPayment ? "Edit SEG Payment" : "Record SEG Payment"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Payment date *</Label><Input type="date" value={paymentForm.paymentDate ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, paymentDate: e.target.value }))} /></div>
              <div><Label>Installation</Label>
                <Select value={String(paymentForm.installationId || "__none__")} onValueChange={v => setPaymentForm((f: any) => ({ ...f, installationId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select installation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {installs.map((i: any) => <SelectItem key={String(i.id)} value={String(i.id)}>{String(i.installationName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Period from</Label><Input type="date" value={paymentForm.periodFrom ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, periodFrom: e.target.value }))} /></div>
              <div><Label>Period to</Label><Input type="date" value={paymentForm.periodTo ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, periodTo: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>kWh exported</Label><Input type="number" step="0.01" value={paymentForm.exportKwh ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, exportKwh: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>Rate (p/kWh)</Label><Input type="number" step="0.01" value={paymentForm.rateUsedPencePerKwh ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, rateUsedPencePerKwh: e.target.value }))} placeholder="e.g. 7.50" /></div>
              <div><Label>Amount (£) *</Label><Input type="number" step="0.01" value={paymentForm.paymentAmountPence ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, paymentAmountPence: e.target.value }))} placeholder="0.00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Payment reference</Label><Input value={paymentForm.paymentReference ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, paymentReference: e.target.value }))} /></div>
              <div><Label>Supplier / payer</Label><Input value={paymentForm.supplierName ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, supplierName: e.target.value }))} placeholder="e.g. Octopus Energy" /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={paymentForm.notes ?? ""} onChange={e => setPaymentForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPaymentDialog(false); setEditPayment(null); setPaymentForm(EMPTY_PAYMENT); }}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" disabled={createPaymentMut.isPending || updatePaymentMut.isPending} onClick={() => {
              if (!paymentForm.paymentDate || !paymentForm.paymentAmountPence) { toast({ title: "Payment date and amount are required", variant: "destructive" }); return; }
              const body = { ...paymentForm, installationId: paymentForm.installationId && paymentForm.installationId !== "__none__" ? parseInt(String(paymentForm.installationId)) : null, exportKwh: paymentForm.exportKwh || null, rateUsedPencePerKwh: paymentForm.rateUsedPencePerKwh || null, periodFrom: paymentForm.periodFrom || null, periodTo: paymentForm.periodTo || null };
              if (editPayment) updatePaymentMut.mutate({ ...body, id: editPayment.id });
              else createPaymentMut.mutate(body);
            }}>{editPayment ? "Save Changes" : "Record Payment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirms */}
      <Dialog open={deleteInstallId !== null} onOpenChange={o => { if (!o) { setDeleteInstallId(null); deleteInstallMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}><DialogHeader><DialogTitle>Delete Installation</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This will permanently delete this installation and all associated records.</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteInstallId(null)}>Cancel</Button><Button variant="destructive" disabled={deleteInstallMut.isPending} onClick={() => deleteInstallId !== null && deleteInstallMut.mutate(deleteInstallId)}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteGenId !== null} onOpenChange={o => { if (!o) { setDeleteGenId(null); deleteGenMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}><DialogHeader><DialogTitle>Delete Reading</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this generation reading?</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteGenId(null)}>Cancel</Button><Button variant="destructive" disabled={deleteGenMut.isPending} onClick={() => deleteGenId !== null && deleteGenMut.mutate(deleteGenId)}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deletePaymentId !== null} onOpenChange={o => { if (!o) { setDeletePaymentId(null); deletePaymentMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}><DialogHeader><DialogTitle>Delete Payment</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this SEG payment record?</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeletePaymentId(null)}>Cancel</Button><Button variant="destructive" disabled={deletePaymentMut.isPending} onClick={() => deletePaymentId !== null && deletePaymentMut.mutate(deletePaymentId)}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FuelEnergyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<Tab>({
    page: "fuel-energy",
    farmId,
    validIds: ["tanks", "deliveries", "usage", "inspections", "grid-energy", "solar", "reports"],
    defaultTab: "tanks",
    urlOverride: new URLSearchParams(window.location.search).get("tab"),
  });
  const openId = (() => { const n = Number(new URLSearchParams(window.location.search).get("open")); return n > 0 ? n : null; })();
  const [hlInspId, setHlInspId] = useState<number | null>(openId);
  const inspRowRefs = useRef<Map<number, HTMLElement>>(new Map());
  const autoInspOpened = useRef(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [raiseTaskFor, setRaiseTaskFor] = useState<any>(null);
  const { data: fuelMembersData } = useFarmMembers(farmId ?? 0);
  const fuelActiveMembers = (fuelMembersData?.members ?? []).filter((m: any) => m.isActive);

  const tanksQ = useQuery({
    queryKey: ["fuel-tanks", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/tanks`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const deliveriesQ = useQuery({
    queryKey: ["fuel-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/deliveries`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const usageQ = useQuery({
    queryKey: ["fuel-usage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/usage`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const inspectionsQ = useQuery({
    queryKey: ["fuel-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/storage-inspections`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const metersQ = useQuery({
    queryKey: ["energy-meters", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/energy/meters`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const readingsQ = useQuery({
    queryKey: ["energy-readings", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/energy/readings`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const stockChecksQ = useQuery({
    queryKey: ["fuel-stock-checks", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/stock-checks`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()).then(d => d.members ?? []),
    enabled: !!farmId,
  });

  const { uploadFile, isUploading: isDocUploading } = useUpload();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["fuel-tanks", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-usage", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-inspections", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-stock-checks", farmId] });
    qc.invalidateQueries({ queryKey: ["energy-meters", farmId] });
    qc.invalidateQueries({ queryKey: ["energy-readings", farmId] });
  };

  // Tank dialog
  const [showTankDialog, setShowTankDialog] = useState(false);
  const [editTank, setEditTank] = useState<Record<string, unknown> | null>(null);
  const [tankForm, setTankForm] = useState<Record<string, string>>({});

  function openTankAdd() {
    setEditTank(null);
    setTankForm({ fuelType: "red_diesel", isBunded: "false" });
    setShowTankDialog(true);
  }
  function openTankEdit(t: Record<string, unknown>) {
    setEditTank(t);
    setTankForm({
      name: String(t.name ?? ""),
      fuelType: String(t.fuelType ?? "red_diesel"),
      capacityLitres: String(t.capacityLitres ?? ""),
      currentStockLitres: String(t.currentStockLitres ?? "0"),
      location: String(t.location ?? ""),
      isBunded: String(t.isBunded ?? "false"),
      bundCapacityLitres: String(t.bundCapacityLitres ?? ""),
      tankMaterial: String(t.tankMaterial ?? ""),
      installDate: t.installDate ? String(t.installDate).substring(0, 10) : "",
      nextInspectionDue: t.nextInspectionDue ? String(t.nextInspectionDue).substring(0, 10) : "",
      notes: String(t.notes ?? ""),
    });
    setShowTankDialog(true);
  }
  const tankMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editTank ? `/api/farms/${farmId}/fuel/tanks/${editTank.id}` : `/api/farms/${farmId}/fuel/tanks`;
      const res = await fetch(url, { method: editTank ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowTankDialog(false); toast({ title: editTank ? "Tank updated" : "Tank added" }); },
    onError: () => toast({ title: "Error saving tank", variant: "destructive" }),
  });
  const delTankMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/tanks/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Tank removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // Delivery dialog (add + edit)
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [editDelivery, setEditDelivery] = useState<Record<string, unknown> | null>(null);
  const [viewDelivery, setViewDelivery] = useState<Record<string, unknown> | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<Record<string, string>>({});
  const deliveryMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/deliveries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowDeliveryDialog(false); toast({ title: "Delivery recorded" }); },
    onError: () => toast({ title: "Error saving delivery", variant: "destructive" }),
  });
  const editDeliveryMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/deliveries/${editDelivery?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowDeliveryDialog(false); setEditDelivery(null); toast({ title: "Delivery updated" }); },
    onError: () => toast({ title: "Error updating delivery", variant: "destructive" }),
  });
  const delDeliveryMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/deliveries/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Delivery removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // Usage log filters
  const [usageFilterVehicle, setUsageFilterVehicle] = useState("__all__");
  const [usageFilterMember, setUsageFilterMember] = useState("__all__");
  const [usageFilterTank, setUsageFilterTank] = useState("__all__");
  const [usageFilterActivity, setUsageFilterActivity] = useState("__all__");

  // Usage dialog
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [usageForm, setUsageForm] = useState<Record<string, string>>({});
  const usageMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/usage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowUsageDialog(false); toast({ title: "Usage recorded" }); },
    onError: () => toast({ title: "Error saving usage", variant: "destructive" }),
  });
  const delUsageMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/usage/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Record removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // Inspection dialog
  const [showInspDialog, setShowInspDialog] = useState(false);
  const [inspForm, setInspForm] = useState<Record<string, string>>({});
  const inspMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/storage-inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowInspDialog(false); toast({ title: "Inspection recorded" }); },
    onError: () => toast({ title: "Error saving inspection", variant: "destructive" }),
  });
  const delInspMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/storage-inspections/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Inspection removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // Meter dialog
  const [showMeterDialog, setShowMeterDialog] = useState(false);
  const [editMeter, setEditMeter] = useState<Record<string, unknown> | null>(null);
  const [meterForm, setMeterForm] = useState<Record<string, string>>({});
  const meterMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editMeter ? `/api/farms/${farmId}/energy/meters/${editMeter.id}` : `/api/farms/${farmId}/energy/meters`;
      const res = await fetch(url, { method: editMeter ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowMeterDialog(false); toast({ title: editMeter ? "Meter updated" : "Meter added" }); },
    onError: () => toast({ title: "Error saving meter", variant: "destructive" }),
  });
  const delMeterMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/energy/meters/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Meter removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // Reading dialog
  const [showReadingDialog, setShowReadingDialog] = useState(false);
  const [readingForm, setReadingForm] = useState<Record<string, string>>({});
  const readingMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/energy/readings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowReadingDialog(false); toast({ title: "Reading recorded" }); },
    onError: () => toast({ title: "Error saving reading", variant: "destructive" }),
  });
  const delReadingMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/energy/readings/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Reading removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const [showStockCheckDialog, setShowStockCheckDialog] = useState(false);
  const [stockCheckTankId, setStockCheckTankId] = useState<string>("");
  const [stockCheckForm, setStockCheckForm] = useState<Record<string, string>>({});
  const [expandedTankId, setExpandedTankId] = useState<number | null>(null);

  const stockCheckMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/stock-checks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowStockCheckDialog(false); toast({ title: "Stock check recorded" }); },
    onError: () => toast({ title: "Error saving stock check", variant: "destructive" }),
  });
  const delStockCheckMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/stock-checks/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Stock check removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const CROP_YEAR_OPTIONS = buildCropYearOptions();
  const currentCY = getCropYear(new Date());
  const [deliveryCropYear, setDeliveryCropYear] = useState<string>(currentCY.label);
  const [usageCropYear, setUsageCropYear] = useState<string>(currentCY.label);

  const tanks: Record<string, unknown>[] = tanksQ.data ?? [];
  const deliveries: Record<string, unknown>[] = deliveriesQ.data ?? [];
  const usages: Record<string, unknown>[] = usageQ.data ?? [];
  const inspections: Record<string, unknown>[] = inspectionsQ.data ?? [];
  const meters: Record<string, unknown>[] = metersQ.data ?? [];
  const readings: Record<string, unknown>[] = readingsQ.data ?? [];
  const stockChecks: Record<string, unknown>[] = stockChecksQ.data ?? [];
  const equipment: Record<string, unknown>[] = equipmentQ.data ?? [];
  const motorEquipment: Record<string, unknown>[] = equipment.filter(e => !IMPLEMENT_TYPES.has(String(e.type ?? "")));
  const members: Record<string, unknown>[] = membersQ.data ?? [];

  useEffect(() => {
    if (!openId || autoInspOpened.current || inspections.length === 0) return;
    if (inspections.some(r => Number(r.id) === openId)) {
      autoInspOpened.current = true;
      setTimeout(() => { inspRowRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" }); const t = setTimeout(() => setHlInspId(null), 4000); return () => clearTimeout(t); }, 200);
    }
  }, [openId, inspections]);

  const totalStockL = tanks.reduce((s, t) => s + parseFloat(String(t.currentStockLitres ?? 0)), 0);
  const unbundedTanks = tanks.filter(t => !t.isBunded && !["lpg_bottles", "AdBlue"].includes(String(t.fuelType)));
  const overdueTanks = tanks.filter(t => t.nextInspectionDue && new Date(String(t.nextInspectionDue)) < new Date());

  const stockByFuelType: Record<string, number> = {};
  for (const t of tanks) {
    const ft = String(t.fuelType ?? "other");
    stockByFuelType[ft] = (stockByFuelType[ft] ?? 0) + parseFloat(String(t.currentStockLitres ?? 0));
  }

  const selectedDeliveryCY = CROP_YEAR_OPTIONS.find(o => o.label === deliveryCropYear) ?? CROP_YEAR_OPTIONS[0];
  const selectedUsageCY = CROP_YEAR_OPTIONS.find(o => o.label === usageCropYear) ?? CROP_YEAR_OPTIONS[0];

  const filteredDeliveries = selectedDeliveryCY
    ? deliveries.filter(d => {
        const dd = new Date(String(d.deliveryDate));
        return dd >= selectedDeliveryCY.start && dd <= selectedDeliveryCY.end;
      })
    : deliveries;
  const filteredUsages = usages.filter(u => {
    if (selectedUsageCY) {
      const ud = new Date(String(u.usageDate));
      if (ud < selectedUsageCY.start || ud > selectedUsageCY.end) return false;
    }
    if (usageFilterVehicle !== "__all__" && String(u.vehicleName ?? "") !== usageFilterVehicle) return false;
    if (usageFilterMember !== "__all__" && String(u.recordedBy ?? "") !== usageFilterMember) return false;
    if (usageFilterTank !== "__all__" && String(u.tankId ?? "") !== usageFilterTank) return false;
    if (usageFilterActivity !== "__all__" && String(u.qualifyingActivity ?? "") !== usageFilterActivity) return false;
    return true;
  });
  const uniqueVehicles = [...new Set(usages.map(u => String(u.vehicleName ?? "")).filter(Boolean))].sort();
  const uniqueMembers = [...new Set(usages.map(u => String(u.recordedBy ?? "")).filter(Boolean))].sort();
  const uniqueSupplierNames = [...new Set(deliveries.map(d => String(d.supplierName ?? "")).filter(Boolean))].sort();
  const usageFiltersActive = usageFilterVehicle !== "__all__" || usageFilterMember !== "__all__" || usageFilterTank !== "__all__" || usageFilterActivity !== "__all__";

  const deliveredByCYByFuelType: Record<string, number> = {};
  for (const d of filteredDeliveries) {
    const ft = String(d.fuelType ?? "other");
    deliveredByCYByFuelType[ft] = (deliveredByCYByFuelType[ft] ?? 0) + parseFloat(String(d.quantityLitres ?? 0));
  }
  const totalDeliveredYTD = filteredDeliveries.reduce((s, d) => s + parseFloat(String(d.quantityLitres ?? 0)), 0);

  // Grid energy totals
  const elecMeters = meters.filter(m => m.meterType === "electricity");
  const gasMeters = meters.filter(m => m.meterType === "natural_gas" || m.meterType === "lpg_mains");
  const currentYearReadings = readings.filter(r => new Date(String(r.readingDate)).getFullYear() === new Date().getFullYear());
  const totalElecKwh = currentYearReadings.filter(r => {
    const m = meters.find(m => m.id === r.meterId);
    return m?.meterType === "electricity";
  }).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
  const totalGasKwh = currentYearReadings.filter(r => {
    const m = meters.find(m => m.id === r.meterId);
    return m?.meterType === "natural_gas" || m?.meterType === "lpg_mains";
  }).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
  const totalEnergyCostYTD = currentYearReadings.reduce((s, r) => s + (r.costPence ? Number(r.costPence) : 0), 0);

  const [selectedMeterId, setSelectedMeterId] = useState<string>("all");
  const filteredReadings = selectedMeterId === "all" ? readings : readings.filter(r => String(r.meterId) === selectedMeterId);

  return (
    <AppLayout title="Fuel & Energy">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Red diesel, LPG, heating oil, electricity and gas — complete on-farm energy register for HMRC compliance, Red Tractor and carbon reporting
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-1"><Gauge className="w-4 h-4 text-green-700" /><span className="text-xs text-gray-500">Total tank stock</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtL(totalStockL)}</p>
            <p className="text-xs text-gray-400 mb-2">{tanks.length} tank{tanks.length !== 1 ? "s" : ""} registered</p>
            {Object.entries(stockByFuelType).filter(([, v]) => v > 0).map(([ft, v]) => (
              <div key={ft} className="flex justify-between text-xs text-gray-600 border-t border-gray-50 pt-1">
                <span className="text-gray-400">{FUEL_TYPE_LABELS[ft] ?? ft}</span>
                <span className="font-medium">{fmtL(v)}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-1"><Truck className="w-4 h-4 text-blue-600" /><span className="text-xs text-gray-500">Delivered — crop year</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtL(totalDeliveredYTD)}</p>
            <p className="text-xs text-gray-400 mb-2">{filteredDeliveries.length} deliveries · {currentCY.label}</p>
            {Object.entries(deliveredByCYByFuelType).filter(([, v]) => v > 0).map(([ft, v]) => (
              <div key={ft} className="flex justify-between text-xs text-gray-600 border-t border-gray-50 pt-1">
                <span className="text-gray-400">{FUEL_TYPE_LABELS[ft] ?? ft}</span>
                <span className="font-medium">{fmtL(v)}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-yellow-500" /><span className="text-xs text-gray-500">Electricity YTD</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtKwh(totalElecKwh || null)}</p>
            <p className="text-xs text-gray-400">{elecMeters.length} meter{elecMeters.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Flame className="w-4 h-4 text-orange-500" /><span className="text-xs text-gray-500">Gas / LPG energy YTD</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtKwh(totalGasKwh || null)}</p>
            <p className="text-xs text-gray-400">{gasMeters.length} meter{gasMeters.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {(unbundedTanks.length > 0 || overdueTanks.length > 0) && (
          <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              {unbundedTanks.length > 0 && <><strong>{unbundedTanks.length} tank{unbundedTanks.length > 1 ? "s are" : " is"} not bunded</strong> (Oil Storage Regs 2001 apply to tanks ≥201L). </>}
              {overdueTanks.length > 0 && <><strong>{overdueTanks.length} tank{overdueTanks.length > 1 ? "s have" : " has"} an overdue inspection.</strong></>}
            </p>
          </div>
        )}

        <TabBar className="mb-6">
          <TabButton active={tab === "tanks"} onClick={() => setTab("tanks")}>Tank Register ({tanks.length})</TabButton>
          <TabButton active={tab === "deliveries"} onClick={() => setTab("deliveries")}>Deliveries ({deliveries.length})</TabButton>
          <TabButton active={tab === "usage"} onClick={() => setTab("usage")}>Usage Log ({usages.length})</TabButton>
          <TabButton active={tab === "inspections"} onClick={() => setTab("inspections")}>Inspections ({inspections.length})</TabButton>
          <TabButton active={tab === "grid-energy"} onClick={() => setTab("grid-energy")}>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />Grid Energy ({meters.length})</span>
          </TabButton>
          <TabButton active={tab === "solar"} onClick={() => setTab("solar")}>
            <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" />Solar &amp; Renewables</span>
          </TabButton>
          <TabButton active={tab === "reports"} onClick={() => setTab("reports")}>
            <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />Reports</span>
          </TabButton>
        </TabBar>

        {/* ── TANKS ── */}
        {tab === "tanks" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel & LPG Tanks</h3>
                <p className="text-xs text-gray-500">Register all on-farm storage tanks — diesel, heating oil and LPG. Regulations differ by fuel type.</p>
              </div>
              <Button onClick={openTankAdd} className="bg-green-800 hover:bg-green-900 text-white"><Plus className="w-4 h-4 mr-1" />Add Tank</Button>
            </div>
            {tanks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Fuel className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No tanks registered</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {tanks.map((tank) => {
                  const tankId = Number(tank.id);
                  const isLpg = String(tank.fuelType).startsWith("lpg");
                  const isOverdue = tank.nextInspectionDue && new Date(String(tank.nextInspectionDue)) < new Date();
                  const regs = FUEL_TYPE_REGS[String(tank.fuelType)];
                  const isExpanded = expandedTankId === tankId;
                  const tankDeliveries = deliveries.filter(d => Number(d.tankId) === tankId).sort((a, b) => new Date(String(b.deliveryDate)).getTime() - new Date(String(a.deliveryDate)).getTime());
                  const tankChecks = stockChecks.filter(c => Number(c.tankId) === tankId).sort((a, b) => new Date(String(b.checkDate)).getTime() - new Date(String(a.checkDate)).getTime());
                  const latestCheck = tankChecks[0];
                  return (
                    <div key={String(tank.id)} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{String(tank.name)}</p>
                            <p className="text-xs text-gray-500">{FUEL_TYPE_LABELS[String(tank.fuelType)] ?? String(tank.fuelType)}</p>
                            {regs && <p className="text-xs text-blue-600 mt-0.5">{regs}</p>}
                          </div>
                          <div className="flex gap-1.5 items-center flex-wrap justify-end">
                            {isLpg
                              ? <Badge className="text-xs" style={{ background: "#eff6ff", color: "#1d4ed8", border: "none" }}>LPG / DSEAR</Badge>
                              : tank.isBunded
                                ? <Badge className="text-xs" style={{ background: "#d1fae5", color: "#065f46", border: "none" }}>Bunded</Badge>
                                : <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>Not bunded</Badge>
                            }
                            <Button size="sm" variant="ghost" onClick={() => openTankEdit(tank)} className="h-7 px-2 text-xs"><Edit2 className="w-3 h-3" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => delTankMut.mutate(tankId)} className="h-7 px-2 text-xs text-red-600"><Trash2 className="w-3 h-3" /></Button>
                            {!!isOverdue && <Button size="sm" variant="ghost" onClick={() => setRaiseTaskFor(tank)} className="h-7 px-2 text-xs text-purple-600" title="Raise inspection task"><ClipboardList className="w-3 h-3" /></Button>}
                          </div>
                        </div>
                        {String(tank.fuelType) !== "lpg_bottles" && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{fmtL(tank.currentStockLitres as string)} remaining (calculated)</span>
                              <span>of {fmtL(tank.capacityLitres as string)}</span>
                            </div>
                            <TankGauge current={tank.currentStockLitres as string} capacity={tank.capacityLitres as string} />
                          </div>
                        )}
                        {latestCheck && (
                          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5 mb-2 text-xs">
                            <ClipboardList className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="text-blue-700">Last stock check: <strong>{fmtL(latestCheck.measuredLitres as string)}</strong> on {fmtDate(String(latestCheck.checkDate))}</span>
                            {latestCheck.varianceLitres !== null && latestCheck.varianceLitres !== undefined && (
                              <span className={parseFloat(String(latestCheck.varianceLitres)) < -50 ? "text-red-600 font-semibold ml-auto" : "text-gray-500 ml-auto"}>
                                {parseFloat(String(latestCheck.varianceLitres)) >= 0 ? "+" : ""}{parseFloat(String(latestCheck.varianceLitres)).toFixed(0)} L variance
                              </span>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600 mb-3">
                          <span><span className="text-gray-400">Location:</span> {String(tank.location ?? "—")}</span>
                          {!!tank.tankMaterial && <span><span className="text-gray-400">Material:</span> {String(tank.tankMaterial)}</span>}
                          {!!tank.nextInspectionDue && (
                            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                              <span className="text-gray-400">Inspect by:</span> {fmtDate(String(tank.nextInspectionDue))}
                              {!!isOverdue && " ⚠"}
                            </span>
                          )}
                          {!!tank.isBunded && !!tank.bundCapacityLitres && (
                            <span><span className="text-gray-400">Bund:</span> {fmtL(tank.bundCapacityLitres as string)}</span>
                          )}
                        </div>
                        {!!tank.notes && <p className="text-xs text-gray-400 mb-3 italic">{String(tank.notes)}</p>}
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1"
                            onClick={() => { setStockCheckTankId(String(tank.id)); setStockCheckForm({ checkDate: new Date().toISOString().substring(0, 10), method: "dip_stick" }); setShowStockCheckDialog(true); }}>
                            <ClipboardList className="w-3 h-3 mr-1" />Log Stock Check
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs flex-1 text-blue-600"
                            onClick={() => setExpandedTankId(isExpanded ? null : tankId)}>
                            {isExpanded ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                            {tankDeliveries.length} deliveries · {tankChecks.length} checks
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Delivery History</p>
                          {tankDeliveries.length === 0 ? (
                            <p className="text-xs text-gray-400">No deliveries recorded for this tank.</p>
                          ) : (
                            <div className="space-y-1">
                              {tankDeliveries.map(d => (
                                <div key={String(d.id)} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-gray-100">
                                  <span className="text-gray-500">{fmtDate(String(d.deliveryDate))}</span>
                                  <span className="text-gray-700">{String(d.supplierName ?? "—")}</span>
                                  <span className="font-medium text-green-700">{fmtL(d.quantityLitres as string)}</span>
                                  <span className="text-gray-500">{fmtCost(d.totalCostPence as number)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {tankChecks.length > 0 && (
                            <>
                              <p className="text-xs font-semibold text-gray-600 mt-3 mb-2">Stock Check History</p>
                              <div className="space-y-1">
                                {tankChecks.map(c => {
                                  const variance = c.varianceLitres !== null && c.varianceLitres !== undefined ? parseFloat(String(c.varianceLitres)) : null;
                                  return (
                                    <div key={String(c.id)} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-gray-100">
                                      <span className="text-gray-500">{fmtDate(String(c.checkDate))}</span>
                                      <span className="text-gray-600 capitalize">{String(c.method ?? "dip stick").replace(/_/g, " ")}</span>
                                      <span className="font-medium text-blue-700">{fmtL(c.measuredLitres as string)} measured</span>
                                      {variance !== null && (
                                        <span className={variance < -50 ? "font-semibold text-red-600" : "text-gray-500"}>
                                          {variance >= 0 ? "+" : ""}{variance.toFixed(0)} L
                                        </span>
                                      )}
                                      <Button size="sm" variant="ghost" onClick={() => delStockCheckMut.mutate(Number(c.id))} className="h-5 px-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── DELIVERIES ── */}
        {tab === "deliveries" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel Deliveries</h3>
                <p className="text-xs text-gray-500">Retain all delivery notes and invoices — HMRC may request these during a fuel duty inspection</p>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs text-gray-500 whitespace-nowrap">Crop year</Label>
                  <Select value={deliveryCropYear} onValueChange={setDeliveryCropYear}>
                    <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{CROP_YEAR_OPTIONS.map(o => <SelectItem key={o.label} value={o.label}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { setEditDelivery(null); setDeliveryForm({ fuelType: "red_diesel", qualifyingUse: "agriculture", deliveryDate: new Date().toISOString().substring(0, 10) }); setShowDeliveryDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                  <Plus className="w-4 h-4 mr-1" />Log Delivery
                </Button>
              </div>
            </div>
            {filteredDeliveries.length > 0 && (() => {
              const totalCostPence = filteredDeliveries.reduce((s: number, d: any) => s + (d.netAmountPence ? Number(d.netAmountPence) : 0), 0);
              const hasCost = filteredDeliveries.some((d: any) => d.netAmountPence);
              const byFuel: Record<string, number> = {};
              filteredDeliveries.forEach((d: any) => {
                const ft = String(d.fuelType ?? "other");
                byFuel[ft] = (byFuel[ft] ?? 0) + parseFloat(String(d.quantityLitres ?? 0));
              });
              const fuelRows = Object.entries(byFuel).sort((a, b) => b[1] - a[1]);
              return (
                <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  <div style={{ background: "#fef9c3", border: "1px solid #fef08a", borderRadius: 8, padding: "10px 16px", minWidth: 150 }}>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#854d0e", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Delivered</p>
                    <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }}>{totalDeliveredYTD.toLocaleString("en-GB", { maximumFractionDigits: 0 })} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>L</span></p>
                  </div>
                  {hasCost && (
                    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Cost</p>
                      <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>£{(totalCostPence / 100).toFixed(2)}</p>
                    </div>
                  )}
                  {fuelRows.length > 1 && fuelRows.map(([ft, litres]) => (
                    <div key={ft} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }}>{ft}</p>
                      <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }}>{litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>L</span></p>
                    </div>
                  ))}
                </div>
              );
            })()}
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><Truck className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium">No deliveries in {deliveryCropYear}</p><p className="text-sm">Change the crop year selector above or log a new delivery</p></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tank / Fuel</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier / Note</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Litres</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Cost</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Use</th>
                    <th className="px-4 py-3"></th>
                  </tr></thead>
                  <tbody>
                    {filteredDeliveries.map((d) => {
                      const tank = tanks.find(t => t.id === d.tankId);
                      return (
                        <tr key={String(d.id)} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setViewDelivery(d)}>
                          <td className="px-4 py-3 text-gray-700">{fmtDate(String(d.deliveryDate ?? ""))}</td>
                          <td className="px-4 py-3 text-xs">
                            <p className="text-gray-700">{tank ? String(tank.name) : "—"}</p>
                            <p className="text-gray-400">{FUEL_TYPE_LABELS[String(d.fuelType)] ?? String(d.fuelType)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{String(d.supplierName ?? "—")}</p>
                            <p className="text-xs text-gray-400">{String(d.deliveryNoteNumber ?? "")} {d.invoiceReference ? `/ ${d.invoiceReference}` : ""}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-green-700">{fmtL(d.quantityLitres as string)}</td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {fmtCost(d.totalCostPence as number)}
                            {!!d.unitPricePence && <p className="text-xs text-gray-400">{Number(d.unitPricePence)}p/L</p>}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 capitalize">{String(d.qualifyingUse ?? "agriculture").replace(/_/g, " ")}</td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setViewDelivery(d)} className="h-7 px-2 text-blue-600" title="View details"><Eye className="w-3 h-3" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => {
                                setEditDelivery(d);
                                const deliveryDateStr = d.deliveryDate ? new Date(String(d.deliveryDate)).toISOString().substring(0, 10) : "";
                                setDeliveryForm({
                                  deliveryDate: deliveryDateStr,
                                  tankId: String(d.tankId ?? ""),
                                  fuelType: String(d.fuelType ?? "red_diesel"),
                                  quantityLitres: String(d.quantityLitres ?? ""),
                                  supplierName: String(d.supplierName ?? ""),
                                  deliveryNoteNumber: String(d.deliveryNoteNumber ?? ""),
                                  invoiceReference: String(d.invoiceReference ?? ""),
                                  unitPricePence: String(d.unitPricePence ?? ""),
                                  qualifyingUse: String(d.qualifyingUse ?? "agriculture"),
                                  driverName: String(d.driverName ?? ""),
                                  documentUrl: String(d.documentUrl ?? ""),
                                  notes: String(d.notes ?? ""),
                                });
                                setShowDeliveryDialog(true);
                              }} className="h-7 px-2 text-gray-600" title="Edit delivery"><Edit2 className="w-3 h-3" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => delDeliveryMut.mutate(Number(d.id))} className="h-7 px-2 text-red-600" title="Delete"><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USAGE ── */}
        {tab === "usage" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel Usage Log</h3>
                <p className="text-xs text-gray-500">Record every draw-down from tanks — demonstrates qualifying use for HMRC rebated fuel</p>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs text-gray-500 whitespace-nowrap">Crop year</Label>
                  <Select value={usageCropYear} onValueChange={setUsageCropYear}>
                    <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{CROP_YEAR_OPTIONS.map(o => <SelectItem key={o.label} value={o.label}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { setUsageForm({ qualifyingActivity: "agriculture", usageDate: new Date().toISOString().substring(0, 10) }); setShowUsageDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                  <Plus className="w-4 h-4 mr-1" />Record Usage
                </Button>
              </div>
            </div>
            {/* Usage filters */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Filter:</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Vehicle</span>
                <Select value={usageFilterVehicle} onValueChange={setUsageFilterVehicle}>
                  <SelectTrigger className="h-7 text-xs w-40"><SelectValue placeholder="All vehicles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All vehicles</SelectItem>
                    {uniqueVehicles.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Staff</span>
                <Select value={usageFilterMember} onValueChange={setUsageFilterMember}>
                  <SelectTrigger className="h-7 text-xs w-36"><SelectValue placeholder="All staff" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All staff</SelectItem>
                    {uniqueMembers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Tank</span>
                <Select value={usageFilterTank} onValueChange={setUsageFilterTank}>
                  <SelectTrigger className="h-7 text-xs w-36"><SelectValue placeholder="All tanks" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All tanks</SelectItem>
                    {tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Activity</span>
                <Select value={usageFilterActivity} onValueChange={setUsageFilterActivity}>
                  <SelectTrigger className="h-7 text-xs w-36"><SelectValue placeholder="All activities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All activities</SelectItem>
                    {QUALIFYING_ACTIVITIES.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {usageFiltersActive && (
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-gray-500" onClick={() => { setUsageFilterVehicle("__all__"); setUsageFilterMember("__all__"); setUsageFilterTank("__all__"); setUsageFilterActivity("__all__"); }}>
                  <XIcon className="w-3 h-3 mr-1" />Clear
                </Button>
              )}
              {usageFiltersActive && (
                <span className="text-xs text-gray-500 ml-auto self-center">{filteredUsages.length} of {usages.filter(u => { if (selectedUsageCY) { const ud = new Date(String(u.usageDate)); return ud >= selectedUsageCY.start && ud <= selectedUsageCY.end; } return true; }).length} records</span>
              )}
            </div>
            {filteredUsages.length > 0 && (() => {
              const totalUsedL = filteredUsages.reduce((s: number, u: any) => s + parseFloat(String(u.quantityLitres ?? 0)), 0);
              const byActivity: Record<string, number> = {};
              filteredUsages.forEach((u: any) => {
                const act = String(u.qualifyingActivity ?? "Other");
                byActivity[act] = (byActivity[act] ?? 0) + parseFloat(String(u.quantityLitres ?? 0));
              });
              const actRows = Object.entries(byActivity).sort((a, b) => b[1] - a[1]);
              return (
                <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  <div style={{ background: "#fef9c3", border: "1px solid #fef08a", borderRadius: 8, padding: "10px 16px", minWidth: 150 }}>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#854d0e", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Usage</p>
                    <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }}>{totalUsedL.toLocaleString("en-GB", { maximumFractionDigits: 0 })} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>L</span></p>
                  </div>
                  {actRows.length > 1 && actRows.map(([act, litres]) => (
                    <div key={act} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }}>{act}</p>
                      <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }}>{litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>L</span></p>
                    </div>
                  ))}
                </div>
              );
            })()}
            {filteredUsages.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><Droplets className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium">No usage records match filters</p><p className="text-sm">Try adjusting the filters or crop year above</p></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tank</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Vehicle / Machine</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Purpose / Activity</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Litres</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Recorded by</th>
                    <th className="px-4 py-3"></th>
                  </tr></thead>
                  <tbody>
                    {filteredUsages.map((u) => {
                      const tank = tanks.find(t => t.id === u.tankId);
                      return (
                        <tr key={String(u.id)} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">{fmtDate(String(u.usageDate ?? ""))}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{tank ? String(tank.name) : (u.tankName ? String(u.tankName) : "—")}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{u.vehicleName ? String(u.vehicleName) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{String(u.purpose ?? "—")}</p>
                            <p className="text-xs text-gray-400 capitalize">{String(u.qualifyingActivity ?? "").replace(/_/g, " ")}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-red-600">{fmtL(u.quantityLitres as string)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{String(u.recordedBy ?? "—")}</td>
                          <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => delUsageMut.mutate(Number(u.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── INSPECTIONS ── */}
        {tab === "inspections" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Storage Inspections</h3>
                <p className="text-xs text-gray-500">Annual oil storage inspection checklist + LPG periodic inspection records (UKLPG CoP)</p>
              </div>
              <Button onClick={() => { setInspForm({ overallResult: "pass", inspectionDate: new Date().toISOString().substring(0, 10) }); setShowInspDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                <Plus className="w-4 h-4 mr-1" />Record Inspection
              </Button>
            </div>
            {inspections.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium">No inspections recorded</p></div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {inspections.map((ins) => {
                  const tank = tanks.find(t => t.id === ins.tankId);
                  return (
                    <div key={String(ins.id)} ref={(el) => { if (el) inspRowRefs.current.set(Number(ins.id), el as HTMLElement); }} className={`rounded-xl border p-5 transition-colors${hlInspId === Number(ins.id) ? " bg-amber-50 border-amber-400 ring-2 ring-amber-400" : " bg-white border-gray-200"}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{fmtDate(String(ins.inspectionDate ?? ""))}</p>
                          <p className="text-xs text-gray-500">{tank ? String(tank.name) : "All tanks"} — {String(ins.inspector ?? "—")}</p>
                        </div>
                        <div className="flex gap-2">
                          <ResultBadge result={String(ins.overallResult ?? "pass")} />
                          <Button size="sm" variant="ghost" onClick={() => delInspMut.mutate(Number(ins.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <div className="mb-3 space-y-0.5">
                        <CheckRow label="Bunding / secondary containment" value={ins.bundingOk as boolean} />
                        <CheckRow label="Tank labelling correct" value={ins.labellingOk as boolean} />
                        <CheckRow label="Spill kit present" value={ins.spillKitPresent as boolean} />
                        <CheckRow label="Spill kit complete" value={ins.spillKitComplete as boolean} />
                        <CheckRow label="Tank condition OK" value={ins.tankConditionOk as boolean} />
                        <CheckRow label="Pipework OK" value={ins.pipeworkOk as boolean} />
                        <CheckRow label="Fill point locked" value={ins.fillPointLocked as boolean} />
                        <CheckRow label="Overfill protection" value={ins.overfillProtectionOk as boolean} />
                        <CheckRow label="Drainage risk managed" value={ins.drainageRiskOk as boolean} />
                      </div>
                      {!!ins.issuesFound && <div className="bg-red-50 rounded p-2 mb-2"><p className="text-xs font-medium text-red-800">Issues:</p><p className="text-xs text-red-700">{String(ins.issuesFound)}</p></div>}
                      {!!ins.actionsRequired && <div className="bg-amber-50 rounded p-2 mb-2"><p className="text-xs font-medium text-amber-800">Actions:</p><p className="text-xs text-amber-700">{String(ins.actionsRequired)}</p></div>}
                      <p className="text-xs text-gray-400 mt-2">Next due: {fmtDate(String(ins.nextInspectionDue ?? ""))}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── GRID ENERGY ── */}
        {tab === "grid-energy" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">Grid Energy — Meters & Readings</h3>
                <p className="text-xs text-gray-500">Track electricity, natural gas and mains LPG consumption for carbon reporting, ESOS compliance and cost management</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setReadingForm({ readingType: "actual", readingDate: new Date().toISOString().substring(0, 10) }); setShowReadingDialog(true); }}>
                  <Plus className="w-4 h-4 mr-1" />Add Reading
                </Button>
                <Button onClick={() => { setEditMeter(null); setMeterForm({ meterType: "electricity" }); setShowMeterDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                  <Plus className="w-4 h-4 mr-1" />Add Meter
                </Button>
              </div>
            </div>

            {/* Info banner */}
            <div className="flex gap-2 items-start bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <Zap className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800">
                <strong>Why track grid energy?</strong> Electricity and gas consumption data is required for Scope 1 &amp; 2 carbon footprint calculations, ESOS energy audits, and increasingly for Red Tractor sustainability assessments. MPAN (electricity) and MPRN (gas) numbers appear on your utility bills.
              </p>
            </div>

            {/* Meters */}
            {meters.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Plug className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No energy meters registered</p>
                <p className="text-sm">Add your electricity and gas meters to start logging readings</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-3 mb-6">
                  {meters.map((m) => {
                    const meterReadings = readings.filter(r => r.meterId === m.id);
                    const latestReading = meterReadings[0];
                    const ytdKwh = currentYearReadings.filter(r => r.meterId === m.id).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
                    const ytdCost = currentYearReadings.filter(r => r.meterId === m.id).reduce((s, r) => s + (r.costPence ? Number(r.costPence) : 0), 0);
                    const mLabel = METER_TYPES.find(t => t.value === m.meterType);
                    return (
                      <div key={String(m.id)} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <MeterTypeIcon type={String(m.meterType)} />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{String(m.name)}</p>
                              <p className="text-xs text-gray-400">{mLabel?.label ?? String(m.meterType)}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditMeter(m); setMeterForm({ name: String(m.name ?? ""), meterType: String(m.meterType ?? "electricity"), meterReference: String(m.meterReference ?? ""), mpan: String(m.mpan ?? ""), mprn: String(m.mprn ?? ""), supplier: String(m.supplier ?? ""), accountNumber: String(m.accountNumber ?? ""), location: String(m.location ?? ""), tariffName: String(m.tariffName ?? ""), unitRatePencePerKwh: String(m.unitRatePencePerKwh ?? ""), standingChargePencePerDay: String(m.standingChargePencePerDay ?? ""), notes: String(m.notes ?? "") }); setShowMeterDialog(true); }} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => delMeterMut.mutate(Number(m.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </div>
                        {!!m.location && <p className="text-xs text-gray-500 mb-2">{String(m.location)}</p>}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          {!!m.mpan && <div><span className="text-gray-400">MPAN:</span> <span className="font-mono text-gray-700">{String(m.mpan)}</span></div>}
                          {!!m.mprn && <div><span className="text-gray-400">MPRN:</span> <span className="font-mono text-gray-700">{String(m.mprn)}</span></div>}
                          {!!m.supplier && <div><span className="text-gray-400">Supplier:</span> {String(m.supplier)}</div>}
                          {!!m.tariffName && <div><span className="text-gray-400">Tariff:</span> {String(m.tariffName)}</div>}
                          {!!m.unitRatePencePerKwh && <div><span className="text-gray-400">Rate:</span> {String(m.unitRatePencePerKwh)}p/kWh</div>}
                        </div>
                        <div className="border-t pt-2 mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div><p className="text-gray-400">YTD consumption</p><p className="font-bold text-gray-800">{fmtKwh(ytdKwh || null)}</p></div>
                          <div><p className="text-gray-400">YTD cost</p><p className="font-bold text-gray-800">{ytdCost ? fmtCost(ytdCost) : "—"}</p></div>
                          {latestReading && <div className="col-span-2"><p className="text-gray-400">Last reading</p><p className="text-gray-700">{parseFloat(String(latestReading.meterReading)).toLocaleString()} — {fmtDate(String(latestReading.readingDate))}</p></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Readings table */}
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800 text-sm">Meter Readings</h4>
                  <Select value={selectedMeterId} onValueChange={setSelectedMeterId}>
                    <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All meters</SelectItem>
                      {meters.map(m => <SelectItem key={String(m.id)} value={String(m.id)}>{String(m.name)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {filteredReadings.length > 0 && (() => {
                  const totalConsumption = filteredReadings.reduce((s, r) => s + (r.consumptionKwh ? parseFloat(String(r.consumptionKwh)) : 0), 0);
                  const totalExport = filteredReadings.reduce((s, r) => s + (r.exportKwh ? parseFloat(String(r.exportKwh)) : 0), 0);
                  const totalCostP = filteredReadings.reduce((s, r) => s + (r.costPence ? Number(r.costPence) : 0), 0);
                  const hasConsumption = filteredReadings.some(r => r.consumptionKwh);
                  const hasExport = filteredReadings.some(r => r.exportKwh);
                  const hasCostR = filteredReadings.some(r => r.costPence);
                  return (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {[
                        { label: "Readings", value: String(filteredReadings.length), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
                        ...(hasConsumption ? [{ label: "Total Consumption", value: fmtKwh(String(totalConsumption)), color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }] : []),
                        ...(hasExport && totalExport > 0 ? [{ label: "Total Export", value: fmtKwh(String(totalExport)), color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" }] : []),
                        ...(hasCostR ? [{ label: "Total Cost", value: fmtCost(totalCostP), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" }] : []),
                      ].map(({ label, value, color, bg, border }) => (
                        <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 14px", minWidth: 110 }}>
                          <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", margin: "0 0 2px" }}>{label}</p>
                          <p style={{ fontSize: "1.15rem", fontWeight: 800, color, margin: 0, lineHeight: 1.1 }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {filteredReadings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No readings recorded yet</div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Meter</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Reading</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Consumption</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Export</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Cost</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice</th>
                        <th className="px-4 py-3"></th>
                      </tr></thead>
                      <tbody>
                        {filteredReadings.map((r) => {
                          const meter = meters.find(m => m.id === r.meterId);
                          return (
                            <tr key={String(r.id)} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-700">{fmtDate(String(r.readingDate ?? ""))}</td>
                              <td className="px-4 py-3 text-xs">
                                <div className="flex items-center gap-1">
                                  {meter && <MeterTypeIcon type={String(meter.meterType)} />}
                                  <span>{meter ? String(meter.name) : "—"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-gray-700">{parseFloat(String(r.meterReading)).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-medium text-green-700">{r.consumptionKwh ? fmtKwh(r.consumptionKwh as string) : "—"}</td>
                              <td className="px-4 py-3 text-right text-blue-600">{r.exportKwh ? fmtKwh(r.exportKwh as string) : "—"}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{fmtCost(r.costPence as number)}</td>
                              <td className="px-4 py-3 text-xs text-gray-500 capitalize">{String(r.readingType ?? "actual")}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">{String(r.invoiceReference ?? "—")}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  {!!r.documentUrl && (
                                    <a href={`/api/storage${String(r.documentUrl)}`} target="_blank" rel="noopener noreferrer" title="View meter photo">
                                      <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600"><Camera className="w-3 h-3" /></Button>
                                    </a>
                                  )}
                                  <Button size="sm" variant="ghost" onClick={() => delReadingMut.mutate(Number(r.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── SOLAR & RENEWABLES ── */}
      {tab === "solar" && farmId && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-semibold text-gray-800">Solar &amp; Renewable Energy</h3>
              <p className="text-xs text-gray-500">Track installations, monthly generation, and Smart Export Guarantee (SEG) income</p>
            </div>
          </div>
          <SolarRenewablesTab farmId={farmId} />
        </div>
      )}

      {/* ── REPORTS ── */}
      {tab === "reports" && (
        <ReportsTab
          tanks={tanks}
          deliveries={deliveries}
          usages={usages}
          inspections={inspections}
          stockChecks={stockChecks}
          readings={readings}
          meters={meters}
        />
      )}

      {/* ── DELIVERY DETAIL DIALOG ── */}
      <Dialog open={!!viewDelivery} onOpenChange={v => { if (!v) setViewDelivery(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Delivery Details</DialogTitle></DialogHeader>
          {viewDelivery && (() => {
            const vTank = tanks.find(t => t.id === viewDelivery.tankId);
            return (
              <div className="space-y-3 py-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-400">Date</p><p className="font-medium">{fmtDate(String(viewDelivery.deliveryDate ?? ""))}</p></div>
                  <div><p className="text-xs text-gray-400">Tank</p><p className="font-medium">{vTank ? String(vTank.name) : "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-400">Fuel type</p><p className="font-medium">{FUEL_TYPE_LABELS[String(viewDelivery.fuelType)] ?? String(viewDelivery.fuelType)}</p></div>
                  <div><p className="text-xs text-gray-400">Quantity</p><p className="font-medium text-green-700">{fmtL(viewDelivery.quantityLitres as string)}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-400">Unit price</p><p className="font-medium">{viewDelivery.unitPricePence ? `${Number(viewDelivery.unitPricePence)}p/L` : "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Total cost</p><p className="font-medium">{fmtCost(viewDelivery.totalCostPence as number)}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-400">Supplier</p><p className="font-medium">{String(viewDelivery.supplierName ?? "—")}</p></div>
                  <div><p className="text-xs text-gray-400">Driver</p><p className="font-medium">{String(viewDelivery.driverName ?? "—")}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-400">Delivery note no.</p><p className="font-medium">{String(viewDelivery.deliveryNoteNumber ?? "—")}</p></div>
                  <div><p className="text-xs text-gray-400">Invoice ref</p><p className="font-medium">{String(viewDelivery.invoiceReference ?? "—")}</p></div>
                </div>
                <div><p className="text-xs text-gray-400">Qualifying use</p><p className="font-medium capitalize">{String(viewDelivery.qualifyingUse ?? "agriculture").replace(/_/g, " ")}</p></div>
                {!!viewDelivery.notes && <div><p className="text-xs text-gray-400">Notes</p><p className="font-medium">{String(viewDelivery.notes)}</p></div>}
                {viewDelivery.documentUrl != null ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Attached document</p>
                    <a href={`/api/storage${String(viewDelivery.documentUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 font-medium text-sm hover:underline">
                      <Paperclip className="w-4 h-4 flex-shrink-0" />View delivery note / document<ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
                    <Paperclip className="w-4 h-4 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">No document attached — edit this delivery to upload a scan</p>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDelivery(null)}>Close</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!viewDelivery) return;
              setEditDelivery(viewDelivery);
              const deliveryDateStr = viewDelivery.deliveryDate ? new Date(String(viewDelivery.deliveryDate)).toISOString().substring(0, 10) : "";
              setDeliveryForm({
                deliveryDate: deliveryDateStr,
                tankId: String(viewDelivery.tankId ?? ""),
                fuelType: String(viewDelivery.fuelType ?? "red_diesel"),
                quantityLitres: String(viewDelivery.quantityLitres ?? ""),
                supplierName: String(viewDelivery.supplierName ?? ""),
                deliveryNoteNumber: String(viewDelivery.deliveryNoteNumber ?? ""),
                invoiceReference: String(viewDelivery.invoiceReference ?? ""),
                unitPricePence: String(viewDelivery.unitPricePence ?? ""),
                qualifyingUse: String(viewDelivery.qualifyingUse ?? "agriculture"),
                driverName: String(viewDelivery.driverName ?? ""),
                documentUrl: String(viewDelivery.documentUrl ?? ""),
                notes: String(viewDelivery.notes ?? ""),
              });
              setViewDelivery(null);
              setShowDeliveryDialog(true);
            }}>Edit Delivery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── TANK DIALOG ── */}
      <Dialog open={showTankDialog} onOpenChange={setShowTankDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editTank ? "Edit Tank" : "Add Fuel / LPG Tank"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tank name *</Label><Input value={tankForm.name ?? ""} onChange={e => setTankForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Yard Tank" /></div>
              <div><Label>Fuel type *</Label>
                <Select value={tankForm.fuelType ?? "red_diesel"} onValueChange={v => setTankForm(f => ({ ...f, fuelType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FUEL_TYPES.map(ft => <SelectItem key={ft} value={ft}>{FUEL_TYPE_LABELS[ft] ?? ft}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {tankForm.fuelType === "lpg_bottles" ? (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
                LPG cylinders/bottles: note the number of cylinders and total kg capacity. DSEAR 2002 requires cylinders to be stored upright in a ventilated cage, away from ignition sources and drains.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Capacity (litres) *</Label><Input type="number" value={tankForm.capacityLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, capacityLitres: e.target.value }))} placeholder="10000" /></div>
                <div><Label>Current stock (litres)</Label><Input type="number" value={tankForm.currentStockLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, currentStockLitres: e.target.value }))} placeholder="0" /></div>
              </div>
            )}
            <div><Label>Location</Label><Input value={tankForm.location ?? ""} onChange={e => setTankForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Main yard" /></div>
            {!String(tankForm.fuelType ?? "").startsWith("lpg") && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tank material</Label><Input value={tankForm.tankMaterial ?? ""} onChange={e => setTankForm(f => ({ ...f, tankMaterial: e.target.value }))} placeholder="Steel / Plastic" /></div>
                <div><Label>Is bunded?</Label>
                  <Select value={tankForm.isBunded ?? "false"} onValueChange={v => setTankForm(f => ({ ...f, isBunded: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Yes — bunded</SelectItem><SelectItem value="false">No</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {tankForm.isBunded === "true" && (
              <div><Label>Bund capacity (litres)</Label><Input type="number" value={tankForm.bundCapacityLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, bundCapacityLitres: e.target.value }))} /></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Install date</Label><Input type="date" value={tankForm.installDate ?? ""} onChange={e => setTankForm(f => ({ ...f, installDate: e.target.value }))} /></div>
              <div><Label>Next inspection due</Label><Input type="date" value={tankForm.nextInspectionDue ?? ""} onChange={e => setTankForm(f => ({ ...f, nextInspectionDue: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={tankForm.notes ?? ""} onChange={e => setTankForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTankDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!tankForm.name) { toast({ title: "Tank name is required", variant: "destructive" }); return; }
              tankMut.mutate({ ...tankForm, isBunded: tankForm.isBunded === "true" });
            }}>{editTank ? "Save Changes" : "Add Tank"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELIVERY DIALOG (add + edit) ── */}
      <Dialog open={showDeliveryDialog} onOpenChange={v => { setShowDeliveryDialog(v); if (!v) setEditDelivery(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editDelivery ? "Edit Fuel Delivery" : "Log Fuel Delivery"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={deliveryForm.deliveryDate ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
              <div><Label>Tank</Label>
                <Select value={deliveryForm.tankId ?? ""} onValueChange={v => setDeliveryForm(f => ({ ...f, tankId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                  <SelectContent>{tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Fuel type</Label>
                <Select value={deliveryForm.fuelType ?? "red_diesel"} onValueChange={v => setDeliveryForm(f => ({ ...f, fuelType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FUEL_TYPES.map(ft => <SelectItem key={ft} value={ft}>{FUEL_TYPE_LABELS[ft] ?? ft}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity (litres) *</Label><Input type="number" value={deliveryForm.quantityLitres ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, quantityLitres: e.target.value }))} placeholder="5000" /></div>
            </div>
            <div>
              <Label>Supplier</Label>
              <Input
                list="supplier-suggestions"
                value={deliveryForm.supplierName ?? ""}
                onChange={e => setDeliveryForm(f => ({ ...f, supplierName: e.target.value }))}
                placeholder={uniqueSupplierNames.length ? "Type or choose from previous…" : "e.g. Certas Energy, Crown Oil"}
              />
              {uniqueSupplierNames.length > 0 && (
                <datalist id="supplier-suggestions">
                  {uniqueSupplierNames.map(n => <option key={n} value={n} />)}
                </datalist>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Delivery note no.</Label><Input value={deliveryForm.deliveryNoteNumber ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, deliveryNoteNumber: e.target.value }))} /></div>
              <div><Label>Invoice ref</Label><Input value={deliveryForm.invoiceReference ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, invoiceReference: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Unit price (p/litre)</Label><Input type="number" value={deliveryForm.unitPricePence ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, unitPricePence: e.target.value }))} /></div>
              <div><Label>Qualifying use</Label>
                <Select value={deliveryForm.qualifyingUse ?? "agriculture"} onValueChange={v => setDeliveryForm(f => ({ ...f, qualifyingUse: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{QUALIFYING_ACTIVITIES.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Driver</Label><Input value={deliveryForm.driverName ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, driverName: e.target.value }))} /></div>
            <div>
              <Label>Delivery note / document</Label>
              {deliveryForm.documentUrl ? (
                <div className="flex items-center gap-2 mt-1 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <Paperclip className="w-4 h-4 text-green-700 flex-shrink-0" />
                  <a href={`/api/storage${deliveryForm.documentUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 underline truncate flex-1">View attached document</a>
                  <Button size="sm" variant="ghost" className="h-6 px-1 text-gray-400" onClick={() => setDeliveryForm(f => ({ ...f, documentUrl: "" }))}><XIcon className="w-3 h-3" /></Button>
                </div>
              ) : (
                <div className="mt-1">
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{isDocUploading ? "Uploading…" : "Attach delivery note or invoice scan"}</span>
                    <input type="file" className="hidden" accept="image/*,application/pdf" disabled={isDocUploading} onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const result = await uploadFile(file);
                      if (result) setDeliveryForm(f => ({ ...f, documentUrl: result.objectPath }));
                    }} />
                  </label>
                </div>
              )}
            </div>
            <div><Label>Notes</Label><Textarea value={deliveryForm.notes ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeliveryDialog(false); setEditDelivery(null); }}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!deliveryForm.deliveryDate || !deliveryForm.quantityLitres) { toast({ title: "Date and quantity required", variant: "destructive" }); return; }
              const totalCostPence = deliveryForm.unitPricePence && deliveryForm.quantityLitres ? Math.round(parseFloat(deliveryForm.unitPricePence) * parseFloat(deliveryForm.quantityLitres)) : undefined;
              if (editDelivery) {
                editDeliveryMut.mutate({ ...deliveryForm, totalCostPence });
              } else {
                deliveryMut.mutate({ ...deliveryForm, totalCostPence });
              }
            }}>{editDelivery ? "Save Changes" : "Log Delivery"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── USAGE DIALOG ── */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Fuel Usage</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={usageForm.usageDate ?? ""} onChange={e => setUsageForm(f => ({ ...f, usageDate: e.target.value }))} /></div>
              <div><Label>Tank</Label>
                <Select value={usageForm.tankId ?? ""} onValueChange={v => setUsageForm(f => ({ ...f, tankId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                  <SelectContent>{tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Vehicle / Machine</Label>
              <Select value={usageForm.vehicleName ?? ""} onValueChange={v => setUsageForm(f => ({ ...f, vehicleName: v, vehicleNameCustom: "" }))}>
                <SelectTrigger><SelectValue placeholder={motorEquipment.length ? "Select vehicle / machine" : "No equipment registered"} /></SelectTrigger>
                <SelectContent>
                  {motorEquipment.map(e => <SelectItem key={String(e.id)} value={String(e.name)}>{String(e.name)}</SelectItem>)}
                  <SelectItem value="__custom__">Other — type manually…</SelectItem>
                </SelectContent>
              </Select>
              {usageForm.vehicleName === "__custom__" && (
                <Input className="mt-1.5" value={usageForm.vehicleNameCustom ?? ""} onChange={e => setUsageForm(f => ({ ...f, vehicleNameCustom: e.target.value }))} placeholder="e.g. Case IH Puma 165, Grain Drier" />
              )}
            </div>
            <div><Label>Purpose / Activity *</Label><Input value={usageForm.purpose ?? ""} onChange={e => setUsageForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Ploughing — Home Field" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity (litres) *</Label><Input type="number" value={usageForm.quantityLitres ?? ""} onChange={e => setUsageForm(f => ({ ...f, quantityLitres: e.target.value }))} /></div>
              <div><Label>Qualifying activity</Label>
                <Select value={usageForm.qualifyingActivity ?? "agriculture"} onValueChange={v => setUsageForm(f => ({ ...f, qualifyingActivity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{QUALIFYING_ACTIVITIES.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Recorded by</Label>
              <Select value={usageForm.recordedBy ?? ""} onValueChange={v => setUsageForm(f => ({ ...f, recordedBy: v, recordedByCustom: "" }))}>
                <SelectTrigger><SelectValue placeholder={members.length ? "Select staff member" : "Type name below"} /></SelectTrigger>
                <SelectContent>
                  {members.map(m => {
                    const name = `${String(m.firstName ?? "")} ${String(m.lastName ?? "")}`.trim();
                    return <SelectItem key={String(m.id)} value={name}>{name}</SelectItem>;
                  })}
                  <SelectItem value="__custom__">Other — type manually…</SelectItem>
                </SelectContent>
              </Select>
              {(usageForm.recordedBy === "__custom__" || (!members.length && usageForm.recordedBy !== undefined)) && (
                <Input className="mt-1.5" value={usageForm.recordedByCustom ?? ""} onChange={e => setUsageForm(f => ({ ...f, recordedByCustom: e.target.value }))} placeholder="Staff member name" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fuel cost (p/litre) <span className="text-xs text-gray-400 font-normal">— auto from tank deliveries</span></Label>
                <Input
                  type="number" step="1" min="0"
                  placeholder="e.g. 110 (= £1.10/L)"
                  value={usageForm.costPencePerLitre ?? ""}
                  onChange={e => setUsageForm(f => ({ ...f, costPencePerLitre: e.target.value }))}
                />
                {usageForm.costPencePerLitre && usageForm.quantityLitres && (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    ≈ {((parseInt(usageForm.costPencePerLitre) * parseFloat(usageForm.quantityLitres)) / 100).toFixed(2)} £ total
                  </p>
                )}
              </div>
              <div>
                <Label>Field (optional)</Label>
                <Input placeholder="Field name or ID" value={usageForm.fieldId ?? ""} onChange={e => setUsageForm(f => ({ ...f, fieldId: e.target.value }))} />
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={usageForm.notes ?? ""} onChange={e => setUsageForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsageDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!usageForm.usageDate || !usageForm.quantityLitres || !usageForm.purpose) { toast({ title: "Date, quantity and purpose required", variant: "destructive" }); return; }
              const resolvedVehicle = usageForm.vehicleName === "__custom__" ? (usageForm.vehicleNameCustom || undefined) : (usageForm.vehicleName || undefined);
              const resolvedRecordedBy = usageForm.recordedBy === "__custom__" ? (usageForm.recordedByCustom || undefined) : (usageForm.recordedBy || undefined);
              const { vehicleNameCustom: _vnc, recordedByCustom: _rbc, ...rest } = usageForm;
              usageMut.mutate({
                ...rest,
                vehicleName: resolvedVehicle,
                recordedBy: resolvedRecordedBy,
                costPencePerLitre: usageForm.costPencePerLitre ? parseInt(usageForm.costPencePerLitre) : undefined,
                fieldId: usageForm.fieldId ? parseInt(usageForm.fieldId) : undefined,
              });
            }}>Record Usage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── INSPECTION DIALOG ── */}
      <Dialog open={showInspDialog} onOpenChange={setShowInspDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record Storage Inspection</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={inspForm.inspectionDate ?? ""} onChange={e => setInspForm(f => ({ ...f, inspectionDate: e.target.value }))} /></div>
              <div><Label>Tank</Label>
                <Select value={inspForm.tankId ?? ""} onValueChange={v => setInspForm(f => ({ ...f, tankId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                  <SelectContent>{tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Inspector</Label>
                <Select value={inspForm.inspector ?? ""} onValueChange={v => setInspForm(f => ({ ...f, inspector: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select inspector…" /></SelectTrigger>
                  <SelectContent>
                    {fuelActiveMembers.map((m: any) => {
                      const name = `${m.firstName} ${m.lastName}`.trim();
                      return <SelectItem key={m.id} value={name}>{name}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Result *</Label>
                <Select value={inspForm.overallResult ?? "pass"} onValueChange={v => setInspForm(f => ({ ...f, overallResult: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pass">Pass</SelectItem><SelectItem value="advisory">Advisory</SelectItem><SelectItem value="fail">Fail</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Checklist</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "bundingOk", label: "Bunding OK" }, { key: "labellingOk", label: "Labelling OK" },
                  { key: "spillKitPresent", label: "Spill kit present" }, { key: "spillKitComplete", label: "Spill kit complete" },
                  { key: "tankConditionOk", label: "Tank condition OK" }, { key: "pipeworkOk", label: "Pipework OK" },
                  { key: "fillPointLocked", label: "Fill point locked" }, { key: "overfillProtectionOk", label: "Overfill protection" },
                  { key: "drainageRiskOk", label: "Drainage risk OK" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Select value={inspForm[key] ?? ""} onValueChange={v => setInspForm(f => ({ ...f, [key]: v }))}>
                      <SelectTrigger className="h-7 text-xs w-16"><SelectValue placeholder="?" /></SelectTrigger>
                      <SelectContent><SelectItem value="true">✓</SelectItem><SelectItem value="false">✗</SelectItem></SelectContent>
                    </Select>
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Issues found</Label><Textarea value={inspForm.issuesFound ?? ""} onChange={e => setInspForm(f => ({ ...f, issuesFound: e.target.value }))} rows={2} /></div>
            <div><Label>Actions required</Label><Textarea value={inspForm.actionsRequired ?? ""} onChange={e => setInspForm(f => ({ ...f, actionsRequired: e.target.value }))} rows={2} /></div>
            <div><Label>Next inspection due</Label><Input type="date" value={inspForm.nextInspectionDue ?? ""} onChange={e => setInspForm(f => ({ ...f, nextInspectionDue: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={inspForm.notes ?? ""} onChange={e => setInspForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInspDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!inspForm.inspectionDate) { toast({ title: "Date required", variant: "destructive" }); return; }
              const boolFields = ["bundingOk", "labellingOk", "spillKitPresent", "spillKitComplete", "tankConditionOk", "pipeworkOk", "fillPointLocked", "overfillProtectionOk", "drainageRiskOk"];
              const data: Record<string, unknown> = { ...inspForm };
              boolFields.forEach(k => { if (data[k] !== undefined && data[k] !== "") data[k] = data[k] === "true"; else delete data[k]; });
              if (!data.tankId) delete data.tankId;
              inspMut.mutate(data);
            }}>Save Inspection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── METER DIALOG ── */}
      <Dialog open={showMeterDialog} onOpenChange={setShowMeterDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editMeter ? "Edit Meter" : "Add Energy Meter"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Meter name *</Label><Input value={meterForm.name ?? ""} onChange={e => setMeterForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Farmhouse Electricity" /></div>
              <div><Label>Meter type *</Label>
                <Select value={meterForm.meterType ?? "electricity"} onValueChange={v => setMeterForm(f => ({ ...f, meterType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{METER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Location / Building</Label><Input value={meterForm.location ?? ""} onChange={e => setMeterForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Farmhouse, Grain store, Livestock building" /></div>
            <div className="bg-blue-50 border border-blue-200 rounded p-2 grid grid-cols-2 gap-2">
              <div>
                <Label className="text-blue-800">MPAN (electricity)</Label>
                <Input value={meterForm.mpan ?? ""} onChange={e => setMeterForm(f => ({ ...f, mpan: e.target.value }))} placeholder="13-digit number on bill" className="font-mono text-sm" />
              </div>
              <div>
                <Label className="text-blue-800">MPRN (gas)</Label>
                <Input value={meterForm.mprn ?? ""} onChange={e => setMeterForm(f => ({ ...f, mprn: e.target.value }))} placeholder="6–10 digit number on bill" className="font-mono text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Supplier</Label><Input value={meterForm.supplier ?? ""} onChange={e => setMeterForm(f => ({ ...f, supplier: e.target.value }))} placeholder="e.g. OVO Energy" /></div>
              <div><Label>Account number</Label><Input value={meterForm.accountNumber ?? ""} onChange={e => setMeterForm(f => ({ ...f, accountNumber: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tariff name</Label><Input value={meterForm.tariffName ?? ""} onChange={e => setMeterForm(f => ({ ...f, tariffName: e.target.value }))} placeholder="e.g. Agri Flex 24" /></div>
              <div><Label>Unit rate (p/kWh)</Label><Input type="number" step="0.01" value={meterForm.unitRatePencePerKwh ?? ""} onChange={e => setMeterForm(f => ({ ...f, unitRatePencePerKwh: e.target.value }))} placeholder="24.5" /></div>
            </div>
            <div><Label>Standing charge (p/day)</Label><Input type="number" step="0.01" value={meterForm.standingChargePencePerDay ?? ""} onChange={e => setMeterForm(f => ({ ...f, standingChargePencePerDay: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={meterForm.notes ?? ""} onChange={e => setMeterForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMeterDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!meterForm.name || !meterForm.meterType) { toast({ title: "Name and type required", variant: "destructive" }); return; }
              const data: Record<string, unknown> = { ...meterForm };
              if (data.unitRatePencePerKwh) data.unitRatePencePerKwh = Math.round(parseFloat(String(data.unitRatePencePerKwh)) * 100) / 100;
              meterMut.mutate(data);
            }}>{editMeter ? "Save Changes" : "Add Meter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── READING DIALOG ── */}
      <Dialog open={showReadingDialog} onOpenChange={setShowReadingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Meter Reading</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Reading date *</Label><Input type="date" value={readingForm.readingDate ?? ""} onChange={e => setReadingForm(f => ({ ...f, readingDate: e.target.value }))} /></div>
              <div><Label>Meter *</Label>
                <Select value={readingForm.meterId ?? ""} onValueChange={v => setReadingForm(f => ({ ...f, meterId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select meter" /></SelectTrigger>
                  <SelectContent>{meters.map(m => <SelectItem key={String(m.id)} value={String(m.id)}>{String(m.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Meter reading *</Label><Input type="number" step="0.01" value={readingForm.meterReading ?? ""} onChange={e => setReadingForm(f => ({ ...f, meterReading: e.target.value }))} placeholder="Cumulative reading" className="font-mono" /></div>
              <div><Label>Reading type</Label>
                <Select value={readingForm.readingType ?? "actual"} onValueChange={v => setReadingForm(f => ({ ...f, readingType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actual">Actual read</SelectItem>
                    <SelectItem value="estimated">Estimated</SelectItem>
                    <SelectItem value="final">Final (change of tenancy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Consumption (kWh)</Label><Input type="number" step="0.01" value={readingForm.consumptionKwh ?? ""} onChange={e => setReadingForm(f => ({ ...f, consumptionKwh: e.target.value }))} placeholder="kWh since last reading" /></div>
              <div><Label>Export (kWh)</Label><Input type="number" step="0.01" value={readingForm.exportKwh ?? ""} onChange={e => setReadingForm(f => ({ ...f, exportKwh: e.target.value }))} placeholder="Solar / wind export" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bill cost (£)</Label><Input type="number" step="0.01" value={readingForm.costPounds ?? ""} onChange={e => setReadingForm(f => ({ ...f, costPounds: e.target.value }))} placeholder="Amount on bill" /></div>
              <div><Label>Invoice reference</Label><Input value={readingForm.invoiceReference ?? ""} onChange={e => setReadingForm(f => ({ ...f, invoiceReference: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Billing period start</Label><Input type="date" value={readingForm.billingPeriodStart ?? ""} onChange={e => setReadingForm(f => ({ ...f, billingPeriodStart: e.target.value }))} /></div>
              <div><Label>Billing period end</Label><Input type="date" value={readingForm.billingPeriodEnd ?? ""} onChange={e => setReadingForm(f => ({ ...f, billingPeriodEnd: e.target.value }))} /></div>
            </div>
            <div><Label>Recorded by</Label><Input value={readingForm.recordedBy ?? ""} onChange={e => setReadingForm(f => ({ ...f, recordedBy: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={readingForm.notes ?? ""} onChange={e => setReadingForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <div>
              <Label>Meter photo</Label>
              {readingForm.documentUrl ? (
                <div className="flex items-center gap-2 mt-1 p-2 rounded-md bg-green-50 border border-green-200">
                  <FileText className="w-4 h-4 text-green-600 shrink-0" />
                  <a href={`/api/storage${readingForm.documentUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 underline truncate flex-1">View attached photo</a>
                  <Button size="sm" variant="ghost" className="h-6 px-1 text-gray-400" onClick={() => setReadingForm(f => ({ ...f, documentUrl: "" }))}><XIcon className="w-3 h-3" /></Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="mt-1 w-full" disabled={isDocUploading} onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*,application/pdf";
                  input.onchange = async () => {
                    if (!input.files?.[0]) return;
                    const result = await uploadFile(input.files[0]);
                    if (result) setReadingForm(f => ({ ...f, documentUrl: result.objectPath }));
                  };
                  input.click();
                }}>
                  <Camera className="w-4 h-4 mr-1" />{isDocUploading ? "Uploading…" : "Attach meter photo"}
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReadingDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!readingForm.readingDate || !readingForm.meterId || !readingForm.meterReading) { toast({ title: "Date, meter and reading required", variant: "destructive" }); return; }
              const costPence = readingForm.costPounds ? Math.round(parseFloat(readingForm.costPounds) * 100) : undefined;
              const data: Record<string, unknown> = { ...readingForm, costPence };
              delete data.costPounds;
              if (!data.billingPeriodStart) delete data.billingPeriodStart;
              if (!data.billingPeriodEnd) delete data.billingPeriodEnd;
              if (!data.consumptionKwh) delete data.consumptionKwh;
              if (!data.exportKwh) delete data.exportKwh;
              if (!data.documentUrl) delete data.documentUrl;
              readingMut.mutate(data);
            }}>Save Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── STOCK CHECK DIALOG ── */}
      <Dialog open={showStockCheckDialog} onOpenChange={setShowStockCheckDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Physical Stock Check</DialogTitle></DialogHeader>
          <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
            Record the physically measured quantity (dip stick, sight gauge, or weighbridge). The system will calculate any variance against the running calculated total so discrepancies can be investigated.
          </div>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={stockCheckForm.checkDate ?? ""} onChange={e => setStockCheckForm(f => ({ ...f, checkDate: e.target.value }))} /></div>
              <div><Label>Tank *</Label>
                <Select value={stockCheckTankId || undefined} onValueChange={v => setStockCheckTankId(v)}>
                  <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                  <SelectContent>{tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Measured quantity (litres) *</Label><Input type="number" step="0.1" value={stockCheckForm.measuredLitres ?? ""} onChange={e => setStockCheckForm(f => ({ ...f, measuredLitres: e.target.value }))} placeholder="e.g. 4850" /></div>
              <div><Label>Method</Label>
                <Select value={stockCheckForm.method ?? "dip_stick"} onValueChange={v => setStockCheckForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dip_stick">Dip stick</SelectItem>
                    <SelectItem value="sight_gauge">Sight gauge</SelectItem>
                    <SelectItem value="flow_meter">Flow meter</SelectItem>
                    <SelectItem value="weighbridge">Weighbridge</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Checked by</Label><Input value={stockCheckForm.checkedBy ?? ""} onChange={e => setStockCheckForm(f => ({ ...f, checkedBy: e.target.value }))} placeholder="Name" /></div>
            <div><Label>Notes / actions</Label><Textarea value={stockCheckForm.notes ?? ""} onChange={e => setStockCheckForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any discrepancy investigation notes…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockCheckDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!stockCheckTankId || !stockCheckForm.checkDate || !stockCheckForm.measuredLitres) {
                toast({ title: "Tank, date and measured quantity are required", variant: "destructive" }); return;
              }
              stockCheckMut.mutate({ tankId: stockCheckTankId, ...stockCheckForm });
            }}>Save Stock Check</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId!}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Tank Inspection Overdue — ${raiseTaskFor.tankName ?? raiseTaskFor.fuelType ?? "Fuel Tank"}`}
          defaultDescription={`Location: ${raiseTaskFor.location ?? "—"} · Capacity: ${raiseTaskFor.capacityLitres ?? "—"} L · Inspect by: ${raiseTaskFor.nextInspectionDue ?? "—"}`}
          module="fuel-energy"
        />
      )}
    </AppLayout>
  );
}
