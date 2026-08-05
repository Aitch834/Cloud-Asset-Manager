import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Redirect } from "wouter";
import { useUpload } from "@workspace/object-storage-web";
import {
  Plus, Printer, AlertTriangle, Loader2, Pencil, Trash2, CheckCircle2, XCircle,
  ShieldCheck, Upload, ChevronDown, ChevronUp, UserPlus, FileText, Phone, Mail,
  MapPin, Link2, Building2, Users, ClipboardList, CalendarDays, BadgeCheck,
  CheckCheck, ClipboardCheck, Clock, Send,
} from "lucide-react";
import { printProReport } from "@/lib/print-report";
import { cn } from "@/lib/utils";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

interface ContractorContact {
  id: number;
  contractorId: number;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
  notes: string | null;
}

interface ContractorRams {
  id: number;
  contractorId: number;
  activityDescription: string;
  documentUrl: string | null;
  documentName: string | null;
  receivedDate: string | null;
  reviewedBy: string | null;
  reviewDate: string | null;
  notes: string | null;
  pendingReviewTaskId: number | null;
  pendingReviewTaskStaffName: string | null;
}

interface Contractor {
  id: number;
  farmId: number;
  companyName: string;
  tradeType: string;
  address: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  supplierId: number | null;
  pliNumber: string | null;
  pliInsurer: string | null;
  pliCoverAmountGbp: string | null;
  pliExpiryDate: string | null;
  pliDocumentUrl: string | null;
  pliDocumentName: string | null;
  firstOnSiteDate: string | null;
  lastOnSiteDate: string | null;
  notes: string | null;
  isActive: boolean;
  contacts: ContractorContact[];
  rams: ContractorRams[];
}

interface Supplier { id: number; name: string; }

const EMPTY_FORM = {
  companyName: "", tradeType: "general", address: null as string | null,
  contactName: null as string | null, phone: null as string | null, email: null as string | null,
  supplierId: null as number | null,
  pliNumber: null as string | null, pliInsurer: null as string | null,
  pliCoverAmountGbp: null as string | null, pliExpiryDate: null as string | null,
  pliDocumentUrl: null as string | null, pliDocumentName: null as string | null,
  firstOnSiteDate: null as string | null, lastOnSiteDate: null as string | null,
  notes: null as string | null, isActive: true,
};

const EMPTY_CONTACT = { name: "", role: null as string | null, phone: null as string | null, email: null as string | null, isPrimary: false, notes: null as string | null };
const EMPTY_RAMS = { activityDescription: "", documentUrl: null as string | null, documentName: null as string | null, receivedDate: null as string | null, notes: null as string | null };

const TRADE_TYPES: Record<string, string> = {
  "general": "General Building / Maintenance",
  "electrical": "Electrical",
  "plumbing": "Plumbing / Heating",
  "roofing": "Roofing",
  "groundworks": "Groundworks / Drainage",
  "agri-contractor": "Agricultural Contractor",
  "machinery-dealer": "Machinery Dealer / Engineer",
  "haulier": "Haulage / Transport",
  "pest-control": "Pest Control",
  "tree-surgeon": "Tree Surgeon / Arborist",
  "cleaning": "Cleaning / Hygiene",
  "security": "Security / CCTV",
  "it-telecoms": "IT / Telecoms",
  "fuel-delivery": "Fuel / LPG Delivery",
  "waste-removal": "Waste Removal",
  "other": "Other",
};

function isPliExpiringSoon(d: string | null) {
  if (!d) return false;
  const diff = (new Date(d).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= 60;
}
function isPliExpired(d: string | null) {
  return d ? new Date(d) < new Date() : false;
}

// ─── PLI Upload widget ───────────────────────────────────────────────────────
function PliUploadWidget({ documentUrl, documentName, onChange }: {
  documentUrl: string | null;
  documentName: string | null;
  onChange: (url: string, name: string) => void;
}) {
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (r: unknown) => {
      const resp = r as { objectPath?: string; filename?: string; publicUrl?: string };
      const url = resp.publicUrl ?? resp.objectPath ?? "";
      const name = resp.filename ?? url.split("/").pop() ?? "Certificate";
      onChange(url, name);
    },
  });
  return (
    <div className="space-y-2">
      <label className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-sm",
        isUploading ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
      )}>
        {isUploading ? (
          <><Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" /><span className="text-muted-foreground">Uploading… {progress ?? 0}%</span></>
        ) : (
          <><Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" /><span className="text-muted-foreground">{documentName ?? "Upload PLI certificate (PDF, JPG, PNG)"}</span></>
        )}
        <input type="file" accept="image/*,application/pdf" className="hidden" disabled={isUploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
      </label>
      {documentUrl && documentName && (
        <div className="flex items-center gap-2 text-xs text-primary">
          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
          <a href={documentUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 truncate">{documentName}</a>
        </div>
      )}
    </div>
  );
}

// ─── RAMS Upload widget ──────────────────────────────────────────────────────
function RamsUploadWidget({ documentUrl, documentName, onChange }: {
  documentUrl: string | null;
  documentName: string | null;
  onChange: (url: string, name: string) => void;
}) {
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (r: unknown) => {
      const resp = r as { objectPath?: string; filename?: string; publicUrl?: string };
      const url = resp.publicUrl ?? resp.objectPath ?? "";
      const name = resp.filename ?? url.split("/").pop() ?? "RAMS Document";
      onChange(url, name);
    },
  });
  return (
    <div className="space-y-1">
      <label className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-xs",
        isUploading ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
      )}>
        {isUploading ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin text-primary flex-shrink-0" /><span className="text-muted-foreground">Uploading… {progress ?? 0}%</span></>
        ) : (
          <><Upload className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /><span className="text-muted-foreground">{documentName ?? "Attach RAMS document (PDF, DOC, JPG)"}</span></>
        )}
        <input type="file" accept="image/*,application/pdf,.doc,.docx" className="hidden" disabled={isUploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
      </label>
      {documentUrl && documentName && (
        <div className="flex items-center gap-1.5 text-xs text-primary pl-1">
          <FileText className="h-3 w-3 flex-shrink-0" />
          <a href={documentUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 truncate">{documentName}</a>
        </div>
      )}
    </div>
  );
}

// ─── Expanded card section ───────────────────────────────────────────────────
function ExpandedContractorSection({ contractor, farmId, targetRamsId }: { contractor: Contractor; farmId: number; targetRamsId?: number | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/contractors/${contractor.id}`;

  const hasTargetRams = targetRamsId != null && contractor.rams.some(r => r.id === targetRamsId);
  const [activeTab, setActiveTab] = useState<"contacts" | "rams">(hasTargetRams ? "rams" : "contacts");

  // Deep link from Task Board: scroll to and temporarily highlight the target RAMS entry.
  const [highlightRamsId, setHighlightRamsId] = useState<number | null>(null);
  const scrolledToRams = useRef(false);
  useEffect(() => {
    if (!hasTargetRams || scrolledToRams.current) return;
    scrolledToRams.current = true;
    setHighlightRamsId(targetRamsId!);
    setTimeout(() => {
      document.getElementById(`rams-entry-${targetRamsId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    const t = setTimeout(() => setHighlightRamsId(null), 4000);
    return () => clearTimeout(t);
  }, [hasTargetRams, targetRamsId]);

  // ── Contacts ──
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ContractorContact | null>(null);
  const [contactForm, setContactForm] = useState({ ...EMPTY_CONTACT });
  const setCF = (k: string, v: unknown) => setContactForm(f => ({ ...f, [k]: v }));

  const addContactMut = useMutation({
    mutationFn: (b: typeof EMPTY_CONTACT) => fetch(`${base}/contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }); setShowContactForm(false); setContactForm({ ...EMPTY_CONTACT }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateContactMut = useMutation({
    mutationFn: (b: typeof EMPTY_CONTACT & { id: number }) => fetch(`${base}/contacts/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }); setEditingContact(null); setShowContactForm(false); setContactForm({ ...EMPTY_CONTACT }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteContactMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/contacts/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // ── RAMS ──
  const [showRamsForm, setShowRamsForm] = useState(false);
  const [editingRams, setEditingRams] = useState<ContractorRams | null>(null);
  const [ramsForm, setRamsForm] = useState({ ...EMPTY_RAMS });
  const setRF = (k: string, v: unknown) => setRamsForm(f => ({ ...f, [k]: v }));

  // Assign-for-review dialog state
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; ramsId: number; activity: string } | null>(null);
  const [assignMemberId, setAssignMemberId] = useState<string>("");
  const [assignDueDate, setAssignDueDate] = useState<string>("");
  const [assignNote, setAssignNote] = useState<string>("");

  // Fetch farm members for the assign dialog
  const { data: membersData } = useQuery<{ id: number; firstName: string; lastName: string; isActive: boolean }[]>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()),
    select: (d: any) => (d.members ?? d ?? []).filter((m: any) => m.isActive !== false),
  });

  const addRamsMut = useMutation({
    mutationFn: (b: typeof EMPTY_RAMS) => fetch(`${base}/rams`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }); setShowRamsForm(false); setRamsForm({ ...EMPTY_RAMS }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateRamsMut = useMutation({
    mutationFn: (b: typeof EMPTY_RAMS & { id: number }) => fetch(`${base}/rams/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }); setEditingRams(null); setShowRamsForm(false); setRamsForm({ ...EMPTY_RAMS }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteRamsMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/rams/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  const markReviewedMut = useMutation({
    mutationFn: (ramsId: number) => fetch(`${base}/rams/${ramsId}/review`, { method: "PATCH" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }),
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });
  const raiseTaskMut = useMutation({
    mutationFn: ({ ramsId, body }: { ramsId: number; body: object }) =>
      fetch(`${base}/rams/${ramsId}/review-task`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] });
      setAssignDialog(null);
      setAssignMemberId(""); setAssignDueDate(""); setAssignNote("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const { contacts, rams } = contractor;

  return (
    <div className="border-t border-border mt-0 px-5 pt-4 pb-5 bg-muted/20">
      {/* Tab row */}
      <div className="flex gap-1 mb-4">
        <button onClick={() => setActiveTab("contacts")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors", activeTab === "contacts" ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-muted")}>
          <Users className="h-3.5 w-3.5" />Contacts ({contacts.length})
        </button>
        <button onClick={() => setActiveTab("rams")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors", activeTab === "rams" ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-muted")}>
          <ClipboardList className="h-3.5 w-3.5" />RAMS ({rams.length})
        </button>
      </div>

      {/* Contacts tab */}
      {activeTab === "contacts" && (
        <div className="space-y-3">
          {contacts.length === 0 && !showContactForm && (
            <p className="text-xs text-muted-foreground italic">No contacts recorded yet.</p>
          )}
          {contacts.map(c => (
            <div key={c.id} className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-border">
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  {c.isPrimary && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Primary</span>}
                  {c.role && <span className="text-xs text-muted-foreground">{c.role}</span>}
                </div>
                {c.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{c.phone}</div>}
                {c.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{c.email}</div>}
                {c.notes && <p className="text-xs text-muted-foreground italic mt-1">{c.notes}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingContact(c); setContactForm({ name: c.name, role: c.role, phone: c.phone, email: c.email, isPrimary: c.isPrimary, notes: c.notes }); setShowContactForm(true); }}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteContactMut.mutate(c.id)} disabled={deleteContactMut.isPending}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
          {showContactForm ? (
            <div className="p-4 bg-white rounded-lg border border-primary/30 space-y-3">
              <p className="text-xs font-semibold text-foreground/70">{editingContact ? "Edit Contact" : "Add Contact"}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label className="text-xs">Full Name *</Label><Input value={contactForm.name} onChange={e => setCF("name", e.target.value)} placeholder="e.g. Jane Smith" className="h-8 text-sm" /></div>
                <div><Label className="text-xs">Role / Position</Label><Input value={contactForm.role ?? ""} onChange={e => setCF("role", e.target.value || null)} placeholder="e.g. H&S Contact" className="h-8 text-sm" /></div>
                <div><Label className="text-xs">Phone</Label><Input type="tel" value={contactForm.phone ?? ""} onChange={e => setCF("phone", e.target.value || null)} className="h-8 text-sm" /></div>
                <div className="col-span-2"><Label className="text-xs">Email</Label><Input type="email" value={contactForm.email ?? ""} onChange={e => setCF("email", e.target.value || null)} className="h-8 text-sm" /></div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id={`primary-${contractor.id}`} checked={contactForm.isPrimary} onChange={e => setCF("isPrimary", e.target.checked)} className="h-4 w-4" />
                  <Label htmlFor={`primary-${contractor.id}`} className="text-xs font-normal">Primary contact</Label>
                </div>
                <div className="col-span-2"><Label className="text-xs">Notes</Label><Input value={contactForm.notes ?? ""} onChange={e => setCF("notes", e.target.value || null)} className="h-8 text-sm" /></div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" size="sm" onClick={() => { setShowContactForm(false); setEditingContact(null); setContactForm({ ...EMPTY_CONTACT }); }}>Cancel</Button>
                <Button size="sm" disabled={!contactForm.name || addContactMut.isPending || updateContactMut.isPending}
                  onClick={() => editingContact ? updateContactMut.mutate({ ...contactForm, id: editingContact.id }) : addContactMut.mutate(contactForm)}>
                  {(addContactMut.isPending || updateContactMut.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  {editingContact ? "Update" : "Add Contact"}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setEditingContact(null); setContactForm({ ...EMPTY_CONTACT }); setShowContactForm(true); }}>
              <UserPlus className="h-3.5 w-3.5" />Add Contact
            </Button>
          )}
        </div>
      )}

      {/* RAMS tab */}
      {activeTab === "rams" && (
        <div className="space-y-3">
          {rams.length === 0 && !showRamsForm && (
            <p className="text-xs text-muted-foreground italic">No RAMS recorded yet. Add one for each activity this contractor performs on site.</p>
          )}
          {rams.map(r => {
            const isReviewed = !!(r.reviewDate && r.reviewedBy);
            const hasPendingTask = !!(r.pendingReviewTaskId && r.pendingReviewTaskStaffName);
            return (
              <div key={r.id} id={`rams-entry-${r.id}`} className={cn("p-3 bg-white rounded-lg border space-y-2 transition-all", isReviewed ? "border-green-200" : hasPendingTask ? "border-amber-200" : "border-border", highlightRamsId === r.id && "ring-2 ring-indigo-300 bg-indigo-50")}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground leading-snug">{r.activityDescription}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingRams(r); setRamsForm({ activityDescription: r.activityDescription, documentUrl: r.documentUrl, documentName: r.documentName, receivedDate: r.receivedDate, notes: r.notes }); setShowRamsForm(true); }}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteRamsMut.mutate(r.id)} disabled={deleteRamsMut.isPending}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {r.receivedDate && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />Received {fmt(r.receivedDate)}</span>}
                  {r.documentUrl && r.documentName && (
                    <a href={r.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary underline underline-offset-2 truncate max-w-[220px]">
                      <FileText className="h-3 w-3 flex-shrink-0" />{r.documentName}
                    </a>
                  )}
                </div>

                {/* Review status row */}
                {isReviewed ? (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                      <CheckCheck className="h-3.5 w-3.5" />
                      Reviewed {fmt(r.reviewDate)} by {r.reviewedBy}
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                      disabled={markReviewedMut.isPending}
                      onClick={() => markReviewedMut.mutate(r.id)}>
                      <ClipboardCheck className="h-3 w-3" />Re-review
                    </Button>
                  </div>
                ) : hasPendingTask ? (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                      <Clock className="h-3.5 w-3.5" />
                      Review task assigned to {r.pendingReviewTaskStaffName}
                    </div>
                    <Button size="sm" className="h-7 text-xs gap-1 px-2.5"
                      disabled={markReviewedMut.isPending}
                      onClick={() => markReviewedMut.mutate(r.id)}>
                      {markReviewedMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                      Mark as Reviewed
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" className="h-7 text-xs gap-1.5 px-2.5"
                      disabled={markReviewedMut.isPending}
                      onClick={() => markReviewedMut.mutate(r.id)}>
                      {markReviewedMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                      Mark as Reviewed
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 px-2.5"
                      onClick={() => { setAssignDialog({ open: true, ramsId: r.id, activity: r.activityDescription }); setAssignMemberId(""); setAssignDueDate(""); setAssignNote(""); }}>
                      <Send className="h-3 w-3" />Assign for Review
                    </Button>
                  </div>
                )}

                {r.notes && <p className="text-xs text-muted-foreground italic">{r.notes}</p>}
              </div>
            );
          })}

          {showRamsForm ? (
            <div className="p-4 bg-white rounded-lg border border-primary/30 space-y-3">
              <p className="text-xs font-semibold text-foreground/70">{editingRams ? "Edit RAMS" : "Add RAMS"}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label className="text-xs">Activity / Task Description *</Label><Input value={ramsForm.activityDescription} onChange={e => setRF("activityDescription", e.target.value)} placeholder="e.g. Grain store construction" className="h-8 text-sm" /></div>
                <div><Label className="text-xs">Date Received</Label><Input type="date" value={ramsForm.receivedDate ?? ""} onChange={e => setRF("receivedDate", e.target.value || null)} className="h-8 text-sm" /></div>
                <div className="col-span-2">
                  <Label className="text-xs mb-1.5 block">Document</Label>
                  <RamsUploadWidget documentUrl={ramsForm.documentUrl} documentName={ramsForm.documentName} onChange={(url, name) => setRamsForm(f => ({ ...f, documentUrl: url, documentName: name }))} />
                </div>
                <div className="col-span-2"><Label className="text-xs">Notes</Label><Input value={ramsForm.notes ?? ""} onChange={e => setRF("notes", e.target.value || null)} className="h-8 text-sm" /></div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" size="sm" onClick={() => { setShowRamsForm(false); setEditingRams(null); setRamsForm({ ...EMPTY_RAMS }); }}>Cancel</Button>
                <Button size="sm" disabled={!ramsForm.activityDescription || addRamsMut.isPending || updateRamsMut.isPending}
                  onClick={() => editingRams ? updateRamsMut.mutate({ ...ramsForm, id: editingRams.id }) : addRamsMut.mutate(ramsForm)}>
                  {(addRamsMut.isPending || updateRamsMut.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  {editingRams ? "Update RAMS" : "Add RAMS"}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setEditingRams(null); setRamsForm({ ...EMPTY_RAMS }); setShowRamsForm(true); }}>
              <Plus className="h-3.5 w-3.5" />Add RAMS
            </Button>
          )}
        </div>
      )}

      {/* Assign for Review dialog */}
      <Dialog open={!!assignDialog?.open} onOpenChange={o => { if (!o) { setAssignDialog(null); raiseTaskMut.reset(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-primary" />Assign RAMS for Review</DialogTitle>
            <DialogDescription className="text-xs">
              A Task Board entry will be created for the reviewer, and they'll receive an SMS notification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-0.5">Activity</p>
              <p className="text-sm font-medium">{assignDialog?.activity}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{contractor.companyName}</p>
            </div>
            <div>
              <Label className="text-xs">Assign to *</Label>
              <Select value={assignMemberId} onValueChange={setAssignMemberId}>
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue placeholder="Select team member…" />
                </SelectTrigger>
                <SelectContent>
                  {(membersData ?? []).map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={assignDueDate} onChange={e => setAssignDueDate(e.target.value)} className="h-9 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs">Note to reviewer (optional)</Label>
              <Textarea value={assignNote} onChange={e => setAssignNote(e.target.value)} placeholder="e.g. Please review before the contractor arrives on 15 May." className="text-sm mt-1 resize-none" rows={2} />
            </div>
          </div>
          <DialogMutationError mutation={raiseTaskMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAssignDialog(null)}>Cancel</Button>
            <Button size="sm" className="gap-1.5" disabled={!assignMemberId || raiseTaskMut.isPending}
              onClick={() => assignDialog && raiseTaskMut.mutate({ ramsId: assignDialog.ramsId, body: { assignedToMemberId: Number(assignMemberId), dueDate: assignDueDate || undefined, note: assignNote || undefined } })}>
              {raiseTaskMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Assign & Add to Task Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ContractorsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  if (!farmId) return <Redirect href="/select" />;

  const base = `/api/farms/${farmId}/contractors`;

  const { data, isLoading } = useQuery<{ contractors: Contractor[] }>({
    queryKey: ["contractors-hs", farmId],
    queryFn: () => fetch(`${base}?showInactive=false`).then(r => r.json()),
  });
  const [showInactive, setShowInactive] = useState(false);
  const { data: allData } = useQuery<{ contractors: Contractor[] }>({
    queryKey: ["contractors-hs-all", farmId],
    queryFn: () => fetch(`${base}?showInactive=true`).then(r => r.json()),
    enabled: showInactive,
  });
  const { data: suppliersData } = useQuery<{ records: Supplier[] }>({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.json()),
  });

  const contractors: Contractor[] = (showInactive ? allData?.contractors : data?.contractors) ?? [];
  const suppliers: Supplier[] = suppliersData?.records ?? [];

  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Deep link from Task Board: /contractors?ramsId=<id> — expand the owning contractor.
  const targetRamsId = (() => {
    const v = new URLSearchParams(window.location.search).get("ramsId");
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  })();
  const expandedForRams = useRef(false);
  useEffect(() => {
    if (targetRamsId == null || expandedForRams.current || contractors.length === 0) return;
    const owner = contractors.find(c => c.rams.some(r => r.id === targetRamsId));
    if (!owner) return;
    expandedForRams.current = true;
    setExpandedId(owner.id);
  }, [targetRamsId, contractors]);
  // If the RAMS deep-link target isn't among active contractors (e.g. the contractor was
  // deactivated after the task was raised), auto-enable the inactive view to find it.
  const autoShowedInactiveForRams = useRef(false);
  useEffect(() => {
    if (targetRamsId == null || expandedForRams.current || autoShowedInactiveForRams.current) return;
    if (!data || showInactive) return;
    const foundInActive = (data.contractors ?? []).some(c => c.rams.some(r => r.id === targetRamsId));
    if (foundInActive) return;
    autoShowedInactiveForRams.current = true;
    setShowInactive(true);
    toast({ title: "Showing inactive contractors", description: "The contractor linked to this RAMS review is deactivated, so inactive contractors have been included." });
  }, [targetRamsId, data, showInactive, toast]);
  // If it's still not found even with inactive contractors included, tell the user why nothing opened.
  const notifiedRamsMissing = useRef(false);
  useEffect(() => {
    if (targetRamsId == null || expandedForRams.current || notifiedRamsMissing.current) return;
    if (!autoShowedInactiveForRams.current || !allData) return;
    const found = (allData.contractors ?? []).some(c => c.rams.some(r => r.id === targetRamsId));
    if (found) return;
    notifiedRamsMissing.current = true;
    toast({ title: "RAMS entry not found", description: "The RAMS record this task links to no longer exists — it may have been deleted.", variant: "destructive" });
  }, [targetRamsId, allData, toast]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contractor | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }); qc.invalidateQueries({ queryKey: ["contractors-hs-all", farmId] }); };

  const createMut = useMutation({
    mutationFn: (b: typeof EMPTY_FORM) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (d) => { invalidate(); setShowForm(false); setForm({ ...EMPTY_FORM }); if (d.contractor) setExpandedId(d.contractor.id); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (b: typeof EMPTY_FORM & { id: number }) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); setShowForm(false); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deactivateMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(c: Contractor) {
    setEditing(c);
    setForm({
      companyName: c.companyName, tradeType: c.tradeType, address: c.address,
      contactName: c.contactName, phone: c.phone, email: c.email,
      supplierId: c.supplierId,
      pliNumber: c.pliNumber, pliInsurer: c.pliInsurer, pliCoverAmountGbp: c.pliCoverAmountGbp,
      pliExpiryDate: c.pliExpiryDate, pliDocumentUrl: c.pliDocumentUrl, pliDocumentName: c.pliDocumentName,
      firstOnSiteDate: c.firstOnSiteDate, lastOnSiteDate: c.lastOnSiteDate,
      notes: c.notes, isActive: c.isActive,
    });
    setShowForm(true);
  }

  const filtered = contractors.filter(c =>
    !search || c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    (TRADE_TYPES[c.tradeType] ?? c.tradeType).toLowerCase().includes(search.toLowerCase())
  );

  function printReport() {
    const rows = filtered.map(c => {
      const pliStatus = isPliExpired(c.pliExpiryDate) ? "EXPIRED" : isPliExpiringSoon(c.pliExpiryDate) ? "Expiring soon" : c.pliNumber ? "Current" : "Not recorded";
      const ramsStatus = c.rams.length > 0 ? `${c.rams.length} RAMS on file` : "None";
      return `<tr><td>${c.companyName}</td><td>${TRADE_TYPES[c.tradeType] ?? c.tradeType}</td><td>${c.address ?? "—"}</td><td>${c.contacts.map(x => x.name).join(", ") || "—"}</td><td>${c.pliNumber ?? "—"}</td><td>${fmt(c.pliExpiryDate)} (${pliStatus})</td><td>${ramsStatus}</td><td>${fmt(c.firstOnSiteDate)}</td><td>${fmt(c.lastOnSiteDate)}</td></tr>`;
    }).join("");
    printProReport({
      title: "Contractor H&S File",
      subtitle: `${filtered.length} contractors on record`,
      tableHtml: `<table><thead><tr><th>Company</th><th>Trade</th><th>Address</th><th>Contacts</th><th>PLI No.</th><th>PLI Expiry</th><th>RAMS</th><th>First On-Site</th><th>Last On-Site</th></tr></thead><tbody>${rows}</tbody></table>`,
    });
  }

  const pliIssues = contractors.filter(c => c.isActive && (isPliExpired(c.pliExpiryDate) || isPliExpiringSoon(c.pliExpiryDate) || !c.pliNumber));
  const ramsIssues = contractors.filter(c => c.isActive && c.rams.length === 0);
  const linkedSupplierIds = new Set(contractors.map(c => c.supplierId).filter(Boolean));

  return (
    <AppLayout title="Contractors H&S File">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <p className="text-sm text-gray-500 max-w-2xl">
          Public liability insurance, RAMS, and contact records for all contractors working on the farm. Required under Red Tractor and the Health &amp; Safety at Work Act 1974.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-3.5 w-3.5 mr-1" />Print Register</Button>
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />Add Contractor</Button>
        </div>
      </div>

      {(pliIssues.length > 0 || ramsIssues.length > 0) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Action required:</strong>
            {pliIssues.length > 0 && <> {pliIssues.length} contractor{pliIssues.length > 1 ? "s" : ""} with missing, expired, or expiring PLI.</>}
            {ramsIssues.length > 0 && <> {ramsIssues.length} contractor{ramsIssues.length > 1 ? "s" : ""} without any RAMS on file.</>}
          </span>
        </div>
      )}

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company or trade…" className="max-w-xs" />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="h-4 w-4" />
          Show inactive contractors
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-gray-700 mb-1">No contractors{search ? " matching search" : " added yet"}</p>
          <p className="text-sm text-muted-foreground">Add contractors working on the farm to maintain your H&amp;S file.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const pliExpired = isPliExpired(c.pliExpiryDate);
            const pliSoon = !pliExpired && isPliExpiringSoon(c.pliExpiryDate);
            const expanded = expandedId === c.id;
            const linkedSupplier = suppliers.find(s => s.id === c.supplierId);
            return (
              <div key={c.id} className={cn("rounded-xl border bg-white overflow-hidden", !c.isActive && "opacity-60")}>
                {/* Card header row */}
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-base text-foreground">{c.companyName}</span>
                      {!c.isActive && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">Inactive</span>}
                      {linkedSupplier && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Link2 className="h-2.5 w-2.5" />Trade Contact: {linkedSupplier.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{TRADE_TYPES[c.tradeType] ?? c.tradeType}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      {c.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" />{c.address}</span>}
                      {c.contacts.length > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.contacts.length} contact{c.contacts.length > 1 ? "s" : ""}</span>}
                      {c.contacts.length === 0 && (c.contactName || c.phone) && (
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.contactName ?? c.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {/* PLI status */}
                      {pliExpired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="h-3 w-3" />PLI Expired
                        </span>
                      ) : pliSoon ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="h-3 w-3" />PLI Expiring {fmt(c.pliExpiryDate)}
                        </span>
                      ) : c.pliNumber ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />PLI Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="h-3 w-3" />PLI Not Recorded
                        </span>
                      )}
                      {/* RAMS status */}
                      {c.rams.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />{c.rams.length} RAMS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="h-3 w-3" />No RAMS
                        </span>
                      )}
                    </div>
                    {/* Site dates */}
                    {(c.firstOnSiteDate || c.lastOnSiteDate) && (
                      <p className="text-[10px] text-muted-foreground text-right">
                        {c.firstOnSiteDate && <>First: {fmt(c.firstOnSiteDate)}</>}
                        {c.firstOnSiteDate && c.lastOnSiteDate && " · "}
                        {c.lastOnSiteDate && <>Last: {fmt(c.lastOnSiteDate)}</>}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(c)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)} title="Deactivate"><Trash2 className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setExpandedId(expanded ? null : c.id)} title={expanded ? "Collapse" : "Contacts & RAMS"}>
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* PLI certificate link in card */}
                {c.pliDocumentName && c.pliDocumentUrl && (
                  <div className="px-5 pb-3 -mt-1">
                    <a href={c.pliDocumentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-2">
                      <FileText className="h-3 w-3" />{c.pliDocumentName}
                    </a>
                  </div>
                )}

                {/* Expanded section */}
                {expanded && <ExpandedContractorSection contractor={c} farmId={farmId} targetRamsId={targetRamsId} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit dialog */}
      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); createMut.reset(); updateMut.reset(); } }}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Contractor" : "Add Contractor to H&S File"}</DialogTitle>
              <DialogDescription>Fill in the company details and PLI below. Contacts and RAMS documents are managed from the contractor card after saving.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">

              {/* Company info */}
              <div className="col-span-2 flex items-center gap-2 pb-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Information</p>
              </div>
              <div className="col-span-2"><Label>Company Name *</Label><Input value={form.companyName} onChange={e => setF("companyName", e.target.value)} placeholder="e.g. Smith Electrical Services Ltd" /></div>
              <div>
                <Label>Trade Type *</Label>
                <Select value={Object.keys(TRADE_TYPES).filter(k => k !== "other").includes(form.tradeType) ? form.tradeType : form.tradeType ? "other" : ""} onValueChange={v => setF("tradeType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TRADE_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
                {(form.tradeType === "other" || (form.tradeType && !Object.keys(TRADE_TYPES).includes(form.tradeType))) && (
                  <Input className="mt-1.5" value={form.tradeType === "other" ? "" : form.tradeType} onChange={e => setF("tradeType", e.target.value || "other")} placeholder="Please specify trade type…" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="cActive" checked={form.isActive} onChange={e => setF("isActive", e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="cActive" className="font-normal">Active contractor</Label>
              </div>
              <div className="col-span-2"><Label>Address</Label><Textarea value={form.address ?? ""} onChange={e => setF("address", e.target.value || null)} rows={2} placeholder="Registered or operational address" /></div>

              {/* Supplier link */}
              {suppliers.length > 0 && (
                <>
                  <div className="col-span-2 border-t pt-4 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trade Contact Link</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Link to existing Trade Contact (optional)</Label>
                    <Select value={form.supplierId ? String(form.supplierId) : "__none__"} onValueChange={v => setF("supplierId", v === "__none__" ? null : parseInt(v))}>
                      <SelectTrigger><SelectValue placeholder="Not linked" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not linked</SelectItem>
                        {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Linking lets the Trade Contacts register show that a H&amp;S file is held for this supplier.</p>
                  </div>
                </>
              )}

              {/* PLI */}
              <div className="col-span-2 border-t pt-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Public Liability Insurance</p>
              </div>
              <div><Label>Policy Number</Label><Input value={form.pliNumber ?? ""} onChange={e => setF("pliNumber", e.target.value || null)} className="font-mono" placeholder="e.g. PLI-12345678" /></div>
              <div><Label>Insurer</Label><Input value={form.pliInsurer ?? ""} onChange={e => setF("pliInsurer", e.target.value || null)} /></div>
              <div><Label>Cover Amount (£)</Label><Input type="number" min={0} value={form.pliCoverAmountGbp ?? ""} onChange={e => setF("pliCoverAmountGbp", e.target.value || null)} placeholder="e.g. 5000000" /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.pliExpiryDate ?? ""} onChange={e => setF("pliExpiryDate", e.target.value || null)} /></div>
              <div className="col-span-2">
                <Label className="mb-1.5 block">PLI Certificate</Label>
                <PliUploadWidget
                  documentUrl={form.pliDocumentUrl}
                  documentName={form.pliDocumentName}
                  onChange={(url, name) => setForm(f => ({ ...f, pliDocumentUrl: url, pliDocumentName: name }))}
                />
              </div>

              {/* Site activity */}
              <div className="col-span-2 border-t pt-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">On-Farm Activity</p>
              </div>
              <div><Label>First On-Site Date</Label><Input type="date" value={form.firstOnSiteDate ?? ""} onChange={e => setF("firstOnSiteDate", e.target.value || null)} /></div>
              <div><Label>Last On-Site Date</Label><Input type="date" value={form.lastOnSiteDate ?? ""} onChange={e => setF("lastOnSiteDate", e.target.value || null)} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={2} /></div>
            </div>
            <DialogMutationError mutation={editing ? updateMut : createMut} message="Failed to save — your entries are still here." />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)} disabled={!form.companyName || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editing ? "Update Contractor" : "Add Contractor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Deactivate confirm */}
      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) { setDeleteId(null); deactivateMut.reset(); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Deactivate Contractor?</DialogTitle>
              <DialogDescription>The contractor will be marked as inactive and hidden from the active list. All H&amp;S records, contacts, and RAMS are retained.</DialogDescription>
            </DialogHeader>
            <DialogMutationError mutation={deactivateMut} message="Couldn't deactivate — please try again." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deactivateMut.mutate(deleteId!)} disabled={deactivateMut.isPending}>
                {deactivateMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Deactivate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
