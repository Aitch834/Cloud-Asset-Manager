import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Leaf,
  Award,
  MapPin,
  Truck,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  Info,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Tab = "overview" | "certification" | "fields" | "deliveries";

interface Certification {
  id: number;
  scheme: string;
  certificationNumber?: string;
  issuingBody?: string;
  issueDate?: string;
  expiryDate?: string;
  status: string;
  scope?: string;
  rtfoOperatorNumber?: string;
  notes?: string;
}

interface FieldDeclaration {
  id: number;
  fieldName: string;
  landUseIn2008: string;
  convertedAfter2008: boolean;
  conversionFrom?: string;
  highCarbonStockRisk: boolean;
  highBiodiversityRisk: boolean;
  eligibilityStatus: string;
  declarationDate?: string;
  declaredBy?: string;
  notes?: string;
}

interface Delivery {
  id: number;
  deliveryDate: string;
  buyerName: string;
  buyerRtfoRef?: string;
  cropType: string;
  quantityTonnes?: string;
  certificationRef?: string;
  sustainabilityScheme?: string;
  ghgSavingPercent?: string;
  notes?: string;
}

interface GhgSummary {
  nvzApplicationCount: number;
  totalNitrogenKgHa: string;
  sprayApplicationCount: number;
  harvestRecordCount: number;
  totalHarvestTonnes: string;
  biofuelDeliveryCount: number;
  totalBiofuelTonnes: string;
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function certStatusBadge(cert: Certification) {
  const days = daysUntil(cert.expiryDate);
  if (cert.status !== "active") return <Badge variant="destructive">Inactive</Badge>;
  if (days === null) return <Badge className="bg-gray-100 text-gray-600">No Expiry Set</Badge>;
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days <= 60) return <Badge className="bg-orange-100 text-orange-700">Expires in {days}d</Badge>;
  return <Badge className="bg-green-100 text-green-700">Active — {days}d left</Badge>;
}

function eligibilityBadge(status: string) {
  if (status === "eligible") return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Eligible</Badge>;
  if (status === "not-eligible") return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Not Eligible</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Requires Verification</Badge>;
}

export default function BiofuelPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [certDialog, setCertDialog] = useState(false);
  const [fieldDialog, setFieldDialog] = useState(false);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editingField, setEditingField] = useState<FieldDeclaration | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);

  const certsQ = useQuery<{ records: Certification[] }>({
    queryKey: ["biofuel-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/certification`).then(r => r.json()),
    enabled: !!farmId,
  });

  const fieldsQ = useQuery<{ records: FieldDeclaration[] }>({
    queryKey: ["biofuel-fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/field-declarations`).then(r => r.json()),
    enabled: !!farmId,
  });

  const deliveriesQ = useQuery<{ records: Delivery[] }>({
    queryKey: ["biofuel-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/deliveries`).then(r => r.json()),
    enabled: !!farmId,
  });

  const ghgQ = useQuery<GhgSummary>({
    queryKey: ["biofuel-ghg", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/ghg-summary`).then(r => r.json()),
    enabled: !!farmId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["biofuel-certs", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-fields", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-ghg", farmId] });
  };

  const certMut = useMutation({
    mutationFn: (data: Partial<Certification>) => {
      const url = editingCert
        ? `/api/farms/${farmId}/biofuel/certification/${editingCert.id}`
        : `/api/farms/${farmId}/biofuel/certification`;
      return fetch(url, { method: editingCert ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
    onSuccess: () => { invalidate(); setCertDialog(false); setEditingCert(null); toast({ title: "Certification saved" }); },
    onError: () => toast({ title: "Error saving certification", variant: "destructive" }),
  });

  const deleteCertMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/biofuel/certification/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); toast({ title: "Certification deleted" }); },
  });

  const fieldMut = useMutation({
    mutationFn: (data: Partial<FieldDeclaration>) => {
      const url = editingField
        ? `/api/farms/${farmId}/biofuel/field-declarations/${editingField.id}`
        : `/api/farms/${farmId}/biofuel/field-declarations`;
      return fetch(url, { method: editingField ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
    onSuccess: () => { invalidate(); setFieldDialog(false); setEditingField(null); toast({ title: "Field declaration saved" }); },
    onError: () => toast({ title: "Error saving field declaration", variant: "destructive" }),
  });

  const deleteFieldMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/biofuel/field-declarations/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); toast({ title: "Declaration deleted" }); },
  });

  const deliveryMut = useMutation({
    mutationFn: (data: Partial<Delivery>) => {
      const url = editingDelivery
        ? `/api/farms/${farmId}/biofuel/deliveries/${editingDelivery.id}`
        : `/api/farms/${farmId}/biofuel/deliveries`;
      return fetch(url, { method: editingDelivery ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
    onSuccess: () => { invalidate(); setDeliveryDialog(false); setEditingDelivery(null); toast({ title: "Delivery record saved" }); },
    onError: () => toast({ title: "Error saving delivery", variant: "destructive" }),
  });

  const deleteDeliveryMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/biofuel/deliveries/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); toast({ title: "Delivery deleted" }); },
  });

  const certs = certsQ.data?.records ?? [];
  const fields = fieldsQ.data?.records ?? [];
  const deliveries = deliveriesQ.data?.records ?? [];
  const ghg = ghgQ.data;

  const activeCert = certs.find(c => c.status === "active");
  const eligibleFields = fields.filter(f => f.eligibilityStatus === "eligible").length;
  const ineligibleFields = fields.filter(f => f.eligibilityStatus === "not-eligible").length;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "certification", label: "Certification", icon: Award },
    { id: "fields", label: "Field Declarations", icon: MapPin },
    { id: "deliveries", label: "Delivery Records", icon: Truck },
  ];

  if (!farmId) {
    return (
      <AppLayout title="Biofuel / RTFO">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "#6b7280" }}>
          <Leaf size={40} style={{ opacity: 0.4 }} />
          <p style={{ fontWeight: 600 }}>No farm selected</p>
          <p style={{ fontSize: 14 }}>Select a farm to view biofuel compliance records.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Biofuel / RTFO Compliance">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 0 40px" }}>
        <div style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 100%)", borderRadius: 16, padding: "24px 32px", marginBottom: 24, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Leaf size={28} />
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Biofuel &amp; RTFO Sustainability</h1>
          </div>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 14, maxWidth: 640 }}>
            Manage your Renewable Transport Fuel Obligation (RTFO) compliance — certification, field land eligibility declarations, GHG traceability, and consignment delivery records.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #e5e7eb", paddingBottom: 0 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                background: "none", border: "none",
                borderBottom: activeTab === t.id ? "2px solid #16a34a" : "2px solid transparent",
                cursor: "pointer", fontWeight: activeTab === t.id ? 600 : 400,
                color: activeTab === t.id ? "#16a34a" : "#6b7280", fontSize: 14,
              }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Active Certification", value: activeCert ? activeCert.scheme : "None", sub: activeCert ? certStatusBadge(activeCert) : <Badge className="bg-red-100 text-red-700">Not Certified</Badge>, icon: Award, color: "#16a34a" },
                { label: "Eligible Fields", value: eligibleFields, sub: `of ${fields.length} declared`, icon: MapPin, color: "#2563eb" },
                { label: "Biofuel Deliveries", value: deliveries.length, sub: `${ghg?.totalBiofuelTonnes ?? "0"} tonnes total`, icon: Truck, color: "#d97706" },
                { label: "Harvest Records", value: ghg?.harvestRecordCount ?? 0, sub: `${ghg?.totalHarvestTonnes ?? "0"} tonnes`, icon: BarChart3, color: "#7c3aed" },
              ].map((card, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ background: card.color + "18", borderRadius: 8, padding: 8 }}>
                      <card.icon size={18} style={{ color: card.color }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{card.value}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{card.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontWeight: 600, fontSize: 15 }}>RTFO Compliance Checklist</h3>
              {[
                { label: "Certification scheme registered (ISCC / equivalent)", ok: certs.length > 0 },
                { label: "Active certification with valid expiry date", ok: !!activeCert && (daysUntil(activeCert.expiryDate) ?? 1) > 0 },
                { label: "Field land eligibility declarations completed", ok: fields.length > 0 },
                { label: "No high-carbon-stock or high-biodiversity risk fields flagged", ok: fields.every(f => !f.highCarbonStockRisk && !f.highBiodiversityRisk) },
                { label: "Biofuel delivery records with sustainability declarations", ok: deliveries.length > 0 },
                { label: "Harvest records linked for GHG traceability", ok: (ghg?.harvestRecordCount ?? 0) > 0 },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 5 ? "1px solid #f3f4f6" : "none" }}>
                  {item.ok
                    ? <CheckCircle2 size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
                    : <XCircle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />
                  }
                  <span style={{ fontSize: 14, color: item.ok ? "#111827" : "#dc2626" }}>{item.label}</span>
                </div>
              ))}
            </div>

            {ineligibleFields > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <AlertTriangle size={18} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#dc2626", fontSize: 14 }}>{ineligibleFields} field(s) declared ineligible</p>
                  <p style={{ margin: 0, color: "#7f1d1d", fontSize: 13 }}>Crops from ineligible fields cannot be sold into the biofuel supply chain. Review the field declarations tab.</p>
                </div>
              </div>
            )}

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start", marginTop: 16 }}>
              <Info size={18} style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, color: "#1e40af", fontSize: 13, lineHeight: 1.6 }}>
                <strong>GHG data inputs available:</strong> {ghg?.nvzApplicationCount ?? 0} NVZ fertiliser applications and {ghg?.sprayApplicationCount ?? 0} spray applications are on record. Your ISCC auditor or biofuel buyer can use this data to calculate your field-level GHG footprint.
              </p>
            </div>
          </div>
        )}

        {activeTab === "certification" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Certification Records</h2>
              <Button size="sm" onClick={() => { setEditingCert(null); setCertDialog(true); }}>
                <Plus size={15} className="mr-1" /> Add Certification
              </Button>
            </div>
            {certs.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e5e7eb" }}>
                <Award size={40} style={{ color: "#d1d5db", margin: "0 auto 12px" }} />
                <p style={{ fontWeight: 600, color: "#374151" }}>No certifications recorded</p>
                <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Add your ISCC or equivalent RTFO certification details.</p>
                <Button size="sm" onClick={() => { setEditingCert(null); setCertDialog(true); }}>Add First Certification</Button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {certs.map(cert => (
                  <div key={cert.id} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 10 }}>
                      <Award size={22} style={{ color: "#16a34a" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{cert.scheme}</div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {cert.certificationNumber && <span>Cert No: {cert.certificationNumber} · </span>}
                        {cert.issuingBody && <span>{cert.issuingBody} · </span>}
                        {cert.expiryDate && <span>Expires: {new Date(cert.expiryDate).toLocaleDateString("en-GB")}</span>}
                      </div>
                      {cert.rtfoOperatorNumber && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>RTFO Operator No: {cert.rtfoOperatorNumber}</div>}
                      {cert.scope && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Scope: {cert.scope}</div>}
                    </div>
                    {certStatusBadge(cert)}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button size="sm" variant="outline" onClick={() => { setEditingCert(cert); setCertDialog(true); }}><Edit size={14} /></Button>
                      <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete this certification?")) deleteCertMut.mutate(cert.id); }} style={{ color: "#dc2626" }}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "fields" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Field Land Eligibility Declarations</h2>
              <Button size="sm" onClick={() => { setEditingField(null); setFieldDialog(true); }}>
                <Plus size={15} className="mr-1" /> Add Declaration
              </Button>
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
              <strong>Requirement:</strong> All fields supplying crops to the biofuel chain must have a land-use declaration confirming the land was not converted from high-carbon-stock or high-biodiversity areas after January 2008.
            </div>
            {fields.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e5e7eb" }}>
                <MapPin size={40} style={{ color: "#d1d5db", margin: "0 auto 12px" }} />
                <p style={{ fontWeight: 600, color: "#374151" }}>No field declarations</p>
                <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Declare the land use history for each field supplying biofuel crops.</p>
                <Button size="sm" onClick={() => { setEditingField(null); setFieldDialog(true); }}>Add First Declaration</Button>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["Field", "Land Use in 2008", "Converted After 2008", "Carbon Risk", "Biodiversity Risk", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f, i) => (
                      <tr key={f.id} style={{ borderBottom: i < fields.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>{f.fieldName}</td>
                        <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151", textTransform: "capitalize" }}>{f.landUseIn2008.replace(/-/g, " ")}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {f.convertedAfter2008
                            ? <Badge className="bg-red-100 text-red-700">Yes</Badge>
                            : <Badge className="bg-green-100 text-green-700">No</Badge>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {f.highCarbonStockRisk
                            ? <Badge className="bg-red-100 text-red-700"><AlertTriangle size={11} className="mr-1" />High</Badge>
                            : <Badge className="bg-green-100 text-green-700">Low</Badge>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {f.highBiodiversityRisk
                            ? <Badge className="bg-red-100 text-red-700"><AlertTriangle size={11} className="mr-1" />High</Badge>
                            : <Badge className="bg-green-100 text-green-700">Low</Badge>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>{eligibilityBadge(f.eligibilityStatus)}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Button size="sm" variant="outline" onClick={() => { setEditingField(f); setFieldDialog(true); }}><Edit size={13} /></Button>
                            <Button size="sm" variant="outline" style={{ color: "#dc2626" }} onClick={() => { if (confirm("Delete this declaration?")) deleteFieldMut.mutate(f.id); }}><Trash2 size={13} /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "deliveries" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Biofuel Delivery Records</h2>
              <Button size="sm" onClick={() => { setEditingDelivery(null); setDeliveryDialog(true); }}>
                <Plus size={15} className="mr-1" /> Add Delivery
              </Button>
            </div>
            {deliveries.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e5e7eb" }}>
                <Truck size={40} style={{ color: "#d1d5db", margin: "0 auto 12px" }} />
                <p style={{ fontWeight: 600, color: "#374151" }}>No delivery records</p>
                <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Record each consignment of biofuel crop delivered to buyers with sustainability declaration references.</p>
                <Button size="sm" onClick={() => { setEditingDelivery(null); setDeliveryDialog(true); }}>Add First Delivery</Button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {deliveries.map(d => (
                  <div key={d.id} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ background: "#fef3c7", borderRadius: 8, padding: 10 }}>
                      <Truck size={20} style={{ color: "#d97706" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{d.buyerName} — {d.cropType}</div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {new Date(d.deliveryDate).toLocaleDateString("en-GB")}
                        {d.quantityTonnes && <span> · {Number(d.quantityTonnes).toFixed(2)}t</span>}
                        {d.buyerRtfoRef && <span> · RTFO Ref: {d.buyerRtfoRef}</span>}
                      </div>
                      {d.sustainabilityScheme && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Scheme: {d.sustainabilityScheme}</div>}
                      {d.ghgSavingPercent && <div style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>GHG saving: {d.ghgSavingPercent}%</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button size="sm" variant="outline" onClick={() => { setEditingDelivery(d); setDeliveryDialog(true); }}><Edit size={14} /></Button>
                      <Button size="sm" variant="outline" style={{ color: "#dc2626" }} onClick={() => { if (confirm("Delete this delivery?")) deleteDeliveryMut.mutate(d.id); }}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CertificationDialog
        open={certDialog}
        onClose={() => { setCertDialog(false); setEditingCert(null); }}
        initial={editingCert}
        onSave={(data) => certMut.mutate(data)}
        saving={certMut.isPending}
      />
      <FieldDeclarationDialog
        open={fieldDialog}
        onClose={() => { setFieldDialog(false); setEditingField(null); }}
        initial={editingField}
        onSave={(data) => fieldMut.mutate(data)}
        saving={fieldMut.isPending}
      />
      <DeliveryDialog
        open={deliveryDialog}
        onClose={() => { setDeliveryDialog(false); setEditingDelivery(null); }}
        initial={editingDelivery}
        onSave={(data) => deliveryMut.mutate(data)}
        saving={deliveryMut.isPending}
      />
    </AppLayout>
  );
}

function CertificationDialog({ open, onClose, initial, onSave, saving }: {
  open: boolean; onClose: () => void; initial: Certification | null;
  onSave: (data: Partial<Certification>) => void; saving: boolean;
}) {
  const [form, setForm] = useState<Partial<Certification>>({});
  const set = (k: keyof Certification, v: string) => setForm(f => ({ ...f, [k]: v }));

  const val = (k: keyof Certification) => (form as Record<string, string>)[k] ?? (initial as Record<string, string> | null)?.[k] ?? "";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent style={{ maxWidth: 560 }}>
        <DialogHeader><DialogTitle>{initial ? "Edit Certification" : "Add Certification"}</DialogTitle></DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Label>Certification Scheme *</Label>
            <Select value={val("scheme")} onValueChange={v => set("scheme", v)}>
              <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ISCC EU">ISCC EU</SelectItem>
                <SelectItem value="ISCC UK">ISCC UK</SelectItem>
                <SelectItem value="Bonsucro">Bonsucro</SelectItem>
                <SelectItem value="RTRS">RTRS</SelectItem>
                <SelectItem value="REDcert">REDcert</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Certification Number</Label><Input value={val("certificationNumber")} onChange={e => set("certificationNumber", e.target.value)} placeholder="e.g. ISCC-UK-1234567" /></div>
            <div><Label>Issuing Body</Label><Input value={val("issuingBody")} onChange={e => set("issuingBody", e.target.value)} placeholder="e.g. ISCC System GmbH" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Issue Date</Label><Input type="date" value={val("issueDate")?.split("T")[0] ?? ""} onChange={e => set("issueDate", e.target.value)} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={val("expiryDate")?.split("T")[0] ?? ""} onChange={e => set("expiryDate", e.target.value)} /></div>
          </div>
          <div><Label>RTFO Operator Number</Label><Input value={val("rtfoOperatorNumber")} onChange={e => set("rtfoOperatorNumber", e.target.value)} placeholder="Your DfT RTFO operator number" /></div>
          <div><Label>Certification Scope</Label><Input value={val("scope")} onChange={e => set("scope", e.target.value)} placeholder="e.g. Wheat, OSR for bioethanol/biodiesel" /></div>
          <div>
            <Label>Status</Label>
            <Select value={val("status") || "active"} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea value={val("notes")} onChange={e => set("notes", e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldDeclarationDialog({ open, onClose, initial, onSave, saving }: {
  open: boolean; onClose: () => void; initial: FieldDeclaration | null;
  onSave: (data: Partial<FieldDeclaration>) => void; saving: boolean;
}) {
  const [form, setForm] = useState<Partial<FieldDeclaration>>({});
  const set = (k: keyof FieldDeclaration, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const val = (k: keyof FieldDeclaration) => (form as Record<string, unknown>)[k] ?? (initial as Record<string, unknown> | null)?.[k] ?? "";
  const bval = (k: keyof FieldDeclaration): boolean => {
    const v = (form as Record<string, unknown>)[k] ?? (initial as Record<string, unknown> | null)?.[k];
    return v === true;
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent style={{ maxWidth: 580 }}>
        <DialogHeader><DialogTitle>{initial ? "Edit Field Declaration" : "Add Field Declaration"}</DialogTitle></DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><Label>Field Name *</Label><Input value={val("fieldName") as string} onChange={e => set("fieldName", e.target.value)} placeholder="e.g. Home Farm West, Twelve Acres" /></div>
          <div>
            <Label>Land Use in January 2008 *</Label>
            <Select value={val("landUseIn2008") as string} onValueChange={v => set("landUseIn2008", v)}>
              <SelectTrigger><SelectValue placeholder="Select land use in 2008" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="arable">Arable / Cropland</SelectItem>
                <SelectItem value="grassland">Improved Grassland</SelectItem>
                <SelectItem value="rough-grazing">Rough Grazing</SelectItem>
                <SelectItem value="forest">Forest / Woodland</SelectItem>
                <SelectItem value="peatland">Peatland / Bog</SelectItem>
                <SelectItem value="wetland">Wetland</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
              <input type="checkbox" checked={bval("convertedAfter2008")} onChange={e => set("convertedAfter2008", e.target.checked)} />
              Converted after 2008?
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: bval("highCarbonStockRisk") ? "#dc2626" : "inherit" }}>
              <input type="checkbox" checked={bval("highCarbonStockRisk")} onChange={e => set("highCarbonStockRisk", e.target.checked)} />
              High Carbon Risk?
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: bval("highBiodiversityRisk") ? "#dc2626" : "inherit" }}>
              <input type="checkbox" checked={bval("highBiodiversityRisk")} onChange={e => set("highBiodiversityRisk", e.target.checked)} />
              Biodiversity Risk?
            </label>
          </div>
          <div>
            <Label>Eligibility Status</Label>
            <Select value={val("eligibilityStatus") as string || "eligible"} onValueChange={v => set("eligibilityStatus", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="not-eligible">Not Eligible</SelectItem>
                <SelectItem value="requires-verification">Requires Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Declared By</Label><Input value={val("declaredBy") as string} onChange={e => set("declaredBy", e.target.value)} placeholder="Name of person making declaration" /></div>
          <div><Label>Notes</Label><Textarea value={val("notes") as string} onChange={e => set("notes", e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving}>{saving ? "Saving..." : "Save Declaration"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeliveryDialog({ open, onClose, initial, onSave, saving }: {
  open: boolean; onClose: () => void; initial: Delivery | null;
  onSave: (data: Partial<Delivery>) => void; saving: boolean;
}) {
  const [form, setForm] = useState<Partial<Delivery>>({});
  const set = (k: keyof Delivery, v: string) => setForm(f => ({ ...f, [k]: v }));
  const val = (k: keyof Delivery) => (form as Record<string, string>)[k] ?? (initial as Record<string, string> | null)?.[k] ?? "";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent style={{ maxWidth: 560 }}>
        <DialogHeader><DialogTitle>{initial ? "Edit Delivery" : "Add Delivery Record"}</DialogTitle></DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Delivery Date *</Label><Input type="date" value={val("deliveryDate")?.split("T")[0] ?? ""} onChange={e => set("deliveryDate", e.target.value)} /></div>
            <div><Label>Quantity (tonnes) *</Label><Input type="number" value={val("quantityTonnes")} onChange={e => set("quantityTonnes", e.target.value)} placeholder="e.g. 250.5" /></div>
          </div>
          <div><Label>Buyer Name *</Label><Input value={val("buyerName")} onChange={e => set("buyerName", e.target.value)} placeholder="e.g. Vivergo Fuels, Ensus" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Buyer RTFO Reference</Label><Input value={val("buyerRtfoRef")} onChange={e => set("buyerRtfoRef", e.target.value)} placeholder="e.g. RTFO-2024-xxxx" /></div>
            <div><Label>Crop Type</Label><Input value={val("cropType")} onChange={e => set("cropType", e.target.value)} placeholder="e.g. Feed wheat, OSR" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Sustainability Scheme</Label><Input value={val("sustainabilityScheme")} onChange={e => set("sustainabilityScheme", e.target.value)} placeholder="e.g. ISCC UK" /></div>
            <div><Label>GHG Saving %</Label><Input type="number" value={val("ghgSavingPercent")} onChange={e => set("ghgSavingPercent", e.target.value)} placeholder="e.g. 65" /></div>
          </div>
          <div><Label>Certification Reference</Label><Input value={val("certificationRef")} onChange={e => set("certificationRef", e.target.value)} placeholder="Your cert number for this delivery" /></div>
          <div><Label>Sustainability Declaration Reference</Label><Input value={val("sustainabilityDeclarationRef")} onChange={e => set("sustainabilityDeclarationRef", e.target.value)} placeholder="e.g. SD-2024-001" /></div>
          <div><Label>Notes</Label><Textarea value={val("notes")} onChange={e => set("notes", e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving}>{saving ? "Saving..." : "Save Delivery"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
