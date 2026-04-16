import { useState } from "react";
import { useLookupStrings } from "@/hooks/use-lookup";
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
  Building2,
  Phone,
  Mail,
  FileText,
  Download,
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

type Tab = "overview" | "certification" | "fields" | "buyers" | "deliveries";

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
  buyerId?: number;
  deliveryDate: string;
  buyerName: string;
  buyerRtfoRef?: string;
  cropType: string;
  quantityTonnes?: string;
  certificationRef?: string;
  sustainabilityScheme?: string;
  ghgSavingPercent?: string;
  sustainabilityDeclarationRef?: string;
  notes?: string;
}

interface Buyer {
  id: number;
  companyName: string;
  tradingName?: string;
  rtfoObligationNumber?: string;
  isccCertNumber?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  town?: string;
  county?: string;
  postcode?: string;
  notes?: string;
  isActive?: boolean;
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

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BiofuelPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [certDialog, setCertDialog] = useState(false);
  const [fieldDialog, setFieldDialog] = useState(false);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [buyerDialog, setBuyerDialog] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editingField, setEditingField] = useState<FieldDeclaration | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [declarationDownloading, setDeclarationDownloading] = useState<number | null>(null);
  const [auditPackDownloading, setAuditPackDownloading] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<{ title: string; msg: string; fn: () => void } | null>(null);

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

  const buyersQ = useQuery<{ records: Buyer[] }>({
    queryKey: ["biofuel-buyers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/buyers`).then(r => r.json()),
    enabled: !!farmId,
  });

  const farmFieldNamesQ = useQuery<{ records: { name: string }[] }>({
    queryKey: ["farm-fields-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
    enabled: !!farmId,
  });

  const tenantUsersQ = useQuery<{ users: { firstName: string | null; lastName: string | null }[] }>({
    queryKey: ["tenant-users"],
    queryFn: () => fetch(`/api/tenants/current/users`).then(r => r.json()),
    enabled: !!farmId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["biofuel-certs", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-fields", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-buyers", farmId] });
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

  const buyerMut = useMutation({
    mutationFn: (data: Partial<Buyer>) => {
      const url = editingBuyer
        ? `/api/farms/${farmId}/biofuel/buyers/${editingBuyer.id}`
        : `/api/farms/${farmId}/biofuel/buyers`;
      return fetch(url, { method: editingBuyer ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
    onSuccess: () => { invalidate(); setBuyerDialog(false); setEditingBuyer(null); toast({ title: "Buyer saved" }); },
    onError: () => toast({ title: "Error saving buyer", variant: "destructive" }),
  });

  const deactivateBuyerMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/biofuel/buyers/${id}/deactivate`, { method: "PATCH" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["biofuel-buyers", farmId] }); toast({ title: "Buyer marked inactive — all historic records preserved" }); },
  });

  const reactivateBuyerMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/biofuel/buyers/${id}/reactivate`, { method: "PATCH" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["biofuel-buyers", farmId] }); toast({ title: "Buyer reactivated" }); },
  });

  const handleDeclarationDownload = async (delivery: Delivery) => {
    setDeclarationDownloading(delivery.id);
    try {
      const res = await fetch(`/api/farms/${farmId}/biofuel/deliveries/${delivery.id}/sustainability-declaration.pdf`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? `Sustainability-Declaration-${delivery.id}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Could not download declaration", variant: "destructive" });
    } finally {
      setDeclarationDownloading(null);
    }
  };

  const handleAuditPackDownload = async () => {
    setAuditPackDownloading(true);
    try {
      const res = await fetch(`/api/farms/${farmId}/biofuel/audit-pack.pdf`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "RTFO-Audit-Pack.pdf";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Could not download audit pack", variant: "destructive" });
    } finally {
      setAuditPackDownloading(false);
    }
  };

  const certs = certsQ.data?.records ?? [];
  const fields = fieldsQ.data?.records ?? [];
  const deliveries = deliveriesQ.data?.records ?? [];
  const buyers = buyersQ.data?.records ?? [];
  const ghg = ghgQ.data;

  const farmFieldNames: string[] = (farmFieldNamesQ.data?.records ?? []).map(f => f.name).filter(Boolean);
  const existingDeclarants = [...new Set(fields.map(f => f.declaredBy ?? "").filter(Boolean))];
  const tenantUserNames = (tenantUsersQ.data?.users ?? [])
    .map(u => [u.firstName, u.lastName].filter(Boolean).join(" ").trim())
    .filter(Boolean);
  const declaredByOptions: string[] = [...new Set([...tenantUserNames, ...existingDeclarants])].sort();

  const activeCert = certs.find(c => c.status === "active");
  const eligibleFields = fields.filter(f => f.eligibilityStatus === "eligible").length;
  const ineligibleFields = fields.filter(f => f.eligibilityStatus === "not-eligible").length;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "certification", label: "Certification", icon: Award },
    { id: "fields", label: "Field Declarations", icon: MapPin },
    { id: "buyers", label: "Registered Buyers", icon: Building2 },
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
      <ConfirmDialog
        open={!!pendingConfirm}
        title={pendingConfirm?.title ?? "Confirm"}
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
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
            {/* Audit Pack export button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAuditPackDownload}
                disabled={auditPackDownloading}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {auditPackDownloading
                  ? <><span className="animate-spin mr-1">⏳</span> Generating…</>
                  : <><Download size={14} /> Export Audit Pack</>
                }
              </Button>
            </div>
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
                      <Button size="sm" variant="outline" onClick={() => setPendingConfirm({ title: "Delete Certification", msg: "Delete this certification record? This cannot be undone.", fn: () => deleteCertMut.mutate(cert.id) })} style={{ color: "#dc2626" }}><Trash2 size={14} /></Button>
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
                            <Button size="sm" variant="outline" style={{ color: "#dc2626" }} onClick={() => setPendingConfirm({ title: "Delete Declaration", msg: "Delete this field land eligibility declaration? This cannot be undone.", fn: () => deleteFieldMut.mutate(f.id) })}><Trash2 size={13} /></Button>
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

        {activeTab === "buyers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 16 }}>Registered RTFO Buyers</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                  Buyers are obligated fuel suppliers registered with the Department for Transport.
                  Each buyer holds an <strong>RTF Obligation Number</strong> — the government-issued ID you must record for audit.
                </p>
              </div>
              <Button size="sm" onClick={() => { setEditingBuyer(null); setBuyerDialog(true); }} style={{ flexShrink: 0, marginLeft: 16 }}>
                <Plus size={15} className="mr-1" /> Add Buyer
              </Button>
            </div>

            {/* Regulatory context callout */}
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Info size={16} style={{ color: "#2563eb", marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>
                <strong>What is an RTF Obligation Number?</strong> The Department for Transport assigns this unique reference to every fuel supplier
                (oil company, fuel distributor, etc.) that is legally obligated to blend renewable fuel into their supplies under the RTFO.
                It appears on sustainability declarations and is your audit trail that the delivery went to a legitimate, registered buyer.
                You can verify buyers on the{" "}
                <a href="https://www.gov.uk/guidance/renewable-transport-fuel-obligation" target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8" }}>DfT RTFO page</a>.
              </div>
            </div>

            {buyers.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e5e7eb" }}>
                <Building2 size={40} style={{ color: "#d1d5db", margin: "0 auto 12px" }} />
                <p style={{ fontWeight: 600, color: "#374151" }}>No buyers added yet</p>
                <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
                  Add the fuel companies you sell biofuel crops to. Once added, you can select them when recording deliveries.
                </p>
                <Button size="sm" onClick={() => { setEditingBuyer(null); setBuyerDialog(true); }}>Add First Buyer</Button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {buyers.map(b => {
                  const isActive = b.isActive !== false;
                  return (
                  <div key={b.id} style={{ background: isActive ? "#fff" : "#f9fafb", borderRadius: 12, padding: "20px 24px", border: `1px solid ${isActive ? "#e5e7eb" : "#e5e7eb"}`, display: "flex", alignItems: "flex-start", gap: 16, opacity: isActive ? 1 : 0.65 }}>
                    <div style={{ background: isActive ? "#eff6ff" : "#f3f4f6", borderRadius: 8, padding: 10, flexShrink: 0 }}>
                      <Building2 size={20} style={{ color: isActive ? "#2563eb" : "#9ca3af" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ textDecoration: isActive ? "none" : "line-through", color: isActive ? undefined : "#9ca3af" }}>{b.companyName}</span>
                        {!isActive && <span style={{ fontSize: 10, background: "#f3f4f6", color: "#6b7280", padding: "2px 6px", borderRadius: 4, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none" }}>Inactive</span>}
                        {b.tradingName && b.tradingName !== b.companyName && isActive && (
                          <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 13 }}> — trading as {b.tradingName}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 13, color: "#4b5563", marginTop: 4 }}>
                        {b.rtfoObligationNumber && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Badge className="bg-blue-100 text-blue-700 text-xs font-mono">RTF {b.rtfoObligationNumber}</Badge>
                          </span>
                        )}
                        {b.isccCertNumber && (
                          <span style={{ color: "#6b7280" }}>ISCC: {b.isccCertNumber}</span>
                        )}
                        {b.contactName && (
                          <span style={{ color: "#6b7280" }}>Contact: {b.contactName}</span>
                        )}
                        {b.contactEmail && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#6b7280" }}>
                            <Mail size={12} />{b.contactEmail}
                          </span>
                        )}
                        {b.contactPhone && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#6b7280" }}>
                            <Phone size={12} />{b.contactPhone}
                          </span>
                        )}
                      </div>
                      {(b.town || b.postcode) && (
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
                          {[b.addressLine1, b.town, b.county, b.postcode].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {isActive && <Button size="sm" variant="outline" onClick={() => { setEditingBuyer(b); setBuyerDialog(true); }}><Edit size={14} /></Button>}
                      <Button size="sm" variant="outline" style={{ color: isActive ? "#dc2626" : "#16a34a", borderColor: isActive ? "#fecaca" : "#bbf7d0" }}
                        onClick={() => isActive ? deactivateBuyerMut.mutate(b.id) : reactivateBuyerMut.mutate(b.id)}>
                        {isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                    </div>
                  </div>
                  );
                })}
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
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Download Sustainability Declaration PDF"
                        disabled={declarationDownloading === d.id}
                        onClick={() => handleDeclarationDownload(d)}
                        style={{ display: "flex", alignItems: "center", gap: 5, color: "#16a34a", borderColor: "#16a34a" }}
                      >
                        {declarationDownloading === d.id
                          ? <span className="animate-spin" style={{ fontSize: 11 }}>⏳</span>
                          : <FileText size={13} />
                        }
                        <span style={{ fontSize: 12 }}>{declarationDownloading === d.id ? "Generating…" : "Declaration"}</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingDelivery(d); setDeliveryDialog(true); }}><Edit size={14} /></Button>
                      <Button size="sm" variant="outline" style={{ color: "#dc2626" }} onClick={() => setPendingConfirm({ title: "Delete Delivery", msg: "Delete this delivery record? This cannot be undone.", fn: () => deleteDeliveryMut.mutate(d.id) })}><Trash2 size={14} /></Button>
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
        farmFieldNames={farmFieldNames}
        declaredByOptions={declaredByOptions}
      />
      <DeliveryDialog
        open={deliveryDialog}
        onClose={() => { setDeliveryDialog(false); setEditingDelivery(null); }}
        initial={editingDelivery}
        buyers={buyers}
        onSave={(data) => deliveryMut.mutate(data)}
        saving={deliveryMut.isPending}
      />
      <BuyerDialog
        open={buyerDialog}
        onClose={() => { setBuyerDialog(false); setEditingBuyer(null); }}
        initial={editingBuyer}
        onSave={(data) => buyerMut.mutate(data)}
        saving={buyerMut.isPending}
      />
    </AppLayout>
  );
}

function CertificationDialog({ open, onClose, initial, onSave, saving }: {
  open: boolean; onClose: () => void; initial: Certification | null;
  onSave: (data: Partial<Certification>) => void; saving: boolean;
}) {
  const biofuelSchemes = useLookupStrings("biofuel_cert_schemes", ["ISCC EU", "ISCC UK", "Bonsucro", "RTRS", "REDcert", "RSB", "Other"]);
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
                {biofuelSchemes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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

function FieldDeclarationDialog({ open, onClose, initial, onSave, saving, farmFieldNames = [], declaredByOptions = [] }: {
  open: boolean; onClose: () => void; initial: FieldDeclaration | null;
  onSave: (data: Partial<FieldDeclaration>) => void; saving: boolean;
  farmFieldNames?: string[];
  declaredByOptions?: string[];
}) {
  const [form, setForm] = useState<Partial<FieldDeclaration>>({});
  const set = (k: keyof FieldDeclaration, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const val = (k: keyof FieldDeclaration) => (form as Record<string, unknown>)[k] ?? (initial as Record<string, unknown> | null)?.[k] ?? "";
  const bval = (k: keyof FieldDeclaration): boolean => {
    const v = (form as Record<string, unknown>)[k] ?? (initial as Record<string, unknown> | null)?.[k];
    return v === true;
  };

  const currentFieldName = val("fieldName") as string;
  const fieldNameInList = farmFieldNames.includes(currentFieldName);
  const fieldSelectValue = farmFieldNames.length === 0
    ? "__none__"
    : (fieldNameInList ? currentFieldName : (currentFieldName ? "__other__" : "__none__"));

  const currentDeclaredBy = val("declaredBy") as string;
  const declaredByInList = declaredByOptions.includes(currentDeclaredBy);
  const declaredBySelectValue = declaredByOptions.length === 0
    ? "__none__"
    : (declaredByInList ? currentDeclaredBy : (currentDeclaredBy ? "__other__" : "__none__"));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent style={{ maxWidth: 580 }}>
        <DialogHeader><DialogTitle>{initial ? "Edit Field Declaration" : "Add Field Declaration"}</DialogTitle></DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Field Name — lookup from Field Register */}
          <div>
            <Label>Field Name *</Label>
            {farmFieldNames.length > 0 ? (
              <>
                <Select value={fieldSelectValue} onValueChange={v => {
                  if (v === "__none__") set("fieldName", "");
                  else if (v === "__other__") set("fieldName", "");
                  else set("fieldName", v);
                }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select field…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select field —</SelectItem>
                    {farmFieldNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    <SelectItem value="__other__">Other / type manually</SelectItem>
                  </SelectContent>
                </Select>
                {(fieldSelectValue === "__other__" || (!fieldNameInList && currentFieldName)) && (
                  <Input className="mt-1" value={currentFieldName} onChange={e => set("fieldName", e.target.value)} placeholder="Type field name" />
                )}
              </>
            ) : (
              <Input className="mt-1" value={currentFieldName} onChange={e => set("fieldName", e.target.value)} placeholder="e.g. Home Farm West, Twelve Acres" />
            )}
          </div>
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
          {/* Declared By — lookup from farm users */}
          <div>
            <Label>Declared By</Label>
            {declaredByOptions.length > 0 ? (
              <>
                <Select value={declaredBySelectValue} onValueChange={v => {
                  if (v === "__none__") set("declaredBy", "");
                  else if (v === "__other__") set("declaredBy", "");
                  else set("declaredBy", v);
                }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select person…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select person —</SelectItem>
                    {declaredByOptions.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    <SelectItem value="__other__">Other / type manually</SelectItem>
                  </SelectContent>
                </Select>
                {(declaredBySelectValue === "__other__" || (!declaredByInList && currentDeclaredBy)) && (
                  <Input className="mt-1" value={currentDeclaredBy} onChange={e => set("declaredBy", e.target.value)} placeholder="Type name of person making declaration" />
                )}
              </>
            ) : (
              <Input className="mt-1" value={currentDeclaredBy} onChange={e => set("declaredBy", e.target.value)} placeholder="Name of person making declaration" />
            )}
          </div>
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

function DeliveryDialog({ open, onClose, initial, buyers, onSave, saving }: {
  open: boolean; onClose: () => void; initial: Delivery | null;
  buyers: Buyer[];
  onSave: (data: Partial<Delivery>) => void; saving: boolean;
}) {
  const [form, setForm] = useState<Partial<Delivery>>({});
  const set = (k: keyof Delivery, v: string | number | undefined) => setForm(f => ({ ...f, [k]: v }));
  const val = (k: keyof Delivery) => (form as Record<string, string>)[k] ?? (initial as Record<string, string> | null)?.[k] ?? "";

  const selectedBuyerId = form.buyerId ?? initial?.buyerId;

  const handleBuyerSelect = (value: string) => {
    if (value === "__none__") {
      setForm(f => ({ ...f, buyerId: undefined, buyerName: "", buyerRtfoRef: "" }));
      return;
    }
    const buyer = buyers.find(b => b.id === parseInt(value, 10));
    if (buyer) {
      setForm(f => ({
        ...f,
        buyerId: buyer.id,
        buyerName: buyer.companyName,
        buyerRtfoRef: buyer.rtfoObligationNumber ?? f.buyerRtfoRef ?? "",
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent style={{ maxWidth: 560 }}>
        <DialogHeader><DialogTitle>{initial ? "Edit Delivery" : "Add Delivery Record"}</DialogTitle></DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><Label>Delivery Date *</Label><Input type="date" value={val("deliveryDate")?.split("T")[0] ?? ""} onChange={e => set("deliveryDate", e.target.value)} /></div>
            <div><Label>Quantity (tonnes) *</Label><Input type="number" value={val("quantityTonnes")} onChange={e => set("quantityTonnes", e.target.value)} placeholder="e.g. 250.5" /></div>
          </div>

          {/* Buyer selection */}
          {buyers.length > 0 ? (
            <div>
              <Label>Buyer *</Label>
              <Select value={selectedBuyerId ? String(selectedBuyerId) : "__none__"} onValueChange={handleBuyerSelect}>
                <SelectTrigger><SelectValue placeholder="Select a registered buyer…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— select buyer —</SelectItem>
                  {buyers.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.companyName}{b.rtfoObligationNumber ? ` (RTF ${b.rtfoObligationNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBuyerId && (
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  Buyer name and RTF Obligation Number auto-filled from buyer record.
                </p>
              )}
            </div>
          ) : (
            <div>
              <Label>Buyer Name *</Label>
              <Input value={val("buyerName")} onChange={e => set("buyerName", e.target.value)} placeholder="e.g. Vivergo Fuels, Ensus" />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Tip: Add buyers under the "Registered Buyers" tab to select them from a dropdown here.
              </p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Buyer RTF Obligation No.</Label>
              <Input
                value={val("buyerRtfoRef")}
                onChange={e => set("buyerRtfoRef", e.target.value)}
                placeholder="e.g. RTFO-2024-xxxx"
                readOnly={!!selectedBuyerId}
                style={selectedBuyerId ? { background: "#f9fafb", color: "#374151" } : {}}
              />
            </div>
            <div><Label>Crop Type *</Label><Input value={val("cropType")} onChange={e => set("cropType", e.target.value)} placeholder="e.g. Feed wheat, OSR" /></div>
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

function BuyerDialog({ open, onClose, initial, onSave, saving }: {
  open: boolean; onClose: () => void; initial: Buyer | null;
  onSave: (data: Partial<Buyer>) => void; saving: boolean;
}) {
  const [form, setForm] = useState<Partial<Buyer>>({});
  const set = (k: keyof Buyer, v: string) => setForm(f => ({ ...f, [k]: v }));
  const val = (k: keyof Buyer) => (form as Record<string, string>)[k] ?? (initial as Record<string, string> | null)?.[k] ?? "";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent style={{ maxWidth: 600 }}>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Buyer" : "Add RTFO Buyer"}</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Identity */}
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Company Identity</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Company Name *</Label>
                <Input value={val("companyName")} onChange={e => set("companyName", e.target.value)} placeholder="e.g. Vivergo Fuels Ltd" />
              </div>
              <div>
                <Label>Trading Name <span style={{ color: "#9ca3af", fontWeight: 400 }}>(if different)</span></Label>
                <Input value={val("tradingName")} onChange={e => set("tradingName", e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <Label>RTF Obligation Number</Label>
                <Input value={val("rtfoObligationNumber")} onChange={e => set("rtfoObligationNumber", e.target.value)} placeholder="DfT-assigned reference" className="font-mono" />
              </div>
              <div>
                <Label>Buyer's ISCC Cert No. <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></Label>
                <Input value={val("isccCertNumber")} onChange={e => set("isccCertNumber", e.target.value)} placeholder="e.g. ISCC-UK-..." />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><Label>Contact Name</Label><Input value={val("contactName")} onChange={e => set("contactName", e.target.value)} placeholder="e.g. Jane Smith" /></div>
              <div><Label>Phone</Label><Input value={val("contactPhone")} onChange={e => set("contactPhone", e.target.value)} placeholder="e.g. 01234 567890" /></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Email</Label><Input type="email" value={val("contactEmail")} onChange={e => set("contactEmail", e.target.value)} placeholder="e.g. sustainability@company.co.uk" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Address</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1 / -1" }}><Label>Address Line 1</Label><Input value={val("addressLine1")} onChange={e => set("addressLine1", e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}><Label>Address Line 2</Label><Input value={val("addressLine2")} onChange={e => set("addressLine2", e.target.value)} /></div>
              <div><Label>Town / City</Label><Input value={val("town")} onChange={e => set("town", e.target.value)} /></div>
              <div><Label>County</Label><Input value={val("county")} onChange={e => set("county", e.target.value)} /></div>
              <div><Label>Postcode</Label><Input value={val("postcode")} onChange={e => set("postcode", e.target.value)} className="uppercase" /></div>
            </div>
          </div>

          <div><Label>Notes</Label><Textarea value={val("notes")} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Any additional notes about this buyer…" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving}>{saving ? "Saving..." : "Save Buyer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
