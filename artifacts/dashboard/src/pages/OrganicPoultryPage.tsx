import { useState } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Bird, CheckCircle2, Clock, FileText, Info, Leaf, Plus, Printer } from "lucide-react";

type Certification = {
  id: number;
  certifyingBody: string;
  certificateNumber: string | null;
  certificateType: string;
  issueDate: string | null;
  expiryDate: string | null;
  scope: string | null;
  status: string;
  notes: string | null;
};

type AccessRecord = {
  id: number;
  recordDate: string;
  flockRef: string | null;
  houseOrLocation: string | null;
  birdsInFlock: number | null;
  birdsAccessedRange: number | null;
  rangeAreaHa: string | null;
  birdsPerHa: string | null;
  accessDurationHours: string | null;
  vegetationCondition: string | null;
  accessBlocked: boolean;
  accessBlockReason: string | null;
  complianceStatus: string;
  notes: string | null;
};

type FeedRecord = {
  id: number;
  deliveryDate: string;
  productName: string;
  productType: string | null;
  organicApprovalStatus: string;
  certifierApprovalReference: string | null;
  quantityKg: string | null;
  supplierName: string | null;
  supplierLotNumber: string | null;
  invoiceReference: string | null;
  flock: string | null;
  notes: string | null;
};

type Derogation = {
  id: number;
  caseReference: string | null;
  inputName: string;
  inputType: string | null;
  regulatoryBasis: string | null;
  certifyingBody: string | null;
  applicationDate: string | null;
  justification: string | null;
  status: string;
  decisionDate: string | null;
  expiryDate: string | null;
  approvalConditions: string | null;
  notes: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  suspended: "bg-amber-100 text-amber-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const CERT_TYPES = ["laying_hens", "broilers", "turkeys", "ducks", "geese", "mixed_poultry"];
const APPROVAL_STATUSES = ["certified_organic", "approved_non_organic", "conventional_derogation"];

export default function OrganicPoultryPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = usePersistedTab<"certification" | "access" | "feed" | "derogations">({ page: "organic-poultry", farmId, validIds: ["certification", "access", "feed", "derogations"], defaultTab: "certification" });

  const [certOpen, setCertOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [certForm, setCertForm] = useState<any>({ certificateType: "laying_hens", status: "active" });

  const [accessOpen, setAccessOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessRecord | null>(null);
  const [accessForm, setAccessForm] = useState<any>({
    recordDate: new Date().toISOString().slice(0, 10),
    accessBlocked: false,
    complianceStatus: "compliant",
  });

  const [feedOpen, setFeedOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedRecord | null>(null);
  const [feedForm, setFeedForm] = useState<any>({
    deliveryDate: new Date().toISOString().slice(0, 10),
    organicApprovalStatus: "certified_organic",
  });

  const [derogOpen, setDerogOpen] = useState(false);
  const [editingDerog, setEditingDerog] = useState<Derogation | null>(null);
  const [derogForm, setDerogForm] = useState<any>({ status: "pending" });

  const certQ = useQuery<Certification[]>({
    queryKey: ["farms", farmId, "organic-poultry-certifications"],
    queryFn: () => api.get(`/farms/${farmId}/organic-poultry/certification`).then(r => r.certifications ?? []),
    enabled: !!farmId,
  });

  const accessQ = useQuery<AccessRecord[]>({
    queryKey: ["farms", farmId, "organic-poultry-access"],
    queryFn: () => api.get(`/farms/${farmId}/organic-poultry/access-records`).then(r => r.records ?? []),
    enabled: !!farmId,
  });

  const feedQ = useQuery<FeedRecord[]>({
    queryKey: ["farms", farmId, "organic-poultry-feed"],
    queryFn: () => api.get(`/farms/${farmId}/organic-poultry/feed-records`).then(r => r.records ?? []),
    enabled: !!farmId,
  });

  const derogQ = useQuery<Derogation[]>({
    queryKey: ["farms", farmId, "organic-poultry-derogations"],
    queryFn: () => api.get(`/farms/${farmId}/organic-poultry/derogations`).then(r => r.derogations ?? []),
    enabled: !!farmId,
  });

  function useCrudMutation(endpoint: string, id: number | null, invalidateKey: any[], successMsg: string, closeDialog: () => void) {
    return useMutation({
      mutationFn: (body: any) =>
        id ? api.put(`${endpoint}/${id}`, body) : api.post(endpoint, body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: invalidateKey });
        toast({ title: successMsg });
        closeDialog();
      },
      onError: () => toast({ title: "Failed to save", variant: "destructive" }),
    });
  }

  const certMut = useCrudMutation(
    `/farms/${farmId}/organic-poultry/certification`,
    editingCert?.id ?? null,
    ["farms", farmId, "organic-poultry-certifications"],
    editingCert ? "Certification updated" : "Certification saved",
    () => { setCertOpen(false); setEditingCert(null); setCertForm({ certificateType: "laying_hens", status: "active" }); }
  );

  const accessMut = useCrudMutation(
    `/farms/${farmId}/organic-poultry/access-records`,
    editingAccess?.id ?? null,
    ["farms", farmId, "organic-poultry-access"],
    editingAccess ? "Access record updated" : "Access record saved",
    () => { setAccessOpen(false); setEditingAccess(null); setAccessForm({ recordDate: new Date().toISOString().slice(0, 10), accessBlocked: false, complianceStatus: "compliant" }); }
  );

  const feedMut = useCrudMutation(
    `/farms/${farmId}/organic-poultry/feed-records`,
    editingFeed?.id ?? null,
    ["farms", farmId, "organic-poultry-feed"],
    editingFeed ? "Feed record updated" : "Feed record saved",
    () => { setFeedOpen(false); setEditingFeed(null); setFeedForm({ deliveryDate: new Date().toISOString().slice(0, 10), organicApprovalStatus: "certified_organic" }); }
  );

  const derogMut = useCrudMutation(
    `/farms/${farmId}/organic-poultry/derogations`,
    editingDerog?.id ?? null,
    ["farms", farmId, "organic-poultry-derogations"],
    editingDerog ? "Derogation updated" : "Derogation submitted",
    () => { setDerogOpen(false); setEditingDerog(null); setDerogForm({ status: "pending" }); }
  );

  const certs = certQ.data ?? [];
  const accesses = accessQ.data ?? [];
  const feeds = feedQ.data ?? [];
  const derogs = derogQ.data ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const expiredCerts = certs.filter(c => c.expiryDate && c.expiryDate < today);
  const pendingDerogs = derogs.filter(d => d.status === "pending").length;

  return (
    <AppLayout title="Organic Poultry">
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>Organic Poultry</strong> — Records required under EU Regulation 2018/848 (UK equivalent) for organic poultry production: certification body records, outdoor access compliance, organic feed documentation, and derogation audit trail.
      </div>

      {expiredCerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-700 mt-0.5 shrink-0" />
          <div className="text-sm text-red-800">
            <strong>{expiredCerts.length} certification{expiredCerts.length > 1 ? "s" : ""} expired</strong> — renewal required to maintain organic status.
          </div>
        </div>
      )}

      {pendingDerogs > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>{pendingDerogs} derogation{pendingDerogs > 1 ? "s" : ""} pending</strong> — awaiting certifier decision.
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(["certification", "access", "feed", "derogations"] as const).map(t => (
            <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
              {t === "certification" ? <><Leaf className="w-3.5 h-3.5 mr-1" />Certification</>
               : t === "access" ? <><Bird className="w-3.5 h-3.5 mr-1" />Outdoor Access</>
               : t === "feed" ? "Organic Feed"
               : <><FileText className="w-3.5 h-3.5 mr-1" />Derogations ({derogs.length})</>}
            </Button>
          ))}
        </div>
        <Button onClick={() => {
          if (tab === "certification") { setEditingCert(null); setCertForm({ certificateType: "laying_hens", status: "active" }); setCertOpen(true); }
          else if (tab === "access") { setEditingAccess(null); setAccessForm({ recordDate: new Date().toISOString().slice(0, 10), accessBlocked: false, complianceStatus: "compliant" }); setAccessOpen(true); }
          else if (tab === "feed") { setEditingFeed(null); setFeedForm({ deliveryDate: new Date().toISOString().slice(0, 10), organicApprovalStatus: "certified_organic" }); setFeedOpen(true); }
          else { setEditingDerog(null); setDerogForm({ status: "pending" }); setDerogOpen(true); }
        }}>
          <Plus className="w-4 h-4 mr-1" />
          {tab === "certification" ? "Add Certification" : tab === "access" ? "Record Access" : tab === "feed" ? "Add Feed Record" : "Add Derogation"}
        </Button>
      </div>

      {tab === "certification" && (
        <>
          {certs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <Leaf className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No organic poultry certifications recorded. Add your first certification.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certs.map(c => {
                const isExpired = c.expiryDate && c.expiryDate < today;
                return (
                  <div key={c.id} className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${isExpired ? "border-red-300" : ""}`}
                    onClick={() => { setEditingCert(c); setCertForm({ ...c }); setCertOpen(true); }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.certifyingBody}</span>
                        <Badge className={`text-xs ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-600"}`}>{c.status}</Badge>
                        {isExpired && <Badge className="bg-red-100 text-red-800 text-xs">EXPIRED</Badge>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); window.print(); }}><Printer className="w-4 h-4" /></Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Type: {c.certificateType.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase())}{c.certificateNumber ? ` · No: ${c.certificateNumber}` : ""}</p>
                      {c.issueDate && <p>Issued: {c.issueDate}{c.expiryDate ? ` · Expires: ` : ""}{c.expiryDate && <span className={isExpired ? "text-red-600 font-medium" : "text-green-700"}>{c.expiryDate}</span>}</p>}
                      {c.scope && <p className="line-clamp-1">Scope: {c.scope}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "access" && (
        <>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <strong>UK Organic Poultry Standard:</strong> Birds must have continuous daytime access to outdoor range. Max stocking density: 2,500 birds/ha for meat birds; 170kg LW/ha for laying hens. Record access compliance regularly.
          </div>
          {accesses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <Bird className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No outdoor access records. Start logging daily or weekly access compliance.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {accesses.sort((a, b) => b.recordDate.localeCompare(a.recordDate)).map(a => (
                <div key={a.id} className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-sm flex items-start justify-between gap-3 ${a.complianceStatus !== "compliant" ? "border-amber-300" : ""}`}
                  onClick={() => { setEditingAccess(a); setAccessForm({ ...a }); setAccessOpen(true); }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{a.recordDate}</span>
                      {a.flockRef && <span className="text-xs text-muted-foreground">{a.flockRef}</span>}
                      <Badge className={`text-xs ${a.complianceStatus === "compliant" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                        {a.complianceStatus === "compliant" ? <><CheckCircle2 className="w-3 h-3 mr-1 inline" />Compliant</> : a.complianceStatus}
                      </Badge>
                      {a.accessBlocked && <Badge className="text-xs bg-red-100 text-red-800">Access blocked</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground space-x-3">
                      {a.birdsInFlock && <span>Flock: {a.birdsInFlock}</span>}
                      {a.birdsAccessedRange && <span>On range: {a.birdsAccessedRange}</span>}
                      {a.rangeAreaHa && <span>Range: {a.rangeAreaHa}ha</span>}
                      {a.birdsPerHa && <span>{a.birdsPerHa}/ha</span>}
                      {a.accessDurationHours && <span>{a.accessDurationHours}h access</span>}
                      {a.accessBlocked && a.accessBlockReason && <span className="text-amber-700">Reason: {a.accessBlockReason}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "feed" && (
        <>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <strong>Organic Feed Requirement:</strong> 100% organically produced feed. Synthetic amino acids, growth promoters, and GMO ingredients are prohibited. Keep all delivery invoices and certificates of conformity.
          </div>
          {feeds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <Info className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No organic feed records. Log each feed delivery with its organic certification status.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {feeds.sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate)).map(f => (
                <div key={f.id} className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-sm ${f.organicApprovalStatus !== "certified_organic" ? "border-amber-300" : ""}`}
                  onClick={() => { setEditingFeed(f); setFeedForm({ ...f }); setFeedOpen(true); }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{f.deliveryDate}</span>
                    <span className="font-medium text-sm">{f.productName}</span>
                    <Badge className={`text-xs ${f.organicApprovalStatus === "certified_organic" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                      {f.organicApprovalStatus.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-x-3">
                    {f.quantityKg && <span>{f.quantityKg}kg</span>}
                    {f.supplierName && <span>Supplier: {f.supplierName}</span>}
                    {f.certifierApprovalReference && <span>Cert ref: {f.certifierApprovalReference}</span>}
                    {f.flock && <span>Flock: {f.flock}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "derogations" && (
        <>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <strong>Derogations</strong> are certifier-approved permissions to use specific non-organic inputs (e.g. conventional feed for young stock, specific medicines). Each derogation requires a written application and certifier approval before use.
          </div>
          {derogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <FileText className="mx-auto mb-2 w-10 h-10 opacity-30" />
              <p>No derogations recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {derogs.sort((a, b) => (b.applicationDate ?? "").localeCompare(a.applicationDate ?? "")).map(d => {
                const isExpired = d.expiryDate && d.expiryDate < today;
                return (
                  <div key={d.id} className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm ${isExpired ? "border-red-300" : d.status === "pending" ? "border-amber-300" : ""}`}
                    onClick={() => { setEditingDerog(d); setDerogForm({ ...d }); setDerogOpen(true); }}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-medium">{d.inputName}</span>
                      <Badge className={`text-xs ${STATUS_BADGE[d.status] ?? "bg-gray-100 text-gray-600"} capitalize`}>{d.status}</Badge>
                      {isExpired && <Badge className="bg-red-100 text-red-800 text-xs">EXPIRED</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {d.certifyingBody && <p>Certifier: {d.certifyingBody}{d.caseReference ? ` — Ref: ${d.caseReference}` : ""}</p>}
                      {d.applicationDate && <p>Applied: {d.applicationDate}{d.decisionDate ? ` · Decision: ${d.decisionDate}` : ""}</p>}
                      {d.expiryDate && <p className={isExpired ? "text-red-600" : "text-green-700"}>Expiry: {d.expiryDate}</p>}
                      {d.justification && <p className="line-clamp-2">Justification: {d.justification}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Certification Dialog */}
      <Dialog open={certOpen} onOpenChange={o => { setCertOpen(o); if (!o) { setEditingCert(null); setCertForm({ certificateType: "laying_hens", status: "active" }); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCert ? "Edit Certification" : "Add Organic Poultry Certification"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); certMut.mutate(certForm); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Certifying Body *</Label><Input value={certForm.certifyingBody ?? ""} onChange={e => setCertForm((p: any) => ({ ...p, certifyingBody: e.target.value }))} required placeholder="e.g. Soil Association, OF&G, Organic Farmers & Growers" /></div>
              <div><Label>Certificate Number</Label><Input value={certForm.certificateNumber ?? ""} onChange={e => setCertForm((p: any) => ({ ...p, certificateNumber: e.target.value }))} /></div>
              <div>
                <Label>Certificate Type</Label>
                <Select value={certForm.certificateType ?? "laying_hens"} onValueChange={v => setCertForm((p: any) => ({ ...p, certificateType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CERT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase())}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Issue Date</Label><Input type="date" value={certForm.issueDate ?? ""} onChange={e => setCertForm((p: any) => ({ ...p, issueDate: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={certForm.expiryDate ?? ""} onChange={e => setCertForm((p: any) => ({ ...p, expiryDate: e.target.value }))} /></div>
              <div>
                <Label>Status</Label>
                <Select value={certForm.status ?? "active"} onValueChange={v => setCertForm((p: any) => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["active","expired","suspended"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Scope (livestock types / units covered)</Label><Input value={certForm.scope ?? ""} onChange={e => setCertForm((p: any) => ({ ...p, scope: e.target.value }))} placeholder="e.g. Layer flocks, Houses A & B" /></div>
            <div><Label>Notes</Label><Textarea value={certForm.notes ?? ""} onChange={e => setCertForm((p: any) => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setCertOpen(false)}>Cancel</Button><Button type="submit" disabled={certMut.isPending}>{certMut.isPending ? "Saving…" : "Save"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Access Record Dialog */}
      <Dialog open={accessOpen} onOpenChange={o => { setAccessOpen(o); if (!o) { setEditingAccess(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingAccess ? "Edit Access Record" : "Record Outdoor Access"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); accessMut.mutate({ ...accessForm, birdsInFlock: accessForm.birdsInFlock ? Number(accessForm.birdsInFlock) : null, birdsAccessedRange: accessForm.birdsAccessedRange ? Number(accessForm.birdsAccessedRange) : null, accessBlocked: Boolean(accessForm.accessBlocked) }); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={accessForm.recordDate ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, recordDate: e.target.value }))} required /></div>
              <div><Label>Flock / House Ref</Label><Input value={accessForm.flockRef ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, flockRef: e.target.value }))} /></div>
              <div><Label>Birds in Flock</Label><Input type="number" min="0" value={accessForm.birdsInFlock ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, birdsInFlock: e.target.value }))} /></div>
              <div><Label>Birds on Range</Label><Input type="number" min="0" value={accessForm.birdsAccessedRange ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, birdsAccessedRange: e.target.value }))} /></div>
              <div><Label>Range Area (ha)</Label><Input type="number" step="0.01" min="0" value={accessForm.rangeAreaHa ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, rangeAreaHa: e.target.value }))} /></div>
              <div><Label>Access Duration (hours)</Label><Input type="number" step="0.5" min="0" value={accessForm.accessDurationHours ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, accessDurationHours: e.target.value }))} /></div>
              <div>
                <Label>Compliance Status</Label>
                <Select value={accessForm.complianceStatus ?? "compliant"} onValueChange={v => setAccessForm((p: any) => ({ ...p, complianceStatus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non_compliant">Non-compliant</SelectItem>
                    <SelectItem value="partially_compliant">Partially compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Vegetation Condition</Label><Input value={accessForm.vegetationCondition ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, vegetationCondition: e.target.value }))} placeholder="Good / Poor / Bare" /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="accessBlocked" checked={Boolean(accessForm.accessBlocked)} onChange={e => setAccessForm((p: any) => ({ ...p, accessBlocked: e.target.checked }))} />
              <Label htmlFor="accessBlocked">Outdoor access blocked today (disease control, weather)</Label>
            </div>
            {accessForm.accessBlocked && (
              <div><Label>Reason Access Blocked</Label><Input value={accessForm.accessBlockReason ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, accessBlockReason: e.target.value }))} placeholder="e.g. Avian influenza prevention zone" /></div>
            )}
            <div><Label>Notes</Label><Textarea value={accessForm.notes ?? ""} onChange={e => setAccessForm((p: any) => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setAccessOpen(false)}>Cancel</Button><Button type="submit" disabled={accessMut.isPending}>{accessMut.isPending ? "Saving…" : "Save"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feed Record Dialog */}
      <Dialog open={feedOpen} onOpenChange={o => { setFeedOpen(o); if (!o) { setEditingFeed(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingFeed ? "Edit Feed Record" : "Add Organic Feed Delivery"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); feedMut.mutate({ ...feedForm, quantityKg: feedForm.quantityKg ? String(feedForm.quantityKg) : null }); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Delivery Date *</Label><Input type="date" value={feedForm.deliveryDate ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, deliveryDate: e.target.value }))} required /></div>
              <div><Label>Product Name *</Label><Input value={feedForm.productName ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, productName: e.target.value }))} required placeholder="e.g. Organic Layer Mash" /></div>
              <div><Label>Product Type</Label><Input value={feedForm.productType ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, productType: e.target.value }))} placeholder="e.g. mash, pellets, grain" /></div>
              <div>
                <Label>Organic Approval Status</Label>
                <Select value={feedForm.organicApprovalStatus ?? "certified_organic"} onValueChange={v => setFeedForm((p: any) => ({ ...p, organicApprovalStatus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{APPROVAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity (kg)</Label><Input type="number" step="0.01" min="0" value={feedForm.quantityKg ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, quantityKg: e.target.value }))} /></div>
              <div><Label>Supplier Name</Label><Input value={feedForm.supplierName ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, supplierName: e.target.value }))} /></div>
              <div><Label>Lot / Batch Number</Label><Input value={feedForm.supplierLotNumber ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, supplierLotNumber: e.target.value }))} /></div>
              <div><Label>Invoice Reference</Label><Input value={feedForm.invoiceReference ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, invoiceReference: e.target.value }))} /></div>
              <div><Label>Certifier Approval Ref</Label><Input value={feedForm.certifierApprovalReference ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, certifierApprovalReference: e.target.value }))} /></div>
              <div><Label>Flock / House</Label><Input value={feedForm.flock ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, flock: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={feedForm.notes ?? ""} onChange={e => setFeedForm((p: any) => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setFeedOpen(false)}>Cancel</Button><Button type="submit" disabled={feedMut.isPending}>{feedMut.isPending ? "Saving…" : "Save"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Derogation Dialog */}
      <Dialog open={derogOpen} onOpenChange={o => { setDerogOpen(o); if (!o) { setEditingDerog(null); setDerogForm({ status: "pending" }); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingDerog ? "Edit Derogation" : "Add Derogation"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); derogMut.mutate(derogForm); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Input Name *</Label><Input value={derogForm.inputName ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, inputName: e.target.value }))} required placeholder="e.g. Conventional chick feed, Conventional litter" /></div>
              <div><Label>Input Type</Label><Input value={derogForm.inputType ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, inputType: e.target.value }))} placeholder="feed / medicine / bedding" /></div>
              <div><Label>Case Reference</Label><Input value={derogForm.caseReference ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, caseReference: e.target.value }))} /></div>
              <div><Label>Certifying Body</Label><Input value={derogForm.certifyingBody ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, certifyingBody: e.target.value }))} /></div>
              <div>
                <Label>Status</Label>
                <Select value={derogForm.status ?? "pending"} onValueChange={v => setDerogForm((p: any) => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["pending","approved","rejected"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Application Date</Label><Input type="date" value={derogForm.applicationDate ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, applicationDate: e.target.value }))} /></div>
              <div><Label>Decision Date</Label><Input type="date" value={derogForm.decisionDate ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, decisionDate: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={derogForm.expiryDate ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, expiryDate: e.target.value }))} /></div>
            </div>
            <div><Label>Justification</Label><Textarea value={derogForm.justification ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, justification: e.target.value }))} rows={3} /></div>
            {derogForm.status === "approved" && (
              <div><Label>Approval Conditions</Label><Textarea value={derogForm.approvalConditions ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, approvalConditions: e.target.value }))} rows={2} /></div>
            )}
            <div><Label>Notes</Label><Textarea value={derogForm.notes ?? ""} onChange={e => setDerogForm((p: any) => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDerogOpen(false)}>Cancel</Button><Button type="submit" disabled={derogMut.isPending}>{derogMut.isPending ? "Saving…" : "Save"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
