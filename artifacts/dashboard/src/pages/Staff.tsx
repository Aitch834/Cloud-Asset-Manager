import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Plus, Search, Mail, UserCheck, UserX, RefreshCw, Award, AlertTriangle,
  ArrowRight, CheckCircle2, Smartphone, Monitor, Shield, User, Edit2, Send,
  Lock, Unlock, ChevronDown, GraduationCap, Phone, UserRound, Eye,
  Building2, Trash2, ShieldCheck, Package, Pencil, Loader2, Printer, HardHat, FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { printProReport } from "@/lib/print-report";
import { useLookup } from "@/hooks/use-lookup";

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
const DEV_TOKEN = import.meta.env.VITE_DEV_BYPASS_TOKEN;

function authHeaders(): HeadersInit {
  if (DEV_BYPASS && DEV_TOKEN) return { "x-dev-bypass-token": DEV_TOKEN };
  return {};
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FarmRole = "operator" | "senior" | "manager" | "owner";
type AccessType = "none" | "mobile_only" | "web_only" | "full";

interface Department {
  id: number;
  name: string;
  description: string | null;
  colour: string;
  isActive: boolean;
}

interface FarmMember {
  id: number;
  farmId: number;
  linkedUserId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  farmRole: FarmRole;
  accessType: AccessType;
  invitationStatus: "not_invited" | "pending" | "accepted";
  isActive: boolean;
  notes: string | null;
  niNumber: string | null;
  payrollNumber: string | null;
  nokName: string | null;
  nokRelationship: string | null;
  nokPhone: string | null;
  nokEmail: string | null;
  employedFrom: string | null;
  employedTo: string | null;
  createdAt: string;
  departmentId: number | null;
  departmentName: string | null;
  departmentColour: string | null;
  secondaryDepartments: { id: number; name: string; colour: string }[];
}

interface CertRecord {
  id: number;
  userId: string;
  certificateType: string;
  expiryDate: string | null;
}

interface RtwRecord {
  id: number;
  staffName: string;
  expiryDate: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FARM_ROLE_LABELS: Record<FarmRole, string> = {
  operator: "Operator",
  senior: "Senior / Foreman",
  manager: "Farm Manager",
  owner: "Owner",
};

const FARM_ROLE_COLORS: Record<FarmRole, string> = {
  operator: "bg-slate-100 text-slate-700",
  senior: "bg-blue-100 text-blue-700",
  manager: "bg-purple-100 text-purple-700",
  owner: "bg-amber-100 text-amber-800",
};

const ACCESS_LABELS: Record<string, string> = {
  none: "No system access",
  mobile_only: "Mobile only",
  web_only: "Web only",
  full: "Full access",
  limited: "Limited access",
};

const ACCESS_COLORS: Record<string, string> = {
  none: "bg-slate-100 text-slate-500",
  mobile_only: "bg-green-100 text-green-700",
  web_only: "bg-indigo-100 text-indigo-700",
  full: "bg-emerald-100 text-emerald-700",
  limited: "bg-green-100 text-green-700",
};

const ACCESS_ICONS: Record<string, React.ElementType> = {
  none: Lock,
  mobile_only: Smartphone,
  web_only: Monitor,
  full: Unlock,
  limited: Smartphone,
};

// ─── PPE Interfaces ────────────────────────────────────────────────────────────

interface PpePurchaseOrder {
  id: number;
  farmId: number;
  supplierId: number | null;
  supplierName: string | null;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  status: string;
  notes: string | null;
  submittedByName: string | null;
  grnNumber: string | null;
  actualDeliveryDate: string | null;
  createdAt: string;
  lines?: PpoLine[];
}

interface PpoLine {
  id: number;
  poId: number;
  ppeType: string;
  description: string | null;
  size: string | null;
  quantityOrdered: number;
  unitPricePence: number | null;
  quantityReceived: number;
  notes: string | null;
}

interface PpeRecord {
  id: number;
  farmId: number;
  staffName: string;
  staffUserId: string | null;
  ppeType: string;
  description: string | null;
  size: string | null;
  supplier: string | null;
  stockItemId: number | null;
  dateIssued: string;
  conditionCheckDate: string | null;
  conditionAtCheck: string | null;
  replacedDate: string | null;
  replacedReason: string | null;
  notes: string | null;
  fitCheckConfirmed: boolean;
  fitCheckBy: string | null;
  fitCheckNotes: string | null;
  trainingProvided: boolean;
  trainingNotes: string | null;
  isActive: boolean;
}

interface PpeStockItem {
  id: number;
  farmId: number;
  ppeType: string;
  description: string | null;
  size: string | null;
  quantityReceived: number;
  quantityInStock: number;
  unitCostPence: number | null;
  supplierId: number | null;
  supplierName: string | null;
  supplierRecordName: string | null;
  invoiceRef: string | null;
  deliveryNoteRef: string | null;
  receivedDate: string | null;
  batchNumber: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PpeRiskAssessment {
  id: number;
  farmId: number;
  assessmentRef: string | null;
  ppeType: string;
  hazardIdentified: string;
  taskOrArea: string | null;
  riskLevel: string | null;
  ppeSpecification: string | null;
  compatiblePpeTypes: string | null;
  assessedBy: string;
  assessmentDate: string;
  reviewDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

interface FarmSupplier { id: number; name: string; }

function fmt(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}

// ─── PPE Register Section ─────────────────────────────────────────────────────

function PpeRegisterSection({ farmId, members }: { farmId: number; members: FarmMember[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const issueBase = `/api/farms/${farmId}/ppe-issue-records`;
  const stockBase = `/api/farms/${farmId}/ppe-stock-items`;
  const riskBase = `/api/farms/${farmId}/ppe-risk-assessments`;
  const ppoBase = `/api/farms/${farmId}/ppe-purchase-orders`;

  // PPE Types — from Lookup Lists (user-maintainable; fallback to key if not loaded)
  const { data: ppeTypeLookup } = useLookup("ppe_types");
  const ppeTypes = useMemo(() => ppeTypeLookup ?? [], [ppeTypeLookup]);
  const ppeTypeMap = useMemo(() => Object.fromEntries(ppeTypes.map(t => [t.value, t.label])), [ppeTypes]);

  // EN ISO standard suggestions per PPE type key
  const EN_ISO: Record<string, string[]> = {
    "safety-boots": ["EN ISO 20345:2011 S1","EN ISO 20345:2011 S1P","EN ISO 20345:2011 S3","EN ISO 20345:2011 S3 SRC","EN ISO 20345:2011 S5 SRC"],
    "safety-helmet": ["EN 397:2012+A1 (Industrial safety helmet)","EN 14052:2012+A1 (High-performance industrial helmet)"],
    "hi-vis-vest": ["EN ISO 20471:2013 Class 1","EN ISO 20471:2013 Class 2","EN ISO 20471:2013 Class 3"],
    "gloves": ["EN ISO 374-1:2016 (Chemical protection)","EN 388:2016+A1 (Mechanical risks)","EN 511:2006 (Cold protection)","EN 12477:2001 (Welding gloves)"],
    "safety-glasses": ["EN ISO 16321-1:2021 (Eye and face protection)","EN 166:2002 (Personal eye protection)","EN 170:2002 (UV filter lenses)"],
    "ear-protection": ["EN 352-1:2020 (Ear muffs)","EN 352-2:2020 (Ear plugs)","EN 352-3:2020 (Ear muffs attached to helmet)"],
    "dust-mask": ["EN 149:2001+A1:2009 FFP1","EN 149:2001+A1:2009 FFP2 NR","EN 149:2001+A1:2009 FFP2 R (reusable)","EN 149:2001+A1:2009 FFP3 NR","EN 149:2001+A1:2009 FFP3 R (reusable)","EN 140:1998 (Half mask)","EN 136:1998 (Full face mask)"],
    "face-shield": ["EN 166:2002 (Personal eye/face protection)","EN 168:2001 (Non-optical test methods)"],
    "waterproof-suit": ["EN ISO 13688:2013 (General protective clothing)","EN 13982-1:2004+A1 (Type 5 — dry particles)","EN 14605:2005+A1 (Type 4 — spray-tight)","EN 14126:2003+A1 (Biohazard protection)"],
    "chainsaw-ppe": ["EN ISO 11393-2:2019 (Leg protectors performance)","EN ISO 11393-4:2019 (Gloves)","EN ISO 11393-5:2022 (Gaiters)","EN ISO 11393-6:2019 (Upper body protection)"],
    "apron": ["EN ISO 13688:2013 (General protective clothing)","EN 13034:2005+A1 (Limited chemical splash)"],
  };

  // Size options per PPE type key
  const PPE_SIZES: Record<string, string[]> = {
    "safety-boots": ["UK 3","UK 4","UK 5","UK 6","UK 7","UK 8","UK 9","UK 10","UK 11","UK 12","UK 13","UK 14"],
    "safety-helmet": ["One size (adjustable)","52–58cm","54–61cm","57–62cm","58–64cm"],
    "hi-vis-vest": ["XS","S","M","L","XL","2XL","3XL","4XL"],
    "gloves": ["XS","S","M","L","XL","2XL","Size 6","Size 7","Size 8","Size 9","Size 10","Size 11"],
    "safety-glasses": ["One size","Standard","Large / wide"],
    "ear-protection": ["One size","N/A (disposable)"],
    "dust-mask": ["S","M","L","S/M","M/L","One size"],
    "face-shield": ["One size (adjustable)","Standard"],
    "waterproof-suit": ["XS","S","M","L","XL","2XL","3XL","4XL"],
    "chainsaw-ppe": ["S","M","L","XL","2XL","3XL"],
    "apron": ["One size","S/M","L/XL","XL/2XL"],
  };

  const { data: issueData, isLoading: issueLoading } = useQuery<{ records: PpeRecord[] }>({
    queryKey: ["ppe-records", farmId],
    queryFn: () => fetch(issueBase, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
  const { data: stockData, isLoading: stockLoading } = useQuery<{ items: PpeStockItem[] }>({
    queryKey: ["ppe-stock", farmId],
    queryFn: () => fetch(stockBase, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
  const { data: suppData } = useQuery<{ records: FarmSupplier[] }>({
    queryKey: ["ppe-suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ppe-suppliers`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: riskData, isLoading: riskLoading } = useQuery<{ records: PpeRiskAssessment[] }>({
    queryKey: ["ppe-risk", farmId],
    queryFn: () => fetch(riskBase, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
  const { data: farmMeta } = useQuery<{ record: { name: string; cphNumber: string | null } }>({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });

  const allRecords = issueData?.records ?? [];
  const allStock = stockData?.items ?? [];
  const suppliers = suppData?.records ?? [];
  const allRisk = riskData?.records ?? [];

  const [subTab, setSubTab] = useState<"stock" | "issues" | "risk" | "purchasing">("stock");
  const [staffFilter, setStaffFilter] = useState("");
  const [issueSearch, setIssueSearch] = useState("");

  // ── Issue form
  const EMPTY_ISSUE = { staffName: "", ppeType: "safety-boots", description: "", size: "", supplier: "", stockItemId: "" as string, dateIssued: new Date().toISOString().slice(0, 10), conditionCheckDate: "", conditionAtCheck: "", replacedDate: "", replacedReason: "", notes: "", fitCheckConfirmed: false, fitCheckBy: "", fitCheckNotes: "", trainingProvided: false, trainingNotes: "", isActive: true };
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [editIssue, setEditIssue] = useState<PpeRecord | null>(null);
  const [issueForm, setIssueForm] = useState({ ...EMPTY_ISSUE });
  const [deleteIssueId, setDeleteIssueId] = useState<number | null>(null);
  const [viewIssue, setViewIssue] = useState<PpeRecord | null>(null);

  // ── Stock form
  const EMPTY_STOCK = { ppeType: "safety-boots", description: "", size: "", quantityReceived: "1", unitCostPence: "", supplierId: "", supplierName: "", invoiceRef: "", deliveryNoteRef: "", receivedDate: new Date().toISOString().slice(0, 10), batchNumber: "", notes: "", isActive: true };
  const [showStockForm, setShowStockForm] = useState(false);
  const [editStock, setEditStock] = useState<PpeStockItem | null>(null);
  const [stockForm, setStockForm] = useState({ ...EMPTY_STOCK });
  const [deleteStockId, setDeleteStockId] = useState<number | null>(null);
  const [viewStock, setViewStock] = useState<PpeStockItem | null>(null);

  const setIF = (k: string, v: unknown) => setIssueForm(f => ({ ...f, [k]: v }));
  const setSF = (k: string, v: unknown) => setStockForm(f => ({ ...f, [k]: v }));

  const createIssueMut = useMutation({
    mutationFn: (b: typeof EMPTY_ISSUE) => fetch(issueBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...b, stockItemId: b.stockItemId ? parseInt(b.stockItemId) : null }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-records", farmId] }); qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] }); setShowIssueForm(false); setIssueForm({ ...EMPTY_ISSUE }); },
  });
  const updateIssueMut = useMutation({
    mutationFn: (b: typeof EMPTY_ISSUE & { id: number }) => fetch(`${issueBase}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...b, stockItemId: b.stockItemId ? parseInt(b.stockItemId) : null }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-records", farmId] }); setShowIssueForm(false); setEditIssue(null); },
  });
  const deleteIssueMut = useMutation({
    mutationFn: (id: number) => fetch(`${issueBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-records", farmId] }); setDeleteIssueId(null); },
  });

  const createStockMut = useMutation({
    mutationFn: (b: typeof EMPTY_STOCK) => fetch(stockBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...b, quantityReceived: parseInt(b.quantityReceived || "0"), unitCostPence: b.unitCostPence ? Math.round(parseFloat(b.unitCostPence) * 100) : null, supplierId: b.supplierId ? parseInt(b.supplierId) : null }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] }); setShowStockForm(false); setStockForm({ ...EMPTY_STOCK }); },
  });
  const updateStockMut = useMutation({
    mutationFn: (b: typeof EMPTY_STOCK & { id: number }) => fetch(`${stockBase}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...b, quantityReceived: parseInt(b.quantityReceived || "0"), quantityInStock: parseInt(b.quantityReceived || "0"), unitCostPence: b.unitCostPence ? Math.round(parseFloat(b.unitCostPence) * 100) : null, supplierId: b.supplierId ? parseInt(b.supplierId) : null }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] }); setShowStockForm(false); setEditStock(null); },
  });
  const deleteStockMut = useMutation({
    mutationFn: (id: number) => fetch(`${stockBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] }); setDeleteStockId(null); },
  });

  // ── Risk Assessment form
  const EMPTY_RISK = { assessmentRef: "", ppeType: "safety-boots", hazardIdentified: "", taskOrArea: "", riskLevel: "__none__" as string, ppeSpecification: "", compatiblePpeTypes: "", assessedBy: "", assessmentDate: new Date().toISOString().slice(0, 10), reviewDate: "", notes: "" };
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [editRisk, setEditRisk] = useState<PpeRiskAssessment | null>(null);
  const [riskForm, setRiskForm] = useState({ ...EMPTY_RISK });
  const [deleteRiskId, setDeleteRiskId] = useState<number | null>(null);
  const setRF = (k: string, v: unknown) => setRiskForm(f => ({ ...f, [k]: v }));

  function openEditRisk(r: PpeRiskAssessment) {
    setEditRisk(r);
    setRiskForm({ assessmentRef: r.assessmentRef ?? "", ppeType: r.ppeType, hazardIdentified: r.hazardIdentified, taskOrArea: r.taskOrArea ?? "", riskLevel: r.riskLevel ?? "__none__", ppeSpecification: r.ppeSpecification ?? "", compatiblePpeTypes: r.compatiblePpeTypes ?? "", assessedBy: r.assessedBy, assessmentDate: r.assessmentDate, reviewDate: r.reviewDate ?? "", notes: r.notes ?? "" });
    setShowRiskForm(true);
  }

  function riskPayload(f: typeof EMPTY_RISK) {
    return { ...f, riskLevel: f.riskLevel === "__none__" ? null : f.riskLevel };
  }

  const createRiskMut = useMutation({
    mutationFn: (b: typeof EMPTY_RISK) => fetch(riskBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(riskPayload(b)) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-risk", farmId] }); setShowRiskForm(false); setRiskForm({ ...EMPTY_RISK }); },
  });
  const updateRiskMut = useMutation({
    mutationFn: (b: typeof EMPTY_RISK & { id: number }) => fetch(`${riskBase}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(riskPayload(b)) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-risk", farmId] }); setShowRiskForm(false); setEditRisk(null); },
  });
  const deleteRiskMut = useMutation({
    mutationFn: (id: number) => fetch(`${riskBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-risk", farmId] }); setDeleteRiskId(null); },
  });

  // ── PPE Purchase Orders ───────────────────────────────────────────────────
  const { data: ppoData } = useQuery<{ records: PpePurchaseOrder[] }>({
    queryKey: ["ppe-purchase-orders", farmId],
    queryFn: () => fetch(ppoBase, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
  const allPpos = ppoData?.records ?? [];

  const EMPTY_PO_LINE = { ppeType: ppeTypes[0]?.value ?? "safety-boots", description: "", size: "", quantityOrdered: "1", unitPricePence: "" };
  const EMPTY_PO_FORM = { supplierId: "", supplierName: "", orderDate: new Date().toISOString().slice(0, 10), expectedDeliveryDate: "", notes: "", submittedByName: "" };

  const [showPoForm, setShowPoForm] = useState(false);
  const [editPo, setEditPo] = useState<PpePurchaseOrder | null>(null);
  const [poForm, setPoForm] = useState<typeof EMPTY_PO_FORM>({ ...EMPTY_PO_FORM });
  const [poLines, setPoLines] = useState<Array<{ ppeType: string; description: string; size: string; quantityOrdered: string; unitPricePence: string }>>([{ ...EMPTY_PO_LINE }]);
  const [showGrnDialog, setShowGrnDialog] = useState<PpePurchaseOrder | null>(null);
  const [grnDate, setGrnDate] = useState(new Date().toISOString().slice(0, 10));
  const [grnQtys, setGrnQtys] = useState<Record<number, string>>({});
  const setSPF = (k: string, v: unknown) => setPoForm(f => ({ ...f, [k]: v as string }));

  const createPoMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch(ppoBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-purchase-orders", farmId] }); setShowPoForm(false); toast({ title: "PPE order raised" }); },
    onError: () => toast({ title: "Error raising order", variant: "destructive" }),
  });
  const updatePoMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch(`${ppoBase}/${editPo?.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-purchase-orders", farmId] }); setShowPoForm(false); setEditPo(null); toast({ title: "Order updated" }); },
    onError: () => toast({ title: "Error updating order", variant: "destructive" }),
  });
  const deletePoMut = useMutation({
    mutationFn: (id: number) => fetch(`${ppoBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ppe-purchase-orders", farmId] }); },
  });
  const receivePoMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch(`${ppoBase}/${showGrnDialog?.id}/receive`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: (d: { grnNumber: string }) => {
      qc.invalidateQueries({ queryKey: ["ppe-purchase-orders", farmId] });
      qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] });
      setShowGrnDialog(null);
      toast({ title: `Goods received — ${d.grnNumber}` });
    },
    onError: () => toast({ title: "Error recording receipt", variant: "destructive" }),
  });

  function openPoAdd() {
    setEditPo(null);
    setPoForm({ ...EMPTY_PO_FORM });
    setPoLines([{ ...EMPTY_PO_LINE }]);
    setShowPoForm(true);
  }
  function openPoEdit(po: PpePurchaseOrder) {
    setEditPo(po);
    setPoForm({ supplierId: po.supplierId ? String(po.supplierId) : "", supplierName: po.supplierName ?? "", orderDate: po.orderDate, expectedDeliveryDate: po.expectedDeliveryDate ?? "", notes: po.notes ?? "", submittedByName: po.submittedByName ?? "" });
    setPoLines(po.lines?.map(l => ({ ppeType: l.ppeType, description: l.description ?? "", size: l.size ?? "", quantityOrdered: String(l.quantityOrdered), unitPricePence: l.unitPricePence ? String((l.unitPricePence / 100).toFixed(2)) : "" })) ?? [{ ...EMPTY_PO_LINE }]);
    setShowPoForm(true);
  }
  function openGrn(po: PpePurchaseOrder) {
    setShowGrnDialog(po);
    setGrnDate(new Date().toISOString().slice(0, 10));
    setGrnQtys({});
  }

  function openEditIssue(r: PpeRecord) {
    setEditIssue(r);
    setIssueForm({ staffName: r.staffName, ppeType: r.ppeType, description: r.description ?? "", size: r.size ?? "", supplier: r.supplier ?? "", stockItemId: r.stockItemId ? String(r.stockItemId) : "", dateIssued: r.dateIssued, conditionCheckDate: r.conditionCheckDate ?? "", conditionAtCheck: r.conditionAtCheck ?? "", replacedDate: r.replacedDate ?? "", replacedReason: r.replacedReason ?? "", notes: r.notes ?? "", fitCheckConfirmed: r.fitCheckConfirmed ?? false, fitCheckBy: r.fitCheckBy ?? "", fitCheckNotes: r.fitCheckNotes ?? "", trainingProvided: r.trainingProvided ?? false, trainingNotes: r.trainingNotes ?? "", isActive: r.isActive });
    setShowIssueForm(true);
  }

  function openEditStock(s: PpeStockItem) {
    setEditStock(s);
    setStockForm({ ppeType: s.ppeType, description: s.description ?? "", size: s.size ?? "", quantityReceived: String(s.quantityReceived), unitCostPence: s.unitCostPence ? String((s.unitCostPence / 100).toFixed(2)) : "", supplierId: s.supplierId ? String(s.supplierId) : "", supplierName: s.supplierName ?? "", invoiceRef: s.invoiceRef ?? "", deliveryNoteRef: s.deliveryNoteRef ?? "", receivedDate: s.receivedDate ?? "", batchNumber: s.batchNumber ?? "", notes: s.notes ?? "", isActive: s.isActive });
    setShowStockForm(true);
  }

  // When a stock item is selected in the issue form, auto-fill type/description/size
  function selectStockItem(sid: string) {
    setIF("stockItemId", sid);
    if (!sid) return;
    const s = allStock.find(x => x.id === parseInt(sid));
    if (s) { setIF("ppeType", s.ppeType); setIF("description", s.description ?? ""); setIF("size", s.size ?? ""); setIF("supplier", s.supplierRecordName ?? s.supplierName ?? ""); }
  }

  const filteredIssues = allRecords.filter(r => {
    const matchStaff = !staffFilter || r.staffName.toLowerCase().includes(staffFilter.toLowerCase());
    const matchSearch = !issueSearch || r.staffName.toLowerCase().includes(issueSearch.toLowerCase()) || (ppeTypeMap[r.ppeType] ?? r.ppeType).toLowerCase().includes(issueSearch.toLowerCase());
    return matchStaff && matchSearch;
  });

  const staffNames = Array.from(new Set(members.filter(m => m.isActive).map(m => `${m.firstName} ${m.lastName}`))).sort();

  const resolveSupplierName = (item: PpeStockItem) => item.supplierRecordName ?? item.supplierName ?? "—";

  const esc = (s: string | null | undefined) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const tick = (v: boolean) => v ? `<span style="color:#166534;font-weight:700">✓</span>` : `<span style="color:#d1d5db">—</span>`;
  const riskBadge = (level: string | null) => {
    if (!level) return "—";
    const bg = level === "High" ? "#fee2e2" : level === "Medium" ? "#fef9c3" : "#dcfce7";
    const col = level === "High" ? "#b91c1c" : level === "Medium" ? "#854d0e" : "#166534";
    return `<span style="padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700;background:${bg};color:${col}">${level}</span>`;
  };

  function handlePrintCompliancePack() {
    const farm = farmMeta?.record;
    const today = new Date();

    // ── Summary counts
    const assessedTypes = new Set(allRisk.map(r => r.ppeType));
    const issuedTypes = new Set(allRecords.filter(r => r.isActive).map(r => r.ppeType));
    const unassessedTypes = [...issuedTypes].filter(t => !assessedTypes.has(t));
    const reviewOverdue = allRisk.filter(r => r.reviewDate && new Date(r.reviewDate) < today).length;
    const needsReplacement = allRecords.filter(r => r.isActive && (r.conditionAtCheck === "Needs replacement" || r.conditionAtCheck === "Condemned")).length;

    const summaryHtml = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
        ${[
          ["Risk Assessments", allRisk.length, reviewOverdue > 0 ? `${reviewOverdue} overdue for review` : "All current", reviewOverdue > 0 ? "#fef3c7" : "#dcfce7"],
          ["Stock Items", allStock.length, "", "#f0fdf4"],
          ["Active PPE Issues", allRecords.filter(r => r.isActive).length, needsReplacement > 0 ? `${needsReplacement} need attention` : "All good", needsReplacement > 0 ? "#fef3c7" : "#dcfce7"],
          ["Unassessed Types", unassessedTypes.length, unassessedTypes.length > 0 ? unassessedTypes.map(t => ppeTypeMap[t] ?? t).join(", ") : "None — full coverage", unassessedTypes.length > 0 ? "#fee2e2" : "#dcfce7"],
        ].map(([label, val, note, bg]) => `
          <div style="background:${bg};border-radius:5px;padding:8px 10px">
            <div style="font-size:7px;color:#374151;font-weight:600;text-transform:uppercase;letter-spacing:.05em">${label}</div>
            <div style="font-size:14px;font-weight:700;color:#111;margin:2px 0">${val}</div>
            ${note ? `<div style="font-size:6.5px;color:#555">${note}</div>` : ""}
          </div>`).join("")}
      </div>`;

    // ── Section 1: Risk Assessments
    const raRows = allRisk.map(r => `<tr>
      <td style="font-family:monospace;font-size:6.5px">${esc(r.assessmentRef)}</td>
      <td><strong>${esc(ppeTypeMap[r.ppeType] ?? r.ppeType)}</strong></td>
      <td>${esc(r.hazardIdentified)}</td>
      <td>${esc(r.taskOrArea)}</td>
      <td>${riskBadge(r.riskLevel)}</td>
      <td style="font-size:6.5px;max-width:100px;overflow:hidden">${esc(r.ppeSpecification)}</td>
      <td style="font-size:6.5px">${r.compatiblePpeTypes ? r.compatiblePpeTypes.split(",").filter(Boolean).map(t => ppeTypeMap[t] ?? t).join(", ") : "—"}</td>
      <td>${esc(r.assessedBy)}</td>
      <td style="white-space:nowrap">${fmt(r.assessmentDate)}</td>
      <td style="white-space:nowrap${r.reviewDate && new Date(r.reviewDate) < today ? ";color:#b91c1c;font-weight:700" : ""}">${fmt(r.reviewDate)}</td>
    </tr>`).join("");

    // ── Section 2: Stock
    const stockRows = allStock.map(s => `<tr>
      <td><strong>${esc(ppeTypeMap[s.ppeType] ?? s.ppeType)}</strong></td>
      <td>${esc(s.description)}</td>
      <td>${esc(s.size)}</td>
      <td style="font-weight:700;color:${s.quantityInStock === 0 ? "#b91c1c" : s.quantityInStock <= 2 ? "#92400e" : "#166534"}">${s.quantityInStock} / ${s.quantityReceived}</td>
      <td>${s.unitCostPence ? `£${(s.unitCostPence / 100).toFixed(2)}` : "—"}</td>
      <td>${esc(resolveSupplierName(s))}</td>
      <td style="font-family:monospace;font-size:6.5px">${esc(s.invoiceRef)}</td>
      <td style="font-family:monospace;font-size:6.5px">${esc(s.deliveryNoteRef)}</td>
      <td style="white-space:nowrap">${fmt(s.receivedDate)}</td>
    </tr>`).join("");

    // ── Section 3: Issue Register
    const issueRows = allRecords.map(r => `<tr>
      <td><strong>${esc(r.staffName)}</strong></td>
      <td>${esc(ppeTypeMap[r.ppeType] ?? r.ppeType)}</td>
      <td>${esc(r.description)}</td>
      <td>${esc(r.size)}</td>
      <td>${esc(r.supplier)}</td>
      <td style="white-space:nowrap">${fmt(r.dateIssued)}</td>
      <td style="white-space:nowrap">${fmt(r.conditionCheckDate)}</td>
      <td style="${r.conditionAtCheck === "Condemned" || r.conditionAtCheck === "Needs replacement" ? "color:#b91c1c;font-weight:700" : ""}">${esc(r.conditionAtCheck)}</td>
      <td>${r.isActive ? `<span style="background:#dcfce7;color:#166534;padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700">Active</span>` : `<span style="background:#f3f4f6;color:#6b7280;padding:1px 5px;border-radius:3px;font-size:6.5px">Replaced</span>`}</td>
    </tr>`).join("");

    const tableHtml = `
      ${summaryHtml}
      <div class="section-head">1. PPE Risk Assessments (${allRisk.length} record${allRisk.length !== 1 ? "s" : ""})</div>
      ${allRisk.length === 0 ? `<p style="font-size:7.5px;color:#6b7280;margin:0 0 12px">No risk assessments recorded.</p>` : `
      <table><thead><tr>
        <th>Ref</th><th>PPE Type</th><th>Hazard Identified</th><th>Task / Area</th><th>Risk</th>
        <th>PPE Specification</th><th>Compatible With</th><th>Assessed By</th><th>Date</th><th>Review Due</th>
      </tr></thead><tbody>${raRows}</tbody></table>`}
      <div class="section-head">2. PPE Stock Register (${allStock.length} item${allStock.length !== 1 ? "s" : ""})</div>
      ${allStock.length === 0 ? `<p style="font-size:7.5px;color:#6b7280;margin:0 0 12px">No stock items recorded.</p>` : `
      <table><thead><tr>
        <th>PPE Type</th><th>Description</th><th>Size</th><th>In Stock / Recv'd</th><th>Unit Cost</th>
        <th>Supplier</th><th>Invoice Ref</th><th>Delivery Note</th><th>Received</th>
      </tr></thead><tbody>${stockRows}</tbody></table>`}
      <div class="section-head">3. PPE Issue Register (${allRecords.length} record${allRecords.length !== 1 ? "s" : ""})</div>
      ${allRecords.length === 0 ? `<p style="font-size:7.5px;color:#6b7280;margin:0 0 12px">No issue records.</p>` : `
      <table><thead><tr>
        <th>Staff Member</th><th>PPE Type</th><th>Description</th><th>Size</th><th>Supplier</th>
        <th>Date Issued</th><th>Last Check</th><th>Condition</th><th>Status</th>
      </tr></thead><tbody>${issueRows}</tbody></table>`}`;

    printProReport({
      title: "PPE Compliance Pack",
      subtitle: "PPE at Work Regulations 2022 — Full traceability record",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      recordCount: allRisk.length + allStock.length + allRecords.length,
      recordLabel: "record",
      tableHtml,
      footerNote: "Maintained in compliance with the PPE at Work Regulations 2022. Retain for audit by Red Tractor, HSE, or other inspecting authority.",
      landscape: true,
    });
  }

  function handlePrintStaffRecord(name: string) {
    const farm = farmMeta?.record;
    const staffIssues = allRecords.filter(r => r.staffName === name).sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());
    const staffPpeTypes = new Set(staffIssues.map(r => r.ppeType));
    const relevantRisk = allRisk.filter(r => staffPpeTypes.has(r.ppeType));

    const issueRows = staffIssues.map(r => `<tr>
      <td><strong>${esc(ppeTypeMap[r.ppeType] ?? r.ppeType)}</strong></td>
      <td>${esc(r.description)}</td>
      <td>${esc(r.size)}</td>
      <td>${esc(r.supplier)}</td>
      <td style="white-space:nowrap">${fmt(r.dateIssued)}</td>
      <td style="white-space:nowrap">${fmt(r.conditionCheckDate)}</td>
      <td style="${r.conditionAtCheck === "Condemned" || r.conditionAtCheck === "Needs replacement" ? "color:#b91c1c;font-weight:700" : ""}">${esc(r.conditionAtCheck)}</td>
      <td>${r.isActive ? `<span style="background:#dcfce7;color:#166534;padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700">Active</span>` : `<span style="background:#f3f4f6;color:#6b7280;padding:1px 5px;border-radius:3px;font-size:6.5px">Replaced</span>`}</td>
      <td>${esc(r.notes)}</td>
    </tr>`).join("");

    const raRows = relevantRisk.map(r => `<tr>
      <td><strong>${esc(ppeTypeMap[r.ppeType] ?? r.ppeType)}</strong></td>
      <td>${esc(r.hazardIdentified)}</td>
      <td>${riskBadge(r.riskLevel)}</td>
      <td style="font-size:6.5px">${r.compatiblePpeTypes ? r.compatiblePpeTypes.split(",").filter(Boolean).map(t => ppeTypeMap[t] ?? t).join(", ") : "—"}</td>
      <td>${esc(r.assessedBy)}</td>
      <td style="white-space:nowrap">${fmt(r.assessmentDate)}</td>
    </tr>`).join("");

    const tableHtml = `
      <div class="section-head">PPE Issue History — ${esc(name)} (${staffIssues.length} record${staffIssues.length !== 1 ? "s" : ""})</div>
      ${staffIssues.length === 0 ? `<p style="font-size:7.5px;color:#6b7280">No PPE records found for this staff member.</p>` : `
      <table><thead><tr>
        <th>PPE Type</th><th>Description</th><th>Size</th><th>Supplier</th>
        <th>Date Issued</th><th>Last Check</th><th>Condition</th><th>Status</th><th>Notes</th>
      </tr></thead><tbody>${issueRows}</tbody></table>`}
      <div class="section-head">Applicable PPE Risk Assessments (${relevantRisk.length} record${relevantRisk.length !== 1 ? "s" : ""})</div>
      ${relevantRisk.length === 0 ? `<p style="font-size:7.5px;color:#b91c1c;font-weight:600">⚠ No risk assessments found for the PPE types issued to this staff member.</p>` : `
      <table><thead><tr>
        <th>PPE Type</th><th>Hazard</th><th>Risk</th><th>Compatible With</th><th>Assessed By</th><th>Date</th>
      </tr></thead><tbody>${raRows}</tbody></table>`}`;

    printProReport({
      title: `PPE Record — ${name}`,
      subtitle: "Individual PPE issue history and applicable risk assessments",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      tableHtml,
      footerNote: "PPE at Work Regulations 2022 — Individual PPE record. Retain for the duration of employment and a minimum of 3 years thereafter.",
      landscape: true,
    });
  }

  return (
    <div className="space-y-4">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", flex: 1 }}>
          {(["stock", "issues", "risk", "purchasing"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{ padding: "10px 20px", fontWeight: subTab === t ? 700 : 500, fontSize: "0.9rem", color: subTab === t ? "#166534" : "#6b7280", marginBottom: -2, background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: subTab === t ? "#166534" : "transparent", cursor: "pointer" }}>
            {t === "stock" ? "PPE Stock Register" : t === "issues" ? "PPE Issue Register" : t === "risk" ? "PPE Risk Assessments" : "PPE Purchasing"}
          </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handlePrintCompliancePack} style={{ marginLeft: 12, whiteSpace: "nowrap" }}>
          <Printer size={14} className="mr-2" />Print Compliance Pack
        </Button>
      </div>

      {/* ── PPE Stock ── */}
      {subTab === "stock" && (
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">PPE Stock Register</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Track PPE items held in stock with full supplier and invoice traceability.</p>
            </div>
            <Button onClick={() => { setEditStock(null); setStockForm({ ...EMPTY_STOCK }); setShowStockForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Stock
            </Button>
          </div>
          {stockLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
          ) : allStock.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-600 mb-1">No PPE stock recorded</p>
              <p className="text-sm text-gray-400">Add incoming PPE deliveries to maintain a stock register with supplier and invoice links.</p>
            </CardContent></Card>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead style={{ background: "#f9fafb" }}>
                  <tr>
                    {["PPE Type","Description","Size","Qty In Stock","Unit Cost","Supplier","Invoice Ref","Delivery Note","Received","Batch",""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allStock.map((s, i) => (
                    <tr key={s.id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : undefined }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{ppeTypeMap[s.ppeType] ?? s.ppeType}</td>
                      <td style={{ padding: "10px 14px", color: "#374151" }}>{s.description ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#6b7280" }}>{s.size ?? "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontWeight: 700, color: s.quantityInStock === 0 ? "#ef4444" : s.quantityInStock <= 2 ? "#d97706" : "#166534" }}>{s.quantityInStock}</span>
                        <span style={{ color: "#9ca3af", fontSize: "0.75rem", marginLeft: 4 }}>/ {s.quantityReceived} recv</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#374151" }}>{s.unitCostPence ? `£${(s.unitCostPence / 100).toFixed(2)}` : "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#374151" }}>{resolveSupplierName(s)}</td>
                      <td style={{ padding: "10px 14px", color: "#374151", fontFamily: "monospace", fontSize: "0.8rem" }}>{s.invoiceRef ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#374151", fontFamily: "monospace", fontSize: "0.8rem" }}>{s.deliveryNoteRef ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#374151" }}>{fmt(s.receivedDate)}</td>
                      <td style={{ padding: "10px 14px", color: "#6b7280" }}>{s.batchNumber ?? "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Button size="sm" variant="ghost" style={{ height: 28, width: 28, padding: 0 }} onClick={() => setViewStock(s)}><Eye size={13} /></Button>
                          <Button size="sm" variant="ghost" style={{ height: 28, width: 28, padding: 0 }} onClick={() => openEditStock(s)}><Pencil size={13} /></Button>
                          <Button size="sm" variant="ghost" style={{ height: 28, width: 28, padding: 0, color: "#ef4444" }} onClick={() => setDeleteStockId(s.id)}><Trash2 size={13} /></Button>
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

      {/* ── PPE Issues ── */}
      {subTab === "issues" && (
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-base">PPE Issue Register</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Record all PPE issued to named staff members. Required under PPE at Work Regulations 2022.</p>
            </div>
            <Button onClick={() => { setEditIssue(null); setIssueForm({ ...EMPTY_ISSUE }); setShowIssueForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Issue PPE
            </Button>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: "0.875rem", color: "#1e40af" }}>
            <strong>Legal requirement:</strong> Employers must provide PPE free of charge, keep a record of issue, and inspect condition regularly. The PPE at Work Regulations 2022 require documented risk assessments and individualised records.
          </div>
          <div className="flex gap-3 mb-3 flex-wrap items-center">
            <Input value={issueSearch} onChange={e => setIssueSearch(e.target.value)} placeholder="Search by name or PPE type…" style={{ maxWidth: 260 }} />
            <Select value={staffFilter || "__all__"} onValueChange={v => setStaffFilter(v === "__all__" ? "" : v)}>
              <SelectTrigger style={{ maxWidth: 220 }}><SelectValue placeholder="All staff members" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All staff members</SelectItem>
                {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              variant="outline" size="sm"
              disabled={!staffFilter}
              onClick={() => staffFilter && handlePrintStaffRecord(staffFilter)}
              title={staffFilter ? `Print PPE record for ${staffFilter}` : "Select a staff member to print their individual record"}
            >
              <FileText size={14} className="mr-2" />Print Staff Record
            </Button>
          </div>
          {issueLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
          ) : filteredIssues.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-600 mb-1">No PPE records{issueSearch || staffFilter ? " matching filter" : ""}</p>
              <p className="text-sm text-gray-400">Issue PPE to staff members and record it here.</p>
            </CardContent></Card>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead style={{ background: "#f9fafb" }}>
                  <tr>
                    {["Staff Member","PPE Type","Size","Date Issued","Fit ✓","Training ✓","Condition","Status",""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((r, i) => (
                    <tr key={r.id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : undefined }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{r.staffName}</td>
                      <td style={{ padding: "10px 14px" }}>{ppeTypeMap[r.ppeType] ?? r.ppeType}</td>
                      <td style={{ padding: "10px 14px", color: "#6b7280" }}>{r.size ?? "—"}</td>
                      <td style={{ padding: "10px 14px" }}>{fmt(r.dateIssued)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>{r.fitCheckConfirmed ? <CheckCircle2 className="w-4 h-4 text-green-600 inline" /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>{r.trainingProvided ? <CheckCircle2 className="w-4 h-4 text-green-600 inline" /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                      <td style={{ padding: "10px 14px" }}>{r.conditionAtCheck ?? "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: r.isActive ? "#dcfce7" : "#f3f4f6", color: r.isActive ? "#166534" : "#6b7280" }}>{r.isActive ? "Active" : "Replaced"}</span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Button size="sm" variant="ghost" style={{ height: 28, width: 28, padding: 0 }} onClick={() => setViewIssue(r)}><Eye size={13} /></Button>
                          <Button size="sm" variant="ghost" style={{ height: 28, width: 28, padding: 0 }} onClick={() => openEditIssue(r)}><Pencil size={13} /></Button>
                          <Button size="sm" variant="ghost" style={{ height: 28, width: 28, padding: 0, color: "#ef4444" }} onClick={() => setDeleteIssueId(r.id)}><Trash2 size={13} /></Button>
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

      {/* ── View Stock Dialog ── */}
      {viewStock && (
        <Dialog open onOpenChange={() => setViewStock(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>PPE Stock Item — {ppeTypeMap[viewStock.ppeType] ?? viewStock.ppeType}</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8, fontSize: "0.875rem" }}>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>PPE Type</p><p className="font-semibold">{ppeTypeMap[viewStock.ppeType] ?? viewStock.ppeType}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Description</p><p>{viewStock.description ?? "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Size</p><p>{viewStock.size ?? "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Received</p><p className="font-semibold">{viewStock.quantityReceived}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>In Stock</p><p className="font-semibold" style={{ color: viewStock.quantityInStock === 0 ? "#ef4444" : "#166534" }}>{viewStock.quantityInStock}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Unit Cost</p><p>{viewStock.unitCostPence ? `£${(viewStock.unitCostPence / 100).toFixed(2)}` : "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Supplier</p><p>{resolveSupplierName(viewStock)}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Invoice Ref</p><p className="font-mono text-sm">{viewStock.invoiceRef ?? "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Delivery Note</p><p className="font-mono text-sm">{viewStock.deliveryNoteRef ?? "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Received Date</p><p>{fmt(viewStock.receivedDate)}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Batch Number</p><p className="font-mono text-sm">{viewStock.batchNumber ?? "—"}</p></div>
              {viewStock.notes && <div style={{ gridColumn: "1 / -1" }}><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Notes</p><p style={{ whiteSpace: "pre-line" }}>{viewStock.notes}</p></div>}
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button variant="outline" onClick={() => { openEditStock(viewStock); setViewStock(null); }}><Pencil size={13} className="mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewStock(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── View Issue Dialog ── */}
      {viewIssue && (
        <Dialog open onOpenChange={() => setViewIssue(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>PPE Record — {viewIssue.staffName}</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8, fontSize: "0.875rem" }}>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Staff Member</p><p className="font-semibold">{viewIssue.staffName}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>PPE Type</p><p>{ppeTypeMap[viewIssue.ppeType] ?? viewIssue.ppeType}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Description</p><p>{viewIssue.description ?? "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Size</p><p>{viewIssue.size ?? "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Supplier</p><p>{viewIssue.supplier ?? "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Date Issued</p><p>{fmt(viewIssue.dateIssued)}</p></div>
              {viewIssue.stockItemId && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>From Stock Batch</p><p>#{viewIssue.stockItemId} — {ppeTypeMap[allStock.find(s => s.id === viewIssue.stockItemId)?.ppeType ?? ""] ?? "—"}</p></div>}
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Condition Check Date</p><p>{fmt(viewIssue.conditionCheckDate)}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Condition at Check</p><p>{viewIssue.conditionAtCheck ?? "—"}</p></div>
              {viewIssue.replacedDate && <><div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Replaced Date</p><p>{fmt(viewIssue.replacedDate)}</p></div><div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Replacement Reason</p><p>{viewIssue.replacedReason ?? "—"}</p></div></>}
              {viewIssue.notes && <div style={{ gridColumn: "1 / -1" }}><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Notes</p><p style={{ whiteSpace: "pre-line" }}>{viewIssue.notes}</p></div>}
              {viewIssue.fitCheckConfirmed && (
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
                  <p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Individual Fit Check</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><p style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Status</p><p style={{ color: "#166534", fontWeight: 600 }}>✓ Fit confirmed</p></div>
                    {viewIssue.fitCheckBy && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Confirmed By</p><p>{viewIssue.fitCheckBy}</p></div>}
                    {viewIssue.fitCheckNotes && <div style={{ gridColumn: "1 / -1" }}><p style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Fit Check Notes</p><p style={{ whiteSpace: "pre-line" }}>{viewIssue.fitCheckNotes}</p></div>}
                  </div>
                </div>
              )}
              {viewIssue.trainingProvided && (
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
                  <p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>PPE Training</p>
                  <div><p style={{ color: "#166534", fontWeight: 600 }}>✓ Training provided</p></div>
                  {viewIssue.trainingNotes && <p style={{ marginTop: 4, whiteSpace: "pre-line", color: "#374151" }}>{viewIssue.trainingNotes}</p>}
                </div>
              )}
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button variant="outline" onClick={() => { openEditIssue(viewIssue); setViewIssue(null); }}><Pencil size={13} className="mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewIssue(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Stock Form Dialog ── */}
      {showStockForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowStockForm(false); setEditStock(null); } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editStock ? "Edit Stock Item" : "Add PPE to Stock"}</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
              <div style={{ gridColumn: "1 / -1" }}><Label>PPE Type *</Label>
                <Select value={stockForm.ppeType} onValueChange={v => setSF("ppeType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ppeTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Description / Specification</Label>
                {(EN_ISO[stockForm.ppeType] ?? []).length > 0 && (
                  <Select value="" onValueChange={v => setSF("description", v)}>
                    <SelectTrigger className="mb-1"><SelectValue placeholder={`Quick-fill EN ISO standard for ${ppeTypeMap[stockForm.ppeType] ?? stockForm.ppeType}…`} /></SelectTrigger>
                    <SelectContent>{(EN_ISO[stockForm.ppeType] ?? []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                <Input value={stockForm.description} onChange={e => setSF("description", e.target.value)} placeholder="e.g. EN ISO 20345:2011 S3 safety boot" />
              </div>
              <div>
                <Label>Size</Label>
                {(PPE_SIZES[stockForm.ppeType] ?? []).length > 0 ? (
                  <>
                    <Select value={(PPE_SIZES[stockForm.ppeType] ?? []).includes(stockForm.size) ? stockForm.size : "__other__"} onValueChange={v => { if (v !== "__other__") setSF("size", v); else setSF("size", ""); }}>
                      <SelectTrigger><SelectValue placeholder="Select size…" /></SelectTrigger>
                      <SelectContent>{(PPE_SIZES[stockForm.ppeType] ?? []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}<SelectItem value="__other__">Other / specify…</SelectItem></SelectContent>
                    </Select>
                    {!(PPE_SIZES[stockForm.ppeType] ?? []).includes(stockForm.size) && <Input className="mt-1" value={stockForm.size} onChange={e => setSF("size", e.target.value)} placeholder="Specify size" />}
                  </>
                ) : (
                  <Input value={stockForm.size} onChange={e => setSF("size", e.target.value)} placeholder="Size" />
                )}
              </div>
              <div><Label>Quantity Received *</Label><Input type="number" min="0" value={stockForm.quantityReceived} onChange={e => setSF("quantityReceived", e.target.value)} /></div>
              <div><Label>Unit Cost (£)</Label><Input type="number" step="0.01" min="0" value={stockForm.unitCostPence} onChange={e => setSF("unitCostPence", e.target.value)} placeholder="e.g. 24.99" /></div>
              <div><Label>Received Date</Label><Input type="date" value={stockForm.receivedDate} onChange={e => setSF("receivedDate", e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}><Label>Supplier</Label>
                <Select value={stockForm.supplierId || "__text__"} onValueChange={v => { if (v === "__text__") { setSF("supplierId", ""); } else { setSF("supplierId", v); setSF("supplierName", suppliers.find(s => String(s.id) === v)?.name ?? ""); } }}>
                  <SelectTrigger><SelectValue placeholder="Select from supplier register…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__text__">— Type supplier name manually —</SelectItem>
                    {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!stockForm.supplierId && <Input className="mt-2" value={stockForm.supplierName} onChange={e => setSF("supplierName", e.target.value)} placeholder="Supplier name (if not in register)" />}
              </div>
              <div><Label>Invoice Reference</Label><Input value={stockForm.invoiceRef} onChange={e => setSF("invoiceRef", e.target.value)} placeholder="e.g. INV-2024-1234" /></div>
              <div><Label>Delivery Note Ref</Label><Input value={stockForm.deliveryNoteRef} onChange={e => setSF("deliveryNoteRef", e.target.value)} placeholder="e.g. DN-4567" /></div>
              <div><Label>Batch Number</Label><Input value={stockForm.batchNumber} onChange={e => setSF("batchNumber", e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}><Label>Notes</Label><Textarea value={stockForm.notes} onChange={e => setSF("notes", e.target.value)} rows={2} /></div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button variant="outline" onClick={() => { setShowStockForm(false); setEditStock(null); }}>Cancel</Button>
              <Button onClick={() => editStock ? updateStockMut.mutate({ ...stockForm, id: editStock.id }) : createStockMut.mutate(stockForm)} disabled={!stockForm.ppeType || createStockMut.isPending || updateStockMut.isPending}>
                {(createStockMut.isPending || updateStockMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editStock ? "Update" : "Add to Stock"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Issue PPE Form Dialog ── */}
      {showIssueForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowIssueForm(false); setEditIssue(null); } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editIssue ? "Edit PPE Issue Record" : "Issue PPE to Staff Member"}</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
              <div style={{ gridColumn: "1 / -1" }}><Label>Staff Member *</Label>
                <Select value={issueForm.staffName || "__text__"} onValueChange={v => setIF("staffName", v === "__text__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__text__">— Type name manually —</SelectItem>
                    {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                {(!issueForm.staffName || !staffNames.includes(issueForm.staffName)) && <Input className="mt-2" value={issueForm.staffName} onChange={e => setIF("staffName", e.target.value)} placeholder="Full name" />}
              </div>
              {allStock.length > 0 && (
                <div style={{ gridColumn: "1 / -1" }}><Label>Issue From Stock (optional)</Label>
                  <Select value={issueForm.stockItemId || "__none__"} onValueChange={v => selectStockItem(v === "__none__" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select stock item to auto-fill details…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not from stock —</SelectItem>
                      {allStock.filter(s => s.quantityInStock > 0).map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{ppeTypeMap[s.ppeType] ?? s.ppeType}{s.description ? ` — ${s.description}` : ""}{s.size ? ` (${s.size})` : ""} · {s.quantityInStock} in stock</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div style={{ gridColumn: "1 / -1" }}><Label>PPE Type *</Label>
                <Select value={issueForm.ppeType} onValueChange={v => setIF("ppeType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ppeTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Description / Specification</Label>
                {(EN_ISO[issueForm.ppeType] ?? []).length > 0 && (
                  <Select value="" onValueChange={v => setIF("description", v)}>
                    <SelectTrigger className="mb-1"><SelectValue placeholder={`Quick-fill EN ISO standard for ${ppeTypeMap[issueForm.ppeType] ?? issueForm.ppeType}…`} /></SelectTrigger>
                    <SelectContent>{(EN_ISO[issueForm.ppeType] ?? []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                <Input value={issueForm.description} onChange={e => setIF("description", e.target.value)} placeholder="e.g. EN ISO 20345:2011 S3 steel toe" />
              </div>
              <div>
                <Label>Size</Label>
                {(PPE_SIZES[issueForm.ppeType] ?? []).length > 0 ? (
                  <>
                    <Select value={(PPE_SIZES[issueForm.ppeType] ?? []).includes(issueForm.size) ? issueForm.size : "__other__"} onValueChange={v => { if (v !== "__other__") setIF("size", v); else setIF("size", ""); }}>
                      <SelectTrigger><SelectValue placeholder="Select size…" /></SelectTrigger>
                      <SelectContent>{(PPE_SIZES[issueForm.ppeType] ?? []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}<SelectItem value="__other__">Other / specify…</SelectItem></SelectContent>
                    </Select>
                    {!(PPE_SIZES[issueForm.ppeType] ?? []).includes(issueForm.size) && <Input className="mt-1" value={issueForm.size} onChange={e => setIF("size", e.target.value)} placeholder="Specify size" />}
                  </>
                ) : (
                  <Input value={issueForm.size} onChange={e => setIF("size", e.target.value)} placeholder="Size" />
                )}
              </div>
              <div><Label>Supplier</Label><Input value={issueForm.supplier} onChange={e => setIF("supplier", e.target.value)} /></div>
              <div><Label>Date Issued *</Label><Input type="date" value={issueForm.dateIssued} onChange={e => setIF("dateIssued", e.target.value)} /></div>
              <div><Label>Condition Check Date</Label><Input type="date" value={issueForm.conditionCheckDate} onChange={e => setIF("conditionCheckDate", e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}><Label>Condition at Last Check</Label>
                <Select value={issueForm.conditionAtCheck || ""} onValueChange={v => setIF("conditionAtCheck", v || "")}>
                  <SelectTrigger><SelectValue placeholder="Select condition…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">Good — fit for purpose</SelectItem>
                    <SelectItem value="Acceptable">Acceptable — minor wear</SelectItem>
                    <SelectItem value="Needs replacement">Needs Replacement</SelectItem>
                    <SelectItem value="Condemned">Condemned — taken out of use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Replaced Date</Label><Input type="date" value={issueForm.replacedDate} onChange={e => setIF("replacedDate", e.target.value)} /></div>
              <div><Label>Replacement Reason</Label><Input value={issueForm.replacedReason} onChange={e => setIF("replacedReason", e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}><Label>Notes</Label><Textarea value={issueForm.notes} onChange={e => setIF("notes", e.target.value)} rows={2} /></div>

              <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 14 }}>
                <p className="text-sm font-semibold text-gray-700 mb-3">Individual Fit Check</p>
                <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
                  <input type="checkbox" checked={issueForm.fitCheckConfirmed} onChange={e => setIF("fitCheckConfirmed", e.target.checked)} className="w-4 h-4 accent-green-700" />
                  Individual fit confirmed for this staff member
                </label>
                {issueForm.fitCheckConfirmed && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><Label>Confirmed By</Label>
                      <Select value={issueForm.fitCheckBy || "__text__"} onValueChange={v => setIF("fitCheckBy", v === "__text__" ? "" : v)}>
                        <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__text__">— Type name manually —</SelectItem>
                          {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {(!issueForm.fitCheckBy || !staffNames.includes(issueForm.fitCheckBy)) && <Input className="mt-2" value={issueForm.fitCheckBy} onChange={e => setIF("fitCheckBy", e.target.value)} placeholder="Full name" />}
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}><Label>Fit Check Notes</Label><Textarea value={issueForm.fitCheckNotes} onChange={e => setIF("fitCheckNotes", e.target.value)} placeholder="e.g. Checked fit and seal — correct size M confirmed" rows={2} /></div>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 14 }}>
                <p className="text-sm font-semibold text-gray-700 mb-3">PPE Training</p>
                <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
                  <input type="checkbox" checked={issueForm.trainingProvided} onChange={e => setIF("trainingProvided", e.target.checked)} className="w-4 h-4 accent-green-700" />
                  Training on correct use and maintenance provided
                </label>
                {issueForm.trainingProvided && <div><Label>Training Notes</Label><Textarea value={issueForm.trainingNotes} onChange={e => setIF("trainingNotes", e.target.value)} placeholder="e.g. Toolbox talk 01/06/2026 — donning/doffing, storage, inspection schedule" rows={2} /></div>}
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="issueActive" checked={issueForm.isActive} onChange={e => setIF("isActive", e.target.checked)} style={{ height: 16, width: 16 }} />
                <Label htmlFor="issueActive">Item currently active / in use</Label>
              </div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button variant="outline" onClick={() => { setShowIssueForm(false); setEditIssue(null); }}>Cancel</Button>
              <Button onClick={() => editIssue ? updateIssueMut.mutate({ ...issueForm, id: editIssue.id }) : createIssueMut.mutate(issueForm)} disabled={!issueForm.staffName || !issueForm.dateIssued || createIssueMut.isPending || updateIssueMut.isPending}>
                {(createIssueMut.isPending || updateIssueMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editIssue ? "Update" : "Issue PPE"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete Stock Confirm ── */}
      {deleteStockId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteStockId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Stock Item?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This stock record will be permanently removed. Any issue records linked to it will retain their stock reference.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteStockId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteStockMut.mutate(deleteStockId!)} disabled={deleteStockMut.isPending}>{deleteStockMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Remove"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete Issue Confirm ── */}
      {deleteIssueId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteIssueId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove PPE Record?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This PPE issue record will be permanently removed from the register.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteIssueId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteIssueMut.mutate(deleteIssueId!)} disabled={deleteIssueMut.isPending}>{deleteIssueMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Remove"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── PPE Purchasing ── */}
      {subTab === "purchasing" && (
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">PPE Purchase Orders</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Raise PPE orders, track delivery, and receive goods directly into the PPE Stock Register.</p>
            </div>
            <Button onClick={openPoAdd}><Plus className="w-4 h-4 mr-2" />Raise PPE Order</Button>
          </div>
          {allPpos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 8 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
              <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No PPE purchase orders yet</p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Raise a PPE order to track purchasing from supplier through to stock receipt.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead style={{ background: "#f9fafb" }}>
                  <tr>{["PO Number","Supplier","Status","Order Date","Exp. Delivery","GRN",""].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {allPpos.map((po, i) => {
                    const statusColors: Record<string, [string, string]> = { draft: ["#f3f4f6","#6b7280"], sent: ["#eff6ff","#1d4ed8"], partially_received: ["#fef3c7","#92400e"], fully_received: ["#dcfce7","#166534"], cancelled: ["#fef2f2","#b91c1c"] };
                    const [sbg, scol] = statusColors[po.status] ?? ["#f3f4f6","#6b7280"];
                    const statusLabel: Record<string, string> = { draft: "Draft", sent: "Sent", partially_received: "Part Received", fully_received: "Fully Received", cancelled: "Cancelled" };
                    return (
                      <tr key={po.id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : undefined }}>
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: 700 }}>{po.poNumber}</td>
                        <td style={{ padding: "10px 14px" }}>{po.supplierName ?? "—"}</td>
                        <td style={{ padding: "10px 14px" }}><span style={{ background: sbg, color: scol, borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }}>{statusLabel[po.status] ?? po.status}</span></td>
                        <td style={{ padding: "10px 14px", color: "#374151", whiteSpace: "nowrap" }}>{fmt(po.orderDate)}</td>
                        <td style={{ padding: "10px 14px", color: "#374151", whiteSpace: "nowrap" }}>{po.expectedDeliveryDate ? fmt(po.expectedDeliveryDate) : "—"}</td>
                        <td style={{ padding: "10px 14px", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }}>{po.grnNumber ?? "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div className="flex gap-1">
                            {!["fully_received","cancelled"].includes(po.status) && <Button size="sm" variant="outline" onClick={() => openGrn(po)}>Receive</Button>}
                            <Button size="sm" variant="ghost" onClick={() => openPoEdit(po)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => deletePoMut.mutate(po.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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

      {/* ── PPE Risk Assessments ── */}
      {subTab === "risk" && (
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">PPE Risk Assessments</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Documented risk assessments required by the PPE at Work Regulations 2022 — confirming correct PPE selection, individual fit, and compatibility.</p>
            </div>
            <Button onClick={() => { setEditRisk(null); setRiskForm({ ...EMPTY_RISK }); setShowRiskForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Assessment
            </Button>
          </div>

          {riskLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
          ) : allRisk.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-600 mb-1">No PPE risk assessments recorded</p>
              <p className="text-sm text-gray-400">Create a risk assessment before issuing PPE to staff. This satisfies the PPE at Work Regulations 2022 documentation requirement.</p>
            </CardContent></Card>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead style={{ background: "#f9fafb" }}>
                  <tr>
                    {["Ref","PPE Type","Hazard Identified","Task / Area","Risk","PPE Specification","Compatible With","Assessed By","Date","Review Due",""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allRisk.map((r, i) => {
                    const reviewDue = r.reviewDate ? new Date(r.reviewDate) : null;
                    const today = new Date();
                    const reviewOverdue = reviewDue && reviewDue < today;
                    const reviewSoon = reviewDue && !reviewOverdue && (reviewDue.getTime() - today.getTime()) < 30 * 24 * 60 * 60 * 1000;
                    return (
                      <tr key={r.id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : undefined }}>
                        <td style={{ padding: "10px 14px", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }}>{r.assessmentRef ?? "—"}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}>{ppeTypeMap[r.ppeType] ?? r.ppeType}</td>
                        <td style={{ padding: "10px 14px", color: "#374151", maxWidth: 200 }}><span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.hazardIdentified}</span></td>
                        <td style={{ padding: "10px 14px", color: "#6b7280" }}>{r.taskOrArea ?? "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          {r.riskLevel ? (
                            <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700, background: r.riskLevel === "High" ? "#fee2e2" : r.riskLevel === "Medium" ? "#fef9c3" : "#dcfce7", color: r.riskLevel === "High" ? "#b91c1c" : r.riskLevel === "Medium" ? "#854d0e" : "#166534" }}>{r.riskLevel}</span>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#374151", maxWidth: 150 }}><span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.ppeSpecification ?? "—"}</span></td>
                        <td style={{ padding: "10px 14px" }}>
                          {r.compatiblePpeTypes ? (
                            <div className="flex flex-wrap gap-1">
                              {r.compatiblePpeTypes.split(",").filter(Boolean).map(t => (
                                <span key={t} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 4, padding: "1px 6px", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{ppeTypeMap[t] ?? t}</span>
                              ))}
                            </div>
                          ) : <span style={{ color: "#d1d5db" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#374151" }}>{r.assessedBy}</td>
                        <td style={{ padding: "10px 14px", color: "#374151" }}>{fmt(r.assessmentDate)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          {reviewDue ? (
                            <span style={{ color: reviewOverdue ? "#b91c1c" : reviewSoon ? "#d97706" : "#374151", fontWeight: reviewOverdue || reviewSoon ? 700 : 400 }}>
                              {reviewOverdue ? "⚠ " : reviewSoon ? "⏰ " : ""}{fmt(r.reviewDate)}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditRisk(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteRiskId(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Add / Edit Risk Assessment Dialog ── */}
          {showRiskForm && (
            <Dialog open onOpenChange={o => { if (!o) { setShowRiskForm(false); setEditRisk(null); } }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editRisk ? "Edit PPE Risk Assessment" : "New PPE Risk Assessment"}</DialogTitle></DialogHeader>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    {editRisk ? (
                      <div>
                        <Label>Assessment Reference</Label>
                        <Input style={{ fontFamily: "monospace", fontWeight: 700 }} value={riskForm.assessmentRef} onChange={e => setRF("assessmentRef", e.target.value)} placeholder="e.g. PPE-RA-001" />
                      </div>
                    ) : (
                      <div>
                        <Label>Assessment Reference</Label>
                        <div style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", marginTop: 4 }}>Auto-generated on save</div>
                      </div>
                    )}
                  </div>
                  <div><Label>PPE Type *</Label>
                    <Select value={riskForm.ppeType} onValueChange={v => setRF("ppeType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ppeTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}><Label>Hazard Identified *</Label><Textarea value={riskForm.hazardIdentified} onChange={e => setRF("hazardIdentified", e.target.value)} placeholder="Describe the hazard this PPE protects against (e.g. grain dust — risk of respiratory disease)" rows={2} /></div>
                  <div><Label>Task or Area</Label><Input value={riskForm.taskOrArea} onChange={e => setRF("taskOrArea", e.target.value)} placeholder="e.g. Grain handling, Chemical spraying" /></div>
                  <div><Label>Risk Level</Label>
                    <Select value={riskForm.riskLevel} onValueChange={v => setRF("riskLevel", v)}>
                      <SelectTrigger><SelectValue placeholder="Select risk level…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not specified</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}><Label>PPE Specification</Label><Textarea value={riskForm.ppeSpecification} onChange={e => setRF("ppeSpecification", e.target.value)} placeholder="Specific standard, EN number, manufacturer or model required (e.g. EN 149:2001+A1:2009 FFP3 respirator)" rows={2} /></div>

                  <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                    <p className="text-sm font-semibold text-gray-700 mb-1">PPE Compatibility</p>
                    <p className="text-xs text-gray-500 mb-3">Select all other PPE types confirmed compatible with this item when worn simultaneously.</p>
                    {(() => {
                      const stockTypes = Array.from(new Set(allStock.filter(s => s.isActive && s.ppeType !== riskForm.ppeType).map(s => s.ppeType)));
                      const selectedTypes = riskForm.compatiblePpeTypes ? riskForm.compatiblePpeTypes.split(",").filter(Boolean) : [];
                      return stockTypes.length === 0
                        ? <p className="text-xs text-gray-400 italic">No other PPE types in the stock register. Add stock items to enable compatibility linking.</p>
                        : <div className="flex flex-wrap gap-x-6 gap-y-2">{stockTypes.map(t => {
                            const checked = selectedTypes.includes(t);
                            return (
                              <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={checked} onChange={() => {
                                  const updated = checked ? selectedTypes.filter(x => x !== t) : [...selectedTypes, t];
                                  setRF("compatiblePpeTypes", updated.join(","));
                                }} className="w-4 h-4 accent-green-700" />
                                {ppeTypeMap[t] ?? t}
                              </label>
                            );
                          })}</div>;
                    })()}
                  </div>

                  <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><Label>Assessed By *</Label>
                      <Select value={riskForm.assessedBy || "__text__"} onValueChange={v => setRF("assessedBy", v === "__text__" ? "" : v)}>
                        <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__text__">— Type name manually —</SelectItem>
                          {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {(!riskForm.assessedBy || !staffNames.includes(riskForm.assessedBy)) && <Input className="mt-2" value={riskForm.assessedBy} onChange={e => setRF("assessedBy", e.target.value)} placeholder="Full name of assessor" />}
                    </div>
                    <div><Label>Assessment Date *</Label><Input type="date" value={riskForm.assessmentDate} onChange={e => setRF("assessmentDate", e.target.value)} /></div>
                    <div><Label>Review Date</Label><Input type="date" value={riskForm.reviewDate} onChange={e => setRF("reviewDate", e.target.value)} /></div>
                    <div />
                    <div style={{ gridColumn: "1 / -1" }}><Label>Notes</Label><Textarea value={riskForm.notes} onChange={e => setRF("notes", e.target.value)} placeholder="Any additional notes…" rows={2} /></div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setShowRiskForm(false); setEditRisk(null); }}>Cancel</Button>
                  <Button
                    disabled={!riskForm.ppeType || !riskForm.hazardIdentified || !riskForm.assessedBy || !riskForm.assessmentDate || createRiskMut.isPending || updateRiskMut.isPending}
                    onClick={() => {
                      if (editRisk) updateRiskMut.mutate({ ...riskForm, id: editRisk.id });
                      else createRiskMut.mutate(riskForm);
                    }}
                  >
                    {createRiskMut.isPending || updateRiskMut.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    {editRisk ? "Save Changes" : "Save Assessment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* ── Delete Risk Assessment Confirmation ── */}
          {deleteRiskId !== null && (
            <Dialog open onOpenChange={o => { if (!o) setDeleteRiskId(null); }}>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Delete Risk Assessment?</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">This PPE risk assessment record will be permanently deleted.</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteRiskId(null)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => deleteRiskMut.mutate(deleteRiskId!)} disabled={deleteRiskMut.isPending}>{deleteRiskMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* ── PPE PO Form Dialog ── */}
      {showPoForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowPoForm(false); setEditPo(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editPo ? "Edit PPE Order" : "Raise PPE Purchase Order"}</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Supplier</Label>
                <Select value={poForm.supplierId || "__text__"} onValueChange={v => { if (v === "__text__") { setSPF("supplierId", ""); } else { setSPF("supplierId", v); setSPF("supplierName", suppliers.find(s => String(s.id) === v)?.name ?? ""); } }}>
                  <SelectTrigger><SelectValue placeholder="Select from supplier register…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__text__">— Type supplier name manually —</SelectItem>
                    {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!poForm.supplierId && <Input className="mt-2" value={poForm.supplierName} onChange={e => setSPF("supplierName", e.target.value)} placeholder="Supplier name (if not in register)" />}
              </div>
              <div><Label>Order Date *</Label><Input type="date" value={poForm.orderDate} onChange={e => setSPF("orderDate", e.target.value)} /></div>
              <div><Label>Expected Delivery</Label><Input type="date" value={poForm.expectedDeliveryDate} onChange={e => setSPF("expectedDeliveryDate", e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Submitted By</Label>
                <Select value={poForm.submittedByName || "__text__"} onValueChange={v => setSPF("submittedByName", v === "__text__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__text__">— Type name manually —</SelectItem>
                    {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                {(!poForm.submittedByName || !staffNames.includes(poForm.submittedByName)) && <Input className="mt-2" value={poForm.submittedByName} onChange={e => setSPF("submittedByName", e.target.value)} placeholder="Name of person raising order" />}
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Order Lines</Label>
                <Button size="sm" variant="outline" onClick={() => setPoLines(ls => [...ls, { ...EMPTY_PO_LINE }])}><Plus className="w-3.5 h-3.5 mr-1" />Add Line</Button>
              </div>
              <div className="space-y-2">
                {poLines.map((line, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 80px 90px 36px", gap: 8, alignItems: "end", background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }}>
                    <div><Label style={{ fontSize: "0.7rem" }}>PPE Type</Label>
                      <Select value={line.ppeType} onValueChange={v => setPoLines(ls => ls.map((l, i) => i === idx ? { ...l, ppeType: v } : l))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ppeTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label style={{ fontSize: "0.7rem" }}>Description</Label><Input value={line.description} onChange={e => setPoLines(ls => ls.map((l, i) => i === idx ? { ...l, description: e.target.value } : l))} placeholder="Specification" /></div>
                    <div><Label style={{ fontSize: "0.7rem" }}>Size</Label><Input value={line.size} onChange={e => setPoLines(ls => ls.map((l, i) => i === idx ? { ...l, size: e.target.value } : l))} placeholder="Size" /></div>
                    <div><Label style={{ fontSize: "0.7rem" }}>Qty *</Label><Input type="number" min="1" value={line.quantityOrdered} onChange={e => setPoLines(ls => ls.map((l, i) => i === idx ? { ...l, quantityOrdered: e.target.value } : l))} /></div>
                    <div><Label style={{ fontSize: "0.7rem" }}>Unit £</Label><Input type="number" step="0.01" min="0" value={line.unitPricePence} onChange={e => setPoLines(ls => ls.map((l, i) => i === idx ? { ...l, unitPricePence: e.target.value } : l))} placeholder="0.00" /></div>
                    <div style={{ paddingBottom: 2 }}><Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setPoLines(ls => ls.filter((_, i) => i !== idx))} disabled={poLines.length === 1}><Trash2 className="w-3.5 h-3.5" /></Button></div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12 }}><Label>Notes</Label><Textarea value={poForm.notes} onChange={e => setSPF("notes", e.target.value)} rows={2} /></div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button variant="outline" onClick={() => { setShowPoForm(false); setEditPo(null); }}>Cancel</Button>
              <Button
                disabled={!poForm.orderDate || poLines.length === 0 || createPoMut.isPending || updatePoMut.isPending}
                onClick={() => {
                  const payload = { ...poForm, supplierId: poForm.supplierId ? parseInt(poForm.supplierId) : null, lines: poLines.map(l => ({ ...l, quantityOrdered: parseInt(l.quantityOrdered) || 1, unitPricePence: l.unitPricePence ? Math.round(parseFloat(l.unitPricePence) * 100) : null })) };
                  if (editPo) updatePoMut.mutate(payload as Record<string, unknown>);
                  else createPoMut.mutate(payload as Record<string, unknown>);
                }}
              >
                {(createPoMut.isPending || updatePoMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editPo ? "Update Order" : "Raise Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── GRN — Record Goods Receipt ── */}
      {showGrnDialog && (
        <Dialog open onOpenChange={o => { if (!o) setShowGrnDialog(null); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Receive Goods — {showGrnDialog.poNumber}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground mb-3">A PPE-GRN reference is auto-generated. Items received are added to the PPE Stock Register automatically.</p>
            <div><Label>Actual Delivery Date</Label><Input type="date" value={grnDate} onChange={e => setGrnDate(e.target.value)} /></div>
            <div style={{ marginTop: 12 }}>
              <Label className="text-sm font-semibold mb-2 block">Quantities Received</Label>
              {(showGrnDialog.lines ?? []).map(line => (
                <div key={line.id} style={{ display: "grid", gridTemplateColumns: "1fr auto 90px", gap: 8, alignItems: "center", marginBottom: 8, background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }}>
                  <div>
                    <div className="font-medium text-sm">{ppeTypeMap[line.ppeType] ?? line.ppeType}</div>
                    {line.description && <div className="text-xs text-gray-500">{line.description}{line.size ? ` — ${line.size}` : ""}</div>}
                    <div className="text-xs text-gray-400">Ordered: {line.quantityOrdered} | Already received: {line.quantityReceived}</div>
                  </div>
                  <Label style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>Qty now received:</Label>
                  <Input type="number" min="0" max={line.quantityOrdered - line.quantityReceived} value={grnQtys[line.id] ?? ""} onChange={e => setGrnQtys(q => ({ ...q, [line.id]: e.target.value }))} placeholder="0" />
                </div>
              ))}
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button variant="outline" onClick={() => setShowGrnDialog(null)}>Cancel</Button>
              <Button
                disabled={receivePoMut.isPending}
                onClick={() => {
                  const lines = (showGrnDialog.lines ?? []).map(l => ({ lineId: l.id, quantityReceived: parseInt(grnQtys[l.id] ?? "0") || 0 })).filter(l => l.quantityReceived > 0);
                  if (!lines.length) { toast({ title: "Enter at least one quantity received", variant: "destructive" }); return; }
                  receivePoMut.mutate({ actualDeliveryDate: grnDate, lines });
                }}
              >
                {receivePoMut.isPending && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                Record Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useMembers(farmId: number | null) {
  return useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load staff");
      return res.json();
    },
    enabled: !!farmId,
  });
}

function useCerts(farmId: number | null) {
  return useQuery<{ records: CertRecord[] }>({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
}

function useRtw(farmId: number | null) {
  return useQuery<{ records: RtwRecord[] }>({
    queryKey: ["staff-rtw", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/right-to-work`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
}

// ─── Utility Badges ───────────────────────────────────────────────────────────

function RtwBadge({ name, records }: { name: string; records: RtwRecord[] }) {
  const mine = records.filter(r => r.staffName.toLowerCase().trim() === name.toLowerCase().trim());
  if (mine.length === 0) return (
    <span className="text-xs font-medium text-red-600 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />Not checked
    </span>
  );
  const now = new Date();
  const expired = mine.some(r => r.expiryDate && new Date(r.expiryDate) < now);
  const urgent = mine.some(r => {
    if (!r.expiryDate) return false;
    const d = Math.floor((new Date(r.expiryDate).getTime() - now.getTime()) / 86400000);
    return d >= 0 && d <= 28;
  });
  if (expired) return <span className="text-xs font-medium text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Expired</span>;
  if (urgent) return <span className="text-xs font-medium text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Expiring soon</span>;
  return <span className="text-xs font-medium text-green-600 flex items-center gap-1"><UserCheck className="w-3 h-3" />Checked</span>;
}

function CertBadge({ name, certs }: { name: string; certs: CertRecord[] }) {
  const mine = certs.filter(c => c.userId === name);
  if (mine.length === 0) return <span className="text-xs text-muted-foreground italic">None recorded</span>;
  const now = new Date();
  const expired = mine.filter(c => c.expiryDate && new Date(c.expiryDate) < now).length;
  const expiring = mine.filter(c => {
    if (!c.expiryDate) return false;
    const days = Math.floor((new Date(c.expiryDate).getTime() - now.getTime()) / 86400000);
    return days >= 0 && days <= 60;
  }).length;
  if (expired > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
      <AlertTriangle className="w-3 h-3" />{mine.length} cert{mine.length !== 1 ? "s" : ""} · {expired} expired
    </span>
  );
  if (expiring > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
      <AlertTriangle className="w-3 h-3" />{mine.length} cert{mine.length !== 1 ? "s" : ""} · {expiring} expiring
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
      <Award className="w-3 h-3" />{mine.length} cert{mine.length !== 1 ? "s" : ""}
    </span>
  );
}

// ─── Add Member Dialog ────────────────────────────────────────────────────────

function AddMemberDialog({ farmId, open, onClose, departments }: { farmId: number; open: boolean; onClose: () => void; departments: Department[] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("none");
  const [secondaryDeptIds, setSecondaryDeptIds] = useState<number[]>([]);
  const [farmRole, setFarmRole] = useState<FarmRole>("operator");
  const [employedFrom, setEmployedFrom] = useState("");
  const [notes, setNotes] = useState("");
  const [niNumber, setNiNumber] = useState("");
  const [payrollNumber, setPayrollNumber] = useState("");
  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokEmail, setNokEmail] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function reset() {
    setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setJobTitle("");
    setDepartmentId("none"); setSecondaryDeptIds([]); setFarmRole("operator"); setEmployedFrom(""); setNotes("");
    setNiNumber(""); setPayrollNumber("");
    setNokName(""); setNokRelationship(""); setNokPhone(""); setNokEmail("");
    setStep("form");
  }

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ firstName, lastName, email: email || null, phone: phone || null, jobTitle: jobTitle || null, departmentId: departmentId !== "none" ? Number(departmentId) : null, secondaryDepartmentIds: secondaryDeptIds, farmRole, employedFrom: employedFrom || null, notes: notes || null, niNumber: niNumber || null, payrollNumber: payrollNumber || null, nokName: nokName || null, nokRelationship: nokRelationship || null, nokPhone: nokPhone || null, nokEmail: nokEmail || null }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      setStep("success");
    },
    onError: () => toast({ title: "Failed to add staff member", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <DialogContent style={{ maxWidth: "32rem" }}>
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="employment" className="flex-1">Employment</TabsTrigger>
                <TabsTrigger value="nok" className="flex-1">Next of Kin</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name *</Label>
                    <Input placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="jane@farm.co.uk" value={email} onChange={e => setEmail(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Required if you later want to invite them to log in.</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input placeholder="07700 000000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>Job Title / Role Description</Label>
                  <Input placeholder="Stockman, Tractor Driver, etc." value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Farm Role (permission level)</Label>
                  <Select value={farmRole} onValueChange={v => setFarmRole(v as FarmRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator">Operator — field worker, logs records</SelectItem>
                      <SelectItem value="senior">Senior / Foreman — team lead, can view all records</SelectItem>
                      <SelectItem value="manager">Farm Manager — full operational access</SelectItem>
                      <SelectItem value="owner">Owner — unrestricted access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {departments.length > 0 && (
                  <div>
                    <Label>Primary Department</Label>
                    <Select value={departmentId} onValueChange={v => { setDepartmentId(v); setSecondaryDeptIds(prev => prev.filter(id => id !== Number(v))); }}>
                      <SelectTrigger><SelectValue placeholder="No department" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No department</SelectItem>
                        {departments.map(d => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.colour }} />
                              {d.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {departments.length > 1 && (
                  <div>
                    <Label>Also works in (secondary)</Label>
                    <p className="text-xs text-muted-foreground mb-2">Select any additional departments this person works across.</p>
                    <div className="flex flex-wrap gap-2">
                      {departments.filter(d => String(d.id) !== departmentId).map(d => {
                        const selected = secondaryDeptIds.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSecondaryDeptIds(prev => selected ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selected ? "border-transparent text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                            style={selected ? { background: d.colour } : undefined}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: selected ? "rgba(255,255,255,0.7)" : d.colour }} />
                            {d.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="employment" className="space-y-3 pt-3">
                <div>
                  <Label>Employed From</Label>
                  <Input type="date" value={employedFrom} onChange={e => setEmployedFrom(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>NI Number</Label>
                    <Input placeholder="AB 12 34 56 C" value={niNumber} onChange={e => setNiNumber(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">Required for PAYE / HMRC.</p>
                  </div>
                  <div>
                    <Label>Payroll Number</Label>
                    <Input placeholder="Your internal ref" value={payrollNumber} onChange={e => setPayrollNumber(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">Your payroll software reference.</p>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea placeholder="Any relevant notes about this staff member…" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                </div>
              </TabsContent>
              <TabsContent value="nok" className="space-y-3 pt-3">
                <p className="text-xs text-muted-foreground pb-1">
                  The person to notify if this worker is involved in a serious accident or incident on the farm.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Full Name</Label>
                    <Input placeholder="e.g. Sarah Smith" value={nokName} onChange={e => setNokName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <Input placeholder="e.g. Spouse, Parent, Sibling" value={nokRelationship} onChange={e => setNokRelationship(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input type="tel" className="pl-8" placeholder="07700 000000" value={nokPhone} onChange={e => setNokPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="sarah@example.com" value={nokEmail} onChange={e => setNokEmail(e.target.value)} />
                </div>
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              This creates a staff record only — no system login is created yet. You can invite them to log in from their record at any time.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button onClick={() => create.mutate()} disabled={!firstName.trim() || !lastName.trim() || create.isPending}>
                {create.isPending ? "Saving…" : "Add Staff Member"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Staff member added
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{firstName} {lastName}</strong> has been added as a staff record.
              </p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Two compliance steps before they start
                </p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li className="flex items-start gap-2"><span className="mt-0.5">①</span><span><strong>Right to Work check</strong> — required by law before employment begins.</span></li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">②</span><span><strong>Certificates</strong> — log WASK, PA1, Animal Transport and any other relevant qualifications.</span></li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onClose(); }}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Invite Dialog ────────────────────────────────────────────────────────────

function InviteDialog({
  farmId, member, open, onClose,
}: { farmId: number; member: FarmMember | null; open: boolean; onClose: () => void }) {
  const [accessType, setAccessType] = useState<AccessType>("full");
  const [farmRole, setFarmRole] = useState<FarmRole>("operator");
  const [step, setStep] = useState<"form" | "success">("form");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function reset() { setAccessType("full"); setFarmRole("operator"); setStep("form"); }

  const invite = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members/${member!.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ accessType, farmRole }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Invite failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      setStep("success");
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <DialogContent style={{ maxWidth: "28rem" }}>
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite {member.firstName} {member.lastName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">Invitation will be sent to:</p>
                <p className="font-medium mt-0.5">{member.email}</p>
              </div>
              <div>
                <Label>System Access</Label>
                <Select value={accessType} onValueChange={v => setAccessType(v as AccessType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">
                      <span className="flex items-center gap-2"><Unlock className="w-3.5 h-3.5" />Full access — web dashboard + mobile app</span>
                    </SelectItem>
                    <SelectItem value="mobile_only">
                      <span className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" />Mobile only — app access, no dashboard</span>
                    </SelectItem>
                    <SelectItem value="web_only">
                      <span className="flex items-center gap-2"><Monitor className="w-3.5 h-3.5" />Web only — dashboard access, no mobile</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Permission Level</Label>
                <Select value={farmRole} onValueChange={v => setFarmRole(v as FarmRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Operator — creates and views own records</SelectItem>
                    <SelectItem value="senior">Senior / Foreman — views all farm records</SelectItem>
                    <SelectItem value="manager">Farm Manager — full operational access</SelectItem>
                    <SelectItem value="owner">Owner — unrestricted including billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                They will receive an email to set their password. The invitation expires in 7 days.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button onClick={() => invite.mutate()} disabled={invite.isPending}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {invite.isPending ? "Sending…" : "Send Invitation"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Invitation sent
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{member.firstName} {member.lastName}</strong> will receive an email to set up their account with{" "}
                <strong>{ACCESS_LABELS[accessType]}</strong>.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => { reset(); onClose(); }}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Access Dialog ───────────────────────────────────────────────────────

function EditMemberDialog({
  farmId, member, open, onClose, departments,
}: { farmId: number; member: FarmMember | null; open: boolean; onClose: () => void; departments: Department[] }) {
  const [farmRole, setFarmRole] = useState<FarmRole>(member?.farmRole ?? "operator");
  const [accessType, setAccessType] = useState<AccessType>(member?.accessType ?? "none");
  const [jobTitle, setJobTitle] = useState(member?.jobTitle ?? "");
  const [departmentId, setDepartmentId] = useState<string>(member?.departmentId ? String(member.departmentId) : "none");
  const [secondaryDeptIds, setSecondaryDeptIds] = useState<number[]>(member?.secondaryDepartments?.map(d => d.id) ?? []);
  const [niNumber, setNiNumber] = useState(member?.niNumber ?? "");
  const [payrollNumber, setPayrollNumber] = useState(member?.payrollNumber ?? "");
  const [nokName, setNokName] = useState(member?.nokName ?? "");
  const [nokRelationship, setNokRelationship] = useState(member?.nokRelationship ?? "");
  const [nokPhone, setNokPhone] = useState(member?.nokPhone ?? "");
  const [nokEmail, setNokEmail] = useState(member?.nokEmail ?? "");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: editDlgPpeTypeLookup } = useLookup("ppe_types");
  const ppeTypeMap = useMemo(() => Object.fromEntries((editDlgPpeTypeLookup ?? []).map(t => [t.value, t.label])), [editDlgPpeTypeLookup]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members/${member!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ farmRole, accessType, jobTitle: jobTitle || null, departmentId: departmentId !== "none" ? Number(departmentId) : null, secondaryDepartmentIds: secondaryDeptIds, niNumber: niNumber || null, payrollNumber: payrollNumber || null, nokName: nokName || null, nokRelationship: nokRelationship || null, nokPhone: nokPhone || null, nokEmail: nokEmail || null }),
      });
      if (!res.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      toast({ title: "Saved" });
      onClose();
    },
    onError: () => toast({ title: "Failed to save changes", variant: "destructive" }),
  });

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent style={{ maxWidth: "26rem" }}>
        <DialogHeader>
          <DialogTitle>Edit — {member.firstName} {member.lastName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Job Title</Label>
            <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Stockman, Tractor Driver…" />
          </div>
          {departments.length > 0 && (
            <div>
              <Label>Primary Department</Label>
              <Select value={departmentId} onValueChange={v => { setDepartmentId(v); setSecondaryDeptIds(prev => prev.filter(id => id !== Number(v))); }}>
                <SelectTrigger><SelectValue placeholder="No department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No department</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.colour }} />
                        {d.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {departments.length > 1 && (
            <div>
              <Label>Also works in (secondary)</Label>
              <p className="text-xs text-muted-foreground mb-2">Select any additional departments this person works across.</p>
              <div className="flex flex-wrap gap-2">
                {departments.filter(d => String(d.id) !== departmentId).map(d => {
                  const selected = secondaryDeptIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSecondaryDeptIds(prev => selected ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selected ? "border-transparent text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                      style={selected ? { background: d.colour } : undefined}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: selected ? "rgba(255,255,255,0.7)" : d.colour }} />
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>NI Number</Label>
              <Input placeholder="AB 12 34 56 C" value={niNumber} onChange={e => setNiNumber(e.target.value)} />
            </div>
            <div>
              <Label>Payroll Number</Label>
              <Input placeholder="Your internal ref" value={payrollNumber} onChange={e => setPayrollNumber(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Permission Level</Label>
            <Select value={farmRole} onValueChange={v => setFarmRole(v as FarmRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="senior">Senior / Foreman</SelectItem>
                <SelectItem value="manager">Farm Manager</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {member.linkedUserId && (
            <div>
              <Label>System Access</Label>
              <Select value={accessType} onValueChange={v => setAccessType(v as AccessType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full access</SelectItem>
                  <SelectItem value="mobile_only">Mobile only</SelectItem>
                  <SelectItem value="web_only">Web only</SelectItem>
                  <SelectItem value="none">No system access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 mb-3">
              <UserRound size={13} className="text-muted-foreground" />
              <span className="text-sm font-semibold">Next of Kin / Emergency Contact</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input className="mt-1" placeholder="e.g. Sarah Smith" value={nokName} onChange={e => setNokName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Relationship</Label>
                  <Input className="mt-1" placeholder="e.g. Spouse, Parent" value={nokRelationship} onChange={e => setNokRelationship(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Phone</Label>
                  <div className="relative mt-1">
                    <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input type="tel" className="pl-8" placeholder="07700 000000" value={nokPhone} onChange={e => setNokPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input type="email" className="mt-1" placeholder="sarah@example.com" value={nokEmail} onChange={e => setNokEmail(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Row ────────────────────────────────────────────────────────────────

function MemberRow({
  member, farmId, certs, rtw, onInvite, onEdit, onView, navigate,
}: {
  member: FarmMember;
  farmId: number;
  certs: CertRecord[];
  rtw: RtwRecord[];
  onInvite: () => void;
  onEdit: () => void;
  onView: () => void;
  navigate: (to: string) => void;
}) {
  const fullName = `${member.firstName} ${member.lastName}`;
  const AccessIcon = ACCESS_ICONS[member.accessType];
  const { data: memberPpeTypeLookup } = useLookup("ppe_types");
  const ppeTypeMap = useMemo(() => Object.fromEntries((memberPpeTypeLookup ?? []).map(t => [t.value, t.label])), [memberPpeTypeLookup]);

  return (
    <tr className="border-b border-border/30 last:border-0 hover:bg-black/[0.02] transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="font-medium">{fullName}</p>
          {member.jobTitle && <p className="text-xs text-muted-foreground mt-0.5">{member.jobTitle}</p>}
          {member.departmentName && (
            <span
              className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
              style={{ background: member.departmentColour ?? "#374151" }}
              title="Primary department"
            >
              <Building2 className="w-2.5 h-2.5" />
              {member.departmentName}
            </span>
          )}
          {member.secondaryDepartments?.map(d => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ml-0.5"
              style={{ background: d.colour + "22", color: d.colour, border: `1px solid ${d.colour}55` }}
              title="Secondary department"
            >
              <Building2 className="w-2.5 h-2.5" />
              {d.name}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        {member.email
          ? <span className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-3.5 h-3.5 shrink-0" />{member.email}</span>
          : <span className="text-xs text-muted-foreground italic">No email</span>}
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${FARM_ROLE_COLORS[member.farmRole]}`}>
          <Shield className="w-3 h-3" />{FARM_ROLE_LABELS[member.farmRole]}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${ACCESS_COLORS[member.accessType]}`}>
            <AccessIcon className="w-3 h-3" />{ACCESS_LABELS[member.accessType]}
          </span>
          {member.invitationStatus === "pending" && (
            <p className="text-xs text-amber-600">Invite pending…</p>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        {member.isActive
          ? <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium"><UserCheck className="w-3.5 h-3.5" />Active</span>
          : <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium"><UserX className="w-3.5 h-3.5" />Inactive</span>}
      </td>
      <td className="px-5 py-4">
        <CertBadge name={fullName} certs={certs} />
      </td>
      <td className="px-5 py-4">
        <RtwBadge name={fullName} records={rtw} />
      </td>
      <td className="px-5 py-4">
        {member.nokName ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200" title={`${member.nokName}${member.nokRelationship ? ` (${member.nokRelationship})` : ""} — ${member.nokPhone || "no phone"}`}>
            <Phone className="w-3 h-3" />NOK
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">No NOK</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-1.5 flex-wrap">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onView}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {member.accessType === "none" && member.invitationStatus !== "pending" && member.email && (
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={onInvite}>
              <Send className="w-3 h-3 mr-1" />Invite
            </Button>
          )}
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={onEdit}>
            <Edit2 className="w-3 h-3 mr-1" />Edit
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7"
            onClick={() => navigate(`/training?member=${encodeURIComponent(fullName)}&tab=certificates`)}>
            <Award className="w-3 h-3 mr-1" />Certs
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            title="Right to Work checks — managed in the Training section"
            onClick={() => navigate(`/training?member=${encodeURIComponent(fullName)}&tab=rtw`)}
          >
            <GraduationCap className="w-3 h-3 mr-1" />RTW
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { farmId } = useAppStore();
  const [pageTab, setPageTab] = useState<"team" | "ppe">("team");
  const [search, setSearch] = useState("");
  const [showFormer, setShowFormer] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [inviteMember, setInviteMember] = useState<FarmMember | null>(null);
  const [editMember, setEditMember] = useState<FarmMember | null>(null);
  const [viewRecord, setViewRecord] = useState<FarmMember | null>(null);
  const [, navigate] = useLocation();

  const { data, isLoading, isError, refetch } = useMembers(farmId);
  const { data: certData } = useCerts(farmId);
  const { data: rtwData } = useRtw(farmId);
  const { data: ppeData } = useQuery<{ records: PpeRecord[] }>({
    queryKey: ["ppe-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ppe-issue-records`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
  const { data: deptData } = useQuery<{ departments: Department[] }>({
    queryKey: ["farm-departments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/departments`, { headers: authHeaders() }).then(r => r.json()),
    enabled: !!farmId,
  });
  const departments = deptData?.departments ?? [];
  const allPpeRecords = ppeData?.records ?? [];
  const { data: staffPagePpeTypeLookup } = useLookup("ppe_types");
  const ppeTypeMap = useMemo(() => Object.fromEntries((staffPagePpeTypeLookup ?? []).map(t => [t.value, t.label])), [staffPagePpeTypeLookup]);

  const allCerts = certData?.records ?? [];
  const allRtw = rtwData?.records ?? [];

  const allMembers = data?.members ?? [];
  const formerCount = allMembers.filter(m => !m.isActive).length;

  const members = allMembers.filter(m => {
    if (!m.isActive) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      (m.email ?? "").toLowerCase().includes(q) ||
      (m.jobTitle ?? "").toLowerCase().includes(q)
    );
  });

  const formerMembers = showFormer
    ? allMembers.filter(m => {
        if (m.isActive) return false;
        const q = search.toLowerCase();
        if (!q) return true;
        return (
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          (m.email ?? "").toLowerCase().includes(q) ||
          (m.jobTitle ?? "").toLowerCase().includes(q)
        );
      })
    : [];

  const withAccess = members.filter(m => m.accessType !== "none");
  const noAccess = members.filter(m => m.accessType === "none");

  if (!farmId) return null;

  return (
    <AppLayout title="Staff">
      {/* Page-level tab bar */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 0 }}>
        {([
          { key: "team", label: "Team", icon: <Users className="w-4 h-4" /> },
          { key: "ppe", label: "PPE Register", icon: <HardHat className="w-4 h-4" /> },
        ] as const).map(({ key, label, icon }) => (
          <button key={key} onClick={() => setPageTab(key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", fontWeight: pageTab === key ? 700 : 500, fontSize: "0.9rem", color: pageTab === key ? "#166534" : "#6b7280", marginBottom: -2, background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: pageTab === key ? "#166534" : "transparent", cursor: "pointer" }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── Team Tab ── */}
      {pageTab === "team" && (
        <>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff…"
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {formerCount > 0 && (
                <button
                  onClick={() => setShowFormer(v => !v)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                    showFormer
                      ? "bg-slate-100 border-slate-300 text-slate-700"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-slate-300"
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  {showFormer ? "Hide" : "Show"} former staff ({formerCount})
                </button>
              )}
            </div>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          {/* Summary counts */}
          {!isLoading && !isError && (data?.members?.length ?? 0) > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["full", "mobile_only", "web_only", "none"] as AccessType[]).map(a => {
                const count = (data?.members ?? []).filter(m => m.isActive && m.accessType === a).length;
                const Icon = ACCESS_ICONS[a];
                return (
                  <div key={a} className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${count > 0 ? "" : "opacity-50"}`}>
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{ACCESS_LABELS[a]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* System users section */}
          {withAccess.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="px-6 py-3 border-b border-border/50 bg-black/[0.02]">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    System Users ({withAccess.length})
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Staff with mobile or web dashboard access</p>
                </div>
                <StaffTable members={withAccess} farmId={farmId} certs={allCerts} rtw={allRtw}
                  onInvite={setInviteMember} onEdit={setEditMember} onView={setViewRecord} navigate={navigate} />
              </CardContent>
            </Card>
          )}

          {/* Records only section */}
          {noAccess.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="px-6 py-3 border-b border-border/50 bg-black/[0.02]">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Staff Records — No System Access ({noAccess.length})
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">In the records for compliance purposes. Click Invite to give system access.</p>
                </div>
                <StaffTable members={noAccess} farmId={farmId} certs={allCerts} rtw={allRtw}
                  onInvite={setInviteMember} onEdit={setEditMember} onView={setViewRecord} navigate={navigate} />
              </CardContent>
            </Card>
          )}

          {/* Former staff section */}
          {showFormer && formerMembers.length > 0 && (
            <Card className="opacity-80">
              <CardContent className="p-0">
                <div className="px-6 py-3 border-b border-border/50 bg-slate-50">
                  <p className="text-sm font-semibold flex items-center gap-2 text-slate-600">
                    <UserX className="w-4 h-4 text-slate-400" />
                    Former Staff ({formerMembers.length})
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Staff who have left. Shown for record-keeping and compliance purposes.</p>
                </div>
                <StaffTable members={formerMembers} farmId={farmId} certs={allCerts} rtw={allRtw}
                  onInvite={setInviteMember} onEdit={setEditMember} onView={setViewRecord} navigate={navigate} />
              </CardContent>
            </Card>
          )}

          {/* Loading / error / empty states */}
          {isLoading && (
            <Card><CardContent className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />Loading staff…
            </CardContent></Card>
          )}
          {isError && (
            <Card><CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p className="text-sm text-muted-foreground">Failed to load staff members.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </CardContent></Card>
          )}
          {!isLoading && !isError && members.length === 0 && !search && (
            <Card><CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground">No staff members yet</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add staff members to track their training, certifications, and Right to Work status.
                You can optionally invite them to access the system later.
              </p>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />Add first staff member
              </Button>
            </CardContent></Card>
          )}
          {!isLoading && !isError && members.length === 0 && search && (
            <Card><CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              No staff matching "{search}"
            </CardContent></Card>
          )}
        </>
      )}

      {/* ── PPE Register Tab ── */}
      {pageTab === "ppe" && (
        <PpeRegisterSection farmId={farmId} members={allMembers} />
      )}

      <AddMemberDialog farmId={farmId} open={addOpen} onClose={() => setAddOpen(false)} departments={departments} />
      <InviteDialog farmId={farmId} member={inviteMember} open={!!inviteMember}
        onClose={() => setInviteMember(null)} />
      <EditMemberDialog farmId={farmId} member={editMember} open={!!editMember}
        onClose={() => setEditMember(null)} departments={departments} />

      {viewRecord && (() => {
        const fullName = `${viewRecord.firstName} ${viewRecord.lastName}`;
        const staffPpe = allPpeRecords.filter(r => r.staffName.toLowerCase() === fullName.toLowerCase());
        return (
          <Dialog open onOpenChange={() => setViewRecord(null)}>
            <DialogContent style={{ maxWidth: "48rem", maxHeight: "90vh", overflowY: "auto" }}>
              <DialogHeader><DialogTitle>Staff Member — {fullName}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p><p className="font-medium">{viewRecord.firstName} {viewRecord.lastName}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p><p className="font-medium">{viewRecord.email || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p><p className="font-medium">{viewRecord.phone || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Job Title</p><p className="font-medium">{viewRecord.jobTitle || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Farm Role</p><p className="font-medium">{FARM_ROLE_LABELS[viewRecord.farmRole]}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Access Level</p><p className="font-medium">{ACCESS_LABELS[viewRecord.accessType]}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{viewRecord.isActive ? "Active" : "Inactive"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Employed From</p><p className="font-medium">{viewRecord.employedFrom ? new Date(viewRecord.employedFrom).toLocaleDateString("en-GB") : "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">NI Number</p><p className="font-medium">{viewRecord.niNumber || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payroll Number</p><p className="font-medium">{viewRecord.payrollNumber || "—"}</p></div>
                <div className="col-span-2 border-t pt-2 mt-2">
                  <p className="font-semibold mb-2">Emergency Contact (Next of Kin)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p><p className="font-medium">{viewRecord.nokName || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Relationship</p><p className="font-medium">{viewRecord.nokRelationship || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p><p className="font-medium">{viewRecord.nokPhone || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p><p className="font-medium">{viewRecord.nokEmail || "—"}</p></div>
                  </div>
                </div>
                {viewRecord.notes && (
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p>
                    <p className="font-medium whitespace-pre-wrap">{viewRecord.notes}</p>
                  </div>
                )}
                {/* PPE Issued Section */}
                <div className="col-span-2 border-t pt-3 mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <HardHat className="w-4 h-4 text-amber-600" />
                    <p className="font-semibold text-sm">PPE Issued</p>
                    {staffPpe.length > 0 && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">{staffPpe.length} item{staffPpe.length !== 1 ? "s" : ""}</span>}
                  </div>
                  {staffPpe.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No PPE issued to this staff member yet. Use the PPE Register tab to issue and track PPE.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                        <thead style={{ background: "#f9fafb" }}>
                          <tr>
                            {["PPE Type","Description","Size","Date Issued","Condition","Status"].map(h => (
                              <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#6b7280" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {staffPpe.map((r, i) => (
                            <tr key={r.id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : undefined }}>
                              <td style={{ padding: "8px 12px", fontWeight: 600 }}>{ppeTypeMap[r.ppeType] ?? r.ppeType}</td>
                              <td style={{ padding: "8px 12px", color: "#374151" }}>{r.description ?? "—"}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280" }}>{r.size ?? "—"}</td>
                              <td style={{ padding: "8px 12px" }}>{fmt(r.dateIssued)}</td>
                              <td style={{ padding: "8px 12px" }}>{r.conditionAtCheck ?? "—"}</td>
                              <td style={{ padding: "8px 12px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.7rem", fontWeight: 600, padding: "1px 6px", borderRadius: 999, background: r.isActive ? "#dcfce7" : "#f3f4f6", color: r.isActive ? "#166534" : "#6b7280" }}>{r.isActive ? "Active" : "Replaced"}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <button className="mt-2 text-xs text-green-700 font-medium hover:underline" onClick={() => { setViewRecord(null); setPageTab("ppe"); }}>
                    View full PPE Register →
                  </button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditMember(viewRecord); setViewRecord(null); }}>Edit</Button>
                <Button onClick={() => setViewRecord(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </AppLayout>
  );
}

function StaffTable({ members, farmId, certs, rtw, onInvite, onEdit, onView, navigate }: {
  members: FarmMember[];
  farmId: number;
  certs: CertRecord[];
  rtw: RtwRecord[];
  onInvite: (m: FarmMember) => void;
  onEdit: (m: FarmMember) => void;
  onView: (m: FarmMember) => void;
  navigate: (to: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-border/50 bg-black/[0.02]">
            <th className="text-left px-6 py-3 font-semibold text-foreground/60">Name</th>
            <th className="text-left px-6 py-3 font-semibold text-foreground/60">Email</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">Role</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">Access</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">Status</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">Certificates</th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">
              Right to Work
              <span className="block text-[10px] font-normal text-muted-foreground/70 mt-0.5 normal-case tracking-normal">
                managed in Training
              </span>
            </th>
            <th className="text-left px-5 py-3 font-semibold text-foreground/60">NOK</th>
            <th className="w-48" />
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <MemberRow
              key={m.id}
              member={m}
              farmId={farmId}
              certs={certs}
              rtw={rtw}
              onInvite={() => onInvite(m)}
              onEdit={() => onEdit(m)}
              onView={() => onView(m)}
              navigate={navigate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
