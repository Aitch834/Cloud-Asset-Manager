import React, { useState, useRef } from "react";
import { useLookupStrings } from "@/hooks/use-lookup";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
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
import { Plus, Search, Trash2, Droplets, FlaskConical, Wind, Thermometer, ChevronDown, ChevronRight, Printer, Pencil, ShieldAlert, Link2, ExternalLink, Loader2, MapPin, Truck } from "lucide-react";
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
          <span className="text-gray-500">Qty used</span>
          <span className="font-medium text-blue-700">
            {d.totalQty % 1 === 0 ? d.totalQty : d.totalQty.toFixed(2)}{" "}
            {d.rateUnit ?? ""}
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

function SprayAnalyticsTab({ applications, products, fields }: { applications: any[]; products: any[]; fields: any[] }) {
  const [cropYear, setCropYear] = useState<number>(currentCropYear());

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
      return {
        ...p,
        totalHa: parseFloat(p.totalHa.toFixed(2)),
        totalQty: qty,
        totalQtyLabel: qtyLabel,
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


export default function SprayPage() {
  const { farmId } = useAppStore();
  const productCategories = useLookupStrings("spray_product_categories", PRODUCT_CATEGORIES_FALLBACK);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"applications" | "dayview" | "products" | "print" | "analytics">("applications");

  const applicationsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const productsQ = useQuery({ queryKey: ["spray-products", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const farmQ = useQuery({ queryKey: ["farm-detail", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()), enabled: !!farmId });
  const applications: any[] = applicationsQ.data ?? [];
  const products: any[] = productsQ.data ?? [];
  const fields: any[] = fieldsQ.data ?? [];
  const currentFarm = farmQ.data?.record ?? null;
  const initialFieldSearch = new URLSearchParams(window.location.search).get("field") ?? "";

  return (
    <AppLayout title="Spray Records">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">Field spray application records, product register, and printable assessor log — required for Red Tractor Crop Inputs compliance.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }}>
          <StatCard icon={<Droplets size={18} color="#0369a1" />} label="Applications" value={applications.length} bg="#f0f9ff" iconBg="#e0f2fe" />
          <StatCard icon={<FlaskConical size={18} color="#7c3aed" />} label="Products Registered" value={products.length} bg="#f5f3ff" iconBg="#ede9fe" />
          <StatCard icon={<Droplets size={18} color="#166534" />} label="Fields Treated" value={new Set(applications.map((a: any) => a.fieldId)).size} bg="#f0fdf4" iconBg="#dcfce7" />
        </div>
        <TabBar className="mb-5">
          <TabButton active={tab === "applications"} onClick={() => setTab("applications")}>Applications Log</TabButton>
          <TabButton active={tab === "dayview"} onClick={() => setTab("dayview")}>Day View</TabButton>
          <TabButton active={tab === "products"} onClick={() => setTab("products")}>Product Register</TabButton>
          <TabButton active={tab === "print"} onClick={() => setTab("print")}>Print / Export</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>Analytics</TabButton>
        </TabBar>
        {tab === "applications" && <ApplicationsTab applications={applications} products={products} fields={fields} farmId={farmId} loading={applicationsQ.isLoading} onRefresh={() => qc.invalidateQueries({ queryKey: ["spray-applications", farmId] })} toast={toast} initialSearch={initialFieldSearch} />}
        {tab === "dayview" && <SprayDayViewTab applications={applications} loading={applicationsQ.isLoading} />}
        {tab === "products" && <ProductsTab products={products} farmId={farmId} loading={productsQ.isLoading} onRefresh={() => qc.invalidateQueries({ queryKey: ["spray-products", farmId] })} toast={toast} />}
        {tab === "print" && <PrintTab applications={applications} farm={currentFarm} />}
        {tab === "analytics" && <SprayAnalyticsTab applications={applications} products={products} fields={fields} />}
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

function ApplicationsTab({ applications, products, fields, farmId, loading, onRefresh, toast, initialSearch }: any) {
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

  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const emptyForm = { fieldId: "", productId: "", applicationDate: new Date().toISOString().slice(0, 10), applicationRate: "", rateUnit: "L/ha", areaSprayedHa: "", waterVolumeLitres: "", windSpeedKmh: "", windDirection: "", temperatureC: "", operatorName: "", operatorMemberId: "", certificateNumber: "", equipmentUsed: "", equipmentId: "", supplierId: "", reasonForApplication: "", batchNumber: "", lotNumber: "", stockDeliveryId: "", bufferZoneMetres: "", waterSourceNearby: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);
  const [weatherAutoFilled, setWeatherAutoFilled] = useState(false);
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
    });
  }
  function closeForm() { setAddOpen(false); setEditRecord(null); setForm(emptyForm); setDeliveryStockItemId(null); setWeatherAutoFilled(false); setVehicleStationFilled(null); setWeatherFetchMsg(null); setWeatherFetching(false); }

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
    if (member.linkedUserId) {
      const paTypes = ["PA1", "PA2", "PA6", "PA4", "PA3"];
      const now = new Date();
      for (const paType of paTypes) {
        const cert = allCerts.find((c: any) =>
          c.userId === member.linkedUserId &&
          (c.certificateType ?? "").toUpperCase().includes(paType) &&
          (!c.expiryDate || new Date(c.expiryDate) > now)
        );
        if (cert) { certNumber = cert.certificateNumber ?? ""; break; }
      }
      if (!certNumber) {
        const anyCert = allCerts.find((c: any) =>
          c.userId === member.linkedUserId &&
          (!c.expiryDate || new Date(c.expiryDate) > now)
        );
        if (anyCert) certNumber = anyCert.certificateNumber ?? "";
      }
    }
    setForm((f: any) => ({ ...f, operatorMemberId: memberId, operatorName: fullName, certificateNumber: certNumber }));
  };

  const handleDeliveryChange = (v: string) => {
    if (v === "__none__") {
      setForm((f: any) => ({ ...f, stockDeliveryId: "", batchNumber: "", lotNumber: "", supplierId: "" }));
    } else {
      const del = (deliveriesQ.data ?? []).find((d: any) => String(d.id) === v);
      setForm((f: any) => ({
        ...f,
        stockDeliveryId: v,
        batchNumber: del?.batchNumber || f.batchNumber,
        lotNumber: del?.lotNumber || f.lotNumber,
        supplierId: del?.supplierId ? String(del.supplierId) : f.supplierId,
      }));
    }
  };

  async function fetchWeatherForDate(date: string) {
    if (!date || !farmId) return;
    try {
      const data = await fetch(`/api/farms/${farmId}/weather-readings`).then(r => r.json());
      const readings: any[] = data.records ?? [];
      if (readings.length === 0) return;
      const target = new Date(date).getTime();
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
          windSpeedKmh: closest.windSpeedKmh != null ? String(closest.windSpeedKmh) : f.windSpeedKmh,
          windDirection: closest.windDirection || f.windDirection,
          temperatureC: closest.temperatureC != null ? String(closest.temperatureC) : f.temperatureC,
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
    stockDeliveryId: body.stockDeliveryId ? Number(body.stockDeliveryId) : null,
    equipmentId: body.equipmentId ? Number(body.equipmentId) : null,
    supplierId: body.supplierId ? Number(body.supplierId) : null,
    operatorMemberId: body.operatorMemberId ? Number(body.operatorMemberId) : null,
    batchNumber: body.batchNumber || null,
    lotNumber: body.lotNumber || null,
  });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/spray-applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload(body)) }),
    onSuccess: () => { toast({ title: "Application recorded" }); onRefresh(); closeForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      fetch(`/api/farms/${farmId}/spray-applications/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload(body)) }),
    onSuccess: () => { toast({ title: "Application updated" }); onRefresh(); closeForm(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-applications/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Record deleted" }); onRefresh(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const filtered = applications.filter((r: any) => {
    if (!isInCropYear(r.applicationDate, cropYear)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return r.fieldName?.toLowerCase().includes(s) || r.productName?.toLowerCase().includes(s) || r.operatorName?.toLowerCase().includes(s) || r.reasonForApplication?.toLowerCase().includes(s);
  });

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} />
        <Button size="sm" onClick={() => { setForm(emptyForm); setDeliveryStockItemId(null); setAddOpen(true); }}><Plus size={14} className="mr-1" />Log Application</Button>
      </div>

      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <EmptyState icon={<Droplets size={28} color="#9ca3af" />} title="No spray applications recorded" subtitle="Log each field application to build your Red Tractor crop inputs record." />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["", "Date", "Field", "Product", "Rate", "Area (ha)", "Operator", "Reason", "Weather", ""].map((h, i) => (
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
                <Select value={form.fieldId} onValueChange={v => setForm((f: any) => ({ ...f, fieldId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select field..." /></SelectTrigger>
                  <SelectContent>{fields.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Application Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" value={form.applicationDate} onChange={e => { const d = e.target.value; setWeatherAutoFilled(false); setVehicleStationFilled(null); setForm((f: any) => ({ ...f, applicationDate: d })); fetchWeatherForDate(d); checkVehicleWeather(form.equipmentId, d); }} />
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
                <Input type="number" step="0.01" placeholder="0.00" value={form.areaSprayedHa} onChange={e => setForm((f: any) => ({ ...f, areaSprayedHa: e.target.value }))} />
              </div>
            </div>
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
                    {form.operatorMemberId && (
                      <Input className="mt-1" style={{ fontSize: "0.8rem" }} value={form.operatorName} onChange={e => setForm((f: any) => ({ ...f, operatorName: e.target.value }))} />
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
                <Input placeholder="e.g. Control of blackgrass, crop threshold exceeded" value={form.reasonForApplication} onChange={e => setForm((f: any) => ({ ...f, reasonForApplication: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Buffer Zone Distance (m)</Label>
                <Input type="number" step="0.5" placeholder="e.g. 5, 10, 20" value={form.bufferZoneMetres ?? ""} onChange={e => setForm((f: any) => ({ ...f, bufferZoneMetres: e.target.value }))} />
                {form.bufferZoneMetres && (
                  <p style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }}>&#10003; Buffer zone of {form.bufferZoneMetres}m recorded</p>
                )}
              </div>
              <div>
                <Label>Water Source Nearby</Label>
                <Select value={form.waterSourceNearby ?? ""} onValueChange={v => setForm((f: any) => ({ ...f, waterSourceNearby: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None / Not applicable</SelectItem>
                    <SelectItem value="ditch">Ditch / Drain</SelectItem>
                    <SelectItem value="stream">Stream / River</SelectItem>
                    <SelectItem value="pond">Pond / Lake</SelectItem>
                    <SelectItem value="borehole">Borehole / Well</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Conditions, observations, non-standard buffer justification..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          {editRecord && farmId && (
            <RecordAttachments farmId={farmId} recordType="spray_application" recordId={editRecord.id} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
            <Button
              onClick={() => editRecord ? updateMut.mutate({ id: editRecord.id, body: form }) : createMut.mutate(form)}
              disabled={!form.fieldId || !form.applicationDate || !form.productId || !form.operatorName || !form.reasonForApplication || createMut.isPending || updateMut.isPending}
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
  const emptyForm = { productName: "", activeIngredient: "", mappaNumber: "", manufacturer: "", category: "", harvestInterval: "", maxApplicationsPerSeason: "", storageRequirements: "", coshhRecordId: "__none__" };
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
    });
    setDialogOpen(true);
  }
  const [mappaError, setMappaError] = useState<string | null>(null);
  function closeDialog() { setDialogOpen(false); setEditRecord(null); setForm(emptyForm); setMappaError(null); }
  function formBody() {
    const { coshhRecordId, mappaNumber, ...rest } = form;
    const paddedMappa = mappaNumber && /^\d{1,5}$/.test(mappaNumber)
      ? mappaNumber.padStart(5, "0")
      : mappaNumber;
    return { ...rest, mappaNumber: paddedMappa || null, coshhRecordId: coshhRecordId && coshhRecordId !== "__none__" ? Number(coshhRecordId) : null };
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
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/spray-products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Product added" }); onRefresh(); closeDialog(); },
    onError: () => toast({ title: "Failed to add product", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/spray-products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Product updated" }); onRefresh(); closeDialog(); setViewRecord(null); },
    onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-products/${id}`, { method: "DELETE" }),
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
                {["Product Name", "Active Ingredient", "MAPP No.", "Category", "Manufacturer", "Harvest Interval", "Max Apps/Season", ""].map((h, i) => (
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
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.manufacturer || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.harvestInterval ? `${p.harvestInterval} days` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.maxApplicationsPerSeason || "—"}</td>
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
              <Label>Storage Requirements</Label>
              <Textarea placeholder="e.g. Store in original container, locked chemical store, above 5°C" value={form.storageRequirements} onChange={e => setForm((f: any) => ({ ...f, storageRequirements: e.target.value }))} rows={2} />
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

function PrintTab({ applications, farm }: any) {
  const [cropYear, setCropYear] = useState(currentCropYear());
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

  const COLS = ["Date", "Field", "Product", "Rate", "Area", "Water Vol.", "Wind / Temp", "Operator", "PA Cert No.", "Reason / Notes"];

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
