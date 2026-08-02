import { b as useAppStore, a as useToast, t as useQueryClient, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, S as Plus, I as Input, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, J as DialogFooter } from "./index-DOMaBeoe.js";
import { A as AppLayout, I as Info, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, D as AlertDialogAction } from "./AppLayout-fTQcRWCh.js";
import { T as Textarea } from "./textarea-h9rv4GTQ.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BK3KnDPd.js";
import { T as TabBar, a as TabButton } from "./tab-button-BA1S7sM-.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { F as FileText, P as PoundSterling } from "./shield-alert-DRpIRlnz.js";
import { P as Printer } from "./printer-DgnrJEQB.js";
import { E as ExternalLink } from "./external-link-llhWBxST.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-B_jx-nU4.js";
import { C as CircleCheck } from "./circle-check-D8gHe1Fx.js";
import { a as Clock } from "./database-yTqDyHrU.js";
import { P as Pencil } from "./pencil-B5T4zexH.js";
import { T as Trash2 } from "./trash-2-BMddTZBd.js";
import "./use-safe-clerk-krAet4Cw.js";
import "./shield-check-DnhvESYd.js";
import "./tractor-C3mXr3mS.js";
import "./index-CiK9wUHM.js";
import "./index-DED_ZDoB.js";
import "./chevron-up-BqpKgA0S.js";
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtMoney = (v) => {
  if (v == null || v === "") return "—";
  return `£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const SFI_SCHEME_TYPES = ["SFI 2023", "SFI 2024", "Countryside Stewardship (CS)", "Higher Tier CS", "Farming in Protected Landscapes (FiPL)", "ELM Pilot", "Other"];
const AGREEMENT_STATUSES = ["active", "expired", "withdrawn", "pending"];
const COMPLIANCE_STATUSES = ["compliant", "at_risk", "non_compliant", "not_started"];
const COMPLIANCE_CONFIG = {
  compliant: { label: "Compliant", bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  at_risk: { label: "At Risk", bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  non_compliant: { label: "Non-Compliant", bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  not_started: { label: "Not Started", bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" }
};
const AGREEMENT_STATUS_CONFIG = {
  active: { label: "Active", bg: "#dcfce7", color: "#166534" },
  expired: { label: "Expired", bg: "#fee2e2", color: "#991b1b" },
  withdrawn: { label: "Withdrawn", bg: "#f3f4f6", color: "#6b7280" },
  pending: { label: "Pending", bg: "#fef9c3", color: "#854d0e" }
};
const SFI_ACTION_CODES = [
  { code: "SAM1", description: "Assess soil, produce a soil health plan and test soil organic matter", category: "Soils" },
  { code: "SAM2", description: "Soil organic matter testing every 5 years", category: "Soils" },
  { code: "SAM3", description: "Establish and maintain a herbal ley for a minimum of 3 years", category: "Soils" },
  { code: "NUM1", description: "Assess nutrient management and measure soil organic matter", category: "Nutrient Management" },
  { code: "NUM2", description: "Identify actions to reduce nutrient loss", category: "Nutrient Management" },
  { code: "NUM3", description: "Legumes on improved grassland", category: "Nutrient Management" },
  { code: "IPM1", description: "Assess and record pest, weed and disease pressure", category: "Integrated Pest Management" },
  { code: "IPM2", description: "Make and use a Pest Management Plan", category: "Integrated Pest Management" },
  { code: "IPM3", description: "Use companion or understorey cropping", category: "Integrated Pest Management" },
  { code: "IPM4", description: "Provide flower-rich habitat to support natural pest predators", category: "Integrated Pest Management" },
  { code: "AHL1", description: "Assess and manage biosecurity on livestock farms", category: "Animal Health & Welfare" },
  { code: "AHL2", description: "Measure the health and productivity of ewes", category: "Animal Health & Welfare" },
  { code: "AHL3", description: "Manage grassland with very low nutrient inputs", category: "Animal Health & Welfare" },
  { code: "HRW1", description: "Assess and reduce water use on farm", category: "Water" },
  { code: "WBD2", description: "Manage trees on farm", category: "Woodland & Trees" },
  { code: "WBD3", description: "Manage wood pasture and parkland", category: "Woodland & Trees" },
  { code: "WBD5", description: "Create new broadleaved woodland", category: "Woodland & Trees" },
  { code: "WBD6", description: "Manage existing hedgerows", category: "Woodland & Trees" },
  { code: "WBD7", description: "Restore or create hedgerows by planting", category: "Woodland & Trees" },
  { code: "WBD8", description: "Maintain or establish hedgerow trees", category: "Woodland & Trees" },
  { code: "WBD9", description: "Manage and provide water for farmland birds", category: "Wildlife" },
  { code: "OFC1", description: "Provide supplementary winter food plots for farmland birds", category: "Wildlife" },
  { code: "OFC2", description: "Manage warm and sheltered spots for farmland birds", category: "Wildlife" },
  { code: "OFC3", description: "Manage rush pastures and wet grassland", category: "Wildlife" },
  { code: "OFC4", description: "Manage species-rich grassland", category: "Wildlife" },
  { code: "HEF1", description: "Manage hedgerows", category: "Hedgerows" },
  { code: "HEF2", description: "Maintain hedgerows", category: "Hedgerows" },
  { code: "HEF3", description: "Rejuvenate hedgerows by coppicing", category: "Hedgerows" },
  { code: "AB1", description: "Manage over-wintered stubbles", category: "Arable" },
  { code: "AB2", description: "Establish an arable field margin or path", category: "Arable" },
  { code: "AB3", description: "Create a scalloped margin", category: "Arable" },
  { code: "AB6", description: "Enhanced over-winter bird food on arable and horticultural land", category: "Arable" },
  { code: "AB8", description: "Flower-rich grass margins, banks, strips and tracks", category: "Arable" },
  { code: "AB9", description: "Pollen and nectar plots", category: "Arable" },
  { code: "AB10", description: "Cultivated areas for arable plants", category: "Arable" },
  { code: "AB11", description: "Beetle banks", category: "Arable" },
  { code: "AB12", description: "Multi-species cover crops", category: "Arable" },
  { code: "AB13", description: "Companion cropping with legumes", category: "Arable" },
  { code: "PRF1", description: "Assess and improve grassland productivity and diversity", category: "Grassland" },
  { code: "PRF2", description: "Create a legume fallow", category: "Grassland" },
  { code: "LIG1", description: "Manage in-field trees that are in hedgerows on arable land", category: "Trees" },
  { code: "WFM1", description: "Assess and manage your farm water", category: "Water" },
  { code: "WFM2", description: "Manage riparian land to reduce run-off", category: "Water" },
  { code: "WFM4", description: "Manage farm ponds", category: "Water" },
  { code: "ORG1", description: "Convert land to organic or in-conversion management", category: "Organic" },
  { code: "ORG2", description: "Maintain land under organic management", category: "Organic" },
  { code: "ORG3", description: "Continue organic management", category: "Organic" },
  { code: "MOR1", description: "Undertake a moorland assessment", category: "Upland" },
  { code: "MOR2", description: "Manage moorland", category: "Upland" },
  { code: "MOR3", description: "Manage rough grazing for birds", category: "Upland" },
  { code: "BWM1", description: "Create and maintain a watercourse buffer strip", category: "Water" },
  { code: "BWM3", description: "Manage rush pastures", category: "Grassland" },
  { code: "BWM12", description: "Enhanced management of hedgerows", category: "Hedgerows" }
];
const emptyAgreement = { agreementNumber: "", schemeName: "", agreementStartDate: "", agreementEndDate: "", totalAnnualPayment: "", managingBody: "RPA", agentOrAdvisorName: "", status: "active", notes: "" };
const emptyAction = { actionCode: "", actionTitle: "", landParcelReference: "", eligibleAreaHa: "", annualPaymentPerHa: "", annualPaymentAmount: "", evidenceRequired: "", lastEvidenceDate: "", nextEvidenceDate: "", complianceStatus: "not_started", notes: "", agreementId: "" };
function SFIPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = reactExports.useState("overview");
  const [addAgreementOpen, setAddAgreementOpen] = reactExports.useState(false);
  const [editAgreement, setEditAgreement] = reactExports.useState(null);
  const [deleteAgreementId, setDeleteAgreementId] = reactExports.useState(null);
  const [agreementForm, setAgreementForm] = reactExports.useState(emptyAgreement);
  const [addActionOpen, setAddActionOpen] = reactExports.useState(false);
  const [editAction, setEditAction] = reactExports.useState(null);
  const [deleteActionId, setDeleteActionId] = reactExports.useState(null);
  const [actionForm, setActionForm] = reactExports.useState(emptyAction);
  const [actionSearch, setActionSearch] = reactExports.useState("");
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("prefill");
    if (!raw) return;
    try {
      const data = JSON.parse(atob(raw));
      setAgreementForm((f) => ({ ...f, ...data }));
      setAddAgreementOpen(true);
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    } catch {
    }
  }, []);
  const agreementsQ = useQuery({
    queryKey: ["sfi-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sfi-agreements`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const actionsQ = useQuery({
    queryKey: ["sfi-actions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sfi-actions`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const agreements = agreementsQ.data ?? [];
  const actions = actionsQ.data ?? [];
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sfi-agreements", farmId] });
    qc.invalidateQueries({ queryKey: ["sfi-actions", farmId] });
  };
  const createAgreement = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/sfi-agreements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Agreement saved" });
      invalidate();
      setAddAgreementOpen(false);
      setAgreementForm(emptyAgreement);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateAgreement = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/sfi-agreements/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Agreement updated" });
      invalidate();
      setEditAgreement(null);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteAgreement = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/sfi-agreements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteAgreementId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const createAction = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/sfi-actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Action saved" });
      invalidate();
      setAddActionOpen(false);
      setActionForm(emptyAction);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateAction = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/sfi-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Action updated" });
      invalidate();
      setEditAction(null);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteAction = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/sfi-actions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteActionId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const totalAnnualPayment = actions.reduce((sum, a) => sum + (parseFloat(a.annualPaymentAmount ?? "0") || 0), 0);
  const compliantCount = actions.filter((a) => a.complianceStatus === "compliant").length;
  const atRiskCount = actions.filter((a) => a.complianceStatus === "at_risk").length;
  const nonCompliantCount = actions.filter((a) => a.complianceStatus === "non_compliant").length;
  const today = /* @__PURE__ */ new Date();
  const upcomingEvidenceCount = actions.filter((a) => {
    if (!a.nextEvidenceDate) return false;
    const d = new Date(a.nextEvidenceDate);
    const diff = (d.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24);
    return diff >= 0 && diff <= 60;
  }).length;
  const filteredActions = actionSearch ? actions.filter((a) => a.actionCode?.toLowerCase().includes(actionSearch.toLowerCase()) || a.actionTitle?.toLowerCase().includes(actionSearch.toLowerCase()) || a.landParcelReference?.toLowerCase().includes(actionSearch.toLowerCase())) : actions;
  function handleActionCodePick(code) {
    const ref = SFI_ACTION_CODES.find((c) => c.code === code);
    if (ref) {
      setActionForm((f) => ({ ...f, actionCode: code, actionTitle: ref.description }));
    } else {
      setActionForm((f) => ({ ...f, actionCode: code }));
    }
  }
  function handlePrintActions() {
    const rows = actions.map((a) => {
      const cfg = COMPLIANCE_CONFIG[a.complianceStatus] ?? COMPLIANCE_CONFIG.not_started;
      const linkedAg = agreements.find((ag) => ag.id === a.agreementId);
      const daysLeft = a.nextEvidenceDate ? Math.ceil((new Date(a.nextEvidenceDate).getTime() - today.getTime()) / (1e3 * 60 * 60 * 24)) : null;
      const isOverdue = daysLeft !== null && daysLeft < 0;
      const nextEvCell = a.nextEvidenceDate ? `${fmt(a.nextEvidenceDate)}${isOverdue ? ' <span style="background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 4px;font-size:6px">Overdue</span>' : daysLeft !== null && daysLeft <= 60 ? ` <span style="background:#fef9c3;color:#854d0e;border-radius:4px;padding:1px 4px;font-size:6px">${daysLeft}d</span>` : ""}` : "—";
      return `<tr>
        <td style="font-family:monospace;font-size:7px;color:#1a3a1a">${linkedAg ? `${linkedAg.agreementNumber}<br><span style="color:#6b7280;font-size:6px">${linkedAg.schemeName}</span>` : "—"}</td>
        <td style="font-family:monospace;font-weight:700;color:#1d4ed8">${a.actionCode}</td>
        <td>${a.actionTitle}</td>
        <td style="font-family:monospace;font-size:7px">${a.landParcelReference || "—"}</td>
        <td>${a.eligibleAreaHa ? Number(a.eligibleAreaHa).toFixed(2) : "—"}</td>
        <td>${fmtMoney(a.annualPaymentAmount)}</td>
        <td>${fmt(a.lastEvidenceDate)}</td>
        <td>${nextEvCell}</td>
        <td><span style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};padding:1px 5px;border-radius:4px;font-size:6.5px">${cfg.label}</span></td>
      </tr>`;
    }).join("");
    printProReport({
      title: "SFI / ELM Actions Register",
      subtitle: `${actions.length} enrolled action${actions.length !== 1 ? "s" : ""} — Total estimated annual payment: ${fmtMoney(totalAnnualPayment)}`,
      tableHtml: `<table><thead><tr><th>Agreement</th><th>Code</th><th>Action Title</th><th>Land Parcel Ref</th><th>Area (ha)</th><th>Annual Payment</th><th>Last Evidence</th><th>Next Evidence</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`,
      footerNote: "SFI / ELM records are for farm record-keeping. Submit applications and evidence through the RPA Rural Payments service. Retain for a minimum of 5 years."
    });
  }
  function handlePrintAgreements() {
    const scConfig = AGREEMENT_STATUS_CONFIG;
    const rows = agreements.map((ag) => {
      const sc = scConfig[ag.status] ?? scConfig.active;
      const agActions = actions.filter((a) => a.agreementId === ag.id);
      const agPayment = agActions.reduce((s, a) => s + (parseFloat(a.annualPaymentAmount ?? "0") || 0), 0);
      return `<tr>
        <td style="font-family:monospace;font-weight:700;color:#1d4ed8">${ag.agreementNumber}</td>
        <td style="font-weight:600">${ag.schemeName}</td>
        <td>${fmt(ag.agreementStartDate)}</td>
        <td>${fmt(ag.agreementEndDate)}</td>
        <td style="font-weight:600;color:#166534">${ag.totalAnnualPayment ? fmtMoney(ag.totalAnnualPayment) : "—"}</td>
        <td>${ag.managingBody || "—"}</td>
        <td>${ag.agentOrAdvisorName || "—"}</td>
        <td>${agActions.length}</td>
        <td style="color:#166534">${agPayment > 0 ? fmtMoney(agPayment) : "—"}</td>
        <td><span style="background:${sc.bg};color:${sc.color};padding:1px 5px;border-radius:4px;font-size:6.5px;font-weight:600">${sc.label}</span></td>
      </tr>`;
    }).join("");
    printProReport({
      title: "SFI / ELM Agreements Register",
      subtitle: `${agreements.length} agreement${agreements.length !== 1 ? "s" : ""} — Total estimated annual payment: ${fmtMoney(totalAnnualPayment)}`,
      recordCount: agreements.length,
      recordLabel: "agreement",
      tableHtml: `<table><thead><tr><th>Agreement No.</th><th>Scheme Name</th><th>Start Date</th><th>End Date</th><th>Annual Payment</th><th>Managing Body</th><th>Agent / Advisor</th><th>Actions</th><th>Actions Payment</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`,
      footerNote: "SFI / ELM records are for farm record-keeping. Submit applications and evidence through the RPA Rural Payments service. Retain for a minimum of 5 years."
    });
  }
  function handlePrintComplianceReport() {
    const today2 = /* @__PURE__ */ new Date();
    const statRows = [
      ["Active Agreements", String(agreements.filter((a) => a.status === "active").length)],
      ["Total Enrolled Actions", String(actions.length)],
      ["Compliant", String(compliantCount)],
      ["At Risk", String(atRiskCount)],
      ["Non-Compliant", String(nonCompliantCount)],
      ["Not Started", String(actions.filter((a) => a.complianceStatus === "not_started").length)],
      ["Evidence Due ≤ 60 days", String(upcomingEvidenceCount)],
      ["Est. Total Annual Payment", fmtMoney(totalAnnualPayment)]
    ];
    const summaryTable = `
      <div class="section-head">Compliance Summary</div>
      <table style="width:auto;margin-bottom:12px">
        <tbody>${statRows.map(([k, v]) => `<tr><td style="font-weight:600;padding-right:20px">${k}</td><td>${v}</td></tr>`).join("")}</tbody>
      </table>`;
    const agreementSections = agreements.map((ag) => {
      const sc = AGREEMENT_STATUS_CONFIG[ag.status] ?? AGREEMENT_STATUS_CONFIG.active;
      const agActions = actions.filter((a) => a.agreementId === ag.id);
      const agPayment = agActions.reduce((s, a) => s + (parseFloat(a.annualPaymentAmount ?? "0") || 0), 0);
      const agHead = `<div class="section-head" style="margin-top:16px">
        <span style="font-family:monospace;color:#1d4ed8">${ag.agreementNumber}</span>
        &nbsp;·&nbsp;${ag.schemeName}
        &nbsp;·&nbsp;<span style="background:${sc.bg};color:${sc.color};padding:1px 6px;border-radius:4px;font-size:7px;font-weight:600">${sc.label}</span>
        &nbsp;·&nbsp;${fmt(ag.agreementStartDate)} → ${fmt(ag.agreementEndDate)}
        &nbsp;·&nbsp;Annual value: <strong>${ag.totalAnnualPayment ? fmtMoney(ag.totalAnnualPayment) : "not recorded"}</strong>
        ${ag.managingBody ? `&nbsp;·&nbsp;${ag.managingBody}` : ""}
        ${ag.agentOrAdvisorName ? `&nbsp;·&nbsp;Agent: ${ag.agentOrAdvisorName}` : ""}
      </div>`;
      if (agActions.length === 0) {
        return `${agHead}<p style="font-size:7.5px;color:#6b7280;margin:4px 0 10px">No actions recorded against this agreement.</p>`;
      }
      const actionRows = agActions.map((a) => {
        const cfg = COMPLIANCE_CONFIG[a.complianceStatus] ?? COMPLIANCE_CONFIG.not_started;
        const daysLeft = a.nextEvidenceDate ? Math.ceil((new Date(a.nextEvidenceDate).getTime() - today2.getTime()) / (1e3 * 60 * 60 * 24)) : null;
        const isOverdue = daysLeft !== null && daysLeft < 0;
        const nextEvCell = a.nextEvidenceDate ? `${fmt(a.nextEvidenceDate)}${isOverdue ? ' <span style="background:#fee2e2;color:#991b1b;border-radius:3px;padding:1px 3px;font-size:5.5px">Overdue</span>' : daysLeft !== null && daysLeft <= 60 ? ` <span style="background:#fef9c3;color:#854d0e;border-radius:3px;padding:1px 3px;font-size:5.5px">${daysLeft}d</span>` : ""}` : "—";
        return `<tr>
          <td style="font-family:monospace;font-weight:700;color:#1d4ed8">${a.actionCode}</td>
          <td>${a.actionTitle}</td>
          <td style="font-family:monospace;font-size:7px">${a.landParcelReference || "—"}</td>
          <td>${a.eligibleAreaHa ? Number(a.eligibleAreaHa).toFixed(2) : "—"}</td>
          <td>${fmtMoney(a.annualPaymentAmount)}</td>
          <td>${a.evidenceRequired || "—"}</td>
          <td>${fmt(a.lastEvidenceDate)}</td>
          <td>${nextEvCell}</td>
          <td><span style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};padding:1px 4px;border-radius:4px;font-size:6px">${cfg.label}</span></td>
        </tr>`;
      }).join("");
      const actionsTable = `
        <table>
          <thead><tr><th>Code</th><th>Action Title</th><th>Land Parcel</th><th>Area (ha)</th><th>Annual Payment</th><th>Evidence Required</th><th>Last Evidence</th><th>Next Evidence</th><th>Status</th></tr></thead>
          <tbody>${actionRows}</tbody>
          <tfoot><tr><td colspan="4" style="font-weight:700;text-align:right;font-size:7px;color:#166534">Actions subtotal:</td><td style="font-weight:700;color:#166534">${fmtMoney(agPayment)}</td><td colspan="4"></td></tr></tfoot>
        </table>`;
      return `${agHead}${actionsTable}`;
    }).join("");
    printProReport({
      title: "SFI / ELM Compliance Report",
      subtitle: `${agreements.length} agreement${agreements.length !== 1 ? "s" : ""} · ${actions.length} enrolled action${actions.length !== 1 ? "s" : ""} · Est. total annual payment: ${fmtMoney(totalAnnualPayment)}`,
      tableHtml: `${summaryTable}${agreementSections}`,
      footerNote: "SFI / ELM records are for farm record-keeping purposes. Submit applications and evidence through the RPA Rural Payments service. Retain for a minimum of 5 years and make available at RPA inspection.",
      landscape: true
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }, children: "SFI & ELM" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", marginTop: 4, fontSize: "0.875rem" }, children: "Sustainable Farming Incentive & Environmental Land Management agreements and action tracking" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
        tab === "overview" && (agreements.length > 0 || actions.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrintComplianceReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14, className: "mr-1.5" }),
          "Print Compliance Report"
        ] }),
        tab === "agreements" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          agreements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrintAgreements, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1.5" }),
            "Print Register"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setAgreementForm(emptyAgreement);
            setAddAgreementOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1.5" }),
            "Add Agreement"
          ] })
        ] }),
        tab === "actions" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          actions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrintActions, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1.5" }),
            "Print Register"
          ] }),
          agreements.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: true, title: "An agreement must be in place before actions can be added", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1.5" }),
            "Add Action"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setActionForm({ ...emptyAction, agreementId: agreements.length === 1 ? String(agreements[0].id) : "" });
            setAddActionOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1.5" }),
            "Add Action"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, style: { color: "#2563eb", marginTop: 2, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8125rem", color: "#1e40af", lineHeight: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Important:" }),
        " SFI agreement data entered here is for your own record-keeping. Submit actual applications and claim evidence through the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.gov.uk/government/collections/sustainable-farming-incentive-guidance", target: "_blank", rel: "noopener noreferrer", style: { color: "#1d4ed8", textDecoration: "underline" }, children: "RPA Rural Payments service" }),
        ". Funded under the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.gov.uk/guidance/funding-for-farmers", target: "_blank", rel: "noopener noreferrer", style: { color: "#1d4ed8", textDecoration: "underline" }, children: "Environmental Land Management (ELM) scheme" }),
        ". ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11, style: { display: "inline", verticalAlign: "middle" } })
      ] })
    ] }),
    (agreements.length > 0 || actions.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: "1.25rem" }, children: [
      { label: "Est. Annual Payment", value: fmtMoney(totalAnnualPayment), icon: PoundSterling, color: "#166534", bg: "#f0fdf4" },
      { label: "Enrolled Actions", value: String(actions.length), icon: Leaf, color: "#1d4ed8", bg: "#eff6ff" },
      { label: "Compliant", value: String(compliantCount), icon: CircleCheck, color: "#166534", bg: "#f0fdf4" },
      { label: "At Risk / Non-Compliant", value: String(atRiskCount + nonCompliantCount), icon: TriangleAlert, color: atRiskCount + nonCompliantCount > 0 ? "#b45309" : "#6b7280", bg: atRiskCount + nonCompliantCount > 0 ? "#fef9c3" : "#f9fafb" },
      { label: "Evidence Due (60 days)", value: String(upcomingEvidenceCount), icon: Clock, color: upcomingEvidenceCount > 0 ? "#b45309" : "#6b7280", bg: upcomingEvidenceCount > 0 ? "#fef9c3" : "#f9fafb" }
    ].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: card.bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem", display: "flex", alignItems: "center", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 36, height: 36, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(card.icon, { size: 18, style: { color: card.color } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.125rem", fontWeight: 700, color: card.color }, children: card.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.3 }, children: card.label })
      ] })
    ] }, card.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "overview", onClick: () => setTab("overview"), children: "Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "agreements", onClick: () => setTab("agreements"), children: [
        "Agreements (",
        agreements.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "actions", onClick: () => setTab("actions"), children: [
        "Actions / Options (",
        actions.length,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "1rem" }, children: [
      tab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: agreements.length === 0 && actions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "4rem 2rem", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 40, style: { margin: "0 auto 16px", opacity: 0.4 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", fontSize: "1rem" }, children: "No SFI / ELM records yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#6b7280", marginTop: 6, maxWidth: 480, margin: "8px auto 0" }, children: [
          "Start by adding your SFI or CS agreement. The recommended route is via ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Grants & Funding" }),
          " — once an application reaches ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Approved" }),
          " status, click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Start SFI / ELM Record →" }),
          " to create the agreement here automatically. You can also add it directly below."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setTab("agreements");
          setAddAgreementOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1.5" }),
          "Add Agreement"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 10 }, children: "Actions can be added once an agreement is in place" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 10 }, children: "Active Agreements" }),
          agreements.filter((a) => a.status === "active").length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#9ca3af" }, children: "No active agreements" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: agreements.filter((a) => a.status === "active").map((ag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.875rem 1rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#111827" }, children: ag.schemeName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 8, fontFamily: "monospace", fontSize: "0.75rem", color: "#6b7280", background: "#f3f4f6", borderRadius: 4, padding: "1px 6px" }, children: ag.agreementNumber })
              ] }),
              ag.totalAnnualPayment && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, color: "#166534", fontSize: "0.875rem" }, children: [
                fmtMoney(ag.totalAnnualPayment),
                "/yr"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, marginTop: 6, fontSize: "0.75rem", color: "#6b7280" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                fmt(ag.agreementStartDate),
                " → ",
                fmt(ag.agreementEndDate)
              ] }),
              ag.managingBody && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ag.managingBody })
            ] })
          ] }, ag.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 10 }, children: "Evidence Due (next 60 days)" }),
          actions.filter((a) => {
            if (!a.nextEvidenceDate) return false;
            const d = new Date(a.nextEvidenceDate);
            const diff = (d.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24);
            return diff >= 0 && diff <= 60;
          }).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8125rem", color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, style: { color: "#166534" } }),
            " No evidence due in the next 60 days"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: actions.filter((a) => {
            if (!a.nextEvidenceDate) return false;
            const d = new Date(a.nextEvidenceDate);
            const diff = (d.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24);
            return diff >= 0 && diff <= 60;
          }).sort((a, b) => new Date(a.nextEvidenceDate).getTime() - new Date(b.nextEvidenceDate).getTime()).map((a) => {
            const daysLeft = Math.ceil((new Date(a.nextEvidenceDate).getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: daysLeft <= 14 ? "#fef9c3" : "#fff", border: `1px solid ${daysLeft <= 14 ? "#fde68a" : "#e5e7eb"}`, borderRadius: 10, padding: "0.75rem 1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 700, fontSize: "0.8125rem", color: "#1d4ed8", marginRight: 6 }, children: a.actionCode }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", color: "#374151" }, children: a.actionTitle })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600, fontSize: "0.75rem", color: daysLeft <= 14 ? "#b45309" : "#6b7280", whiteSpace: "nowrap", marginLeft: 8 }, children: [
                  daysLeft,
                  "d left"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: [
                "Due: ",
                fmt(a.nextEvidenceDate)
              ] })
            ] }, a.id);
          }) }),
          nonCompliantCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 16 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#991b1b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14 }),
              "Non-Compliant Actions"
            ] }),
            actions.filter((a) => a.complianceStatus === "non_compliant").map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 700, fontSize: "0.8125rem", color: "#991b1b", marginRight: 6 }, children: a.actionCode }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", color: "#374151" }, children: a.actionTitle })
            ] }, a.id))
          ] })
        ] })
      ] }) }),
      tab === "agreements" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: agreementsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", textAlign: "center", padding: "3rem" }, children: "Loading..." }) : agreements.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 32, style: { margin: "0 auto 12px", opacity: 0.4 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No agreements recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#6b7280", maxWidth: 420, margin: "6px auto 0" }, children: [
          "The recommended route is from ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Grants & Funding" }),
          " — when an application is approved, use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Start SFI / ELM Record →" }),
          " to pre-fill the details here. You can also add an existing agreement directly."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", style: { marginTop: 16 }, onClick: () => {
          setAgreementForm(emptyAgreement);
          setAddAgreementOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1.5" }),
          "Add Agreement"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Agreement No.", "Scheme", "Start", "End", "Annual Payment", "Managing Body", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: agreements.map((ag, i) => {
          const sc = AGREEMENT_STATUS_CONFIG[ag.status] ?? AGREEMENT_STATUS_CONFIG.active;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < agreements.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontWeight: 600, color: "#1d4ed8" }, children: ag.agreementNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500, color: "#111827" }, children: ag.schemeName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(ag.agreementStartDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(ag.agreementEndDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600, color: "#166534", whiteSpace: "nowrap" }, children: ag.totalAnnualPayment ? fmtMoney(ag.totalAnnualPayment) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: ag.managingBody || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: sc.bg, color: sc.color, padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 500 }, children: sc.label }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                setEditAgreement(ag);
                setAgreementForm({ ...ag });
              }, style: { background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginRight: 4, padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteAgreementId(ag.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] })
          ] }, ag.id);
        }) })
      ] }) }) }),
      tab === "actions" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: agreements.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 2rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 32, style: { margin: "0 auto 12px", color: "#f59e0b" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No agreements in place yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#6b7280", maxWidth: 440, margin: "6px auto 0" }, children: [
          "Actions must be linked to an SFI or CS agreement. Add your agreement first — either from ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Grants & Funding" }),
          " (Approved → ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Start SFI / ELM Record →" }),
          ") or directly on the Agreements tab."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", style: { marginTop: 16 }, onClick: () => {
          setTab("agreements");
          setAgreementForm(emptyAgreement);
          setAddAgreementOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1.5" }),
          "Add Agreement First"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by action code, title or land parcel...", value: actionSearch, onChange: (e) => setActionSearch(e.target.value), style: { maxWidth: 360 } }) }),
        actionsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", textAlign: "center", padding: "3rem" }, children: "Loading..." }) : filteredActions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 32, style: { margin: "0 auto 12px", opacity: 0.4 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No actions recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Add the SFI / CS action codes from your agreement to track evidence and compliance." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", style: { marginTop: 16 }, onClick: () => {
            setActionForm({ ...emptyAction, agreementId: agreements.length === 1 ? String(agreements[0].id) : "" });
            setAddActionOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1.5" }),
            "Add Action"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Agreement", "Code", "Action Title", "Land Parcel", "Area (ha)", "Payment/ha", "Annual Payment", "Last Evidence", "Next Evidence", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredActions.map((a, i) => {
            const cfg = COMPLIANCE_CONFIG[a.complianceStatus] ?? COMPLIANCE_CONFIG.not_started;
            const evidenceDue = a.nextEvidenceDate ? new Date(a.nextEvidenceDate) : null;
            const daysLeft = evidenceDue ? Math.ceil((evidenceDue.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24)) : null;
            const isOverdue = daysLeft !== null && daysLeft < 0;
            const linkedAgreement = agreements.find((ag) => ag.id === a.agreementId);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filteredActions.length - 1 ? "1px solid #f3f4f6" : "none", background: isOverdue ? "#fff7ed" : void 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }, children: linkedAgreement ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontFamily: "monospace", fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 600 }, children: linkedAgreement.agreementNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#6b7280" }, children: linkedAgreement.schemeName })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontWeight: 700, color: "#1d4ed8", whiteSpace: "nowrap" }, children: a.actionCode }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#111827", maxWidth: 200 }, children: a.actionTitle }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8125rem" }, children: a.landParcelReference || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151" }, children: a.eligibleAreaHa ? `${Number(a.eligibleAreaHa).toFixed(2)}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151" }, children: a.annualPaymentPerHa ? fmtMoney(a.annualPaymentPerHa) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600, color: "#166534", whiteSpace: "nowrap" }, children: a.annualPaymentAmount ? fmtMoney(a.annualPaymentAmount) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(a.lastEvidenceDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: isOverdue ? "#991b1b" : daysLeft !== null && daysLeft <= 30 ? "#b45309" : "#6b7280", fontWeight: isOverdue ? 600 : 400 }, children: [
                fmt(a.nextEvidenceDate),
                daysLeft !== null && !isOverdue && daysLeft <= 60 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 4, fontSize: "0.7rem", background: "#fef9c3", color: "#854d0e", borderRadius: 8, padding: "1px 5px" }, children: [
                  daysLeft,
                  "d"
                ] }),
                isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 4, fontSize: "0.7rem", background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "1px 5px" }, children: "Overdue" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 500, whiteSpace: "nowrap" }, children: cfg.label }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                  setEditAction(a);
                  setActionForm({ ...a, agreementId: a.agreementId ? String(a.agreementId) : "" });
                }, style: { background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginRight: 4, padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteActionId(a.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
              ] })
            ] }, a.id);
          }) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addAgreementOpen || !!editAgreement, onOpenChange: (o) => {
      if (!o) {
        setAddAgreementOpen(false);
        setEditAgreement(null);
        setAgreementForm(emptyAgreement);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editAgreement ? "Edit Agreement" : "Add SFI / CS Agreement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Agreement Number ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. SFI-2024-123456", value: agreementForm.agreementNumber, onChange: (e) => setAgreementForm((f) => ({ ...f, agreementNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Scheme Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: agreementForm.schemeName, onValueChange: (v) => setAgreementForm((f) => ({ ...f, schemeName: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SFI_SCHEME_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Start Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: agreementForm.agreementStartDate, onChange: (e) => setAgreementForm((f) => ({ ...f, agreementStartDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "End Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: agreementForm.agreementEndDate, onChange: (e) => setAgreementForm((f) => ({ ...f, agreementEndDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Annual Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: agreementForm.totalAnnualPayment, onChange: (e) => setAgreementForm((f) => ({ ...f, totalAnnualPayment: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: agreementForm.status, onValueChange: (v) => setAgreementForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: AGREEMENT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, style: { textTransform: "capitalize" }, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Managing Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. RPA, Natural England", value: agreementForm.managingBody, onChange: (e) => setAgreementForm((f) => ({ ...f, managingBody: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agent / Advisor Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. ADAS, Savills", value: agreementForm.agentOrAdvisorName, onChange: (e) => setAgreementForm((f) => ({ ...f, agentOrAdvisorName: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: agreementForm.notes, onChange: (e) => setAgreementForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddAgreementOpen(false);
          setEditAgreement(null);
          setAgreementForm(emptyAgreement);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          if (!agreementForm.agreementNumber || !agreementForm.schemeName || !agreementForm.agreementStartDate || !agreementForm.agreementEndDate) {
            toast({ title: "Please fill required fields", variant: "destructive" });
            return;
          }
          if (editAgreement) updateAgreement.mutate({ id: editAgreement.id, body: agreementForm });
          else createAgreement.mutate(agreementForm);
        }, disabled: createAgreement.isPending || updateAgreement.isPending, children: createAgreement.isPending || updateAgreement.isPending ? "Saving..." : "Save Agreement" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addActionOpen || !!editAction, onOpenChange: (o) => {
      if (!o) {
        setAddActionOpen(false);
        setEditAction(null);
        setActionForm(emptyAction);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editAction ? "Edit SFI Action" : "Add SFI / CS Action" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Agreement ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: actionForm.agreementId ? String(actionForm.agreementId) : "", onValueChange: (v) => setActionForm((f) => ({ ...f, agreementId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select agreement..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: agreements.map((ag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(ag.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 600, marginRight: 6 }, children: ag.agreementNumber }),
              ag.schemeName
            ] }, ag.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Action Code ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: actionForm.actionCode, onValueChange: handleActionCodePick, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select code..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { style: { maxHeight: 280 }, children: [
                SFI_ACTION_CODES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.code, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 600, marginRight: 6 }, children: c.code }),
                  c.description.length > 45 ? c.description.slice(0, 45) + "…" : c.description
                ] }, c.code)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (enter manually)" })
              ] })
            ] }),
            actionForm.actionCode === "__other__" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "Enter action code", value: actionForm._customCode ?? "", onChange: (e) => setActionForm((f) => ({ ...f, actionCode: e.target.value, _customCode: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Land Parcel Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. SD1234 5678", value: actionForm.landParcelReference, onChange: (e) => setActionForm((f) => ({ ...f, landParcelReference: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Action Title / Description ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: actionForm.actionTitle, onChange: (e) => setActionForm((f) => ({ ...f, actionTitle: e.target.value })), placeholder: "Full description of the action" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Eligible Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", placeholder: "0.000", value: actionForm.eligibleAreaHa, onChange: (e) => setActionForm((f) => ({ ...f, eligibleAreaHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment / ha (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: actionForm.annualPaymentPerHa, onChange: (e) => setActionForm((f) => ({ ...f, annualPaymentPerHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: actionForm.annualPaymentAmount, onChange: (e) => setActionForm((f) => ({ ...f, annualPaymentAmount: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Evidence Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Describe what evidence must be recorded / photographed for this action", value: actionForm.evidenceRequired, onChange: (e) => setActionForm((f) => ({ ...f, evidenceRequired: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Evidence Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: actionForm.lastEvidenceDate, onChange: (e) => setActionForm((f) => ({ ...f, lastEvidenceDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Evidence Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: actionForm.nextEvidenceDate, onChange: (e) => setActionForm((f) => ({ ...f, nextEvidenceDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Compliance Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: actionForm.complianceStatus, onValueChange: (v) => setActionForm((f) => ({ ...f, complianceStatus: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COMPLIANCE_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: COMPLIANCE_CONFIG[s]?.label ?? s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: actionForm.notes, onChange: (e) => setActionForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddActionOpen(false);
          setEditAction(null);
          setActionForm(emptyAction);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          if (!actionForm.agreementId || !actionForm.actionCode || !actionForm.actionTitle) {
            toast({ title: "Agreement, action code and title are required", variant: "destructive" });
            return;
          }
          const body = { ...actionForm, agreementId: Number(actionForm.agreementId) };
          if (editAction) updateAction.mutate({ id: editAction.id, body });
          else createAction.mutate(body);
        }, disabled: createAction.isPending || updateAction.isPending, children: createAction.isPending || updateAction.isPending ? "Saving..." : "Save Action" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteAgreementId, onOpenChange: (o) => {
      if (!o) setDeleteAgreementId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Agreement?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will permanently remove this SFI / CS agreement record." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deleteAgreementId && deleteAgreement.mutate(deleteAgreementId), className: "bg-red-600 hover:bg-red-700", children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteActionId, onOpenChange: (o) => {
      if (!o) setDeleteActionId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Action?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will permanently remove this SFI action from your record." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deleteActionId && deleteAction.mutate(deleteActionId), className: "bg-red-600 hover:bg-red-700", children: "Delete" })
      ] })
    ] }) })
  ] }) });
}
export {
  SFIPage as default
};
