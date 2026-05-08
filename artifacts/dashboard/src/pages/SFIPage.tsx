import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { printProReport } from "@/lib/print-report";
import { Plus, Trash2, Pencil, Printer, FileText, PoundSterling, AlertTriangle, CheckCircle2, Clock, Leaf, ExternalLink, Info } from "lucide-react";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtMoney = (v: string | number | null | undefined) => {
  if (v == null || v === "") return "—";
  return `£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const SFI_SCHEME_TYPES = ["SFI 2023", "SFI 2024", "Countryside Stewardship (CS)", "Higher Tier CS", "Farming in Protected Landscapes (FiPL)", "ELM Pilot", "Other"];
const AGREEMENT_STATUSES = ["active", "expired", "withdrawn", "pending"];
const COMPLIANCE_STATUSES = ["compliant", "at_risk", "non_compliant", "not_started"];

const COMPLIANCE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  compliant:     { label: "Compliant",     bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  at_risk:       { label: "At Risk",       bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  non_compliant: { label: "Non-Compliant", bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  not_started:   { label: "Not Started",   bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
};
const AGREEMENT_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: "Active",    bg: "#dcfce7", color: "#166534" },
  expired:   { label: "Expired",   bg: "#fee2e2", color: "#991b1b" },
  withdrawn: { label: "Withdrawn", bg: "#f3f4f6", color: "#6b7280" },
  pending:   { label: "Pending",   bg: "#fef9c3", color: "#854d0e" },
};

const SFI_ACTION_CODES: { code: string; description: string; category: string }[] = [
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
  { code: "AB1",  description: "Manage over-wintered stubbles", category: "Arable" },
  { code: "AB2",  description: "Establish an arable field margin or path", category: "Arable" },
  { code: "AB3",  description: "Create a scalloped margin", category: "Arable" },
  { code: "AB6",  description: "Enhanced over-winter bird food on arable and horticultural land", category: "Arable" },
  { code: "AB8",  description: "Flower-rich grass margins, banks, strips and tracks", category: "Arable" },
  { code: "AB9",  description: "Pollen and nectar plots", category: "Arable" },
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
  { code: "BWM12", description: "Enhanced management of hedgerows", category: "Hedgerows" },
];

type Tab = "overview" | "agreements" | "actions";

const emptyAgreement = { agreementNumber: "", schemeName: "", agreementStartDate: "", agreementEndDate: "", totalAnnualPayment: "", managingBody: "RPA", agentOrAdvisorName: "", status: "active", notes: "" };
const emptyAction = { actionCode: "", actionTitle: "", landParcelReference: "", eligibleAreaHa: "", annualPaymentPerHa: "", annualPaymentAmount: "", evidenceRequired: "", lastEvidenceDate: "", nextEvidenceDate: "", complianceStatus: "not_started", notes: "", agreementId: "" };

export default function SFIPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");

  // Agreements state
  const [addAgreementOpen, setAddAgreementOpen] = useState(false);
  const [editAgreement, setEditAgreement] = useState<any | null>(null);
  const [deleteAgreementId, setDeleteAgreementId] = useState<number | null>(null);
  const [agreementForm, setAgreementForm] = useState<any>(emptyAgreement);

  // Actions state
  const [addActionOpen, setAddActionOpen] = useState(false);
  const [editAction, setEditAction] = useState<any | null>(null);
  const [deleteActionId, setDeleteActionId] = useState<number | null>(null);
  const [actionForm, setActionForm] = useState<any>(emptyAction);
  const [actionSearch, setActionSearch] = useState("");

  // Handle ?prefill= param from Grants & Funding "Start SFI / ELM Record" button
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("prefill");
    if (!raw) return;
    try {
      const data = JSON.parse(atob(raw));
      setAgreementForm((f: any) => ({ ...f, ...data }));
      setAddAgreementOpen(true);
      // Clear the param from the URL without a page reload
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    } catch {
      // ignore malformed prefill
    }
  }, []);

  const agreementsQ = useQuery({
    queryKey: ["sfi-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sfi-agreements`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const actionsQ = useQuery({
    queryKey: ["sfi-actions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sfi-actions`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const agreements: any[] = agreementsQ.data ?? [];
  const actions: any[] = actionsQ.data ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sfi-agreements", farmId] });
    qc.invalidateQueries({ queryKey: ["sfi-actions", farmId] });
  };

  // Agreement mutations
  const createAgreement = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/sfi-agreements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Agreement saved" }); invalidate(); setAddAgreementOpen(false); setAgreementForm(emptyAgreement); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateAgreement = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/sfi-agreements/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Agreement updated" }); invalidate(); setEditAgreement(null); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteAgreement = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/sfi-agreements/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteAgreementId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  // Action mutations
  const createAction = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/sfi-actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Action saved" }); invalidate(); setAddActionOpen(false); setActionForm(emptyAction); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateAction = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/sfi-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Action updated" }); invalidate(); setEditAction(null); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteAction = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/sfi-actions/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteActionId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  // Stats
  const totalAnnualPayment = actions.reduce((sum: number, a: any) => sum + (parseFloat(a.annualPaymentAmount ?? "0") || 0), 0);
  const compliantCount = actions.filter((a: any) => a.complianceStatus === "compliant").length;
  const atRiskCount = actions.filter((a: any) => a.complianceStatus === "at_risk").length;
  const nonCompliantCount = actions.filter((a: any) => a.complianceStatus === "non_compliant").length;
  const today = new Date();
  const upcomingEvidenceCount = actions.filter((a: any) => {
    if (!a.nextEvidenceDate) return false;
    const d = new Date(a.nextEvidenceDate);
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 60;
  }).length;

  const filteredActions = actionSearch
    ? actions.filter((a: any) => a.actionCode?.toLowerCase().includes(actionSearch.toLowerCase()) || a.actionTitle?.toLowerCase().includes(actionSearch.toLowerCase()) || a.landParcelReference?.toLowerCase().includes(actionSearch.toLowerCase()))
    : actions;

  function handleActionCodePick(code: string) {
    const ref = SFI_ACTION_CODES.find(c => c.code === code);
    if (ref) {
      setActionForm((f: any) => ({ ...f, actionCode: code, actionTitle: ref.description }));
    } else {
      setActionForm((f: any) => ({ ...f, actionCode: code }));
    }
  }

  function handlePrintActions() {
    const rows = actions.map((a: any) => {
      const cfg = COMPLIANCE_CONFIG[a.complianceStatus] ?? COMPLIANCE_CONFIG.not_started;
      const linkedAg = agreements.find((ag: any) => ag.id === a.agreementId);
      const daysLeft = a.nextEvidenceDate ? Math.ceil((new Date(a.nextEvidenceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
      const isOverdue = daysLeft !== null && daysLeft < 0;
      const nextEvCell = a.nextEvidenceDate
        ? `${fmt(a.nextEvidenceDate)}${isOverdue ? ' <span style="background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 4px;font-size:6px">Overdue</span>' : daysLeft !== null && daysLeft <= 60 ? ` <span style="background:#fef9c3;color:#854d0e;border-radius:4px;padding:1px 4px;font-size:6px">${daysLeft}d</span>` : ""}`
        : "—";
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
      footerNote: "SFI / ELM records are for farm record-keeping. Submit applications and evidence through the RPA Rural Payments service. Retain for a minimum of 5 years.",
    });
  }

  function handlePrintAgreements() {
    const scConfig: Record<string, { label: string; bg: string; color: string }> = AGREEMENT_STATUS_CONFIG;
    const rows = agreements.map((ag: any) => {
      const sc = scConfig[ag.status] ?? scConfig.active;
      const agActions = actions.filter((a: any) => a.agreementId === ag.id);
      const agPayment = agActions.reduce((s: number, a: any) => s + (parseFloat(a.annualPaymentAmount ?? "0") || 0), 0);
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
      footerNote: "SFI / ELM records are for farm record-keeping. Submit applications and evidence through the RPA Rural Payments service. Retain for a minimum of 5 years.",
    });
  }

  function handlePrintComplianceReport() {
    const today2 = new Date();
    const statRows = [
      ["Active Agreements", String(agreements.filter((a: any) => a.status === "active").length)],
      ["Total Enrolled Actions", String(actions.length)],
      ["Compliant", String(compliantCount)],
      ["At Risk", String(atRiskCount)],
      ["Non-Compliant", String(nonCompliantCount)],
      ["Not Started", String(actions.filter((a: any) => a.complianceStatus === "not_started").length)],
      ["Evidence Due ≤ 60 days", String(upcomingEvidenceCount)],
      ["Est. Total Annual Payment", fmtMoney(totalAnnualPayment)],
    ];
    const summaryTable = `
      <div class="section-head">Compliance Summary</div>
      <table style="width:auto;margin-bottom:12px">
        <tbody>${statRows.map(([k, v]) => `<tr><td style="font-weight:600;padding-right:20px">${k}</td><td>${v}</td></tr>`).join("")}</tbody>
      </table>`;

    const agreementSections = agreements.map((ag: any) => {
      const sc = AGREEMENT_STATUS_CONFIG[ag.status] ?? AGREEMENT_STATUS_CONFIG.active;
      const agActions = actions.filter((a: any) => a.agreementId === ag.id);
      const agPayment = agActions.reduce((s: number, a: any) => s + (parseFloat(a.annualPaymentAmount ?? "0") || 0), 0);

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

      const actionRows = agActions.map((a: any) => {
        const cfg = COMPLIANCE_CONFIG[a.complianceStatus] ?? COMPLIANCE_CONFIG.not_started;
        const daysLeft = a.nextEvidenceDate ? Math.ceil((new Date(a.nextEvidenceDate).getTime() - today2.getTime()) / (1000 * 60 * 60 * 24)) : null;
        const isOverdue = daysLeft !== null && daysLeft < 0;
        const nextEvCell = a.nextEvidenceDate
          ? `${fmt(a.nextEvidenceDate)}${isOverdue ? ' <span style="background:#fee2e2;color:#991b1b;border-radius:3px;padding:1px 3px;font-size:5.5px">Overdue</span>' : daysLeft !== null && daysLeft <= 60 ? ` <span style="background:#fef9c3;color:#854d0e;border-radius:3px;padding:1px 3px;font-size:5.5px">${daysLeft}d</span>` : ""}`
          : "—";
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
      landscape: true,
    });
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>SFI &amp; ELM</h1>
            <p style={{ color: "#6b7280", marginTop: 4, fontSize: "0.875rem" }}>Sustainable Farming Incentive &amp; Environmental Land Management agreements and action tracking</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {tab === "overview" && (agreements.length > 0 || actions.length > 0) && (
              <Button variant="outline" size="sm" onClick={handlePrintComplianceReport}>
                <FileText size={14} className="mr-1.5" />Print Compliance Report
              </Button>
            )}
            {tab === "agreements" && (
              <>
                {agreements.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrintAgreements}>
                    <Printer size={14} className="mr-1.5" />Print Register
                  </Button>
                )}
                <Button size="sm" onClick={() => { setAgreementForm(emptyAgreement); setAddAgreementOpen(true); }}>
                  <Plus size={14} className="mr-1.5" />Add Agreement
                </Button>
              </>
            )}
            {tab === "actions" && (
              <>
                {actions.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrintActions}>
                    <Printer size={14} className="mr-1.5" />Print Register
                  </Button>
                )}
                {agreements.length === 0 ? (
                  <Button size="sm" disabled title="An agreement must be in place before actions can be added">
                    <Plus size={14} className="mr-1.5" />Add Action
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => { setActionForm({ ...emptyAction, agreementId: agreements.length === 1 ? String(agreements[0].id) : "" }); setAddActionOpen(true); }}>
                    <Plus size={14} className="mr-1.5" />Add Action
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Info size={16} style={{ color: "#2563eb", marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: "0.8125rem", color: "#1e40af", lineHeight: 1.5 }}>
            <strong>Important:</strong> SFI agreement data entered here is for your own record-keeping. Submit actual applications and claim evidence through the <a href="https://www.gov.uk/government/collections/sustainable-farming-incentive-guidance" target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "underline" }}>RPA Rural Payments service</a>.
            Funded under the <a href="https://www.gov.uk/guidance/funding-for-farmers" target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "underline" }}>Environmental Land Management (ELM) scheme</a>. <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} />
          </div>
        </div>

        {/* Summary Cards */}
        {(agreements.length > 0 || actions.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: "1.25rem" }}>
            {[
              { label: "Est. Annual Payment", value: fmtMoney(totalAnnualPayment), icon: PoundSterling, color: "#166534", bg: "#f0fdf4" },
              { label: "Enrolled Actions", value: String(actions.length), icon: Leaf, color: "#1d4ed8", bg: "#eff6ff" },
              { label: "Compliant", value: String(compliantCount), icon: CheckCircle2, color: "#166534", bg: "#f0fdf4" },
              { label: "At Risk / Non-Compliant", value: String(atRiskCount + nonCompliantCount), icon: AlertTriangle, color: atRiskCount + nonCompliantCount > 0 ? "#b45309" : "#6b7280", bg: atRiskCount + nonCompliantCount > 0 ? "#fef9c3" : "#f9fafb" },
              { label: "Evidence Due (60 days)", value: String(upcomingEvidenceCount), icon: Clock, color: upcomingEvidenceCount > 0 ? "#b45309" : "#6b7280", bg: upcomingEvidenceCount > 0 ? "#fef9c3" : "#f9fafb" },
            ].map(card => (
              <div key={card.label} style={{ background: card.bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
                <div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.3 }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <TabBar>
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Overview</TabButton>
          <TabButton active={tab === "agreements"} onClick={() => setTab("agreements")}>Agreements ({agreements.length})</TabButton>
          <TabButton active={tab === "actions"} onClick={() => setTab("actions")}>Actions / Options ({actions.length})</TabButton>
        </TabBar>

        <div style={{ marginTop: "1rem" }}>

          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <div>
              {agreements.length === 0 && actions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#9ca3af" }}>
                  <Leaf size={40} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
                  <p style={{ fontWeight: 600, color: "#374151", fontSize: "1rem" }}>No SFI / ELM records yet</p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: 6, maxWidth: 480, margin: "8px auto 0" }}>
                    Start by adding your SFI or CS agreement. The recommended route is via <strong>Grants &amp; Funding</strong> — once an application reaches <strong>Approved</strong> status, click <em>Start SFI / ELM Record →</em> to create the agreement here automatically. You can also add it directly below.
                  </p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
                    <Button size="sm" onClick={() => { setTab("agreements"); setAddAgreementOpen(true); }}><Plus size={14} className="mr-1.5" />Add Agreement</Button>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 10 }}>Actions can be added once an agreement is in place</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  {/* Active Agreements */}
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 10 }}>Active Agreements</h3>
                    {agreements.filter((a: any) => a.status === "active").length === 0 ? (
                      <p style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>No active agreements</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {agreements.filter((a: any) => a.status === "active").map((ag: any) => (
                          <div key={ag.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.875rem 1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{ag.schemeName}</span>
                                <span style={{ marginLeft: 8, fontFamily: "monospace", fontSize: "0.75rem", color: "#6b7280", background: "#f3f4f6", borderRadius: 4, padding: "1px 6px" }}>{ag.agreementNumber}</span>
                              </div>
                              {ag.totalAnnualPayment && <span style={{ fontWeight: 700, color: "#166534", fontSize: "0.875rem" }}>{fmtMoney(ag.totalAnnualPayment)}/yr</span>}
                            </div>
                            <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: "0.75rem", color: "#6b7280" }}>
                              <span>{fmt(ag.agreementStartDate)} → {fmt(ag.agreementEndDate)}</span>
                              {ag.managingBody && <span>{ag.managingBody}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Evidence Due Soon */}
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 10 }}>Evidence Due (next 60 days)</h3>
                    {actions.filter((a: any) => {
                      if (!a.nextEvidenceDate) return false;
                      const d = new Date(a.nextEvidenceDate);
                      const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                      return diff >= 0 && diff <= 60;
                    }).length === 0 ? (
                      <div style={{ fontSize: "0.8125rem", color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={14} style={{ color: "#166534" }} /> No evidence due in the next 60 days
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {actions
                          .filter((a: any) => {
                            if (!a.nextEvidenceDate) return false;
                            const d = new Date(a.nextEvidenceDate);
                            const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                            return diff >= 0 && diff <= 60;
                          })
                          .sort((a: any, b: any) => new Date(a.nextEvidenceDate).getTime() - new Date(b.nextEvidenceDate).getTime())
                          .map((a: any) => {
                            const daysLeft = Math.ceil((new Date(a.nextEvidenceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            return (
                              <div key={a.id} style={{ background: daysLeft <= 14 ? "#fef9c3" : "#fff", border: `1px solid ${daysLeft <= 14 ? "#fde68a" : "#e5e7eb"}`, borderRadius: 10, padding: "0.75rem 1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                  <div>
                                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8125rem", color: "#1d4ed8", marginRight: 6 }}>{a.actionCode}</span>
                                    <span style={{ fontSize: "0.8125rem", color: "#374151" }}>{a.actionTitle}</span>
                                  </div>
                                  <span style={{ fontWeight: 600, fontSize: "0.75rem", color: daysLeft <= 14 ? "#b45309" : "#6b7280", whiteSpace: "nowrap", marginLeft: 8 }}>{daysLeft}d left</span>
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }}>Due: {fmt(a.nextEvidenceDate)}</div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Non-compliant actions */}
                    {nonCompliantCount > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <h3 style={{ fontWeight: 600, fontSize: "0.875rem", color: "#991b1b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} />Non-Compliant Actions</h3>
                        {actions.filter((a: any) => a.complianceStatus === "non_compliant").map((a: any) => (
                          <div key={a.id} style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: 8 }}>
                            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8125rem", color: "#991b1b", marginRight: 6 }}>{a.actionCode}</span>
                            <span style={{ fontSize: "0.8125rem", color: "#374151" }}>{a.actionTitle}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AGREEMENTS TAB ── */}
          {tab === "agreements" && (
            <div>
              {agreementsQ.isLoading ? <p style={{ color: "#9ca3af", textAlign: "center", padding: "3rem" }}>Loading...</p>
                : agreements.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                    <Leaf size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <p style={{ fontWeight: 600, color: "#374151" }}>No agreements recorded</p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", maxWidth: 420, margin: "6px auto 0" }}>
                      The recommended route is from <strong>Grants &amp; Funding</strong> — when an application is approved, use <em>Start SFI / ELM Record →</em> to pre-fill the details here. You can also add an existing agreement directly.
                    </p>
                    <Button size="sm" style={{ marginTop: 16 }} onClick={() => { setAgreementForm(emptyAgreement); setAddAgreementOpen(true); }}><Plus size={14} className="mr-1.5" />Add Agreement</Button>
                  </div>
                ) : (
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          {["Agreement No.", "Scheme", "Start", "End", "Annual Payment", "Managing Body", "Status", ""].map(h => (
                            <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {agreements.map((ag: any, i: number) => {
                          const sc = AGREEMENT_STATUS_CONFIG[ag.status] ?? AGREEMENT_STATUS_CONFIG.active;
                          return (
                            <tr key={ag.id} style={{ borderBottom: i < agreements.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                              <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontWeight: 600, color: "#1d4ed8" }}>{ag.agreementNumber}</td>
                              <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500, color: "#111827" }}>{ag.schemeName}</td>
                              <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(ag.agreementStartDate)}</td>
                              <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(ag.agreementEndDate)}</td>
                              <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, color: "#166534", whiteSpace: "nowrap" }}>{ag.totalAnnualPayment ? fmtMoney(ag.totalAnnualPayment) : "—"}</td>
                              <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{ag.managingBody || "—"}</td>
                              <td style={{ padding: "0.625rem 0.875rem" }}>
                                <span style={{ background: sc.bg, color: sc.color, padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 500 }}>{sc.label}</span>
                              </td>
                              <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                                <button onClick={() => { setEditAgreement(ag); setAgreementForm({ ...ag }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginRight: 4, padding: 4 }}><Pencil size={14} /></button>
                                <button onClick={() => setDeleteAgreementId(ag.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}><Trash2 size={14} /></button>
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

          {/* ── ACTIONS TAB ── */}
          {tab === "actions" && (
            <div>
              {agreements.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 2rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, color: "#9ca3af" }}>
                  <AlertTriangle size={32} style={{ margin: "0 auto 12px", color: "#f59e0b" }} />
                  <p style={{ fontWeight: 600, color: "#374151" }}>No agreements in place yet</p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", maxWidth: 440, margin: "6px auto 0" }}>
                    Actions must be linked to an SFI or CS agreement. Add your agreement first — either from <strong>Grants &amp; Funding</strong> (Approved → <em>Start SFI / ELM Record →</em>) or directly on the Agreements tab.
                  </p>
                  <Button size="sm" style={{ marginTop: 16 }} onClick={() => { setTab("agreements"); setAgreementForm(emptyAgreement); setAddAgreementOpen(true); }}>
                    <Plus size={14} className="mr-1.5" />Add Agreement First
                  </Button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <Input placeholder="Search by action code, title or land parcel..." value={actionSearch} onChange={e => setActionSearch(e.target.value)} style={{ maxWidth: 360 }} />
                  </div>
                  {actionsQ.isLoading ? <p style={{ color: "#9ca3af", textAlign: "center", padding: "3rem" }}>Loading...</p>
                    : filteredActions.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                        <Leaf size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                        <p style={{ fontWeight: 600, color: "#374151" }}>No actions recorded</p>
                        <p style={{ fontSize: "0.875rem" }}>Add the SFI / CS action codes from your agreement to track evidence and compliance.</p>
                        <Button size="sm" style={{ marginTop: 16 }} onClick={() => { setActionForm({ ...emptyAction, agreementId: agreements.length === 1 ? String(agreements[0].id) : "" }); setAddActionOpen(true); }}><Plus size={14} className="mr-1.5" />Add Action</Button>
                      </div>
                    ) : (
                      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                          <thead>
                            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                              {["Agreement", "Code", "Action Title", "Land Parcel", "Area (ha)", "Payment/ha", "Annual Payment", "Last Evidence", "Next Evidence", "Status", ""].map(h => (
                                <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredActions.map((a: any, i: number) => {
                              const cfg = COMPLIANCE_CONFIG[a.complianceStatus] ?? COMPLIANCE_CONFIG.not_started;
                              const evidenceDue = a.nextEvidenceDate ? new Date(a.nextEvidenceDate) : null;
                              const daysLeft = evidenceDue ? Math.ceil((evidenceDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                              const isOverdue = daysLeft !== null && daysLeft < 0;
                              const linkedAgreement = agreements.find((ag: any) => ag.id === a.agreementId);
                              return (
                                <tr key={a.id} style={{ borderBottom: i < filteredActions.length - 1 ? "1px solid #f3f4f6" : "none", background: isOverdue ? "#fff7ed" : undefined }}>
                                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>
                                    {linkedAgreement ? (
                                      <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 600 }}>{linkedAgreement.agreementNumber}</div>
                                        <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>{linkedAgreement.schemeName}</div>
                                      </div>
                                    ) : <span style={{ color: "#d1d5db" }}>—</span>}
                                  </td>
                                  <td style={{ padding: "0.625rem 0.875rem", fontFamily: "monospace", fontWeight: 700, color: "#1d4ed8", whiteSpace: "nowrap" }}>{a.actionCode}</td>
                                  <td style={{ padding: "0.625rem 0.875rem", color: "#111827", maxWidth: 200 }}>{a.actionTitle}</td>
                                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8125rem" }}>{a.landParcelReference || "—"}</td>
                                  <td style={{ padding: "0.625rem 0.875rem", color: "#374151" }}>{a.eligibleAreaHa ? `${Number(a.eligibleAreaHa).toFixed(2)}` : "—"}</td>
                                  <td style={{ padding: "0.625rem 0.875rem", color: "#374151" }}>{a.annualPaymentPerHa ? fmtMoney(a.annualPaymentPerHa) : "—"}</td>
                                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, color: "#166534", whiteSpace: "nowrap" }}>{a.annualPaymentAmount ? fmtMoney(a.annualPaymentAmount) : "—"}</td>
                                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(a.lastEvidenceDate)}</td>
                                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>
                                    <div style={{ color: isOverdue ? "#991b1b" : daysLeft !== null && daysLeft <= 30 ? "#b45309" : "#6b7280", fontWeight: isOverdue ? 600 : 400 }}>
                                      {fmt(a.nextEvidenceDate)}
                                      {daysLeft !== null && !isOverdue && daysLeft <= 60 && <span style={{ marginLeft: 4, fontSize: "0.7rem", background: "#fef9c3", color: "#854d0e", borderRadius: 8, padding: "1px 5px" }}>{daysLeft}d</span>}
                                      {isOverdue && <span style={{ marginLeft: 4, fontSize: "0.7rem", background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "1px 5px" }}>Overdue</span>}
                                    </div>
                                  </td>
                                  <td style={{ padding: "0.625rem 0.875rem" }}>
                                    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 500, whiteSpace: "nowrap" }}>{cfg.label}</span>
                                  </td>
                                  <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                                    <button onClick={() => { setEditAction(a); setActionForm({ ...a, agreementId: a.agreementId ? String(a.agreementId) : "" }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginRight: 4, padding: 4 }}><Pencil size={14} /></button>
                                    <button onClick={() => setDeleteActionId(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}><Trash2 size={14} /></button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── AGREEMENT DIALOG (Add/Edit) ── */}
        <Dialog open={addAgreementOpen || !!editAgreement} onOpenChange={o => { if (!o) { setAddAgreementOpen(false); setEditAgreement(null); setAgreementForm(emptyAgreement); } }}>
          <DialogContent style={{ maxWidth: 540 }}>
            <DialogHeader><DialogTitle>{editAgreement ? "Edit Agreement" : "Add SFI / CS Agreement"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Agreement Number <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. SFI-2024-123456" value={agreementForm.agreementNumber} onChange={e => setAgreementForm((f: any) => ({ ...f, agreementNumber: e.target.value }))} /></div>
                <div><Label>Scheme Name <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Select value={agreementForm.schemeName} onValueChange={v => setAgreementForm((f: any) => ({ ...f, schemeName: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{SFI_SCHEME_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={agreementForm.agreementStartDate} onChange={e => setAgreementForm((f: any) => ({ ...f, agreementStartDate: e.target.value }))} /></div>
                <div><Label>End Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={agreementForm.agreementEndDate} onChange={e => setAgreementForm((f: any) => ({ ...f, agreementEndDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Total Annual Payment (£)</Label><Input type="number" step="0.01" placeholder="0.00" value={agreementForm.totalAnnualPayment} onChange={e => setAgreementForm((f: any) => ({ ...f, totalAnnualPayment: e.target.value }))} /></div>
                <div><Label>Status</Label>
                  <Select value={agreementForm.status} onValueChange={v => setAgreementForm((f: any) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AGREEMENT_STATUSES.map(s => <SelectItem key={s} value={s} style={{ textTransform: "capitalize" }}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Managing Body</Label><Input placeholder="e.g. RPA, Natural England" value={agreementForm.managingBody} onChange={e => setAgreementForm((f: any) => ({ ...f, managingBody: e.target.value }))} /></div>
                <div><Label>Agent / Advisor Name</Label><Input placeholder="e.g. ADAS, Savills" value={agreementForm.agentOrAdvisorName} onChange={e => setAgreementForm((f: any) => ({ ...f, agentOrAdvisorName: e.target.value }))} /></div>
              </div>
              <div><Label>Notes</Label><Textarea rows={2} value={agreementForm.notes} onChange={e => setAgreementForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddAgreementOpen(false); setEditAgreement(null); setAgreementForm(emptyAgreement); }}>Cancel</Button>
              <Button onClick={() => {
                if (!agreementForm.agreementNumber || !agreementForm.schemeName || !agreementForm.agreementStartDate || !agreementForm.agreementEndDate) {
                  toast({ title: "Please fill required fields", variant: "destructive" }); return;
                }
                if (editAgreement) updateAgreement.mutate({ id: editAgreement.id, body: agreementForm });
                else createAgreement.mutate(agreementForm);
              }} disabled={createAgreement.isPending || updateAgreement.isPending}>
                {(createAgreement.isPending || updateAgreement.isPending) ? "Saving..." : "Save Agreement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── ACTION DIALOG (Add/Edit) ── */}
        <Dialog open={addActionOpen || !!editAction} onOpenChange={o => { if (!o) { setAddActionOpen(false); setEditAction(null); setActionForm(emptyAction); } }}>
          <DialogContent style={{ maxWidth: 600 }}>
            <DialogHeader><DialogTitle>{editAction ? "Edit SFI Action" : "Add SFI / CS Action"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-1">
              <div>
                <Label>Agreement <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={actionForm.agreementId ? String(actionForm.agreementId) : ""} onValueChange={v => setActionForm((f: any) => ({ ...f, agreementId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select agreement..." /></SelectTrigger>
                  <SelectContent>
                    {agreements.map((ag: any) => <SelectItem key={ag.id} value={String(ag.id)}><span style={{ fontFamily: "monospace", fontWeight: 600, marginRight: 6 }}>{ag.agreementNumber}</span>{ag.schemeName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Action Code <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Select value={actionForm.actionCode} onValueChange={handleActionCodePick}>
                    <SelectTrigger><SelectValue placeholder="Select code..." /></SelectTrigger>
                    <SelectContent style={{ maxHeight: 280 }}>
                      {SFI_ACTION_CODES.map(c => <SelectItem key={c.code} value={c.code}><span style={{ fontFamily: "monospace", fontWeight: 600, marginRight: 6 }}>{c.code}</span>{c.description.length > 45 ? c.description.slice(0, 45) + "…" : c.description}</SelectItem>)}
                      <SelectItem value="__other__">Other (enter manually)</SelectItem>
                    </SelectContent>
                  </Select>
                  {actionForm.actionCode === "__other__" && <Input className="mt-1" placeholder="Enter action code" value={actionForm._customCode ?? ""} onChange={e => setActionForm((f: any) => ({ ...f, actionCode: e.target.value, _customCode: e.target.value }))} />}
                </div>
                <div><Label>Land Parcel Ref</Label><Input placeholder="e.g. SD1234 5678" value={actionForm.landParcelReference} onChange={e => setActionForm((f: any) => ({ ...f, landParcelReference: e.target.value }))} /></div>
              </div>
              <div><Label>Action Title / Description <span style={{ color: "#ef4444" }}>*</span></Label><Input value={actionForm.actionTitle} onChange={e => setActionForm((f: any) => ({ ...f, actionTitle: e.target.value }))} placeholder="Full description of the action" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Eligible Area (ha)</Label><Input type="number" step="0.001" placeholder="0.000" value={actionForm.eligibleAreaHa} onChange={e => setActionForm((f: any) => ({ ...f, eligibleAreaHa: e.target.value }))} /></div>
                <div><Label>Payment / ha (£)</Label><Input type="number" step="0.01" placeholder="0.00" value={actionForm.annualPaymentPerHa} onChange={e => setActionForm((f: any) => ({ ...f, annualPaymentPerHa: e.target.value }))} /></div>
                <div><Label>Annual Payment (£)</Label><Input type="number" step="0.01" placeholder="0.00" value={actionForm.annualPaymentAmount} onChange={e => setActionForm((f: any) => ({ ...f, annualPaymentAmount: e.target.value }))} /></div>
              </div>
              <div><Label>Evidence Required</Label><Textarea rows={2} placeholder="Describe what evidence must be recorded / photographed for this action" value={actionForm.evidenceRequired} onChange={e => setActionForm((f: any) => ({ ...f, evidenceRequired: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Last Evidence Date</Label><Input type="date" value={actionForm.lastEvidenceDate} onChange={e => setActionForm((f: any) => ({ ...f, lastEvidenceDate: e.target.value }))} /></div>
                <div><Label>Next Evidence Date</Label><Input type="date" value={actionForm.nextEvidenceDate} onChange={e => setActionForm((f: any) => ({ ...f, nextEvidenceDate: e.target.value }))} /></div>
              </div>
              <div>
                <Label>Compliance Status</Label>
                <Select value={actionForm.complianceStatus} onValueChange={v => setActionForm((f: any) => ({ ...f, complianceStatus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COMPLIANCE_STATUSES.map(s => <SelectItem key={s} value={s}>{COMPLIANCE_CONFIG[s]?.label ?? s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea rows={2} value={actionForm.notes} onChange={e => setActionForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddActionOpen(false); setEditAction(null); setActionForm(emptyAction); }}>Cancel</Button>
              <Button onClick={() => {
                if (!actionForm.agreementId || !actionForm.actionCode || !actionForm.actionTitle) {
                  toast({ title: "Agreement, action code and title are required", variant: "destructive" }); return;
                }
                const body = { ...actionForm, agreementId: Number(actionForm.agreementId) };
                if (editAction) updateAction.mutate({ id: editAction.id, body });
                else createAction.mutate(body);
              }} disabled={createAction.isPending || updateAction.isPending}>
                {(createAction.isPending || updateAction.isPending) ? "Saving..." : "Save Action"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Agreement */}
        <AlertDialog open={!!deleteAgreementId} onOpenChange={o => { if (!o) setDeleteAgreementId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Agreement?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently remove this SFI / CS agreement record.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteAgreementId && deleteAgreement.mutate(deleteAgreementId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Action */}
        <AlertDialog open={!!deleteActionId} onOpenChange={o => { if (!o) setDeleteActionId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Action?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently remove this SFI action from your record.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteActionId && deleteAction.mutate(deleteActionId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
