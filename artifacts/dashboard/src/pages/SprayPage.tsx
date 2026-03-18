import React, { useState } from "react";
import { printHtml } from "@/lib/utils";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { useListFarms } from "@workspace/api-client-react/src/generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Droplets, FlaskConical, Printer, Wind, Thermometer, ChevronDown, ChevronRight } from "lucide-react";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const RATE_UNITS = ["L/ha", "kg/ha", "g/ha", "mL/ha", "kg/1000L", "L/1000L"];
const WIND_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const PRODUCT_CATEGORIES = ["Herbicide", "Fungicide", "Insecticide", "Molluscicide", "Growth Regulator", "Foliar Feed", "Adjuvant", "Other"];


export default function SprayPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"applications" | "dayview" | "products" | "print">("applications");

  const applicationsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const productsQ = useQuery({ queryKey: ["spray-products", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()), enabled: !!farmId, select: d => d.records ?? [] });
  const { data: farmsData } = useListFarms();

  const applications: any[] = applicationsQ.data ?? [];
  const products: any[] = productsQ.data ?? [];
  const fields: any[] = fieldsQ.data ?? [];
  const currentFarm = farmsData?.farms?.find((f: any) => f.id === farmId);

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
        </TabBar>
        {tab === "applications" && <ApplicationsTab applications={applications} products={products} fields={fields} farmId={farmId} loading={applicationsQ.isLoading} onRefresh={() => qc.invalidateQueries({ queryKey: ["spray-applications", farmId] })} toast={toast} />}
        {tab === "dayview" && <SprayDayViewTab applications={applications} loading={applicationsQ.isLoading} />}
        {tab === "products" && <ProductsTab products={products} farmId={farmId} loading={productsQ.isLoading} onRefresh={() => qc.invalidateQueries({ queryKey: ["spray-products", farmId] })} toast={toast} />}
        {tab === "print" && <PrintTab applications={applications} farm={currentFarm} />}
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

function ApplicationsTab({ applications, products, fields, farmId, loading, onRefresh, toast }: any) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const emptyForm = { fieldId: "", productId: "", applicationDate: "", applicationRate: "", rateUnit: "L/ha", areaSprayedHa: "", waterVolumeLitres: "", windSpeedKmh: "", windDirection: "", temperatureC: "", operatorName: "", certificateNumber: "", equipmentUsed: "", reasonForApplication: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/spray-applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Application recorded" }); onRefresh(); setAddOpen(false); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-applications/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Record deleted" }); onRefresh(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const filtered = applications.filter((r: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.fieldName?.toLowerCase().includes(s) || r.productName?.toLowerCase().includes(s) || r.operatorName?.toLowerCase().includes(s) || r.reasonForApplication?.toLowerCase().includes(s);
  });

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus size={14} className="mr-1" />Log Application</Button>
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
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr style={{ background: "#fafafa" }}>
                      <td colSpan={10} style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #f3f4f6" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, fontSize: "0.8rem" }}>
                          {[
                            ["Water Volume", r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : null],
                            ["Equipment Used", r.equipmentUsed],
                            ["PA1/PA6 Certificate", r.certificateNumber],
                            ["Wind Speed", r.windSpeedKmh ? `${r.windSpeedKmh} km/h` : null],
                            ["Wind Direction", r.windDirection],
                            ["Temperature", r.temperatureC ? `${r.temperatureC}°C` : null],
                            ["Notes", r.notes],
                          ].map(([k, v]) => v ? (
                            <div key={k}><span style={{ color: "#9ca3af", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>{k}</span><span style={{ color: "#374151", fontWeight: 500 }}>{v}</span></div>
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

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) setForm(emptyForm); }}>
        <DialogContent style={{ maxWidth: 600 }}>
          <DialogHeader><DialogTitle>Log Spray Application</DialogTitle></DialogHeader>
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
                <Input type="date" value={form.applicationDate} onChange={e => setForm((f: any) => ({ ...f, applicationDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Product <span style={{ color: "#ef4444" }}>*</span></Label>
              <Select value={form.productId} onValueChange={v => setForm((f: any) => ({ ...f, productId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                <SelectContent>{products.length === 0 ? <SelectItem value="__none__" disabled>Add products in the Product Register tab first</SelectItem> : products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.productName}{p.activeIngredient ? ` (${p.activeIngredient})` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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
                <Input placeholder="e.g. Trailed sprayer, 24m boom" value={form.equipmentUsed} onChange={e => setForm((f: any) => ({ ...f, equipmentUsed: e.target.value }))} />
              </div>
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
                <Input placeholder="Full name" value={form.operatorName} onChange={e => setForm((f: any) => ({ ...f, operatorName: e.target.value }))} />
              </div>
              <div>
                <Label>Certificate No. (PA1/PA6)</Label>
                <Input placeholder="e.g. PA1-123456" value={form.certificateNumber} onChange={e => setForm((f: any) => ({ ...f, certificateNumber: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Reason for Application <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input placeholder="e.g. Control of blackgrass, crop threshold exceeded" value={form.reasonForApplication} onChange={e => setForm((f: any) => ({ ...f, reasonForApplication: e.target.value }))} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Buffer zones, conditions, observations..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.fieldId || !form.applicationDate || !form.productId || !form.operatorName || !form.reasonForApplication || createMut.isPending}>Save Record</Button>
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
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { productName: "", activeIngredient: "", mappaNumber: "", manufacturer: "", category: "", harvestInterval: "", maxApplicationsPerSeason: "", storageRequirements: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/spray-products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Product added" }); onRefresh(); setAddOpen(false); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to add product", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/spray-products/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Product deleted" }); onRefresh(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Product</Button>
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
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.75rem", fontWeight: 600, color: "#1e40af" }}>{p.productName}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#374151" }}>{p.activeIngredient || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{p.mappaNumber ? <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem", fontFamily: "monospace" }}>{p.mappaNumber}</Badge> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                  <td style={{ padding: "0.625rem 0.75rem" }}>{p.category ? <CategoryBadge cat={p.category} /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.manufacturer || "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.harvestInterval ? `${p.harvestInterval} days` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{p.maxApplicationsPerSeason || "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <button onClick={() => setDeleteId(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) setForm(emptyForm); }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Add Spray Product</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Product Name <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="e.g. Roundup ProActive" value={form.productName} onChange={e => setForm((f: any) => ({ ...f, productName: e.target.value }))} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                <Input placeholder="e.g. 15026" value={form.mappaNumber} onChange={e => setForm((f: any) => ({ ...f, mappaNumber: e.target.value }))} />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.productName || createMut.isPending}>Add Product</Button>
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
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const handlePrint = () => {
    const rows = applications.map((r: any) => `
      <tr>
        <td>${fmt(r.applicationDate)}</td><td>${r.fieldName || "—"}</td><td>${r.productName || "—"}</td>
        <td>${r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}` : "—"}</td>
        <td>${r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—"}</td>
        <td>${r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : "—"}</td>
        <td>${r.windSpeedKmh ? `${r.windSpeedKmh} km/h ${r.windDirection || ""}` : "—"}</td>
        <td>${r.temperatureC ? `${r.temperatureC}°C` : "—"}</td>
        <td>${r.operatorName || "—"}</td><td>${r.certificateNumber || "—"}</td>
        <td>${r.reasonForApplication || "—"}</td>
      </tr>`).join("");
    const farmLine = farm ? `<p style="font-size:10px;color:#374151;margin:2px 0"><strong>${farm.name || ""}${farm.cphNumber ? ` · CPH: ${farm.cphNumber}` : ""}${farm.redTractorId ? ` · Red Tractor ID: ${farm.redTractorId}` : ""}</strong></p>` : "";
    printHtml(`<html><head><title>Spray Records</title><style>body{font-family:Arial,sans-serif;font-size:11px;margin:2cm}h1{font-size:15px;border-bottom:2px solid #333;padding-bottom:6px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#f3f4f6;padding:5px 6px;text-align:left;font-size:10px;border:1px solid #d1d5db}td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top}tr:nth-child(even){background:#f9fafb}.footer{margin-top:24px;font-size:9px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px;display:flex;justify-content:space-between}</style></head><body><h1>Spray Application Records — Red Tractor Compliance</h1>${farmLine}<p style="font-size:10px;color:#6b7280;margin:2px 0">Printed: ${today}</p><table><thead><tr><th>Date</th><th>Field</th><th>Product</th><th>Rate</th><th>Area</th><th>Water Vol.</th><th>Wind</th><th>Temp</th><th>Operator</th><th>Certificate</th><th>Reason</th></tr></thead><tbody>${rows}</tbody></table><div class="footer"><span>Retain for a minimum of 3 years and make available at Red Tractor audit.</span><span>Powered by BDE Farm Trac · ${today}</span></div></body></html>`);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Button size="sm" onClick={handlePrint}><Printer size={14} className="mr-1" />Print / Export PDF</Button>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, borderBottom: "2px solid #333", paddingBottom: 8, marginBottom: 8 }}>Spray Application Records — Red Tractor Compliance</h2>
        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "1.5rem" }}>Printed: {today} | BDE Farm Trac</p>
        {applications.length === 0 ? <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>No spray applications on record.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {["Date", "Field", "Product", "Rate", "Area", "Water Vol.", "Wind", "Temp", "Operator", "Certificate No.", "Reason"].map(h => (
                    <th key={h} style={{ padding: "5px 6px", textAlign: "left", fontSize: "0.7rem", border: "1px solid #d1d5db" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((r: any, i: number) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{fmt(r.applicationDate)}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb" }}>{r.fieldName || "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb" }}>{r.productName || "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}` : "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb" }}>{r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb" }}>{r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{r.windSpeedKmh ? `${r.windSpeedKmh} km/h ${r.windDirection || ""}` : "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb" }}>{r.temperatureC ? `${r.temperatureC}°C` : "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb" }}>{r.operatorName || "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb" }}>{r.certificateNumber || "—"}</td>
                    <td style={{ padding: "4px 6px", border: "1px solid #e5e7eb" }}>{r.reasonForApplication || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
