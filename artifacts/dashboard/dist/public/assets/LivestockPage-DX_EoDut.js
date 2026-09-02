import { f as formatDate, H as HerdsSection, A as AnimalsSection, V as VetHealthPlansSection, M as MortalitySection, F as FallenStockContractorsSection, a as FeedSection, W as WaterSection, S as SiresSection, b as StrawInventorySection, c as AIReproductionSection, T as TbTestsSection, d as WelfareOutcomeSection } from "./MortalitySection-B9XcixPu.js";
import { e, g, D, E, h, i, j, k, l, O, P, m, n, o, p, q, r } from "./MortalitySection-B9XcixPu.js";
import { c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, e as LoaderCircle, n as Card, o as CardContent, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, L as Label, I as Input, N as DialogMutationError, b as useAppStore, R as Redirect, U as FlaskConical, a3 as ErrorBoundary, u as useLocation } from "./index-e6_1Esh9.js";
import { a as usePersistedFilter, u as usePersistedNumberFilter } from "./use-persisted-filter-Z9f9aBTX.js";
import { T as Textarea } from "./textarea-CJTCjn8t.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CSrltEiU.js";
import { C as CircleCheck } from "./circle-check-CKxPJlky.js";
import { T as TriangleAlert } from "./triangle-alert-B_muIZJE.js";
import { E as Eye } from "./eye-Cj_XimZ_.js";
import { P as Pencil } from "./pencil-CjsK4cxa.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-BBHgbSfG.js";
import { C as ConfirmDialog } from "./confirm-dialog-ADKp_7i2.js";
import { R as RecordAttachments } from "./RecordAttachments-Bi9hShb1.js";
import { o as openPrintWindow, e as escapeHtml, p as printProReport } from "./print-report-ClU8-1P0.js";
import { p as printBirthRecordReport } from "./birth-record-report-BlDgWc7B.js";
import { u as useFarmReportMeta, a as useRawFarmName, b as useFarmName } from "./use-farm-name-Fv8D_79S.js";
import { F as FileDown } from "./file-down-D50OaHhI.js";
import { P as Paperclip } from "./paperclip-CpGjObRL.js";
import { P as Printer } from "./printer-DQOm0kHe.js";
import { u as useUpload } from "./use-upload-oJdAMnjt.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-oeXfYKkW.js";
import { S as StaffSelect } from "./staff-select-BnPZ1BMX.js";
import { P as Package } from "./use-safe-clerk-DlkBLhSM.js";
import { Y as YearCompareSelector, C as COMPARE_COLORS } from "./YearCompareSelector-DFOZF5yY.js";
import { A as AnalyticsChartCard } from "./AnalyticsChartCard-CT9gJ6FM.js";
import { e as ChartColumn, A as AppLayout, c as ClipboardList, j as Truck, k as Stethoscope } from "./AppLayout-RczTWQZu.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell, L as Legend } from "./generateCategoricalChart-DDMYNpzG.js";
import { B as BarChart } from "./BarChart-JGhCpyZX.js";
import { C as CartesianGrid } from "./CartesianGrid-DjLWUpHX.js";
import { P as PieChart, a as Pie } from "./PieChart-BlFsEKo1.js";
import { C as ClipboardCheck, D as Droplets, F as FileText } from "./shield-alert-BN7wbtfl.js";
import { C as ChevronUp } from "./chevron-up-BN6yHH2S.js";
import { u as usePersistedTab } from "./use-persisted-tab-Czb-IIT8.js";
import { T as TabBar, a as TabButton } from "./tab-button--8ZO7A7S.js";
import { u as useFarmMeta } from "./shared-DFRK63kN.js";
import { C as CircleX } from "./circle-x-Cri4qjbQ.js";
import "./herd-utils-DXn3XBS9.js";
import "./use-lookup-DAVqADGX.js";
import "./search-uAPa72Ku.js";
import "./upload-4AfsLfD5.js";
import "./RaiseTaskDialog-DuZdmuaV.js";
import "./list-checks-Pv6X9ENK.js";
import "./database-DrLuTU6u.js";
import "./LabSelector-ZqAqW3r4.js";
import "./index-PZe3bktI.js";
import "./qr-code-DG8AzkJg.js";
import "./syringe-Dwb0PkfV.js";
import "./index-QaeRbgn_.js";
import "./index-FyJDXzx9.js";
import "./image-C8OZGFeb.js";
import "./download-DTnbu2B-.js";
import "./shield-check-CGT5FCxT.js";
import "./tractor-BlLWJBHK.js";
import "./csv-DWj6ABOA.js";
import "./api-Dhdsf4oM.js";
import "./chevrons-up-down-DbKAjKsQ.js";
function VetPrescriptionsSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [pendingConfirm, setPendingConfirm] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["vet-prescriptions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-prescriptions`, { credentials: "include" }).then((r2) => r2.json())
  });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? `/api/farms/${farmId}/vet-prescriptions/${editing.id}` : `/api/farms/${farmId}/vet-prescriptions`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/vet-prescriptions/${id}`, { method: "DELETE", credentials: "include" }).then(async (r2) => {
      if (!r2.ok) {
        const t = await r2.text().catch(() => "");
        throw new Error(t || `Request failed (${r2.status})`);
      }
      return r2;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const allRxRows = records;
  const [yearFilterRx, setYearFilterRx] = usePersistedFilter({ page: "livestock-prescriptions", filter: "year", farmId, defaultValue: "all", isValid: (v) => v === "all" || /^\d{4}$/.test(v) });
  const yearsRx = reactExports.useMemo(() => Array.from(new Set(allRxRows.map((r2) => String(r2.prescriptionDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allRxRows]);
  const rows = yearFilterRx === "all" ? allRxRows : allRxRows.filter((r2) => String(r2.prescriptionDate ?? "").startsWith(yearFilterRx));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Prescription Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Record the written prescription or SIC issued by your vet authorising use of each product. Treatment administration is recorded separately in the Medicine module." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterRx, onValueChange: setYearFilterRx, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsRx.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm({ signedByVet: true, farmRegistered: true });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          " Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-4 text-center", children: "No medicine treatment records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        ["Rx Date", "Product / Active Ingredient", "Indication", "Withdrawal Meat", "Withdrawal Milk", "Vet / Practice", "Valid Until", "Treatments"].map((h2) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap", children: h2 }, h2)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r2, i2) => {
        const treatmentsRecorded = Number(r2.treatmentsRecorded ?? 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: r2.prescriptionDate ? new Date(r2.prescriptionDate).toLocaleDateString("en-GB") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: String(r2.productName ?? "—") }),
            r2.activeIngredient != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: String(r2.activeIngredient) }),
            Boolean(r2.isCascade) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block", children: "Cascade" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 max-w-[200px] text-xs text-muted-foreground", children: r2.indicationOrDiagnosis ? String(r2.indicationOrDiagnosis).slice(0, 80) + (String(r2.indicationOrDiagnosis).length > 80 ? "…" : "") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: r2.withdrawalPeriodMeat ? `${r2.withdrawalPeriodMeat}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: r2.withdrawalPeriodMilk ? `${r2.withdrawalPeriodMilk}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: String(r2.vetName ?? "—") }),
            r2.vrcPracticeName != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: String(r2.vrcPracticeName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: r2.expiryDate ? (() => {
            const exp = new Date(r2.expiryDate);
            const daysLeft = Math.ceil((exp.getTime() - Date.now()) / 864e5);
            return daysLeft < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-red-600 font-medium", children: "Expired" }) : daysLeft <= 30 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-amber-600 font-medium", children: [
              exp.toLocaleDateString("en-GB"),
              " (",
              daysLeft,
              "d)"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: exp.toLocaleDateString("en-GB") });
          })() : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: treatmentsRecorded > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
            treatmentsRecorded
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
            "None"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "View", onClick: () => setViewRecord(r2), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
              setEditing(r2);
              setForm(Object.fromEntries(Object.entries(r2).map(([k2, v]) => [k2, v ?? ""])));
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setPendingConfirm({ msg: "Delete this prescription record? This cannot be undone.", fn: () => del.mutate(r2.id, { onSuccess: () => setPendingConfirm(null) }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
          ] })
        ] }, i2);
      }) })
    ] }) }) }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem", maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Prescription Record — ",
        String(viewRecord.productName ?? "")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescription Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.prescriptionDate ? new Date(viewRecord.prescriptionDate).toLocaleDateString("en-GB") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescription Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.prescriptionRef || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vetName || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Practice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vetPractice || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet RCVS Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vetRcvsNumber || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Valid Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.prescriptionValidUntil ? new Date(viewRecord.prescriptionValidUntil).toLocaleDateString("en-GB") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.productName || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.activeIngredient || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Route of Administration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.routeOfAdministration || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dose" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.dose || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.frequency || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.treatmentDuration || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity Authorised" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.quantityAuthorised || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity Dispensed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.dispensedQuantity || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.batchNumber || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.expiryDate ? new Date(viewRecord.expiryDate).toLocaleDateString("en-GB") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal — Meat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.withdrawalPeriodMeat ? `${viewRecord.withdrawalPeriodMeat}d` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal — Milk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.withdrawalPeriodMilk ? `${viewRecord.withdrawalPeriodMilk}d` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal — Eggs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.withdrawalPeriodEggs ? `${viewRecord.withdrawalPeriodEggs}d` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Target Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.targetSpecies || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cascade / Off-label" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.isCascade ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Signed by Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.signedByVet ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Farm Registered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.farmRegistered ? "Yes" : "No" })
        ] }),
        !!viewRecord.cascadeJustification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cascade Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.cascadeJustification) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Indication / Diagnosis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.indicationOrDiagnosis || "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes || "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditing(viewRecord);
          setForm(Object.fromEntries(Object.entries(viewRecord).map(([k2, v]) => [k2, v ?? ""])));
          setOpen(true);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!pendingConfirm,
        title: "Delete Prescription Record",
        message: pendingConfirm?.msg ?? "",
        mutation: del,
        onConfirm: () => {
          pendingConfirm?.fn();
        },
        onCancel: () => {
          setPendingConfirm(null);
          del.reset();
        },
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o2) => {
      setOpen(o2);
      if (!o2) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Medicine Record" : "Add Prescription / Medicine Treatment Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record the veterinary prescription and the animals treated. Required under VMR 2013 and Red Tractor standards." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 max-h-[72vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1", children: "Prescription Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.prescriptionDate ?? ""), onChange: (e2) => setForm((f) => ({ ...f, prescriptionDate: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.prescriptionRef ?? ""), onChange: (e2) => setForm((f) => ({ ...f, prescriptionRef: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetName ?? ""), onChange: (e2) => setForm((f) => ({ ...f, vetName: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Practice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetPractice ?? ""), onChange: (e2) => setForm((f) => ({ ...f, vetPractice: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet RCVS Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetRcvsNumber ?? ""), onChange: (e2) => setForm((f) => ({ ...f, vetRcvsNumber: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Valid Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.prescriptionValidUntil ?? ""), onChange: (e2) => setForm((f) => ({ ...f, prescriptionValidUntil: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 border-t", children: "Medicine Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.productName ?? ""), onChange: (e2) => setForm((f) => ({ ...f, productName: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.activeIngredient ?? ""), onChange: (e2) => setForm((f) => ({ ...f, activeIngredient: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Route of Administration *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.routeOfAdministration ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, routeOfAdministration: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Oral", "Injection (IM)", "Injection (SC)", "Injection (IV)", "Topical", "Pour-on", "Intramammary", "Intrauterine", "In-water", "In-feed"].map((o2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o2, children: o2 }, o2)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dose" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.dose ?? ""), onChange: (e2) => setForm((f) => ({ ...f, dose: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.frequency ?? ""), onChange: (e2) => setForm((f) => ({ ...f, frequency: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.treatmentDuration ?? ""), onChange: (e2) => setForm((f) => ({ ...f, treatmentDuration: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Authorised" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.quantityAuthorised ?? ""), onChange: (e2) => setForm((f) => ({ ...f, quantityAuthorised: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Dispensed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.dispensedQuantity ?? ""), onChange: (e2) => setForm((f) => ({ ...f, dispensedQuantity: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.batchNumber ?? ""), onChange: (e2) => setForm((f) => ({ ...f, batchNumber: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expiryDate ?? ""), onChange: (e2) => setForm((f) => ({ ...f, expiryDate: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal — Meat (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodMeat ?? ""), onChange: (e2) => setForm((f) => ({ ...f, withdrawalPeriodMeat: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal — Milk (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodMilk ?? ""), onChange: (e2) => setForm((f) => ({ ...f, withdrawalPeriodMilk: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal — Eggs (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodEggs ?? ""), onChange: (e2) => setForm((f) => ({ ...f, withdrawalPeriodEggs: e2.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 space-y-2", children: [["signedByVet", "Signed by vet?"], ["isCascade", "Cascade / off-label use?"], ["farmRegistered", "Farm registered for prescribing?"]].map(([k2, l2]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: `rx-${k2}`, checked: Boolean(form[k2]), onChange: (e2) => setForm((f) => ({ ...f, [k2]: e2.target.checked })), className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `rx-${k2}`, children: l2 })
        ] }, k2)) }),
        Boolean(form.isCascade) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cascade Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.cascadeJustification ?? ""), onChange: (e2) => setForm((f) => ({ ...f, cascadeJustification: e2.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Indication / Diagnosis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.indicationOrDiagnosis ?? ""), onChange: (e2) => setForm((f) => ({ ...f, indicationOrDiagnosis: e2.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.targetSpecies ?? ""), onChange: (e2) => setForm((f) => ({ ...f, targetSpecies: e2.target.value })), placeholder: "e.g. Cattle, Sheep, Pigs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e2) => setForm((f) => ({ ...f, notes: e2.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 mt-1 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Recording actual treatments?" }),
          " Once medicine has been administered, record each treatment event — ear tags, date given, who administered it, batch number used — in the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Medicine" }),
          " module (sidebar). When creating a treatment entry there, you can link it back to this prescription for a full audit trail. Keeping prescription authorisation and treatment administration in separate registers is the VMR 2013 standard."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save Record" })
      ] })
    ] }) })
  ] });
}
function LambingEaseBadge({ v }) {
  if (!v) return null;
  const map = {
    1: { label: "Ease 1 — Unassisted", cls: "bg-green-100 text-green-700" },
    2: { label: "Ease 2 — Easy assist", cls: "bg-yellow-100 text-yellow-700" },
    3: { label: "Ease 3 — Hard assist", cls: "bg-orange-100 text-orange-700" },
    4: { label: "Ease 4 — Vet required", cls: "bg-red-100 text-red-700" }
  };
  const d = map[v];
  if (!d) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded font-medium ${d.cls}`, children: d.label });
}
function LambSection({ n: n2, form, set }) {
  const outcomeKey = `lambOutcome${n2}`;
  const sexKey = `lambSex${n2}`;
  const tagKey = `lambEarTag${n2}`;
  const eidKey = `lambEidNumber${n2}`;
  const weightKey = `lambBirthWeightKg${n2}`;
  const animalIdKey = `lambAnimalId${n2}`;
  const outcome = form[outcomeKey];
  const earTag = form[tagKey];
  const animalId = form[animalIdKey];
  const showHint = outcome === "live" && earTag?.trim();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-3 space-y-2 bg-gray-50/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: [
      "Lamb ",
      n2
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form[outcomeKey] || "__none__", onValueChange: (v) => set(outcomeKey, v === "__none__" ? null : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "Live" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died-within-24h", children: "Died within 24h" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form[sexKey] || "__none__", onValueChange: (v) => set(sexKey, v === "__none__" ? null : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Male (ram lamb)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Female (ewe lamb)" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ear Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form[tagKey] || "", onChange: (e2) => set(tagKey, e2.target.value), placeholder: "e.g. UK0141092 0200" }),
        showHint && !animalId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-teal-600 mt-1", children: "Live lamb — will be registered in Livestock on save." }),
        animalId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 mt-1", children: [
          "Already in Flock Register (ID #",
          animalId,
          ") ✓"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EID / Transponder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form[eidKey] || "", onChange: (e2) => set(eidKey, e2.target.value), placeholder: "15-digit ISO 11784 EID" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Weight (kg)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form[weightKey] || "", onChange: (e2) => set(weightKey, e2.target.value || null), placeholder: "e.g. 4.2", className: "w-32" })
    ] })
  ] });
}
function LambingSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const farmMeta = useFarmReportMeta(farmId);
  const todayStr = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const EMPTY = { numberOfLambs: 1, lambingDate: todayStr(), assistanceRequired: false, vetAttended: false, fosteringRequired: false };
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY);
  const [showManualEwe, setShowManualEwe] = reactExports.useState(false);
  const [showManualVet, setShowManualVet] = reactExports.useState(false);
  const [confirmDelete, setConfirmDelete] = reactExports.useState(null);
  const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "livestock-lambing", filter: "year", farmId, defaultValue: String(CURRENT_YEAR), isValid: (v) => v === "all" || /^\d{4}$/.test(v) });
  const printBirthRecord = (record) => {
    const offspring = Array.from({ length: Math.max(1, record.numberOfLambs ?? 1) }, (_, index) => {
      const n2 = index + 1;
      const get = (field) => record[`${field}${n2}`];
      return {
        label: `Lamb ${n2}`,
        outcome: get("lambOutcome"),
        sex: get("lambSex"),
        tag: get("lambEarTag"),
        eid: get("lambEidNumber"),
        animalId: get("lambAnimalId"),
        weightKg: get("lambBirthWeightKg"),
        colostrum: record.colostrumGivenWithin2Hours == null ? null : record.colostrumGivenWithin2Hours ? "Within 2 hours" : "Not within 2 hours"
      };
    });
    const contractor = contractors.find((candidate) => candidate.id === record.perinatalDisposalContractorId);
    printBirthRecordReport({
      species: "sheep",
      recordId: record.id,
      ...farmMeta,
      birthDate: record.lambingDate,
      damLabel: record.eweEarTag,
      damId: record.eweAnimalId,
      offspring,
      sire: record.ramEarTag ?? record.sireRegisterId,
      sireBreed: record.ramBreed,
      conceptionMethod: record.conceptionMethod,
      ease: record.lambingEaseScore,
      assistance: record.assistanceRequired,
      assistanceType: record.assistanceType,
      vet: record.vetAttended ? record.vetName || "Veterinary attendance recorded" : "No veterinary attendance recorded",
      complications: record.eweComplications,
      colostrumWithin2Hours: record.colostrumGivenWithin2Hours,
      colostrumSource: record.colostrumSource,
      fostering: record.fosteringRequired ? record.fosteringDetails || "Required" : "No",
      registration: offspring.some((child) => child.eid) ? "EID details recorded in offspring table" : null,
      perinatalDisposal: [contractor ? `${contractor.name} (${contractor.approvalNumber})` : null, record.perinatalCollectionDate, record.perinatalCollectionRef, record.perinatalDisposalMethod, record.perinatalDisposalNotes].filter(Boolean).join(" · ") || null,
      notes: record.notes,
      attachmentCount: lambingAttachMap[record.id] ?? 0
    });
  };
  const { data, isLoading } = useQuery({
    queryKey: ["lambing-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lambing-records`, { credentials: "include" }).then((r2) => r2.json())
  });
  const animalsQ = useQuery({
    queryKey: ["lambing-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then((r2) => r2.json()),
    enabled: open
  });
  const SHEEP_SPECIES = ["sheep", "ovine"];
  const ewes = (animalsQ.data?.records ?? []).filter((a) => SHEEP_SPECIES.includes(a.species?.toLowerCase()) && a.status === "active" && a.earTagNumber);
  const siresQ = useQuery({
    queryKey: ["lambing-sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then((r2) => r2.json()),
    enabled: open
  });
  const ramSires = (siresQ.data?.records ?? []).filter((s) => s.isActive !== false && ["sheep", "ovine"].includes(s.species?.toLowerCase()));
  const vetVisitsQ = useQuery({
    queryKey: ["lambing-vet-visits", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-visits`, { credentials: "include" }).then((r2) => r2.json()),
    enabled: open && !!form.vetAttended
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map((v) => v.vetName).filter(Boolean))];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter((v) => v.vetName && v.vetPractice).map((v) => [v.vetName, v.vetPractice])
  );
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then((r2) => r2.json()),
    staleTime: 3e4
  });
  const lambingAttachMap = Object.fromEntries(attachCountsRaw.filter((c) => c.recordType === "lambing").map((c) => [c.recordId, c.count]));
  const contractorsQ = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`, { credentials: "include" }).then((r2) => r2.json())
  });
  const contractors = contractorsQ.data ?? [];
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? `/api/farms/${farmId}/lambing-records/${editing.id}` : `/api/farms/${farmId}/lambing-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r2) => r2.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lambing-records", farmId] });
      closeDialog();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/lambing-records/${id}`, { method: "DELETE", credentials: "include" }).then(async (r2) => {
      if (!r2.ok) {
        const t = await r2.text().catch(() => "");
        throw new Error(t || `Request failed (${r2.status})`);
      }
      return r2;
    }).then((r2) => r2.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lambing-records", farmId] });
      setConfirmDelete(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY);
    setShowManualEwe(false);
    setShowManualVet(false);
    save.reset();
  }
  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY, lambingDate: todayStr() });
    setShowManualEwe(false);
    setShowManualVet(false);
    setOpen(true);
  }
  function openEdit(r2) {
    setEditing(r2);
    setForm({ ...r2, lambingDate: r2.lambingDate?.slice(0, 10) ?? "" });
    setShowManualEwe(!r2.eweAnimalId && !!r2.eweEarTag);
    setShowManualVet(!!r2.vetAttended && !!r2.vetName);
    setOpen(true);
  }
  function set(k2, v) {
    setForm((f) => ({ ...f, [k2]: v }));
  }
  const numLambs = form.numberOfLambs ?? 1;
  const hasDeadLambs = [form.lambOutcome1, form.lambOutcome2, form.lambOutcome3, form.lambOutcome4].slice(0, numLambs).some((o2) => o2 === "stillborn" || o2 === "died-within-24h");
  const allRecords = data?.records ?? [];
  const records = yearFilter === "all" ? allRecords : allRecords.filter((r2) => r2.lambingDate?.startsWith(yearFilter));
  const availableYears = [...new Set(allRecords.map((r2) => r2.lambingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));
  function lambSeasonStats(recs) {
    const totalBorn = recs.reduce((s, r2) => s + (r2.numberOfLambs ?? 0), 0);
    const allOutcomes = recs.flatMap((r2) => [r2.lambOutcome1, r2.lambOutcome2, r2.lambOutcome3, r2.lambOutcome4].filter(Boolean));
    const stillborns = allOutcomes.filter((o2) => o2 === "stillborn").length;
    const died24h = allOutcomes.filter((o2) => o2 === "died-within-24h").length;
    const perinatal = stillborns + died24h;
    const pct = (n2) => totalBorn > 0 ? (n2 / totalBorn * 100).toFixed(1) : "—";
    return { ewes: recs.length, totalBorn, stillborns, died24h, perinatal, pct };
  }
  const currentStats = lambSeasonStats(records);
  const yearlyStats = availableYears.map((y) => ({ year: y, ...lambSeasonStats(allRecords.filter((r2) => r2.lambingDate?.startsWith(y))) }));
  function generateLambingReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
    const fv2 = (v) => v === null || v === void 0 || v === "" ? "—" : String(v);
    const easeLabel = (n2) => n2 ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][n2] ?? String(n2) : "—";
    const yesNo = (v) => v === true ? "Yes" : v === false ? "No" : "—";
    const litterLabel = (n2) => n2 === 1 ? "Single" : n2 === 2 ? "Twins" : n2 === 3 ? "Triplets" : n2 === 4 ? "Quads" : fv2(n2);
    const rptStats = lambSeasonStats(records);
    const summaryRows = yearlyStats.map(
      (s) => `<tr><td>${s.year}</td><td>${s.ewes}</td><td>${s.totalBorn}</td><td>${s.stillborns} (${s.pct(s.stillborns)}%)</td><td>${s.died24h} (${s.pct(s.died24h)}%)</td><td style="font-weight:700">${s.perinatal} (${s.pct(s.perinatal)}%)</td></tr>`
    ).join("");
    const tableRows = records.map((r2) => {
      const outcomes = [
        r2.lambOutcome1 ? `${r2.lambOutcome1} (${r2.lambSex1 ?? "?"}) ${r2.lambEarTag1 ? `[${r2.lambEarTag1}]` : ""}` : null,
        r2.lambOutcome2 ? `${r2.lambOutcome2} (${r2.lambSex2 ?? "?"}) ${r2.lambEarTag2 ? `[${r2.lambEarTag2}]` : ""}` : null,
        r2.lambOutcome3 ? `${r2.lambOutcome3} (${r2.lambSex3 ?? "?"}) ${r2.lambEarTag3 ? `[${r2.lambEarTag3}]` : ""}` : null,
        r2.lambOutcome4 ? `${r2.lambOutcome4} (${r2.lambSex4 ?? "?"}) ${r2.lambEarTag4 ? `[${r2.lambEarTag4}]` : ""}` : null
      ].filter(Boolean).join("; ");
      const liveCount = [r2.lambOutcome1, r2.lambOutcome2, r2.lambOutcome3, r2.lambOutcome4].filter((o2) => o2 === "live").length;
      const deadCount = [r2.lambOutcome1, r2.lambOutcome2, r2.lambOutcome3, r2.lambOutcome4].filter((o2) => o2 === "stillborn" || o2 === "died-within-24h").length;
      const disposalCell = r2.perinatalCollectionDate || r2.perinatalCollectionRef || r2.perinatalDisposalMethod ? `${r2.perinatalCollectionDate ? fmtD(r2.perinatalCollectionDate) : "—"} · ${fv2(r2.perinatalCollectionRef)} · ${fv2(r2.perinatalDisposalMethod)}` : deadCount > 0 ? "<span style='color:#b91c1c'>DISPOSAL NOT RECORDED</span>" : "—";
      return `<tr>
        <td>${fmtD(r2.lambingDate)}</td>
        <td>${fv2(r2.eweEarTag)}</td>
        <td>${easeLabel(r2.lambingEaseScore)}</td>
        <td>${litterLabel(r2.numberOfLambs)}</td>
        <td style="font-size:9px">${outcomes || "—"}</td>
        <td>${liveCount} live${deadCount ? ` / ${deadCount} dead` : ""}</td>
        <td>${yesNo(r2.colostrumGivenWithin2Hours)}</td>
        <td>${yesNo(r2.assistanceRequired)}</td>
        <td>${yesNo(r2.vetAttended)}</td>
        <td>${r2.fosteringRequired ? `Yes — ${fv2(r2.fosteringDetails).slice(0, 40)}` : "No"}</td>
        <td style="font-size:9px">${disposalCell}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Lambing Records — Red Tractor Sheep Assurance</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  h3{font-size:11px;margin:14px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .stat-row{display:flex;gap:16px;margin-bottom:14px}
  .stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;flex:1;text-align:center}
  .stat-n{font-size:18px;font-weight:700;color:#111}
  .stat-l{font-size:9px;color:#555;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Lambing Records</h1><h2>Red Tractor Sheep Assurance — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Season: ${yearFilter === "all" ? "All years" : yearFilter}<br>Printed: ${printedDate}</div>
</div>
<div class="stat-row">
  <div class="stat"><div class="stat-n">${rptStats.ewes}</div><div class="stat-l">Ewes Lambed</div></div>
  <div class="stat"><div class="stat-n">${rptStats.totalBorn}</div><div class="stat-l">Total Lambs Born</div></div>
  <div class="stat"><div class="stat-n">${rptStats.stillborns} (${rptStats.pct(rptStats.stillborns)}%)</div><div class="stat-l">Stillborn</div></div>
  <div class="stat"><div class="stat-n">${rptStats.died24h} (${rptStats.pct(rptStats.died24h)}%)</div><div class="stat-l">Died Within 24h</div></div>
  <div class="stat" style="border-color:#fca5a5;background:#fff1f2"><div class="stat-n" style="color:#b91c1c">${rptStats.perinatal} (${rptStats.pct(rptStats.perinatal)}%)</div><div class="stat-l">Perinatal Loss</div></div>
</div>
${yearlyStats.length > 1 ? `<h3>Season-by-Season Perinatal Mortality Trend</h3>
<table style="margin-bottom:16px">
  <thead><tr><th>Season</th><th>Ewes Lambed</th><th>Total Born</th><th>Stillborn</th><th>Died &lt;24h</th><th>Perinatal Loss</th></tr></thead>
  <tbody>${summaryRows}</tbody>
</table>` : ""}
<h3>Individual Lambing Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h3>
<table>
  <thead><tr>
    <th>Date</th><th>Ewe Tag</th><th>Ease Score</th><th>Litter</th><th>Lamb Outcomes / Tags</th>
    <th>Alive/Dead</th><th>Colostrum ≤2h</th><th>Assisted</th><th>Vet</th><th>Fostering</th><th>Disposal (date · ref · method)</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<p class="note">Animal By-Products (Enforcement) (England) Regulations 2011: all perinatal deaths (stillborn and died within 24h) must be disposed of via an authorised route and the consignment note retained. Red Tractor Sheep Assurance: lambing performance and mortality records must be retained for a minimum of 3 years and made available at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Lambing records including ease score, up to 4 lambs, colostrum, fostering, and automatic registration of live lambs in the flock register." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red Tractor Sheep Assurance: lambing performance must be recorded and available at audit." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateLambingReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-1" }),
          "Audit Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Lambing"
        ] })
      ] })
    ] }),
    allRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2 mb-3", children: [
        { label: "Ewes Lambed", value: String(currentStats.ewes), sub: yearFilter === "all" ? "all time" : yearFilter, colour: "" },
        { label: "Total Lambs Born", value: String(currentStats.totalBorn), sub: "", colour: "" },
        { label: "Stillborn", value: `${currentStats.stillborns}`, sub: `${currentStats.pct(currentStats.stillborns)}% of born`, colour: currentStats.stillborns > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50" },
        { label: "Died Within 24h", value: `${currentStats.died24h}`, sub: `${currentStats.pct(currentStats.died24h)}% of born`, colour: currentStats.died24h > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50" },
        { label: "Perinatal Loss", value: `${currentStats.perinatal}`, sub: `${currentStats.pct(currentStats.perinatal)}% of born`, colour: currentStats.perinatal > 0 ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50" }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-3 text-center ${s.colour || "border-gray-200 bg-gray-50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${s.colour.includes("red") ? "text-red-700" : s.colour.includes("amber") ? "text-amber-700" : s.colour.includes("green") ? "text-green-700" : "text-gray-900"}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-600 mt-0.5", children: s.label }),
        s.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: s.sub })
      ] }, s.label)) }),
      yearlyStats.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-200 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Season-by-Season Perinatal Mortality Trend" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-semibold text-gray-500", children: "Season" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Ewes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Born" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Stillborn" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Died <24h" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Perinatal Loss" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-semibold text-gray-500", children: "Bar" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: yearlyStats.map((s, i2) => {
            const maxRate = Math.max(...yearlyStats.map((x) => Number(x.pct(x.perinatal)) || 0), 0.1);
            const rate = Number(s.pct(s.perinatal)) || 0;
            const barWidth = Math.round(rate / maxRate * 100);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i2 % 2 === 0 ? "bg-white" : "bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: s.year }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: s.ewes }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: s.totalBorn }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
                s.stillborns,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                  "(",
                  s.pct(s.stillborns),
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
                s.died24h,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                  "(",
                  s.pct(s.died24h),
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `px-3 py-2 text-right font-semibold ${rate > 5 ? "text-red-600" : rate > 2 ? "text-amber-600" : "text-green-700"}`, children: [
                s.perinatal,
                " (",
                s.pct(s.perinatal),
                "%)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-gray-100 rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded ${rate > 5 ? "bg-red-400" : rate > 2 ? "bg-amber-400" : "bg-green-400"}`, style: { width: `${barWidth}%` } }) }) })
            ] }, s.year);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1.5 bg-gray-50 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red indicator >5% perinatal loss · Amber 2–5% · Green <2%. Red Tractor Sheep Assurance may query rates above 5%." }) })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No lambing records yet. Add the first record above." }) }),
      records.map((r2) => {
        const liveCount = [r2.lambOutcome1, r2.lambOutcome2, r2.lambOutcome3, r2.lambOutcome4].filter((o2) => o2 === "live").length;
        const deadCount = [r2.lambOutcome1, r2.lambOutcome2, r2.lambOutcome3, r2.lambOutcome4].filter((o2) => o2 === "stillborn" || o2 === "died-within-24h").length;
        const registeredCount = [r2.lambAnimalId1, r2.lambAnimalId2, r2.lambAnimalId3, r2.lambAnimalId4].filter(Boolean).length;
        const litterLabel = r2.numberOfLambs === 1 ? "Single" : r2.numberOfLambs === 2 ? "Twins" : r2.numberOfLambs === 3 ? "Triplets" : "Quads";
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r2.lambingDate) }),
              r2.eweEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700 font-mono", children: [
                "Ewe: ",
                r2.eweEarTag
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LambingEaseBadge, { v: r2.lambingEaseScore }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded", children: [
                litterLabel,
                " (",
                r2.numberOfLambs,
                ")"
              ] }),
              liveCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded", children: [
                liveCount,
                " live"
              ] }),
              deadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded", children: [
                deadCount,
                " dead"
              ] }),
              r2.expectedLitterSize && r2.expectedLitterSize !== r2.numberOfLambs && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded", children: [
                "Scan: ",
                r2.expectedLitterSize,
                " → Actual: ",
                r2.numberOfLambs
              ] }),
              registeredCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded", children: [
                "In Flock Register ✓ ×",
                registeredCount
              ] }),
              r2.fosteringRequired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded", children: "Fostered" }),
              r2.colostrumGivenWithin2Hours !== null && r2.colostrumGivenWithin2Hours !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded ${r2.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`, children: r2.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h" }),
              r2.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded", children: r2.vetName ? `Vet: ${r2.vetName}` : "Vet attended" }),
              r2.expectedLambingDate && (() => {
                const days = Math.floor((new Date(r2.expectedLambingDate).getTime() - Date.now()) / 864e5);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded border ${days >= 0 && days <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"}`, children: [
                  "Expected: ",
                  formatDate(r2.expectedLambingDate)
                ] });
              })(),
              deadCount > 0 && (() => {
                const hasDisposal = r2.perinatalCollectionDate || r2.perinatalCollectionRef || r2.perinatalDisposalMethod || r2.perinatalDisposalContractorId;
                return hasDisposal ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded", children: "Disposal recorded ✓" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded", children: "Disposal not recorded" });
              })(),
              (lambingAttachMap[r2.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
                lambingAttachMap[r2.id]
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r2), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r2), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => setConfirmDelete(r2.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          r2.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r2.notes })
        ] }) }, r2.id);
      })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, className: "max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Lambing Record — ",
        viewRecord.eweEarTag || `Record #${viewRecord.id}`
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lambing Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.lambingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Lambing Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.expectedLambingDate ? formatDate(viewRecord.expectedLambingDate) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ewe Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.eweEarTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.lambingEaseScore ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][viewRecord.lambingEaseScore] ?? viewRecord.lambingEaseScore : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Lambs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewRecord.numberOfLambs === 1 ? "Single" : viewRecord.numberOfLambs === 2 ? "Twins" : viewRecord.numberOfLambs === 3 ? "Triplets" : "Quads",
            " (",
            viewRecord.numberOfLambs,
            ")"
          ] })
        ] }),
        [1, 2, 3, 4].slice(0, viewRecord.numberOfLambs ?? 1).map((n2) => {
          const outcome = viewRecord[`lambOutcome${n2}`];
          const sex = viewRecord[`lambSex${n2}`];
          const tag = viewRecord[`lambEarTag${n2}`];
          const wt = viewRecord[`lambBirthWeightKg${n2}`];
          if (!outcome) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 bg-gray-50 rounded p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1", children: [
              "Lamb ",
              n2
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
              outcome,
              sex ? ` · ${sex}` : "",
              tag ? ` · Tag: ${tag}` : "",
              wt ? ` · ${wt} kg` : ""
            ] })
          ] }, n2);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assistance Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.assistanceRequired ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Attended" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetAttended ? "Yes" : "No" })
        ] }),
        viewRecord.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Fostering Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.fosteringRequired ? "Yes" : "No" })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] }),
        (() => {
          const deadCount = [viewRecord.lambOutcome1, viewRecord.lambOutcome2, viewRecord.lambOutcome3, viewRecord.lambOutcome4].filter((o2) => o2 === "stillborn" || o2 === "died-within-24h").length;
          if (deadCount === 0) return null;
          const contractor = contractors.find((c) => c.id === viewRecord.perinatalDisposalContractorId);
          const hasDisposal = viewRecord.perinatalCollectionDate || viewRecord.perinatalCollectionRef || viewRecord.perinatalDisposalMethod || viewRecord.perinatalDisposalContractorId;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-2 rounded-md border p-3 ${hasDisposal ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                className: "text-xs font-semibold uppercase tracking-wide mb-2 ${hasDisposal ? 'text-green-800' : 'text-red-700'}",
                style: { color: hasDisposal ? "#166534" : "#b91c1c" },
                children: [
                  "Perinatal Disposal (",
                  deadCount,
                  " perinatal death",
                  deadCount !== 1 ? "s" : "",
                  ")",
                  hasDisposal ? " ✓" : " — NOT YET RECORDED"
                ]
              }
            ),
            hasDisposal ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
              contractor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Contractor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
                  contractor.name,
                  " (",
                  contractor.approvalNumber,
                  ")"
                ] })
              ] }),
              viewRecord.perinatalCollectionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collection Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.perinatalCollectionDate) })
              ] }),
              viewRecord.perinatalCollectionRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Consignment / NFAS Ref" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.perinatalCollectionRef })
              ] }),
              viewRecord.perinatalDisposalMethod && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Method" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalDisposalMethod })
              ] }),
              viewRecord.perinatalDisposalNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalDisposalNotes })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: "Animal By-Products Regulations require disposal documentation for all perinatal deaths. Edit this record to add contractor collection details." })
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "lambing", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => printBirthRecord(viewRecord), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Farm Birth Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: confirmDelete !== null,
        title: "Delete Lambing Record",
        message: "This will permanently remove this lambing record. Live lamb livestock register entries will be kept.",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: del,
        onConfirm: () => {
          if (confirmDelete !== null) del.mutate(confirmDelete);
        },
        onCancel: () => {
          setConfirmDelete(null);
          del.reset();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o2) => {
      if (!o2) closeDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "68rem" }, className: "max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Lambing Record" : "Add Lambing Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Ewe Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lambing Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lambingDate?.slice(0, 10) || "", onChange: (e2) => set("lambingDate", e2.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Lambing Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedLambingDate?.slice(0, 10) || "", onChange: (e2) => set("expectedLambingDate", e2.target.value || null) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Set before birth to track in Week Ahead" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe Ear Tag" }),
              ewes.length > 0 && !showManualEwe ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.eweAnimalId ? String(form.eweAnimalId) : "__none__",
                  onValueChange: (v) => {
                    if (v === "__manual__") {
                      setShowManualEwe(true);
                      set("eweAnimalId", null);
                      return;
                    }
                    const a = ewes.find((x) => x.id === parseInt(v));
                    set("eweAnimalId", v === "__none__" ? null : parseInt(v));
                    set("eweEarTag", a?.earTagNumber ?? null);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select ewe..." }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                      ewes.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: a.earTagNumber }, a.id)),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Enter tag manually…" })
                    ] })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweEarTag || "", onChange: (e2) => set("eweEarTag", e2.target.value), placeholder: "Ewe ear tag" }),
                ewes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "shrink-0 text-xs", onClick: () => {
                  setShowManualEwe(false);
                  set("eweAnimalId", null);
                  set("eweEarTag", null);
                }, children: "↩" })
              ] }),
              ewes.length === 0 && animalsQ.isSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No sheep registered. Add animals in the Individual Animals tab, or enter the tag above." })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lambing Ease Score" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.lambingEaseScore ? String(form.lambingEaseScore) : "__none__", onValueChange: (v) => set("lambingEaseScore", v === "__none__" ? null : parseInt(v)), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "1 — Unassisted" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 — Easy assistance (1 person)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 — Hard assistance (ropes/snares)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "4 — Vet required / caesarean" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Lambs Born *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(numLambs), onValueChange: (v) => set("numberOfLambs", parseInt(v)), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "1 — Single" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 — Twins" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 — Triplets" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "4 — Quads" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Litter (from scan)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.expectedLitterSize ? String(form.expectedLitterSize) : "__none__", onValueChange: (v) => set("expectedLitterSize", v === "__none__" ? null : parseInt(v)), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not recorded" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded / no scan" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "1 — Single" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 — Twins" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 — Triplets" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "4 — Quads" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe Complications" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweComplications || "", onChange: (e2) => set("eweComplications", e2.target.value), placeholder: "e.g. prolapse, twin lamb disease" })
              ] })
            ] })
          ] }),
          [1, 2, 3, 4].slice(0, numLambs).map((n2) => /* @__PURE__ */ jsxRuntimeExports.jsx(LambSection, { n: n2, form, set }, n2))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-72 flex-shrink-0 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Assistance & Vet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "ar-lamb", checked: !!form.assistanceRequired, onChange: (e2) => {
                set("assistanceRequired", e2.target.checked);
                if (!e2.target.checked) set("assistanceType", null);
              }, className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ar-lamb", children: "Assistance required" })
            ] }),
            form.assistanceRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type of Assistance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assistanceType || "__none__", onValueChange: (v) => set("assistanceType", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual-1-person", children: "Manual — 1 person" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual-2-person", children: "Manual — 2 persons" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ropes-snares", children: "Ropes / snares" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vet-assisted", children: "Vet-assisted delivery" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "caesarean", children: "Caesarean section" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "va-lamb", checked: !!form.vetAttended, onChange: (e2) => {
                set("vetAttended", e2.target.checked);
                if (!e2.target.checked) {
                  set("vetName", null);
                  setShowManualVet(false);
                }
              }, className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "va-lamb", children: "Vet attended" })
            ] }),
            form.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
              uniqueVetNames.length > 0 && !showManualVet ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.vetName || "__none__", onValueChange: (v) => {
                if (v === "__manual__") {
                  setShowManualVet(true);
                  set("vetName", null);
                  return;
                }
                set("vetName", v === "__none__" ? null : v);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                  uniqueVetNames.map((n2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: n2, children: [
                    n2,
                    vetPracticeMap[n2] ? ` — ${vetPracticeMap[n2]}` : ""
                  ] }, n2)),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Enter name manually…" })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e2) => set("vetName", e2.target.value), placeholder: "Vet's full name" }),
                uniqueVetNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "shrink-0 text-xs", onClick: () => {
                  setShowManualVet(false);
                  set("vetName", null);
                }, children: "↩" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Colostrum Management" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Lambs should receive colostrum within 2 hours of birth. 50ml/kg is the target first feed." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "col-lamb", checked: form.colostrumGivenWithin2Hours === true, onChange: (e2) => set("colostrumGivenWithin2Hours", e2.target.checked ? true : false), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "col-lamb", children: "Colostrum given within 2 hours" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum Source" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumSource || "__none__", onValueChange: (v) => set("colostrumSource", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not recorded" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "own-dam", children: "Own dam (natural suck)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other-ewe", children: "Other ewe (bottle)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "frozen", children: "Frozen colostrum" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "supplement", children: "Colostrum supplement" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Fostering" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "foster-lamb", checked: !!form.fosteringRequired, onChange: (e2) => {
                set("fosteringRequired", e2.target.checked);
                if (!e2.target.checked) set("fosteringDetails", null);
              }, className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "foster-lamb", children: "Fostering required" })
            ] }),
            form.fosteringRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fostering Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.fosteringDetails || "", onChange: (e2) => set("fosteringDetails", e2.target.value), placeholder: "e.g. Lamb 2 fostered onto ewe UK0141092 0301 — skin graft method used", rows: 3 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Ram / Sire" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conception Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.conceptionMethod || "__none__", onValueChange: (v) => set("conceptionMethod", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not recorded" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "natural-service", children: "Natural service" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ai", children: "AI (artificial insemination)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "embryo-transfer", children: "Embryo Transfer (ET)" })
                ] })
              ] })
            ] }),
            ramSires.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ram (from Sire Register)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sireRegisterId ? String(form.sireRegisterId) : "__none__", onValueChange: (v) => {
                const sid = v === "__none__" ? null : parseInt(v);
                const sr = ramSires.find((s) => s.id === sid);
                set("sireRegisterId", sid);
                set("ramEarTag", sr?.tagNumber ?? null);
                set("ramBreed", sr?.breed ?? null);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select ram..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked" }),
                  ramSires.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                    s.name,
                    s.breed ? ` (${s.breed})` : ""
                  ] }, s.id))
                ] })
              ] })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ram Ear Tag" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ramEarTag || "", onChange: (e2) => set("ramEarTag", e2.target.value), placeholder: "Tag no." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ram Breed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ramBreed || "", onChange: (e2) => set("ramBreed", e2.target.value), placeholder: "e.g. Texel" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e2) => set("notes", e2.target.value), placeholder: "Any additional notes...", rows: 3 })
          ] })
        ] })
      ] }),
      hasDeadLambs && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-300 bg-amber-50 p-3 space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800 uppercase tracking-wide", children: "Perinatal Disposal — Animal By-Products Requirement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 mt-1", children: "Stillborn and died-within-24h lambs must be collected by a licensed fallen stock contractor or disposed of via another authorised route. The collection note / consignment reference must be retained for 3 years." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fallen Stock Contractor" }),
            contractors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.perinatalDisposalContractorId ? String(form.perinatalDisposalContractorId) : "__none__",
                onValueChange: (v) => set("perinatalDisposalContractorId", v === "__none__" ? null : parseInt(v)),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select contractor..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not yet collected" }),
                    contractors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                      c.name,
                      " (",
                      c.approvalNumber,
                      ")"
                    ] }, c.id))
                  ] })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1 border border-amber-200 rounded p-2 bg-white", children: "No fallen stock contractors registered. Add one in the Fallen Stock Contractors tab, then return here to link them." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.perinatalCollectionDate?.slice(0, 10) || "", onChange: (e2) => set("perinatalCollectionDate", e2.target.value || null) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consignment / NFAS Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalCollectionRef || "", onChange: (e2) => set("perinatalCollectionRef", e2.target.value || null), placeholder: "e.g. NFAS-LIN-0042-240317" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Collection note or NFAS certificate reference" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method (if no contractor)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalMethod || "", onChange: (e2) => set("perinatalDisposalMethod", e2.target.value || null), placeholder: "e.g. Hunt kennels, on-farm incinerator" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalNotes || "", onChange: (e2) => set("perinatalDisposalNotes", e2.target.value || null), placeholder: "Any additional disposal details..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeDialog, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending || !form.lambingDate, onClick: () => save.mutate(form), children: save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }),
          "Saving…"
        ] }) : editing ? "Save Changes" : "Add Lambing Record" })
      ] })
    ] }) })
  ] });
}
const EMPTY_DIP = { dipDate: "", productName: "", mappNumber: null, activeIngredient: null, dipType: "plunge", dipConcentrationPct: null, volumeOfDipLitres: null, sheepCount: 0, herdFlockRef: null, operatorName: "", operatorCertNumber: null, operatorCertExpiry: null, bathFillDate: null, daysSinceLastUse: null, topUpVolumeAdded: null, disposalMethod: null, disposalQuantityLitres: null, disposalDate: null, disposalContractorName: null, disposalWasteTransferNoteRef: null, withdrawalPeriodDays: null, withdrawalClearDate: null, stockItemId: null, quantityUsed: null, documentPath: null, documentUrl: null, documentName: null, notes: null };
function SheepDippingSection({ farmId }) {
  const rawFarmName = useRawFarmName(farmId);
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/sheep-dipping-records`;
  const { data, isLoading } = useQuery({ queryKey: ["sheep-dipping", farmId], queryFn: () => fetch(base).then((r2) => r2.json()) });
  const records = data?.records ?? [];
  const [yearFilterDip, setYearFilterDip] = usePersistedFilter({ page: "livestock-dip", filter: "year", farmId, defaultValue: "all", isValid: (v) => v === "all" || /^\d{4}$/.test(v) });
  const yearsDip = reactExports.useMemo(() => Array.from(new Set(records.map((r2) => String(r2.dipDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredDipRecords = yearFilterDip === "all" ? records : records.filter((r2) => String(r2.dipDate ?? "").startsWith(yearFilterDip));
  const { data: stockData } = useQuery({ queryKey: ["stock-items", farmId], queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then((r2) => r2.json()) });
  const chemicalItems = (stockData?.records ?? []).filter((s) => s.isActive);
  const { data: herdsData } = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r2) => r2.json()) });
  const sheepHerds = (herdsData?.herds ?? []).filter((h2) => h2.species === "sheep" || h2.species === "goat");
  const { data: certsData } = useQuery({
    queryKey: ["staff-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then((r2) => r2.ok ? r2.json() : { records: [] })
  });
  const allCerts = certsData?.records ?? [];
  const PESTICIDE_TYPES = ["PA1", "PA2", "PA3", "PA4", "PA6", "PA6AW", "Safe use of pesticides", "Safe use of rodenticides"];
  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = (membersData?.members ?? []).filter((m2) => m2.isActive !== false);
  const staffNames = activeMembers.map(memberFullName);
  function getCertForOperator(name) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const certs = allCerts.filter((c) => c.userId === name && PESTICIDE_TYPES.some((t) => c.certificateType.startsWith(t)));
    if (certs.length === 0) return null;
    const valid = certs.filter((c) => !c.expiryDate || new Date(c.expiryDate) >= today);
    return valid.length > 0 ? valid.sort((a, b) => (b.expiryDate ?? "").localeCompare(a.expiryDate ?? ""))[0] : certs.sort((a, b) => (b.expiryDate ?? "").localeCompare(a.expiryDate ?? ""))[0];
  }
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...EMPTY_DIP });
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [pendingDoc, setPendingDoc] = reactExports.useState(null);
  const dipDocRef = reactExports.useRef(null);
  const { uploadFile: uploadDipDoc, isUploading: isUploadingDipDoc } = useUpload();
  const setF = (k2, v) => setForm((f) => ({ ...f, [k2]: v }));
  const selectedStockItem = chemicalItems.find((s) => s.id === form.stockItemId) ?? null;
  const createMut = useMutation({ mutationFn: (b) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r2) => {
    if (!r2.ok) {
      const t = await r2.text().catch(() => "");
      throw new Error(t || `Request failed (${r2.status})`);
    }
    return r2;
  }).then((r2) => r2.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-items", farmId] });
    setShowForm(false);
    setForm({ ...EMPTY_DIP });
    setPendingDoc(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r2) => {
    if (!r2.ok) {
      const t = await r2.text().catch(() => "");
      throw new Error(t || `Request failed (${r2.status})`);
    }
    return r2;
  }).then((r2) => r2.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
    setShowForm(false);
    setEditing(null);
    setPendingDoc(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async (r2) => {
    if (!r2.ok) {
      const t = await r2.text().catch(() => "");
      throw new Error(t || `Request failed (${r2.status})`);
    }
    return r2;
  }).then((r2) => r2.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
    setDeleteId(null);
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openEdit(r2) {
    setEditing(r2);
    setPendingDoc(null);
    setForm({ dipDate: r2.dipDate, productName: r2.productName, mappNumber: r2.mappNumber ?? null, activeIngredient: r2.activeIngredient ?? null, dipType: r2.dipType, dipConcentrationPct: r2.dipConcentrationPct ?? null, volumeOfDipLitres: r2.volumeOfDipLitres ?? null, sheepCount: r2.sheepCount, herdFlockRef: r2.herdFlockRef ?? null, operatorName: r2.operatorName, operatorCertNumber: r2.operatorCertNumber ?? null, operatorCertExpiry: r2.operatorCertExpiry ?? null, bathFillDate: r2.bathFillDate ?? null, daysSinceLastUse: r2.daysSinceLastUse, topUpVolumeAdded: r2.topUpVolumeAdded ?? null, disposalMethod: r2.disposalMethod ?? null, disposalQuantityLitres: r2.disposalQuantityLitres ?? null, disposalDate: r2.disposalDate ?? null, disposalContractorName: r2.disposalContractorName ?? null, disposalWasteTransferNoteRef: r2.disposalWasteTransferNoteRef ?? null, withdrawalPeriodDays: r2.withdrawalPeriodDays, withdrawalClearDate: r2.withdrawalClearDate ?? null, stockItemId: r2.stockItemId ?? null, quantityUsed: r2.quantityUsed ?? null, documentPath: r2.documentPath ?? null, documentUrl: r2.documentUrl ?? null, documentName: r2.documentName ?? null, notes: r2.notes ?? null });
    setShowForm(true);
  }
  function printReport() {
    const rows = records.map((r2) => `<tr><td>${escapeHtml(formatDate(r2.dipDate))}</td><td>${escapeHtml(r2.productName)}</td><td>${escapeHtml(r2.dipType)}</td><td>${escapeHtml(r2.sheepCount)}</td><td>${escapeHtml(r2.operatorName)}</td><td>${escapeHtml(r2.operatorCertNumber ?? "—")}</td><td>${escapeHtml(r2.disposalMethod ?? "—")}</td><td>${escapeHtml(r2.withdrawalPeriodDays != null ? r2.withdrawalPeriodDays + " days" : "—")}</td><td>${escapeHtml(formatDate(r2.withdrawalClearDate))}</td></tr>`).join("");
    printProReport({ title: "Sheep Dipping Register", subtitle: `${records.length} dipping records`, farmName: rawFarmName, authority: "Red Tractor", tableHtml: `<table><thead><tr><th>Dip Date</th><th>Product</th><th>Type</th><th>Sheep Count</th><th>Operator</th><th>Cert No.</th><th>Disposal</th><th>W/drawal</th><th>Clear Date</th></tr></thead><tbody>${rows}</tbody></table>` });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Sheep Dipping Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Organophosphate and synthetic pyrethroid dipping records as required by the Control of Pesticides Regulations and Red Tractor Sheep Assurance Scheme." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterDip, onValueChange: setYearFilterDip, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsDip.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm({ ...EMPTY_DIP });
          setShowForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Log Dipping"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Regulatory requirement:" }),
      " Operator must hold a Certificate of Competence in Safe Use of Pesticides (PA6AW or equivalent). All dip waste must be disposed of by a licensed contractor with a Waste Transfer Note. Withdrawal periods must be observed for slaughter and wool."
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filteredDipRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700 mb-1", children: "No dipping records logged" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Log your sheep dipping treatments to maintain compliance with pesticide regulations." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Dip Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Sheep" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Operator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Disposal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "W/drawal Clear" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredDipRecords.map((r2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: formatDate(r2.dipDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-gray-900 text-xs", children: r2.productName }),
          r2.mappNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "MAPP: ",
            r2.mappNumber
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs capitalize", children: r2.dipType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: r2.sheepCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: r2.operatorName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: r2.disposalMethod ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: formatDate(r2.withdrawalClearDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewItem(r2), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3 text-blue-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r2), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r2.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, r2.id)) })
    ] }) }),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Sheep Dipping — ",
          formatDate(viewItem.dipDate)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          viewItem.productName,
          " · ",
          viewItem.sheepCount,
          " sheep"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-2 text-sm", children: [
        viewItem.stockItemName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-2 bg-muted/40 rounded-lg flex items-center gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: viewItem.stockItemName }),
          viewItem.stockItemStorageLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "· ",
            viewItem.stockItemStorageLocation
          ] }),
          viewItem.quantityUsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto font-semibold text-destructive", children: [
            "−",
            viewItem.quantityUsed,
            " ",
            viewItem.stockItemUnit ?? "units",
            " deducted"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dip Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.dipDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product (MAPP)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.productName,
            viewItem.mappNumber && ` (${viewItem.mappNumber})`
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.activeIngredient ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dip Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewItem.dipType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Concentration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.dipConcentrationPct ? `${viewItem.dipConcentrationPct}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Volume of Dip (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.volumeOfDipLitres ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sheep Dipped" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.sheepCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd / Flock Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.herdFlockRef ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Operator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.operatorName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cert. Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewItem.operatorCertNumber ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cert. Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.operatorCertExpiry) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bath Fill Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.bathFillDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Days Since Last Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.daysSinceLastUse ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Top-Up Added (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.topUpVolumeAdded ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.disposalMethod ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Qty (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.disposalQuantityLitres ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.disposalDate) })
        ] }),
        viewItem.disposalContractorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Contractor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.disposalContractorName })
        ] }),
        viewItem.disposalWasteTransferNoteRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "WTN Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewItem.disposalWasteTransferNoteRef })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal Period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.withdrawalPeriodDays != null ? `${viewItem.withdrawalPeriodDays} days` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal Clear Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.withdrawalClearDate) })
        ] }),
        (viewItem.documentPath || viewItem.documentName) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: viewItem.documentPath ? `/api/storage${viewItem.documentPath}` : viewItem.documentUrl ?? "#", target: "_blank", rel: "noreferrer", className: "text-primary text-xs underline", children: viewItem.documentName || "View Document" })
        ] }),
        viewItem.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line", children: viewItem.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewItem);
          setViewItem(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewItem(null), children: "Close" })
      ] })
    ] }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o2) => {
      if (!o2) {
        setShowForm(false);
        setEditing(null);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Dipping Record" : "Log Sheep Dipping" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Complete all fields required under Control of Pesticides Regulations and Red Tractor SAS." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Chemical Store Product ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(select to auto-fill product details & deduct stock)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.stockItemId != null ? String(form.stockItemId) : "",
              onValueChange: (v) => {
                if (!v) {
                  setF("stockItemId", null);
                  return;
                }
                const item = chemicalItems.find((s) => s.id === Number(v));
                if (item) {
                  setF("stockItemId", item.id);
                  if (item.name) setF("productName", item.name);
                  if (item.mappNumber) setF("mappNumber", item.mappNumber);
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: chemicalItems.length === 0 ? "No stock items — enter manually below" : "Select from chemical store…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None / enter manually —" }),
                  chemicalItems.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                    s.name,
                    s.mappNumber ? ` (${s.mappNumber})` : "",
                    s.storageLocation ? ` · ${s.storageLocation}` : ""
                  ] }, s.id))
                ] })
              ]
            }
          ),
          selectedStockItem?.storageLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Storage location: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: selectedStockItem.storageLocation })
          ] })
        ] }),
        selectedStockItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Quantity Used ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal text-xs", children: [
              "(",
              selectedStockItem.unit ?? "units",
              " — will be deducted from stock on save)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: "0.001", value: form.quantityUsed ?? "", onChange: (e2) => setF("quantityUsed", e2.target.value || null), placeholder: `Amount in ${selectedStockItem.unit ?? "units"}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dipping Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dipDate ?? "", onChange: (e2) => setF("dipDate", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name (MAPP) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productName ?? "", onChange: (e2) => setF("productName", e2.target.value), placeholder: "e.g. Ridect Pour-On" }),
          form.stockItemId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Auto-filled from chemical store — edit if needed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "MAPP Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.mappNumber ?? "", onChange: (e2) => setF("mappNumber", e2.target.value || null), className: "font-mono" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.activeIngredient ?? "", onChange: (e2) => setF("activeIngredient", e2.target.value || null), placeholder: "e.g. Cypermethrin" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dip Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.dipType, onValueChange: (v) => setF("dipType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "plunge", children: "Plunge Dip" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "shower", children: "Shower / Race Dip" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pour-on", children: "Pour-On" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "spray", children: "Hand Spray" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Concentration (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.dipConcentrationPct ?? "", onChange: (e2) => setF("dipConcentrationPct", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume of Dip (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.volumeOfDipLitres ?? "", onChange: (e2) => setF("volumeOfDipLitres", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sheep Count *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.sheepCount || "", onChange: (e2) => setF("sheepCount", Number(e2.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
          sheepHerds.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdFlockRef ?? "", onValueChange: (v) => setF("herdFlockRef", v || null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select flock…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None —" }),
              sheepHerds.map((h2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: h2.herdFlockMark ?? h2.name, children: [
                h2.name,
                h2.herdFlockMark ? ` (${h2.herdFlockMark})` : ""
              ] }, h2.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdFlockRef ?? "", onChange: (e2) => setF("herdFlockRef", e2.target.value || null), placeholder: "Flock mark / reference" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StaffSelect,
            {
              value: form.operatorName ?? "",
              onChange: (name) => {
                setF("operatorName", name);
                if (name) {
                  const cert = getCertForOperator(name);
                  if (cert) {
                    setF("operatorCertNumber", cert.certificateNumber ?? null);
                    setF("operatorCertExpiry", cert.expiryDate ? cert.expiryDate.split("T")[0] : null);
                  }
                }
              },
              staffNames
            }
          ),
          (() => {
            if (!form.operatorName) return null;
            const cert = getCertForOperator(form.operatorName);
            const today = /* @__PURE__ */ new Date();
            today.setHours(0, 0, 0, 0);
            if (!cert) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-amber-700 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                "No pesticide certificate (PA1/PA6AW/equivalent) found for this operator in the Staff & Certificates register. Add one there or enter details manually below."
              ] });
            }
            const expired = cert.expiryDate && new Date(cert.expiryDate) < today;
            if (expired) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-red-700 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                "Certificate ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: cert.certificateNumber }),
                " (",
                cert.certificateType,
                ") expired ",
                new Date(cert.expiryDate).toLocaleDateString("en-GB"),
                " — renewal required before operating."
              ] });
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-green-700 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              cert.certificateType,
              " — cert number & expiry auto-filled from Staff & Certificates register."
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cert. of Competence No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.operatorCertNumber ?? "", onChange: (e2) => setF("operatorCertNumber", e2.target.value || null), className: "font-mono", placeholder: "PA6AW / equivalent" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cert. Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.operatorCertExpiry ?? "", onChange: (e2) => setF("operatorCertExpiry", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bath Fill Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.bathFillDate ?? "", onChange: (e2) => setF("bathFillDate", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Days Since Last Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.daysSinceLastUse ?? "", onChange: (e2) => setF("daysSinceLastUse", e2.target.value ? Number(e2.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Top-Up Volume Added (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.topUpVolumeAdded ?? "", onChange: (e2) => setF("topUpVolumeAdded", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3", children: "Dip Waste Disposal" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.disposalMethod ?? "", onValueChange: (v) => setF("disposalMethod", v || null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "licensed-contractor", children: "Licensed Contractor Collection" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved-disposal-site", children: "Approved Disposal Site" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "treatment-plant", children: "Treatment Plant" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Quantity (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.disposalQuantityLitres ?? "", onChange: (e2) => setF("disposalQuantityLitres", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.disposalDate ?? "", onChange: (e2) => setF("disposalDate", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Contractor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.disposalContractorName ?? "", onChange: (e2) => setF("disposalContractorName", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste Transfer Note Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.disposalWasteTransferNoteRef ?? "", onChange: (e2) => setF("disposalWasteTransferNoteRef", e2.target.value || null), className: "font-mono" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3", children: "Withdrawal Period" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal Period (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.withdrawalPeriodDays ?? "", onChange: (e2) => setF("withdrawalPeriodDays", e2.target.value ? Number(e2.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal Clear Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.withdrawalClearDate ?? "", onChange: (e2) => setF("withdrawalClearDate", e2.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Supporting Document ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(MAPP label, risk assessment, waste transfer note…)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              ref: dipDocRef,
              className: "hidden",
              accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
              onChange: async (e2) => {
                const file = e2.target.files?.[0];
                if (!file) return;
                const upload = await uploadDipDoc(file);
                if (upload?.objectPath) {
                  setPendingDoc({ path: upload.objectPath, name: file.name });
                  setF("documentPath", upload.objectPath);
                  setF("documentName", file.name);
                }
                if (dipDocRef.current) dipDocRef.current.value = "";
              }
            }
          ),
          pendingDoc || form.documentPath || form.documentName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 p-2 border rounded text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "📎" }),
            form.documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${form.documentPath}`, target: "_blank", rel: "noreferrer", className: "text-primary underline truncate flex-1", children: form.documentName || "Document" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate flex-1", children: form.documentName || "Document" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: () => {
              setPendingDoc(null);
              setF("documentPath", null);
              setF("documentName", null);
            }, children: "×" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "mt-1", onClick: () => dipDocRef.current?.click(), disabled: isUploadingDipDoc, children: isUploadingDipDoc ? "Uploading…" : "Upload Document (PDF / image)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e2) => setF("notes", e2.target.value || null), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowForm(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form), disabled: !form.dipDate || !form.productName || !form.operatorName || !form.sheepCount || createMut.isPending || updateMut.isPending, children: [
          (createMut.isPending || updateMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          editing ? "Update" : "Save Dipping Record"
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: true, title: "Delete Dipping Record?", message: "This sheep dipping record will be permanently deleted.", mutation: deleteMut, onConfirm: () => deleteMut.mutate(deleteId), onCancel: () => {
      setDeleteId(null);
      deleteMut.reset();
    }, confirmLabel: "Delete", confirmVariant: "destructive" })
  ] });
}
const LIVESTOCK_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function getRecordYear(r2, ...fields) {
  for (const f of fields) {
    const v = String(r2[f] ?? "");
    if (v && v !== "undefined" && v !== "null") {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.getFullYear();
    }
  }
  return null;
}
function getRecordMonth(r2, ...fields) {
  for (const f of fields) {
    const v = String(r2[f] ?? "");
    if (v && v !== "undefined" && v !== "null") {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.getMonth();
    }
  }
  return null;
}
function LivestockAnalyticsSection({ farmId }) {
  const { data: mortalityData } = useQuery({ queryKey: ["mortality", farmId], queryFn: () => fetch(`/api/farms/${farmId}/mortality-records`).then((r2) => r2.json()) });
  const { data: bvdData } = useQuery({ queryKey: ["bvd-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/bvd-tests`).then((r2) => r2.json()).then((d) => d.records ?? []) });
  const { data: tbData } = useQuery({ queryKey: ["tb-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`).then((r2) => r2.json()) });
  const { data: aiData } = useQuery({ queryKey: ["ai-reproduction", farmId], queryFn: () => fetch(`/api/farms/${farmId}/ai-reproduction-records`).then((r2) => r2.json()).then((d) => d.records ?? []) });
  const mortality = reactExports.useMemo(() => mortalityData?.records ?? mortalityData ?? [], [mortalityData]);
  const bvdTests = reactExports.useMemo(() => Array.isArray(bvdData) ? bvdData : [], [bvdData]);
  const tbTests = reactExports.useMemo(() => tbData?.records ?? [], [tbData]);
  const aiRecords = reactExports.useMemo(() => Array.isArray(aiData) ? aiData : [], [aiData]);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const availableYears = reactExports.useMemo(() => {
    const s = /* @__PURE__ */ new Set();
    mortality.forEach((r2) => {
      const y = getRecordYear(r2, "dateOfDeath", "date");
      if (y) s.add(y);
    });
    bvdTests.forEach((r2) => {
      const y = getRecordYear(r2, "testDate", "date", "createdAt");
      if (y) s.add(y);
    });
    aiRecords.forEach((r2) => {
      const y = getRecordYear(r2, "serviceDate", "date", "createdAt");
      if (y) s.add(y);
    });
    return Array.from(s).sort((a, b) => b - a);
  }, [mortality, bvdTests, aiRecords]);
  const [selectedYear, setSelectedYear] = usePersistedNumberFilter({
    page: "livestock-analytics",
    filter: "year",
    farmId,
    defaultValue: currentYear,
    isValid: (v) => v > 2e3 && v <= currentYear + 1
  });
  const [compareYear, setCompareYear] = reactExports.useState(null);
  const mortalityFiltered = reactExports.useMemo(
    () => mortality.filter((r2) => getRecordYear(r2, "dateOfDeath", "date") === selectedYear),
    [mortality, selectedYear]
  );
  const mortalityCompare = reactExports.useMemo(
    () => compareYear !== null ? mortality.filter((r2) => getRecordYear(r2, "dateOfDeath", "date") === compareYear) : [],
    [mortality, compareYear]
  );
  const bvdFiltered = reactExports.useMemo(
    () => bvdTests.filter((r2) => getRecordYear(r2, "testDate", "date", "createdAt") === selectedYear),
    [bvdTests, selectedYear]
  );
  const aiFiltered = reactExports.useMemo(
    () => aiRecords.filter((r2) => getRecordYear(r2, "serviceDate", "date", "createdAt") === selectedYear),
    [aiRecords, selectedYear]
  );
  const tbFiltered = reactExports.useMemo(
    () => tbTests.filter((r2) => getRecordYear(r2, "testDate", "date", "createdAt") === selectedYear),
    [tbTests, selectedYear]
  );
  const mortalityByCause = reactExports.useMemo(() => {
    const map = {};
    mortalityFiltered.forEach((r2) => {
      const c = String(r2.causeOfDeath || r2.cause || "Unknown");
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name: name.length > 16 ? name.slice(0, 15) + "…" : name, count }));
  }, [mortalityFiltered]);
  const mortalityByMonth = reactExports.useMemo(() => {
    const primary = Array(12).fill(0);
    const compare = Array(12).fill(0);
    mortalityFiltered.forEach((r2) => {
      const m2 = getRecordMonth(r2, "dateOfDeath", "date");
      if (m2 !== null) primary[m2]++;
    });
    if (compareYear !== null) {
      mortalityCompare.forEach((r2) => {
        const m2 = getRecordMonth(r2, "dateOfDeath", "date");
        if (m2 !== null) compare[m2]++;
      });
    }
    return MONTH_LABELS.map((label, i2) => ({
      month: label,
      [String(selectedYear)]: primary[i2],
      ...compareYear !== null ? { [String(compareYear)]: compare[i2] } : {}
    })).filter(
      (d) => d[String(selectedYear)] > 0 || compareYear !== null && d[String(compareYear)] > 0
    );
  }, [mortalityFiltered, mortalityCompare, selectedYear, compareYear]);
  const bvdResultCounts = reactExports.useMemo(() => {
    const map = {};
    bvdFiltered.forEach((r2) => {
      const k2 = String(r2.result || "Unknown");
      map[k2] = (map[k2] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bvdFiltered]);
  const tbPassRate = reactExports.useMemo(() => {
    const passed = tbFiltered.filter((r2) => r2.testResult === "clear" || r2.testResult === "passed" || r2.passed === true).length;
    return tbFiltered.length ? Math.round(passed / tbFiltered.length * 100) : null;
  }, [tbFiltered]);
  const aiConceptionRate = reactExports.useMemo(() => {
    const confirmed = aiFiltered.filter((r2) => r2.pregnancyConfirmed === true || r2.status === "pregnant").length;
    return aiFiltered.length ? Math.round(confirmed / aiFiltered.length * 100) : null;
  }, [aiFiltered]);
  const mortCompareCount = mortalityCompare.length;
  const bvdCompareCount = reactExports.useMemo(
    () => compareYear !== null ? bvdTests.filter((r2) => getRecordYear(r2, "testDate", "date", "createdAt") === compareYear).length : null,
    [bvdTests, compareYear]
  );
  const noData = mortality.length === 0 && bvdTests.length === 0 && tbTests.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add mortality, BVD, or TB records to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    availableYears.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      YearCompareSelector,
      {
        availableYears,
        selectedYear,
        onYearChange: setSelectedYear,
        compareYear,
        onCompareYearChange: setCompareYear
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      {
        label: "Mortality Records",
        value: mortalityFiltered.length,
        compare: compareYear !== null ? mortCompareCount : void 0,
        bg: "bg-red-50 border-red-100",
        text: "text-red-800",
        sub: "text-red-700"
      },
      {
        label: "BVD Tests",
        value: bvdFiltered.length,
        compare: bvdCompareCount ?? void 0,
        bg: "bg-amber-50 border-amber-100",
        text: "text-amber-800",
        sub: "text-amber-700"
      },
      {
        label: "TB Test Pass Rate",
        value: tbPassRate !== null ? `${tbPassRate}%` : "—",
        bg: "bg-green-50 border-green-100",
        text: "text-green-800",
        sub: "text-green-700"
      },
      {
        label: "AI Conception Rate",
        value: aiConceptionRate !== null ? `${aiConceptionRate}%` : "—",
        bg: "bg-blue-50 border-blue-100",
        text: "text-blue-800",
        sub: "text-blue-700"
      }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      c.compare !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xs ${c.sub} opacity-70`, children: [
        compareYear,
        ": ",
        c.compare
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      mortalityByCause.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChartCard, { title: `Mortality by Cause (${selectedYear})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: mortalityByCause, layout: "vertical", margin: { left: 4, right: 24, top: 4, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 10 }, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 90 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} animals`, "Deaths"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#b91c1c", radius: [0, 3, 3, 0] })
      ] }) }) }) }),
      bvdResultCounts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsChartCard, { title: `BVD Test Results (${selectedYear})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: bvdResultCounts, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: bvdResultCounts.map((_, i2) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: LIVESTOCK_COLORS[i2 % LIVESTOCK_COLORS.length] }, i2)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} tests`, ""] })
      ] }) }) }) })
    ] }),
    mortalityByMonth.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnalyticsChartCard,
      {
        title: `Monthly Mortality${compareYear !== null ? ` — ${selectedYear} vs ${compareYear}` : ` (${selectedYear})`}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: mortalityByMonth, margin: { left: 0, right: 16, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          compareYear !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: String(selectedYear), name: String(selectedYear), fill: COMPARE_COLORS[0], radius: [3, 3, 0, 0] }),
          compareYear !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: String(compareYear), name: String(compareYear), fill: COMPARE_COLORS[1], radius: [3, 3, 0, 0] })
        ] }) }) })
      }
    )
  ] });
}
const BVD_TEST_TYPES = [
  { value: "ear_notch_pcr", label: "Ear Notch PCR" },
  { value: "blood_elisa", label: "Blood ELISA" },
  { value: "milk_elisa", label: "Individual Milk ELISA" },
  { value: "blood_pcr", label: "Blood PCR" },
  { value: "bulk_milk_pcr", label: "Bulk Milk PCR" }
];
const BVD_RESULTS = [
  { value: "negative", label: "Negative" },
  { value: "positive", label: "Positive" },
  { value: "inconclusive", label: "Inconclusive" },
  { value: "pi_identified", label: "PI Animal Identified" }
];
const BVD_ACCRED = [
  { value: "not_accredited", label: "Not Accredited" },
  { value: "not_negative", label: "Not BVD-Negative" },
  { value: "negative_not_vaccinating", label: "BVD-Negative (Not Vaccinating)" },
  { value: "negative_vaccinating", label: "BVD-Negative (Vaccinating)" }
];
const BVD_SCHEMES = [
  { value: "CHeCS", label: "CHeCS Cattle Health Certification Standards" },
  { value: "ScotEID", label: "ScotEID" },
  { value: "other", label: "Other scheme" },
  { value: "none", label: "No scheme — independent testing" }
];
function BvdTestingSection({ farmId }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const set = (k2, v) => setForm((f) => ({ ...f, [k2]: v }));
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/bvd-tests/${id}`, { method: "DELETE" }).then(async (r2) => {
      if (!r2.ok) {
        const t = await r2.text().catch(() => "");
        throw new Error(t || `Request failed (${r2.status})`);
      }
      return r2;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bvd-tests", farmId] });
    }
  });
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["bvd-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bvd-tests`).then((r2) => r2.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const [yearFilterBvd, setYearFilterBvd] = usePersistedFilter({ page: "livestock-bvd", filter: "year", farmId, defaultValue: "all", isValid: (v) => v === "all" || /^\d{4}$/.test(v) });
  const yearsBvd = reactExports.useMemo(() => Array.from(new Set(records.map((r2) => String(r2.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredBvdRecords = yearFilterBvd === "all" ? records : records.filter((r2) => String(r2.testDate ?? "").startsWith(yearFilterBvd));
  const { data: herdsRaw } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r2) => r2.json()),
    enabled: !!farmId
  });
  const herds = Array.isArray(herdsRaw) ? herdsRaw : herdsRaw?.records ?? [];
  function openAdd() {
    setEditing(null);
    setForm({ result: "negative" });
    setOpen(true);
  }
  function openEdit(r2) {
    setEditing(r2);
    setForm({ ...r2 });
    setOpen(true);
  }
  function printBvdRegister() {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = records.map((r2) => `<tr>
      <td>${fmtD(r2.testDate)}</td>
      <td>${BVD_TEST_TYPES.find((t) => t.value === r2.testType)?.label ?? r2.testType ?? "—"}</td>
      <td>${herds.find((h2) => h2.id === r2.herdId)?.name ?? "—"}</td>
      <td>${r2.result}</td>
      <td>${r2.animalsTestedCount ?? "—"}</td>
      <td>${r2.piAnimalsFound ?? 0}</td>
      <td>${r2.labName ?? "—"}</td>
      <td>${r2.labRef ?? "—"}</td>
      <td>${BVD_ACCRED.find((a) => a.value === r2.accreditationStatus)?.label ?? "—"}</td>
      <td>${fmtD(r2.nextTestDue)}</td>
      <td>${r2.vetName ?? "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>BVD Testing Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>BVD Testing Register</h1>
<h2>Bovine Viral Diarrhoea Monitoring — Red Tractor Beef &amp; Dairy · ${records.length} record${records.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Test Date</th><th>Test Type</th><th>Herd</th><th>Result</th><th>Animals Tested</th><th>PI Found</th><th>Lab</th><th>Lab Ref</th><th>Accreditation Status</th><th>Next Test Due</th><th>Vet</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">Red Tractor Beef &amp; Dairy: BVD monitoring records must be maintained and available at audit. Persistent Infectees (PIs) must be removed promptly. Retain records for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }
  async function save() {
    const url = editing ? `/api/farms/${farmId}/bvd-tests/${editing.id}` : `/api/farms/${farmId}/bvd-tests`;
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: ["bvd-tests", farmId] });
    setOpen(false);
  }
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const resultBadge = (r2) => {
    const colours = { negative: "bg-green-100 text-green-800", positive: "bg-red-100 text-red-800", pi_identified: "bg-red-200 text-red-900", inconclusive: "bg-amber-100 text-amber-800" };
    const label = BVD_RESULTS.find((x) => x.value === r2)?.label ?? r2;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[r2] ?? "bg-gray-100 text-gray-700"}`, children: label });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "BVD Testing Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Red Tractor Beef & Dairy requires documented BVD monitoring. Record individual tests, PI findings, and herd accreditation status." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterBvd, onValueChange: setYearFilterBvd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsBvd.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printBvdRegister, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Add Test"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : filteredBvdRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No BVD test records yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Add test results including ear notch, blood ELISA, or bulk milk PCR tests." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Test Date", "Test Type", "Herd", "Result", "Animals Tested", "PI Found", "Accreditation Status", "Next Test Due", ""].map((h2) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h2 }, h2)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredBvdRecords.map((r2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDate(r2.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: BVD_TEST_TYPES.find((t) => t.value === r2.testType)?.label ?? r2.testType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: herds.find((h2) => h2.id === r2.herdId)?.name ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: resultBadge(r2.result) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r2.animalsTestedCount ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r2.piAnimalsFound ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: BVD_ACCRED.find((a) => a.value === r2.accreditationStatus)?.label ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDate(r2.nextTestDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r2), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => setPendingDelete(r2.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r2.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " BVD Test Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate || "", onChange: (e2) => set("testDate", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.testType || "", onValueChange: (v) => set("testType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BVD_TEST_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.herdId || "__none__"), onValueChange: (v) => set("herdId", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— All herds" }),
              herds.map((h2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h2.id), children: h2.name }, h2.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Result *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.result || "negative", onValueChange: (v) => set("result", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BVD_RESULTS.map((r2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r2.value, children: r2.label }, r2.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labName || "", onChange: (e2) => set("labName", e2.target.value), placeholder: "e.g. SRUC, Biobest" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e2) => set("labRef", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e2) => set("animalsTestedCount", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PI Animals Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.piAnimalsFound ?? 0, onChange: (e2) => set("piAnimalsFound", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.monitoringScheme || "__none__", onValueChange: (v) => set("monitoringScheme", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select scheme" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None" }),
              BVD_SCHEMES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accreditation Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.accreditationStatus || "__none__", onValueChange: (v) => set("accreditationStatus", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select status" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not set" }),
              BVD_ACCRED.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.value, children: a.label }, a.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scheme Membership No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.schemeMembershipNumber || "", onChange: (e2) => set("schemeMembershipNumber", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e2) => set("vetName", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDue || "", onChange: (e2) => set("nextTestDue", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.actionsTaken || "", onChange: (e2) => set("actionsTaken", e2.target.value), placeholder: "PI removal, vaccination decisions, biosecurity changes…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e2) => set("notes", e2.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: editing ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelete !== null,
        title: "Delete BVD test record",
        message: "Delete this BVD test record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: deleteMut,
        onConfirm: () => {
          if (pendingDelete !== null) deleteMut.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          deleteMut.reset();
        }
      }
    )
  ] });
}
const CASUALTY_METHODS = [
  { value: "captive_bolt", label: "Captive Bolt (+ pithing/sticking)" },
  { value: "free_bullet", label: "Free Bullet" },
  { value: "barbiturate_injection", label: "Barbiturate Injection (Vet)" },
  { value: "other", label: "Other" }
];
const CARCASE_DISPOSAL = [
  { value: "licensed_contractor", label: "Licensed Fallen Stock Contractor" },
  { value: "hunt_kennel", label: "Hunt Kennel / Knacker" },
  { value: "incineration", label: "Licensed Incineration" },
  { value: "rendering", label: "Rendering Plant" },
  { value: "burial_permitted", label: "On-farm Burial (EA Permit)" },
  { value: "other", label: "Other permitted method" }
];
function CasualtySlaughterSection({ farmId }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const set = (k2, v) => setForm((f) => ({ ...f, [k2]: v }));
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/casualty-slaughter/${id}`, { method: "DELETE" }).then(async (r2) => {
      if (!r2.ok) {
        const t = await r2.text().catch(() => "");
        throw new Error(t || `Request failed (${r2.status})`);
      }
      return r2;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["casualty-slaughter", farmId] });
    }
  });
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["casualty-slaughter", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/casualty-slaughter`).then((r2) => r2.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const [yearFilterCasualty, setYearFilterCasualty] = usePersistedFilter({ page: "livestock-casualty", filter: "year", farmId, defaultValue: "all", isValid: (v) => v === "all" || /^\d{4}$/.test(v) });
  const yearsCasualty = reactExports.useMemo(() => Array.from(new Set(records.map((r2) => String(r2.eventDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredCasualtyRecords = yearFilterCasualty === "all" ? records : records.filter((r2) => String(r2.eventDate ?? "").startsWith(yearFilterCasualty));
  const { data: fallenContractors = [] } = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then((r2) => r2.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const { data: animalsData } = useQuery({
    queryKey: ["farm-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then((r2) => r2.json()),
    enabled: !!farmId,
    staleTime: 6e4
  });
  const animals = animalsData?.records ?? [];
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`, { credentials: "include" }).then((r2) => r2.json()),
    enabled: !!farmId,
    staleTime: 12e4
  });
  const staffNames = (staffData?.staff ?? []).map((s) => s.name);
  function handleEarTagChange(tag) {
    const matched = animals.find((a) => a.earTagNumber && a.earTagNumber.toLowerCase() === tag.toLowerCase());
    if (matched) {
      const agePart = matched.dateOfBirth ? `${Math.floor((Date.now() - new Date(matched.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1e3))}yo ` : "";
      const sexPart = matched.sex ? matched.sex + " " : "";
      const breedPart = matched.breed ?? matched.species;
      setForm((f) => ({ ...f, animalEarTag: tag, species: matched.species || f.species, ageOrDescription: `${agePart}${sexPart}${breedPart}`.trim() || f.ageOrDescription }));
    } else {
      set("animalEarTag", tag);
    }
  }
  function handleMethodChange(v) {
    setForm((f) => ({ ...f, method: v, veterinaryInvolved: v === "barbiturate_injection" ? true : f.veterinaryInvolved }));
  }
  function openAdd() {
    setEditing(null);
    setForm({ species: "Cattle", method: "captive_bolt", veterinaryInvolved: false });
    setOpen(true);
  }
  function openEdit(r2) {
    setEditing(r2);
    setForm({ ...r2 });
    setOpen(true);
  }
  function printCasualtyRegister() {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = records.map((r2) => `<tr>
      <td>${fmtD(r2.eventDate)}</td>
      <td>${r2.animalEarTag ?? "—"}</td>
      <td>${r2.species}</td>
      <td>${r2.ageOrDescription ?? "—"}</td>
      <td>${r2.reasonForSlaughter ?? "—"}</td>
      <td>${CASUALTY_METHODS.find((m2) => m2.value === r2.method)?.label ?? r2.method ?? "—"}</td>
      <td>${r2.veterinaryInvolved ? r2.vetName ?? r2.performedBy ?? "—" : r2.performedBy ?? "—"}</td>
      <td>${r2.veterinaryInvolved ? r2.rcvsNumber ?? "—" : r2.waskWatokCertRef ?? "—"}</td>
      <td>${CARCASE_DISPOSAL.find((c) => c.value === r2.carcaseDisposalMethod)?.label ?? r2.carcaseDisposalMethod ?? "—"}</td>
      <td>${r2.notes ?? "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Casualty / Emergency Slaughter Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Casualty / Emergency Slaughter Register</h1>
<h2>On-Farm Emergency Killing Record — Red Tractor · ${records.length} event${records.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Ear Tag</th><th>Species</th><th>Age / Description</th><th>Reason</th><th>Method</th><th>Performed By</th><th>WASK/WATOK / RCVS No.</th><th>Disposal</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">Red Tractor requires a record of every on-farm emergency killing. The person carrying out the slaughter must hold a valid WASK/WATOK certificate, or where a barbiturate injection is used, the attending vet must be RCVS registered. Records must be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }
  async function save() {
    const payload = { ...form };
    if (payload.veterinaryInvolved && !payload.performedBy && payload.vetName) {
      payload.performedBy = payload.vetName;
    }
    const url = editing ? `/api/farms/${farmId}/casualty-slaughter/${editing.id}` : `/api/farms/${farmId}/casualty-slaughter`;
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    qc.invalidateQueries({ queryKey: ["casualty-slaughter", farmId] });
    qc.invalidateQueries({ queryKey: ["farm-animals", farmId] });
    setOpen(false);
  }
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const matchedAnimal = (tag) => animals.find((a) => a.earTagNumber?.toLowerCase() === tag?.toLowerCase());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Casualty / Emergency Slaughter Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Red Tractor requires a record of every on-farm emergency killing. The person carrying out the slaughter must hold a valid WASK/WATOK certificate." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterCasualty, onValueChange: setYearFilterCasualty, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsCasualty.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printCasualtyRegister, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Add Event"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : filteredCasualtyRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No casualty slaughter events recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Record emergency on-farm killings here, separate from natural mortality." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Ear Tag", "Species", "Reason", "Method", "Performed By", "WASK/WATOK / RCVS", "Disposal", ""].map((h2) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h2 }, h2)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredCasualtyRecords.map((r2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDate(r2.eventDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs", children: r2.animalEarTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r2.species }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 max-w-[140px] truncate", title: r2.reasonForSlaughter, children: r2.reasonForSlaughter }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: CASUALTY_METHODS.find((m2) => m2.value === r2.method)?.label ?? r2.method }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r2.veterinaryInvolved ? r2.vetName || r2.performedBy : r2.performedBy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs", children: r2.veterinaryInvolved ? r2.rcvsNumber || "—" : r2.waskWatokCertRef || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: CARCASE_DISPOSAL.find((c) => c.value === r2.carcaseDisposalMethod)?.label ?? r2.carcaseDisposalMethod ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r2), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => setPendingDelete(r2.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r2.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Casualty Slaughter Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.eventDate || "", onChange: (e2) => set("eventDate", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species || "Cattle", onValueChange: (v) => set("species", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Cattle", "Sheep", "Pig", "Goat", "Other"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ear Tag / ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.animalEarTag || "", onChange: (e2) => handleEarTagChange(e2.target.value), placeholder: "UK ear tag number" }),
          form.animalEarTag && matchedAnimal(form.animalEarTag) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "Matched — breed & age auto-filled from animal register." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed / Age" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ageOrDescription || "", onChange: (e2) => set("ageOrDescription", e2.target.value), placeholder: "e.g. 3yo Holstein cow" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason for Slaughter *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.reasonForSlaughter || "", onChange: (e2) => set("reasonForSlaughter", e2.target.value), placeholder: "e.g. Severe fracture — irretrievable" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Method *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.method || "captive_bolt", onValueChange: handleMethodChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CASUALTY_METHODS.map((m2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m2.value, children: m2.label }, m2.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Witness" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.witnessName || "", onChange: (e2) => set("witnessName", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "vetinv", checked: !!form.veterinaryInvolved, onChange: (e2) => set("veterinaryInvolved", e2.target.checked), className: "rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vetinv", children: "Veterinary surgeon involved" })
        ] }),
        form.veterinaryInvolved ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e2) => set("vetName", e2.target.value), placeholder: "Full name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "RCVS Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.rcvsNumber || "", onChange: (e2) => set("rcvsNumber", e2.target.value), placeholder: "e.g. 1234567" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Performed By *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.performedBy || "", onChange: (v) => set("performedBy", v), staffNames, loading: staffLoading })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "WASK/WATOK Certificate Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.waskWatokCertRef || "", onChange: (e2) => set("waskWatokCertRef", e2.target.value), placeholder: "Certificate number" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carcase Disposal Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.carcaseDisposalMethod || "__none__", onValueChange: (v) => set("carcaseDisposalMethod", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select disposal method" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not yet arranged" }),
              CARCASE_DISPOSAL.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Contractor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.carcaseDisposalContractorId || "__none__"), onValueChange: (v) => set("carcaseDisposalContractorId", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select contractor" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None / N/A" }),
              fallenContractors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.name }, c.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carcase Collection Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.carcaseCollectionDate || "", onChange: (e2) => set("carcaseCollectionDate", e2.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal / Collection Note Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.carcaseDisposalRef || "", onChange: (e2) => set("carcaseDisposalRef", e2.target.value), placeholder: "NFAS cert / waste transfer note ref" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e2) => set("notes", e2.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: editing ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelete !== null,
        title: "Delete casualty slaughter record",
        message: "Delete this casualty slaughter record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: deleteMut,
        onConfirm: () => {
          if (pendingDelete !== null) deleteMut.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          deleteMut.reset();
        }
      }
    )
  ] });
}
function IsolationRegisterSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: isoMembersData, isLoading: isoMembersLoading } = useFarmMembers(farmId);
  const isoStaffNames = (isoMembersData?.members ?? []).filter((m2) => m2.isActive !== false).map((m2) => memberFullName(m2));
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRec, setEditRec] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [hcOpen, setHcOpen] = reactExports.useState(null);
  const [deleteHcId, setDeleteHcId] = reactExports.useState(null);
  const emptyForm = { isolationStartDate: "", isolationEndDate: "", animalCount: "", animalDescription: "", isolationReason: "", supplierName: "", clearanceDate: "", clearanceSignedBy: "", notes: "", sourceJohnesVaccStatus: "", sourceJohnesVaccNotes: "", sourcePrrsStatus: "", sourcePrrsNotes: "", sourceMhStatus: "", sourceMhNotes: "", sourceMareksStatus: "", sourceMareksNotes: "", sourceSalmonellaNcpCategory: "", sourceSalmonellaNotes: "" };
  const [form, setForm] = reactExports.useState({ ...emptyForm });
  const emptyHc = { checkDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), checkedBy: "", healthStatus: "satisfactory", temperatureCelsius: "", notes: "", actionTaken: "" };
  const [hcForm, setHcForm] = reactExports.useState({ ...emptyHc });
  const recordsQ = useQuery({ queryKey: ["isolation-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/isolation-records`).then((r2) => r2.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const hcQ = useQuery({ queryKey: ["isolation-hc", farmId, expandedId], queryFn: () => expandedId ? fetch(`/api/farms/${farmId}/isolation-records/${expandedId}/health-checks`).then((r2) => r2.json()) : null, enabled: !!expandedId, select: (d) => d?.healthChecks ?? [] });
  const records = recordsQ.data ?? [];
  const hcs = hcQ.data ?? [];
  const createMut = useMutation({ mutationFn: (b) => fetch(`/api/farms/${farmId}/isolation-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r2) => {
    if (!r2.ok) {
      const t = await r2.text().catch(() => "");
      throw new Error(t || `Request failed (${r2.status})`);
    }
    return r2;
  }).then((r2) => r2.json()), onSuccess: () => {
    toast({ title: "Isolation record created" });
    qc.invalidateQueries({ queryKey: ["isolation-records", farmId] });
    setAddOpen(false);
    setForm({ ...emptyForm });
  }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }) => fetch(`/api/farms/${farmId}/isolation-records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r2) => {
    if (!r2.ok) {
      const t = await r2.text().catch(() => "");
      throw new Error(t || `Request failed (${r2.status})`);
    }
    return r2;
  }).then((r2) => r2.json()), onSuccess: () => {
    toast({ title: "Record updated" });
    qc.invalidateQueries({ queryKey: ["isolation-records", farmId] });
    setEditRec(null);
  }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id) => fetch(`/api/farms/${farmId}/isolation-records/${id}`, { method: "DELETE" }).then(async (r2) => {
    if (!r2.ok) {
      const t = await r2.text().catch(() => "");
      throw new Error(t || `Request failed (${r2.status})`);
    }
    return r2;
  }), onSuccess: () => {
    toast({ title: "Record deleted" });
    qc.invalidateQueries({ queryKey: ["isolation-records", farmId] });
    setDeleteId(null);
  }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });
  const createHcMut = useMutation({ mutationFn: ({ recId, b }) => fetch(`/api/farms/${farmId}/isolation-records/${recId}/health-checks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r2) => {
    if (!r2.ok) {
      const t = await r2.text().catch(() => "");
      throw new Error(t || `Request failed (${r2.status})`);
    }
    return r2;
  }).then((r2) => r2.json()), onSuccess: () => {
    toast({ title: "Health check added" });
    qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, expandedId] });
    setHcOpen(null);
    setHcForm({ ...emptyHc });
  }, onError: () => toast({ title: "Failed to save health check", variant: "destructive" }) });
  const deleteHcMut = useMutation({ mutationFn: ({ recId, checkId }) => fetch(`/api/farms/${farmId}/isolation-records/${recId}/health-checks/${checkId}`, { method: "DELETE" }).then(async (r2) => {
    if (!r2.ok) {
      const t = await r2.text().catch(() => "");
      throw new Error(t || `Request failed (${r2.status})`);
    }
    return r2;
  }), onSuccess: () => {
    toast({ title: "Health check deleted" });
    qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, expandedId] });
    setDeleteHcId(null);
  }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const active = records.filter((r2) => !r2.clearanceDate);
  const cleared = records.filter((r2) => !!r2.clearanceDate);
  const overdue = records.filter((r2) => !r2.clearanceDate && r2.isolationEndDate && new Date(r2.isolationEndDate) < /* @__PURE__ */ new Date());
  function openEdit(r2) {
    setEditRec(r2);
    setForm({ isolationStartDate: r2.isolationStartDate?.slice(0, 10) ?? "", isolationEndDate: r2.isolationEndDate?.slice(0, 10) ?? "", animalCount: String(r2.animalCount ?? ""), animalDescription: r2.animalDescription ?? "", isolationReason: r2.isolationReason ?? "", supplierName: r2.supplierName ?? "", clearanceDate: r2.clearanceDate?.slice(0, 10) ?? "", clearanceSignedBy: r2.clearanceSignedBy ?? "", notes: r2.notes ?? "", sourceJohnesVaccStatus: r2.sourceJohnesVaccStatus ?? "", sourceJohnesVaccNotes: r2.sourceJohnesVaccNotes ?? "", sourcePrrsStatus: r2.sourcePrrsStatus ?? "", sourcePrrsNotes: r2.sourcePrrsNotes ?? "", sourceMhStatus: r2.sourceMhStatus ?? "", sourceMhNotes: r2.sourceMhNotes ?? "", sourceMareksStatus: r2.sourceMareksStatus ?? "", sourceMareksNotes: r2.sourceMareksNotes ?? "", sourceSalmonellaNcpCategory: r2.sourceSalmonellaNcpCategory ?? "", sourceSalmonellaNotes: r2.sourceSalmonellaNotes ?? "" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: "Incoming Stock Isolation Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Red Tractor requirement: record isolation of all incoming livestock with daily health monitoring until clearance is given." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAddOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "New Isolation Record"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-amber-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 font-medium", children: "Active Isolations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-800 mt-1", children: active.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-green-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 font-medium", children: "Cleared" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-800 mt-1", children: cleared.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-red-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-700 font-medium", children: "Overdue Clearance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-800 mt-1", children: overdue.length })
      ] })
    ] }),
    recordsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
      "Loading…"
    ] }),
    !recordsQ.isLoading && records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed border-gray-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: "No isolation records yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Add a record when you receive incoming livestock." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: records.map((r2) => {
      const isExp = expandedId === r2.id;
      const isOverdue = !r2.clearanceDate && r2.isolationEndDate && new Date(r2.isolationEndDate) < /* @__PURE__ */ new Date();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-lg overflow-hidden ${isOverdue ? "border-red-300" : r2.clearanceDate ? "border-green-300" : "border-amber-300"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50", onClick: () => {
          if (isExp) setExpandedId(null);
          else {
            setExpandedId(r2.id);
            qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, r2.id] });
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOverdue ? "bg-red-500" : r2.clearanceDate ? "bg-green-500" : "bg-amber-400"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: r2.animalDescription || r2.isolationReason || "Isolation Record" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                fmtD(r2.isolationStartDate),
                " — ",
                r2.isolationEndDate ? fmtD(r2.isolationEndDate) : "ongoing",
                r2.animalCount ? ` · ${r2.animalCount} animals` : "",
                r2.supplierName ? ` · ${r2.supplierName}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
            r2.clearanceDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5", children: "Cleared" }),
            isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5", children: "Overdue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-gray-200", onClick: (e2) => {
              e2.stopPropagation();
              openEdit(r2);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 text-gray-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-red-100", onClick: (e2) => {
              e2.stopPropagation();
              setDeleteId(r2.id);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-400" }) }),
            isExp ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })
          ] })
        ] }),
        isExp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t bg-gray-50 px-4 py-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: r2.isolationReason || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: r2.supplierName || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Animal Count" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: r2.animalCount ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Clearance Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtD(r2.clearanceDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Clearance Signed By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: r2.clearanceSignedBy || "—" })
            ] }),
            r2.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line", children: r2.notes })
            ] }),
            r2.sourceJohnesVaccStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r2.sourceJohnesVaccStatus === "vaccinating" ? "bg-green-50 border-green-200 text-green-800" : r2.sourceJohnesVaccStatus === "not_vaccinating" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "Johne's (source flock):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r2.sourceJohnesVaccStatus === "vaccinating" ? "✓ Vaccinating with Gudair — confirmed" : r2.sourceJohnesVaccStatus === "not_vaccinating" ? "✗ Not vaccinating — biosecurity risk noted" : "Unknown — not confirmed by supplier",
                r2.sourceJohnesVaccNotes ? ` · ${r2.sourceJohnesVaccNotes}` : ""
              ] })
            ] }),
            r2.sourcePrrsStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r2.sourcePrrsStatus === "negative" ? "bg-green-50 border-green-200 text-green-800" : r2.sourcePrrsStatus === "positive_stable" ? "bg-amber-50 border-amber-200 text-amber-800" : r2.sourcePrrsStatus === "positive_unstable" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "PRRS (source herd):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r2.sourcePrrsStatus === "negative" ? "✓ PRRS-negative — confirmed" : r2.sourcePrrsStatus === "positive_stable" ? "⚠ PRRS-positive stable" : r2.sourcePrrsStatus === "positive_unstable" ? "✗ PRRS-positive unstable — biosecurity risk" : "Unknown — not confirmed by supplier",
                r2.sourcePrrsNotes ? ` · ${r2.sourcePrrsNotes}` : ""
              ] })
            ] }),
            r2.sourceMhStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r2.sourceMhStatus === "negative" ? "bg-green-50 border-green-200 text-green-800" : r2.sourceMhStatus === "positive_stable" ? "bg-amber-50 border-amber-200 text-amber-800" : r2.sourceMhStatus === "positive" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "MH / Enzootic Pneumonia (source herd):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r2.sourceMhStatus === "negative" ? "✓ MH-negative — confirmed" : r2.sourceMhStatus === "positive_stable" ? "⚠ MH-positive stable" : r2.sourceMhStatus === "positive" ? "✗ MH-positive" : "Unknown — not confirmed by supplier",
                r2.sourceMhNotes ? ` · ${r2.sourceMhNotes}` : ""
              ] })
            ] }),
            r2.sourceMareksStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r2.sourceMareksStatus === "vaccinated" ? "bg-green-50 border-green-200 text-green-800" : r2.sourceMareksStatus === "not_vaccinated" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "Marek's Disease (source flock):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r2.sourceMareksStatus === "vaccinated" ? "✓ Vaccinated — confirmed by hatchery/supplier" : r2.sourceMareksStatus === "not_vaccinated" ? "✗ Not vaccinated — biosecurity risk noted" : "Unknown — not confirmed by supplier",
                r2.sourceMareksNotes ? ` · ${r2.sourceMareksNotes}` : ""
              ] })
            ] }),
            r2.sourceSalmonellaNcpCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r2.sourceSalmonellaNcpCategory === "category_1" ? "bg-green-50 border-green-200 text-green-800" : r2.sourceSalmonellaNcpCategory === "category_2" ? "bg-amber-50 border-amber-200 text-amber-800" : r2.sourceSalmonellaNcpCategory === "category_3" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "Salmonella NCP (source flock):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r2.sourceSalmonellaNcpCategory === "category_1" ? "✓ Category 1 — low prevalence" : r2.sourceSalmonellaNcpCategory === "category_2" ? "⚠ Category 2 — moderate prevalence" : r2.sourceSalmonellaNcpCategory === "category_3" ? "✗ Category 3 — high prevalence" : r2.sourceSalmonellaNcpCategory === "not_tested" ? "Not tested" : "Unknown — not confirmed by supplier",
                r2.sourceSalmonellaNotes ? ` · ${r2.sourceSalmonellaNotes}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Daily Health Checks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                setHcOpen(r2.id);
                setHcForm({ ...emptyHc, checkDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3 mr-1" }),
                "Add Check"
              ] })
            ] }),
            hcQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Loading…" }),
            !hcQ.isLoading && hcs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "No health checks recorded." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: hcs.map((hc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-white border rounded px-3 py-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2 h-2 rounded-full ${hc.healthStatus === "satisfactory" || hc.healthStatus === "clear" ? "bg-green-400" : hc.healthStatus === "poor" ? "bg-red-400" : "bg-amber-400"}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtD(hc.checkDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground capitalize", children: hc.healthStatus?.replace(/_/g, " ") }),
                hc.temperatureCelsius && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  hc.temperatureCelsius,
                  "°C"
                ] }),
                hc.checkedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  "by ",
                  hc.checkedBy
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-red-100", onClick: () => setDeleteHcId({ recId: r2.id, checkId: hc.id }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3 text-red-400" }) })
            ] }, hc.id)) })
          ] })
        ] })
      ] }, r2.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen || !!editRec, onOpenChange: (o2) => {
      if (!o2) {
        setAddOpen(false);
        setEditRec(null);
        setForm({ ...emptyForm });
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRec ? "Edit Isolation Record" : "New Isolation Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Start Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.isolationStartDate, onChange: (e2) => setForm((f) => ({ ...f, isolationStartDate: e2.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Expected End Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.isolationEndDate, onChange: (e2) => setForm((f) => ({ ...f, isolationEndDate: e2.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Animal Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.animalDescription, onChange: (e2) => setForm((f) => ({ ...f, animalDescription: e2.target.value })), placeholder: "e.g. 12 Hereford heifers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Number of Animals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalCount, onChange: (e2) => setForm((f) => ({ ...f, animalCount: e2.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Supplier / Source" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierName, onChange: (e2) => setForm((f) => ({ ...f, supplierName: e2.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Reason for Isolation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.isolationReason, onChange: (e2) => setForm((f) => ({ ...f, isolationReason: e2.target.value })), placeholder: "e.g. New purchase, returned from show" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clearance Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.clearanceDate, onChange: (e2) => setForm((f) => ({ ...f, clearanceDate: e2.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clearance Signed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.clearanceSignedBy, onChange: (e2) => setForm((f) => ({ ...f, clearanceSignedBy: e2.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e2) => setForm((f) => ({ ...f, notes: e2.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Johne's Biosecurity — Sheep & Goats" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "AHDB recommends sourcing only from flocks vaccinating with Gudair (Ovilis Gudair). Record the source flock's status here for audit purposes." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Flock Johne's Vaccination Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourceJohnesVaccStatus, onChange: (e2) => setForm((f) => ({ ...f, sourceJohnesVaccStatus: e2.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "vaccinating", children: "Vaccinating with Gudair — confirmed by supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "not_vaccinating", children: "Not vaccinating — risk noted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Johne's Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourceJohnesVaccNotes, onChange: (e2) => setForm((f) => ({ ...f, sourceJohnesVaccNotes: e2.target.value })), placeholder: "e.g. Supplier confirmed Gudair programme since 2022…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "PRRS Biosecurity — Pigs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "AHDB PRRS Accreditation Scheme: purchase only from herds with the same or lower PRRS risk status. Record the source herd's status at point of purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Herd PRRS Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourcePrrsStatus, onChange: (e2) => setForm((f) => ({ ...f, sourcePrrsStatus: e2.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "negative", children: "PRRS-negative — confirmed by supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "positive_stable", children: "PRRS-positive stable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "positive_unstable", children: "PRRS-positive unstable — elevated biosecurity risk" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "PRRS Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourcePrrsNotes, onChange: (e2) => setForm((f) => ({ ...f, sourcePrrsNotes: e2.target.value })), placeholder: "e.g. Supplier holds AHDB PRRS Negative accreditation…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Enzootic Pneumonia / MH Biosecurity — Pigs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "AHDB MH Accreditation: source from MH-negative herds where possible. Record the source herd's Mycoplasma hyopneumoniae status at point of purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Herd MH Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourceMhStatus, onChange: (e2) => setForm((f) => ({ ...f, sourceMhStatus: e2.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "negative", children: "MH-negative — confirmed by supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "positive_stable", children: "MH-positive stable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "positive", children: "MH-positive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "MH Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourceMhNotes, onChange: (e2) => setForm((f) => ({ ...f, sourceMhNotes: e2.target.value })), placeholder: "e.g. Supplier holds AHDB MH Negative accreditation…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Marek's Disease Biosecurity — Poultry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Marek's Disease is a highly contagious herpesvirus. Commercial chicks are typically vaccinated at the hatchery. Record the Marek's vaccination status of the source flock/hatchery at point of purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Flock / Hatchery Marek's Vaccination Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourceMareksStatus, onChange: (e2) => setForm((f) => ({ ...f, sourceMareksStatus: e2.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "vaccinated", children: "Vaccinated — confirmed by hatchery/supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "not_vaccinated", children: "Not vaccinated — biosecurity risk noted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Marek's Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourceMareksNotes, onChange: (e2) => setForm((f) => ({ ...f, sourceMareksNotes: e2.target.value })), placeholder: "e.g. Confirmed HVT-vaccinated in ovo at hatchery…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Salmonella NCP Biosecurity — Poultry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red Tractor Poultry and BEIC require knowledge of source flock Salmonella NCP category. Record the most recent Salmonella NCP category of the source flock at point of purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Flock Salmonella NCP Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourceSalmonellaNcpCategory, onChange: (e2) => setForm((f) => ({ ...f, sourceSalmonellaNcpCategory: e2.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "category_1", children: "Category 1 — low prevalence (≤5%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "category_2", children: "Category 2 — moderate prevalence (5–19%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "category_3", children: "Category 3 — high prevalence (≥20%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "not_tested", children: "Not tested" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Salmonella NCP Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourceSalmonellaNotes, onChange: (e2) => setForm((f) => ({ ...f, sourceSalmonellaNotes: e2.target.value })), placeholder: "e.g. Source flock most recent NCP result June 2026 Category 1…" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRec(null);
          setForm({ ...emptyForm });
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.isolationStartDate || createMut.isPending || updateMut.isPending, onClick: () => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form), children: createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Create Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o2) => {
      if (!o2) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Isolation Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This will permanently delete this isolation record and all associated health checks." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: hcOpen !== null, onOpenChange: (o2) => {
      if (!o2) {
        setHcOpen(null);
        createHcMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Daily Health Check" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Check Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: hcForm.checkDate, onChange: (e2) => setHcForm((f) => ({ ...f, checkDate: e2.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Checked By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: hcForm.checkedBy, onChange: (v) => setHcForm((f) => ({ ...f, checkedBy: v })), staffNames: isoStaffNames, loading: isoMembersLoading })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Health Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background", value: hcForm.healthStatus, onChange: (e2) => setHcForm((f) => ({ ...f, healthStatus: e2.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "satisfactory", children: "Satisfactory" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "monitoring", children: "Monitoring Required" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "poor", children: "Poor — Vet Notified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "clear", children: "Clear — Released" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: hcForm.temperatureCelsius, onChange: (e2) => setHcForm((f) => ({ ...f, temperatureCelsius: e2.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: hcForm.notes, onChange: (e2) => setHcForm((f) => ({ ...f, notes: e2.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: hcForm.actionTaken, onChange: (e2) => setHcForm((f) => ({ ...f, actionTaken: e2.target.value })), placeholder: "e.g. Vet called, medication administered" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createHcMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setHcOpen(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !hcForm.checkDate || createHcMut.isPending, onClick: () => hcOpen !== null && createHcMut.mutate({ recId: hcOpen, b: hcForm }), children: createHcMut.isPending ? "Saving…" : "Add Health Check" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteHcId !== null, onOpenChange: (o2) => {
      if (!o2) {
        setDeleteHcId(null);
        deleteHcMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Health Check" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Permanently delete this health check entry?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteHcMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteHcId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteHcMut.isPending, onClick: () => deleteHcId && deleteHcMut.mutate(deleteHcId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function LivestockFarmSettingsChecklist({ farmId }) {
  const { farmRecord, isLoading } = useFarmMeta(farmId);
  const [, navigate] = useLocation();
  if (isLoading) return null;
  const hasAnyMark = !!farmRecord?.herdMark && String(farmRecord.herdMark).trim() !== "" || !!farmRecord?.flockMark && String(farmRecord.flockMark).trim() !== "" || !!farmRecord?.pigHerdMark && String(farmRecord.pigHerdMark).trim() !== "";
  const fields = [
    { label: "CPH Number", filled: !!farmRecord?.cphNumber && String(farmRecord.cphNumber).trim() !== "" },
    { label: "SBI Number", filled: !!farmRecord?.sbiNumber && String(farmRecord.sbiNumber).trim() !== "" },
    { label: "Herd / Flock Mark", filled: hasAnyMark }
  ];
  const missingCount = fields.filter((f) => !f.filled).length;
  const allComplete = missingCount === 0;
  if (allComplete) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 shrink-0 text-green-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Farm Settings complete" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "— CPH, SBI and herd/flock marks are all filled in." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800", children: "Farm Settings incomplete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-0.5", children: [
          missingCount,
          " field",
          missingCount === 1 ? "" : "s",
          " below ",
          missingCount === 1 ? "is" : "are",
          " missing — your printed livestock reports and movement submissions will have blank header fields."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
      f.filled ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 shrink-0 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 shrink-0 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: f.filled ? "text-green-800" : "text-amber-800", children: f.label }),
      !f.filled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "ml-auto text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium whitespace-nowrap",
          onClick: () => navigate("/settings/farm"),
          children: "Add →"
        }
      )
    ] }, f.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 pt-2.5 border-t border-amber-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium",
        onClick: () => navigate("/settings/farm"),
        children: "Open Farm Settings →"
      }
    ) })
  ] });
}
const LIVESTOCK_TAB_IDS = ["herds", "vet-plans", "mortality", "contractors", "feed", "water", "animals", "ai-repro", "vet-rx", "sires", "straws", "lambing", "tb-tests", "welfare-outcomes", "sheep-dipping", "bvd", "casualty-slaughter", "isolation", "analytics"];
function LivestockPage() {
  const { farmId } = useAppStore();
  const farmName = useFarmName(farmId ?? 0);
  const [tab, setTab] = usePersistedTab({ page: "livestock", farmId, validIds: LIVESTOCK_TAB_IDS, defaultTab: "herds", urlOverride: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Herds & Animals", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LivestockFarmSettingsChecklist, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "herds", onClick: () => setTab("herds"), children: "Herds & Flocks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "animals", onClick: () => setTab("animals"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }),
        " Individual Animals"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "vet-plans", onClick: () => setTab("vet-plans"), children: "Vet Health Plans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mortality", onClick: () => setTab("mortality"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
        " Mortality"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "contractors", onClick: () => setTab("contractors"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3.5 w-3.5" }),
        " Fallen Stock Collectors"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "feed", onClick: () => setTab("feed"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5" }),
        " Feed Records"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "water", onClick: () => setTab("water"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "h-3.5 w-3.5" }),
        " Water Quality"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "sires", onClick: () => setTab("sires"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }),
        " Sires & Rams"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "straws", onClick: () => setTab("straws"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3.5 w-3.5" }),
        " Straw Inventory"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "ai-repro", onClick: () => setTab("ai-repro"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "h-3.5 w-3.5" }),
        " AI & Reproduction"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "vet-rx", onClick: () => setTab("vet-rx"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
        " Health Register"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "lambing", onClick: () => setTab("lambing"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }),
        " Lambing Records"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tb-tests", onClick: () => setTab("tb-tests"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-3.5 w-3.5" }),
        " TB Tests"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "welfare-outcomes", onClick: () => setTab("welfare-outcomes"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
        " Welfare Outcomes"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "sheep-dipping", onClick: () => setTab("sheep-dipping"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3.5 w-3.5" }),
        " Sheep Dipping"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "bvd", onClick: () => setTab("bvd"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
        " BVD Testing"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "casualty-slaughter", onClick: () => setTab("casualty-slaughter"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
        " Casualty Slaughter"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "isolation", onClick: () => setTab("isolation"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-3.5 w-3.5" }),
        " Isolation Register"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-3.5 w-3.5" }),
        " Analytics"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ErrorBoundary, { children: [
      tab === "herds" && /* @__PURE__ */ jsxRuntimeExports.jsx(HerdsSection, { farmId }),
      tab === "animals" && /* @__PURE__ */ jsxRuntimeExports.jsx(AnimalsSection, { farmId, farmName }),
      tab === "vet-plans" && /* @__PURE__ */ jsxRuntimeExports.jsx(VetHealthPlansSection, { farmId }),
      tab === "mortality" && /* @__PURE__ */ jsxRuntimeExports.jsx(MortalitySection, { farmId }),
      tab === "contractors" && /* @__PURE__ */ jsxRuntimeExports.jsx(FallenStockContractorsSection, { farmId }),
      tab === "feed" && /* @__PURE__ */ jsxRuntimeExports.jsx(FeedSection, { farmId }),
      tab === "water" && /* @__PURE__ */ jsxRuntimeExports.jsx(WaterSection, { farmId }),
      tab === "sires" && /* @__PURE__ */ jsxRuntimeExports.jsx(SiresSection, { farmId }),
      tab === "straws" && /* @__PURE__ */ jsxRuntimeExports.jsx(StrawInventorySection, { farmId }),
      tab === "ai-repro" && /* @__PURE__ */ jsxRuntimeExports.jsx(AIReproductionSection, { farmId }),
      tab === "vet-rx" && /* @__PURE__ */ jsxRuntimeExports.jsx(VetPrescriptionsSection, { farmId }),
      tab === "lambing" && /* @__PURE__ */ jsxRuntimeExports.jsx(LambingSection, { farmId }),
      tab === "tb-tests" && /* @__PURE__ */ jsxRuntimeExports.jsx(TbTestsSection, { farmId }),
      tab === "welfare-outcomes" && /* @__PURE__ */ jsxRuntimeExports.jsx(WelfareOutcomeSection, { farmId }),
      tab === "sheep-dipping" && /* @__PURE__ */ jsxRuntimeExports.jsx(SheepDippingSection, { farmId }),
      tab === "bvd" && /* @__PURE__ */ jsxRuntimeExports.jsx(BvdTestingSection, { farmId }),
      tab === "casualty-slaughter" && /* @__PURE__ */ jsxRuntimeExports.jsx(CasualtySlaughterSection, { farmId }),
      tab === "isolation" && /* @__PURE__ */ jsxRuntimeExports.jsx(IsolationRegisterSection, { farmId }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(LivestockAnalyticsSection, { farmId })
    ] }, tab)
  ] });
}
export {
  AIReproductionSection,
  e as ANIMAL_SPECIES_FALLBACK,
  g as ANIMAL_STATUS_LABELS,
  AnimalsSection,
  BvdTestingSection,
  CasualtySlaughterSection,
  ConfirmDialog,
  D as DOC_TYPE_LABELS,
  E as EMPTY_ANIMAL,
  h as EMPTY_HERD,
  i as EMPTY_PLAN,
  j as EMPTY_SIRE,
  k as EMPTY_STRAW,
  FallenStockContractorsSection,
  FeedSection,
  HerdsSection,
  IsolationRegisterSection,
  LambingSection,
  LivestockAnalyticsSection,
  l as MOVEMENT_TYPE_LABELS,
  O as OUTCOME_COLOURS,
  P as PRODUCTION_TYPE_OPTIONS,
  m as PrintHerdRegisterDialog,
  n as PrintVetPlanDialog,
  SheepDippingSection,
  SiresSection,
  StrawInventorySection,
  TbTestsSection,
  VetHealthPlansSection,
  VetPrescriptionsSection,
  WaterSection,
  WelfareOutcomeSection,
  LivestockPage as default,
  formatDate,
  o as formatDateLong,
  p as getBreedPlaceholder,
  q as getHerdNamePlaceholder,
  r as getHerdNumberConfig
};
