import { q as createLucideIcon, b as useAppStore, r as reactExports, u as useLocation, l as useQuery, j as jsxRuntimeExports, I as Input, c as Button, S as Plus, m as Card, n as CardContent, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, t as useQueryClient, a as useToast, O as useMutation, d as LoaderCircle, L as Label, B as Building2 } from "./index-DyO3qdRx.js";
import { A as AppLayout, U as Users, p as Smartphone } from "./AppLayout-yXgcy6Yb.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-iU6bEXEy.js";
import { T as Textarea } from "./textarea-DQaSoqzm.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-m7y_IIub.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { a as useLookup } from "./use-lookup-DFs8F_E5.js";
import { H as HardHat } from "./hard-hat-C0tjGoE8.js";
import { S as Search } from "./search-CbUjz1oF.js";
import { U as UserX } from "./user-x-DTDvqaPs.js";
import { L as Lock } from "./lock-Cu1m-KH9.js";
import { U as User } from "./user-CbWlwlnJ.js";
import { R as RefreshCw } from "./refresh-cw-DWIkyxzC.js";
import { P as Printer } from "./printer-DVtyOTQn.js";
import { P as Package } from "./use-safe-clerk-KD-zL5Im.js";
import { E as Eye } from "./eye-DVTNqcdj.js";
import { P as Pencil } from "./pencil-COc7OTwC.js";
import { T as Trash2 } from "./trash-2-BBDPvBWg.js";
import { F as FileText, G as GraduationCap } from "./shield-alert-CTXTlTD1.js";
import { S as ShieldCheck } from "./shield-check-CqhG5x5c.js";
import { C as CircleCheck } from "./circle-check-BQeIyRF3.js";
import { P as Phone } from "./phone-JVY7ccIz.js";
import { A as Award } from "./award-BJjgZV3t.js";
import { S as Send } from "./send-D1wJqM8W.js";
import { U as UserRound } from "./user-round-C35aEY7G.js";
import { M as Mail } from "./mail-DkL7DzOy.js";
import { S as Shield } from "./shield-By5ADVHW.js";
import { U as UserCheck } from "./user-check-Dd8mPRjk.js";
import { P as Pen } from "./pen-mJD_C-Kr.js";
import { T as TriangleAlert } from "./triangle-alert-Csp_jydx.js";
import "./database-Dw-KgodB.js";
import "./tractor-DBhyhBSt.js";
import "./index-BPzGDkJl.js";
import "./index-C9ePV7UY.js";
import "./chevron-up-CKxoj9zr.js";
import "./index-DvWsJF14.js";
const __iconNode$1 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }]
];
const LockOpen = createLucideIcon("lock-open", __iconNode$1);
const __iconNode = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
const Monitor = createLucideIcon("monitor", __iconNode);
function authHeaders() {
  return {};
}
const FARM_ROLE_LABELS = {
  operator: "Operator",
  senior: "Senior / Foreman",
  manager: "Farm Manager",
  owner: "Owner"
};
const FARM_ROLE_COLORS = {
  operator: "bg-slate-100 text-slate-700",
  senior: "bg-blue-100 text-blue-700",
  manager: "bg-purple-100 text-purple-700",
  owner: "bg-amber-100 text-amber-800"
};
const ACCESS_LABELS = {
  none: "No system access",
  mobile_only: "Mobile only",
  web_only: "Web only",
  full: "Full access",
  limited: "Limited access"
};
const ACCESS_COLORS = {
  none: "bg-slate-100 text-slate-500",
  mobile_only: "bg-green-100 text-green-700",
  web_only: "bg-indigo-100 text-indigo-700",
  full: "bg-emerald-100 text-emerald-700",
  limited: "bg-green-100 text-green-700"
};
const ACCESS_ICONS = {
  none: Lock,
  mobile_only: Smartphone,
  web_only: Monitor,
  full: LockOpen,
  limited: Smartphone
};
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function PpeRegisterSection({ farmId, members }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const issueBase = `/api/farms/${farmId}/ppe-issue-records`;
  const stockBase = `/api/farms/${farmId}/ppe-stock-items`;
  const riskBase = `/api/farms/${farmId}/ppe-risk-assessments`;
  const ppoBase = `/api/farms/${farmId}/ppe-purchase-orders`;
  const { data: ppeTypeLookup } = useLookup("ppe_types");
  const ppeTypes = reactExports.useMemo(() => ppeTypeLookup ?? [], [ppeTypeLookup]);
  const ppeTypeMap = reactExports.useMemo(() => Object.fromEntries(ppeTypes.map((t) => [t.value, t.label])), [ppeTypes]);
  const EN_ISO = {
    "safety-boots": ["EN ISO 20345:2011 S1", "EN ISO 20345:2011 S1P", "EN ISO 20345:2011 S3", "EN ISO 20345:2011 S3 SRC", "EN ISO 20345:2011 S5 SRC"],
    "safety-helmet": ["EN 397:2012+A1 (Industrial safety helmet)", "EN 14052:2012+A1 (High-performance industrial helmet)"],
    "hi-vis-vest": ["EN ISO 20471:2013 Class 1", "EN ISO 20471:2013 Class 2", "EN ISO 20471:2013 Class 3"],
    "gloves": ["EN ISO 374-1:2016 (Chemical protection)", "EN 388:2016+A1 (Mechanical risks)", "EN 511:2006 (Cold protection)", "EN 12477:2001 (Welding gloves)"],
    "safety-glasses": ["EN ISO 16321-1:2021 (Eye and face protection)", "EN 166:2002 (Personal eye protection)", "EN 170:2002 (UV filter lenses)"],
    "ear-protection": ["EN 352-1:2020 (Ear muffs)", "EN 352-2:2020 (Ear plugs)", "EN 352-3:2020 (Ear muffs attached to helmet)"],
    "dust-mask": ["EN 149:2001+A1:2009 FFP1", "EN 149:2001+A1:2009 FFP2 NR", "EN 149:2001+A1:2009 FFP2 R (reusable)", "EN 149:2001+A1:2009 FFP3 NR", "EN 149:2001+A1:2009 FFP3 R (reusable)", "EN 140:1998 (Half mask)", "EN 136:1998 (Full face mask)"],
    "face-shield": ["EN 166:2002 (Personal eye/face protection)", "EN 168:2001 (Non-optical test methods)"],
    "waterproof-suit": ["EN ISO 13688:2013 (General protective clothing)", "EN 13982-1:2004+A1 (Type 5 — dry particles)", "EN 14605:2005+A1 (Type 4 — spray-tight)", "EN 14126:2003+A1 (Biohazard protection)"],
    "chainsaw-ppe": ["EN ISO 11393-2:2019 (Leg protectors performance)", "EN ISO 11393-4:2019 (Gloves)", "EN ISO 11393-5:2022 (Gaiters)", "EN ISO 11393-6:2019 (Upper body protection)"],
    "apron": ["EN ISO 13688:2013 (General protective clothing)", "EN 13034:2005+A1 (Limited chemical splash)"]
  };
  const PPE_SIZES = {
    "safety-boots": ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12", "UK 13", "UK 14"],
    "safety-helmet": ["One size (adjustable)", "52–58cm", "54–61cm", "57–62cm", "58–64cm"],
    "hi-vis-vest": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    "gloves": ["XS", "S", "M", "L", "XL", "2XL", "Size 6", "Size 7", "Size 8", "Size 9", "Size 10", "Size 11"],
    "safety-glasses": ["One size", "Standard", "Large / wide"],
    "ear-protection": ["One size", "N/A (disposable)"],
    "dust-mask": ["S", "M", "L", "S/M", "M/L", "One size"],
    "face-shield": ["One size (adjustable)", "Standard"],
    "waterproof-suit": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    "chainsaw-ppe": ["S", "M", "L", "XL", "2XL", "3XL"],
    "apron": ["One size", "S/M", "L/XL", "XL/2XL"]
  };
  const { data: issueData, isLoading: issueLoading } = useQuery({
    queryKey: ["ppe-records", farmId],
    queryFn: () => fetch(issueBase, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["ppe-stock", farmId],
    queryFn: () => fetch(stockBase, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: suppData } = useQuery({
    queryKey: ["ppe-suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ppe-suppliers`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: riskData, isLoading: riskLoading } = useQuery({
    queryKey: ["ppe-risk", farmId],
    queryFn: () => fetch(riskBase, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: farmMeta } = useQuery({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const allRecords = issueData?.records ?? [];
  const allStock = stockData?.items ?? [];
  const suppliers = suppData?.records ?? [];
  const allRisk = riskData?.records ?? [];
  const [subTab, setSubTab] = reactExports.useState("stock");
  const [staffFilter, setStaffFilter] = reactExports.useState("");
  const [issueSearch, setIssueSearch] = reactExports.useState("");
  const EMPTY_ISSUE = { staffName: "", ppeType: "safety-boots", description: "", size: "", supplier: "", stockItemId: "", dateIssued: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), conditionCheckDate: "", conditionAtCheck: "", replacedDate: "", replacedReason: "", notes: "", fitCheckConfirmed: false, fitCheckBy: "", fitCheckNotes: "", trainingProvided: false, trainingNotes: "", isActive: true };
  const [showIssueForm, setShowIssueForm] = reactExports.useState(false);
  const [editIssue, setEditIssue] = reactExports.useState(null);
  const [issueForm, setIssueForm] = reactExports.useState({ ...EMPTY_ISSUE });
  const [deleteIssueId, setDeleteIssueId] = reactExports.useState(null);
  const [viewIssue, setViewIssue] = reactExports.useState(null);
  const EMPTY_STOCK = { ppeType: "safety-boots", description: "", size: "", quantityReceived: "1", unitCostPence: "", supplierId: "", supplierName: "", purchaseOrderId: "", invoiceRef: "", deliveryNoteRef: "", receivedDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), batchNumber: "", notes: "", isActive: true };
  const [stockSpecKey, setStockSpecKey] = reactExports.useState(0);
  const [issueSpecKey, setIssueSpecKey] = reactExports.useState(0);
  const [showStockForm, setShowStockForm] = reactExports.useState(false);
  const [editStock, setEditStock] = reactExports.useState(null);
  const [stockForm, setStockForm] = reactExports.useState({ ...EMPTY_STOCK });
  const [deleteStockId, setDeleteStockId] = reactExports.useState(null);
  const [viewStock, setViewStock] = reactExports.useState(null);
  const setIF = (k, v) => setIssueForm((f) => ({ ...f, [k]: v }));
  const setSF = (k, v) => setStockForm((f) => ({ ...f, [k]: v }));
  const createIssueMut = useMutation({
    mutationFn: (b) => fetch(issueBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...b, stockItemId: b.stockItemId ? parseInt(b.stockItemId) : null }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-records", farmId] });
      qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] });
      setShowIssueForm(false);
      setIssueForm({ ...EMPTY_ISSUE });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateIssueMut = useMutation({
    mutationFn: (b) => fetch(`${issueBase}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...b, stockItemId: b.stockItemId ? parseInt(b.stockItemId) : null }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-records", farmId] });
      setShowIssueForm(false);
      setEditIssue(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteIssueMut = useMutation({
    mutationFn: (id) => fetch(`${issueBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-records", farmId] });
      setDeleteIssueId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const createStockMut = useMutation({
    mutationFn: (b) => fetch(stockBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...b, quantityReceived: parseInt(b.quantityReceived || "0"), unitCostPence: b.unitCostPence ? Math.round(parseFloat(b.unitCostPence) * 100) : null, supplierId: b.supplierId ? parseInt(b.supplierId) : null }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] });
      setShowStockForm(false);
      setStockForm({ ...EMPTY_STOCK });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateStockMut = useMutation({
    mutationFn: (b) => fetch(`${stockBase}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ ...b, quantityReceived: parseInt(b.quantityReceived || "0"), quantityInStock: parseInt(b.quantityReceived || "0"), unitCostPence: b.unitCostPence ? Math.round(parseFloat(b.unitCostPence) * 100) : null, supplierId: b.supplierId ? parseInt(b.supplierId) : null }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] });
      setShowStockForm(false);
      setEditStock(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteStockMut = useMutation({
    mutationFn: (id) => fetch(`${stockBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] });
      setDeleteStockId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const EMPTY_RISK = { assessmentRef: "", ppeType: "safety-boots", hazardIdentified: "", taskOrArea: "", riskLevel: "__none__", ppeSpecification: "", compatiblePpeTypes: "", assessedBy: "", assessmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), reviewDate: "", notes: "" };
  const [showRiskForm, setShowRiskForm] = reactExports.useState(false);
  const [editRisk, setEditRisk] = reactExports.useState(null);
  const [viewRisk, setViewRisk] = reactExports.useState(null);
  const [riskForm, setRiskForm] = reactExports.useState({ ...EMPTY_RISK });
  const [deleteRiskId, setDeleteRiskId] = reactExports.useState(null);
  const setRF = (k, v) => setRiskForm((f) => ({ ...f, [k]: v }));
  function openEditRisk(r) {
    setEditRisk(r);
    setRiskForm({ assessmentRef: r.assessmentRef ?? "", ppeType: r.ppeType, hazardIdentified: r.hazardIdentified, taskOrArea: r.taskOrArea ?? "", riskLevel: r.riskLevel ?? "__none__", ppeSpecification: r.ppeSpecification ?? "", compatiblePpeTypes: r.compatiblePpeTypes ?? "", assessedBy: r.assessedBy, assessmentDate: r.assessmentDate, reviewDate: r.reviewDate ?? "", notes: r.notes ?? "" });
    setShowRiskForm(true);
  }
  function riskPayload(f) {
    return { ...f, riskLevel: f.riskLevel === "__none__" ? null : f.riskLevel };
  }
  const createRiskMut = useMutation({
    mutationFn: (b) => fetch(riskBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(riskPayload(b)) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-risk", farmId] });
      setShowRiskForm(false);
      setRiskForm({ ...EMPTY_RISK });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateRiskMut = useMutation({
    mutationFn: (b) => fetch(`${riskBase}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(riskPayload(b)) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-risk", farmId] });
      setShowRiskForm(false);
      setEditRisk(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteRiskMut = useMutation({
    mutationFn: (id) => fetch(`${riskBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-risk", farmId] });
      setDeleteRiskId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const stocktakeBase = `/api/farms/${farmId}/ppe-stocktakes`;
  const { data: stocktakeList = [], isLoading: stocktakesLoading, refetch: refetchStocktakes } = useQuery({
    queryKey: ["ppe-stocktakes", farmId],
    queryFn: () => fetch(stocktakeBase, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId && subTab === "stocktakes"
  });
  const [activeStocktakeId, setActiveStocktakeId] = reactExports.useState(null);
  const { data: activeStocktake, refetch: refetchActiveStocktake } = useQuery({
    queryKey: ["ppe-stocktake-detail", farmId, activeStocktakeId],
    queryFn: () => fetch(`${stocktakeBase}/${activeStocktakeId}`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: activeStocktakeId !== null
  });
  const [stocktakeNewOpen, setStocktakeNewOpen] = reactExports.useState(false);
  const [stocktakeNewForm, setStocktakeNewForm] = reactExports.useState({ stocktakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), conductedBy: "", notes: "" });
  const [stocktakeItemEdits, setStocktakeItemEdits] = reactExports.useState({});
  const [stocktakeDeleteId, setStocktakeDeleteId] = reactExports.useState(null);
  const createStocktakeMut = useMutation({
    mutationFn: (body) => fetch(stocktakeBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ppe-stocktakes", farmId] });
      setStocktakeNewOpen(false);
      setActiveStocktakeId(data.id);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const patchStocktakeItemMut = useMutation({
    mutationFn: ({ sessionId, itemId, countedQty, notes }) => fetch(`${stocktakeBase}/${sessionId}/items/${itemId}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ countedQty, notes }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-stocktake-detail", farmId, activeStocktakeId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const completeStocktakeMut = useMutation({
    mutationFn: (sessionId) => fetch(`${stocktakeBase}/${sessionId}/complete`, { method: "POST", headers: authHeaders() }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-stocktakes", farmId] });
      qc.invalidateQueries({ queryKey: ["ppe-stocktake-detail", farmId, activeStocktakeId] });
      qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] });
      toast({ title: "Stocktake completed", description: "Stock quantities have been reconciled." });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteStocktakeMut = useMutation({
    mutationFn: (id) => fetch(`${stocktakeBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-stocktakes", farmId] });
      if (stocktakeDeleteId === activeStocktakeId) setActiveStocktakeId(null);
      setStocktakeDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: ppoData } = useQuery({
    queryKey: ["ppe-purchase-orders", farmId],
    queryFn: () => fetch(ppoBase, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const allPpos = ppoData?.records ?? [];
  const EMPTY_PO_LINE = { ppeType: ppeTypes[0]?.value ?? "safety-boots", description: "", size: "", quantityOrdered: "1", unitPricePence: "" };
  const EMPTY_PO_FORM = { supplierId: "", supplierName: "", orderDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), expectedDeliveryDate: "", notes: "", submittedByName: "", invoiceRef: "", invoiceStatus: "pending_invoice", invoicePaidDate: "", paymentRef: "" };
  const [showPoForm, setShowPoForm] = reactExports.useState(false);
  const [editPo, setEditPo] = reactExports.useState(null);
  const [poForm, setPoForm] = reactExports.useState({ ...EMPTY_PO_FORM });
  const [poLines, setPoLines] = reactExports.useState([{ ...EMPTY_PO_LINE }]);
  const [showGrnDialog, setShowGrnDialog] = reactExports.useState(null);
  const [grnDate, setGrnDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [grnQtys, setGrnQtys] = reactExports.useState({});
  const setSPF = (k, v) => setPoForm((f) => ({ ...f, [k]: v }));
  const createPoMut = useMutation({
    mutationFn: (data) => fetch(ppoBase, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-purchase-orders", farmId] });
      setShowPoForm(false);
      toast({ title: "PPE order raised" });
    },
    onError: () => toast({ title: "Error raising order", variant: "destructive" })
  });
  const updatePoMut = useMutation({
    mutationFn: (data) => fetch(`${ppoBase}/${editPo?.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-purchase-orders", farmId] });
      setShowPoForm(false);
      setEditPo(null);
      toast({ title: "Order updated" });
    },
    onError: () => toast({ title: "Error updating order", variant: "destructive" })
  });
  const deletePoMut = useMutation({
    mutationFn: (id) => fetch(`${ppoBase}/${id}`, { method: "DELETE", headers: authHeaders() }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ppe-purchase-orders", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const receivePoMut = useMutation({
    mutationFn: (data) => fetch(`${ppoBase}/${showGrnDialog?.id}/receive`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["ppe-purchase-orders", farmId] });
      qc.invalidateQueries({ queryKey: ["ppe-stock", farmId] });
      setShowGrnDialog(null);
      toast({ title: `Goods received — ${d.grnNumber}` });
    },
    onError: () => toast({ title: "Error recording receipt", variant: "destructive" })
  });
  function openPoAdd() {
    setEditPo(null);
    setPoForm({ ...EMPTY_PO_FORM });
    setPoLines([{ ...EMPTY_PO_LINE }]);
    setShowPoForm(true);
  }
  function openPoEdit(po) {
    setEditPo(po);
    setPoForm({ supplierId: po.supplierId ? String(po.supplierId) : "", supplierName: po.supplierName ?? "", orderDate: po.orderDate, expectedDeliveryDate: po.expectedDeliveryDate ?? "", notes: po.notes ?? "", submittedByName: po.submittedByName ?? "", invoiceRef: po.invoiceRef ?? "", invoiceStatus: po.invoiceStatus ?? "pending_invoice", invoicePaidDate: po.invoicePaidDate ?? "", paymentRef: po.paymentRef ?? "" });
    setPoLines(po.lines?.map((l) => ({ ppeType: l.ppeType, description: l.description ?? "", size: l.size ?? "", quantityOrdered: String(l.quantityOrdered), unitPricePence: l.unitPricePence ? String((l.unitPricePence / 100).toFixed(2)) : "" })) ?? [{ ...EMPTY_PO_LINE }]);
    setShowPoForm(true);
  }
  function openGrn(po) {
    setShowGrnDialog(po);
    setGrnDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    setGrnQtys({});
  }
  function openEditIssue(r) {
    setEditIssue(r);
    setIssueForm({ staffName: r.staffName, ppeType: r.ppeType, description: r.description ?? "", size: r.size ?? "", supplier: r.supplier ?? "", stockItemId: r.stockItemId ? String(r.stockItemId) : "", dateIssued: r.dateIssued, conditionCheckDate: r.conditionCheckDate ?? "", conditionAtCheck: r.conditionAtCheck ?? "", replacedDate: r.replacedDate ?? "", replacedReason: r.replacedReason ?? "", notes: r.notes ?? "", fitCheckConfirmed: r.fitCheckConfirmed ?? false, fitCheckBy: r.fitCheckBy ?? "", fitCheckNotes: r.fitCheckNotes ?? "", trainingProvided: r.trainingProvided ?? false, trainingNotes: r.trainingNotes ?? "", isActive: r.isActive });
    setShowIssueForm(true);
  }
  function openEditStock(s) {
    setEditStock(s);
    setStockForm({ ppeType: s.ppeType, description: s.description ?? "", size: s.size ?? "", quantityReceived: String(s.quantityReceived), unitCostPence: s.unitCostPence ? String((s.unitCostPence / 100).toFixed(2)) : "", supplierId: s.supplierId ? String(s.supplierId) : "", supplierName: s.supplierName ?? "", purchaseOrderId: s.purchaseOrderId ? String(s.purchaseOrderId) : "", invoiceRef: s.invoiceRef ?? "", deliveryNoteRef: s.deliveryNoteRef ?? "", receivedDate: s.receivedDate ?? "", batchNumber: s.batchNumber ?? "", notes: s.notes ?? "", isActive: s.isActive });
    setShowStockForm(true);
  }
  function selectStockItem(sid) {
    setIF("stockItemId", sid);
    if (!sid) return;
    const s = allStock.find((x) => x.id === parseInt(sid));
    if (s) {
      setIF("ppeType", s.ppeType);
      setIF("description", s.description ?? "");
      setIF("size", s.size ?? "");
      setIF("supplier", s.supplierRecordName ?? s.supplierName ?? "");
    }
  }
  const filteredIssues = allRecords.filter((r) => {
    const matchStaff = !staffFilter || r.staffName.toLowerCase().includes(staffFilter.toLowerCase());
    const matchSearch = !issueSearch || r.staffName.toLowerCase().includes(issueSearch.toLowerCase()) || (ppeTypeMap[r.ppeType] ?? r.ppeType).toLowerCase().includes(issueSearch.toLowerCase());
    return matchStaff && matchSearch;
  });
  const staffNames = Array.from(new Set(members.filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`))).sort();
  const resolveSupplierName = (item) => item.supplierRecordName ?? item.supplierName ?? "—";
  const esc = (s) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const riskBadge = (level) => {
    if (!level) return "—";
    const bg = level === "High" ? "#fee2e2" : level === "Medium" ? "#fef9c3" : "#dcfce7";
    const col = level === "High" ? "#b91c1c" : level === "Medium" ? "#854d0e" : "#166534";
    return `<span style="padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700;background:${bg};color:${col}">${level}</span>`;
  };
  function handlePrintCompliancePack() {
    const farm = farmMeta?.record;
    const today = /* @__PURE__ */ new Date();
    const assessedTypes = new Set(allRisk.map((r) => r.ppeType));
    const issuedTypes = new Set(allRecords.filter((r) => r.isActive).map((r) => r.ppeType));
    const unassessedTypes = [...issuedTypes].filter((t) => !assessedTypes.has(t));
    const reviewOverdue = allRisk.filter((r) => r.reviewDate && new Date(r.reviewDate) < today).length;
    const needsReplacement = allRecords.filter((r) => r.isActive && (r.conditionAtCheck === "Needs replacement" || r.conditionAtCheck === "Condemned")).length;
    const summaryHtml = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
        ${[
      ["Risk Assessments", allRisk.length, reviewOverdue > 0 ? `${reviewOverdue} overdue for review` : "All current", reviewOverdue > 0 ? "#fef3c7" : "#dcfce7"],
      ["Stock Items", allStock.length, "", "#f0fdf4"],
      ["Active PPE Issues", allRecords.filter((r) => r.isActive).length, needsReplacement > 0 ? `${needsReplacement} need attention` : "All good", needsReplacement > 0 ? "#fef3c7" : "#dcfce7"],
      ["Unassessed Types", unassessedTypes.length, unassessedTypes.length > 0 ? unassessedTypes.map((t) => ppeTypeMap[t] ?? t).join(", ") : "None — full coverage", unassessedTypes.length > 0 ? "#fee2e2" : "#dcfce7"]
    ].map(([label, val, note, bg]) => `
          <div style="background:${bg};border-radius:5px;padding:8px 10px">
            <div style="font-size:7px;color:#374151;font-weight:600;text-transform:uppercase;letter-spacing:.05em">${label}</div>
            <div style="font-size:14px;font-weight:700;color:#111;margin:2px 0">${val}</div>
            ${note ? `<div style="font-size:6.5px;color:#555">${note}</div>` : ""}
          </div>`).join("")}
      </div>`;
    const raRows = allRisk.map((r) => `<tr>
      <td style="font-family:monospace;font-size:6.5px">${esc(r.assessmentRef)}</td>
      <td><strong>${esc(ppeTypeMap[r.ppeType] ?? r.ppeType)}</strong></td>
      <td>${esc(r.hazardIdentified)}</td>
      <td>${esc(r.taskOrArea)}</td>
      <td>${riskBadge(r.riskLevel)}</td>
      <td style="font-size:6.5px;max-width:100px;overflow:hidden">${esc(r.ppeSpecification)}</td>
      <td style="font-size:6.5px">${r.compatiblePpeTypes ? r.compatiblePpeTypes.split(",").filter(Boolean).map((t) => ppeTypeMap[t] ?? t).join(", ") : "—"}</td>
      <td>${esc(r.assessedBy)}</td>
      <td style="white-space:nowrap">${fmt(r.assessmentDate)}</td>
      <td style="white-space:nowrap${r.reviewDate && new Date(r.reviewDate) < today ? ";color:#b91c1c;font-weight:700" : ""}">${fmt(r.reviewDate)}</td>
    </tr>`).join("");
    const stockRows = allStock.map((s) => `<tr>
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
    const issueRows = allRecords.map((r) => `<tr>
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
      cphNumber: farm?.cphNumber ?? void 0,
      recordCount: allRisk.length + allStock.length + allRecords.length,
      recordLabel: "record",
      tableHtml,
      footerNote: "Maintained in compliance with the PPE at Work Regulations 2022. Retain for audit by Red Tractor, HSE, or other inspecting authority.",
      landscape: true
    });
  }
  function handlePrintStaffRecord(name) {
    const farm = farmMeta?.record;
    const staffIssues = allRecords.filter((r) => r.staffName === name).sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());
    const staffPpeTypes = new Set(staffIssues.map((r) => r.ppeType));
    const relevantRisk = allRisk.filter((r) => staffPpeTypes.has(r.ppeType));
    const issueRows = staffIssues.map((r) => `<tr>
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
    const raRows = relevantRisk.map((r) => `<tr>
      <td><strong>${esc(ppeTypeMap[r.ppeType] ?? r.ppeType)}</strong></td>
      <td>${esc(r.hazardIdentified)}</td>
      <td>${riskBadge(r.riskLevel)}</td>
      <td style="font-size:6.5px">${r.compatiblePpeTypes ? r.compatiblePpeTypes.split(",").filter(Boolean).map((t) => ppeTypeMap[t] ?? t).join(", ") : "—"}</td>
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
      cphNumber: farm?.cphNumber ?? void 0,
      tableHtml,
      footerNote: "PPE at Work Regulations 2022 — Individual PPE record. Retain for the duration of employment and a minimum of 3 years thereafter.",
      landscape: true
    });
  }
  function handlePrintPurchasing() {
    const farm = farmMeta?.record;
    const today = /* @__PURE__ */ new Date();
    const outstanding = allPpos.filter((po) => !["fully_received", "cancelled"].includes(po.status));
    const overdue = outstanding.filter((po) => po.expectedDeliveryDate && new Date(po.expectedDeliveryDate) < today);
    const invoicesPending = allPpos.filter((po) => po.invoiceStatus && !["paid"].includes(po.invoiceStatus) && po.status !== "cancelled");
    const statusLabel = { draft: "Draft", sent: "Sent", partially_received: "Part Received", fully_received: "Fully Received", cancelled: "Cancelled" };
    const invLabels = { pending_invoice: "Awaiting Invoice", invoice_received: "Invoice Received", queried: "Queried", approved: "Approved", paid: "Paid" };
    const summaryHtml = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      ${[
      ["Total Orders", allPpos.length, "", "#f0fdf4"],
      ["Outstanding Deliveries", outstanding.length, overdue.length > 0 ? `${overdue.length} overdue` : "All on schedule", overdue.length > 0 ? "#fef3c7" : "#dcfce7"],
      ["Invoices Pending", invoicesPending.length, "", invoicesPending.length > 0 ? "#fef3c7" : "#dcfce7"],
      ["Fully Received", allPpos.filter((p) => p.status === "fully_received").length, "", "#f0fdf4"]
    ].map(([label, val, note, bg]) => `<div style="background:${bg};border-radius:5px;padding:8px 10px"><div style="font-size:7px;color:#374151;font-weight:600;text-transform:uppercase;letter-spacing:.05em">${label}</div><div style="font-size:14px;font-weight:700;color:#111;margin:2px 0">${val}</div>${note ? `<div style="font-size:6.5px;color:#555">${note}</div>` : ""}</div>`).join("")}
    </div>`;
    const poRows = allPpos.map((po) => {
      const deliveryOverdue = po.expectedDeliveryDate && !["fully_received", "cancelled"].includes(po.status) && new Date(po.expectedDeliveryDate) < today;
      return `<tr>
        <td style="font-family:monospace;font-weight:700">${esc(po.poNumber)}</td>
        <td>${esc(po.supplierName)}</td>
        <td><span style="padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700;background:${po.status === "fully_received" ? "#dcfce7" : po.status === "cancelled" ? "#fee2e2" : po.status === "partially_received" ? "#fef3c7" : "#eff6ff"};color:${po.status === "fully_received" ? "#166534" : po.status === "cancelled" ? "#b91c1c" : po.status === "partially_received" ? "#92400e" : "#1d4ed8"}">${statusLabel[po.status] ?? po.status}</span></td>
        <td style="white-space:nowrap">${fmt(po.orderDate)}</td>
        <td style="white-space:nowrap${deliveryOverdue ? ";color:#b91c1c;font-weight:700" : ""}">${po.expectedDeliveryDate ? fmt(po.expectedDeliveryDate) : "—"}${deliveryOverdue ? " ⚠" : ""}</td>
        <td style="white-space:nowrap">${po.actualDeliveryDate ? fmt(po.actualDeliveryDate) : "—"}</td>
        <td style="font-family:monospace;font-size:6.5px">${esc(po.grnNumber)}</td>
        <td style="font-family:monospace;font-size:6.5px">${esc(po.invoiceRef)}</td>
        <td><span style="padding:1px 5px;border-radius:3px;font-size:6.5px;font-weight:700;background:${po.invoiceStatus === "paid" ? "#dcfce7" : po.invoiceStatus === "queried" ? "#fef3c7" : "#f3f4f6"};color:${po.invoiceStatus === "paid" ? "#166534" : po.invoiceStatus === "queried" ? "#92400e" : "#6b7280"}">${invLabels[po.invoiceStatus ?? "pending_invoice"] ?? po.invoiceStatus}</span></td>
        <td>${esc(po.submittedByName)}</td>
      </tr>`;
    }).join("");
    const tableHtml = `${summaryHtml}
      <div class="section-head">PPE Purchase Order Register (${allPpos.length} order${allPpos.length !== 1 ? "s" : ""})</div>
      ${allPpos.length === 0 ? `<p style="font-size:7.5px;color:#6b7280">No purchase orders recorded.</p>` : `
      <table><thead><tr>
        <th>PO Number</th><th>Supplier</th><th>Status</th><th>Order Date</th><th>Exp. Delivery</th><th>Actual Delivery</th><th>GRN</th><th>Invoice Ref</th><th>Invoice Status</th><th>Raised By</th>
      </tr></thead><tbody>${poRows}</tbody></table>`}`;
    printProReport({
      title: "PPE Purchase Order Report",
      subtitle: `All PPE purchase orders — ${allPpos.length} total, ${outstanding.length} outstanding`,
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      tableHtml,
      footerNote: "PPE purchasing register — for audit trail of PPE procurement, invoice reconciliation and delivery tracking.",
      landscape: true
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", flex: 1 }, children: ["stock", "issues", "risk", "purchasing", "stocktakes"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSubTab(t), style: { padding: "10px 20px", fontWeight: subTab === t ? 700 : 500, fontSize: "0.9rem", color: subTab === t ? "#166534" : "#6b7280", marginBottom: -2, background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: subTab === t ? "#166534" : "transparent", cursor: "pointer" }, children: t === "stock" ? "Stock Register" : t === "issues" ? "Issue Register" : t === "risk" ? "Risk Assessments" : t === "purchasing" ? "Purchasing" : "Stocktakes" }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, marginLeft: 12 }, children: [
        subTab === "purchasing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrintPurchasing, style: { whiteSpace: "nowrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-2" }),
          "Print PO Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrintCompliancePack, style: { whiteSpace: "nowrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-2" }),
          "Print Compliance Pack"
        ] })
      ] })
    ] }),
    subTab === "stock" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900 text-base", children: "PPE Stock Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Track PPE items held in stock with full supplier and invoice traceability." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditStock(null);
          setStockForm({ ...EMPTY_STOCK });
          setShowStockForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "Add Stock"
        ] })
      ] }),
      stockLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : allStock.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-10 h-10 mx-auto mb-3 text-gray-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-600 mb-1", children: "No PPE stock recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Add incoming PPE deliveries to maintain a stock register with supplier and invoice links." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", style: { borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["PPE Type", "Description", "Size", "Qty In Stock", "Unit Cost", "Supplier", "GRN / Delivery", "PO Ref", "Invoice Ref", "Received", "Batch", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: allStock.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : void 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", fontWeight: 600 }, children: ppeTypeMap[s.ppeType] ?? s.ppeType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: s.description ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280" }, children: s.size ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "10px 14px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, color: s.quantityInStock === 0 ? "#ef4444" : s.quantityInStock <= 2 ? "#d97706" : "#166534" }, children: s.quantityInStock }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", fontSize: "0.75rem", marginLeft: 4 }, children: [
              "/ ",
              s.quantityReceived,
              " recv"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: s.unitCostPence ? `£${(s.unitCostPence / 100).toFixed(2)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: resolveSupplierName(s) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", fontFamily: "monospace", fontSize: "0.8rem" }, children: s.grnNumber ?? s.deliveryNoteRef ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", fontFamily: "monospace", fontSize: "0.8rem" }, children: s.purchaseOrderId ? (() => {
            const po = allPpos.find((p) => p.id === s.purchaseOrderId);
            return po ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { whiteSpace: "nowrap" }, children: po.poNumber }) : `#${s.purchaseOrderId}`;
          })() : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", fontFamily: "monospace", fontSize: "0.8rem" }, children: s.invoiceRef ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: fmt(s.receivedDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280" }, children: s.batchNumber ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0 }, onClick: () => setViewStock(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0 }, onClick: () => openEditStock(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0, color: "#ef4444" }, onClick: () => setDeleteStockId(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }) })
        ] }, s.id)) })
      ] }) })
    ] }),
    subTab === "issues" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900 text-base", children: "PPE Issue Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Record all PPE issued to named staff members. Required under PPE at Work Regulations 2022." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditIssue(null);
          setIssueForm({ ...EMPTY_ISSUE });
          setShowIssueForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "Issue PPE"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: "0.875rem", color: "#1e40af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal requirement:" }),
        " Employers must provide PPE free of charge, keep a record of issue, and inspect condition regularly. The PPE at Work Regulations 2022 require documented risk assessments and individualised records."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mb-3 flex-wrap items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: issueSearch, onChange: (e) => setIssueSearch(e.target.value), placeholder: "Search by name or PPE type…", style: { maxWidth: 260 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: staffFilter || "__all__", onValueChange: (v) => setStaffFilter(v === "__all__" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { maxWidth: 220 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All staff members" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All staff members" }),
            staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            disabled: !staffFilter,
            onClick: () => staffFilter && handlePrintStaffRecord(staffFilter),
            title: staffFilter ? `Print PPE record for ${staffFilter}` : "Select a staff member to print their individual record",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14, className: "mr-2" }),
              "Print Staff Record"
            ]
          }
        )
      ] }),
      issueLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filteredIssues.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-10 h-10 mx-auto mb-3 text-gray-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-gray-600 mb-1", children: [
          "No PPE records",
          issueSearch || staffFilter ? " matching filter" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Issue PPE to staff members and record it here." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", style: { borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Staff Member", "PPE Type", "Size", "Date Issued", "Fit ✓", "Training ✓", "Condition", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredIssues.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : void 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", fontWeight: 600 }, children: r.staffName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: ppeTypeMap[r.ppeType] ?? r.ppeType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280" }, children: r.size ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: fmt(r.dateIssued) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", textAlign: "center" }, children: r.fitCheckConfirmed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 inline" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", textAlign: "center" }, children: r.trainingProvided ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 inline" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: r.conditionAtCheck ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: r.isActive ? "#dcfce7" : "#f3f4f6", color: r.isActive ? "#166534" : "#6b7280" }, children: r.isActive ? "Active" : "Replaced" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0 }, onClick: () => setViewIssue(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0 }, onClick: () => openEditIssue(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0, color: "#ef4444" }, onClick: () => setDeleteIssueId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }) })
        ] }, r.id)) })
      ] }) })
    ] }),
    viewStock && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewStock(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "PPE Stock Item — ",
        ppeTypeMap[viewStock.ppeType] ?? viewStock.ppeType
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8, fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "PPE Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: ppeTypeMap[viewStock.ppeType] ?? viewStock.ppeType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewStock.description ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewStock.size ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Received" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: viewStock.quantityReceived })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "In Stock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", style: { color: viewStock.quantityInStock === 0 ? "#ef4444" : "#166534" }, children: viewStock.quantityInStock })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Unit Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewStock.unitCostPence ? `£${(viewStock.unitCostPence / 100).toFixed(2)}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: resolveSupplierName(viewStock) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "GRN Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-bold text-blue-700", children: viewStock.grnNumber ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Purchase Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm", children: viewStock.purchaseOrderId ? allPpos.find((p) => p.id === viewStock.purchaseOrderId)?.poNumber ?? `PO #${viewStock.purchaseOrderId}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Invoice Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm", children: viewStock.invoiceRef ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Delivery Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm", children: viewStock.deliveryNoteRef ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Received Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(viewStock.receivedDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm", children: viewStock.batchNumber ?? "—" })
        ] }),
        viewStock.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { whiteSpace: "pre-line" }, children: viewStock.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEditStock(viewStock);
          setViewStock(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewStock(null), children: "Close" })
      ] })
    ] }) }),
    viewIssue && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewIssue(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "PPE Record — ",
        viewIssue.staffName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8, fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Staff Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: viewIssue.staffName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "PPE Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: ppeTypeMap[viewIssue.ppeType] ?? viewIssue.ppeType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewIssue.description ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewIssue.size ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewIssue.supplier ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Date Issued" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(viewIssue.dateIssued) })
        ] }),
        viewIssue.stockItemId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "From Stock Batch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "#",
            viewIssue.stockItemId,
            " — ",
            ppeTypeMap[allStock.find((s) => s.id === viewIssue.stockItemId)?.ppeType ?? ""] ?? "—"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Condition Check Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(viewIssue.conditionCheckDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Condition at Check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewIssue.conditionAtCheck ?? "—" })
        ] }),
        viewIssue.replacedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Replaced Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(viewIssue.replacedDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Replacement Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewIssue.replacedReason ?? "—" })
          ] })
        ] }),
        viewIssue.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { whiteSpace: "pre-line" }, children: viewIssue.notes })
        ] }),
        viewIssue.fitCheckConfirmed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }, children: "Individual Fit Check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 2 }, children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#166534", fontWeight: 600 }, children: "✓ Fit confirmed" })
            ] }),
            viewIssue.fitCheckBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 2 }, children: "Confirmed By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewIssue.fitCheckBy })
            ] }),
            viewIssue.fitCheckNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 2 }, children: "Fit Check Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { whiteSpace: "pre-line" }, children: viewIssue.fitCheckNotes })
            ] })
          ] })
        ] }),
        viewIssue.trainingProvided && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }, children: "PPE Training" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#166534", fontWeight: 600 }, children: "✓ Training provided" }) }),
          viewIssue.trainingNotes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: 4, whiteSpace: "pre-line", color: "#374151" }, children: viewIssue.trainingNotes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEditIssue(viewIssue);
          setViewIssue(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewIssue(null), children: "Close" })
      ] })
    ] }) }),
    showStockForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowStockForm(false);
        setEditStock(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editStock ? "Edit Stock Item" : "Add PPE to Stock" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PPE Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.ppeType, onValueChange: (v) => setSF("ppeType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ppeTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description / Specification" }),
          (EN_ISO[stockForm.ppeType] ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1 mb-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 self-center mr-1", children: "Quick-fill:" }),
            (EN_ISO[stockForm.ppeType] ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSF("description", s),
                style: { fontSize: "0.7rem", padding: "2px 8px", borderRadius: 999, border: "1px solid", cursor: "pointer", background: stockForm.description === s ? "#166534" : "#f9fafb", color: stockForm.description === s ? "#fff" : "#374151", borderColor: stockForm.description === s ? "#166534" : "#d1d5db", fontFamily: "monospace" },
                children: s
              },
              s
            ))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.description, onChange: (e) => setSF("description", e.target.value), placeholder: "e.g. EN ISO 20345:2011 S3 safety boot" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Size" }),
          (PPE_SIZES[stockForm.ppeType] ?? []).length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: (PPE_SIZES[stockForm.ppeType] ?? []).includes(stockForm.size) ? stockForm.size : "__other__", onValueChange: (v) => {
              if (v !== "__other__") setSF("size", v);
              else setSF("size", "");
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select size…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                (PPE_SIZES[stockForm.ppeType] ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / specify…" })
              ] })
            ] }),
            !(PPE_SIZES[stockForm.ppeType] ?? []).includes(stockForm.size) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: stockForm.size, onChange: (e) => setSF("size", e.target.value), placeholder: "Specify size" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.size, onChange: (e) => setSF("size", e.target.value), placeholder: "Size" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Received *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: stockForm.quantityReceived, onChange: (e) => setSF("quantityReceived", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit Cost (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: stockForm.unitCostPence, onChange: (e) => setSF("unitCostPence", e.target.value), placeholder: "e.g. 24.99" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stockForm.receivedDate, onChange: (e) => setSF("receivedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Purchase Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.purchaseOrderId || "__none__", onValueChange: (v) => {
            if (v === "__none__") {
              setSF("purchaseOrderId", "");
            } else {
              setSF("purchaseOrderId", v);
              const po = allPpos.find((p) => String(p.id) === v);
              if (po) {
                if (po.supplierId) {
                  setSF("supplierId", String(po.supplierId));
                  setSF("supplierName", po.supplierName ?? "");
                }
              }
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link to an existing PPE order (optional)…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No linked PO (manual stock addition) —" }),
              allPpos.filter((p) => !["fully_received", "cancelled"].includes(p.status)).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                p.poNumber,
                " — ",
                p.supplierName ?? "Unknown supplier",
                " (",
                p.status.replace(/_/g, " "),
                ")"
              ] }, p.id)),
              allPpos.filter((p) => p.status === "fully_received").map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                p.poNumber,
                " — ",
                p.supplierName ?? "Unknown",
                " [GRN: ",
                p.grnNumber,
                "]"
              ] }, p.id))
            ] })
          ] }),
          stockForm.purchaseOrderId && (() => {
            const linkedPo = allPpos.find((p) => String(p.id) === stockForm.purchaseOrderId);
            return linkedPo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-600 mt-1", children: [
              "Linked to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: linkedPo.poNumber }),
              linkedPo.grnNumber ? ` · GRN: ${linkedPo.grnNumber}` : " · A GRN reference will be generated automatically on save"
            ] }) : null;
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.supplierId || "__text__", onValueChange: (v) => {
            if (v === "__text__") {
              setSF("supplierId", "");
            } else {
              setSF("supplierId", v);
              setSF("supplierName", suppliers.find((s) => String(s.id) === v)?.name ?? "");
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from supplier register…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type supplier name manually —" }),
              suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
            ] })
          ] }),
          !stockForm.supplierId && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: stockForm.supplierName, onChange: (e) => setSF("supplierName", e.target.value), placeholder: "Supplier name (if not in register)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.invoiceRef, onChange: (e) => setSF("invoiceRef", e.target.value), placeholder: "e.g. INV-2024-1234" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Note Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.deliveryNoteRef, onChange: (e) => setSF("deliveryNoteRef", e.target.value), placeholder: "e.g. DN-4567" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stockForm.batchNumber, onChange: (e) => setSF("batchNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: stockForm.notes, onChange: (e) => setSF("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowStockForm(false);
          setEditStock(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => editStock ? updateStockMut.mutate({ ...stockForm, id: editStock.id }) : createStockMut.mutate(stockForm), disabled: !stockForm.ppeType || createStockMut.isPending || updateStockMut.isPending, children: [
          (createStockMut.isPending || updateStockMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          editStock ? "Update" : "Add to Stock"
        ] })
      ] })
    ] }) }),
    showIssueForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowIssueForm(false);
        setEditIssue(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editIssue ? "Edit PPE Issue Record" : "Issue PPE to Staff Member" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: issueForm.staffName || "__text__", onValueChange: (v) => setIF("staffName", v === "__text__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type name manually —" }),
              staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
            ] })
          ] }),
          (!issueForm.staffName || !staffNames.includes(issueForm.staffName)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: issueForm.staffName, onChange: (e) => setIF("staffName", e.target.value), placeholder: "Full name" })
        ] }),
        allStock.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue From Stock (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: issueForm.stockItemId || "__none__", onValueChange: (v) => selectStockItem(v === "__none__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select stock item to auto-fill details…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not from stock —" }),
              allStock.filter((s) => s.quantityInStock > 0).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                ppeTypeMap[s.ppeType] ?? s.ppeType,
                s.description ? ` — ${s.description}` : "",
                s.size ? ` (${s.size})` : "",
                " · ",
                s.quantityInStock,
                " in stock"
              ] }, s.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PPE Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: issueForm.ppeType, onValueChange: (v) => setIF("ppeType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ppeTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description / Specification" }),
          (EN_ISO[issueForm.ppeType] ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1 mb-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 self-center mr-1", children: "Quick-fill:" }),
            (EN_ISO[issueForm.ppeType] ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setIF("description", s),
                style: { fontSize: "0.7rem", padding: "2px 8px", borderRadius: 999, border: "1px solid", cursor: "pointer", background: issueForm.description === s ? "#166534" : "#f9fafb", color: issueForm.description === s ? "#fff" : "#374151", borderColor: issueForm.description === s ? "#166534" : "#d1d5db", fontFamily: "monospace" },
                children: s
              },
              s
            ))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: issueForm.description, onChange: (e) => setIF("description", e.target.value), placeholder: "e.g. EN ISO 20345:2011 S3 steel toe" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Size" }),
          (PPE_SIZES[issueForm.ppeType] ?? []).length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: (PPE_SIZES[issueForm.ppeType] ?? []).includes(issueForm.size) ? issueForm.size : "__other__", onValueChange: (v) => {
              if (v !== "__other__") setIF("size", v);
              else setIF("size", "");
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select size…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                (PPE_SIZES[issueForm.ppeType] ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / specify…" })
              ] })
            ] }),
            !(PPE_SIZES[issueForm.ppeType] ?? []).includes(issueForm.size) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: issueForm.size, onChange: (e) => setIF("size", e.target.value), placeholder: "Specify size" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: issueForm.size, onChange: (e) => setIF("size", e.target.value), placeholder: "Size" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          issueForm.stockItemId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.875rem", color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", marginTop: 4 }, children: [
            issueForm.supplier || "—",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 ml-2", children: "(from stock item)" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: issueForm.supplier && suppliers.find((s) => s.name === issueForm.supplier) ? issueForm.supplier : "__text__", onValueChange: (v) => setIF("supplier", v === "__text__" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from supplier register…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type supplier name manually —" }),
                suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.name, children: s.name }, s.id))
              ] })
            ] }),
            (!issueForm.supplier || !suppliers.find((s) => s.name === issueForm.supplier)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: issueForm.supplier, onChange: (e) => setIF("supplier", e.target.value), placeholder: "Supplier name (if not in register)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Issued *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: issueForm.dateIssued, onChange: (e) => setIF("dateIssued", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Condition Check Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: issueForm.conditionCheckDate, onChange: (e) => setIF("conditionCheckDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Condition at Last Check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: issueForm.conditionAtCheck || "", onValueChange: (v) => setIF("conditionAtCheck", v || ""), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select condition…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Good", children: "Good — fit for purpose" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Acceptable", children: "Acceptable — minor wear" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Needs replacement", children: "Needs Replacement" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Condemned", children: "Condemned — taken out of use" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Replaced Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: issueForm.replacedDate, onChange: (e) => setIF("replacedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Replacement Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: issueForm.replacedReason, onChange: (e) => setIF("replacedReason", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: issueForm.notes, onChange: (e) => setIF("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Individual Fit Check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: issueForm.fitCheckConfirmed, onChange: (e) => setIF("fitCheckConfirmed", e.target.checked), className: "w-4 h-4 accent-green-700" }),
            "Individual fit confirmed for this staff member"
          ] }),
          issueForm.fitCheckConfirmed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confirmed By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: issueForm.fitCheckBy || "__text__", onValueChange: (v) => setIF("fitCheckBy", v === "__text__" ? "" : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type name manually —" }),
                  staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
                ] })
              ] }),
              (!issueForm.fitCheckBy || !staffNames.includes(issueForm.fitCheckBy)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: issueForm.fitCheckBy, onChange: (e) => setIF("fitCheckBy", e.target.value), placeholder: "Full name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fit Check Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: issueForm.fitCheckNotes, onChange: (e) => setIF("fitCheckNotes", e.target.value), placeholder: "e.g. Checked fit and seal — correct size M confirmed", rows: 2 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-3", children: "PPE Training" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: issueForm.trainingProvided, onChange: (e) => setIF("trainingProvided", e.target.checked), className: "w-4 h-4 accent-green-700" }),
            "Training on correct use and maintenance provided"
          ] }),
          issueForm.trainingProvided && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Training Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: issueForm.trainingNotes, onChange: (e) => setIF("trainingNotes", e.target.value), placeholder: "e.g. Toolbox talk 01/06/2026 — donning/doffing, storage, inspection schedule", rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "issueActive", checked: issueForm.isActive, onChange: (e) => setIF("isActive", e.target.checked), style: { height: 16, width: 16 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "issueActive", children: "Item currently active / in use" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowIssueForm(false);
          setEditIssue(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => editIssue ? updateIssueMut.mutate({ ...issueForm, id: editIssue.id }) : createIssueMut.mutate(issueForm), disabled: !issueForm.staffName || !issueForm.dateIssued || createIssueMut.isPending || updateIssueMut.isPending, children: [
          (createIssueMut.isPending || updateIssueMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          editIssue ? "Update" : "Issue PPE"
        ] })
      ] })
    ] }) }),
    deleteStockId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setDeleteStockId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Stock Item?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This stock record will be permanently removed. Any issue records linked to it will retain their stock reference." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteStockId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteStockMut.mutate(deleteStockId), disabled: deleteStockMut.isPending, children: deleteStockMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Remove" })
      ] })
    ] }) }),
    deleteIssueId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setDeleteIssueId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove PPE Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This PPE issue record will be permanently removed from the register." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteIssueId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteIssueMut.mutate(deleteIssueId), disabled: deleteIssueMut.isPending, children: deleteIssueMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Remove" })
      ] })
    ] }) }),
    subTab === "purchasing" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900 text-base", children: "PPE Purchase Orders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Raise PPE orders, track delivery, and receive goods directly into the PPE Stock Register." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openPoAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "Raise PPE Order"
        ] })
      ] }),
      allPpos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 36, marginBottom: 8 }, children: "📦" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No PPE purchase orders yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af" }, children: "Raise a PPE order to track purchasing from supplier through to stock receipt." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", style: { borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["PO Number", "Supplier", "Status", "Order Date", "Exp. Delivery", "GRN", "Invoice", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: allPpos.map((po, i) => {
          const statusColors = { draft: ["#f3f4f6", "#6b7280"], sent: ["#eff6ff", "#1d4ed8"], partially_received: ["#fef3c7", "#92400e"], fully_received: ["#dcfce7", "#166534"], cancelled: ["#fef2f2", "#b91c1c"] };
          const [sbg, scol] = statusColors[po.status] ?? ["#f3f4f6", "#6b7280"];
          const statusLabel = { draft: "Draft", sent: "Sent", partially_received: "Part Received", fully_received: "Fully Received", cancelled: "Cancelled" };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : void 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", fontFamily: "monospace", fontWeight: 700 }, children: po.poNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: po.supplierName ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: sbg, color: scol, borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }, children: statusLabel[po.status] ?? po.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", whiteSpace: "nowrap" }, children: fmt(po.orderDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", whiteSpace: "nowrap" }, children: po.expectedDeliveryDate ? fmt(po.expectedDeliveryDate) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }, children: po.grnNumber ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "10px 14px" }, children: [
              (() => {
                const invColors = { pending_invoice: ["#f3f4f6", "#6b7280"], invoice_received: ["#eff6ff", "#1d4ed8"], queried: ["#fef3c7", "#92400e"], approved: ["#f0fdf4", "#166534"], paid: ["#dcfce7", "#166534"] };
                const invLabels = { pending_invoice: "Awaiting Invoice", invoice_received: "Invoice Received", queried: "Queried", approved: "Approved", paid: "Paid ✓" };
                const st = po.invoiceStatus ?? "pending_invoice";
                const [bg, col] = invColors[st] ?? ["#f3f4f6", "#6b7280"];
                return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: bg, color: col, borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }, children: invLabels[st] ?? st });
              })(),
              po.invoiceRef && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontFamily: "monospace", marginTop: 2 }, children: po.invoiceRef })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              !["fully_received", "cancelled"].includes(po.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => openGrn(po), children: "Receive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openPoEdit(po), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => deletePoMut.mutate(po.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] }) })
          ] }, po.id);
        }) })
      ] }) })
    ] }),
    subTab === "stocktakes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900 text-base", children: "PPE Stocktakes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Periodic physical count of PPE stock to verify system quantities and identify losses or discrepancies." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setStocktakeNewForm({ stocktakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), conductedBy: "", notes: "" });
          setStocktakeNewOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "Start Stocktake"
        ] })
      ] }),
      activeStocktakeId && activeStocktake ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setActiveStocktakeId(null), children: "← Back to list" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, fontSize: "0.95rem" }, children: [
              "Stocktake — ",
              fmt(activeStocktake.stocktakeDate)
            ] }),
            activeStocktake.conductedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280", marginLeft: 8, fontSize: "0.85rem" }, children: [
              "by ",
              activeStocktake.conductedBy
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 10, padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700, background: activeStocktake.status === "complete" ? "#dcfce7" : "#fef3c7", color: activeStocktake.status === "complete" ? "#166534" : "#92400e" }, children: activeStocktake.status === "complete" ? "Complete" : `In Progress — ${activeStocktake.countedCount} / ${activeStocktake.itemCount} counted` })
          ] })
        ] }),
        activeStocktake.items?.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-500", children: "No stock items found. Add PPE stock items first." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", style: { borderCollapse: "collapse" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["PPE Type", "Description", "Size", "System Qty", "Physical Count", "Variance", "Value Impact", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "#6b7280", fontSize: "0.78rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: activeStocktake.items?.map((item, i) => {
              const edit = stocktakeItemEdits[item.id] ?? { countedQty: item.countedQty !== null ? String(item.countedQty) : "", notes: item.notes ?? "" };
              const variance = item.countedQty !== null ? item.variance : null;
              const isSaved = item.countedQty !== null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : void 0, background: variance !== null && variance < 0 ? "#fff7f7" : variance !== null && variance > 0 ? "#f0fdf4" : void 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600 }, children: ppeTypeMap[item.ppeType] ?? item.ppeType }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151" }, children: item.description ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280" }, children: item.size ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, textAlign: "center" }, children: item.expectedQty }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", minWidth: 80 }, children: activeStocktake.status === "complete" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, color: variance !== null && variance < 0 ? "#b91c1c" : variance !== null && variance > 0 ? "#166534" : "#374151" }, children: item.countedQty ?? "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: "0",
                    value: edit.countedQty,
                    onChange: (e) => setStocktakeItemEdits((prev) => ({ ...prev, [item.id]: { ...edit, countedQty: e.target.value } })),
                    style: { width: 72, height: 30, textAlign: "center", fontWeight: 700, borderColor: isSaved ? "#86efac" : void 0 },
                    placeholder: "Count"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", textAlign: "center", fontWeight: 700, color: variance === null ? "#9ca3af" : variance < 0 ? "#b91c1c" : variance > 0 ? "#166534" : "#374151" }, children: variance === null ? "—" : variance > 0 ? `+${variance}` : String(variance) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: variance !== null && variance !== 0 && item.unitCostPence ? variance < 0 ? "#b91c1c" : "#166534" : "#9ca3af", fontWeight: variance !== null && variance !== 0 ? 600 : 400 }, children: item.varianceValuePence != null && item.varianceValuePence !== 0 ? `${item.varianceValuePence < 0 ? "-" : "+"}£${Math.abs(item.varianceValuePence / 100).toFixed(2)}` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", minWidth: 140 }, children: activeStocktake.status === "complete" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.8rem" }, children: item.notes ?? "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: edit.notes,
                    onChange: (e) => setStocktakeItemEdits((prev) => ({ ...prev, [item.id]: { ...edit, notes: e.target.value } })),
                    style: { height: 30, fontSize: "0.8rem" },
                    placeholder: "Notes…"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: activeStocktake.status !== "complete" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: isSaved ? "outline" : "default",
                    style: { height: 28, padding: "0 10px", fontSize: "0.75rem" },
                    disabled: edit.countedQty === "",
                    onClick: () => {
                      const qty = parseInt(edit.countedQty);
                      if (isNaN(qty)) return;
                      patchStocktakeItemMut.mutate({ sessionId: activeStocktakeId, itemId: item.id, countedQty: qty, notes: edit.notes });
                      setStocktakeItemEdits((prev) => {
                        const n = { ...prev };
                        delete n[item.id];
                        return n;
                      });
                    },
                    children: isSaved ? "Update" : "Save"
                  }
                ) })
              ] }, item.id);
            }) })
          ] }) }),
          activeStocktake.status !== "complete" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStocktakeDeleteId(activeStocktakeId), className: "text-red-500 hover:text-red-700", children: "Discard Draft" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                disabled: activeStocktake.countedCount < activeStocktake.itemCount,
                onClick: () => {
                  if (window.confirm(`Complete this stocktake? This will reconcile all counted quantities back into the stock register. This action cannot be undone.`)) completeStocktakeMut.mutate(activeStocktakeId);
                },
                children: [
                  "Complete & Reconcile (",
                  activeStocktake.countedCount,
                  "/",
                  activeStocktake.itemCount,
                  ")"
                ]
              }
            )
          ] }),
          activeStocktake.status === "complete" && (() => {
            const items = activeStocktake.items ?? [];
            const variances = items.filter((i) => i.variance !== null && i.variance !== 0);
            const totalLoss = items.filter((i) => (i.varianceValuePence ?? 0) < 0).reduce((s, i) => s + Math.abs(i.varianceValuePence ?? 0), 0);
            return variances.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", marginTop: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, color: "#92400e", marginBottom: 4 }, children: [
                "⚠ Variances Found — ",
                variances.length,
                " item",
                variances.length !== 1 ? "s" : "",
                " with discrepancy",
                totalLoss > 0 ? ` (−£${(totalLoss / 100).toFixed(2)} total loss)` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#78350f" }, children: "Stock quantities have been updated. Review the variances above and investigate any losses." })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "12px 16px", marginTop: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, color: "#166534" }, children: "✓ All quantities matched — no discrepancies found" }) });
          })()
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: stocktakesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : stocktakeList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-10 h-10 mx-auto mb-3 text-gray-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-600 mb-1", children: "No stocktakes recorded yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Start a guided stocktake to physically count PPE items and reconcile with system quantities." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", style: { borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Conducted By", "Status", "Items", "Completed", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: stocktakeList.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : void 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", fontWeight: 600 }, children: fmt(s.stocktakeDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: s.conductedBy ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700, background: s.status === "complete" ? "#dcfce7" : "#fef3c7", color: s.status === "complete" ? "#166534" : "#92400e" }, children: s.status === "complete" ? "Complete" : `Draft (${s.countedCount}/${s.itemCount})` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", textAlign: "center" }, children: s.itemCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: s.completedAt ? fmt(s.completedAt) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280", fontSize: "0.8rem" }, children: s.notes ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setActiveStocktakeId(s.id), children: s.status === "complete" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13, className: "mr-1" }),
              "View"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, className: "mr-1" }),
              "Continue"
            ] }) }),
            s.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => setStocktakeDeleteId(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }) })
        ] }, s.id)) })
      ] }) }) }),
      stocktakeNewOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) setStocktakeNewOpen(false);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Start New PPE Stocktake" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "A snapshot of current system quantities will be taken. Enter actual physical counts for each item." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stocktake Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stocktakeNewForm.stocktakeDate, onChange: (e) => setStocktakeNewForm((f) => ({ ...f, stocktakeDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conducted By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stocktakeNewForm.conductedBy || "__text__", onValueChange: (v) => setStocktakeNewForm((f) => ({ ...f, conductedBy: v === "__text__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type name manually —" }),
                staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
              ] })
            ] }),
            (!stocktakeNewForm.conductedBy || !staffNames.includes(stocktakeNewForm.conductedBy)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: stocktakeNewForm.conductedBy, onChange: (e) => setStocktakeNewForm((f) => ({ ...f, conductedBy: e.target.value })), placeholder: "Name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: stocktakeNewForm.notes, onChange: (e) => setStocktakeNewForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "e.g. Routine quarterly stocktake" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStocktakeNewOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !stocktakeNewForm.stocktakeDate || createStocktakeMut.isPending, onClick: () => createStocktakeMut.mutate({ stocktakeDate: stocktakeNewForm.stocktakeDate, conductedBy: stocktakeNewForm.conductedBy || void 0, notes: stocktakeNewForm.notes || void 0 }), children: [
            createStocktakeMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
            "Start Stocktake"
          ] })
        ] })
      ] }) }),
      stocktakeDeleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) setStocktakeDeleteId(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Discard Stocktake?" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "This will permanently delete this draft stocktake. Stock quantities will not be affected." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStocktakeDeleteId(null), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteStocktakeMut.mutate(stocktakeDeleteId), children: "Delete" })
        ] })
      ] }) })
    ] }),
    subTab === "risk" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900 text-base", children: "PPE Risk Assessments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Documented risk assessments required by the PPE at Work Regulations 2022 — confirming correct PPE selection, specification, and compatibility with other PPE in use." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditRisk(null);
          setRiskForm({ ...EMPTY_RISK });
          setShowRiskForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "New Assessment"
        ] })
      ] }),
      riskLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : allRisk.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-10 h-10 mx-auto mb-3 text-gray-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-600 mb-1", children: "No PPE risk assessments recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Create a risk assessment before issuing PPE to staff. This satisfies the PPE at Work Regulations 2022 documentation requirement." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", style: { borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Ref", "PPE Type", "Hazard Identified", "Task / Area", "Risk", "PPE Specification", "Compatible With", "Assessed By", "Date", "Review Due", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: allRisk.map((r, i) => {
          const reviewDue = r.reviewDate ? new Date(r.reviewDate) : null;
          const today = /* @__PURE__ */ new Date();
          const reviewOverdue = reviewDue && reviewDue < today;
          const reviewSoon = reviewDue && !reviewOverdue && reviewDue.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1e3;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : void 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }, children: r.assessmentRef ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", fontWeight: 600 }, children: ppeTypeMap[r.ppeType] ?? r.ppeType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", maxWidth: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }, children: r.hazardIdentified }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280" }, children: r.taskOrArea ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: r.riskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700, background: r.riskLevel === "High" ? "#fee2e2" : r.riskLevel === "Medium" ? "#fef9c3" : "#dcfce7", color: r.riskLevel === "High" ? "#b91c1c" : r.riskLevel === "Medium" ? "#854d0e" : "#166534" }, children: r.riskLevel }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151", maxWidth: 150 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }, children: r.ppeSpecification ?? "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: r.compatiblePpeTypes ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: r.compatiblePpeTypes.split(",").filter(Boolean).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 4, padding: "1px 6px", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: ppeTypeMap[t] ?? t }, t)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: r.assessedBy }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#374151" }, children: fmt(r.assessmentDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: reviewDue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: reviewOverdue ? "#b91c1c" : reviewSoon ? "#d97706" : "#374151", fontWeight: reviewOverdue || reviewSoon ? 700 : 400 }, children: [
              reviewOverdue ? "⚠ " : reviewSoon ? "⏰ " : "",
              fmt(r.reviewDate)
            ] }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRisk(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEditRisk(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => setDeleteRiskId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] }) })
          ] }, r.id);
        }) })
      ] }) }),
      showRiskForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) {
          setShowRiskForm(false);
          setEditRisk(null);
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRisk ? "Edit PPE Risk Assessment" : "New PPE Risk Assessment" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: editRisk ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { style: { fontFamily: "monospace", fontWeight: 700 }, value: riskForm.assessmentRef, onChange: (e) => setRF("assessmentRef", e.target.value), placeholder: "e.g. PPE-RA-001" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontFamily: "monospace", fontSize: "0.875rem", color: "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", marginTop: 4 }, children: "Auto-generated on save" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PPE Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: riskForm.ppeType, onValueChange: (v) => setRF("ppeType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ppeTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hazard Identified *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: riskForm.hazardIdentified, onChange: (e) => setRF("hazardIdentified", e.target.value), placeholder: "Describe the hazard this PPE protects against (e.g. grain dust — risk of respiratory disease)", rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Task or Area" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: riskForm.taskOrArea, onChange: (e) => setRF("taskOrArea", e.target.value), placeholder: "e.g. Grain handling, Chemical spraying" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Risk Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: riskForm.riskLevel, onValueChange: (v) => setRF("riskLevel", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select risk level…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Low", children: "Low" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Medium", children: "Medium" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "High", children: "High" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PPE Specification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: riskForm.ppeSpecification, onChange: (e) => setRF("ppeSpecification", e.target.value), placeholder: "Specific standard, EN number, manufacturer or model required (e.g. EN 149:2001+A1:2009 FFP3 respirator)", rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "PPE Compatibility" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-3", children: "Select all other PPE types confirmed compatible with this item when worn simultaneously." }),
            (() => {
              const compatTypes = ppeTypes.filter((t) => t.value !== riskForm.ppeType);
              const selectedTypes = riskForm.compatiblePpeTypes ? riskForm.compatiblePpeTypes.split(",").filter(Boolean) : [];
              return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-x-6 gap-y-2", children: compatTypes.map((t) => {
                const checked = selectedTypes.includes(t.value);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: () => {
                    const updated = checked ? selectedTypes.filter((x) => x !== t.value) : [...selectedTypes, t.value];
                    setRF("compatiblePpeTypes", updated.join(","));
                  }, className: "w-4 h-4 accent-green-700" }),
                  t.label
                ] }, t.value);
              }) });
            })()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: riskForm.assessedBy || "__text__", onValueChange: (v) => setRF("assessedBy", v === "__text__" ? "" : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type name manually —" }),
                  staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
                ] })
              ] }),
              (!riskForm.assessedBy || !staffNames.includes(riskForm.assessedBy)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: riskForm.assessedBy, onChange: (e) => setRF("assessedBy", e.target.value), placeholder: "Full name of assessor" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: riskForm.assessmentDate, onChange: (e) => setRF("assessmentDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: riskForm.reviewDate, onChange: (e) => setRF("reviewDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: riskForm.notes, onChange: (e) => setRF("notes", e.target.value), placeholder: "Any additional notes…", rows: 2 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setShowRiskForm(false);
            setEditRisk(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              disabled: !riskForm.ppeType || !riskForm.hazardIdentified || !riskForm.assessedBy || !riskForm.assessmentDate || createRiskMut.isPending || updateRiskMut.isPending,
              onClick: () => {
                if (editRisk) updateRiskMut.mutate({ ...riskForm, id: editRisk.id });
                else createRiskMut.mutate(riskForm);
              },
              children: [
                createRiskMut.isPending || updateRiskMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-2" }) : null,
                editRisk ? "Save Changes" : "Save Assessment"
              ]
            }
          )
        ] })
      ] }) }),
      viewRisk && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRisk(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "PPE Risk Assessment — ",
          viewRisk.assessmentRef ?? "Draft"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRisk.assessmentRef ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PPE Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: ppeTypeMap[viewRisk.ppeType] ?? viewRisk.ppeType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Hazard Identified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRisk.hazardIdentified })
          ] }),
          viewRisk.taskOrArea && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Task / Area" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRisk.taskOrArea })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Risk Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRisk.riskLevel ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${viewRisk.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`, children: viewRisk.isActive ? "Active" : "Inactive" })
          ] }),
          viewRisk.ppeSpecification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PPE Specification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRisk.ppeSpecification })
          ] }),
          viewRisk.compatiblePpeTypes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Compatible PPE Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRisk.compatiblePpeTypes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRisk.assessedBy })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRisk.assessmentDate) })
          ] }),
          viewRisk.reviewDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Review Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRisk.reviewDate) })
          ] }),
          viewRisk.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRisk.notes })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
            openEditRisk(viewRisk);
            setViewRisk(null);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
            "Edit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRisk(null), children: "Close" })
        ] })
      ] }) }),
      deleteRiskId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) setDeleteRiskId(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Risk Assessment?" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This PPE risk assessment record will be permanently deleted." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteRiskId(null), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteRiskMut.mutate(deleteRiskId), disabled: deleteRiskMut.isPending, children: deleteRiskMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Delete" })
        ] })
      ] }) })
    ] }),
    showPoForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowPoForm(false);
        setEditPo(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editPo ? "Edit PPE Order" : "Raise PPE Purchase Order" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: poForm.supplierId || "__text__", onValueChange: (v) => {
            if (v === "__text__") {
              setSPF("supplierId", "");
            } else {
              setSPF("supplierId", v);
              setSPF("supplierName", suppliers.find((s) => String(s.id) === v)?.name ?? "");
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from supplier register…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type supplier name manually —" }),
              suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
            ] })
          ] }),
          !poForm.supplierId && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: poForm.supplierName, onChange: (e) => setSPF("supplierName", e.target.value), placeholder: "Supplier name (if not in register)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Order Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: poForm.orderDate, onChange: (e) => setSPF("orderDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: poForm.expectedDeliveryDate, onChange: (e) => setSPF("expectedDeliveryDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Submitted By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: poForm.submittedByName || "__text__", onValueChange: (v) => setSPF("submittedByName", v === "__text__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__text__", children: "— Type name manually —" }),
              staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
            ] })
          ] }),
          (!poForm.submittedByName || !staffNames.includes(poForm.submittedByName)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: poForm.submittedByName, onChange: (e) => setSPF("submittedByName", e.target.value), placeholder: "Name of person raising order" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-semibold", children: "Order Lines" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setPoLines((ls) => [...ls, { ...EMPTY_PO_LINE }]), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
            "Add Line"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: poLines.map((line, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 80px 90px 36px", gap: 8, alignItems: "end", background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.7rem" }, children: "PPE Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: line.ppeType, onValueChange: (v) => setPoLines((ls) => ls.map((l, i) => i === idx ? { ...l, ppeType: v } : l)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ppeTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.7rem" }, children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: line.description, onChange: (e) => setPoLines((ls) => ls.map((l, i) => i === idx ? { ...l, description: e.target.value } : l)), placeholder: "Specification" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.7rem" }, children: "Size" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: line.size, onChange: (e) => setPoLines((ls) => ls.map((l, i) => i === idx ? { ...l, size: e.target.value } : l)), placeholder: "Size" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.7rem" }, children: "Qty *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: line.quantityOrdered, onChange: (e) => setPoLines((ls) => ls.map((l, i) => i === idx ? { ...l, quantityOrdered: e.target.value } : l)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.7rem" }, children: "Unit £" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: line.unitPricePence, onChange: (e) => setPoLines((ls) => ls.map((l, i) => i === idx ? { ...l, unitPricePence: e.target.value } : l)), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { paddingBottom: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => setPoLines((ls) => ls.filter((_, i) => i !== idx)), disabled: poLines.length === 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) }) })
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: poForm.notes, onChange: (e) => setSPF("notes", e.target.value), rows: 2 })
      ] }),
      editPo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 16, padding: "14px 16px", background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-blue-800 mb-3", children: "Invoice & Payment Tracking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.8rem" }, children: "Supplier Invoice Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: poForm.invoiceRef, onChange: (e) => setSPF("invoiceRef", e.target.value), placeholder: "e.g. INV-2024-5678" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.8rem" }, children: "Invoice Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: poForm.invoiceStatus, onValueChange: (v) => setSPF("invoiceStatus", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending_invoice", children: "Awaiting Invoice" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invoice_received", children: "Invoice Received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "queried", children: "Queried with Supplier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved for Payment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.8rem" }, children: "Date Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: poForm.invoicePaidDate, onChange: (e) => setSPF("invoicePaidDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.8rem" }, children: "Payment Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: poForm.paymentRef, onChange: (e) => setSPF("paymentRef", e.target.value), placeholder: "BACS ref, cheque number, etc." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowPoForm(false);
          setEditPo(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: !poForm.orderDate || poLines.length === 0 || createPoMut.isPending || updatePoMut.isPending,
            onClick: () => {
              const payload = { ...poForm, supplierId: poForm.supplierId ? parseInt(poForm.supplierId) : null, lines: poLines.map((l) => ({ ...l, quantityOrdered: parseInt(l.quantityOrdered) || 1, unitPricePence: l.unitPricePence ? Math.round(parseFloat(l.unitPricePence) * 100) : null })) };
              if (editPo) updatePoMut.mutate(payload);
              else createPoMut.mutate(payload);
            },
            children: [
              (createPoMut.isPending || updatePoMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
              editPo ? "Update Order" : "Raise Order"
            ]
          }
        )
      ] })
    ] }) }),
    showGrnDialog && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setShowGrnDialog(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Receive Goods — ",
        showGrnDialog.poNumber
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "A PPE-GRN reference is auto-generated. Items received are added to the PPE Stock Register automatically." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actual Delivery Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: grnDate, onChange: (e) => setGrnDate(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-semibold mb-2 block", children: "Quantities Received" }),
        (showGrnDialog.lines ?? []).map((line) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr auto 90px", gap: 8, alignItems: "center", marginBottom: 8, background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: ppeTypeMap[line.ppeType] ?? line.ppeType }),
            line.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
              line.description,
              line.size ? ` — ${line.size}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400", children: [
              "Ordered: ",
              line.quantityOrdered,
              " | Already received: ",
              line.quantityReceived
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.75rem", whiteSpace: "nowrap" }, children: "Qty now received:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", max: line.quantityOrdered - line.quantityReceived, value: grnQtys[line.id] ?? "", onChange: (e) => setGrnQtys((q) => ({ ...q, [line.id]: e.target.value })), placeholder: "0" })
        ] }, line.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowGrnDialog(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: receivePoMut.isPending,
            onClick: () => {
              const lines = (showGrnDialog.lines ?? []).map((l) => ({ lineId: l.id, quantityReceived: parseInt(grnQtys[l.id] ?? "0") || 0 })).filter((l) => l.quantityReceived > 0);
              if (!lines.length) {
                toast({ title: "Enter at least one quantity received", variant: "destructive" });
                return;
              }
              receivePoMut.mutate({ actualDeliveryDate: grnDate, lines });
            },
            children: [
              receivePoMut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
              "Record Receipt"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function useMembers(farmId) {
  return useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load staff");
      return res.json();
    },
    enabled: !!farmId
  });
}
function useCerts(farmId) {
  return useQuery({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
}
function useRtw(farmId) {
  return useQuery({
    queryKey: ["staff-rtw", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/right-to-work`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
}
function RtwBadge({ name, records }) {
  const mine = records.filter((r) => r.staffName.toLowerCase().trim() === name.toLowerCase().trim());
  if (mine.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-red-600 flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
    "Not checked"
  ] });
  const now = /* @__PURE__ */ new Date();
  const expired = mine.some((r) => r.expiryDate && new Date(r.expiryDate) < now);
  const urgent = mine.some((r) => {
    if (!r.expiryDate) return false;
    const d = Math.floor((new Date(r.expiryDate).getTime() - now.getTime()) / 864e5);
    return d >= 0 && d <= 28;
  });
  if (expired) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-red-600 flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
    "Expired"
  ] });
  if (urgent) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-amber-600 flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
    "Expiring soon"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-green-600 flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3 h-3" }),
    "Checked"
  ] });
}
function CertBadge({ name, certs }) {
  const mine = certs.filter((c) => c.userId === name);
  if (mine.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: "None recorded" });
  const now = /* @__PURE__ */ new Date();
  const expired = mine.filter((c) => c.expiryDate && new Date(c.expiryDate) < now).length;
  const expiring = mine.filter((c) => {
    if (!c.expiryDate) return false;
    const days = Math.floor((new Date(c.expiryDate).getTime() - now.getTime()) / 864e5);
    return days >= 0 && days <= 60;
  }).length;
  if (expired > 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-red-600", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
    mine.length,
    " cert",
    mine.length !== 1 ? "s" : "",
    " · ",
    expired,
    " expired"
  ] });
  if (expiring > 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-amber-600", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
    mine.length,
    " cert",
    mine.length !== 1 ? "s" : "",
    " · ",
    expiring,
    " expiring"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-green-600", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-3 h-3" }),
    mine.length,
    " cert",
    mine.length !== 1 ? "s" : ""
  ] });
}
function AddMemberDialog({ farmId, open, onClose, departments }) {
  const [firstName, setFirstName] = reactExports.useState("");
  const [lastName, setLastName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [jobTitle, setJobTitle] = reactExports.useState("");
  const [departmentId, setDepartmentId] = reactExports.useState("none");
  const [secondaryDeptIds, setSecondaryDeptIds] = reactExports.useState([]);
  const [farmRole, setFarmRole] = reactExports.useState("operator");
  const [employedFrom, setEmployedFrom] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [niNumber, setNiNumber] = reactExports.useState("");
  const [payrollNumber, setPayrollNumber] = reactExports.useState("");
  const [nokName, setNokName] = reactExports.useState("");
  const [nokRelationship, setNokRelationship] = reactExports.useState("");
  const [nokPhone, setNokPhone] = reactExports.useState("");
  const [nokEmail, setNokEmail] = reactExports.useState("");
  const [step, setStep] = reactExports.useState("form");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  function reset() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setJobTitle("");
    setDepartmentId("none");
    setSecondaryDeptIds([]);
    setFarmRole("operator");
    setEmployedFrom("");
    setNotes("");
    setNiNumber("");
    setPayrollNumber("");
    setNokName("");
    setNokRelationship("");
    setNokPhone("");
    setNokEmail("");
    setStep("form");
  }
  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ firstName, lastName, email: email || null, phone: phone || null, jobTitle: jobTitle || null, departmentId: departmentId !== "none" ? Number(departmentId) : null, secondaryDepartmentIds: secondaryDeptIds, farmRole, employedFrom: employedFrom || null, notes: notes || null, niNumber: niNumber || null, payrollNumber: payrollNumber || null, nokName: nokName || null, nokRelationship: nokRelationship || null, nokPhone: nokPhone || null, nokEmail: nokEmail || null })
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      setStep("success");
    },
    onError: () => toast({ title: "Failed to add staff member", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { style: { maxWidth: "32rem" }, children: step === "form" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Staff Member" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "details", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "details", className: "flex-1", children: "Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "employment", className: "flex-1", children: "Employment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "nok", className: "flex-1", children: "Next of Kin" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "details", className: "space-y-3 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "First Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Jane", value: firstName, onChange: (e) => setFirstName(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Smith", value: lastName, onChange: (e) => setLastName(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "jane@farm.co.uk", value: email, onChange: (e) => setEmail(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Required if you later want to invite them to log in." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "07700 000000", value: phone, onChange: (e) => setPhone(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job Title / Role Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Stockman, Tractor Driver, etc.", value: jobTitle, onChange: (e) => setJobTitle(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farm Role (permission level)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: farmRole, onValueChange: (v) => setFarmRole(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "operator", children: "Operator — field worker, logs records" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "senior", children: "Senior / Foreman — team lead, can view all records" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Farm Manager — full operational access" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "owner", children: "Owner — unrestricted access" })
            ] })
          ] })
        ] }),
        departments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Primary Department" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: departmentId, onValueChange: (v) => {
            setDepartmentId(v);
            setSecondaryDeptIds((prev) => prev.filter((id) => id !== Number(v)));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No department" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No department" }),
              departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(d.id), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full inline-block", style: { background: d.colour } }),
                d.name
              ] }) }, d.id))
            ] })
          ] })
        ] }),
        departments.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Also works in (secondary)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Select any additional departments this person works across." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: departments.filter((d) => String(d.id) !== departmentId).map((d) => {
            const selected = secondaryDeptIds.includes(d.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setSecondaryDeptIds((prev) => selected ? prev.filter((x) => x !== d.id) : [...prev, d.id]),
                className: `flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selected ? "border-transparent text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"}`,
                style: selected ? { background: d.colour } : void 0,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full shrink-0", style: { background: selected ? "rgba(255,255,255,0.7)" : d.colour } }),
                  d.name
                ]
              },
              d.id
            );
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "employment", className: "space-y-3 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Employed From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: employedFrom, onChange: (e) => setEmployedFrom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "NI Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "AB 12 34 56 C", value: niNumber, onChange: (e) => setNiNumber(e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Required for PAYE / HMRC." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payroll Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Your internal ref", value: payrollNumber, onChange: (e) => setPayrollNumber(e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your payroll software reference." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Any relevant notes about this staff member…", value: notes, onChange: (e) => setNotes(e.target.value), rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "nok", className: "space-y-3 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground pb-1", children: "The person to notify if this worker is involved in a serious accident or incident on the farm." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Sarah Smith", value: nokName, onChange: (e) => setNokName(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relationship" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Spouse, Parent, Sibling", value: nokRelationship, onChange: (e) => setNokRelationship(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 13, className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", className: "pl-8", placeholder: "07700 000000", value: nokPhone, onChange: (e) => setNokPhone(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "sarah@example.com", value: nokEmail, onChange: (e) => setNokEmail(e.target.value) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This creates a staff record only — no system login is created yet. You can invite them to log in from their record at any time." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        reset();
        onClose();
      }, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => create.mutate(), disabled: !firstName.trim() || !lastName.trim() || create.isPending, children: create.isPending ? "Saving…" : "Add Staff Member" })
    ] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-green-600" }),
      "Staff member added"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-foreground", children: [
          firstName,
          " ",
          lastName
        ] }),
        " has been added as a staff record."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-amber-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-4 h-4" }),
          "Two compliance steps before they start"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-amber-800 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5", children: "①" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Right to Work check" }),
              " — required by law before employment begins."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5", children: "②" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Certificates" }),
              " — log WASK, PA1, Animal Transport and any other relevant qualifications."
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
      reset();
      onClose();
    }, children: "Done" }) })
  ] }) }) });
}
function InviteDialog({
  farmId,
  member,
  open,
  onClose
}) {
  const [accessType, setAccessType] = reactExports.useState("full");
  const [farmRole, setFarmRole] = reactExports.useState("operator");
  const [step, setStep] = reactExports.useState("form");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  function reset() {
    setAccessType("full");
    setFarmRole("operator");
    setStep("form");
  }
  const invite = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members/${member.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ accessType, farmRole })
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
    onError: (e) => toast({ title: e.message, variant: "destructive" })
  });
  if (!member) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { style: { maxWidth: "28rem" }, children: step === "form" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Invite ",
      member.firstName,
      " ",
      member.lastName
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Invitation will be sent to:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium mt-0.5", children: member.email })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "System Access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: accessType, onValueChange: (v) => setAccessType(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "w-3.5 h-3.5" }),
              "Full access — web dashboard + mobile app"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mobile_only", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-3.5 h-3.5" }),
              "Mobile only — app access, no dashboard"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "web_only", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "w-3.5 h-3.5" }),
              "Web only — dashboard access, no mobile"
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Permission Level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: farmRole, onValueChange: (v) => setFarmRole(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "operator", children: "Operator — creates and views own records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "senior", children: "Senior / Foreman — views all farm records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Farm Manager — full operational access" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "owner", children: "Owner — unrestricted including billing" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "They will receive an email to set their password. The invitation expires in 7 days." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        reset();
        onClose();
      }, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => invite.mutate(), disabled: invite.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5 mr-1.5" }),
        invite.isPending ? "Sending…" : "Send Invitation"
      ] })
    ] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-green-600" }),
      "Invitation sent"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2 space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-foreground", children: [
        member.firstName,
        " ",
        member.lastName
      ] }),
      " will receive an email to set up their account with",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: ACCESS_LABELS[accessType] }),
      "."
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
      reset();
      onClose();
    }, children: "Done" }) })
  ] }) }) });
}
function EditMemberDialog({
  farmId,
  member,
  open,
  onClose,
  departments
}) {
  const [farmRole, setFarmRole] = reactExports.useState(member?.farmRole ?? "operator");
  const [accessType, setAccessType] = reactExports.useState(member?.accessType ?? "none");
  const [jobTitle, setJobTitle] = reactExports.useState(member?.jobTitle ?? "");
  const [departmentId, setDepartmentId] = reactExports.useState(member?.departmentId ? String(member.departmentId) : "none");
  const [secondaryDeptIds, setSecondaryDeptIds] = reactExports.useState(member?.secondaryDepartments?.map((d) => d.id) ?? []);
  const [niNumber, setNiNumber] = reactExports.useState(member?.niNumber ?? "");
  const [payrollNumber, setPayrollNumber] = reactExports.useState(member?.payrollNumber ?? "");
  const [nokName, setNokName] = reactExports.useState(member?.nokName ?? "");
  const [nokRelationship, setNokRelationship] = reactExports.useState(member?.nokRelationship ?? "");
  const [nokPhone, setNokPhone] = reactExports.useState(member?.nokPhone ?? "");
  const [nokEmail, setNokEmail] = reactExports.useState(member?.nokEmail ?? "");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: editDlgPpeTypeLookup } = useLookup("ppe_types");
  reactExports.useMemo(() => Object.fromEntries((editDlgPpeTypeLookup ?? []).map((t) => [t.value, t.label])), [editDlgPpeTypeLookup]);
  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ farmRole, accessType, jobTitle: jobTitle || null, departmentId: departmentId !== "none" ? Number(departmentId) : null, secondaryDepartmentIds: secondaryDeptIds, niNumber: niNumber || null, payrollNumber: payrollNumber || null, nokName: nokName || null, nokRelationship: nokRelationship || null, nokPhone: nokPhone || null, nokEmail: nokEmail || null })
      });
      if (!res.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-members", farmId] });
      toast({ title: "Saved" });
      onClose();
    },
    onError: () => toast({ title: "Failed to save changes", variant: "destructive" })
  });
  if (!member) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "26rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Edit — ",
      member.firstName,
      " ",
      member.lastName
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: jobTitle, onChange: (e) => setJobTitle(e.target.value), placeholder: "Stockman, Tractor Driver…" })
      ] }),
      departments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Primary Department" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: departmentId, onValueChange: (v) => {
          setDepartmentId(v);
          setSecondaryDeptIds((prev) => prev.filter((id) => id !== Number(v)));
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No department" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No department" }),
            departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(d.id), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full inline-block", style: { background: d.colour } }),
              d.name
            ] }) }, d.id))
          ] })
        ] })
      ] }),
      departments.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Also works in (secondary)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Select any additional departments this person works across." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: departments.filter((d) => String(d.id) !== departmentId).map((d) => {
          const selected = secondaryDeptIds.includes(d.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setSecondaryDeptIds((prev) => selected ? prev.filter((x) => x !== d.id) : [...prev, d.id]),
              className: `flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selected ? "border-transparent text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"}`,
              style: selected ? { background: d.colour } : void 0,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full shrink-0", style: { background: selected ? "rgba(255,255,255,0.7)" : d.colour } }),
                d.name
              ]
            },
            d.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "NI Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "AB 12 34 56 C", value: niNumber, onChange: (e) => setNiNumber(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payroll Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Your internal ref", value: payrollNumber, onChange: (e) => setPayrollNumber(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Permission Level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: farmRole, onValueChange: (v) => setFarmRole(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "operator", children: "Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "senior", children: "Senior / Foreman" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Farm Manager" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "owner", children: "Owner" })
          ] })
        ] })
      ] }),
      member.linkedUserId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "System Access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: accessType, onValueChange: (v) => setAccessType(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full", children: "Full access" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mobile_only", children: "Mobile only" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "web_only", children: "Web only" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No system access" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { size: 13, className: "text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Next of Kin / Emergency Contact" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Full Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. Sarah Smith", value: nokName, onChange: (e) => setNokName(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Relationship" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. Spouse, Parent", value: nokRelationship, onChange: (e) => setNokRelationship(e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 12, className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", className: "pl-8", placeholder: "07700 000000", value: nokPhone, onChange: (e) => setNokPhone(e.target.value) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", className: "mt-1", placeholder: "sarah@example.com", value: nokEmail, onChange: (e) => setNokEmail(e.target.value) })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save Changes" })
    ] })
  ] }) });
}
function MemberRow({
  member,
  farmId,
  certs,
  rtw,
  onInvite,
  onEdit,
  onView,
  navigate
}) {
  const fullName = `${member.firstName} ${member.lastName}`;
  const AccessIcon = ACCESS_ICONS[member.accessType];
  const { data: memberPpeTypeLookup } = useLookup("ppe_types");
  reactExports.useMemo(() => Object.fromEntries((memberPpeTypeLookup ?? []).map((t) => [t.value, t.label])), [memberPpeTypeLookup]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 last:border-0 hover:bg-black/[0.02] transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fullName }),
      member.jobTitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: member.jobTitle }),
      member.departmentName && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: "inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white",
          style: { background: member.departmentColour ?? "#374151" },
          title: "Primary department",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-2.5 h-2.5" }),
            member.departmentName
          ]
        }
      ),
      member.secondaryDepartments?.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: "inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ml-0.5",
          style: { background: d.colour + "22", color: d.colour, border: `1px solid ${d.colour}55` },
          title: "Secondary department",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-2.5 h-2.5" }),
            d.name
          ]
        },
        d.id
      ))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: member.email ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3.5 h-3.5 shrink-0" }),
      member.email
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: "No email" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${FARM_ROLE_COLORS[member.farmRole]}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3" }),
      FARM_ROLE_LABELS[member.farmRole]
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${ACCESS_COLORS[member.accessType]}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccessIcon, { className: "w-3 h-3" }),
        ACCESS_LABELS[member.accessType]
      ] }),
      member.invitationStatus === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "Invite pending…" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: member.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-green-600 text-xs font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3.5 h-3.5" }),
      "Active"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground text-xs font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "w-3.5 h-3.5" }),
      "Inactive"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CertBadge, { name: fullName, certs }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RtwBadge, { name: fullName, records: rtw }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: member.nokName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200", title: `${member.nokName}${member.nokRelationship ? ` (${member.nokRelationship})` : ""} — ${member.nokPhone || "no phone"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3" }),
      "NOK"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: "No NOK" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: onView, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
      member.accessType === "none" && member.invitationStatus !== "pending" && member.email && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-xs h-7", onClick: onInvite, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3 h-3 mr-1" }),
        "Invite"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-xs h-7", onClick: onEdit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3 mr-1" }),
        "Edit"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          className: "text-xs h-7",
          onClick: () => navigate(`/training?member=${encodeURIComponent(fullName)}&tab=certificates`),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-3 h-3 mr-1" }),
            "Certs"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          className: "text-xs h-7",
          title: "Right to Work checks — managed in the Training section",
          onClick: () => navigate(`/training?member=${encodeURIComponent(fullName)}&tab=rtw`),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "w-3 h-3 mr-1" }),
            "RTW"
          ]
        }
      )
    ] }) })
  ] });
}
function StaffPage() {
  const { farmId } = useAppStore();
  const [pageTab, setPageTab] = reactExports.useState("team");
  const [search, setSearch] = reactExports.useState("");
  const [showFormer, setShowFormer] = reactExports.useState(false);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [inviteMember, setInviteMember] = reactExports.useState(null);
  const [editMember, setEditMember] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [, navigate] = useLocation();
  const { data, isLoading, isError, refetch } = useMembers(farmId);
  const { data: certData } = useCerts(farmId);
  const { data: rtwData } = useRtw(farmId);
  const { data: ppeData } = useQuery({
    queryKey: ["ppe-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ppe-issue-records`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: deptData } = useQuery({
    queryKey: ["farm-departments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/departments`, { headers: authHeaders() }).then((r) => r.json()),
    enabled: !!farmId
  });
  const departments = deptData?.departments ?? [];
  const allPpeRecords = ppeData?.records ?? [];
  const { data: staffPagePpeTypeLookup } = useLookup("ppe_types");
  const ppeTypeMap = reactExports.useMemo(() => Object.fromEntries((staffPagePpeTypeLookup ?? []).map((t) => [t.value, t.label])), [staffPagePpeTypeLookup]);
  const allCerts = certData?.records ?? [];
  const allRtw = rtwData?.records ?? [];
  const allMembers = data?.members ?? [];
  const formerCount = allMembers.filter((m) => !m.isActive).length;
  const members = allMembers.filter((m) => {
    if (!m.isActive) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q) || (m.jobTitle ?? "").toLowerCase().includes(q);
  });
  const formerMembers = showFormer ? allMembers.filter((m) => {
    if (m.isActive) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q) || (m.jobTitle ?? "").toLowerCase().includes(q);
  }) : [];
  const withAccess = members.filter((m) => m.accessType !== "none");
  const noAccess = members.filter((m) => m.accessType === "none");
  if (!farmId) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Staff", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 0 }, children: [
      { key: "team", label: "Team", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4" }) },
      { key: "ppe", label: "PPE Register", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { className: "w-4 h-4" }) }
    ].map(({ key, label, icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPageTab(key), style: { display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", fontWeight: pageTab === key ? 700 : 500, fontSize: "0.9rem", color: pageTab === key ? "#166534" : "#6b7280", marginBottom: -2, background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: pageTab === key ? "#166534" : "transparent", cursor: "pointer" }, children: [
      icon,
      label
    ] }, key)) }),
    pageTab === "team" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search staff…",
                className: "pl-9",
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }
            )
          ] }),
          formerCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowFormer((v) => !v),
              className: `flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${showFormer ? "bg-slate-100 border-slate-300 text-slate-700" : "border-border text-muted-foreground hover:text-foreground hover:border-slate-300"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "w-3.5 h-3.5" }),
                showFormer ? "Hide" : "Show",
                " former staff (",
                formerCount,
                ")"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAddOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "Add Staff Member"
        ] })
      ] }),
      !isLoading && !isError && (data?.members?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: ["full", "mobile_only", "web_only", "none"].map((a) => {
        const count = (data?.members ?? []).filter((m) => m.isActive && m.accessType === a).length;
        const Icon = ACCESS_ICONS[a];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-4 py-3 flex items-center gap-3 ${count > 0 ? "" : "opacity-50"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: count }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: ACCESS_LABELS[a] })
          ] })
        ] }, a);
      }) }),
      withAccess.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-3 border-b border-border/50 bg-black/[0.02]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "w-4 h-4 text-emerald-600" }),
            "System Users (",
            withAccess.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Staff with mobile or web dashboard access" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StaffTable,
          {
            members: withAccess,
            farmId,
            certs: allCerts,
            rtw: allRtw,
            onInvite: setInviteMember,
            onEdit: setEditMember,
            onView: setViewRecord,
            navigate
          }
        )
      ] }) }),
      noAccess.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-3 border-b border-border/50 bg-black/[0.02]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4 text-slate-500" }),
            "Staff Records — No System Access (",
            noAccess.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "In the records for compliance purposes. Click Invite to give system access." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StaffTable,
          {
            members: noAccess,
            farmId,
            certs: allCerts,
            rtw: allRtw,
            onInvite: setInviteMember,
            onEdit: setEditMember,
            onView: setViewRecord,
            navigate
          }
        )
      ] }) }),
      showFormer && formerMembers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-3 border-b border-border/50 bg-slate-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold flex items-center gap-2 text-slate-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "w-4 h-4 text-slate-400" }),
            "Former Staff (",
            formerMembers.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Staff who have left. Shown for record-keeping and compliance purposes." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StaffTable,
          {
            members: formerMembers,
            farmId,
            certs: allCerts,
            rtw: allRtw,
            onInvite: setInviteMember,
            onEdit: setEditMember,
            onView: setViewRecord,
            navigate
          }
        )
      ] }) }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-center py-16 gap-3 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }),
        "Loading staff…"
      ] }) }),
      isError && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 gap-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Failed to load staff members." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Retry" })
      ] }) }),
      !isLoading && !isError && members.length === 0 && !search && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 gap-3 text-center px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "No staff members yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "Add staff members to track their training, certifications, and Right to Work status. You can optionally invite them to access the system later." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAddOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "Add first staff member"
        ] })
      ] }) }),
      !isLoading && !isError && members.length === 0 && search && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-center py-10 text-sm text-muted-foreground", children: [
        'No staff matching "',
        search,
        '"'
      ] }) })
    ] }),
    pageTab === "ppe" && /* @__PURE__ */ jsxRuntimeExports.jsx(PpeRegisterSection, { farmId, members: allMembers }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AddMemberDialog, { farmId, open: addOpen, onClose: () => setAddOpen(false), departments }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InviteDialog,
      {
        farmId,
        member: inviteMember,
        open: !!inviteMember,
        onClose: () => setInviteMember(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditMemberDialog,
      {
        farmId,
        member: editMember,
        open: !!editMember,
        onClose: () => setEditMember(null),
        departments
      }
    ),
    viewRecord && (() => {
      const fullName = `${viewRecord.firstName} ${viewRecord.lastName}`;
      const staffPpe = allPpeRecords.filter((r) => r.staffName.toLowerCase() === fullName.toLowerCase());
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem", maxHeight: "90vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Staff Member — ",
          fullName
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              viewRecord.firstName,
              " ",
              viewRecord.lastName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.email || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.phone || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Job Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.jobTitle || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Farm Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: FARM_ROLE_LABELS[viewRecord.farmRole] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Access Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: ACCESS_LABELS[viewRecord.accessType] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.isActive ? "Active" : "Inactive" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Employed From" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.employedFrom ? new Date(viewRecord.employedFrom).toLocaleDateString("en-GB") : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "NI Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.niNumber || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Payroll Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.payrollNumber || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-2", children: "Emergency Contact (Next of Kin)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.nokName || "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Relationship" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.nokRelationship || "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Phone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.nokPhone || "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.nokEmail || "—" })
              ] })
            ] })
          ] }),
          viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: viewRecord.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { className: "w-4 h-4 text-amber-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "PPE Issued" }),
              staffPpe.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full", children: [
                staffPpe.length,
                " item",
                staffPpe.length !== 1 ? "s" : ""
              ] })
            ] }),
            staffPpe.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "No PPE issued to this staff member yet. Use the PPE Register tab to issue and track PPE." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", style: { borderCollapse: "collapse" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["PPE Type", "Description", "Size", "Date Issued", "Condition", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#6b7280" }, children: h }, h)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: staffPpe.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : void 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600 }, children: ppeTypeMap[r.ppeType] ?? r.ppeType }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151" }, children: r.description ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280" }, children: r.size ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: fmt(r.dateIssued) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.conditionAtCheck ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", fontSize: "0.7rem", fontWeight: 600, padding: "1px 6px", borderRadius: 999, background: r.isActive ? "#dcfce7" : "#f3f4f6", color: r.isActive ? "#166534" : "#6b7280" }, children: r.isActive ? "Active" : "Replaced" }) })
              ] }, r.id)) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-2 text-xs text-green-700 font-medium hover:underline", onClick: () => {
              setViewRecord(null);
              setPageTab("ppe");
            }, children: "View full PPE Register →" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setEditMember(viewRecord);
            setViewRecord(null);
          }, children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
        ] })
      ] }) });
    })()
  ] });
}
function StaffTable({ members, farmId, certs, rtw, onInvite, onEdit, onView, navigate }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[900px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 bg-black/[0.02]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-3 font-semibold text-foreground/60", children: "Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-6 py-3 font-semibold text-foreground/60", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-5 py-3 font-semibold text-foreground/60", children: "Role" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-5 py-3 font-semibold text-foreground/60", children: "Access" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-5 py-3 font-semibold text-foreground/60", children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-5 py-3 font-semibold text-foreground/60", children: "Certificates" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left px-5 py-3 font-semibold text-foreground/60", children: [
        "Right to Work",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] font-normal text-muted-foreground/70 mt-0.5 normal-case tracking-normal", children: "managed in Training" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-5 py-3 font-semibold text-foreground/60", children: "NOK" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-48" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MemberRow,
      {
        member: m,
        farmId,
        certs,
        rtw,
        onInvite: () => onInvite(m),
        onEdit: () => onEdit(m),
        onView: () => onView(m),
        navigate
      },
      m.id
    )) })
  ] }) });
}
export {
  StaffPage as default
};
