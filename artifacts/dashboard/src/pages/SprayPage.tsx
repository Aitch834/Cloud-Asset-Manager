import React, { useState, useRef, useEffect } from "react";
import { openPrintWindow } from "@/lib/print-report";
import { useLookupStrings } from "@/hooks/use-lookup";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Droplets, FlaskConical, Wind, Thermometer, ChevronDown, ChevronRight, ChevronUp, Printer, Pencil, ShieldAlert, Link2, ExternalLink, Loader2, MapPin, Truck, AlertTriangle, CheckCircle, History } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const SPRAY_PIE_COLOURS = ["#7c3aed","#16a34a","#f59e0b","#ef4444","#3b82f6","#14b8a6","#f97316","#84cc16"];

function ProductBarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs space-y-1 min-w-[180px]">
      <p className="font-semibold text-gray-800 text-sm truncate max-w-[220px]">{d.name}</p>
      <div className="flex justify-between gap-4">
        <span className="text-gray-500">Area sprayed</span>
        <span className="font-medium text-purple-700">{d.totalHa.toFixed(2)} ha</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-gray-500">Applications</span>
        <span className="font-medium text-gray-700">{d.count}</span>
      </div>
      {d.totalQty != null && (
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Total qty used</span>
          <span className="font-medium text-blue-700">
            {d.totalQty % 1 === 0 ? d.totalQty : d.totalQty.toFixed(2)}{d.displayUnit ? ` ${d.displayUnit}` : ""}
          </span>
        </div>
      )}
      {d.avgRate != null && (
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Avg rate</span>
          <span className="font-medium text-gray-700">
            {d.avgRate}{d.rateUnit ? ` ${d.rateUnit}` : ""}
          </span>
        </div>
      )}
      {d.totalSpendPence != null ? (
        <div className="flex justify-between gap-4 border-t border-gray-100 pt-1 mt-1">
          <span className="text-gray-500">Est. spend</span>
          <span className="font-semibold text-green-700">£{(d.totalSpendPence / 100).toFixed(2)}</span>
        </div>
      ) : (
        <div className="flex justify-between gap-4 border-t border-gray-100 pt-1 mt-1">
          <span className="text-gray-500">Est. spend</span>
          <span className="text-gray-400 italic">No price on record</span>
        </div>
      )}
    </div>
  );
}

function SprayAnalyticsTab({ applications, products, fields, cropYear, setCropYear }: { applications: any[]; products: any[]; fields: any[]; cropYear: number; setCropYear: (y: number) => void }) {

  const fieldMap = new Map(fields.map((f: any) => [f.id, f.name]));
  const productMap = new Map(products.map((p: any) => [p.id, p]));

  const filtered = applications.filter((a: any) =>
    a.applicationDate && isInCropYear(a.applicationDate, cropYear)
  );

  type ProdUsage = { name: string; category: string; totalHa: number; count: number; totalQty: number | null; rateUnit: string | null; mixedUnits: boolean; totalSpendPence: number | null };
  const productUsage = new Map<number, ProdUsage>();
  filtered.forEach((a: any) => {
    const prod = productMap.get(a.productId);
    const name = prod?.productName ?? `Product #${a.productId}`;
    const category = prod?.category ?? "Other";
    const ha = parseFloat(String(a.areaSprayedHa || 0));
    const rate = parseFloat(String(a.applicationRate || 0));
    const qty = isNaN(ha) || isNaN(rate) ? 0 : rate * ha;
    const unit: string | null = a.rateUnit ?? null;
    const unitCostPence: number | null = prod?.unitCostPence ?? null;

    if (!productUsage.has(a.productId)) {
      productUsage.set(a.productId, { name, category, totalHa: 0, count: 0, totalQty: 0, rateUnit: null, mixedUnits: false, totalSpendPence: null });
    }
    const b = productUsage.get(a.productId)!;
    b.totalHa += ha;
    b.count++;
    if (unit !== null) {
      if (b.rateUnit === null) {
        b.rateUnit = unit;
        b.totalQty = qty;
      } else if (b.rateUnit !== unit) {
        b.mixedUnits = true;
        b.totalQty = null;
      } else {
        b.totalQty = (b.totalQty ?? 0) + qty;
      }
    }
    if (unitCostPence != null && b.totalQty != null && !b.mixedUnits) {
      b.totalSpendPence = (b.totalSpendPence ?? 0) + qty * unitCostPence;
    }
  });

  const topProducts = [...productUsage.values()]
    .sort((a, b) => b.totalHa - a.totalHa)
    .slice(0, 12)
    .map(p => {
      const qty = p.mixedUnits ? null : (p.totalQty != null ? parseFloat(p.totalQty.toFixed(3)) : null);
      const displayUnit = p.rateUnit ? p.rateUnit.replace(/\/ha$/i, "").trim() : null;
      const qtyLabel = qty != null && displayUnit ? `${qty % 1 === 0 ? qty : qty.toFixed(2)} ${displayUnit}` : null;
      const totalHaRounded = parseFloat(p.totalHa.toFixed(2));
      const avgRate = qty != null && totalHaRounded > 0 ? parseFloat((qty / totalHaRounded).toFixed(2)) : null;
      return {
        ...p,
        totalHa: totalHaRounded,
        totalQty: qty,
        totalQtyLabel: qtyLabel,
        displayUnit,
        avgRate,
        totalSpendPence: p.mixedUnits ? null : p.totalSpendPence,
      };
    });

  const monthMap = new Map<string, { label: string; count: number; totalHa: number }>();
  filtered.forEach((a: any) => {
    if (!a.applicationDate) return;
    const d = new Date(a.applicationDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    if (!monthMap.has(key)) monthMap.set(key, { label, count: 0, totalHa: 0 });
    const b = monthMap.get(key)!;
    b.count++;
    b.totalHa += parseFloat(String(a.areaSprayedHa || 0));
  });
  const monthData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ ...v, totalHa: parseFloat(v.totalHa.toFixed(2)) }));

  const normaliseCategory = (c: string) => c.trim().length === 0 ? "Other" : c.trim().charAt(0).toUpperCase() + c.trim().slice(1).toLowerCase();
  const catMap = new Map<string, number>();
  filtered.forEach((a: any) => {
    const raw: string = productMap.get(a.productId)?.category ?? "Other";
    const cat = normaliseCategory(raw);
    catMap.set(cat, (catMap.get(cat) ?? 0) + parseFloat(String(a.areaSprayedHa || 0)));
  });
  const catData = [...catMap.entries()].sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));

  const fieldMap2 = new Map<string, number>();
  filtered.forEach((a: any) => {
    const fn = fieldMap.get(a.fieldId) ?? `Field #${a.fieldId}`;
    fieldMap2.set(fn, (fieldMap2.get(fn) ?? 0) + 1);
  });
  const fieldData = [...fieldMap2.entries()].sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));

  const totalHa = filtered.reduce((s: number, a: any) => s + parseFloat(String(a.areaSprayedHa || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-500">Showing data for crop year:</p>
        <CropYearSelector value={cropYear} onChange={setCropYear} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
          <Droplets className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No spray records for {cropYearLabel(cropYear)}</p>
          <p className="text-sm">Try a different crop year or log some applications.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Applications</p>
              <p className="text-2xl font-bold text-purple-700">{filtered.length}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Area Sprayed</p>
              <p className="text-2xl font-bold text-blue-700">{totalHa.toFixed(1)} ha</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">Products Used</p>
              <p className="text-2xl font-bold text-green-700">{productUsage.size}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Area Sprayed by Product (ha) — top {topProducts.length}</p>
            <ResponsiveContainer width="100%" height={Math.max(200, topProducts.length * 36)}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 4, right: 90, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `${v} ha`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <Tooltip content={<ProductBarTooltip />} />
                <Bar dataKey="totalHa" fill="#7c3aed" radius={[0, 3, 3, 0]}>
                  <LabelList dataKey="totalQtyLabel" position="right" style={{ fontSize: 11, fill: "#2563eb", fontWeight: 500 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Monthly Applications &amp; Area (ha)</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} unit=" ha" width={50} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit=" apps" width={45} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalHa" fill="#7c3aed" name="Area (ha)" radius={[3,3,0,0]} />
                  <Bar yAxisId="right" dataKey="count" fill="#0ea5e9" name="Applications" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Area by Product Category (ha)</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={90} label={false}>
                    {catData.map((_: any, i: number) => <Cell key={i} fill={SPRAY_PIE_COLOURS[i % SPRAY_PIE_COLOURS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} ha`, ""]} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(n: string) => <span style={{ fontSize: 11 }}>{n}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {fieldData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Applications by Field — top {fieldData.length}</p>
              <ResponsiveContainer width="100%" height={Math.max(160, fieldData.length * 34)}>
                <BarChart data={fieldData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit=" apps" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v: number) => [`${v} application${v !== 1 ? "s" : ""}`, ""]} />
                  <Bar dataKey="count" fill="#16a34a" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const SPRAY_EQUIPMENT_TYPES = ["sprayer", "spot-sprayer", "knapsack", "boom sprayer", "tractor", "uas", "drone", "other"];

function equipmentIsSprayRelevant(type: string) {
  const t = (type ?? "").toLowerCase();
  return SPRAY_EQUIPMENT_TYPES.some(k => t.includes(k)) || t.includes("spray");
}

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const RATE_UNITS = ["L/ha", "kg/ha", "g/ha", "mL/ha", "kg/1000L", "L/1000L"];
const WIND_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function degreesToCompass(deg: number): string {
  return WIND_DIRS[Math.round(deg / 45) % 8];
}
const PRODUCT_CATEGORIES_FALLBACK = ["Herbicide", "Fungicide", "Insecticide", "Molluscicide", "Growth Regulator", "Foliar Feed", "Adjuvant", "Other"];


type SprayTab = "applications" | "dayview" | "products" | "print" | "analytics" | "ipm" | "lerap" | "notifications" | "disposal" | "store" | "stocktakes";
const SPRAY_TAB_IDS: SprayTab[] = ["applications", "dayview", "products", "print", "analytics", "ipm", "lerap", "notifications", "disposal", "store", "stocktakes"];

export default function SprayPage() {
  const { farmId } = useAppStore();
  const productCategories = useLookupStrings("spray_product_categories", PRODUCT_CATEGORIES_FALLBACK);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = usePersistedTab<SprayTab>({ page: "spray", farmId, validIds: SPRAY_TAB_IDS, defaultTab: "applications" });

  const [cropYear, setCropYear] = useState<number>(currentCropYear());
  const applicationsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const productsQ = useQuery({ queryKey: ["spray-products", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const farmQ = useQuery({ queryKey: ["farm-detail", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()), enabled: !!farmId });
  const applications: any[] = applicationsQ.data ?? [];
  const products: any[] = productsQ.data ?? [];
  const fields: any[] = fieldsQ.data ?? [];
  const currentFarm = farmQ.data?.record ?? null;
  const initialFieldSearch = new URLSearchParams(window.location.search).get("field") ?? "";

  const yearApplications = applications.filter((a: any) =>
    a.applicationDate && isInCropYear(a.applicationDate, cropYear)
  );

  return (
    <AppLayout title="Spray Records">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">Field spray application records, product register, and printable assessor log — required for Red Tractor Crop Inputs compliance.</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <CropYearSelector value={cropYear} onChange={setCropYear} />
          <span className="text-xs text-gray-400">{cropYearLabel(cropYear)}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" }}>
          <StatCard icon={<Droplets size={18} color="#0369a1" />} label="Applications" value={yearApplications.length} bg="#f0f9ff" iconBg="#e0f2fe" />
          <StatCard icon={<FlaskConical size={18} color="#7c3aed" />} label="Products Registered" value={products.length} bg="#f5f3ff" iconBg="#ede9fe" />
          <StatCard icon={<Droplets size={18} color="#166534" />} label="Fields Treated" value={new Set(yearApplications.map((a: any) => a.fieldId)).size} bg="#f0fdf4" iconBg="#dcfce7" />
          <StatCard
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>}
            label="Area Treated (ha)"
            value={yearApplications.reduce((s: number, a: any) => s + parseFloat(String(a.areaSprayedHa || 0)), 0).toFixed(2) + " ha"}
            bg="#fffbeb"
            iconBg="#fef3c7"
          />
        </div>
        <TabBar className="mb-5">
          <TabButton active={tab === "applications"} onClick={() => setTab("applications")}>Applications Log</TabButton>
          <TabButton active={tab === "dayview"} onClick={() => setTab("dayview")}>Day View</TabButton>
          <TabButton active={tab === "products"} onClick={() => setTab("products")}>Product Register</TabButton>
          <TabButton active={tab === "print"} onClick={() => setTab("print")}>Print / Export</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>Analytics</TabButton>
          <TabButton active={tab === "ipm"} onClick={() => setTab("ipm")}>IPM Plan</TabButton>
          <TabButton active={tab === "lerap"} onClick={() => setTab("lerap")}>LERAP</TabButton>
          <TabButton active={tab === "notifications"} onClick={() => setTab("notifications")}>Notifications Log</TabButton>
          <TabButton active={tab === "disposal"} onClick={() => setTab("disposal")}>Container Disposal</TabButton>
          <TabButton active={tab === "store"} onClick={() => setTab("store")}>Store Inspections</TabButton>
          <TabButton active={tab === "stocktakes"} onClick={() => setTab("stocktakes")}>Stocktakes</TabButton>
        </TabBar>
        {tab === "applications" && <ApplicationsTab applications={applications} products={products} fields={fields} farmId={farmId} loading={applicationsQ.isLoading} onRefresh={() => qc.invalidateQueries({ queryKey: ["spray-applications", farmId] })} toast={toast} initialSearch={initialFieldSearch} cropYear={cropYear} setCropYear={setCropYear} />}
        {tab === "dayview" && <SprayDayViewTab applications={applications} loading={applicationsQ.isLoading} />}
        {tab === "products" && <ProductsTab products={products} farmId={farmId} loading={productsQ.isLoading} onRefresh={() => qc.invalidateQueries({ queryKey: ["spray-products", farmId] })} toast={toast} />}
        {tab === "print" && <PrintTab applications={applications} farm={currentFarm} cropYear={cropYear} setCropYear={setCropYear} />}
        {tab === "analytics" && <SprayAnalyticsTab applications={applications} products={products} fields={fields} cropYear={cropYear} setCropYear={setCropYear} />}
        {tab === "ipm" && <IpmPlanTab farmId={farmId!} />}
        {tab === "lerap" && <LerapTab farmId={farmId!} products={products} fields={fields} />}
        {tab === "notifications" && <SprayNotificationsTab farmId={farmId!} applications={applications} fields={fields} />}
        {tab === "disposal" && <ContainerDisposalTab farmId={farmId!} products={products} />}
        {tab === "store" && <StoreInspectionTab farmId={farmId!} />}
        {tab === "stocktakes" && <SprayStocktakesTab farmId={farmId!} products={products} />}
      </div>
    </AppLayout>
  );
}

function StatCard({ icon, label, value, bg, iconBg }: any) {
  return (
    <div style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ background: iconBg, borderRadius: 8, padding: 8 }}>{icon}</div>
      <div><p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>{label}</p><p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{value}</p></div>
    </div>
  );
}

// ─── Field Spray History Dialog ────────────────────────────────────────────────
function FieldSprayHistoryDialog({ field, applications, onClose }: { field: { id: number; name: string }; applications: any[]; onClose: () => void }) {
  const [yearFilter, setYearFilter] = React.useState<number | "all">("all");
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const fieldApps = applications.filter((a: any) => a.fieldId === field.id);
  const sorted = [...fieldApps].sort((a: any, b: any) => new Date(b.applicationDate ?? 0).getTime() - new Date(a.applicationDate ?? 0).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter((a: any) => a.applicationDate && new Date(a.applicationDate).getFullYear() === yearFilter);
  const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  function handlePrint() {
    const rows = filtered.map((r: any) => `<tr><td>${fmtDate(r.applicationDate)}</td><td>${r.productName || "—"}</td><td>${r.targetCrop || "—"}</td><td>${r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}`.trim() : "—"}</td><td>${r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—"}</td><td>${r.operatorName || "—"}</td><td>${r.reasonForApplication || "—"}</td><td>${r.batchNumber || "—"}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (w) { w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Spray History — ${field.name}</title><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:5px 7px;text-align:left;font-size:8.5pt}td{padding:4px 7px;border-bottom:1px solid #e5e7eb;font-size:9pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1 style="font-size:14pt">Spray Application History — ${field.name}</h1><p style="font-size:9pt;color:#555">Printed: ${new Date().toLocaleDateString("en-GB")} · ${filtered.length} application${filtered.length !== 1 ? "s" : ""}${yearFilter !== "all" ? ` (${yearFilter})` : ""}</p><table><thead><tr><th>Date</th><th>Product</th><th>Crop</th><th>Rate</th><th>Area</th><th>Operator</th><th>Reason</th><th>Batch No.</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">Red Tractor requirement: retain spray records for a minimum of 3 years.</p></body></html>`); w.document.close(); w.focus(); w.print(); }
  }

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><History className="w-4 h-4 text-green-700" />Spray History — {field.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 flex-wrap border-b pb-3">
          {(["all", ...recentYears] as (number | "all")[]).map(y => (
            <button key={y} onClick={() => setYearFilter(y)} style={{ padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }}>
              {y === "all" ? "All years" : y}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} application{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", color: "#9ca3af", gap: 8 }}>
              <Droplets size={32} color="#d1d5db" />
              <p style={{ fontSize: "0.875rem" }}>No spray applications{yearFilter !== "all" ? ` in ${yearFilter}` : ""} for {field.name}</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Date", "Product", "Crop", "Rate", "Area (ha)", "Operator", "Reason", "Batch", ""].map(h => (
                    <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any, i: number) => {
                  const isExpanded = expandedId === r.id;
                  const bg = i % 2 === 0 ? "#fff" : "#fafafa";
                  const hasExtra = !!(r.reasonForApplication || r.notes || r.growthStage || r.waterVolumeLitres != null || r.windSpeedKmh != null || r.temperatureC != null || r.bufferZoneMetres != null || r.certificateNumber || r.lotNumber);
                  return (
                    <React.Fragment key={r.id}>
                      <tr style={{ borderBottom: isExpanded ? "none" : "1px solid #f3f4f6", background: bg }}>
                        <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280" }}>{fmtDate(r.applicationDate)}</td>
                        <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "#1e40af" }}>{r.productName || "—"}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: "#065f46" }}>{r.targetCrop || "—"}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: "#374151" }}>{r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}`.trim() : "—"}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.areaSprayedHa || "—"}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.operatorName || "—"}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reasonForApplication || "—"}</td>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#374151" }}>{r.batchNumber || "—"}</td>
                        <td style={{ padding: "0.5rem 0.5rem", textAlign: "center" }}>
                          {hasExtra && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px", borderRadius: 4, display: "flex", alignItems: "center" }}
                              title={isExpanded ? "Collapse" : "Show full details"}
                            >
                              <ChevronDown size={15} style={{ transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr style={{ background: bg, borderBottom: "1px solid #f3f4f6" }}>
                          <td colSpan={9} style={{ padding: "0 0.75rem 0.75rem 0.75rem" }}>
                            <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem 1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.5rem 1.5rem" }}>
                              {r.reasonForApplication && (
                                <div style={{ gridColumn: "1 / -1" }}>
                                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Reason for Application</span>
                                  <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151", lineHeight: 1.5 }}>{r.reasonForApplication}</p>
                                </div>
                              )}
                              {r.notes && (
                                <div style={{ gridColumn: "1 / -1" }}>
                                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Notes</span>
                                  <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151", lineHeight: 1.5 }}>{r.notes}</p>
                                </div>
                              )}
                              {r.growthStage && <div><span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Growth Stage</span><p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }}>{r.growthStage}</p></div>}
                              {r.waterVolumeLitres != null && <div><span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Water Volume</span><p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }}>{r.waterVolumeLitres} L/ha</p></div>}
                              {r.temperatureC != null && <div><span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Temperature</span><p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }}>{r.temperatureC}°C</p></div>}
                              {(r.windSpeedKmh != null || r.windDirection) && <div><span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Wind</span><p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }}>{[r.windSpeedKmh != null ? `${r.windSpeedKmh} km/h` : null, r.windDirection].filter(Boolean).join(" · ")}</p></div>}
                              {r.bufferZoneMetres != null && <div><span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Buffer Zone</span><p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }}>{r.bufferZoneMetres} m</p></div>}
                              {r.certificateNumber && <div><span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Certificate No.</span><p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151", fontFamily: "monospace" }}>{r.certificateNumber}</p></div>}
                              {r.lotNumber && <div><span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Lot No.</span><p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#374151", fontFamily: "monospace" }}>{r.lotNumber}</p></div>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <DialogFooter className="border-t pt-3 flex-row items-center gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground flex-1">Red Tractor: retain spray records for a minimum of <strong>3 years</strong>.</p>
          <div className="flex gap-2">
            {filtered.length > 0 && <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5"><Printer size={14} className="mr-1" />Print / Export</Button>}
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApplicationsTab({ applications, products, fields, farmId, loading, onRefresh, toast, initialSearch, cropYear, setCropYear }: any) {
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const activeMembers: any[] = (membersData?.members ?? []).filter((m: any) => m.isActive);

  const equipmentQ = useQuery({
    queryKey: ["equipment-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const sprayEquipment: any[] = (equipmentQ.data ?? []).filter((e: any) => equipmentIsSprayRelevant(e.type) && e.isActive !== false);

  const certificatesQ = useQuery({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const allCerts: any[] = certificatesQ.data ?? [];

  const suppliersQ = useQuery({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const allSuppliers: any[] = suppliersQ.data ?? [];
  const sprayReasons = useLookupStrings("spray_application_reasons");
  const bbchStages = useLookupStrings("spray_bbch_stages");

  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [filterField, setFilterField] = useState("__all__");
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [historyField, setHistoryField] = useState<{ id: number; name: string } | null>(null);
  const emptyForm = { fieldId: "", productId: "", applicationDate: new Date().toISOString().slice(0, 10), applicationRate: "", rateUnit: "L/ha", areaSprayedHa: "", waterVolumeLitres: "", windSpeedKmh: "", windDirection: "", temperatureC: "", operatorName: "", operatorMemberId: "", certificateNumber: "", equipmentUsed: "", equipmentId: "", supplierId: "", reasonForApplication: "", batchNumber: "", lotNumber: "", stockDeliveryId: "", bufferZoneMetres: "", waterSourceNearby: "", notes: "", targetCrop: "", growthStage: "", productCostPencePerUnit: "" };
  const [form, setForm] = useState<any>(emptyForm);
  const [weatherAutoFilled, setWeatherAutoFilled] = useState(false);
  const [cropAutoFilled, setCropAutoFilled] = useState(false);
  const [areaAutoFilled, setAreaAutoFilled] = useState(false);
  const [vehicleStationFilled, setVehicleStationFilled] = useState<any>(null);
  const [weatherFetching, setWeatherFetching] = useState(false);
  const [weatherFetchMsg, setWeatherFetchMsg] = useState<string | null>(null);
  const [deliveryStockItemId, setDeliveryStockItemId] = useState<string | null>(null);
  const formOpen = addOpen || !!editRecord;
  function openEdit(r: any) {
    setEditRecord(r);
    setDeliveryStockItemId(r.stockDeliveryId ? String(r.stockDeliveryId) : null);
    setWeatherAutoFilled(false);
    setForm({
      fieldId: r.fieldId ? String(r.fieldId) : "",
      productId: r.productId ? String(r.productId) : "",
      applicationDate: r.applicationDate ? r.applicationDate.slice(0, 10) : "",
      applicationRate: r.applicationRate != null ? String(r.applicationRate) : "",
      rateUnit: r.rateUnit || "L/ha",
      areaSprayedHa: r.areaSprayedHa != null ? String(r.areaSprayedHa) : "",
      waterVolumeLitres: r.waterVolumeLitres != null ? String(r.waterVolumeLitres) : "",
      windSpeedKmh: r.windSpeedKmh != null ? String(r.windSpeedKmh) : "",
      windDirection: r.windDirection || "",
      temperatureC: r.temperatureC != null ? String(r.temperatureC) : "",
      operatorName: r.operatorName || "",
      operatorMemberId: r.operatorMemberId ? String(r.operatorMemberId) : "",
      certificateNumber: r.certificateNumber || "",
      equipmentUsed: r.equipmentUsed || "",
      equipmentId: r.equipmentId ? String(r.equipmentId) : "",
      supplierId: r.supplierId ? String(r.supplierId) : "",
      reasonForApplication: r.reasonForApplication || "",
      batchNumber: r.batchNumber || "",
      lotNumber: r.lotNumber || "",
      stockDeliveryId: r.stockDeliveryId ? String(r.stockDeliveryId) : "",
      bufferZoneMetres: r.bufferZoneMetres != null ? String(r.bufferZoneMetres) : "",
      waterSourceNearby: r.waterSourceNearby || "",
      notes: r.notes || "",
      targetCrop: r.targetCrop || "",
      growthStage: r.growthStage || "",
      productCostPencePerUnit: r.productCostPencePerUnit ?? "",
    });
  }
  function closeForm() { setAddOpen(false); setEditRecord(null); setForm(emptyForm); setDeliveryStockItemId(null); setWeatherAutoFilled(false); setCropAutoFilled(false); setAreaAutoFilled(false); setVehicleStationFilled(null); setWeatherFetchMsg(null); setWeatherFetching(false); }

  useEffect(() => {
    if (!formOpen || editRecord) return;
    if (!form.fieldId || !form.applicationDate) { setCropAutoFilled(false); return; }
    const fieldObj = fields.find((f: any) => String(f.id) === String(form.fieldId));
    if (!fieldObj) return;
    fetch(`/api/farms/${farmId}/crop-for-field?fieldName=${encodeURIComponent(fieldObj.name)}&date=${form.applicationDate}`)
      .then(r => r.json())
      .then(d => {
        if (d.found && d.cropName) {
          setForm((f: any) => ({ ...f, targetCrop: d.cropName }));
          setCropAutoFilled(true);
        }
      })
      .catch(() => {});
  }, [form.fieldId, form.applicationDate, formOpen, editRecord]);

  const deliveriesQ = useQuery({
    queryKey: ["spray-batch-deliveries", farmId, deliveryStockItemId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries/by-product/${deliveryStockItemId}`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId && !!deliveryStockItemId,
  });

  const vehicleWeatherQ = useQuery({
    queryKey: ["vehicle-weather", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-readings`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.records ?? [],
  });
  const vehicleReadings: any[] = vehicleWeatherQ.data ?? [];

  const handleProductChange = (v: string) => {
    const product = products.find((p: any) => String(p.id) === v);
    setDeliveryStockItemId(product?.stockItemId ? String(product.stockItemId) : null);
    setForm((f: any) => ({ ...f, productId: v, batchNumber: "", lotNumber: "", stockDeliveryId: "" }));
  };

  const handleOperatorChange = (memberId: string) => {
    if (!memberId || memberId === "__manual__") {
      setForm((f: any) => ({ ...f, operatorMemberId: "", operatorName: "" }));
      return;
    }
    const member = activeMembers.find((m: any) => String(m.id) === memberId);
    if (!member) return;
    const fullName = memberFullName(member);
    let certNumber = "";
    // Certs can be stored under linkedUserId, numeric id, or display name — check all three
    const memberUserKeys = new Set<string>([String(member.id), fullName]);
    if (member.linkedUserId) memberUserKeys.add(member.linkedUserId);
    const paTypes = ["PA1", "PA2", "PA6", "PA4", "PA3"];
    const now = new Date();
    for (const paType of paTypes) {
      const cert = allCerts.find((c: any) =>
        memberUserKeys.has(String(c.userId)) &&
        (c.certificateType ?? "").toUpperCase().includes(paType) &&
        (!c.expiryDate || new Date(c.expiryDate) > now)
      );
      if (cert) { certNumber = cert.certificateNumber ?? ""; break; }
    }
    if (!certNumber) {
      const anyCert = allCerts.find((c: any) =>
        memberUserKeys.has(String(c.userId)) &&
        (!c.expiryDate || new Date(c.expiryDate) > now)
      );
      if (anyCert) certNumber = anyCert.certificateNumber ?? "";
    }
    setForm((f: any) => ({ ...f, operatorMemberId: memberId, operatorName: fullName, certificateNumber: certNumber }));
  };

  const handleDeliveryChange = (v: string) => {
    if (v === "__none__") {
      setForm((f: any) => ({ ...f, stockDeliveryId: "", batchNumber: "", lotNumber: "", supplierId: "" }));
    } else {
      const del = (deliveriesQ.data ?? []).find((d: any) => String(d.id) === v);
      // Compute unit price from delivery (pence per stock unit = costPence / quantity)
      const unitPricePence = del?.costPence && del?.quantity && parseFloat(String(del.quantity)) > 0
        ? Math.round(Number(del.costPence) / parseFloat(String(del.quantity)))
        : null;
      setForm((f: any) => ({
        ...f,
        stockDeliveryId: v,
        batchNumber: del?.batchNumber || f.batchNumber,
        lotNumber: del?.lotNumber || f.lotNumber,
        supplierId: del?.supplierId ? String(del.supplierId) : f.supplierId,
        productCostPencePerUnit: unitPricePence != null ? String(unitPricePence) : f.productCostPencePerUnit,
      }));
    }
  };

  async function fetchWeatherForDate(date: string) {
    if (!date || !farmId) return;
    const target = new Date(date).getTime();
    try {
      // 1. Try API-connected weather stations first
      try {
        const sensorData = await fetch(`/api/farms/${farmId}/sensor-readings?category=weather&limit=200`).then(r => r.json());
        const sensorReadings: any[] = sensorData.readings ?? [];
        if (sensorReadings.length > 0) {
          const sorted = [...sensorReadings].sort((a, b) =>
            Math.abs(new Date(a.recordedAt).getTime() - target) - Math.abs(new Date(b.recordedAt).getTime() - target)
          );
          const closestTs = new Date(sorted[0].recordedAt).getTime();
          if (Math.abs(closestTs - target) < 86400000 * 2) {
            const window = sensorReadings.filter(r => Math.abs(new Date(r.recordedAt).getTime() - closestTs) < 30 * 60000);
            const getVal = (param: string) => window.find((r: any) => r.parameter === param)?.value;
            const temp    = getVal("air_temperature") ?? getVal("temperature");
            const wind    = getVal("wind_speed");
            const windDir = getVal("wind_direction");
            if (temp != null || wind != null) {
              setForm((f: any) => ({
                ...f,
                temperatureC:  temp    != null ? String(Math.round(Number(temp) * 10) / 10) : f.temperatureC,
                windSpeedKmh:  wind    != null ? String(Math.round(Number(wind)))             : f.windSpeedKmh,
                windDirection: windDir != null ? degreesToCompass(Number(windDir))             : f.windDirection,
              }));
              setWeatherAutoFilled(true);
              return;
            }
          }
        }
      } catch { /* fall through */ }

      // 2. Fall back to manually logged weather readings
      const data = await fetch(`/api/farms/${farmId}/weather-readings`).then(r => r.json());
      const readings: any[] = data.records ?? [];
      if (readings.length === 0) return;
      let closest: any = null;
      let closestDiff = Infinity;
      for (const r of readings) {
        if (!r.readingTimestamp) continue;
        const diff = Math.abs(new Date(r.readingTimestamp).getTime() - target);
        if (diff < closestDiff) { closestDiff = diff; closest = r; }
      }
      if (closest && closestDiff < 86400000 * 2) {
        setForm((f: any) => ({
          ...f,
          windSpeedKmh:  closest.windSpeedKmh  != null ? String(closest.windSpeedKmh)  : f.windSpeedKmh,
          windDirection: closest.windDirection  || f.windDirection,
          temperatureC:  closest.temperatureC  != null ? String(closest.temperatureC)  : f.temperatureC,
        }));
        setWeatherAutoFilled(true);
      }
    } catch { /* ignore */ }
  }

  function checkVehicleWeather(equipmentId: string, date: string) {
    if (!equipmentId || !date || equipmentId === "__other__") { setVehicleStationFilled(null); return; }
    const target = new Date(date).getTime();
    const forEq = vehicleReadings.filter(r => r.equipmentId && String(r.equipmentId) === equipmentId && r.readingTimestamp);
    if (forEq.length === 0) { setVehicleStationFilled(null); return; }
    let best: any = null, bestDiff = Infinity;
    for (const r of forEq) {
      const diff = Math.abs(new Date(r.readingTimestamp).getTime() - target);
      if (diff < bestDiff) { bestDiff = diff; best = r; }
    }
    if (best && bestDiff < 86400000 * 2) {
      setVehicleStationFilled(best);
      setWeatherAutoFilled(false);
      setForm((f: any) => ({
        ...f,
        windSpeedKmh: best.windSpeedKmh != null ? String(best.windSpeedKmh) : f.windSpeedKmh,
        windDirection: best.windDirection || f.windDirection,
        temperatureC: best.temperatureC != null ? String(best.temperatureC) : f.temperatureC,
      }));
    } else {
      setVehicleStationFilled(null);
    }
  }

  async function fetchLiveWeather() {
    setWeatherFetching(true);
    setWeatherFetchMsg(null);
    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Weather service error ${resp.status}`);
      const data = await resp.json();
      const c = data.current;
      setForm((f: any) => ({
        ...f,
        windSpeedKmh: c.wind_speed_10m != null ? String(Math.round(c.wind_speed_10m)) : f.windSpeedKmh,
        windDirection: c.wind_direction_10m != null ? degreesToCompass(c.wind_direction_10m) : f.windDirection,
        temperatureC: c.temperature_2m != null ? String(Math.round(c.temperature_2m * 10) / 10) : f.temperatureC,
      }));
      setWeatherAutoFilled(false);
      setWeatherFetchMsg(`Live · ${latitude.toFixed(3)}°N, ${Math.abs(longitude).toFixed(3)}°${longitude < 0 ? "W" : "E"}`);
    } catch (err) {
      setWeatherFetchMsg(`Could not fetch: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setWeatherFetching(false);
    }
  }

  const buildPayload = (body: any) => ({
    ...body,
    growthStage: body.growthStage === "__other__" ? "" : (body.growthStage || null),
    reasonForApplication: body.reasonForApplication === "__other__" ? "" : (body.reasonForApplication || ""),
    stockDeliveryId: body.stockDeliveryId ? Number(body.stockDeliveryId) : null,
    equipmentId: body.equipmentId ? Number(body.equipmentId) : null,
    supplierId: body.supplierId ? Number(body.supplierId) : null,
    operatorMemberId: body.operatorMemberId ? Number(body.operatorMemberId) : null,
    batchNumber: body.batchNumber || null,
    lotNumber: body.lotNumber || null,
    productCostPencePerUnit: body.productCostPencePerUnit !== "" && body.productCostPencePerUnit != null ? Number(body.productCostPencePerUnit) : null,
  });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/spray-applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload(body)) }).then(r => { if (!r.ok) throw new Error(`Save failed (${r.status})`); return r; }),
    onSuccess: () => { toast({ title: "Application recorded" }); onRefresh(); closeForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      fetch(`/api/farms/${farmId}/spray-applications/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload(body)) }).then(r => { if (!r.ok) throw new Error(`Update failed (${r.status})`); return r; }),
    onSuccess: () => { toast({ title: "Application updated" }); onRefresh(); closeForm(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-applications/${id}`, { method: "DELETE" }).then(r => { if (!r.ok) throw new Error(`Delete failed (${r.status})`); return r; }),
    onSuccess: () => { toast({ title: "Record deleted" }); onRefresh(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const fieldNamesInYear = Array.from(
    new Set(
      applications
        .filter((r: any) => isInCropYear(r.applicationDate, cropYear))
        .map((r: any) => r.fieldName)
        .filter(Boolean)
    )
  ).sort() as string[];

  const filtered = applications.filter((r: any) => {
    if (!isInCropYear(r.applicationDate, cropYear)) return false;
    if (filterField !== "__all__" && r.fieldName !== filterField) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return r.fieldName?.toLowerCase().includes(s) || r.productName?.toLowerCase().includes(s) || r.operatorName?.toLowerCase().includes(s) || r.reasonForApplication?.toLowerCase().includes(s);
  });

  return (
    <>
      {historyField && <FieldSprayHistoryDialog field={historyField} applications={applications} onClose={() => setHistoryField(null)} />}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={filterField} onValueChange={setFilterField}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All fields" />
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto">
            <SelectItem value="__all__">All fields</SelectItem>
            {fieldNamesInYear.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CropYearSelector value={cropYear} onChange={v => { setCropYear(v); setFilterField("__all__"); }} />
        <Button size="sm" onClick={() => { setForm(emptyForm); setDeliveryStockItemId(null); setAddOpen(true); }}><Plus size={14} className="mr-1" />Log Application</Button>
      </div>

      {!loading && filtered.length > 0 && (() => {
        const totalArea = filtered.reduce((s: number, r: any) => s + parseFloat(String(r.areaSprayedHa || 0)), 0);
        const hasWater = filtered.some((r: any) => r.waterVolumeLitres);
        const totalWater = hasWater ? filtered.reduce((s: number, r: any) => s + parseFloat(String(r.waterVolumeLitres || 0)), 0) : 0;
        const uniqueProducts = new Set(filtered.map((r: any) => r.productName).filter(Boolean)).size;
        const uniqueFields = new Set(filtered.map((r: any) => r.fieldName).filter(Boolean)).size;
        const byProduct: Record<string, { count: number; ha: number }> = {};
        filtered.forEach((r: any) => {
          const key = String(r.productName || "Unknown");
          if (!byProduct[key]) byProduct[key] = { count: 0, ha: 0 };
          byProduct[key].count++;
          byProduct[key].ha += parseFloat(String(r.areaSprayedHa || 0));
        });
        const productRows = Object.entries(byProduct).sort((a, b) => b[1].ha - a[1].ha);
        return (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: productRows.length > 1 ? 10 : 0, flexWrap: "wrap" }}>
              <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em", margin: "0 0 3px" }}>Applications</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#4c1d95", lineHeight: 1, margin: 0 }}>{filtered.length}</p>
              </div>
              <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 16px", minWidth: 150 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Area Treated</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#4c1d95", lineHeight: 1, margin: 0 }}>{totalArea.toFixed(2)} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>ha</span></p>
              </div>
              {uniqueProducts > 0 && (
                <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em", margin: "0 0 3px" }}>Products Used</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#4c1d95", lineHeight: 1, margin: 0 }}>{uniqueProducts}</p>
                </div>
              )}
              {uniqueFields > 0 && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Fields Treated</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }}>{uniqueFields}</p>
                </div>
              )}
              {hasWater && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 160 }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Water Volume</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }}>{totalWater.toFixed(0)} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>L</span></p>
                </div>
              )}
            </div>
            {productRows.length > 1 && (
              <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 14px" }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em", margin: "0 0 8px" }}>By Product</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
                  {productRows.map(([product, vals]) => (
                    <span key={product} style={{ fontSize: "0.75rem", color: "#4c1d95" }}>
                      <span style={{ fontWeight: 700 }}>{product}</span>
                      <span style={{ color: "#7c3aed", marginLeft: 4 }}>{vals.count} app{vals.count !== 1 ? "s" : ""} — {vals.ha.toFixed(2)} ha</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <EmptyState icon={<Droplets size={28} color="#9ca3af" />} title="No spray applications recorded" subtitle="Log each field application to build your Red Tractor crop inputs record." />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["", "Date", "Field", "Crop", "Product", "Rate", "Area (ha)", "Operator", "Reason", "Weather", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, i: number) => (
                <React.Fragment key={r.id}>
                  <tr style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                    <td style={{ padding: "0.5rem 0.5rem 0.5rem 0.75rem", width: 24, color: "#9ca3af" }}>
                      {expandedId === r.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280" }}>{fmt(r.applicationDate)}</td>
                    <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.fieldName || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#065f46", fontWeight: 500 }}>{r.targetCrop || <span style={{ color: "#fca5a5", fontSize: "0.75rem", fontWeight: 400 }}>Not recorded</span>}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      <span style={{ fontWeight: 500, color: "#1e40af" }}>{r.productName || "—"}</span>
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#374151" }}>{r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}` : "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.operatorName || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reasonForApplication || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      {(r.windSpeedKmh || r.temperatureC) ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#6b7280" }}>
                          {r.windSpeedKmh && <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}><Wind size={11} />{r.windSpeedKmh} km/h {r.windDirection || ""}</span>}
                          {r.temperatureC && <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}><Thermometer size={11} />{r.temperatureC}°C</span>}
                        </span>
                      ) : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.5rem" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                        {r.fieldId != null && <button onClick={() => setHistoryField({ id: r.fieldId, name: r.fieldName || "Field" })} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="Field spray history"><History size={13} /></button>}
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
                            ["Target Crop", r.targetCrop],
                            ["Growth Stage", r.growthStage],
                            ["Water Volume", r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : null],
                            ["Equipment Used", r.equipmentName ? `${r.equipmentName}${r.equipmentUsed && r.equipmentUsed !== r.equipmentName ? ` — ${r.equipmentUsed}` : ""}` : r.equipmentUsed],
                            ["PA1/PA6 Certificate", r.certificateNumber],
                            ["Supplier", r.supplierName || null],
                            ["Batch Number", r.batchNumber],
                            ["Lot Number", r.lotNumber],
                            ["Wind Speed", r.windSpeedKmh ? `${r.windSpeedKmh} km/h` : null],
                            ["Wind Direction", r.windDirection],
                            ["Temperature", r.temperatureC ? `${r.temperatureC}°C` : null],
                            ["Notes", r.notes],
                          ].map(([k, v]) => v ? (
                            <div key={k}><span style={{ color: "#9ca3af", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>{k}</span><span style={{ color: "#374151", fontWeight: 500, fontFamily: (k === "Batch Number" || k === "Lot Number") ? "monospace" : "inherit" }}>{v}</span></div>
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

      <Dialog open={formOpen} onOpenChange={o => { if (!o) closeForm(); }}>
        <DialogContent style={{ maxWidth: 600 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Spray Application" : "Log Spray Application"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Field <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.fieldId} onValueChange={v => {
                  const fieldObj = fields.find((f: any) => String(f.id) === v);
                  const fieldArea = fieldObj ? (fieldObj.computedFarmableAreaHa ?? fieldObj.areaHectares ?? "") : "";
                  setForm((f: any) => ({ ...f, fieldId: v, areaSprayedHa: fieldArea ? String(parseFloat(String(fieldArea)).toFixed(2)) : f.areaSprayedHa }));
                  if (fieldArea) setAreaAutoFilled(true); else setAreaAutoFilled(false);
                }}>
                  <SelectTrigger><SelectValue placeholder="Select field..." /></SelectTrigger>
                  <SelectContent>{fields.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.name}{f.areaHectares ? ` (${parseFloat(String(f.areaHectares)).toFixed(2)} ha)` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Application Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" value={form.applicationDate} onChange={e => { const d = e.target.value; setWeatherAutoFilled(false); setVehicleStationFilled(null); setForm((f: any) => ({ ...f, applicationDate: d })); fetchWeatherForDate(d); checkVehicleWeather(form.equipmentId, d); }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Target Crop (being sprayed) <span style={{ color: "#ef4444" }}>*</span></Label>
                <div style={{ position: "relative" }}>
                  <Input
                    placeholder="e.g. Winter Wheat, OSR, Sugar Beet"
                    value={form.targetCrop}
                    onChange={e => { setForm((f: any) => ({ ...f, targetCrop: e.target.value })); setCropAutoFilled(false); }}
                  />
                  {cropAutoFilled && (
                    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#dcfce7", color: "#16a34a", fontSize: "0.68rem", fontWeight: 600, borderRadius: 4, padding: "1px 6px", pointerEvents: "none" }}>Auto-filled</span>
                  )}
                </div>
              </div>
              <div>
                <Label>Growth Stage (BBCH)</Label>
                {(() => {
                  const isCustomGs = !!form.growthStage && bbchStages.length > 0 && !bbchStages.includes(form.growthStage);
                  const gsSelectVal = isCustomGs ? "__other__" : (form.growthStage || "");
                  return bbchStages.length === 0 ? (
                    <Input placeholder="e.g. GS31, BBCH 31–32" value={form.growthStage} onChange={e => setForm((f: any) => ({ ...f, growthStage: e.target.value }))} />
                  ) : (
                    <>
                      <Select value={gsSelectVal} onValueChange={v => { if (v === "__other__") { setForm((f: any) => ({ ...f, growthStage: "__other__" })); return; } setForm((f: any) => ({ ...f, growthStage: v })); }}>
                        <SelectTrigger><SelectValue placeholder="Select growth stage..." /></SelectTrigger>
                        <SelectContent>
                          {bbchStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          <SelectItem value="__other__">Other (specify below)</SelectItem>
                        </SelectContent>
                      </Select>
                      {(isCustomGs || gsSelectVal === "__other__") && (
                        <Input className="mt-1" style={{ fontSize: "0.8rem" }} placeholder="e.g. GS31, BBCH 31–32, flag leaf" value={form.growthStage === "__other__" ? "" : form.growthStage} onChange={e => setForm((f: any) => ({ ...f, growthStage: e.target.value }))} />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            <div>
              <Label>Product <span style={{ color: "#ef4444" }}>*</span></Label>
              <Select value={form.productId} onValueChange={handleProductChange}>
                <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                <SelectContent>{products.length === 0 ? <SelectItem value="__none__" disabled>Add products in the Product Register tab first</SelectItem> : products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.productName}{p.activeIngredient ? ` (${p.activeIngredient})` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {(() => {
              const selectedProduct = form.productId ? products.find((p: any) => String(p.id) === String(form.productId)) : null;
              if (!selectedProduct?.stockItemId) return null;
              const qty = selectedProduct.currentStockQuantity;
              const unit = (selectedProduct.stockUnit || "").trim();
              const isOut = qty !== null && qty <= 0;
              const isLow = qty !== null && qty > 0 && qty < 10;
              const bg = isOut ? "#fef2f2" : isLow ? "#fffbeb" : "#f0fdf4";
              const border = isOut ? "#fecaca" : isLow ? "#fcd34d" : "#bbf7d0";
              const textColor = isOut ? "#991b1b" : isLow ? "#92400e" : "#166534";
              return (
                <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "0.6rem 0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.8rem", color: textColor, fontWeight: 600 }}>Current stock:</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: textColor }}>
                    {qty !== null ? `${qty % 1 === 0 ? qty : qty.toFixed(2)}${unit ? ` ${unit}` : ""}` : "Not tracked"}
                  </span>
                  {isOut && <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#dc2626", fontWeight: 700 }}>⚠ OUT OF STOCK</span>}
                  {isLow && <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#b45309", fontWeight: 700 }}>⚠ LOW STOCK</span>}
                </div>
              );
            })()}
            {(() => {
              const selectedProduct = form.productId ? products.find((p: any) => String(p.id) === String(form.productId)) : null;
              if (!selectedProduct?.maxApplicationsPerSeason || !form.productId || !form.fieldId) return null;
              const selectedField = fields.find((f: any) => String(f.id) === String(form.fieldId));
              const seasonCount = (applications as any[]).filter((a: any) => {
                if (String(a.productId) !== String(form.productId)) return false;
                if (String(a.fieldId) !== String(form.fieldId)) return false;
                if (editRecord && a.id === editRecord.id) return false;
                return isInCropYear(a.applicationDate, cropYear);
              }).length;
              if (seasonCount < Number(selectedProduct.maxApplicationsPerSeason)) return null;
              return (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <AlertTriangle size={14} style={{ color: "#dc2626", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#991b1b" }}>Field Season Limit Reached</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#7f1d1d", margin: 0 }}>
                    {selectedProduct.productName} has a maximum of {selectedProduct.maxApplicationsPerSeason} application{Number(selectedProduct.maxApplicationsPerSeason) !== 1 ? "s" : ""} per season per field.
                    {selectedField ? ` ${selectedField.name} has` : " This field has"} already received {seasonCount} application{seasonCount !== 1 ? "s" : ""} this season.
                  </p>
                </div>
              );
            })()}
            {(() => {
              const selectedProduct = form.productId ? products.find((p: any) => String(p.id) === String(form.productId)) : null;
              const coshh = selectedProduct?.coshhRecord;
              if (!coshh) return null;
              const ppeList = coshh.ppe ? coshh.ppe.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
              return (
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <ShieldAlert size={15} style={{ color: "#b45309", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>Safety Reminder — COSHH</span>
                    {coshh.hazardClassification && (
                      <Badge style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", fontSize: "0.7rem", marginLeft: "auto" }}>{coshh.hazardClassification}</Badge>
                    )}
                  </div>
                  {ppeList.length > 0 && (
                    <p style={{ fontSize: "0.8rem", color: "#78350f", margin: "0 0 0.3rem" }}>
                      <strong>PPE required:</strong> {ppeList.join(" · ")}
                    </p>
                  )}
                  {coshh.controlMeasures && (
                    <p style={{ fontSize: "0.78rem", color: "#92400e", margin: "0 0 0.3rem" }}>{coshh.controlMeasures}</p>
                  )}
                  {coshh.emergencyProcedures && (
                    <p style={{ fontSize: "0.78rem", color: "#dc2626", margin: "0.3rem 0 0", fontWeight: 600 }}>
                      Emergency: {coshh.emergencyProcedures}
                    </p>
                  )}
                  <p style={{ fontSize: "0.72rem", color: "#a16207", margin: "0.4rem 0 0" }}>Full COSHH assessment in Risk &amp; Safety → Chemical Handling</p>
                </div>
              );
            })()}
            {(() => {
              const selectedProduct = form.productId ? products.find((p: any) => String(p.id) === String(form.productId)) : null;
              if (!selectedProduct?.lerapCategory) return null;
              const isCatA = selectedProduct.lerapCategory === "A";
              return (
                <div style={{ background: isCatA ? "#fef2f2" : "#fffbeb", border: `1px solid ${isCatA ? "#fecaca" : "#fcd34d"}`, borderRadius: 8, padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.78rem", color: isCatA ? "#991b1b" : "#92400e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      LERAP — Category {selectedProduct.lerapCategory}
                    </span>
                    {selectedProduct.lerapStandardBufferM != null && (
                      <span style={{ marginLeft: "auto", background: isCatA ? "#fee2e2" : "#fef3c7", color: isCatA ? "#991b1b" : "#92400e", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, padding: "1px 7px" }}>
                        {selectedProduct.lerapStandardBufferM}m standard buffer
                      </span>
                    )}
                  </div>
                  {isCatA ? (
                    <p style={{ fontSize: "0.77rem", color: "#7f1d1d", margin: 0 }}>
                      This product carries a <strong>Category A LERAP label</strong>. The buffer zone printed on the label is <strong>fixed</strong> and cannot be reduced. Maintain the full buffer from any watercourse, ditch or drain.
                    </p>
                  ) : (
                    <p style={{ fontSize: "0.77rem", color: "#78350f", margin: 0 }}>
                      This product carries a <strong>Category B LERAP label</strong>. If spraying near surface water, a LERAP assessment must be completed before application — record it in the <strong>LERAP tab</strong>. A valid assessment may allow a reduced buffer.
                    </p>
                  )}
                </div>
              );
            })()}
            {deliveryStockItemId && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem" }}>
                <Label style={{ marginBottom: 6, display: "block", color: "#166534", fontWeight: 600, fontSize: "0.8rem" }}>Batch / Lot Traceability</Label>
                <div className="space-y-2">
                  <div>
                    <Label style={{ fontSize: "0.75rem", color: "#4b5563" }}>Select Delivery (Batch/Lot)</Label>
                    <Select
                      value={form.stockDeliveryId}
                      onValueChange={handleDeliveryChange}
                    >
                      <SelectTrigger style={{ fontSize: "0.8rem", height: 34 }}><SelectValue placeholder="Select from GRN deliveries..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No specific delivery</SelectItem>
                        {deliveriesQ.isLoading && <SelectItem value="__loading__" disabled>Loading...</SelectItem>}
                        {(deliveriesQ.data ?? []).map((d: any) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.grnNumber ? `${d.grnNumber} — ` : ""}{d.batchNumber ? `Batch: ${d.batchNumber}` : ""}{d.lotNumber ? ` Lot: ${d.lotNumber}` : ""} ({new Date(d.deliveryDate).toLocaleDateString("en-GB")})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label style={{ fontSize: "0.75rem", color: "#4b5563" }}>Batch Number</Label>
                      <Input style={{ height: 34, fontSize: "0.8rem" }} placeholder="e.g. BT240301" value={form.batchNumber} onChange={e => setForm((f: any) => ({ ...f, batchNumber: e.target.value }))} />
                    </div>
                    <div>
                      <Label style={{ fontSize: "0.75rem", color: "#4b5563" }}>Lot Number</Label>
                      <Input style={{ height: 34, fontSize: "0.8rem" }} placeholder="e.g. LOT-2026-001" value={form.lotNumber} onChange={e => setForm((f: any) => ({ ...f, lotNumber: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!deliveryStockItemId && form.productId && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Batch Number</Label>
                  <Input placeholder="e.g. BT240301" value={form.batchNumber} onChange={e => setForm((f: any) => ({ ...f, batchNumber: e.target.value }))} />
                </div>
                <div>
                  <Label>Lot Number</Label>
                  <Input placeholder="e.g. LOT-2026-001" value={form.lotNumber} onChange={e => setForm((f: any) => ({ ...f, lotNumber: e.target.value }))} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Application Rate</Label>
                <Input type="number" step="0.001" placeholder="0.00" value={form.applicationRate} onChange={e => setForm((f: any) => ({ ...f, applicationRate: e.target.value }))} />
              </div>
              <div>
                <Label>Rate Unit</Label>
                <Select value={form.rateUnit} onValueChange={v => setForm((f: any) => ({ ...f, rateUnit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{RATE_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Area Sprayed (ha)</Label>
                <div style={{ position: "relative" }}>
                  <Input type="number" step="0.01" placeholder="0.00" value={form.areaSprayedHa} onChange={e => { setForm((f: any) => ({ ...f, areaSprayedHa: e.target.value })); setAreaAutoFilled(false); }} />
                  {areaAutoFilled && (
                    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#dcfce7", color: "#16a34a", fontSize: "0.68rem", fontWeight: 600, borderRadius: 4, padding: "1px 6px", pointerEvents: "none" }}>Auto-filled</span>
                  )}
                </div>
                {(() => {
                  const fr = fields.find((f: any) => String(f.id) === String(form.fieldId));
                  const area = form.areaSprayedHa ? parseFloat(String(form.areaSprayedHa)) : null;
                  if ((fr as any)?.areaHectares && area && area > Number((fr as any).areaHectares)) {
                    return <p className="text-[11px] text-red-600 mt-1">Exceeds {(fr as any).name}&apos;s total area ({Number((fr as any).areaHectares).toFixed(2)} ha) — please correct before saving.</p>;
                  }
                  return null;
                })()}
              </div>
            </div>
            {(() => {
              const rate = parseFloat(form.applicationRate);
              const area = parseFloat(form.areaSprayedHa);
              if (isNaN(rate) || isNaN(area) || rate <= 0 || area <= 0) return null;
              const qty = rate * area;
              const unit = (form.rateUnit ?? "L/ha").replace(/\/ha$/i, "").trim() || "units";
              const qtyDisplay = qty % 1 === 0 ? qty.toFixed(0) : qty < 10 ? qty.toFixed(3).replace(/\.?0+$/, "") : qty.toFixed(1);
              return (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.6rem 0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "#1d4ed8", fontWeight: 600 }}>&#9679; Estimated product needed:</span>
                  <span style={{ fontSize: "0.88rem", color: "#1e3a8a", fontWeight: 700 }}>{qtyDisplay} {unit}</span>
                  <span style={{ fontSize: "0.72rem", color: "#3b82f6", marginLeft: "auto" }}>{rate} {form.rateUnit} × {area} ha</span>
                </div>
              );
            })()}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Water Volume (L/ha)</Label>
                <Input type="number" step="1" placeholder="e.g. 200" value={form.waterVolumeLitres} onChange={e => setForm((f: any) => ({ ...f, waterVolumeLitres: e.target.value }))} />
              </div>
              <div>
                <Label>Equipment Used</Label>
                {sprayEquipment.length > 0 ? (
                  <Select
                    value={form.equipmentId}
                    onValueChange={v => {
                      if (v === "__other__") {
                        setForm((f: any) => ({ ...f, equipmentId: "", equipmentUsed: "" }));
                        setVehicleStationFilled(null);
                      } else {
                        const eq = sprayEquipment.find((e: any) => String(e.id) === v);
                        const label = eq ? [eq.name, eq.make, eq.model, eq.registrationNumber].filter(Boolean).join(" · ") : "";
                        setForm((f: any) => ({ ...f, equipmentId: v, equipmentUsed: label }));
                        checkVehicleWeather(v, form.applicationDate);
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select equipment..." /></SelectTrigger>
                    <SelectContent>
                      {sprayEquipment.map((e: any) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.name}{e.make ? ` — ${e.make}` : ""}{e.registrationNumber ? ` (${e.registrationNumber})` : ""}
                        </SelectItem>
                      ))}
                      <SelectItem value="__other__">Other / not listed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="e.g. Trailed sprayer, 24m boom" value={form.equipmentUsed} onChange={e => setForm((f: any) => ({ ...f, equipmentUsed: e.target.value, equipmentId: "" }))} />
                )}
                {form.equipmentId === "" && sprayEquipment.length > 0 && (
                  <Input className="mt-1" style={{ fontSize: "0.8rem" }} placeholder="Describe equipment..." value={form.equipmentUsed} onChange={e => setForm((f: any) => ({ ...f, equipmentUsed: e.target.value }))} />
                )}
              </div>
            </div>
            {vehicleStationFilled ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.8rem", color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                <Truck size={13} style={{ flexShrink: 0 }} />
                Conditions loaded from vehicle-mounted weather station
                {vehicleStationFilled.vehicleName ? ` (${vehicleStationFilled.vehicleName})` : ""}
                {vehicleStationFilled.readingTimestamp ? ` · ${new Date(vehicleStationFilled.readingTimestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}.
                You can adjust below if needed.
              </div>
            ) : weatherAutoFilled ? (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.8rem", color: "#1d4ed8", display: "flex", alignItems: "center", gap: 6 }}>
                <span>&#9729;</span> Weather conditions auto-filled from your nearest stored reading. You can adjust below.
              </div>
            ) : null}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }}>Weather Conditions at Application</span>
              {!vehicleStationFilled && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {weatherFetchMsg && (
                    <span style={{ fontSize: "0.7rem", color: weatherFetchMsg.startsWith("Could") ? "#991b1b" : "#166534" }}>{weatherFetchMsg}</span>
                  )}
                  <button
                    type="button"
                    onClick={fetchLiveWeather}
                    disabled={weatherFetching}
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 5, padding: "3px 8px", cursor: weatherFetching ? "default" : "pointer", opacity: weatherFetching ? 0.7 : 1 }}
                  >
                    {weatherFetching ? <><Loader2 size={11} className="animate-spin" /> Fetching…</> : <><MapPin size={11} /> Get live conditions</>}
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Wind Speed (km/h)</Label>
                <Input type="number" step="0.1" placeholder="0.0" value={form.windSpeedKmh} onChange={e => setForm((f: any) => ({ ...f, windSpeedKmh: e.target.value }))} />
              </div>
              <div>
                <Label>Wind Direction</Label>
                <Select value={form.windDirection} onValueChange={v => setForm((f: any) => ({ ...f, windDirection: v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{WIND_DIRS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperature (°C)</Label>
                <Input type="number" step="0.1" placeholder="0.0" value={form.temperatureC} onChange={e => setForm((f: any) => ({ ...f, temperatureC: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Operator Name <span style={{ color: "#ef4444" }}>*</span></Label>
                {membersLoading ? (
                  <Input disabled placeholder="Loading staff…" />
                ) : activeMembers.length > 0 ? (
                  <>
                    <Select value={form.operatorMemberId} onValueChange={handleOperatorChange}>
                      <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                      <SelectContent>
                        {activeMembers.map((m: any) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {memberFullName(m)}{m.jobTitle ? ` — ${m.jobTitle}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!form.operatorMemberId && (
                      <Input className="mt-1" style={{ fontSize: "0.8rem" }} placeholder="Or type a name if not in staff list…" value={form.operatorName} onChange={e => setForm((f: any) => ({ ...f, operatorName: e.target.value }))} />
                    )}
                  </>
                ) : (
                  <Input placeholder="Type staff member name…" value={form.operatorName} onChange={e => setForm((f: any) => ({ ...f, operatorName: e.target.value }))} />
                )}
              </div>
              <div>
                <Label>Certificate No. (PA1/PA6)</Label>
                <Input placeholder="e.g. PA1-123456" value={form.certificateNumber} onChange={e => setForm((f: any) => ({ ...f, certificateNumber: e.target.value }))} />
                {form.operatorMemberId && form.certificateNumber && (
                  <p style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }}>&#10003; Auto-filled from staff certificate record</p>
                )}
                {form.operatorMemberId && !form.certificateNumber && (
                  <p style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: 3 }}>No in-date PA certificate on file for this operator</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Supplier</Label>
                {(() => {
                  const agchemSuppliers = allSuppliers.filter((s: any) => s.supplierType === "agrochemicals");
                  const currentSupplier = form.supplierId ? allSuppliers.find((s: any) => String(s.id) === form.supplierId) : null;
                  const needsCurrentAdded = currentSupplier && currentSupplier.supplierType !== "agrochemicals";
                  const listItems = needsCurrentAdded ? [...agchemSuppliers, currentSupplier] : agchemSuppliers;
                  return (
                    <>
                      <Select value={form.supplierId} onValueChange={v => setForm((f: any) => ({ ...f, supplierId: v === "__none__" ? "" : v }))}>
                        <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {listItems.length === 0 ? (
                            <SelectItem value="__empty__" disabled>No agrochemical suppliers — add in Suppliers register</SelectItem>
                          ) : listItems.map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.supplierId && form.stockDeliveryId && (
                        <p style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }}>&#10003; Auto-filled from delivery record</p>
                      )}
                      {agchemSuppliers.length === 0 && !form.supplierId && (
                        <p style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 3 }}>Add agrochemical suppliers in the Suppliers register to enable this field.</p>
                      )}
                    </>
                  );
                })()}
              </div>
              <div>
                <Label>Reason for Application <span style={{ color: "#ef4444" }}>*</span></Label>
                {(() => {
                  const isCustom = !!form.reasonForApplication && sprayReasons.length > 0 && !sprayReasons.includes(form.reasonForApplication);
                  const selectVal = isCustom ? "__other__" : (form.reasonForApplication || "");
                  return sprayReasons.length === 0 ? (
                    <Input placeholder="e.g. Control of blackgrass, crop threshold exceeded" value={form.reasonForApplication} onChange={e => setForm((f: any) => ({ ...f, reasonForApplication: e.target.value }))} />
                  ) : (
                    <>
                      <Select value={selectVal} onValueChange={v => { if (v === "__other__") { setForm((f: any) => ({ ...f, reasonForApplication: "__other__" })); return; } setForm((f: any) => ({ ...f, reasonForApplication: v })); }}>
                        <SelectTrigger><SelectValue placeholder="Select reason for application..." /></SelectTrigger>
                        <SelectContent>
                          {sprayReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          <SelectItem value="__other__">Other (specify below)</SelectItem>
                        </SelectContent>
                      </Select>
                      {(isCustom || selectVal === "__other__") && (
                        <Input className="mt-1" style={{ fontSize: "0.8rem" }} placeholder="Describe the reason for application..." value={form.reasonForApplication === "__other__" ? "" : form.reasonForApplication} onChange={e => setForm((f: any) => ({ ...f, reasonForApplication: e.target.value }))} />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Water Source Nearby</Label>
                <Select value={form.waterSourceNearby ?? ""} onValueChange={v => {
                  const source = v === "__none__" ? "" : v;
                  const suggested: Record<string, number> = { ditch: 5, stream: 5, pond: 5, borehole: 50 };
                  const min = source ? suggested[source] : undefined;
                  setForm((f: any) => ({
                    ...f,
                    waterSourceNearby: source,
                    bufferZoneMetres: (!f.bufferZoneMetres && min != null) ? String(min) : f.bufferZoneMetres,
                  }));
                }}>
                  <SelectTrigger><SelectValue placeholder="None / Not applicable" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None / Not applicable</SelectItem>
                    <SelectItem value="ditch">Ditch / Drain</SelectItem>
                    <SelectItem value="stream">Stream / River</SelectItem>
                    <SelectItem value="pond">Pond / Lake</SelectItem>
                    <SelectItem value="borehole">Borehole / Well</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Buffer Zone Distance (m)</Label>
                <Input type="number" step="0.5" placeholder="e.g. 5, 10, 20" value={form.bufferZoneMetres ?? ""} onChange={e => setForm((f: any) => ({ ...f, bufferZoneMetres: e.target.value }))} />
                {form.bufferZoneMetres && form.waterSourceNearby && form.waterSourceNearby !== "__none__" && (
                  <p style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }}>
                    &#10003; {form.bufferZoneMetres}m recorded —{" "}
                    {form.waterSourceNearby === "borehole"
                      ? "SPZ minimum 50m"
                      : "CoP minimum 5m · check product label / LERAP rating"}
                  </p>
                )}
                {form.bufferZoneMetres && (!form.waterSourceNearby || form.waterSourceNearby === "__none__") && (
                  <p style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }}>&#10003; Buffer zone of {form.bufferZoneMetres}m recorded</p>
                )}
                {form.waterSourceNearby && form.waterSourceNearby !== "__none__" && !form.bufferZoneMetres && (
                  <p style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: 3 }}>
                    &#9888; Water source selected — enter the buffer zone maintained
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Conditions, observations, non-standard buffer justification..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <div>
              <Label>Product Cost <span className="text-muted-foreground text-xs font-normal">(£/unit) — optional, for gross margin</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">£</span>
                <Input
                  type="number" step="0.01" min="0" placeholder="e.g. 12.50"
                  className="pl-7"
                  value={form.productCostPencePerUnit !== "" && form.productCostPencePerUnit != null ? (Number(form.productCostPencePerUnit) / 100).toFixed(2) : ""}
                  onChange={e => {
                    const v = e.target.value;
                    setForm((f: any) => ({ ...f, productCostPencePerUnit: v === "" ? "" : Math.round(parseFloat(v) * 100) }));
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cost per litre/kg of this product. Used to calculate spray input costs in the Season Production Report.</p>
            </div>
          </div>
          {editRecord && farmId && (
            <RecordAttachments farmId={farmId} recordType="spray_application" recordId={editRecord.id} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
            <Button
              onClick={() => editRecord ? updateMut.mutate({ id: editRecord.id, body: form }) : createMut.mutate(form)}
              disabled={!form.fieldId || !form.applicationDate || !form.productId || !form.operatorName || !form.reasonForApplication || form.reasonForApplication === "__other__" || createMut.isPending || updateMut.isPending}
            >
              {editRecord ? (updateMut.isPending ? "Saving…" : "Save Changes") : (createMut.isPending ? "Saving…" : "Save Record")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Spray Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This will permanently delete this spray application record. Note: any stock that was automatically deducted will not be reversed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}

function ProductsTab({ products, farmId, loading, onRefresh, toast }: any) {
  const productCategories = useLookupStrings("spray_product_categories", PRODUCT_CATEGORIES_FALLBACK);
  const coshhQ = useQuery({ queryKey: ["risk-coshh", farmId], queryFn: () => fetch(`/api/farms/${farmId}/risk-coshh`).then(r => r.json()), enabled: !!farmId });
  const coshhRecords: any[] = coshhQ.data?.records ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const emptyForm = { productName: "", activeIngredient: "", mappaNumber: "", manufacturer: "", category: "", harvestInterval: "", maxApplicationsPerSeason: "", storageRequirements: "", coshhRecordId: "__none__", lerapCategory: "__none__", lerapStandardBufferM: "", herbicideMoaGroup: "", expiryDate: "", beePrecaution: false };
  const [form, setForm] = useState<any>(emptyForm);

  function openAdd() { setEditRecord(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(p: any) {
    setEditRecord(p);
    setForm({
      productName: p.productName ?? "",
      activeIngredient: p.activeIngredient ?? "",
      mappaNumber: p.mappaNumber ?? "",
      manufacturer: p.manufacturer ?? "",
      category: p.category ?? "",
      harvestInterval: p.harvestInterval ?? "",
      maxApplicationsPerSeason: p.maxApplicationsPerSeason ?? "",
      storageRequirements: p.storageRequirements ?? "",
      coshhRecordId: p.coshhRecordId ? String(p.coshhRecordId) : "__none__",
      lerapCategory: p.lerapCategory ?? "__none__",
      lerapStandardBufferM: p.lerapStandardBufferM != null ? String(p.lerapStandardBufferM) : "",
      herbicideMoaGroup: p.herbicideMoaGroup ?? "",
      expiryDate: p.expiryDate ? String(p.expiryDate).slice(0, 10) : "",
      beePrecaution: p.beePrecaution ?? false,
    });
    setDialogOpen(true);
  }
  const [mappaError, setMappaError] = useState<string | null>(null);
  function closeDialog() { setDialogOpen(false); setEditRecord(null); setForm(emptyForm); setMappaError(null); }
  function formBody() {
    const { coshhRecordId, mappaNumber, lerapCategory, lerapStandardBufferM, ...rest } = form;
    const paddedMappa = mappaNumber && /^\d{1,5}$/.test(mappaNumber)
      ? mappaNumber.padStart(5, "0")
      : mappaNumber;
    const lerap = lerapCategory && lerapCategory !== "__none__" ? lerapCategory : null;
    return {
      ...rest,
      mappaNumber: paddedMappa || null,
      coshhRecordId: coshhRecordId && coshhRecordId !== "__none__" ? Number(coshhRecordId) : null,
      lerapCategory: lerap,
      lerapStandardBufferM: lerap && lerapStandardBufferM ? lerapStandardBufferM : null,
      herbicideMoaGroup: rest.category?.toLowerCase() === "herbicide" && rest.herbicideMoaGroup ? rest.herbicideMoaGroup : null,
    };
  }
  function hseMappUrl(mapp: string) {
    return `https://secure.pesticides.gov.uk/pestreg/prodresults.asp?reg=MAPP${mapp.padStart(5, "0")}`;
  }
  function handleMappaChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 5);
    setForm((f: any) => ({ ...f, mappaNumber: digits }));
    setMappaError(null);
  }
  function handleMappaBlur() {
    const val = form.mappaNumber ?? "";
    if (!val) return;
    if (/^\d{1,5}$/.test(val)) {
      const padded = val.padStart(5, "0");
      setForm((f: any) => ({ ...f, mappaNumber: padded }));
      setMappaError(null);
    } else {
      setMappaError("Must be up to 5 digits (numbers only)");
    }
  }

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/spray-products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Product added" }); onRefresh(); closeDialog(); },
    onError: () => toast({ title: "Failed to add product", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/spray-products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Product updated" }); onRefresh(); closeDialog(); setViewRecord(null); },
    onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-products/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Product deleted" }); onRefresh(); setDeleteId(null); setViewRecord(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Add Product</Button>
      </div>
      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : products.length === 0 ? (
        <EmptyState icon={<FlaskConical size={28} color="#9ca3af" />} title="No products registered" subtitle="Add the pesticides, herbicides and fungicides you use. They'll be available to select when logging applications." />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Product Name", "Active Ingredient", "MAPP No.", "Category", "LERAP", "🐝", "Manufacturer", "Harvest Interval", "Max Apps/Season", "Expiry Date", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, i: number) => (
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }} onClick={() => setViewRecord(p)}>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 600, color: "#1e40af" }}>{p.productName}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#374151" }}>{p.activeIngredient || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{p.mappaNumber ? <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem", fontFamily: "monospace" }}>{p.mappaNumber}</Badge> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{p.category ? <CategoryBadge cat={p.category} /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>
                    {p.lerapCategory === "A" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fee2e2", color: "#991b1b", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }}>Cat A{p.lerapStandardBufferM ? ` · ${p.lerapStandardBufferM}m` : ""}</span>
                    ) : p.lerapCategory === "B" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fef3c7", color: "#92400e", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }}>Cat B{p.lerapStandardBufferM ? ` · ${p.lerapStandardBufferM}m` : ""}</span>
                    ) : <span style={{ color: "#d1d5db" }}>—</span>}
                  </td>
                  <td style={{ padding: "0.625rem 0.75rem", textAlign: "center" }}>
                    {p.beePrecaution ? <span title="Harmful to bees — 48hr notification required" style={{ fontSize: "1rem" }}>🐝</span> : <span style={{ color: "#d1d5db" }}>—</span>}
                  </td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.manufacturer || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.harvestInterval ? `${p.harvestInterval} days` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.maxApplicationsPerSeason || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>
                    {p.expiryDate ? (() => {
                      const exp = new Date(p.expiryDate);
                      const now = new Date();
                      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
                      const isExpired = daysLeft < 0;
                      const isSoon = daysLeft >= 0 && daysLeft <= 90;
                      return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: isExpired ? "#fee2e2" : isSoon ? "#fef3c7" : "#f0fdf4", color: isExpired ? "#991b1b" : isSoon ? "#92400e" : "#166534", fontSize: "0.72rem", fontWeight: 600, borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap" }}>{isExpired ? "⚠ Expired" : isSoon ? "⚠ " : ""}{exp.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>;
                    })() : <span style={{ color: "#d1d5db" }}>—</span>}
                  </td>
                  <td style={{ padding: "0.5rem" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteId(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View / detail panel */}
      <Dialog open={viewRecord !== null && !dialogOpen} onOpenChange={o => { if (!o) setViewRecord(null); }}>
        <DialogContent style={{ maxWidth: 540 }}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: "1.1rem" }}>{viewRecord?.productName}</DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-3 py-1">
              {viewRecord.beePrecaution && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: "#fef3c7", border: "1px solid #fde68a", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "1rem" }}>🐝</span>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#92400e" }}>Harmful to bees — 48-hour notification required before spraying</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Category</p>
                  <p>{viewRecord.category ? <CategoryBadge cat={viewRecord.category} /> : <span className="text-gray-400">—</span>}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">MAPP Number</p>
                  {viewRecord.mappaNumber ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                      <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem", fontFamily: "monospace" }}>{viewRecord.mappaNumber}</Badge>
                      <a
                        href={`https://secure.pesticides.gov.uk/pestreg/prodresults.asp?reg=MAPP${viewRecord.mappaNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.72rem", color: "#1d4ed8", textDecoration: "none" }}
                        title="Verify on HSE Pesticide Register"
                      >
                        <ExternalLink size={11} />
                        Verify on HSE
                      </a>
                    </div>
                  ) : <span className="text-gray-400">—</span>}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Active Ingredient</p>
                  <p className="text-gray-700">{viewRecord.activeIngredient || <span className="text-gray-400">—</span>}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Manufacturer</p>
                  <p className="text-gray-700">{viewRecord.manufacturer || <span className="text-gray-400">—</span>}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Harvest Interval</p>
                  <p className="text-gray-700">{viewRecord.harvestInterval ? `${viewRecord.harvestInterval} days` : <span className="text-gray-400">—</span>}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Max Applications / Season</p>
                  <p className="text-gray-700">{viewRecord.maxApplicationsPerSeason || <span className="text-gray-400">—</span>}</p>
                </div>
              </div>
              {viewRecord.lerapCategory && (
                <div style={{ background: viewRecord.lerapCategory === "A" ? "#fef2f2" : "#fffbeb", border: `1px solid ${viewRecord.lerapCategory === "A" ? "#fecaca" : "#fcd34d"}`, borderRadius: 8, padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: viewRecord.lerapCategory === "A" ? "#991b1b" : "#92400e" }}>
                      LERAP — Category {viewRecord.lerapCategory}
                    </span>
                    {viewRecord.lerapStandardBufferM != null && (
                      <span style={{ marginLeft: "auto", background: viewRecord.lerapCategory === "A" ? "#fee2e2" : "#fef3c7", color: viewRecord.lerapCategory === "A" ? "#991b1b" : "#92400e", fontSize: "0.72rem", fontWeight: 700, borderRadius: 4, padding: "1px 7px" }}>
                        {viewRecord.lerapStandardBufferM}m standard buffer
                      </span>
                    )}
                  </div>
                  {viewRecord.lerapCategory === "A" ? (
                    <p style={{ fontSize: "0.78rem", color: "#7f1d1d", margin: 0 }}>Category A — buffer zone printed on label is <strong>fixed</strong>. A LERAP assessment cannot reduce it. Always maintain the full buffer when spraying near water.</p>
                  ) : (
                    <p style={{ fontSize: "0.78rem", color: "#78350f", margin: 0 }}>Category B — a LERAP assessment <strong>may</strong> allow a reduced buffer zone. Record the assessment in the LERAP tab before spraying near surface water.</p>
                  )}
                </div>
              )}
              {viewRecord.storageRequirements && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Storage Requirements</p>
                  <p className="text-sm text-green-900">{viewRecord.storageRequirements}</p>
                </div>
              )}
              {viewRecord.coshhRecord ? (
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                    <ShieldAlert size={14} style={{ color: "#b45309" }} />
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#b45309" }}>Linked COSHH Record</p>
                    {viewRecord.coshhRecord.hazardClassification && (
                      <Badge style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", fontSize: "0.7rem", marginLeft: "auto" }}>{viewRecord.coshhRecord.hazardClassification}</Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">{viewRecord.coshhRecord.substanceName}</p>
                  {viewRecord.coshhRecord.ppe && (
                    <p style={{ fontSize: "0.8rem", color: "#78350f", margin: "0 0 0.25rem" }}><strong>PPE:</strong> {viewRecord.coshhRecord.ppe}</p>
                  )}
                  {viewRecord.coshhRecord.controlMeasures && (
                    <p style={{ fontSize: "0.78rem", color: "#92400e", margin: "0 0 0.25rem" }}>{viewRecord.coshhRecord.controlMeasures}</p>
                  )}
                  {viewRecord.coshhRecord.emergencyProcedures && (
                    <p style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: 600, margin: 0 }}>Emergency: {viewRecord.coshhRecord.emergencyProcedures}</p>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px dashed #e5e7eb" }}>
                  <Link2 size={13} style={{ color: "#d1d5db" }} />
                  <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: 0 }}>No COSHH record linked — use Edit to link one</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(viewRecord?.id)}>Delete</Button>
            <Button variant="outline" onClick={() => { openEdit(viewRecord); }}>Edit</Button>
            <Button onClick={() => setViewRecord(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) closeDialog(); }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Spray Product" : "Add Spray Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Product Name <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="e.g. Roundup ProActive" value={form.productName} onChange={e => setForm((f: any) => ({ ...f, productName: e.target.value }))} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, category: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {productCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Active Ingredient</Label>
                <Input placeholder="e.g. Glyphosate 360 g/L" value={form.activeIngredient} onChange={e => setForm((f: any) => ({ ...f, activeIngredient: e.target.value }))} />
              </div>
              <div>
                <Label>MAPP Number</Label>
                <Input
                  placeholder="e.g. 15026"
                  value={form.mappaNumber}
                  onChange={e => handleMappaChange(e.target.value)}
                  onBlur={handleMappaBlur}
                  inputMode="numeric"
                  maxLength={5}
                  style={mappaError ? { borderColor: "#ef4444" } : undefined}
                />
                {mappaError && (
                  <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 3 }}>{mappaError}</p>
                )}
                {!mappaError && form.mappaNumber && /^\d{5}$/.test(form.mappaNumber) && (
                  <a
                    href={hseMappUrl(form.mappaNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.72rem", color: "#1d4ed8", marginTop: 3, textDecoration: "none" }}
                  >
                    <ExternalLink size={11} />
                    Verify on HSE Register
                  </a>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Manufacturer</Label>
                <Input placeholder="e.g. Bayer, Syngenta" value={form.manufacturer} onChange={e => setForm((f: any) => ({ ...f, manufacturer: e.target.value }))} />
              </div>
              <div>
                <Label>Harvest Interval (days)</Label>
                <Input type="number" placeholder="e.g. 7" value={form.harvestInterval} onChange={e => setForm((f: any) => ({ ...f, harvestInterval: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Max Applications per Season</Label>
              <Input type="number" placeholder="e.g. 2" value={form.maxApplicationsPerSeason} onChange={e => setForm((f: any) => ({ ...f, maxApplicationsPerSeason: e.target.value }))} />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={e => setForm((f: any) => ({ ...f, expiryDate: e.target.value }))} />
              <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }}>Leave blank if not applicable. Expired products are flagged with a red badge in the product list.</p>
            </div>
            <div>
              <Label>Storage Requirements</Label>
              <Textarea placeholder="e.g. Store in original container, locked chemical store, above 5°C" value={form.storageRequirements} onChange={e => setForm((f: any) => ({ ...f, storageRequirements: e.target.value }))} rows={2} />
            </div>
            {form.category?.toLowerCase() === "herbicide" && (
              <div>
                <Label>Herbicide MOA / HRAC Group</Label>
                <Input placeholder="e.g. Group 1 / A — ACCase inhibitor" value={form.herbicideMoaGroup} onChange={e => setForm((f: any) => ({ ...f, herbicideMoaGroup: e.target.value }))} />
                <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }}>
                  Used to flag herbicide mode-of-action repetition risk in the Black-grass Five-in-Five tracker.
                </p>
              </div>
            )}
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", padding: "0.6rem 0.75rem", borderRadius: 8, background: form.beePrecaution ? "#fef3c7" : "#f9fafb", border: `1px solid ${form.beePrecaution ? "#fde68a" : "#e5e7eb"}`, cursor: "pointer" }} onClick={() => setForm((f: any) => ({ ...f, beePrecaution: !f.beePrecaution }))}>
                <input type="checkbox" checked={!!form.beePrecaution} onChange={e => setForm((f: any) => ({ ...f, beePrecaution: e.target.checked }))} style={{ marginTop: 2, accentColor: "#d97706", cursor: "pointer" }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: form.beePrecaution ? "#92400e" : "#374151" }}>🐝 Harmful to Bees (Bee Precaution)</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#6b7280" }}>Tick if the product label carries a "harmful to bees" or bee precaution statement. This triggers a 48-hour notification reminder in the Week Ahead Planner whenever a spray with this product is logged.</p>
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
              <Label style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>LERAP Label</Label>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0 0 0.4rem" }}>
                Does this product carry a LERAP label? Sets the category shown in the product list and triggers a reminder in the Applications Log when spraying near water.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.lerapCategory || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, lerapCategory: v, lerapStandardBufferM: v === "__none__" ? "" : f.lerapStandardBufferM }))}>
                  <SelectTrigger><SelectValue placeholder="No LERAP label" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No LERAP label</SelectItem>
                    <SelectItem value="A">Category A — fixed buffer</SelectItem>
                    <SelectItem value="B">Category B — reducible via LERAP</SelectItem>
                  </SelectContent>
                </Select>
                {form.lerapCategory && form.lerapCategory !== "__none__" && (
                  <div>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="Standard buffer (m)"
                      value={form.lerapStandardBufferM}
                      onChange={e => setForm((f: any) => ({ ...f, lerapStandardBufferM: e.target.value }))}
                    />
                  </div>
                )}
              </div>
              {form.lerapCategory === "A" && (
                <p style={{ fontSize: "0.72rem", color: "#991b1b", marginTop: 4 }}>Cat A: the buffer on the label is fixed — a LERAP cannot reduce it.</p>
              )}
              {form.lerapCategory === "B" && (
                <p style={{ fontSize: "0.72rem", color: "#92400e", marginTop: 4 }}>Cat B: a LERAP assessment may allow a reduced buffer near surface water.</p>
              )}
            </div>
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
              <Label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Link2 size={13} style={{ color: "#6b7280" }} />
                Link COSHH Record
              </Label>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.2rem 0 0.4rem" }}>
                Linking a COSHH record will show a safety reminder when this product is selected in the Applications Log.
              </p>
              <Select value={form.coshhRecordId} onValueChange={v => setForm((f: any) => ({ ...f, coshhRecordId: v }))}>
                <SelectTrigger><SelectValue placeholder="No COSHH record linked" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No COSHH record linked</SelectItem>
                  {coshhRecords.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.substanceName}{c.hazardClassification ? ` — ${c.hazardClassification}` : ""}
                    </SelectItem>
                  ))}
                  {coshhRecords.length === 0 && (
                    <SelectItem value="__empty__" disabled>No COSHH records — add one in Risk &amp; Safety first</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            {editRecord
              ? <Button onClick={() => updateMut.mutate({ id: editRecord.id, body: formBody() })} disabled={!form.productName || updateMut.isPending}>Save Changes</Button>
              : <Button onClick={() => createMut.mutate(formBody())} disabled={!form.productName || createMut.isPending}>Add Product</Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Product</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure? Existing spray application records linked to this product will retain the product name but lose the product details.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PrintTab({ applications, farm, cropYear, setCropYear }: any) {
  const [reportType, setReportType] = useState<"summary" | "detail">("summary");
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const previewRef = useRef<HTMLDivElement>(null);

  const printApplications = applications.filter((r: any) => isInCropYear(r.applicationDate, cropYear));
  const yearLabel = cropYearLabel(cropYear);

  const handlePrint = () => {
    if (!previewRef.current) return;
    const content = previewRef.current.innerHTML;
    const farmName = farm?.name || "Spray Records";
    const isDetail = reportType === "detail";
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Spray Records — ${farmName} — ${yearLabel}</title>
      <style>
        @page { size: A4 ${isDetail ? "portrait" : "landscape"}; margin: ${isDetail ? "1.2cm 1.5cm" : "1cm 1.2cm"}; }
        *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; background: #fff; font-family: Arial, Helvetica, sans-serif; }
        div[style*="overflow"] { overflow: visible !important; }
        tr { page-break-inside: avoid; }
        div[style*="box-shadow"] { box-shadow: none !important; border-radius: 0 !important; }
        .record-card { page-break-inside: avoid; }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.addEventListener("afterprint", () => win.close()); win.print(); }, 600);
  };

  const farmName = farm?.name;
  const meta = [
    farm?.cphNumber ? `CPH: ${farm.cphNumber}` : null,
    farm?.redTractorId ? `RT ID: ${farm.redTractorId}` : null,
  ].filter(Boolean).join(" · ");

  const COLS = ["Date", "Field", "Product", "Crop / Stage", "Rate", "Area", "Water Vol.", "Wind / Temp", "Operator", "PA Cert No.", "Reason / Notes"];

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 14px", borderRadius: 6, border: "1px solid",
    borderColor: active ? "#1a3a1a" : "#d1d5db",
    background: active ? "#1a3a1a" : "#fff",
    color: active ? "#fff" : "#374151",
    fontSize: "0.8rem", fontWeight: active ? 600 : 400, cursor: "pointer",
    transition: "all 0.15s",
  });

  const docHeader = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1a3a1a", paddingBottom: 10, marginBottom: 14 }}>
      <div>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a3a1a", margin: "0 0 4px" }}>
          Spray Application Records — {yearLabel}{reportType === "detail" ? " (Full Detail)" : ""}
        </h2>
        {farmName && <p style={{ fontSize: "0.75rem", color: "#374151", margin: "4px 0", lineHeight: 1.5 }}><strong>{farmName}</strong>{meta ? `  ·  ${meta}` : ""}</p>}
        <p style={{ fontSize: "0.7rem", color: "#444", margin: "4px 0", lineHeight: 1.5 }}>Red Tractor Crop Inputs Compliance Register</p>
      </div>
      <div style={{ textAlign: "right", lineHeight: 1.8 }}>
        <div style={{ display: "inline-block", background: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 3, letterSpacing: "0.05em", marginBottom: 4 }}>RED TRACTOR</div>
        <p style={{ fontSize: "0.65rem", color: "#374151", margin: "4px 0" }}>Printed: {today}</p>
        <p style={{ fontSize: "0.65rem", color: "#374151", margin: "4px 0" }}>{printApplications.length} record{printApplications.length !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );

  const docFooter = (
    <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #d1d5db", display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "#555" }}>
      <span>Retain records for a minimum of 3 years and make available at Red Tractor audit inspection.</span>
      <span>BDE Farm Trac · {today}</span>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Format:</span>
          <button style={toggleBtnStyle(reportType === "summary")} onClick={() => setReportType("summary")}>Summary Table</button>
          <button style={toggleBtnStyle(reportType === "detail")} onClick={() => setReportType("detail")}>Full Detail Report</button>
          <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: 4 }}>
            {reportType === "summary" ? "Landscape A4 · one row per application" : "Portrait A4 · full card per application"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CropYearSelector value={cropYear} onChange={setCropYear} />
          <Button size="sm" onClick={handlePrint} disabled={printApplications.length === 0}>
            <Printer size={14} className="mr-1.5" />Print / Export PDF
          </Button>
        </div>
      </div>

      {printApplications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#6b7280", margin: "0 0 4px" }}>No records for {yearLabel}</p>
          <p style={{ fontSize: "0.8rem", margin: 0 }}>Select a different crop year above, or log applications in the Applications Log tab.</p>
        </div>
      ) : reportType === "summary" ? (
        <div style={{ background: "#e5e7eb", padding: "1.5rem", borderRadius: 10 }}>
          <div ref={previewRef} style={{ background: "#fff", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "1.5rem 1.75rem", fontFamily: "Arial, Helvetica, sans-serif" }}>
            {docHeader}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                <thead>
                  <tr style={{ background: "#1a3a1a" }}>
                    {COLS.map(h => (
                      <th key={h} style={{ padding: "5px 7px", color: "#fff", fontWeight: 700, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", borderRight: "1px solid #2d5a2d", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {printApplications.map((r: any, i: number) => {
                    const conditions = [
                      r.windSpeedKmh ? `${r.windSpeedKmh} km/h ${r.windDirection || ""}`.trim() : null,
                      r.temperatureC != null ? `${r.temperatureC}°C` : null,
                    ].filter(Boolean).join(" / ") || "—";
                    return (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }}>{fmt(r.applicationDate)}</td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", color: "#374151" }}>{r.fieldName || "—"}</td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0" }}>
                          <span style={{ fontWeight: 600, color: "#111827" }}>{r.productName || "—"}</span>
                          {r.productCategory && <span style={{ display: "block", fontSize: "0.6rem", color: "#555" }}>{r.productCategory}</span>}
                          {r.lerapCategory && (
                            <span style={{ display: "inline-block", marginTop: 2, fontSize: "0.55rem", fontWeight: 700, padding: "1px 5px", borderRadius: 2, background: r.lerapCategory === "A" ? "#fee2e2" : "#fef3c7", color: r.lerapCategory === "A" ? "#991b1b" : "#92400e", letterSpacing: "0.04em" }}>
                              LERAP {r.lerapCategory}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", color: "#374151" }}>
                          {r.targetCrop && <span style={{ display: "block", fontSize: "0.68rem" }}>{r.targetCrop}</span>}
                          {r.growthStage && <span style={{ display: "block", fontSize: "0.6rem", color: "#555" }}>{r.growthStage}</span>}
                          {!r.targetCrop && !r.growthStage && "—"}
                        </td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }}>{r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}`.trim() : "—"}</td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }}>{r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—"}</td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }}>{r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : "—"}</td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }}>{conditions}</td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", color: "#374151" }}>{r.operatorName || "—"}</td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", color: "#374151", fontFamily: "monospace", fontSize: "0.65rem" }}>{r.certificateNumber || "—"}</td>
                        <td style={{ padding: "4px 7px", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>{r.reasonForApplication || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {docFooter}
          </div>
        </div>
      ) : (
        /* ── Full Detail Report ─────────────────────────────────── */
        <div style={{ background: "#e5e7eb", padding: "1.5rem", borderRadius: 10 }}>
          <div ref={previewRef} style={{ background: "#fff", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "1.5rem 1.75rem", fontFamily: "Arial, Helvetica, sans-serif" }}>
            {docHeader}
            <div>
              {printApplications.map((r: any, i: number) => {
                const equipment = r.equipmentName
                  ? `${r.equipmentName}${r.equipmentUsed && r.equipmentUsed !== r.equipmentName ? ` — ${r.equipmentUsed}` : ""}`
                  : r.equipmentUsed || null;
                const traceability = [
                  r.supplierName ? `Supplier: ${r.supplierName}` : null,
                  r.batchNumber ? `Batch: ${r.batchNumber}` : null,
                  r.lotNumber ? `Lot: ${r.lotNumber}` : null,
                ].filter(Boolean);

                const cellLabel: React.CSSProperties = { fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#6b7280", display: "block", marginBottom: 3 };
                const cellValue: React.CSSProperties = { fontSize: "0.72rem", color: "#111827", fontWeight: 500 };
                const sectionHead: React.CSSProperties = { fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#fff", background: "#374151", padding: "3px 8px" };
                const sectionBody: React.CSSProperties = { padding: "8px 10px" };
                const halfCell: React.CSSProperties = { padding: "7px 10px", flex: 1 };

                return (
                  <div key={r.id} className="record-card" style={{
                    border: "1px solid #d1d5db", borderRadius: 4, marginBottom: i < printApplications.length - 1 ? 16 : 0,
                    overflow: "hidden", fontSize: "0.72rem",
                  }}>
                    {/* Record header */}
                    <div style={{ background: "#1a3a1a", padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#86efac", display: "block" }}>Date</span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>{fmt(r.applicationDate)}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#86efac", display: "block" }}>Field</span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>{r.fieldName || "—"}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#86efac", display: "block" }}>Product</span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>
                            {r.productName || "—"}{r.productCategory ? <span style={{ fontSize: "0.65rem", color: "#a3e635", marginLeft: 6 }}>({r.productCategory})</span> : null}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.6rem", color: "#86efac" }}>Record #{i + 1} of {printApplications.length}</span>
                    </div>

                    {/* Application + Weather */}
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                      <div style={{ flex: 1, borderRight: "1px solid #e5e7eb" }}>
                        <div style={sectionHead}>Application Details</div>
                        <div style={{ ...sectionBody, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 12px" }}>
                          <div><span style={cellLabel}>Target Crop</span><span style={cellValue}>{r.targetCrop || "—"}</span></div>
                          <div><span style={cellLabel}>Growth Stage (BBCH)</span><span style={cellValue}>{r.growthStage || "—"}</span></div>
                          <div><span style={cellLabel}>Rate</span><span style={cellValue}>{r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}`.trim() : "—"}</span></div>
                          <div><span style={cellLabel}>Area Sprayed</span><span style={cellValue}>{r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—"}</span></div>
                          <div><span style={cellLabel}>Water Volume</span><span style={cellValue}>{r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : "—"}</span></div>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={sectionHead}>Weather Conditions</div>
                        <div style={{ ...sectionBody, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 12px" }}>
                          <div><span style={cellLabel}>Wind Speed</span><span style={cellValue}>{r.windSpeedKmh ? `${r.windSpeedKmh} km/h` : "—"}</span></div>
                          <div><span style={cellLabel}>Wind Direction</span><span style={cellValue}>{r.windDirection || "—"}</span></div>
                          <div><span style={cellLabel}>Temperature</span><span style={cellValue}>{r.temperatureC != null ? `${r.temperatureC}°C` : "—"}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Operator + Equipment */}
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                      <div style={{ flex: 1, borderRight: "1px solid #e5e7eb" }}>
                        <div style={sectionHead}>Operator</div>
                        <div style={{ ...sectionBody, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                          <div><span style={cellLabel}>Name</span><span style={cellValue}>{r.operatorName || "—"}</span></div>
                          <div><span style={cellLabel}>PA1/PA6 Certificate No.</span><span style={{ ...cellValue, fontFamily: "monospace", fontSize: "0.68rem" }}>{r.certificateNumber || "—"}</span></div>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={sectionHead}>Equipment Used</div>
                        <div style={sectionBody}>
                          <span style={cellValue}>{equipment || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* LERAP */}
                    {r.lerapCategory && (
                      <div style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <div style={{ ...sectionHead, background: r.lerapCategory === "A" ? "#991b1b" : "#92400e" }}>LERAP Classification</div>
                        <div style={{ ...sectionBody, display: "flex", gap: 24, flexWrap: "wrap" as const, alignItems: "center" }}>
                          <div>
                            <span style={cellLabel}>Category</span>
                            <span style={{ ...cellValue, display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 3, fontSize: "0.7rem", fontWeight: 700, background: r.lerapCategory === "A" ? "#fee2e2" : "#fef3c7", color: r.lerapCategory === "A" ? "#991b1b" : "#92400e" }}>Cat {r.lerapCategory}</span>
                              {r.lerapCategory === "A" ? "No-spray buffer required" : "Buffer may be reduced by LERAP assessment"}
                            </span>
                          </div>
                          {r.lerapStandardBufferM != null && (
                            <div><span style={cellLabel}>Standard Buffer (label)</span><span style={cellValue}>{r.lerapStandardBufferM} m</span></div>
                          )}
                          {r.bufferZoneMetres != null && (
                            <div><span style={cellLabel}>Recorded Buffer</span><span style={cellValue}>{r.bufferZoneMetres} m</span></div>
                          )}
                          {r.waterSourceNearby != null && (
                            <div><span style={cellLabel}>Water Source Nearby</span><span style={cellValue}>{r.waterSourceNearby ? "Yes" : "No"}</span></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Traceability */}
                    {(traceability.length > 0 || r.supplierName || r.batchNumber || r.lotNumber) && (
                      <div style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <div style={sectionHead}>Product Traceability</div>
                        <div style={{ ...sectionBody, display: "flex", gap: 24, flexWrap: "wrap" as const }}>
                          <div><span style={cellLabel}>Supplier</span><span style={cellValue}>{r.supplierName || "—"}</span></div>
                          <div><span style={cellLabel}>Batch Number</span><span style={{ ...cellValue, fontFamily: "monospace" }}>{r.batchNumber || "—"}</span></div>
                          <div><span style={cellLabel}>Lot Number</span><span style={{ ...cellValue, fontFamily: "monospace" }}>{r.lotNumber || "—"}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Reason + Notes */}
                    <div style={{ display: "flex" }}>
                      <div style={{ flex: r.notes ? 1 : undefined, width: r.notes ? undefined : "100%", borderRight: r.notes ? "1px solid #e5e7eb" : undefined }}>
                        <div style={sectionHead}>Reason for Application</div>
                        <div style={sectionBody}><span style={cellValue}>{r.reasonForApplication || "—"}</span></div>
                      </div>
                      {r.notes && (
                        <div style={{ flex: 1 }}>
                          <div style={sectionHead}>Notes</div>
                          <div style={sectionBody}><span style={{ ...cellValue, color: "#374151" }}>{r.notes}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {docFooter}
          </div>
        </div>
      )}
    </div>
  );
}

function SprayDayViewTab({ applications, loading }: { applications: any[]; loading: boolean }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const dayApps = applications.filter((a: any) => {
    if (!a.applicationDate) return false;
    return new Date(a.applicationDate).toISOString().slice(0, 10) === selectedDate;
  });

  const totalArea = dayApps.reduce((s: number, a: any) => s + (parseFloat(a.areaSprayedHa) || 0), 0);
  const uniqueFields = new Set(dayApps.map((a: any) => a.fieldId)).size;
  const uniqueProducts = new Set(dayApps.map((a: any) => a.productId).filter(Boolean)).size;
  const operators = [...new Set(dayApps.map((a: any) => a.operatorName).filter(Boolean))];

  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isToday = selectedDate === todayStr;

  function windCondition(speed: number | null) {
    if (speed === null || speed === undefined) return null;
    if (speed <= 10) return { label: "Good", bg: "#dcfce7", color: "#166534" };
    if (speed <= 19) return { label: "Marginal", bg: "#fef3c7", color: "#92400e" };
    return { label: "Poor", bg: "#fee2e2", color: "#991b1b" };
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Select Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "0.4rem 0.75rem", fontSize: "0.875rem", background: "#fff", color: "#111827" }} />
        </div>
        <div style={{ paddingTop: 18 }}>
          <button onClick={() => setSelectedDate(todayStr)}
            style={{ background: isToday ? "#e0f2fe" : "#f3f4f6", color: isToday ? "#0369a1" : "#374151", border: "none", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
            Today
          </button>
        </div>
        <div style={{ paddingTop: 18, marginLeft: "auto" }}>
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{displayDate}</span>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
      ) : dayApps.length === 0 ? (
        <EmptyState icon={<Droplets size={28} color="#9ca3af" />}
          title={`No spray activity on ${displayDate}`}
          subtitle="Select a different date or log a spray application." />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
            {[
              { label: "Applications", value: dayApps.length.toString(), color: "#0369a1", bg: "#f0f9ff" },
              { label: "Fields Treated", value: uniqueFields.toString(), color: "#166534", bg: "#f0fdf4" },
              { label: "Total Area", value: `${totalArea.toFixed(1)} ha`, color: "#7c3aed", bg: "#f5f3ff" },
              { label: "Products Used", value: uniqueProducts.toString(), color: "#92400e", bg: "#fffbeb" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }}>
                <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</p>
              </div>
            ))}
          </div>

          {operators.length > 0 && (
            <div style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "#6b7280" }}>
              Operators: <strong style={{ color: "#374151" }}>{operators.join(", ")}</strong>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {dayApps.map((a: any) => {
              const wc = windCondition(parseFloat(a.windSpeedKmh));
              return (
                <div key={a.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <p style={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>{a.fieldName || "Unknown Field"}</p>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 1 }}>{a.productName || "Unknown Product"}</p>
                      {a.productCategory && <CategoryBadge cat={a.productCategory} />}
                    </div>
                    {wc && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: wc.color, background: wc.bg, borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>
                        Wind: {wc.label}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      ["Rate", a.applicationRate ? `${a.applicationRate} ${a.rateUnit || ""}`.trim() : "—"],
                      ["Area", a.areaSprayedHa ? `${a.areaSprayedHa} ha` : "—"],
                      ["Wind", a.windSpeedKmh ? `${a.windSpeedKmh} km/h ${a.windDirection || ""}`.trim() : "—"],
                      ["Temp", a.temperatureC != null ? `${a.temperatureC}°C` : "—"],
                      ["Operator", a.operatorName || "—"],
                      ["Cert No.", a.certificateNumber || "—"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }}>{k}</span>
                        <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {a.reasonForApplication && (
                    <p style={{ marginTop: 10, fontSize: "0.78rem", color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 8 }}>
                      Reason: {a.reasonForApplication}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    "Herbicide": { bg: "#fef3c7", color: "#92400e" },
    "Fungicide": { bg: "#dcfce7", color: "#166534" },
    "Insecticide": { bg: "#fee2e2", color: "#991b1b" },
    "Growth Regulator": { bg: "#ede9fe", color: "#5b21b6" },
    "Foliar Feed": { bg: "#dbeafe", color: "#1e40af" },
  };
  const c = colors[cat] || { bg: "#f3f4f6", color: "#374151" };
  return <Badge style={{ background: c.bg, color: c.color, border: "none", fontSize: "0.72rem" }}>{cat}</Badge>;
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

// ─── IPM Plan Tab ─────────────────────────────────────────────────────────────
const IPM_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under Review" },
  { value: "archived", label: "Archived" },
];

const THRESHOLD_PESTS = [
  "Aphids (cereal)", "Black-grass", "Brome grass", "Cabbage stem flea beetle",
  "Canopy disease (septoria)", "Eyespot", "Fusarium", "Light leaf spot",
  "Orange blossom midge", "Pollen beetle", "Ramularia", "Rhynchosporium",
  "Slugs", "Stem canker (sclerotinia)", "Take-all", "Tan spot", "Yellow rust",
];

const MONITORING_METHODS = [
  { value: "field_walk", label: "Field Walk" },
  { value: "suction_trap", label: "Suction Trap" },
  { value: "pheromone_trap", label: "Pheromone Trap" },
  { value: "sticky_yellow_trap", label: "Sticky Yellow Trap" },
  { value: "weather_model", label: "Weather Model" },
  { value: "lab_test", label: "Lab Test" },
  { value: "other", label: "Other" },
];

const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

function ipmStatusBadge(status: string) {
  const cls: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    draft: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    archived: "bg-gray-100 text-gray-500",
  };
  const label = IPM_STATUSES.find(s => s.value === status)?.label ?? status;
  return <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${cls[status] ?? "bg-gray-100 text-gray-600"}`}>{label}</span>;
}

function IpmPlanTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: ipmMembersData } = useFarmMembers(farmId);
  const ipmActiveMembers: any[] = (ipmMembersData?.members ?? []).filter((m: any) => m.isActive);
  const [planOpen, setPlanOpen] = useState(false);
  const [threshOpen, setThreshOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingThresh, setEditingThresh] = useState<any>(null);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState<any>({});
  const [threshForm, setThreshForm] = useState<any>({});
  const [logForm, setLogForm] = useState<any>({});
  const [detailTab, setDetailTab] = useState<"thresholds" | "monitoring">("thresholds");
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const setP = (k: string, v: any) => setPlanForm((f: any) => ({ ...f, [k]: v }));
  const setT = (k: string, v: any) => setThreshForm((f: any) => ({ ...f, [k]: v }));
  const setL = (k: string, v: any) => setLogForm((f: any) => ({ ...f, [k]: v }));

  const thisYear = currentCropYear();
  const planYearOptions = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

  const { data: plansRaw = [], isLoading } = useQuery({
    queryKey: ["ipm-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ipm-plans`).then(r => r.json()).then(d => d.plans ?? d.records ?? []),
    enabled: !!farmId,
  });
  const plans: any[] = plansRaw;

  const { data: thresholds = [] } = useQuery({
    queryKey: ["ipm-thresholds", farmId, selectedPlan?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/thresholds`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId && !!selectedPlan,
  });

  const { data: monitoringLogs = [] } = useQuery({
    queryKey: ["ipm-monitoring-logs", farmId, selectedPlan?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/monitoring-logs`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId && !!selectedPlan,
  });

  const { data: agronomists = [] } = useQuery({
    queryKey: ["suppliers-agronomist", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.json()).then(d => (d.records ?? []).filter((s: any) => s.supplierType === "agronomist" && s.isActive !== false)),
    enabled: !!farmId,
  });

  const { data: farmFields = [] } = useQuery({
    queryKey: ["fields-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()).then(d => d.fields ?? d.records ?? []),
    enabled: !!farmId,
  });

  const { data: farmCrops = [] } = useQuery({
    queryKey: ["crops-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crops`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const uniqueCropNames: string[] = Array.from(new Set((farmCrops as any[]).map((c: any) => c.name).filter(Boolean))).sort() as string[];

  const today = new Date().toISOString().slice(0, 10);
  const fmtDate = (d: string | null) => d ? new Date(d + "T12:00:00").toLocaleDateString("en-GB") : "—";

  // Upcoming alerts: plans expiring or review overdue
  const now = new Date();
  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const alertPlans = plans.filter((p: any) => {
    if (p.status === "archived") return false;
    const expired = p.validTo && new Date(p.validTo) < now;
    const reviewDue = p.reviewDate && new Date(p.reviewDate) <= soon;
    return expired || reviewDue;
  });

  async function savePlan() {
    const url = editingPlan ? `/api/farms/${farmId}/ipm-plans/${editingPlan.id}` : `/api/farms/${farmId}/ipm-plans`;
    const res = await fetch(url, { method: editingPlan ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(planForm) });
    if (!res.ok) { toast({ title: "Error saving plan", variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["ipm-plans", farmId] });
    setPlanOpen(false);
    toast({ title: editingPlan ? "Plan updated" : "IPM Plan created" });
  }

  async function deletePlan(id: number) {
    if (!confirm("Delete this IPM Plan? All threshold entries and monitoring logs will also be deleted.")) return;
    await fetch(`/api/farms/${farmId}/ipm-plans/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    qc.invalidateQueries({ queryKey: ["ipm-plans", farmId] });
    if (selectedPlan?.id === id) setSelectedPlan(null);
    toast({ title: "IPM Plan deleted" });
  }

  async function saveThreshold() {
    const url = editingThresh
      ? `/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/thresholds/${editingThresh.id}`
      : `/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/thresholds`;
    const res = await fetch(url, { method: editingThresh ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(threshForm) });
    if (!res.ok) { toast({ title: "Error saving threshold", variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["ipm-thresholds", farmId, selectedPlan?.id] });
    setThreshOpen(false);
    toast({ title: editingThresh ? "Threshold updated" : "Threshold added" });
  }

  async function deleteThreshold(id: number) {
    await fetch(`/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/thresholds/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    qc.invalidateQueries({ queryKey: ["ipm-thresholds", farmId, selectedPlan?.id] });
    toast({ title: "Threshold removed" });
  }

  async function saveLog() {
    const url = editingLog
      ? `/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/monitoring-logs/${editingLog.id}`
      : `/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/monitoring-logs`;
    const res = await fetch(url, { method: editingLog ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(logForm) });
    if (!res.ok) { toast({ title: "Error saving log entry", variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["ipm-monitoring-logs", farmId, selectedPlan?.id] });
    qc.invalidateQueries({ queryKey: ["notifications", farmId] });
    setLogOpen(false);
    toast({ title: editingLog ? "Log entry updated" : "Monitoring entry recorded" });
  }

  async function deleteLog(id: number) {
    await fetch(`/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/monitoring-logs/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    qc.invalidateQueries({ queryKey: ["ipm-monitoring-logs", farmId, selectedPlan?.id] });
  }

  function openNewPlan() {
    setEditingPlan(null);
    setPlanForm({ planYear: thisYear, status: "active", pestMonitoringFrequency: "weekly" });
    setPlanOpen(true);
  }

  function printIpmPlan() {
    if (!selectedPlan) return;
    const fmtD = (d: string | null) => d ? new Date(d + "T12:00:00").toLocaleDateString("en-GB") : "—";
    const threshRows = (thresholds as any[]).map((t: any) => `<tr>
      <td>${t.pestOrDisease}</td>
      <td>${t.monitoringMethod ?? "—"}${t.monitoringFrequency ? ` / ${t.monitoringFrequency}` : ""}</td>
      <td>${t.actionThreshold ?? "—"}</td>
      <td>${t.chemicalThreshold ?? "—"}</td>
      <td>${t.nonChemicalOption ?? "—"}</td>
      <td>${t.resistanceManagementGroup ?? "—"}</td>
    </tr>`).join("");
    const logRows = (monitoringLogs as any[]).map((l: any) => `<tr>
      <td>${fmtD(l.logDate)}</td>
      <td>${l.fieldName ?? l.fieldId ?? "—"}</td>
      <td>${l.pestOrDisease ?? "—"}</td>
      <td>${l.populationCount ?? l.infestation ?? "—"}</td>
      <td>${l.thresholdExceeded ? "Yes" : "No"}</td>
      <td>${l.actionTaken ?? "—"}</td>
      <td>${l.loggedBy ?? "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>IPM Plan — ${cropYearLabel(selectedPlan.planYear)}${selectedPlan.cropName ? ` — ${selectedPlan.cropName}` : ""}</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}h3{font-size:11px;margin:14px 0 5px;border-bottom:1px solid #e5e7eb;padding-bottom:3px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}.meta{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;font-size:10px}.meta span{color:#555}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body>
<h1>IPM Plan — ${cropYearLabel(selectedPlan.planYear)}${selectedPlan.cropName ? ` — ${selectedPlan.cropName}` : ""}</h1>
<h2>Integrated Pest Management — Red Tractor Combinable Crops</h2>
<div class="meta">
  ${selectedPlan.agronomistName ? `<span>Agronomist: <strong>${selectedPlan.agronomistName}</strong></span>` : ""}
  ${selectedPlan.basisNumber ? `<span>BASIS No.: <strong>${selectedPlan.basisNumber}</strong></span>` : ""}
  ${selectedPlan.validFrom ? `<span>Valid: <strong>${fmtD(selectedPlan.validFrom)} – ${fmtD(selectedPlan.validTo)}</strong></span>` : ""}
  ${selectedPlan.reviewDate ? `<span>Review Due: <strong>${fmtD(selectedPlan.reviewDate)}</strong></span>` : ""}
  <span>Status: <strong>${selectedPlan.status ?? "active"}</strong></span>
  <span>Printed: <strong>${new Date().toLocaleDateString("en-GB")}</strong></span>
</div>
${selectedPlan.cropManagementNotes ? `<p style="font-size:10px;margin-bottom:10px"><strong>Crop Management Notes:</strong> ${selectedPlan.cropManagementNotes}</p>` : ""}
<h3>Pest / Weed / Disease Thresholds &amp; Actions (${(thresholds as any[]).length} ${(thresholds as any[]).length === 1 ? "entry" : "entries"})</h3>
${(thresholds as any[]).length === 0 ? "<p style='font-style:italic;color:#888'>No threshold entries recorded.</p>" : `<table><thead><tr><th>Pest / Weed / Disease</th><th>Method / Frequency</th><th>Action Threshold</th><th>Chemical Threshold</th><th>Non-Chemical Control</th><th>Resistance Group</th></tr></thead><tbody>${threshRows}</tbody></table>`}
<h3>Monitoring Log (${(monitoringLogs as any[]).length} ${(monitoringLogs as any[]).length === 1 ? "entry" : "entries"})</h3>
${(monitoringLogs as any[]).length === 0 ? "<p style='font-style:italic;color:#888'>No monitoring log entries recorded.</p>" : `<table><thead><tr><th>Date</th><th>Field</th><th>Pest / Disease</th><th>Count / Level</th><th>Threshold Exceeded</th><th>Action Taken</th><th>Logged By</th></tr></thead><tbody>${logRows}</tbody></table>`}
<p class="footer">Red Tractor Combinable Crops: A written IPM plan per crop per year is required, covering monitoring protocols, economic thresholds, and preference for non-chemical controls. Records must be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  const thresholdPestNames: string[] = (thresholds as any[]).map((t: any) => t.pestOrDisease).filter(Boolean);

  const detailTabBtn = (tab: "thresholds" | "monitoring", label: string, count: number) => (
    <button
      onClick={() => setDetailTab(tab)}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${detailTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
    >
      {label} {count > 0 && <span className={`ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs ${detailTab === tab ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{count}</span>}
    </button>
  );

  return (
    <div>
      {/* Alerts */}
      {alertPlans.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Action required:</span>{" "}
            {alertPlans.map((p: any, i: number) => {
              const expired = p.validTo && new Date(p.validTo) < now;
              const label = `${cropYearLabel(p.planYear)}${p.cropName ? ` ${p.cropName}` : ""}`;
              return <span key={p.id}>{i > 0 ? ", " : ""}<strong>{label}</strong> — {expired ? "plan has expired" : "review due"}</span>;
            })}
            . Visit the Week Ahead Planner once review date / validity reminders are wired in.
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Integrated Pest Management (IPM) Plans</h3>
          <p className="text-xs text-gray-500 mt-0.5">Red Tractor requires a written IPM plan per crop per year, covering monitoring, economic thresholds, and non-chemical controls. Select a plan to log monitoring observations.</p>
        </div>
        <Button size="sm" onClick={openNewPlan}><Plus className="w-3.5 h-3.5 mr-1" />New IPM Plan</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Plan list */}
        <div className="lg:col-span-1 border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">Plans</div>
          {isLoading ? <div className="p-4 text-sm text-gray-400">Loading…</div> : plans.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No IPM plans yet. Create your first plan above.</div>
          ) : (
            <div className="divide-y">
              {plans.map((p: any) => {
                const expired = p.validTo && new Date(p.validTo) < now;
                const reviewDue = p.reviewDate && new Date(p.reviewDate) <= soon;
                return (
                  <button key={p.id} className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${selectedPlan?.id === p.id ? "bg-green-50 border-l-2 border-green-600" : ""}`} onClick={() => { setSelectedPlan(p); setDetailTab("thresholds"); }}>
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="font-medium text-sm leading-tight">{cropYearLabel(p.planYear)}{p.cropName ? ` — ${p.cropName}` : ""}</div>
                        {p.agronomistName && <div className="text-xs text-gray-500 mt-0.5">{p.agronomistName}{p.basisNumber ? ` · BASIS ${p.basisNumber}` : ""}</div>}
                      </div>
                      <div className="flex-shrink-0">{ipmStatusBadge(p.status ?? "active")}</div>
                    </div>
                    {(p.validFrom || p.validTo) && (
                      <div className={`text-xs mt-0.5 ${expired ? "text-red-600 font-medium" : "text-gray-400"}`}>
                        Valid: {fmtDate(p.validFrom)} – {fmtDate(p.validTo)}{expired ? " ⚠ Expired" : ""}
                      </div>
                    )}
                    {p.reviewDate && (
                      <div className={`text-xs mt-0.5 ${reviewDue ? "text-amber-600 font-medium" : "text-gray-400"}`}>
                        Review: {fmtDate(p.reviewDate)}{reviewDue ? " ⚠ Due" : ""}
                      </div>
                    )}
                    <div className="flex gap-1 mt-1.5" onClick={e => e.stopPropagation()}>
                      <button className="text-xs text-blue-600 hover:underline" onClick={() => { setEditingPlan(p); setPlanForm({ ...p }); setPlanOpen(true); }}>Edit</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-xs text-red-600 hover:underline" onClick={() => deletePlan(p.id)}>Delete</button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Plan detail */}
        <div className="lg:col-span-2">
          {!selectedPlan ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-gray-400">
              Select a plan to view thresholds and log monitoring observations
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Plan metadata header */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{cropYearLabel(selectedPlan.planYear)}{selectedPlan.cropName ? ` — ${selectedPlan.cropName}` : ""}</span>
                    {ipmStatusBadge(selectedPlan.status ?? "active")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={printIpmPlan}><Printer className="w-3 h-3 mr-1" />Print Plan</Button>
                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                      {detailTabBtn("thresholds", "Thresholds & Actions", (thresholds as any[]).length)}
                      {detailTabBtn("monitoring", "Monitoring Log", (monitoringLogs as any[]).length)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {selectedPlan.agronomistName && <span>Agronomist: <strong className="text-gray-700">{selectedPlan.agronomistName}</strong></span>}
                  {selectedPlan.basisNumber && <span>BASIS: <strong className="text-gray-700 font-mono">{selectedPlan.basisNumber}</strong></span>}
                  {selectedPlan.pestMonitoringFrequency && <span>Monitoring: <strong className="text-gray-700">{selectedPlan.pestMonitoringFrequency.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</strong></span>}
                  {selectedPlan.validTo && <span className={new Date(selectedPlan.validTo) < now ? "text-red-600 font-medium" : ""}>Valid to: {fmtDate(selectedPlan.validTo)}</span>}
                  {selectedPlan.reviewDate && <span className={new Date(selectedPlan.reviewDate) <= soon ? "text-amber-600 font-medium" : ""}>Review: {fmtDate(selectedPlan.reviewDate)}</span>}
                </div>
              </div>

              {/* Thresholds tab */}
              {detailTab === "thresholds" && (
                <>
                  <div className="px-3 py-2 border-b flex items-center justify-between bg-white">
                    <span className="text-xs text-gray-500">{(thresholds as any[]).length} pest / weed / disease entr{(thresholds as any[]).length === 1 ? "y" : "ies"}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditingThresh(null); setThreshForm({ monitoringMethod: "field_walk", actionTaken: "none" }); setThreshOpen(true); }}>
                      <Plus className="w-3 h-3 mr-1" />Add Pest / Weed
                    </Button>
                  </div>
                  {(thresholds as any[]).length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">No threshold entries yet. Add the pests, weeds, or diseases you monitor for this crop.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 bg-gray-50">
                          <tr>{["Pest / Weed / Disease", "Method / Frequency", "Decision Threshold", "Chemical Threshold", "Non-Chemical Control", "Resistance Group", ""].map(h => <th key={h} className="text-left px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y">
                          {(thresholds as any[]).map((t: any) => (
                            <tr key={t.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-xs">{t.pestOrDisease}</td>
                              <td className="px-3 py-2 text-xs text-gray-500">
                                {MONITORING_METHODS.find(m => m.value === t.monitoringMethod)?.label ?? t.monitoringMethod ?? "—"}
                                {t.monitoringFrequency && <div className="text-gray-400">{t.monitoringFrequency}</div>}
                              </td>
                              <td className="px-3 py-2 text-xs">{t.actionThreshold ?? "—"}</td>
                              <td className="px-3 py-2 text-xs">{t.chemicalThreshold ?? "—"}</td>
                              <td className="px-3 py-2 text-xs max-w-[140px] truncate" title={t.nonChemicalOption}>{t.nonChemicalOption ?? "—"}</td>
                              <td className="px-3 py-2 text-xs">{t.resistanceManagementGroup ?? "—"}</td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingThresh(t); setThreshForm({ ...t }); setThreshOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => deleteThreshold(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {(selectedPlan.overallStrategy || selectedPlan.rotationAndCulturalControls || selectedPlan.biologicalControls) && (
                    <div className="border-t grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x bg-gray-50">
                      {selectedPlan.overallStrategy && <div className="px-3 py-3"><p className="text-xs font-medium text-gray-500 mb-1">Overall Strategy</p><p className="text-xs text-gray-700">{selectedPlan.overallStrategy}</p></div>}
                      {selectedPlan.rotationAndCulturalControls && <div className="px-3 py-3"><p className="text-xs font-medium text-gray-500 mb-1">Rotation / Cultural Controls</p><p className="text-xs text-gray-700">{selectedPlan.rotationAndCulturalControls}</p></div>}
                      {selectedPlan.biologicalControls && <div className="px-3 py-3"><p className="text-xs font-medium text-gray-500 mb-1">Biological Controls</p><p className="text-xs text-gray-700">{selectedPlan.biologicalControls}</p></div>}
                    </div>
                  )}
                </>
              )}

              {/* Monitoring log tab */}
              {detailTab === "monitoring" && (
                <>
                  <div className="px-3 py-2 border-b flex items-center justify-between bg-white">
                    <span className="text-xs text-gray-500">{(monitoringLogs as any[]).length} monitoring entr{(monitoringLogs as any[]).length === 1 ? "y" : "ies"} · Frequency: <strong>{selectedPlan.pestMonitoringFrequency?.replace(/_/g, " ") ?? "not set"}</strong></span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditingLog(null); setLogForm({ logDate: today, thresholdBreached: false }); setLogOpen(true); }}>
                      <Plus className="w-3 h-3 mr-1" />Log Observation
                    </Button>
                  </div>
                  {(monitoringLogs as any[]).length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">No monitoring observations logged yet. Record field observations to track pest and disease pressure over the season.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 bg-gray-50">
                          <tr>{["Date", "Pest / Weed", "Severity", "Threshold?", "Observation / Count", "Action Taken", "Inspector", ""].map(h => <th key={h} className="text-left px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y">
                          {(monitoringLogs as any[]).map((l: any) => {
                            const isExpanded = expandedLogId === l.id;
                            const hasDetail = !!(l.observation || l.actionTaken);
                            const baseBg = l.thresholdBreached ? "bg-red-50" : "";
                            return (
                              <React.Fragment key={l.id}>
                                <tr className={`hover:bg-gray-50 ${baseBg} ${isExpanded ? "border-b-0" : ""}`}>
                                  <td className="px-3 py-2 text-xs whitespace-nowrap">{fmtDate(l.logDate)}</td>
                                  <td className="px-3 py-2 text-xs font-medium">{l.pestOrWeed}</td>
                                  <td className="px-3 py-2 text-xs">
                                    {l.severity ? <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${l.severity === "Critical" ? "bg-red-100 text-red-700" : l.severity === "High" ? "bg-orange-100 text-orange-700" : l.severity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{l.severity}</span> : "—"}
                                  </td>
                                  <td className="px-3 py-2 text-xs">{l.thresholdBreached ? <span className="text-red-600 font-medium">⚠ Yes</span> : <span className="text-gray-400">No</span>}</td>
                                  <td className="px-3 py-2 text-xs max-w-[140px] truncate">{l.observation ?? "—"}</td>
                                  <td className="px-3 py-2 text-xs max-w-[100px] truncate">{l.actionTaken ?? "—"}</td>
                                  <td className="px-3 py-2 text-xs">{l.inspector ?? "—"}</td>
                                  <td className="px-3 py-2">
                                    <div className="flex gap-1 items-center">
                                      {hasDetail && (
                                        <Button size="sm" variant="ghost" className="h-7 px-1.5 text-gray-400" title={isExpanded ? "Collapse" : "Show full details"} onClick={() => setExpandedLogId(isExpanded ? null : l.id)}>
                                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </Button>
                                      )}
                                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingLog(l); setLogForm({ ...l }); setLogOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => deleteLog(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className={baseBg}>
                                    <td colSpan={8} className="px-3 pb-3 pt-0">
                                      <div className="bg-white border border-gray-200 rounded-lg p-3 grid grid-cols-1 gap-2">
                                        {l.observation && (
                                          <div>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Observation / Count</p>
                                            <p className="text-xs text-gray-700 leading-relaxed">{l.observation}</p>
                                          </div>
                                        )}
                                        {l.actionTaken && (
                                          <div>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Action Taken</p>
                                            <p className="text-xs text-gray-700 leading-relaxed">{l.actionTaken}</p>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
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
      </div>

      {/* ── Plan dialog ───────────────────────────────────────────────────── */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingPlan ? "Edit" : "New"} IPM Plan</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">

            {/* Crop Year */}
            <div>
              <Label>Crop Year *</Label>
              <Select value={String(planForm.planYear ?? thisYear)} onValueChange={v => setP("planYear", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{planYearOptions.map(y => <SelectItem key={y} value={String(y)}>{cropYearLabel(y)}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={planForm.status || "active"} onValueChange={v => setP("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{IPM_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Crop Name */}
            <div className="col-span-2">
              <Label>Crop *</Label>
              {uniqueCropNames.length > 0 ? (
                <Select value={planForm.cropName || ""} onValueChange={v => setP("cropName", v)}>
                  <SelectTrigger><SelectValue placeholder="Select crop…" /></SelectTrigger>
                  <SelectContent>{uniqueCropNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input value={planForm.cropName || ""} onChange={e => setP("cropName", e.target.value)} placeholder="e.g. Winter Wheat, OSR, Spring Barley…" />
              )}
              <p className="text-xs text-gray-400 mt-1">IPM plans are per-crop — create a separate plan for each crop grown in this year.{uniqueCropNames.length === 0 && " Add crops in Field &amp; Crop Management to enable the lookup."}</p>
            </div>

            {/* Valid From / To */}
            <div><Label>Valid From</Label><Input type="date" value={planForm.validFrom || ""} onChange={e => setP("validFrom", e.target.value)} /></div>
            <div><Label>Valid To</Label><Input type="date" value={planForm.validTo || ""} onChange={e => setP("validTo", e.target.value)} /></div>

            {/* Pest Monitoring Frequency */}
            <div>
              <Label>Pest Monitoring Frequency</Label>
              <Select value={planForm.pestMonitoringFrequency || "weekly"} onValueChange={v => setP("pestMonitoringFrequency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["daily", "twice_weekly", "weekly", "fortnightly", "monthly", "as_needed"].map(f => <SelectItem key={f} value={f}>{f.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Review Date */}
            <div><Label>Review Date</Label><Input type="date" value={planForm.reviewDate || ""} onChange={e => setP("reviewDate", e.target.value)} /></div>

            {/* Agronomist */}
            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Agronomist</p>
              <div className="grid grid-cols-2 gap-3">
                {(agronomists as any[]).length > 0 ? (
                  <div>
                    <Label>Select Agronomist</Label>
                    <Select
                      value={planForm.agronomistId ? String(planForm.agronomistId) : "__manual__"}
                      onValueChange={v => {
                        if (v === "__manual__") {
                          setP("agronomistId", null);
                        } else {
                          const found = (agronomists as any[]).find((a: any) => String(a.id) === v);
                          if (found) {
                            setP("agronomistId", found.id);
                            setP("agronomistName", found.name);
                            if (found.basisNumber) setP("basisNumber", found.basisNumber);
                          }
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select agronomist…" /></SelectTrigger>
                      <SelectContent>
                        {(agronomists as any[]).map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.name}{a.basisNumber ? ` (${a.basisNumber})` : ""}</SelectItem>)}
                        <SelectItem value="__manual__">— Enter manually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label>Agronomist Name</Label>
                    <p className="text-xs text-gray-400 mb-1">Add suppliers with type "Agronomist" to enable lookup and auto-fill.</p>
                  </div>
                )}
                <div>
                  <Label>Agronomist Name</Label>
                  <Input value={planForm.agronomistName || ""} onChange={e => { setP("agronomistName", e.target.value); setP("agronomistId", null); }} placeholder="Name" />
                </div>
                <div>
                  <Label>BASIS Registration No.</Label>
                  <Input value={planForm.basisNumber || ""} onChange={e => setP("basisNumber", e.target.value)} placeholder="e.g. 12345/6789" className="font-mono" />
                </div>
              </div>
            </div>

            {/* IPM Strategy text fields */}
            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Plan Content</p>
            </div>
            <div className="col-span-2"><Label>Overall IPM Strategy</Label><Textarea rows={3} value={planForm.overallStrategy || ""} onChange={e => setP("overallStrategy", e.target.value)} placeholder="Describe your overall approach to integrated pest management…" /></div>
            <div className="col-span-2"><Label>Rotation / Cultural Controls</Label><Textarea rows={2} value={planForm.rotationAndCulturalControls || ""} onChange={e => setP("rotationAndCulturalControls", e.target.value)} placeholder="Crop rotation plan, variety selection rationale, drilling date adjustments, seed rates…" /></div>
            <div className="col-span-2"><Label>Biological Controls Used</Label><Textarea rows={2} value={planForm.biologicalControls || ""} onChange={e => setP("biologicalControls", e.target.value)} placeholder="Beneficial insect habitat, biocontrol agents, beetle banks, buffer strips…" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={planForm.notes || ""} onChange={e => setP("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>Cancel</Button>
            <Button onClick={savePlan} disabled={!planForm.planYear || !planForm.cropName}>{editingPlan ? "Save Changes" : "Create Plan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Threshold dialog ──────────────────────────────────────────────── */}
      <Dialog open={threshOpen} onOpenChange={setThreshOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingThresh ? "Edit" : "Add"} Pest / Weed Threshold</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <Label>Pest / Weed / Disease *</Label>
              <Select value={threshForm.pestOrDisease || "__custom__"} onValueChange={v => { if (v !== "__custom__") setT("pestOrDisease", v); }}>
                <SelectTrigger><SelectValue placeholder="Select or type below" /></SelectTrigger>
                <SelectContent>{THRESHOLD_PESTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}<SelectItem value="__custom__">— Other (type below)</SelectItem></SelectContent>
              </Select>
              <Input className="mt-1" placeholder="Or type pest / weed name" value={threshForm.pestOrDisease || ""} onChange={e => setT("pestOrDisease", e.target.value)} />
            </div>
            <div>
              <Label>Monitoring Method</Label>
              <Select value={threshForm.monitoringMethod || "field_walk"} onValueChange={v => setT("monitoringMethod", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MONITORING_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Monitoring Frequency</Label><Input value={threshForm.monitoringFrequency || ""} onChange={e => setT("monitoringFrequency", e.target.value)} placeholder="e.g. Weekly from GS31" /></div>
            <div><Label>Decision (Economic) Threshold</Label><Input value={threshForm.actionThreshold || ""} onChange={e => setT("actionThreshold", e.target.value)} placeholder="e.g. 5 aphids/tiller at GS37–45" /></div>
            <div><Label>Chemical Spray Threshold</Label><Input value={threshForm.chemicalThreshold || ""} onChange={e => setT("chemicalThreshold", e.target.value)} placeholder="e.g. 1 plant/m² black-grass" /></div>
            <div className="col-span-2"><Label>Non-Chemical Control Measures</Label><Textarea rows={2} value={threshForm.nonChemicalOption || ""} onChange={e => setT("nonChemicalOption", e.target.value)} placeholder="Variety choice, delayed drilling, rotation, biocontrol, mechanical weeding…" /></div>
            <div><Label>Resistance Management Group</Label><Input value={threshForm.resistanceManagementGroup || ""} onChange={e => setT("resistanceManagementGroup", e.target.value)} placeholder="e.g. SDHI (Group 7)" /></div>
            <div>
              <Label>Current Season Action</Label>
              <Select value={threshForm.actionTaken || "none"} onValueChange={v => setT("actionTaken", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["none", "monitoring_only", "cultural_control", "biological_control", "chemical_control", "combination"].map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={threshForm.notes || ""} onChange={e => setT("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setThreshOpen(false)}>Cancel</Button>
            <Button onClick={saveThreshold} disabled={!threshForm.pestOrDisease}>{editingThresh ? "Save Changes" : "Add Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Monitoring log dialog ─────────────────────────────────────────── */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLog ? "Edit" : "Log"} Monitoring Observation</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><Label>Date *</Label><Input type="date" value={logForm.logDate || today} onChange={e => setL("logDate", e.target.value)} /></div>
            <div>
              <Label>Field</Label>
              <Select value={logForm.fieldId ? String(logForm.fieldId) : ""} onValueChange={v => setL("fieldId", v || null)}>
                <SelectTrigger><SelectValue placeholder="All fields / general" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All fields / general</SelectItem>
                  {(farmFields as any[]).map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Pest / Weed / Disease *</Label>
              {thresholdPestNames.length > 0 ? (
                <Select value={logForm.pestOrWeed || "__custom__"} onValueChange={v => { if (v !== "__custom__") setL("pestOrWeed", v); }}>
                  <SelectTrigger><SelectValue placeholder="Select from plan thresholds" /></SelectTrigger>
                  <SelectContent>{thresholdPestNames.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}<SelectItem value="__custom__">— Other (type below)</SelectItem></SelectContent>
                </Select>
              ) : null}
              <Input className={thresholdPestNames.length > 0 ? "mt-1" : ""} placeholder="Pest / weed observed" value={logForm.pestOrWeed || ""} onChange={e => setL("pestOrWeed", e.target.value)} />
            </div>
            <div><Label>Observation / Count</Label><Input value={logForm.observation || ""} onChange={e => setL("observation", e.target.value)} placeholder="e.g. 3 aphids/tiller, 5% leaf damage" /></div>
            <div>
              <Label>Severity</Label>
              <Select value={logForm.severity || ""} onValueChange={v => setL("severity", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent><SelectItem value="">—</SelectItem>{SEVERITY_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex items-center gap-3 py-1">
              <input type="checkbox" id="threshBreached" checked={!!logForm.thresholdBreached} onChange={e => setL("thresholdBreached", e.target.checked)} className="w-4 h-4 accent-red-600" />
              <label htmlFor="threshBreached" className="text-sm font-medium text-gray-700 cursor-pointer">Economic threshold breached — action required</label>
            </div>
            <div className="col-span-2"><Label>Action Taken</Label><Input value={logForm.actionTaken || ""} onChange={e => setL("actionTaken", e.target.value)} placeholder="e.g. Monitoring only, applied fungicide T1, cultural control…" /></div>
            <div>
              <Label>Inspector / Scout</Label>
              <Select value={logForm.inspector || ""} onValueChange={v => setL("inspector", v)}>
                <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                <SelectContent>
                  {ipmActiveMembers.map((m: any) => {
                    const name = memberFullName(m);
                    return <SelectItem key={m.id} value={name}>{name}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={logForm.notes || ""} onChange={e => setL("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)}>Cancel</Button>
            <Button onClick={saveLog} disabled={!logForm.logDate || !logForm.pestOrWeed}>{editingLog ? "Save Changes" : "Save Observation"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── LERAP Assessment Tab ──────────────────────────────────────────────────────
const LERAP_STEPS = [
  { value: "1", label: "Step 1 — Notify only (product registrant notified; no buffer reduction required)" },
  { value: "2", label: "Step 2 — Standard label buffer maintained (no reduction sought)" },
  { value: "3", label: "Step 3 — Full LERAP assessment performed (buffer reduction possible)" },
];
const LERAP_OUTCOMES = [
  { value: "full_buffer_maintained", label: "Full standard buffer maintained" },
  { value: "reduced_buffer", label: "Reduced buffer achieved via LERAP" },
  { value: "no_spray", label: "No spray — risk too high" },
  { value: "pending", label: "Pending review" },
];
const WATERCOURSE_TYPES = [
  { value: "river", label: "River / stream" },
  { value: "ditch", label: "Ditch (flow or dry)" },
  { value: "pond", label: "Pond / lake" },
  { value: "drain", label: "Drain" },
  { value: "coastal", label: "Coastal water" },
];

function LerapTab({ farmId, products, fields }: { farmId: number; products: any[]; fields: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [cropAutoFilled, setCropAutoFilled] = useState(false);
  const [soilAutoFilled, setSoilAutoFilled] = useState(false);
  const [bufferAutoFilled, setBufferAutoFilled] = useState(false);
  const [filterField, setFilterField] = useState("__all__");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRecord, setReviewRecord] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState<{ confirmedOutcome: string; reviewNotes: string }>({ confirmedOutcome: "full_buffer_maintained", reviewNotes: "" });
  const reviewMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      fetch(`/api/farms/${farmId}/lerap-assessments/${id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lerap-assessments", farmId] }); setReviewOpen(false); toast({ title: "Review recorded", description: "The LERAP assessment has been marked as reviewed and the Task Board task closed." }); },
    onError: () => toast({ title: "Error recording review", variant: "destructive" }),
  });

  useEffect(() => {
    if (!form.fieldId || editing) { setCropAutoFilled(false); setSoilAutoFilled(false); return; }
    const field = fields.find((f: any) => f.id === Number(form.fieldId));
    if (!field?.name) return;
    // Auto-fill soil type from field record
    if (field.soilType) { set("soilType", field.soilType); setSoilAutoFilled(true); } else { setSoilAutoFilled(false); }
    let cancelled = false;
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/farms/${farmId}/crop-for-field?fieldName=${encodeURIComponent(field.name)}&date=${today}`, { credentials: "include" })
      .then(r => r.json())
      .then((data: { found: boolean; cropName: string | null }) => {
        if (!cancelled && data.found && data.cropName) {
          set("cropType", data.cropName);
          setCropAutoFilled(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [form.fieldId]);

  useEffect(() => {
    if (!form.productId || editing) { setBufferAutoFilled(false); return; }
    const product = products.find((p: any) => p.id === Number(form.productId));
    if (product?.lerapStandardBufferM != null) {
      set("standardBufferM", String(product.lerapStandardBufferM));
      setBufferAutoFilled(true);
    } else {
      setBufferAutoFilled(false);
    }
  }, [form.productId]);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["lerap-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lerap-assessments`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["staff-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`).then(r => r.json()).then(d => d.staff ?? []),
    enabled: !!farmId,
  });

  const lerapFilterFields = (() => {
    const ids = Array.from(new Set(records.map((r: any) => r.fieldId).filter((id: any) => id != null))) as number[];
    return ids.map((id: number) => fields.find((f: any) => f.id === id)).filter(Boolean).sort((a: any, b: any) => a.name.localeCompare(b.name));
  })();

  function openAdd() { setEditing(null); setForm({ step: "3", outcome: "pending" }); setCropAutoFilled(false); setSoilAutoFilled(false); setBufferAutoFilled(false); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setCropAutoFilled(false); setSoilAutoFilled(false); setBufferAutoFilled(false); setOpen(true); }

  async function save() {
    const url = editing ? `/api/farms/${farmId}/lerap-assessments/${editing.id}` : `/api/farms/${farmId}/lerap-assessments`;
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { toast({ title: "Error saving assessment", variant: "destructive" }); return; }
    const data = await res.json();
    qc.invalidateQueries({ queryKey: ["lerap-assessments", farmId] });
    setOpen(false);
    if (editing) {
      toast({ title: "Assessment updated" });
    } else {
      const docRef = `LERAP-${data.record?.id ?? ""}`;
      toast({ title: "LERAP assessment recorded", description: `Document reference: ${docRef}` });
    }
  }

  async function del(id: number) {
    if (!confirm("Delete this LERAP assessment?")) return;
    await fetch(`/api/farms/${farmId}/lerap-assessments/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    qc.invalidateQueries({ queryKey: ["lerap-assessments", farmId] });
    toast({ title: "Assessment deleted" });
  }

  function printLerapRegister() {
    const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const outcomeLbl = (o: string) => ({ full_buffer_maintained: "Full Buffer Maintained", reduced_buffer: "Reduced Buffer", no_spray: "No Spray Zone", pending: "Pending Review" }[o as string] ?? o);
    const getF = (id: number | null) => id ? (fields.find((f: any) => f.id === id)?.name ?? `Field #${id}`) : "—";
    const getP = (id: number | null) => id ? (products.find((p: any) => p.id === id)?.name ?? `Product #${id}`) : "—";
    const rows = (records as any[]).map((r: any) => `<tr>
      <td>LERAP-${r.id}</td>
      <td>${fmtD(r.assessmentDate)}</td>
      <td>${getF(r.fieldId)}</td>
      <td>${getP(r.productId)}</td>
      <td>Step ${r.step ?? "—"}</td>
      <td>${r.watercourseDescription ?? "—"}</td>
      <td>${r.standardBufferM != null ? r.standardBufferM + "m" : "—"}</td>
      <td>${r.lerapBufferM != null ? r.lerapBufferM + "m" : "—"}</td>
      <td>${r.outcome ? outcomeLbl(r.outcome) : "—"}</td>
      <td>${fmtD(r.validUntil)}</td>
      <td>${r.assessorName ?? "—"}</td>
      <td>${r.reviewedBy ? `${r.reviewedBy} (${fmtD(r.reviewedAt)})` : r.pendingReviewBy ? `Pending: ${r.pendingReviewBy}` : "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>LERAP Assessments Register</title>
<style>body{font-family:Arial,sans-serif;font-size:9px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:3px 5px;border:1px solid #e5e7eb;text-align:left}td{padding:3px 5px;border:1px solid #e5e7eb;font-size:9px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>LERAP Assessments Register</h1>
<h2>Local Environmental Risk Assessment for Pesticides · ${records.length} record${records.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Ref</th><th>Date</th><th>Field</th><th>Product</th><th>Level</th><th>Watercourse</th><th>Std Buffer</th><th>LERAP Buffer</th><th>Outcome</th><th>Valid Until</th><th>Assessor</th><th>Review</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">LERAP assessments must be completed for each application of a product with a LERAP label near a surface watercourse. Red Tractor requires evidence of completed assessments and maintained buffer zones. Retain for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const getFieldName = (id: number | null) => id ? (fields.find(f => f.id === id)?.name ?? `Field #${id}`) : "—";
  const getProductName = (id: number | null) => id ? (products.find(p => p.id === id)?.name ?? `Product #${id}`) : "—";
  const outcomeBadge = (o: string) => {
    const colours: Record<string, string> = { full_buffer_maintained: "bg-green-100 text-green-800", reduced_buffer: "bg-blue-100 text-blue-800", no_spray: "bg-red-100 text-red-800", pending: "bg-amber-100 text-amber-800" };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[o] ?? "bg-gray-100 text-gray-700"}`}>{LERAP_OUTCOMES.find(x => x.value === o)?.label?.split("—")[1]?.trim() ?? o}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">LERAP Assessments Register</h3>
          <p className="text-xs text-gray-500 mt-0.5">Local Environmental Risk Assessment for Pesticides. Required when spraying products with a LERAP label near surface water. Red Tractor requires evidence of completed assessments and maintained buffer zones.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {records.length > 0 && <Button size="sm" variant="outline" onClick={printLerapRegister}><Printer className="w-3.5 h-3.5 mr-1" />Print Register</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Assessment</Button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="font-medium text-gray-600">No LERAP assessments recorded</p>
          <p className="text-sm text-gray-400 mt-1">Record a LERAP assessment for each field/product combination near surface water.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {lerapFilterFields.length > 1 && (
            <div className="flex items-center gap-2 mb-3">
              <Select value={filterField} onValueChange={setFilterField}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All fields" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  <SelectItem value="__all__">All fields</SelectItem>
                  {lerapFilterFields.map((f: any) => (
                    <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterField !== "__all__" && (
                <span className="text-xs text-gray-500">Filtered to 1 field</span>
              )}
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Ref","Date","Field","Product","Assessment Level","Watercourse","Std. Buffer","LERAP Buffer","Outcome","Valid Until","Assessor",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.filter((r: any) => filterField === "__all__" || r.fieldId === Number(filterField)).map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-gray-500">LERAP-{r.id}</td>
                  <td className="px-3 py-2">{fmtDate(r.assessmentDate)}</td>
                  <td className="px-3 py-2">{getFieldName(r.fieldId)}</td>
                  <td className="px-3 py-2">{getProductName(r.productId)}</td>
                  <td className="px-3 py-2 text-xs">Step {r.step ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.watercourseDescription ?? "—"}</td>
                  <td className="px-3 py-2">{r.standardBufferM != null ? `${r.standardBufferM}m` : "—"}</td>
                  <td className="px-3 py-2">{r.lerapBufferM != null ? <span className={r.lerapBufferM < r.standardBufferM ? "text-blue-700 font-medium" : ""}>{r.lerapBufferM}m</span> : "—"}</td>
                  <td className="px-3 py-2">
                    {r.outcome ? outcomeBadge(r.outcome) : "—"}
                    {r.outcome === "pending" && r.pendingReviewBy && (
                      <div className="text-xs text-amber-600 mt-0.5">Awaiting: {r.pendingReviewBy}</div>
                    )}
                    {r.reviewedBy && (
                      <div className="flex items-center gap-1 text-xs text-green-700 mt-0.5">
                        <CheckCircle className="w-3 h-3" />
                        {r.reviewedBy} · {fmtDate(r.reviewedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">{fmtDate(r.validUntil)}</td>
                  <td className="px-3 py-2">{r.assessorName ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {r.outcome === "pending" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Mark as Reviewed"
                          onClick={() => { setReviewRecord(r); setReviewForm({ confirmedOutcome: "full_buffer_maintained", reviewNotes: "" }); setReviewOpen(true); }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} LERAP Assessment</DialogTitle></DialogHeader>
          {editing && (
            <div className="flex items-center gap-2 px-1 py-2 bg-gray-50 rounded-md border text-sm">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Document Reference</span>
              <span className="font-mono font-semibold text-gray-800">LERAP-{editing.id}</span>
              <span className="text-xs text-gray-400 ml-1">(read-only)</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate || ""} onChange={e => set("assessmentDate", e.target.value)} /></div>
            <div>
              <Label>CRD Assessment Step</Label>
              <Select value={form.step || "3"} onValueChange={v => set("step", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LERAP_STEPS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">Steps 1–3 are the CRD LERAP scheme levels, not sequential actions. Select the one that describes this assessment.</p>
            </div>
            <div><Label>Field</Label>
              <Select value={String(form.fieldId || "__none__")} onValueChange={v => set("fieldId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not specified</SelectItem>{fields.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Product</Label>
              <Select value={String(form.productId || "__none__")} onValueChange={v => set("productId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not specified</SelectItem>{products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Watercourse Description</Label><Input value={form.watercourseDescription || ""} onChange={e => set("watercourseDescription", e.target.value)} placeholder="e.g. River Severn (main channel), drainage ditch on eastern boundary" /></div>
            <div><Label>Watercourse Type</Label>
              <Select value={form.watercourseType || "__none__"} onValueChange={v => set("watercourseType", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not specified</SelectItem>{WATERCOURSE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Label>Standard Buffer (m)</Label>
                {bufferAutoFilled && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Auto-filled</span>}
              </div>
              <Input type="number" step="0.5" min="0" value={form.standardBufferM ?? ""} onChange={e => { set("standardBufferM", e.target.value); setBufferAutoFilled(false); }} placeholder="From product label" />
              {!bufferAutoFilled && <p className="text-xs text-gray-400 mt-1">Auto-fills from the product's label data when a product is selected.</p>}
            </div>
            <div><Label>LERAP Buffer Achieved (m)</Label><Input type="number" step="0.5" min="0" value={form.lerapBufferM ?? ""} onChange={e => set("lerapBufferM", e.target.value)} placeholder="After LERAP assessment" /></div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Label>Crop Type</Label>
                {cropAutoFilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Auto-filled
                  </span>
                )}
              </div>
              <Input value={form.cropType || ""} onChange={e => { set("cropType", e.target.value); setCropAutoFilled(false); }} placeholder="e.g. Winter wheat" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Label>Soil Type</Label>
                {soilAutoFilled && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Auto-filled</span>}
              </div>
              <Input value={form.soilType || ""} onChange={e => { set("soilType", e.target.value); setSoilAutoFilled(false); }} placeholder="e.g. Sandy loam, clay" />
              <p className="text-xs text-gray-400 mt-1">Record the soil type present in the field — this is a site characteristic for the assessment record. The CRD LERAP scheme takes soil type into account when evaluating run-off risk for Category B products; the actual buffer zone calculation is done using CRD tables or the product approval documents. Auto-fills from the field record if recorded there.</p>
            </div>
            <div>
              <Label>Outcome *</Label>
              <Select value={form.outcome || "pending"} onValueChange={v => set("outcome", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LERAP_OUTCOMES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.outcome === "pending" && (() => {
              const reviewableStaff = (staffList as any[]).filter((s: any) => s.email != null && s.email !== "");
              const selectedVal = form.pendingReviewByMemberId
                ? `m:${form.pendingReviewByMemberId}`
                : form.pendingReviewByEmail
                  ? `u:${form.pendingReviewBy}`
                  : "__none__";
              return (
                <div className="col-span-2">
                  <Label>Pending Review By</Label>
                  {reviewableStaff.length > 0 ? (
                    <Select value={selectedVal} onValueChange={v => {
                      if (v === "__none__") {
                        set("pendingReviewBy", null); set("pendingReviewByMemberId", null); set("pendingReviewByEmail", null);
                      } else if (v.startsWith("m:")) {
                        const m = reviewableStaff.find((s: any) => s.memberId && `m:${s.memberId}` === v);
                        if (m) { set("pendingReviewBy", m.name); set("pendingReviewByMemberId", m.memberId); set("pendingReviewByEmail", null); }
                      } else if (v.startsWith("u:")) {
                        const m = reviewableStaff.find((s: any) => !s.memberId && `u:${s.name}` === v);
                        if (m) { set("pendingReviewBy", m.name); set("pendingReviewByMemberId", null); set("pendingReviewByEmail", m.email); }
                      }
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select reviewer…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Not assigned</SelectItem>
                        {reviewableStaff.map((s: any) => {
                          const val = s.memberId ? `m:${s.memberId}` : `u:${s.name}`;
                          return <SelectItem key={val} value={val}>{s.name}{s.role ? ` — ${s.role}` : ""}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">No staff with an email address found. Staff members and account holders with a registered email will appear here.</div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">The selected person will receive an email notification with the assessment reference. If they are a staff member (not just an account holder), a task will also be raised on the Task Board so progress can be tracked.</p>
                </div>
              );
            })()}
            <div><Label>Valid Until</Label><Input type="date" value={form.validUntil || ""} onChange={e => set("validUntil", e.target.value)} /></div>
            <div className="col-span-2">
              <Label>Assessor Name *</Label>
              {(staffList as any[]).length > 0 ? (
                <Select value={form.assessorName || "__none__"} onValueChange={v => set("assessorName", v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select assessor…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select assessor</SelectItem>
                    {(staffList as any[]).map((s: any) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}{s.role ? ` — ${s.role}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  <strong>No staff records found.</strong> LERAP assessors must hold PA1 plus the relevant extension certificate (PA2 for boom sprayers, PA6 for hand-held). Add staff members in <a href="/staff" className="underline font-medium">Staff &amp; Training</a> before recording an assessment.
                </div>
              )}
              {(staffList as any[]).length > 0 && <p className="text-xs text-gray-400 mt-1">Only staff listed here may be selected. LERAP assessors must hold PA1 + relevant certificate (PA2, PA6 etc.). Record qualifications against each staff member to evidence compliance.</p>}
            </div>
            <div className="col-span-2"><Label>Reduction Justification</Label><Textarea rows={2} value={form.reductionJustification || ""} onChange={e => set("reductionJustification", e.target.value)} placeholder="Why buffer was reduced — equipment type, weather conditions, field characteristics…" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Record Assessment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Review Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Complete LERAP Review — LERAP-{reviewRecord?.id}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-1">
            {reviewRecord && (
              <div className="p-3 bg-gray-50 rounded-md text-sm space-y-1 border">
                <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Reference</span><span className="font-mono font-semibold">LERAP-{reviewRecord.id}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Field</span><span>{getFieldName(reviewRecord.fieldId)}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Product</span><span>{getProductName(reviewRecord.productId)}</span></div>
                {reviewRecord.pendingReviewBy && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Assigned to</span><span>{reviewRecord.pendingReviewBy}</span></div>}
              </div>
            )}
            <div>
              <Label>Confirmed Outcome *</Label>
              <Select value={reviewForm.confirmedOutcome} onValueChange={v => setReviewForm(f => ({ ...f, confirmedOutcome: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LERAP_OUTCOMES.filter(o => o.value !== "pending").map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">Confirm the LERAP outcome following your review. This replaces the Pending Review status.</p>
            </div>
            <div>
              <Label>Review Notes</Label>
              <Textarea rows={3} value={reviewForm.reviewNotes} onChange={e => setReviewForm(f => ({ ...f, reviewNotes: e.target.value }))} placeholder="What was verified, any issues found, buffer zone changes confirmed…" />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800">
              Your name and the current date/time will be stamped on this record as reviewer. The linked Task Board task will be automatically closed. This creates a permanent audit trail entry visible in the assessments register.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button
              disabled={!reviewForm.confirmedOutcome || reviewMut.isPending}
              onClick={() => { if (reviewRecord) reviewMut.mutate({ id: reviewRecord.id, body: reviewForm }); }}
            >
              {reviewMut.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</> : <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Mark as Reviewed</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Spray Beekeeper & Neighbour Notifications Log ────────────────────────────
function SprayNotificationsTab({ farmId, applications, fields }: { farmId: number; applications: any[]; fields: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);

  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [editContact, setEditContact] = useState<any>(null);
  const [deleteContactId, setDeleteContactId] = useState<number | null>(null);
  const [beeInfoOpen, setBeeInfoOpen] = useState(true);

  const emptyForm = {
    sprayApplicationId: "", notificationDate: today, plannedSprayDate: "",
    recipientType: "beekeeper", recipientName: "", recipientContact: "", recipientAddress: "",
    contactMethod: "phone", productsNotified: "", fieldRefs: "",
    confirmed: false as boolean, confirmationDate: "", confirmationMethod: "", confirmationReference: "", notes: "",
  };
  const [form, setForm] = useState({ ...emptyForm });

  const emptyContact = { recipientType: "beekeeper", recipientName: "", recipientContact: "", recipientAddress: "", notes: "" };
  const [contactForm, setContactForm] = useState({ ...emptyContact });

  const farmQ = useQuery({ queryKey: ["farm", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()), select: (d: any) => d.record });
  const farm = farmQ.data;

  const notifQ = useQuery({ queryKey: ["spray-notifications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-notifications`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.notifications ?? [] });
  const notifications: any[] = notifQ.data ?? [];

  const contactsQ = useQuery({ queryKey: ["spray-notification-contacts", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-notification-contacts`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.contacts ?? [] });
  const contacts: any[] = contactsQ.data ?? [];

  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/spray-notifications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Notification logged" }); qc.invalidateQueries({ queryKey: ["spray-notifications", farmId] }); setAddOpen(false); setForm({ ...emptyForm }); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }: any) => fetch(`/api/farms/${farmId}/spray-notifications/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Notification updated" }); qc.invalidateQueries({ queryKey: ["spray-notifications", farmId] }); setEditRec(null); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-notifications/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => { toast({ title: "Notification deleted" }); qc.invalidateQueries({ queryKey: ["spray-notifications", farmId] }); setDeleteId(null); }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });

  const createContactMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/spray-notification-contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Contact saved" }); qc.invalidateQueries({ queryKey: ["spray-notification-contacts", farmId] }); setEditContact(null); setContactForm({ ...emptyContact }); }, onError: () => toast({ title: "Failed to save contact", variant: "destructive" }) });
  const updateContactMut = useMutation({ mutationFn: ({ id, b }: any) => fetch(`/api/farms/${farmId}/spray-notification-contacts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Contact updated" }); qc.invalidateQueries({ queryKey: ["spray-notification-contacts", farmId] }); setEditContact(null); setContactForm({ ...emptyContact }); }, onError: () => toast({ title: "Failed to update contact", variant: "destructive" }) });
  const deleteContactMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-notification-contacts/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => { toast({ title: "Contact deleted" }); qc.invalidateQueries({ queryKey: ["spray-notification-contacts", farmId] }); setDeleteContactId(null); }, onError: () => toast({ title: "Failed to delete contact", variant: "destructive" }) });

  const fmtD = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("en-GB") : "—";
  const fldName = (id: any) => fields.find(f => String(f.id) === String(id))?.name || `Field #${id}`;
  const appLabel = (id: any) => { const a = applications.find(a => String(a.id) === String(id)); if (!a) return id ? `Application #${id}` : "—"; return `${a.productName || "Spray"} · ${fmtD(a.applicationDate)}${a.fieldId ? ` · ${fldName(a.fieldId)}` : ""}`; };
  const rTypeLabel: Record<string, string> = { beekeeper: "Beekeeper", neighbour: "Neighbour", other: "Other" };
  const methodLabel: Record<string, string> = { phone: "Phone call", email: "Email", letter: "Letter", in_person: "In person", text_message: "Text message" };

  function leadTimeHours(n: any): number | null {
    if (!n.plannedSprayDate || !n.notificationDate) return null;
    const a = new Date(n.notificationDate + "T00:00:00");
    const b = new Date(n.plannedSprayDate + "T00:00:00");
    return (b.getTime() - a.getTime()) / 36e5;
  }

  function LeadTimeBadge({ n }: { n: any }) {
    const hours = leadTimeHours(n);
    if (hours === null) return null;
    const days = Math.floor(Math.abs(hours) / 24);
    if (hours < 0) return <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded px-1.5 py-0.5">Spray date past</span>;
    if (hours < 48) return <span className="text-xs bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5 font-medium">⚠ {days}d notice</span>;
    return <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5">✓ {days}d notice</span>;
  }

  function openEdit(n: any) {
    setEditRec(n);
    setForm({
      sprayApplicationId: String(n.sprayApplicationId ?? ""),
      notificationDate: n.notificationDate?.slice(0, 10) ?? today,
      plannedSprayDate: n.plannedSprayDate?.slice(0, 10) ?? "",
      recipientType: n.recipientType ?? "beekeeper",
      recipientName: n.recipientName ?? "",
      recipientContact: n.recipientContact ?? "",
      recipientAddress: n.recipientAddress ?? "",
      contactMethod: n.contactMethod ?? "phone",
      productsNotified: n.productsNotified ?? "",
      fieldRefs: n.fieldRefs ?? "",
      confirmed: n.confirmed ?? false,
      confirmationDate: n.confirmationDate?.slice(0, 10) ?? "",
      confirmationMethod: n.confirmationMethod ?? "",
      confirmationReference: n.confirmationReference ?? "",
      notes: n.notes ?? "",
    });
  }

  function pickContact(c: any) {
    setForm(f => ({ ...f, recipientType: c.recipientType, recipientName: c.recipientName, recipientContact: c.recipientContact ?? "", recipientAddress: c.recipientAddress ?? "" }));
  }

  function openEditContact(c: any) {
    setEditContact(c);
    setContactForm({ recipientType: c.recipientType ?? "beekeeper", recipientName: c.recipientName ?? "", recipientContact: c.recipientContact ?? "", recipientAddress: c.recipientAddress ?? "", notes: c.notes ?? "" });
  }

  function printNotificationLetter(n: any) {
    const app = applications.find(a => String(a.id) === String(n.sprayApplicationId));
    const farmName = farm?.name || "Our Farm";
    const farmAddress = [farm?.address, farm?.postcode].filter(Boolean).join(", ");
    const farmCph = farm?.cphNumber ? `CPH No: ${farm.cphNumber}` : "";
    const farmManager = farm?.farmManager || "";
    const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const plannedDate = n.plannedSprayDate ? new Date(n.plannedSprayDate + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "[date to be confirmed]";
    const notifDateStr = fmtD(n.notificationDate);
    const productsText = n.productsNotified || (app ? (app.productName || "pesticide products") : "pesticide products");
    const fieldsText = n.fieldRefs || (app?.fieldId ? fldName(app.fieldId) : "fields at the above holding");
    const isBeekeper = n.recipientType === "beekeeper";
    const hours = leadTimeHours(n);
    const daysNotice = hours !== null ? Math.floor(hours / 24) : null;
    const recipientAddrHtml = n.recipientAddress ? String(n.recipientAddress).replace(/\n/g, "<br>") : "";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Spray Notification Letter — ${n.recipientName}</title><style>body{font-family:Georgia,"Times New Roman",serif;max-width:680px;margin:40px auto;padding:20px;color:#111;font-size:14px;line-height:1.55}h1{font-size:18px;margin:0 0 4px}.meta{color:#555;margin:2px 0}.date{margin:28px 0 24px}.recip{margin-bottom:28px}.recip strong{font-size:15px}h2{font-size:14px;text-decoration:underline;letter-spacing:.04em;margin:0 0 18px}p{margin:0 0 14px}table{width:100%;border-collapse:collapse;margin:0 0 20px;font-size:13px}td{padding:6px 12px;border:1px solid #bbb}td:first-child{font-weight:bold;background:#f8f8f8;width:36%}.gap{height:52px}.ref{font-size:11px;color:#888;margin-top:6px}@media print{body{margin:0;padding:24px}}</style></head><body><div><h1>${farmName}</h1>${farmAddress ? `<p class="meta">${farmAddress}</p>` : ""}${farmCph ? `<p class="meta">${farmCph}</p>` : ""}</div><div class="date">${dateStr}</div><div class="recip"><strong>${n.recipientName}</strong>${recipientAddrHtml ? `<br>${recipientAddrHtml}` : ""}</div><h2>ADVANCE NOTICE OF PESTICIDE APPLICATION</h2><p>Dear ${n.recipientName},</p><p>We are writing to provide you with advance notice of our intention to apply pesticide products at ${farmName}. The details of the planned application are set out below:</p><table><tr><td>Planned Application Date</td><td><strong>${plannedDate}</strong></td></tr><tr><td>Date of This Notification</td><td>${notifDateStr}</td></tr>${daysNotice !== null ? `<tr><td>Notice Period Given</td><td>${daysNotice} day${daysNotice === 1 ? "" : "s"}</td></tr>` : ""}<tr><td>Products to be Applied</td><td>${productsText}</td></tr><tr><td>Fields / Areas Affected</td><td>${fieldsText}</td></tr></table>${isBeekeper ? "<p>As a registered beekeeper, we respectfully request that you take appropriate precautions to protect your bees during and after this application. Where practicable, we would ask that hive entrances are closed or that hives are moved away from the treated area before spraying commences, and remain so for at least 24 hours after the application has finished. We are happy to discuss the timing further to minimise any potential impact on your bees.</p>" : "<p>As an adjoining landowner or occupier, we are providing this advance notice as good practice under the Voluntary Initiative Code of Practice for the responsible use of pesticides. We take our obligations to neighbouring parties seriously and aim to keep all landowners informed prior to any pesticide application.</p>"}<p>If you have any questions or concerns about this planned application, please do not hesitate to contact us before the spray date.</p><p>Yours sincerely,</p><div class="gap"></div><p>${farmManager ? `<strong>${farmManager}</strong><br>` : ""}${farmName}</p><p class="ref">Notification ref: ${farmName} — ${notifDateStr} — ${n.recipientName}</p></body></html>`;
    openPrintWindow(html);
  }

  const beekeepers = notifications.filter((n: any) => n.recipientType === "beekeeper");
  const confirmedNotifs = notifications.filter((n: any) => n.confirmed);
  const lateNotifs = notifications.filter((n: any) => { const h = leadTimeHours(n); return h !== null && h >= 0 && h < 48; });

  const formLeadH = form.notificationDate && form.plannedSprayDate
    ? (new Date(form.plannedSprayDate + "T00:00:00").getTime() - new Date(form.notificationDate + "T00:00:00").getTime()) / 36e5
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Spray Beekeeper &amp; Neighbour Notifications</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor requirement: log all pre-spray notifications to beekeepers and neighbours. Minimum 48 hours' advance notice required.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="inline-flex items-center gap-1.5 text-sm border rounded-md px-3 py-1.5 hover:bg-gray-50" onClick={() => setContactOpen(true)}>
            <History className="w-3.5 h-3.5" />Contact Book
          </button>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:opacity-90" onClick={() => { setForm({ ...emptyForm }); setAddOpen(true); }}>
            <Plus className="w-4 h-4" />Log Notification
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border rounded-lg p-3 bg-blue-50"><p className="text-xs text-blue-700 font-medium">Total Notifications</p><p className="text-2xl font-bold text-blue-800 mt-1">{notifications.length}</p></div>
        <div className="border rounded-lg p-3 bg-amber-50"><p className="text-xs text-amber-700 font-medium">Beekeeper Notices</p><p className="text-2xl font-bold text-amber-800 mt-1">{beekeepers.length}</p></div>
        <div className="border rounded-lg p-3 bg-green-50"><p className="text-xs text-green-700 font-medium">Confirmed</p><p className="text-2xl font-bold text-green-800 mt-1">{confirmedNotifs.length}</p></div>
        <div className={`border rounded-lg p-3 ${lateNotifs.length > 0 ? "bg-red-50 border-red-200" : "bg-gray-50"}`}>
          <p className={`text-xs font-medium ${lateNotifs.length > 0 ? "text-red-700" : "text-gray-600"}`}>Under 48hr Notice</p>
          <p className={`text-2xl font-bold mt-1 ${lateNotifs.length > 0 ? "text-red-800" : "text-gray-400"}`}>{lateNotifs.length}</p>
        </div>
      </div>

      {/* BeeConnected info panel */}
      {beeInfoOpen && (
        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl leading-none mt-0.5 flex-shrink-0">🐝</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-900">BeeConnected — Automatic Beekeeper Notification Service</p>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">BeeConnected is a free UK service that automatically notifies registered beekeepers within your chosen radius when you plan to spray. Beekeepers register their hive locations voluntarily and receive instant alerts — saving you time and ensuring you meet your notification obligations without needing to know who keeps bees locally.</p>
              <p className="text-xs text-amber-700 mt-1">APHA's BeeBase does not provide a public search API, but BeeConnected is the recommended alternative for England, Scotland and Wales.</p>
              <a href="https://beeconnected.org.uk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline mt-2 hover:text-amber-700">
                Visit BeeConnected.org.uk <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <button className="text-amber-500 hover:text-amber-800 flex-shrink-0 text-lg leading-none" onClick={() => setBeeInfoOpen(false)}>✕</button>
          </div>
        </div>
      )}

      {/* Notification list */}
      {notifQ.isLoading && <div className="flex justify-center py-8 text-sm text-muted-foreground gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>}
      {!notifQ.isLoading && notifications.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-500">No notifications logged yet</p>
          <p className="text-xs text-gray-400 mt-1">Log when you notify beekeepers or neighbours before applying bee-toxic products.</p>
        </div>
      )}
      <div className="space-y-2">
        {notifications.map((n: any) => {
          const isExp = expandedId === n.id;
          return (
            <div key={n.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(isExp ? null : n.id)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{n.recipientName || "Unnamed"}</span>
                    <span className="text-xs text-muted-foreground">({rTypeLabel[n.recipientType] || n.recipientType})</span>
                    {n.confirmed && <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5">✓ Confirmed</span>}
                    <LeadTimeBadge n={n} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Notified {fmtD(n.notificationDate)} · {methodLabel[n.contactMethod] || n.contactMethod || "—"}
                    {n.plannedSprayDate && ` · Spray: ${fmtD(n.plannedSprayDate)}`}
                    {n.sprayApplicationId && ` · ${appLabel(n.sprayApplicationId)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button className="p-1.5 rounded hover:bg-gray-200 text-gray-500" title="Print notification letter" onClick={e => { e.stopPropagation(); printNotificationLetter(n); }}><Printer className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded hover:bg-gray-200" onClick={e => { e.stopPropagation(); openEdit(n); }}><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button className="p-1.5 rounded hover:bg-red-100" onClick={e => { e.stopPropagation(); setDeleteId(n.id); }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {isExp && (
                <div className="border-t bg-gray-50 px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Phone / Email</p><p>{n.recipientContact || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Contact Method</p><p>{methodLabel[n.contactMethod] || n.contactMethod || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Linked Application</p><p className="text-xs">{appLabel(n.sprayApplicationId)}</p></div>
                  {n.recipientAddress && <div className="col-span-2"><p className="text-xs text-muted-foreground">Postal Address</p><p className="whitespace-pre-line text-sm">{n.recipientAddress}</p></div>}
                  {n.productsNotified && <div className="col-span-full"><p className="text-xs text-muted-foreground">Products Notified</p><p>{n.productsNotified}</p></div>}
                  {n.fieldRefs && <div><p className="text-xs text-muted-foreground">Fields / Areas</p><p>{n.fieldRefs}</p></div>}
                  <div><p className="text-xs text-muted-foreground">Confirmation</p><p>{n.confirmed ? "Received" : "Pending"}{n.confirmationDate && ` — ${fmtD(n.confirmationDate)}`}{n.confirmationMethod && ` (${n.confirmationMethod})`}</p></div>
                  {n.notes && <div className="col-span-full"><p className="text-xs text-muted-foreground">Notes</p><p className="whitespace-pre-line">{n.notes}</p></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={addOpen || !!editRec} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); setForm({ ...emptyForm }); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editRec ? "Edit Notification" : "Log Spray Notification"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-1">
            {/* Recipient */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recipient</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Recipient Type</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.recipientType} onChange={e => setForm(f => ({ ...f, recipientType: e.target.value }))}>
                    <option value="beekeeper">Beekeeper</option>
                    <option value="neighbour">Neighbour / Landowner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {contacts.length > 0 && (
                  <div>
                    <label className="text-xs font-medium">Pick from Contact Book</label>
                    <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value="" onChange={e => { const c = contacts.find((c: any) => String(c.id) === e.target.value); if (c) pickContact(c); }}>
                      <option value="">— Select saved contact —</option>
                      {contacts.map((c: any) => <option key={c.id} value={String(c.id)}>{c.recipientName} ({rTypeLabel[c.recipientType] || c.recipientType})</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Recipient Name *</label><Input value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} placeholder="e.g. John Smith" /></div>
                <div><label className="text-xs font-medium">Phone / Email</label><Input value={form.recipientContact} onChange={e => setForm(f => ({ ...f, recipientContact: e.target.value }))} placeholder="07700 900 123" /></div>
              </div>
              <div>
                <label className="text-xs font-medium">Postal Address <span className="font-normal text-muted-foreground">(used when printing notification letter)</span></label>
                <Textarea value={form.recipientAddress} onChange={e => setForm(f => ({ ...f, recipientAddress: e.target.value }))} rows={2} placeholder={"1 Lane Road\nVillage, County\nAB1 2CD"} />
              </div>
            </div>

            {/* Notification details */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notification Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Date Notified *</label><Input type="date" value={form.notificationDate} onChange={e => setForm(f => ({ ...f, notificationDate: e.target.value }))} /></div>
                <div><label className="text-xs font-medium">Planned Spray Date <span className="font-normal text-muted-foreground">(48hr check)</span></label><Input type="date" value={form.plannedSprayDate} onChange={e => setForm(f => ({ ...f, plannedSprayDate: e.target.value }))} /></div>
              </div>
              {formLeadH !== null && (
                formLeadH < 48
                  ? <p className="text-xs text-red-600 font-medium -mt-1">⚠ Only {Math.floor(formLeadH / 24)} day{Math.floor(formLeadH / 24) === 1 ? "" : "s"} notice — Red Tractor requires a minimum of 48 hours.</p>
                  : <p className="text-xs text-green-700 -mt-1">✓ {Math.floor(formLeadH / 24)} day{Math.floor(formLeadH / 24) === 1 ? "" : "s"} notice — meets the 48-hour requirement.</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">How Was Notification Made?</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.contactMethod} onChange={e => setForm(f => ({ ...f, contactMethod: e.target.value }))}>
                    <option value="phone">Phone call</option>
                    <option value="email">Email</option>
                    <option value="letter">Letter (post)</option>
                    <option value="in_person">In person</option>
                    <option value="text_message">Text message</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Linked Spray Application</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.sprayApplicationId} onChange={e => setForm(f => ({ ...f, sprayApplicationId: e.target.value }))}>
                    <option value="">— None —</option>
                    {applications.slice(0, 50).map((a: any) => <option key={a.id} value={String(a.id)}>{a.productName || "Spray"} — {fmtD(a.applicationDate)}{a.fieldId ? ` — ${fldName(a.fieldId)}` : ""}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Products Notified</label><Input value={form.productsNotified} onChange={e => setForm(f => ({ ...f, productsNotified: e.target.value }))} placeholder="e.g. Karate Zeon, Lambda-C" /></div>
                <div><label className="text-xs font-medium">Fields / Areas</label><Input value={form.fieldRefs} onChange={e => setForm(f => ({ ...f, fieldRefs: e.target.value }))} placeholder="e.g. North Field, Field 4" /></div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirmation</p>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="spn-confirmed" checked={form.confirmed} onChange={e => setForm(f => ({ ...f, confirmed: e.target.checked }))} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="spn-confirmed" className="text-sm cursor-pointer">Confirmation received from recipient</label>
              </div>
              {form.confirmed && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Confirmation Date</label><Input type="date" value={form.confirmationDate} onChange={e => setForm(f => ({ ...f, confirmationDate: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">How Confirmed</label><Input value={form.confirmationMethod} onChange={e => setForm(f => ({ ...f, confirmationMethod: e.target.value }))} placeholder="e.g. verbal, email reply" /></div>
                </div>
              )}
            </div>

            <div><label className="text-xs font-medium">Notes</label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <button className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { setAddOpen(false); setEditRec(null); setForm({ ...emptyForm }); }}>Cancel</button>
            <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50" disabled={!form.notificationDate || !form.recipientName || createMut.isPending || updateMut.isPending} onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form)}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Log Notification"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Book dialog */}
      <Dialog open={contactOpen} onOpenChange={o => { if (!o) { setContactOpen(false); setEditContact(null); setContactForm({ ...emptyContact }); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Contact Book — Beekeepers &amp; Neighbours</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2 mb-3">Save regular recipients here so you can quickly populate the notification form.</p>
          <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
            <p className="text-xs font-semibold">{editContact ? "Edit Contact" : "Add Contact"}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Type</label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={contactForm.recipientType} onChange={e => setContactForm(f => ({ ...f, recipientType: e.target.value }))}>
                  <option value="beekeeper">Beekeeper</option>
                  <option value="neighbour">Neighbour / Landowner</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div><label className="text-xs font-medium">Name *</label><Input value={contactForm.recipientName} onChange={e => setContactForm(f => ({ ...f, recipientName: e.target.value }))} placeholder="e.g. John Smith" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Phone / Email</label><Input value={contactForm.recipientContact} onChange={e => setContactForm(f => ({ ...f, recipientContact: e.target.value }))} /></div>
              <div><label className="text-xs font-medium">Notes</label><Input value={contactForm.notes} onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div>
              <label className="text-xs font-medium">Postal Address</label>
              <Textarea value={contactForm.recipientAddress} onChange={e => setContactForm(f => ({ ...f, recipientAddress: e.target.value }))} rows={2} placeholder={"1 Lane Road\nVillage, County AB1 2CD"} />
            </div>
            <div className="flex gap-2 justify-end">
              {editContact && <button className="border rounded-md px-3 py-1.5 text-sm hover:bg-gray-100" onClick={() => { setEditContact(null); setContactForm({ ...emptyContact }); }}>Cancel</button>}
              <button className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50" disabled={!contactForm.recipientName || createContactMut.isPending || updateContactMut.isPending} onClick={() => editContact ? updateContactMut.mutate({ id: editContact.id, b: contactForm }) : createContactMut.mutate(contactForm)}>
                {createContactMut.isPending || updateContactMut.isPending ? "Saving…" : editContact ? "Save Changes" : "Add Contact"}
              </button>
            </div>
          </div>
          {contactsQ.isLoading && <div className="flex justify-center py-4 gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>}
          {!contactsQ.isLoading && contacts.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No contacts saved yet.</p>}
          <div className="space-y-2 mt-2">
            {contacts.map((c: any) => (
              <div key={c.id} className="border rounded-lg px-3 py-2 flex items-start justify-between gap-3 bg-white">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.recipientName} <span className="text-xs text-muted-foreground font-normal">({rTypeLabel[c.recipientType] || c.recipientType})</span></p>
                  {c.recipientContact && <p className="text-xs text-gray-500">{c.recipientContact}</p>}
                  {c.recipientAddress && <p className="text-xs text-gray-400 whitespace-pre-line">{c.recipientAddress}</p>}
                  {c.notes && <p className="text-xs text-gray-400 italic">{c.notes}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => openEditContact(c)}><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button className="p-1.5 rounded hover:bg-red-100" onClick={() => setDeleteContactId(c.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-2">
            <button className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setContactOpen(false)}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete notification */}
      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Notification</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this notification record? This cannot be undone.</p>
          <DialogFooter>
            <button className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>{deleteMut.isPending ? "Deleting…" : "Delete"}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete contact */}
      <Dialog open={deleteContactId !== null} onOpenChange={o => { if (!o) setDeleteContactId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Contact</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Remove this contact from the book? Existing notification records are not affected.</p>
          <DialogFooter>
            <button className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDeleteContactId(null)}>Cancel</button>
            <button className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleteContactMut.isPending} onClick={() => deleteContactId !== null && deleteContactMut.mutate(deleteContactId)}>{deleteContactMut.isPending ? "Deleting…" : "Delete"}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Container Disposal Tab ───────────────────────────────────────────────────
const DISPOSAL_METHODS = [
  { value: "triple_rinsed_return", label: "Triple-rinsed & returned to supplier" },
  { value: "waste_contractor", label: "Waste contractor collection" },
  { value: "crushing", label: "On-site crushing / compaction" },
  { value: "incineration", label: "Incineration" },
  { value: "other", label: "Other" },
];

function ContainerDisposalTab({ farmId, products }: { farmId: number; products: any[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: membersData } = useFarmMembers(farmId);
  const members: any[] = membersData?.members ?? [];
  const key = [`/api/farms/${farmId}/spray-container-disposals`];
  const dataQ = useQuery({ queryKey: key, queryFn: () => fetch(`/api/farms/${farmId}/spray-container-disposals`).then(r => r.json()) });
  const records: any[] = dataQ.data?.records ?? [];

  const emptyDisposal = { disposalDate: new Date().toISOString().slice(0, 10), productId: "__none__", productName: "", containerCount: "", containerSizeL: "", disposalMethod: "__none__", wasteContractorName: "", wasteTransferRef: "", rinsedOnSite: false, operatorMemberId: "__none__", notes: "" };
  const [form, setForm] = useState<any>(emptyDisposal);
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openAdd() { setEditRec(null); setForm(emptyDisposal); setAddOpen(true); }
  function openEdit(r: any) {
    setEditRec(r);
    setForm({
      disposalDate: r.disposalDate ? String(r.disposalDate).slice(0, 10) : "",
      productId: r.productId ? String(r.productId) : "__none__",
      productName: r.productName ?? "",
      containerCount: r.containerCount ?? "",
      containerSizeL: r.containerSizeL ?? "",
      disposalMethod: r.disposalMethod ?? "__none__",
      wasteContractorName: r.wasteContractorName ?? "",
      wasteTransferRef: r.wasteTransferRef ?? "",
      rinsedOnSite: !!r.rinsedOnSite,
      operatorMemberId: r.operatorMemberId ? String(r.operatorMemberId) : "__none__",
      notes: r.notes ?? "",
    });
    setAddOpen(true);
  }

  function buildBody() {
    const { productId, disposalMethod, operatorMemberId, ...rest } = form;
    return {
      ...rest,
      productId: productId && productId !== "__none__" ? Number(productId) : null,
      disposalMethod: disposalMethod && disposalMethod !== "__none__" ? disposalMethod : null,
      operatorMemberId: operatorMemberId && operatorMemberId !== "__none__" ? Number(operatorMemberId) : null,
      containerCount: rest.containerCount ? Number(rest.containerCount) : null,
      containerSizeL: rest.containerSizeL ? rest.containerSizeL : null,
    };
  }

  const createMut = useMutation({
    mutationFn: (b: any) => fetch(`/api/farms/${farmId}/spray-container-disposals`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Disposal log saved" }); qc.invalidateQueries({ queryKey: key }); setAddOpen(false); },
    onError: () => toast({ title: "Error saving disposal log", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, b }: { id: number; b: any }) => fetch(`/api/farms/${farmId}/spray-container-disposals/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Disposal log updated" }); qc.invalidateQueries({ queryKey: key }); setAddOpen(false); },
    onError: () => toast({ title: "Error updating disposal log", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-container-disposals/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: key }); setDeleteId(null); },
    onError: () => toast({ title: "Error deleting", variant: "destructive" }),
  });

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>Container Disposal Log</h3>
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>Record disposal of used pesticide containers, as required by UK waste regulations.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Log Disposal</Button>
      </div>

      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No disposals recorded</p>
          <p style={{ fontSize: "0.8rem" }}>Log container disposals to demonstrate regulatory compliance.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Product", "Containers", "Method", "Waste Transfer Ref", "Rinsed", "Operator", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => {
                const prod = products.find((p: any) => p.id === r.productId);
                const method = DISPOSAL_METHODS.find(m => m.value === r.disposalMethod);
                return (
                  <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.75rem", whiteSpace: "nowrap" }}>{r.disposalDate ? new Date(r.disposalDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>{prod?.productName || r.productName || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>{r.containerCount ?? "—"}{r.containerSizeL ? ` × ${r.containerSizeL}L` : ""}</td>
                    <td style={{ padding: "0.625rem 0.75rem", fontSize: "0.8rem", color: "#374151" }}>{method?.label || r.disposalMethod || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", fontFamily: "monospace", fontSize: "0.78rem" }}>{r.wasteTransferRef || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>{r.rinsedOnSite ? <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.78rem" }}>Yes</span> : <span style={{ color: "#9ca3af", fontSize: "0.78rem" }}>No</span>}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }}>{r.operatorMemberId ? memberFullName(members.find((m: any) => m.id === r.operatorMemberId)) : r.operatorName || "—"}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); } }}>
        <DialogContent style={{ maxWidth: 560, maxHeight: "85vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editRec ? "Edit" : "Log"} Container Disposal</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Disposal Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" value={form.disposalDate} onChange={e => set("disposalDate", e.target.value)} />
              </div>
              <div>
                <Label>Operator</Label>
                <Select value={form.operatorMemberId} onValueChange={v => set("operatorMemberId", v)}>
                  <SelectTrigger style={{ fontSize: "0.8rem" }}><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {members.map((m: any) => <SelectItem key={m.id} value={String(m.id)}>{memberFullName(m)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Product</Label>
              <Select value={form.productId} onValueChange={v => set("productId", v)}>
                <SelectTrigger style={{ fontSize: "0.8rem" }}><SelectValue placeholder="Select product…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not listed / manual entry</SelectItem>
                  {products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.productName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(!form.productId || form.productId === "__none__") && (
              <div>
                <Label>Product Name (manual)</Label>
                <Input placeholder="Enter product name" value={form.productName} onChange={e => set("productName", e.target.value)} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Number of Containers</Label>
                <Input type="number" min="1" placeholder="e.g. 3" value={form.containerCount} onChange={e => set("containerCount", e.target.value)} />
              </div>
              <div>
                <Label>Container Size (L)</Label>
                <Input type="number" step="0.1" placeholder="e.g. 5" value={form.containerSizeL} onChange={e => set("containerSizeL", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Disposal Method</Label>
              <Select value={form.disposalMethod} onValueChange={v => set("disposalMethod", v)}>
                <SelectTrigger style={{ fontSize: "0.8rem" }}><SelectValue placeholder="Select method…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not specified</SelectItem>
                  {DISPOSAL_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.disposalMethod === "waste_contractor" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Waste Contractor Name</Label>
                  <Input placeholder="e.g. Agri-Waste Services Ltd" value={form.wasteContractorName} onChange={e => set("wasteContractorName", e.target.value)} />
                </div>
                <div>
                  <Label>Waste Transfer Note Ref</Label>
                  <Input placeholder="e.g. WTN-2026-001" value={form.wasteTransferRef} onChange={e => set("wasteTransferRef", e.target.value)} />
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="rinsedOnSite" checked={!!form.rinsedOnSite} onChange={e => set("rinsedOnSite", e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
              <label htmlFor="rinsedOnSite" style={{ fontSize: "0.85rem", cursor: "pointer" }}>Containers triple-rinsed on site before disposal</label>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Additional details…" />
            </div>
          </div>
          <DialogFooter>
            <button className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { setAddOpen(false); setEditRec(null); }}>Cancel</button>
            <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              disabled={!form.disposalDate || createMut.isPending || updateMut.isPending}
              onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: buildBody() }) : createMut.mutate(buildBody())}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Log Disposal"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Disposal Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this disposal record?</p>
          <DialogFooter>
            <button className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Spray Product Stocktakes Tab ─────────────────────────────────────────────
function SprayStocktakesTab({ farmId, products }: { farmId: number; products: any[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const todayST = () => new Date().toISOString().slice(0, 10);
  const emptyST = {
    productId: "",
    productName: "",
    systemQtyLitres: "",
    physicalQtyLitres: "",
    conductedBy: "",
    stocktakeDate: todayST(),
    notes: "",
  };
  const [stForm, setStForm] = useState(emptyST);

  const stocktakesQ = useQuery({
    queryKey: ["spray-product-stocktakes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/spray-product-stocktakes`).then(r => r.json()),
  });
  const stRecords: any[] = Array.isArray(stocktakesQ.data?.records) ? stocktakesQ.data.records : [];

  function handleSpraySTProdChange(productId: string) {
    if (productId === "__other__") {
      setStForm(f => ({ ...f, productId, productName: "", systemQtyLitres: "" }));
      return;
    }
    const p = products.find((x: any) => String(x.id) === productId);
    setStForm(f => ({
      ...f,
      productId,
      productName: p?.productName ?? "",
      systemQtyLitres: p?.currentStockQuantity !== null && p?.currentStockQuantity !== undefined ? String(p.currentStockQuantity) : "",
    }));
  }

  const saveST = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/spray-product-stocktakes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Stocktake recorded" });
      qc.invalidateQueries({ queryKey: ["spray-product-stocktakes", farmId] });
      setOpen(false);
      setStForm(emptyST);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  function handleSTSubmit() {
    if (!stForm.physicalQtyLitres || !stForm.stocktakeDate) {
      toast({ title: "Physical quantity and date are required", variant: "destructive" });
      return;
    }
    saveST.mutate({
      productId: stForm.productId && stForm.productId !== "__other__" ? Number(stForm.productId) : null,
      productName: stForm.productName || null,
      systemQtyLitres: stForm.systemQtyLitres || null,
      physicalQtyLitres: stForm.physicalQtyLitres,
      conductedBy: stForm.conductedBy || null,
      stocktakeDate: stForm.stocktakeDate,
      notes: stForm.notes || null,
    });
  }

  const fmtL = (v: string | number | null | undefined) => (v === null || v === undefined) ? "—" : `${parseFloat(String(v)).toFixed(2)} L`;

  function stVarBadge(sys: string | null | undefined, phys: string | null | undefined) {
    if (!sys || !phys) return null;
    const v = parseFloat(phys) - parseFloat(sys);
    const cls = Math.abs(v) < 0.01 ? "bg-green-100 text-green-800" : v < 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";
    return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{v >= 0 ? "+" : ""}{v.toFixed(2)} L</span>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Spray Store Stocktake</h2>
          <p className="text-sm text-gray-500 mt-0.5">Physically count bottles and containers, reconcile against application records.</p>
        </div>
        <button className="bg-green-700 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-green-800 flex items-center gap-1.5" onClick={() => setOpen(true)}>
          <Plus size={14} />Record Stocktake
        </button>
      </div>

      {stocktakesQ.isLoading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : stRecords.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="mx-auto mb-3 opacity-40" style={{ fontSize: 36 }}>📋</div>
          <p className="text-sm">No stocktakes recorded yet.</p>
          <p className="text-xs mt-1">Use the button above to record a physical bottle count.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Date</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Product</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600">System (L)</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600">Physical (L)</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600">Variance</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Conducted By</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stRecords.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 whitespace-nowrap">{r.stocktakeDate ? new Date(r.stocktakeDate + "T12:00:00").toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-3 py-2.5">{r.registeredProductName ?? r.productName ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{fmtL(r.systemQtyLitres)}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{fmtL(r.physicalQtyLitres)}</td>
                  <td className="px-3 py-2.5 text-right">{stVarBadge(r.systemQtyLitres, r.physicalQtyLitres)}</td>
                  <td className="px-3 py-2.5">{r.conductedBy ?? "—"}</td>
                  <td className="px-3 py-2.5 text-gray-500 max-w-xs truncate">{r.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setStForm(emptyST); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record Spray Store Stocktake</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Product</Label>
              <Select value={stForm.productId} onValueChange={handleSpraySTProdChange}>
                <SelectTrigger><SelectValue placeholder="Select spray product…" /></SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.productName}</SelectItem>)}
                  <SelectItem value="__other__">Other / not in register</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {stForm.productId === "__other__" && (
              <div><Label>Product Name</Label><Input value={stForm.productName} onChange={e => setStForm(f => ({ ...f, productName: e.target.value }))} placeholder="Enter product name" /></div>
            )}
            <div><Label>Stocktake Date</Label><Input type="date" value={stForm.stocktakeDate} onChange={e => setStForm(f => ({ ...f, stocktakeDate: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>System Quantity (L)</Label>
                <Input type="number" step="0.01" value={stForm.systemQtyLitres} onChange={e => setStForm(f => ({ ...f, systemQtyLitres: e.target.value }))} placeholder="From stock records" />
              </div>
              <div>
                <Label>Physical Quantity (L) *</Label>
                <Input type="number" step="0.01" value={stForm.physicalQtyLitres} onChange={e => setStForm(f => ({ ...f, physicalQtyLitres: e.target.value }))} placeholder="Counted in store" />
              </div>
            </div>
            {stForm.systemQtyLitres && stForm.physicalQtyLitres && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-gray-50 border border-gray-200">
                <span className="text-sm text-gray-600">Variance:</span>
                {stVarBadge(stForm.systemQtyLitres, stForm.physicalQtyLitres)}
                <span className="text-xs text-gray-400">(physical − system)</span>
              </div>
            )}
            <div><Label>Conducted By</Label><Input value={stForm.conductedBy} onChange={e => setStForm(f => ({ ...f, conductedBy: e.target.value }))} placeholder="Name of person" /></div>
            <div><Label>Notes</Label><Textarea value={stForm.notes} onChange={e => setStForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="e.g. partial containers measured, damaged stock noted" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setStForm(emptyST); }}>Cancel</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleSTSubmit} disabled={saveST.isPending}>
              {saveST.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}Save Stocktake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Store Inspection Tab ─────────────────────────────────────────────────────
const INSPECTION_TYPES = [
  { value: "routine", label: "Routine" },
  { value: "pre_season", label: "Pre-Season" },
  { value: "post_season", label: "Post-Season" },
  { value: "ad_hoc", label: "Ad-hoc" },
];

const CHECKLIST_FIELDS: { key: string; label: string }[] = [
  { key: "locked", label: "Store is lockable and kept locked" },
  { key: "bunded", label: "Bunded / spillage containment in place" },
  { key: "emergencyCardPosted", label: "Emergency contact card posted" },
  { key: "coshhAssessed", label: "COSHH assessment available on site" },
  { key: "signagePresent", label: "Hazard signage present" },
  { key: "ventilationAdequate", label: "Ventilation adequate" },
  { key: "separateFromSeed", label: "Stored separately from seed/feed" },
  { key: "noObviousLeaks", label: "No obvious leaks or damaged containers" },
];

function StoreInspectionTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: membersData } = useFarmMembers(farmId);
  const members: any[] = membersData?.members ?? [];
  const key = [`/api/farms/${farmId}/spray-store-inspections`];
  const dataQ = useQuery({ queryKey: key, queryFn: () => fetch(`/api/farms/${farmId}/spray-store-inspections`).then(r => r.json()) });
  const records: any[] = dataQ.data?.records ?? [];

  const emptyInspection = {
    inspectionDate: new Date().toISOString().slice(0, 10),
    inspectedById: "__none__",
    inspectedByName: "",
    inspectionType: "routine",
    storeLocation: "",
    passed: true,
    locked: true,
    bunded: false,
    emergencyCardPosted: true,
    coshhAssessed: true,
    signagePresent: true,
    ventilationAdequate: true,
    separateFromSeed: true,
    noObviousLeaks: true,
    conditionNotes: "",
    actionRequired: "",
    actionDueDate: "",
    nextInspectionDue: "",
    notes: "",
  };
  const [form, setForm] = useState<any>(emptyInspection);
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openAdd() { setEditRec(null); setForm(emptyInspection); setAddOpen(true); }
  function openEdit(r: any) {
    setEditRec(r);
    setForm({
      inspectionDate: r.inspectionDate ? String(r.inspectionDate).slice(0, 10) : "",
      inspectedById: r.inspectedById ? String(r.inspectedById) : "__none__",
      inspectedByName: r.inspectedByName ?? "",
      inspectionType: r.inspectionType ?? "routine",
      storeLocation: r.storeLocation ?? "",
      passed: r.passed !== false,
      locked: !!r.locked,
      bunded: !!r.bunded,
      emergencyCardPosted: !!r.emergencyCardPosted,
      coshhAssessed: !!r.coshhAssessed,
      signagePresent: !!r.signagePresent,
      ventilationAdequate: !!r.ventilationAdequate,
      separateFromSeed: !!r.separateFromSeed,
      noObviousLeaks: !!r.noObviousLeaks,
      conditionNotes: r.conditionNotes ?? "",
      actionRequired: r.actionRequired ?? "",
      actionDueDate: r.actionDueDate ? String(r.actionDueDate).slice(0, 10) : "",
      nextInspectionDue: r.nextInspectionDue ? String(r.nextInspectionDue).slice(0, 10) : "",
      notes: r.notes ?? "",
    });
    setAddOpen(true);
  }

  function buildBody() {
    const { inspectedById, ...rest } = form;
    const checksPassed = CHECKLIST_FIELDS.every(f => !!form[f.key]);
    return {
      ...rest,
      inspectedById: inspectedById && inspectedById !== "__none__" ? Number(inspectedById) : null,
      passed: checksPassed,
      actionDueDate: rest.actionDueDate || null,
      nextInspectionDue: rest.nextInspectionDue || null,
    };
  }

  const createMut = useMutation({
    mutationFn: (b: any) => fetch(`/api/farms/${farmId}/spray-store-inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Inspection saved" }); qc.invalidateQueries({ queryKey: key }); setAddOpen(false); },
    onError: () => toast({ title: "Error saving inspection", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, b }: { id: number; b: any }) => fetch(`/api/farms/${farmId}/spray-store-inspections/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Inspection updated" }); qc.invalidateQueries({ queryKey: key }); setAddOpen(false); },
    onError: () => toast({ title: "Error updating inspection", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-store-inspections/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: key }); setDeleteId(null); },
    onError: () => toast({ title: "Error deleting", variant: "destructive" }),
  });

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>Pesticide Store Inspections</h3>
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>Record routine and pre/post-season inspections of your pesticide store.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Log Inspection</Button>
      </div>

      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No inspections recorded</p>
          <p style={{ fontSize: "0.8rem" }}>Regular store inspections demonstrate good stewardship and are required by some assurance schemes.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Type", "Location", "Inspector", "Outcome", "Next Due", "Actions", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => {
                const itype = INSPECTION_TYPES.find(t => t.value === r.inspectionType);
                const inspector = r.inspectedById ? memberFullName(members.find((m: any) => m.id === r.inspectedById)) : r.inspectedByName;
                const nextDue = r.nextInspectionDue ? new Date(r.nextInspectionDue) : null;
                const overdue = nextDue && nextDue < new Date();
                return (
                  <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.75rem", whiteSpace: "nowrap" }}>{r.inspectionDate ? new Date(r.inspectionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}><span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.72rem", fontWeight: 600, borderRadius: 4, padding: "2px 6px" }}>{itype?.label ?? r.inspectionType}</span></td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }}>{r.storeLocation || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#374151", fontSize: "0.8rem" }}>{inspector || "—"}</td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      {r.passed === true ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#f0fdf4", color: "#15803d", fontSize: "0.72rem", fontWeight: 700, borderRadius: 4, padding: "2px 7px" }}>Pass</span>
                      ) : r.passed === false ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fef2f2", color: "#dc2626", fontSize: "0.72rem", fontWeight: 700, borderRadius: 4, padding: "2px 7px" }}>
                          <AlertTriangle size={10} /> Fail
                        </span>
                      ) : <span style={{ color: "#9ca3af", fontSize: "0.72rem" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      {nextDue ? (
                        <span style={{ fontSize: "0.78rem", color: overdue ? "#dc2626" : "#374151", fontWeight: overdue ? 700 : 400 }}>
                          {overdue ? "⚠ " : ""}{nextDue.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      ) : <span style={{ color: "#9ca3af" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.78rem", maxWidth: 200 }}>{r.actionRequired || "—"}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); } }}>
        <DialogContent style={{ maxWidth: 600, maxHeight: "88vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editRec ? "Edit" : "Log"} Store Inspection</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Inspection Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" value={form.inspectionDate} onChange={e => set("inspectionDate", e.target.value)} />
              </div>
              <div>
                <Label>Inspection Type</Label>
                <Select value={form.inspectionType} onValueChange={v => set("inspectionType", v)}>
                  <SelectTrigger style={{ fontSize: "0.8rem" }}><SelectValue /></SelectTrigger>
                  <SelectContent>{INSPECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Inspector (Farm Member)</Label>
                <Select value={form.inspectedById} onValueChange={v => set("inspectedById", v)}>
                  <SelectTrigger style={{ fontSize: "0.8rem" }}><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">External / manual entry</SelectItem>
                    {members.map((m: any) => <SelectItem key={m.id} value={String(m.id)}>{memberFullName(m)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Inspector Name (if external)</Label>
                <Input placeholder="Name of external inspector" value={form.inspectedByName} onChange={e => set("inspectedByName", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Store Location / Description</Label>
              <Input placeholder="e.g. Locked chemical store, north side of grain store" value={form.storeLocation} onChange={e => set("storeLocation", e.target.value)} />
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem" }}>
              <Label style={{ marginBottom: "0.5rem", display: "block", fontWeight: 700 }}>Compliance Checklist</Label>
              <div className="space-y-2">
                {CHECKLIST_FIELDS.map(f => (
                  <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" id={`chk_${f.key}`} checked={!!form[f.key]} onChange={e => set(f.key, e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#16a34a" }} />
                    <label htmlFor={`chk_${f.key}`} style={{ fontSize: "0.83rem", cursor: "pointer" }}>{f.label}</label>
                  </div>
                ))}
              </div>
              {!CHECKLIST_FIELDS.every(f => !!form[f.key]) && (
                <div style={{ marginTop: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#991b1b" }}>
                  One or more checklist items not met — this inspection will be recorded as a <strong>Fail</strong>.
                </div>
              )}
            </div>

            <div>
              <Label>Condition Notes</Label>
              <Textarea value={form.conditionNotes} onChange={e => set("conditionNotes", e.target.value)} rows={2} placeholder="Describe general condition of the store…" />
            </div>
            <div>
              <Label>Actions Required</Label>
              <Textarea value={form.actionRequired} onChange={e => set("actionRequired", e.target.value)} rows={2} placeholder="List any corrective actions needed…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Action Due Date</Label>
                <Input type="date" value={form.actionDueDate} onChange={e => set("actionDueDate", e.target.value)} />
              </div>
              <div>
                <Label>Next Inspection Due</Label>
                <Input type="date" value={form.nextInspectionDue} onChange={e => set("nextInspectionDue", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Additional Notes</Label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Any other relevant notes…" />
            </div>
          </div>
          <DialogFooter>
            <button className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { setAddOpen(false); setEditRec(null); }}>Cancel</button>
            <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              disabled={!form.inspectionDate || createMut.isPending || updateMut.isPending}
              onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: buildBody() }) : createMut.mutate(buildBody())}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Log Inspection"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Inspection Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this inspection record?</p>
          <DialogFooter>
            <button className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
