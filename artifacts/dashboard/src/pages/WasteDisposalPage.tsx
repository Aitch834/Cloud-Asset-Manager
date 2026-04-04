import React, { useState, useRef } from "react";
import { Link } from "wouter";
import { printFromRef } from "@/lib/print-report";
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
import { Trash2, Plus, Search, Pencil, Eye, FileText, Truck, Recycle, Printer, ExternalLink, Paperclip, X, Upload, AlertTriangle } from "lucide-react";

interface WasteRecord {
  id: number;
  farmId: number;
  wasteType: string;
  quantity: string | null;
  weightTonnes: string | null;
  disposalMethod: string;
  disposalDate: string;
  carrierId: number | null;
  carrierName: string | null;
  carrierLicence: string | null;
  carrierRegistrationType: string | null;
  destinationSite: string | null;
  wasteTransferNote: string | null;
  receiptPhotoPath: string | null;
  ewcCode: string | null;
  notes: string | null;
  createdAt: string;
}

interface Supplier {
  id: number;
  name: string;
  category: string | null;
  accountNumber: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

const WASTE_TYPES_WITH_EWC: { label: string; ewc: string }[] = [
  { label: "Agricultural plastics – bale wrap / silage sheet", ewc: "02 01 04" },
  { label: "Chemical containers / pesticide packaging", ewc: "15 01 10*" },
  { label: "Clinical / veterinary waste (sharps, medicines)", ewc: "18 02 02*" },
  { label: "Waste oil / lubricants", ewc: "13 02 05*" },
  { label: "Scrap metal", ewc: "17 04 05" },
  { label: "Tyres", ewc: "16 01 03" },
  { label: "Batteries", ewc: "16 06 01*" },
  { label: "Electronic waste (WEEE)", ewc: "16 02 14" },
  { label: "Cardboard / paper (non-hazardous)", ewc: "15 01 01" },
  { label: "General farm waste (mixed non-hazardous)", ewc: "02 01 99" },
  { label: "Sewage / slurry (non-hazardous)", ewc: "02 01 06" },
  { label: "Asbestos", ewc: "17 06 01*" },
  { label: "Food waste / organic waste", ewc: "02 01 02" },
  { label: "Spent chemicals / washings", ewc: "07 04 04*" },
  { label: "Mineral oils (non-hazardous)", ewc: "13 01 10" },
  { label: "Mixed construction waste", ewc: "17 09 04" },
  { label: "Other", ewc: "" },
];

const DISPOSAL_METHODS = [
  "Licensed waste carrier collection",
  "Registered waste site drop-off",
  "Agricultural waste contractor",
  "Retailer take-back scheme (e.g. AgXchange)",
  "On-farm composting",
  "On-farm burning (permitted materials only)",
  "Approved incineration facility",
  "Recycling facility",
  "Other",
];

const CARRIER_TYPES = [
  "Environment Agency Registered Carrier",
  "Upper Tier Carrier",
  "Lower Tier Carrier",
  "Exemption holder",
  "Retailer take-back scheme",
  "Other",
];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtFull = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};

export default function WasteDisposalPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<WasteRecord | null>(null);
  const [editRecord, setEditRecord] = useState<WasteRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFrom, setReportFrom] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [reportTo, setReportTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [carrierMode, setCarrierMode] = useState<"registered" | "manual">("registered");

  const emptyForm: any = {
    wasteType: "", ewcCode: "", quantity: "", disposalMethod: "", disposalDate: "",
    carrierId: "", carrierName: "", carrierLicence: "", carrierRegistrationType: "",
    destinationSite: "", wasteTransferNote: "", receiptPhotoPath: null, notes: "",
  };
  const [form, setForm] = useState<any>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── EA live register lookups ─────────────────────────────────────────────
  const [carrierQuery, setCarrierQuery] = useState("");
  const [carrierResults, setCarrierResults] = useState<any[]>([]);
  const [carrierLoading, setCarrierLoading] = useState(false);
  const [carrierDropOpen, setCarrierDropOpen] = useState(false);
  const carrierTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [siteQuery, setSiteQuery] = useState("");
  const [siteResults, setSiteResults] = useState<any[]>([]);
  const [siteLoading, setSiteLoading] = useState(false);
  const [siteDropOpen, setSiteDropOpen] = useState(false);
  const siteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (carrierTimer.current) clearTimeout(carrierTimer.current);
    if (carrierQuery.length < 3) { setCarrierResults([]); return; }
    carrierTimer.current = setTimeout(async () => {
      setCarrierLoading(true);
      try {
        const r = await fetch(`/api/ea/carriers?q=${encodeURIComponent(carrierQuery)}`);
        const data = await r.json();
        setCarrierResults(data.results ?? []);
      } catch { setCarrierResults([]); }
      finally { setCarrierLoading(false); }
    }, 400);
    return () => { if (carrierTimer.current) clearTimeout(carrierTimer.current); };
  }, [carrierQuery]);

  React.useEffect(() => {
    if (siteTimer.current) clearTimeout(siteTimer.current);
    if (siteQuery.length < 3) { setSiteResults([]); return; }
    siteTimer.current = setTimeout(async () => {
      setSiteLoading(true);
      try {
        const r = await fetch(`/api/ea/permitted-sites?q=${encodeURIComponent(siteQuery)}`);
        const data = await r.json();
        setSiteResults(data.results ?? []);
      } catch { setSiteResults([]); }
      finally { setSiteLoading(false); }
    }, 400);
    return () => { if (siteTimer.current) clearTimeout(siteTimer.current); };
  }, [siteQuery]);

  const resetEaSearch = () => {
    setCarrierQuery(""); setCarrierResults([]); setCarrierDropOpen(false);
    setSiteQuery(""); setSiteResults([]); setSiteDropOpen(false);
  };

  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farmRecord = farmQ.data?.record ?? null;

  const q = useQuery({
    queryKey: ["waste", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/waste`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const suppliersQ = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => (d.records ?? []) as Supplier[],
  });

  const wasteCarriers: Supplier[] = (suppliersQ.data ?? []).filter(
    (s: Supplier) => s.category === "Waste Carrier" || s.category === "Waste Carrier / Environmental"
  );
  const allSuppliers: Supplier[] = suppliersQ.data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["waste", farmId] });

  const uploadFileMut = async (file: File): Promise<string> => {
    const urlRes = await fetch("/api/storage/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
    });
    if (!urlRes.ok) throw new Error("Failed to get upload URL");
    const { uploadURL, objectPath } = await urlRes.json();
    const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
    if (!putRes.ok) throw new Error("Failed to upload file");
    return objectPath as string;
  };

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      const payload = {
        ...body,
        disposalDate: body.disposalDate ? new Date(body.disposalDate).toISOString() : undefined,
        carrierId: body.carrierId ? Number(body.carrierId) : null,
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/waste/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/waste`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      toast({ title: editRecord ? "Record updated" : "Record saved" });
      invalidate();
      setAddOpen(false);
      setEditRecord(null);
      setForm(emptyForm);
      setSelectedFile(null);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const handleSave = async () => {
    try {
      let receiptPhotoPath = form.receiptPhotoPath ?? null;
      if (selectedFile) {
        setUploading(true);
        receiptPhotoPath = await uploadFileMut(selectedFile);
        setUploading(false);
      }
      saveMut.mutate({ ...form, receiptPhotoPath });
    } catch {
      setUploading(false);
      toast({ title: "Failed to upload receipt — record not saved", variant: "destructive" });
    }
  };

  const viewAttachmentUrl = (path: string) => {
    const stripped = path.startsWith("/objects/") ? path.slice("/objects/".length) : path;
    return `/api/storage/objects/${stripped}`;
  };

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/waste/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const records: WasteRecord[] = q.data ?? [];
  const filtered = records.filter(r =>
    isInCropYear(r.disposalDate, cropYear) && (
      !search ||
      r.wasteType?.toLowerCase().includes(search.toLowerCase()) ||
      r.carrierName?.toLowerCase().includes(search.toLowerCase()) ||
      r.destinationSite?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const reportRecords = records.filter(r => {
    if (!r.disposalDate) return false;
    const d = new Date(r.disposalDate);
    if (reportFrom && d < new Date(reportFrom)) return false;
    if (reportTo && d > new Date(reportTo + "T23:59:59")) return false;
    return true;
  }).sort((a, b) => new Date(a.disposalDate).getTime() - new Date(b.disposalDate).getTime());

  const openAdd = () => {
    setEditRecord(null);
    setForm(emptyForm);
    setCarrierMode("registered");
    setSelectedFile(null);
    resetEaSearch();
    setAddOpen(true);
  };
  const openEdit = (r: WasteRecord) => {
    setEditRecord(r);
    setForm({ ...r, disposalDate: r.disposalDate?.slice(0, 10) ?? "" });
    setCarrierMode(r.carrierId ? "registered" : "manual");
    setSelectedFile(null);
    setCarrierQuery(r.carrierName ?? "");
    setSiteQuery(r.destinationSite ?? "");
    setCarrierDropOpen(false);
    setSiteDropOpen(false);
    setAddOpen(true);
  };

  const onWasteTypeChange = (v: string) => {
    const match = WASTE_TYPES_WITH_EWC.find(w => w.label === v);
    setForm((f: any) => ({ ...f, wasteType: v, ewcCode: match?.ewc || f.ewcCode }));
  };

  const onCarrierSelect = (supplierId: string) => {
    if (!supplierId || supplierId === "manual") {
      setForm((f: any) => ({ ...f, carrierId: "", carrierName: "", carrierLicence: "" }));
      return;
    }
    const supplier = allSuppliers.find(s => s.id === Number(supplierId));
    if (supplier) {
      setForm((f: any) => ({
        ...f,
        carrierId: supplierId,
        carrierName: supplier.name,
        carrierLicence: supplier.accountNumber || f.carrierLicence,
      }));
    }
  };

  const handlePrint = () => {
    printFromRef(printRef, "Waste Disposal Duty of Care Register");
  };

  const hazardCount = reportRecords.filter(r => r.ewcCode?.includes("*")).length;
  const wtnCount = reportRecords.filter(r => r.wasteTransferNote).length;
  const uniqueCarriers = new Set(reportRecords.filter(r => r.carrierName).map(r => r.carrierName)).size;

  return (
    <AppLayout title="Waste Disposal">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Waste disposal records — Duty of Care compliance, waste transfer notes, and licensed carrier tracking for Red Tractor and legal requirements.
        </p>

        {(() => {
          const thisSeasonRecords = records.filter(r => isInCropYear(r.disposalDate, cropYear));
          const withWtn = thisSeasonRecords.filter(r => r.wasteTransferNote).length;
          const missingWtn = thisSeasonRecords.length - withWtn;
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "#dcfce7", borderRadius: 8, padding: 8 }}><Recycle size={18} color="#16a34a" /></div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Disposals This Season</p>
                  <p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{thisSeasonRecords.length}</p>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }}>{cropYearLabel(cropYear)}</p>
                </div>
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "#fef3c7", borderRadius: 8, padding: 8 }}><FileText size={18} color="#92400e" /></div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Transfer Notes Obtained</p>
                  <p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{withWtn}</p>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }}>{thisSeasonRecords.length > 0 ? `${Math.round((withWtn / thisSeasonRecords.length) * 100)}% compliance` : "no records"}</p>
                </div>
              </div>
              <div style={{ background: missingWtn > 0 ? "#fef2f2" : "#eff6ff", border: `1px solid ${missingWtn > 0 ? "#fecaca" : "#e5e7eb"}`, borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: missingWtn > 0 ? "#fee2e2" : "#dbeafe", borderRadius: 8, padding: 8 }}>
                  <AlertTriangle size={18} color={missingWtn > 0 ? "#dc2626" : "#1d4ed8"} />
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Missing Transfer Notes</p>
                  <p style={{ fontSize: "1.375rem", fontWeight: 700, color: missingWtn > 0 ? "#dc2626" : "#111827" }}>{missingWtn}</p>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }}>{missingWtn > 0 ? "Duty of Care gap" : "fully documented"}</p>
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#856404" }}>
          <strong>Duty of Care reminder:</strong> Always use licensed waste carriers. Obtain a Waste Transfer Note (WTN) for every collection. EWC codes marked with * are hazardous waste — special rules apply. Records must be retained for at least 2 years (3 years for hazardous waste).
        </div>

        {wasteCarriers.length > 0 && (
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "0.625rem 0.875rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#0c4a6e", display: "flex", alignItems: "center", gap: 8 }}>
            <Truck size={13} color="#0284c7" />
            <span><strong>{wasteCarriers.length} registered waste carrier{wasteCarriers.length !== 1 ? "s" : ""}</strong> available from your supplier register. Select them in the Add Record form to auto-fill carrier details.</span>
            <Link href="/suppliers-stock" style={{ marginLeft: "auto", color: "#0284c7", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
              Manage carriers <ExternalLink size={11} />
            </Link>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <Input placeholder="Search waste records..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          <CropYearSelector value={cropYear} onChange={setCropYear} />
          <Button variant="outline" onClick={() => setReportOpen(true)}><Printer size={14} className="mr-1" />Print Register</Button>
          <Button onClick={openAdd}><Plus size={14} className="mr-1" />Add Waste Record</Button>
        </div>

        {q.isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
            <div style={{ background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}><Recycle size={28} color="#9ca3af" /></div>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>{records.length === 0 ? "No waste records" : "No records match your search"}</p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400, marginBottom: "1.25rem" }}>
              Log all waste movements to maintain your Duty of Care obligations and Red Tractor records.
            </p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Date", "Waste Type", "EWC Code", "Qty", "Method", "Carrier", "EA Licence", "Reg. Type", "Destination", "WTN", "Receipt", ""].map(h => (
                    <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: WasteRecord, i: number) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.disposalDate)}</td>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 200 }}>{r.wasteType || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      {r.ewcCode ? (
                        <Badge style={{ background: r.ewcCode.includes("*") ? "#fee2e2" : "#f3f4f6", color: r.ewcCode.includes("*") ? "#991b1b" : "#374151", border: "none", fontFamily: "monospace", fontSize: "0.72rem" }}>
                          {r.ewcCode}
                        </Badge>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.quantity || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160 }}>{r.disposalMethod || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <div>
                        <span style={{ fontWeight: r.carrierId ? 500 : "normal", color: r.carrierId ? "#1d4ed8" : "#6b7280" }}>{r.carrierName || "—"}</span>
                        {r.carrierId && <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>Registered</div>}
                      </div>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.carrierLicence ? "monospace" : "inherit", fontSize: r.carrierLicence ? "0.8rem" : "inherit" }}>{r.carrierLicence || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.75rem" }}>{r.carrierRegistrationType || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.destinationSite || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      {r.wasteTransferNote ? (
                        <Badge style={{ background: "#dcfce7", color: "#166534", border: "none", fontFamily: "monospace", fontSize: "0.72rem" }}>{r.wasteTransferNote}</Badge>
                      ) : <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>None</span>}
                    </td>
                    <td style={{ padding: "0.625rem 0.5rem", textAlign: "center" }}>
                      {r.receiptPhotoPath ? (
                        <a
                          href={viewAttachmentUrl(r.receiptPhotoPath)}
                          target="_blank"
                          rel="noreferrer"
                          title="View attached receipt / WTN scan"
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 5, padding: "3px 7px", color: "#1d4ed8", gap: 4, fontSize: "0.72rem" }}
                        >
                          <Paperclip size={11} /> View
                        </a>
                      ) : (
                        <span style={{ color: "#e5e7eb", fontSize: "0.72rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View"><Eye size={13} /></button>
                        <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── View Dialog ─────────────────────────── */}
        {viewRecord && (
          <Dialog open onOpenChange={() => setViewRecord(null)}>
            <DialogContent style={{ maxWidth: 560 }}>
              <DialogHeader><DialogTitle>Waste Disposal Record</DialogTitle></DialogHeader>
              {(() => {
                const r = viewRecord;
                const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
                const F = ({ label, value }: { label: string; value?: string | null }) => (
                  <div><div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div></div>
                );
                return (
                  <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <F label="Disposal Date" value={fmt(r.disposalDate)} />
                      <F label="Waste Type" value={r.wasteType} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <F label="EWC Code" value={r.ewcCode} />
                      <F label="Weight (tonnes)" value={r.weightTonnes != null ? String(r.weightTonnes) : null} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <F label="Carrier" value={r.carrierName} />
                      <F label="Carrier Licence" value={r.carrierLicence} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <F label="Registration Type" value={r.carrierRegistrationType} />
                      <F label="Waste Transfer Note" value={r.wasteTransferNote} />
                    </div>
                    <F label="Destination Site" value={r.destinationSite} />
                    {r.notes && <F label="Notes" value={r.notes} />}
                  </div>
                );
              })()}
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
                <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ─── Add / Edit Dialog ─────────────────────────── */}
        <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); setSelectedFile(null); resetEaSearch(); } }}>
          <DialogContent style={{ maxWidth: 620 }}>
            <DialogHeader><DialogTitle>{editRecord ? "Edit Waste Record" : "Add Waste Disposal Record"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Disposal Date <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Input type="date" value={form.disposalDate} onChange={e => setForm((f: any) => ({ ...f, disposalDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Quantity / Volume</Label>
                  <Input placeholder="e.g. 50 bags, 200 litres, 0.5 tonnes" value={form.quantity} onChange={e => setForm((f: any) => ({ ...f, quantity: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Waste Type <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Select value={form.wasteType} onValueChange={onWasteTypeChange}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{WASTE_TYPES_WITH_EWC.map(w => <SelectItem key={w.label} value={w.label}>{w.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>EWC Code</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Input placeholder="e.g. 02 01 04" value={form.ewcCode} onChange={e => setForm((f: any) => ({ ...f, ewcCode: e.target.value }))} style={{ fontFamily: "monospace" }} />
                    {form.ewcCode?.includes("*") && <span style={{ color: "#991b1b", fontSize: "0.75rem", whiteSpace: "nowrap" }}>⚠ Hazardous</span>}
                  </div>
                </div>
              </div>
              <div>
                <Label>Disposal Method <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.disposalMethod} onValueChange={v => setForm((f: any) => ({ ...f, disposalMethod: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{DISPOSAL_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Duty of Care — Carrier Details */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Duty of Care — Carrier Details</p>
                  {wasteCarriers.length > 0 && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setCarrierMode("registered")}
                        style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4, border: `1px solid ${carrierMode === "registered" ? "#1d4ed8" : "#e5e7eb"}`, background: carrierMode === "registered" ? "#eff6ff" : "#fff", color: carrierMode === "registered" ? "#1d4ed8" : "#6b7280", cursor: "pointer" }}
                      >
                        Registered carrier
                      </button>
                      <button
                        onClick={() => { setCarrierMode("manual"); setForm((f: any) => ({ ...f, carrierId: "" })); }}
                        style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4, border: `1px solid ${carrierMode === "manual" ? "#1d4ed8" : "#e5e7eb"}`, background: carrierMode === "manual" ? "#eff6ff" : "#fff", color: carrierMode === "manual" ? "#1d4ed8" : "#6b7280", cursor: "pointer" }}
                      >
                        Enter manually
                      </button>
                    </div>
                  )}
                </div>

                {carrierMode === "registered" && wasteCarriers.length > 0 ? (
                  <div className="space-y-2">
                    <div>
                      <Label>Select Waste Carrier</Label>
                      <Select value={form.carrierId?.toString() || ""} onValueChange={onCarrierSelect}>
                        <SelectTrigger><SelectValue placeholder="Choose from registered carriers..." /></SelectTrigger>
                        <SelectContent>
                          {wasteCarriers.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name}{s.accountNumber ? ` — ${s.accountNumber}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {wasteCarriers.length === 0 && (
                        <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 4 }}>
                          Add suppliers with category "Waste Carrier" to enable this picker.
                        </p>
                      )}
                    </div>
                    {form.carrierId && (
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Carrier Name (from record)</Label><Input value={form.carrierName} readOnly style={{ background: "#f9fafb" }} /></div>
                        <div><Label>EA Registration No.</Label><Input value={form.carrierLicence} onChange={e => setForm((f: any) => ({ ...f, carrierLicence: e.target.value }))} style={{ fontFamily: "monospace" }} placeholder="e.g. CBDU01234" /></div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* EA live register typeahead — used when no registered carriers or in manual mode */
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "0.75rem" }}>
                    {/* row 1 — labels */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                      <Label style={{ margin: 0 }}>Carrier Company Name</Label>
                      <span style={{ fontSize: "0.68rem", color: "#0284c7", fontWeight: 500 }}>🔍 Live EA Register</span>
                    </div>
                    <Label style={{ display: "block", marginBottom: 4 }}>EA Registration No.</Label>
                    {/* row 2 — inputs */}
                    <div>
                      <div style={{ position: "relative" }}>
                        <Input
                          value={carrierQuery}
                          onChange={e => {
                            setCarrierQuery(e.target.value);
                            setForm((f: any) => ({ ...f, carrierName: e.target.value }));
                            setCarrierDropOpen(true);
                          }}
                          onFocus={() => { if (carrierResults.length > 0) setCarrierDropOpen(true); }}
                          onBlur={() => setTimeout(() => setCarrierDropOpen(false), 150)}
                          placeholder="Type to search EA Waste Carrier Register…"
                        />
                        {carrierLoading && (
                          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.75rem" }}>searching…</span>
                        )}
                        {carrierDropOpen && carrierQuery.length >= 3 && !carrierLoading && (
                          <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 1000, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.13)", overflow: "hidden", maxHeight: 230, overflowY: "auto" }}>
                            {carrierResults.length === 0 ? (
                              <div style={{ padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#6b7280" }}>No carriers found — enter details manually below</div>
                            ) : carrierResults.map((c: any, i: number) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={() => {
                                  const regType = c.tier === "upper" ? "Upper Tier Carrier" : c.tier === "lower" ? "Lower Tier Carrier" : (c.type || "");
                                  setForm((f: any) => ({ ...f, carrierName: c.name, carrierLicence: c.regNumber, carrierRegistrationType: regType }));
                                  setCarrierQuery(c.name);
                                  setCarrierDropOpen(false);
                                }}
                                style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.875rem", background: "none", border: "none", cursor: "pointer", borderBottom: i < carrierResults.length - 1 ? "1px solid #f3f4f6" : "none" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                              >
                                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{c.name}</div>
                                <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 1 }}>
                                  {c.regNumber && <span style={{ fontFamily: "monospace", color: "#0284c7", marginRight: 8 }}>{c.regNumber}</span>}
                                  {c.tier && <span>{c.tier === "upper" ? "Upper tier" : c.tier === "lower" ? "Lower tier" : c.tier} carrier</span>}
                                  {c.address && <span style={{ marginLeft: 6 }}>· {c.address}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: "0.68rem", color: "#9ca3af", marginTop: 3 }}>England · EA Waste Carrier, Broker & Dealer Register</p>
                    </div>
                    <div>
                      <Input
                        placeholder="e.g. CBDU01234"
                        value={form.carrierLicence}
                        onChange={e => setForm((f: any) => ({ ...f, carrierLicence: e.target.value }))}
                        style={{ fontFamily: "monospace", background: form.carrierLicence && form.carrierName === carrierQuery ? "#f0f9ff" : undefined }}
                      />
                      {form.carrierLicence && form.carrierName === carrierQuery && carrierQuery.length > 0 && (
                        <p style={{ fontSize: "0.68rem", color: "#0284c7", marginTop: 3 }}>✓ Auto-filled from EA register</p>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "0.75rem" }}>
                  <Label>Carrier Registration Type</Label>
                  <Select value={form.carrierRegistrationType} onValueChange={v => setForm((f: any) => ({ ...f, carrierRegistrationType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{CARRIER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "0.75rem" }}>
                {/* row 1 — labels */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                  <Label style={{ margin: 0 }}>Destination / Permitted Site</Label>
                  <span style={{ fontSize: "0.68rem", color: "#0284c7", fontWeight: 500 }}>🔍 EA Register</span>
                </div>
                <Label style={{ display: "block", marginBottom: 4 }}>Waste Transfer Note No.</Label>
                {/* row 2 — inputs */}
                <div>
                  <div style={{ position: "relative" }}>
                    <Input
                      value={siteQuery}
                      onChange={e => {
                        setSiteQuery(e.target.value);
                        setForm((f: any) => ({ ...f, destinationSite: e.target.value }));
                        setSiteDropOpen(true);
                      }}
                      onFocus={() => { if (siteResults.length > 0) setSiteDropOpen(true); }}
                      onBlur={() => setTimeout(() => setSiteDropOpen(false), 150)}
                      placeholder="Type to search permitted waste sites…"
                    />
                    {siteLoading && (
                      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.75rem" }}>searching…</span>
                    )}
                    {siteDropOpen && siteQuery.length >= 3 && !siteLoading && (
                      <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 1000, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.13)", overflow: "hidden", maxHeight: 230, overflowY: "auto" }}>
                        {siteResults.length === 0 ? (
                          <div style={{ padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#6b7280" }}>No permitted sites found — enter site name manually</div>
                        ) : siteResults.map((s: any, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={() => {
                              const parts = [s.siteName, s.postcode].filter(Boolean);
                              const full = s.permitNumber ? `${parts.join(", ")} — Permit: ${s.permitNumber}` : parts.join(", ");
                              setForm((f: any) => ({ ...f, destinationSite: full }));
                              setSiteQuery(full);
                              setSiteDropOpen(false);
                            }}
                            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.875rem", background: "none", border: "none", cursor: "pointer", borderBottom: i < siteResults.length - 1 ? "1px solid #f3f4f6" : "none" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                          >
                            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{s.siteName}</div>
                            <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 1 }}>
                              {s.permitNumber && <span style={{ fontFamily: "monospace", color: "#0284c7", marginRight: 8 }}>{s.permitNumber}</span>}
                              {s.postcode && <span>{s.postcode}</span>}
                              {s.operator && s.operator !== s.siteName && <span style={{ marginLeft: 6 }}>· {s.operator}</span>}
                              {s.siteType && <span style={{ marginLeft: 6, color: "#9ca3af" }}>· {s.siteType}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af", marginTop: 3 }}>England · EA Waste Operations Permitted Sites Register</p>
                </div>
                <div>
                  <Input placeholder="e.g. WTN-2025-001" value={form.wasteTransferNote} onChange={e => setForm((f: any) => ({ ...f, wasteTransferNote: e.target.value }))} style={{ fontFamily: "monospace" }} />
                </div>
              </div>
              <div><Label>Notes</Label><Textarea placeholder="Additional information, collection reference, driver details..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>

              {/* ─── Receipt / WTN scan attachment ─── */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  Carrier Receipt / WTN Scan
                </p>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                  Attach a photo or scan of the paper Waste Transfer Note or carrier receipt handed over at collection.
                </p>

                {/* Existing attachment on the record */}
                {form.receiptPhotoPath && !selectedFile && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, marginBottom: "0.5rem" }}>
                    <Paperclip size={14} color="#16a34a" />
                    <span style={{ fontSize: "0.8rem", color: "#166534", flex: 1 }}>Receipt already attached</span>
                    <a
                      href={viewAttachmentUrl(form.receiptPhotoPath)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "0.75rem", color: "#1d4ed8", display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <ExternalLink size={12} /> View
                    </a>
                    <button
                      onClick={() => setForm((f: any) => ({ ...f, receiptPhotoPath: null }))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* New file selected */}
                {selectedFile && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0.75rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, marginBottom: "0.5rem" }}>
                    <Paperclip size={14} color="#1d4ed8" />
                    <span style={{ fontSize: "0.8rem", color: "#1e40af", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</span>
                    <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{(selectedFile.size / 1024).toFixed(0)} KB</span>
                    <button
                      onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Upload button */}
                {!selectedFile && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      onChange={e => {
                        const f = e.target.files?.[0] ?? null;
                        setSelectedFile(f);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}
                    >
                      <Upload size={13} />
                      {form.receiptPhotoPath ? "Replace receipt" : "Attach photo / PDF"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); setSelectedFile(null); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.disposalDate || !form.wasteType || !form.disposalMethod || saveMut.isPending || uploading}>
                {uploading ? "Uploading…" : saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Record"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Print Report Dialog ───────────────────────── */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent style={{ maxWidth: 900, maxHeight: "90vh", overflow: "auto" }}>
            <DialogHeader>
              <DialogTitle>Duty of Care Register — Print Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div><Label>Date from</Label><Input type="date" value={reportFrom} onChange={e => setReportFrom(e.target.value)} style={{ width: 160 }} /></div>
                <div><Label>Date to</Label><Input type="date" value={reportTo} onChange={e => setReportTo(e.target.value)} style={{ width: 160 }} /></div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", paddingBottom: 6 }}>
                  {reportRecords.length} record{reportRecords.length !== 1 ? "s" : ""} in this period
                </div>
              </div>

              {/* Print Preview */}
              <div ref={printRef} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1.5rem", background: "#fff", fontSize: "0.8rem" }}>
                <h1 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>Waste Disposal — Duty of Care Register</h1>
                {farmRecord && (
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827", marginBottom: 2 }}>
                    {farmRecord.name}{farmRecord.cphNumber ? ` · CPH: ${farmRecord.cphNumber}` : ""}{farmRecord.redTractorId ? ` · Red Tractor ID: ${farmRecord.redTractorId}` : ""}
                  </div>
                )}
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 12 }}>
                  Period: {fmtFull(reportFrom)} to {fmtFull(reportTo)} &nbsp;·&nbsp; Printed: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  {[
                    { label: "Total Movements", value: reportRecords.length },
                    { label: "Hazardous Loads", value: hazardCount },
                    { label: "WTNs Recorded", value: wtnCount },
                    { label: "Unique Carriers", value: uniqueCarriers },
                  ].map(s => (
                    <div key={s.label} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem" }}>
                      <div style={{ fontSize: "0.65rem", color: "#9ca3af", textTransform: "uppercase" }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {reportRecords.length === 0 ? (
                  <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No records in this date range.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        {["Date", "Waste Type", "EWC Code", "Quantity", "Disposal Method", "Carrier Company", "EA Reg. No.", "Carrier Type", "Destination Site", "WTN Ref.", "Receipt"].map(h => (
                          <th key={h} style={{ border: "1px solid #d1d5db", padding: "4px 6px", textAlign: "left", fontWeight: 600, fontSize: "0.68rem" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportRecords.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px", whiteSpace: "nowrap" }}>{fmt(r.disposalDate)}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px" }}>{r.wasteType || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px", fontFamily: "monospace", color: r.ewcCode?.includes("*") ? "#991b1b" : "#374151", fontWeight: r.ewcCode?.includes("*") ? 600 : "normal" }}>{r.ewcCode || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px" }}>{r.quantity || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px" }}>{r.disposalMethod || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px", fontWeight: 500 }}>{r.carrierName || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px", fontFamily: "monospace", fontSize: "0.65rem" }}>{r.carrierLicence || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px" }}>{r.carrierRegistrationType || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px" }}>{r.destinationSite || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px", fontFamily: "monospace", fontSize: "0.65rem" }}>{r.wasteTransferNote || "—"}</td>
                          <td style={{ border: "1px solid #e5e7eb", padding: "4px 6px", textAlign: "center", color: r.receiptPhotoPath ? "#166534" : "#9ca3af" }}>{r.receiptPhotoPath ? "Yes" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div style={{ marginTop: 24, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                  <p style={{ fontSize: "0.7rem", color: "#6b7280", marginBottom: 16 }}>
                    This register is produced in accordance with the Environmental Protection Act 1990 (Duty of Care) and the Waste (England and Wales) Regulations 2011.
                    Records must be retained for a minimum of 2 years (3 years for hazardous waste consignments marked *). This document should be made available to the Environment Agency, Red Tractor assessors, or other authorised inspecting bodies on request.
                  </p>
                  <div style={{ display: "flex", gap: 48, marginTop: 8 }}>
                    {[{ label: "Farm Manager / Responsible Person", sub: "Name (print):" }, { label: "Signature", sub: "" }, { label: "Date" , sub: "" }].map(s => (
                      <div key={s.label} style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.7rem", color: "#374151" }}>{s.label}</p>
                        {s.sub && <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }}>{s.sub}</p>}
                        <div style={{ borderBottom: "1px solid #374151", marginTop: 24 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportOpen(false)}>Close</Button>
              <Button onClick={handlePrint} disabled={reportRecords.length === 0}>
                <Printer size={14} className="mr-1" />
                Print / Save as PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Delete Dialog ─────────────────────────────── */}
        <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent style={{ maxWidth: 400 }}>
            <DialogHeader><DialogTitle>Delete Waste Record</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this waste disposal record?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
