import { q as createLucideIcon, t as useQueryClient, a as useToast, l as useQuery, r as reactExports, O as useMutation, j as jsxRuntimeExports, I as Input, c as Button, S as Plus, d as LoaderCircle, m as Card, n as CardContent, A as ArrowRight, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, L as Label, b as useAppStore, R as Redirect, T as FlaskConical, aH as ErrorBoundary } from "./index-CWw2Qz61.js";
import { h as herdSpeciesDisplayLabel, a as herdProductionSubtype, c as canonicalHerdSpecies } from "./herd-utils-DXn3XBS9.js";
import { T as Textarea } from "./textarea-C8_SNMsn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-RH9EwhCY.js";
import { R as RecordAttachments } from "./RecordAttachments-cgTK5hVH.js";
import { T as TriangleAlert } from "./triangle-alert-BDIRV7aS.js";
import { F as FileText, D as Droplets, C as ClipboardCheck } from "./shield-alert-BcnR_qEf.js";
import { S as Search } from "./search-DSkWuQli.js";
import { P as Paperclip } from "./paperclip-ByMJPHRP.js";
import { E as Eye } from "./eye-gWF_NYyd.js";
import { P as Pencil } from "./pencil-BPV9arK-.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-zMQMXMGm.js";
import { C as CircleCheck } from "./circle-check-DdPEPpVR.js";
import { u as useLookupStrings } from "./use-lookup-Dj2B2KtI.js";
import { A as AppLayout, c as ClipboardList, j as Truck, q as Stethoscope, e as ChartColumn, B as BookOpen, R as RotateCcw } from "./AppLayout-D4p0bzId.js";
import { T as TabBar, a as TabButton } from "./tab-button-BgM1mi9e.js";
import { Q as QrCode, a as QRCodeSVG } from "./index-vq9yrbk4.js";
import { u as useUpload } from "./use-upload-DBMmPof3.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BMd2jQ1q.js";
import { o as openPrintWindow, p as printProReport, b as buildProReport } from "./print-report-B_FwCCVJ.js";
import { L as LabSelector } from "./LabSelector-ZX6IWjz6.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-DGvIFMpg.js";
import { S as StaffSelect } from "./staff-select-Dt2DbGt6.js";
import { P as Package } from "./use-safe-clerk-_9MiQewE.js";
import { P as Printer } from "./printer-BqDqLzfz.js";
import { C as CircleX } from "./circle-x-AN45B6rV.js";
import { U as Upload } from "./upload-DKiD63QH.js";
import { F as FileDown } from "./file-down-BOpaDiIu.js";
import { C as ChevronUp } from "./chevron-up-Bu4de0Tz.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell } from "./generateCategoricalChart-C2RfSpef.js";
import { B as BarChart } from "./BarChart-xK0747gO.js";
import { C as CartesianGrid } from "./CartesianGrid-BUW5h8CA.js";
import { P as PieChart, a as Pie } from "./PieChart-CCSBa1qQ.js";
import { S as Syringe } from "./syringe-Bfjo-nE0.js";
import { a as Clock } from "./database-C_82qXsX.js";
const __iconNode = [
  ["path", { d: "M13 5h8", key: "a7qcls" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 19h8", key: "c3s6r1" }],
  ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
  ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }]
];
const ListChecks = createLucideIcon("list-checks", __iconNode);
const CAUSE_LABELS = {
  disease: "Disease / Illness",
  injury: "Injury / Trauma",
  metabolic: "Metabolic Disorder",
  "difficult-birth": "Difficult Birth",
  hypothermia: "Hypothermia / Exposure",
  predation: "Predation",
  accidental: "Accidental",
  euthanised: "Euthanised",
  unknown: "Unknown / Sudden Death",
  other: "Other"
};
const DISPOSAL_LABELS = {
  nfas: "Fallen Stock (NFAS)",
  "hunt-kennel": "Hunt Kennel / Knacker",
  incineration: "Incineration / Cremation",
  "burial-licensed": "On-farm Burial",
  rendering: "Rendering Plant",
  other: "Other"
};
const CONTRACTOR_TYPES$1 = {
  "nfas-collector": "NFAS Fallen Stock Collector",
  "hunt-kennel": "Hunt Kennel",
  "knacker": "Knacker / Slaughterer",
  "rendering": "Rendering Plant",
  "incinerator": "Licensed Incinerator",
  "other": "Other"
};
const STATUS_CONFIG = {
  reported: { label: "Awaiting Disposal", color: "bg-orange-50 text-orange-700 border-orange-200", step: 1 },
  disposal_arranged: { label: "Disposal Arranged", color: "bg-amber-50 text-amber-700 border-amber-200", step: 2 },
  disposed: { label: "Collected", color: "bg-blue-50 text-blue-700 border-blue-200", step: 3 },
  closed: { label: "Closed", color: "bg-green-50 text-green-700 border-green-200", step: 4 }
};
const STAGE_LABELS = ["Death Reported", "Disposal Arranged", "Collected", "Closed"];
({
  dateOfDeath: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
});
function formatDate$1(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.reported;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`, children: cfg.label });
}
function RecordStepper({ status }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start gap-0 mb-5", children: STAGE_LABELS.map((label, i) => {
    const step = i + 1;
    const done = step < currentStep;
    const active = step === currentStep;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2
                ${done ? "bg-green-500 border-green-500 text-white" : active ? "bg-primary border-primary text-primary-foreground" : "bg-white border-gray-300 text-gray-400"}`, children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }) : step }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs mt-1 text-center leading-tight max-w-[60px]
                ${active ? "font-semibold text-primary" : done ? "text-green-600" : "text-gray-400"}`, children: label })
      ] }),
      i < STAGE_LABELS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-0.5 flex-1 mx-1 mt-3 ${done ? "bg-green-400" : "bg-gray-200"}` })
    ] }, label);
  }) });
}
function ArrangeDisposalDialog({ farmId, record, contractors, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/mortality-records`;
  const [contractorId, setContractorId] = reactExports.useState(record.contractorId ? String(record.contractorId) : "");
  const [disposalOperator, setDisposalOperator] = reactExports.useState(record.disposalOperator ?? "");
  const [bcmsNotified, setBcmsNotified] = reactExports.useState(record.bcmsNotified);
  const [bcmsNotificationRef, setBcmsNotificationRef] = reactExports.useState(record.bcmsNotificationRef ?? "");
  const isCattle = record.species?.toLowerCase().includes("cattle") || record.species?.toLowerCase().includes("bovine");
  const selectedContractor = contractors.find((c) => String(c.id) === contractorId);
  function handleContractorSelect(v) {
    if (v === "__none__") {
      setContractorId("");
      setDisposalOperator("");
      return;
    }
    const c = contractors.find((x) => String(x.id) === v);
    if (c) {
      setContractorId(v);
      setDisposalOperator(c.name);
    }
  }
  const mut = useMutation({
    mutationFn: () => fetch(`${base}/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractorId: contractorId ? Number(contractorId) : null,
        disposalOperator: disposalOperator || null,
        bcmsNotified,
        bcmsNotificationRef: bcmsNotificationRef || null,
        status: "disposal_arranged"
      })
    }).then((r) => {
      if (!r.ok) throw new Error("Failed");
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortality", farmId] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 text-amber-600" }),
        " Arrange Disposal"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Step 2 of 4 — confirm disposal contractor and statutory notification." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RecordStepper, { status: "disposal_arranged" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Contractor / Operator" }),
        contractors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: contractorId || "__none__", onValueChange: handleContractorSelect, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select registered contractor…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not yet selected —" }),
            contractors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
              c.name,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                "(",
                CONTRACTOR_TYPES$1[c.operatorType] ?? c.operatorType,
                ")"
              ] })
            ] }, c.id))
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: disposalOperator, onChange: (e) => setDisposalOperator(e.target.value), placeholder: "Operator name" }),
        selectedContractor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 rounded bg-purple-50 border border-purple-100 px-3 py-2 text-xs text-purple-800 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-purple-600 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "APHA Approval No: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: selectedContractor.approvalNumber })
          ] }),
          selectedContractor.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· ",
            selectedContractor.phone
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-lg p-3 space-y-2 ${isCattle ? "bg-amber-50/60 border-amber-200" : "bg-gray-50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-600", children: isCattle ? "BCMS Notification — Required for Cattle" : "Statutory Notification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: bcmsNotified, onChange: (e) => setBcmsNotified(e.target.checked), className: "rounded" }),
          isCattle ? "Notified to BCMS within 7 days of death" : "Other statutory notification completed"
        ] }),
        !bcmsNotified && isCattle && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
          " Cattle deaths must be reported to BCMS within 7 days."
        ] }),
        bcmsNotified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: isCattle ? "BCMS Notification Reference" : "Notification Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: bcmsNotificationRef, onChange: (e) => setBcmsNotificationRef(e.target.value), placeholder: isCattle ? "BCMS submission reference" : "Notification reference" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending, children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
        " Saving…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Mark Disposal Arranged ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
      ] }) })
    ] })
  ] }) });
}
function LogCollectionDialog({ farmId, record, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/mortality-records`;
  const [disposalRef, setDisposalRef] = reactExports.useState(record.disposalRef ?? "");
  const mut = useMutation({
    mutationFn: () => fetch(`${base}/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disposalRef: disposalRef || null, status: "disposed" })
    }).then((r) => {
      if (!r.ok) throw new Error("Failed");
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortality", farmId] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const contractorLabel = record.contractorName || record.disposalOperator || "Contractor";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 text-blue-600" }),
        " Log Collection"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Step 3 of 4 — record the collection reference from the contractor." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RecordStepper, { status: "disposed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: contractorLabel }),
        " has collected the animal. Record the reference number from the collection note or NFAS certificate."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Reference / Collection Certificate No." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            className: "mt-1",
            value: disposalRef,
            onChange: (e) => setDisposalRef(e.target.value),
            placeholder: "e.g. NFAS-2024-00412 or collection note ref",
            autoFocus: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "This is the NFAS certificate, knacker's receipt, or collection note reference. Required for Red Tractor and organic inspections." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || !disposalRef.trim(), children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
        " Saving…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Mark Collected ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
      ] }) })
    ] })
  ] }) });
}
function CloseRecordDialog({ farmId, record, vetOptions, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/mortality-records`;
  const [veterinaryAttended, setVeterinaryAttended] = reactExports.useState(record.veterinaryAttended);
  const [vetName, setVetName] = reactExports.useState(record.vetName ?? "");
  const [useOtherVet, setUseOtherVet] = reactExports.useState(false);
  const [postMortemCarriedOut, setPostMortemCarriedOut] = reactExports.useState(record.postMortemCarriedOut);
  const [postMortemFindings, setPostMortemFindings] = reactExports.useState(record.postMortemFindings ?? "");
  const [invoiceStatus, setInvoiceStatus] = reactExports.useState(record.invoiceStatus ?? "none");
  const [invoiceRef, setInvoiceRef] = reactExports.useState(record.invoiceRef ?? "");
  const [invoiceAmount, setInvoiceAmount] = reactExports.useState(record.invoiceAmount ?? "");
  const [invoicePaidDate, setInvoicePaidDate] = reactExports.useState(record.invoicePaidDate ?? "");
  const mut = useMutation({
    mutationFn: () => fetch(`${base}/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        veterinaryAttended,
        vetName: vetName || null,
        postMortemCarriedOut,
        postMortemFindings: postMortemFindings || null,
        invoiceStatus,
        invoiceRef: invoiceRef || null,
        invoiceAmount: invoiceAmount || null,
        invoicePaidDate: invoicePaidDate || null,
        status: "closed"
      })
    }).then((r) => {
      if (!r.ok) throw new Error("Failed");
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortality", farmId] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600" }),
        " Close Record"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Step 4 of 4 — record vet/post-mortem findings and invoice status." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RecordStepper, { status: "closed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 space-y-3 bg-slate-50/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700", children: "Veterinary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: veterinaryAttended, onChange: (e) => setVeterinaryAttended(e.target.checked), className: "rounded" }),
            "Vet attended"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: postMortemCarriedOut, onChange: (e) => setPostMortemCarriedOut(e.target.checked), className: "rounded" }),
            "Post-mortem carried out"
          ] })
        ] }),
        veterinaryAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Attending Vet / Practice" }),
          vetOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: !useOtherVet && vetOptions.find((v) => v.value === vetName) ? vetName : useOtherVet ? "__other__" : "__none__",
                onValueChange: (v) => {
                  if (v === "__none__") {
                    setUseOtherVet(false);
                    setVetName("");
                  } else if (v === "__other__") {
                    setUseOtherVet(true);
                    setVetName("");
                  } else {
                    setUseOtherVet(false);
                    setVetName(v);
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select vet —" }),
                    vetOptions.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v.value, children: v.label }, v.value)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / manual entry…" })
                  ] })
                ]
              }
            ),
            useOtherVet && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: vetName, onChange: (e) => setVetName(e.target.value), placeholder: "e.g. Mr A. Jones BVSc — Shire Vets", autoFocus: true })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: vetName, onChange: (e) => setVetName(e.target.value), placeholder: "Vet name / practice" })
        ] }),
        postMortemCarriedOut && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Post-mortem Findings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", value: postMortemFindings, onChange: (e) => setPostMortemFindings(e.target.value), placeholder: "Summary of PM findings…", rows: 2 })
        ] }),
        !veterinaryAttended && !postMortemCarriedOut && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "Tick above if a vet attended or a post-mortem was carried out." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700", children: "Collection Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Invoice status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: invoiceStatus, onValueChange: setInvoiceStatus, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No invoice expected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "awaiting", children: "Awaiting invoice from collector" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Invoice received — payment pending" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Invoice received and paid" })
            ] })
          ] })
        ] }),
        invoiceStatus !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Invoice reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: invoiceRef, onChange: (e) => setInvoiceRef(e.target.value), placeholder: "e.g. INV-2024-0041" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: invoiceAmount, onChange: (e) => setInvoiceAmount(e.target.value), placeholder: "e.g. 45.00" })
          ] }),
          invoiceStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: invoicePaidDate, onChange: (e) => setInvoicePaidDate(e.target.value) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending, className: "bg-green-600 hover:bg-green-700", children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
        " Saving…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 mr-1" }),
        " Close Record"
      ] }) })
    ] })
  ] }) });
}
const EMPTY_FULL = {
  animalId: "",
  contractorId: "",
  tagNumber: "",
  species: "",
  breed: "",
  dateOfDeath: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  causeOfDeath: "",
  disposalMethod: "",
  disposalOperator: "",
  disposalRef: "",
  veterinaryAttended: false,
  vetName: "",
  postMortemCarriedOut: false,
  postMortemFindings: "",
  bcmsNotified: false,
  bcmsNotificationRef: "",
  notes: "",
  invoiceStatus: "none",
  invoiceRef: "",
  invoiceAmount: "",
  invoicePaidDate: "",
  status: "reported"
};
function MortalitySection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/mortality-records`;
  const { data, isLoading } = useQuery({
    queryKey: ["mortality", farmId],
    queryFn: () => fetch(base).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const { data: animalsData } = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then((r) => r.json())
  });
  const activeAnimals = (animalsData?.records ?? []).filter((a) => a.status === "active");
  const { data: contractorsRaw = [] } = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then((r) => r.json())
  });
  const activeContractors = Array.isArray(contractorsRaw) ? contractorsRaw.filter((c) => c.isActive) : [];
  const { data: vetPlansData } = useQuery({
    queryKey: ["mortality-vet-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-health-plans`).then((r) => r.json()).then((d) => d.records ?? [])
  });
  const vetPlans = Array.isArray(vetPlansData) ? vetPlansData : [];
  const knownVets = vetPlans.reduce((acc, p) => {
    const value = [p.vetName, p.practiceName].filter(Boolean).join(" — ");
    if (!acc.find((v) => v.value === value)) acc.push({ label: value + (p.practicePhone ? ` · ${p.practicePhone}` : ""), value });
    return acc;
  }, []);
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const attachMap = Object.fromEntries(
    attachCountsRaw.filter((c) => c.recordType === "mortality").map((c) => [c.recordId, c.count])
  );
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [arrangingDisposal, setArrangingDisposal] = reactExports.useState(null);
  const [loggingCollection, setLoggingCollection] = reactExports.useState(null);
  const [closingRecord, setClosingRecord] = reactExports.useState(null);
  const [showFullEdit, setShowFullEdit] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [fullForm, setFullForm] = reactExports.useState(EMPTY_FULL);
  const [useOtherVet, setUseOtherVet] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  function setField(k, v) {
    setFullForm((f) => ({ ...f, [k]: v }));
  }
  function openFullEdit(r) {
    setEditRecord(r);
    const existingVet = r.vetName ?? "";
    setUseOtherVet(existingVet !== "" && !knownVets.some((v) => v.value === existingVet));
    setFullForm({
      animalId: r.animalId ? String(r.animalId) : "",
      contractorId: r.contractorId ? String(r.contractorId) : "",
      tagNumber: r.tagNumber ?? "",
      species: r.species,
      breed: r.breed ?? "",
      dateOfDeath: r.dateOfDeath?.slice(0, 10) ?? "",
      causeOfDeath: r.causeOfDeath,
      disposalMethod: r.disposalMethod,
      disposalOperator: r.disposalOperator ?? "",
      disposalRef: r.disposalRef ?? "",
      veterinaryAttended: r.veterinaryAttended,
      vetName: existingVet,
      postMortemCarriedOut: r.postMortemCarriedOut,
      postMortemFindings: r.postMortemFindings ?? "",
      bcmsNotified: r.bcmsNotified,
      bcmsNotificationRef: r.bcmsNotificationRef ?? "",
      notes: r.notes ?? "",
      invoiceStatus: r.invoiceStatus ?? "none",
      invoiceRef: r.invoiceRef ?? "",
      invoiceAmount: r.invoiceAmount ?? "",
      invoicePaidDate: r.invoicePaidDate ?? "",
      status: r.status ?? "reported"
    });
    setShowFullEdit(true);
  }
  function openNewRecord() {
    setEditRecord(null);
    setFullForm({ ...EMPTY_FULL, dateOfDeath: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setUseOtherVet(false);
    setShowFullEdit(true);
  }
  function handleAnimalSelect(animalId) {
    const a = activeAnimals.find((x) => String(x.id) === animalId);
    if (a) setFullForm((f) => ({ ...f, animalId, tagNumber: a.earTagNumber ?? a.tagNumber ?? "", species: a.species, breed: a.breed ?? "" }));
  }
  function handleContractorSelect(contractorId) {
    if (contractorId === "__none__") {
      setFullForm((f) => ({ ...f, contractorId: "", disposalOperator: "" }));
      return;
    }
    const c = activeContractors.find((x) => String(x.id) === contractorId);
    if (c) setFullForm((f) => ({ ...f, contractorId, disposalOperator: c.name }));
  }
  const createMut = useMutation({
    mutationFn: (body) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortality", farmId] });
      qc.invalidateQueries({ queryKey: ["animals", farmId] });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
      setShowFullEdit(false);
      setFullForm(EMPTY_FULL);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortality", farmId] });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
      setEditRecord(null);
      setShowFullEdit(false);
      setFullForm(EMPTY_FULL);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortality", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function handleFullSubmit(e) {
    e.preventDefault();
    if (!fullForm.animalId) return;
    if (editRecord) updateMut.mutate({ ...fullForm, id: editRecord.id });
    else createMut.mutate(fullForm);
  }
  const selectedContractor = activeContractors.find((c) => String(c.id) === fullForm.contractorId);
  const selectedAnimal = activeAnimals.find((a) => String(a.id) === fullForm.animalId) ?? null;
  const awaitingDisposal = records.filter((r) => r.status === "reported").length;
  const awaitingCollection = records.filter((r) => r.status === "disposal_arranged").length;
  const awaitingCloseOut = records.filter((r) => r.status === "disposed").length;
  const [yearFilterMort, setYearFilterMort] = reactExports.useState("all");
  const yearsMort = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.dateOfDeath ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filtered = records.filter((r) => {
    const matchesSearch = (r.tagNumber ?? "").toLowerCase().includes(search.toLowerCase()) || r.species.toLowerCase().includes(search.toLowerCase()) || r.causeOfDeath.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (yearFilterMort !== "all" && !String(r.dateOfDeath ?? "").startsWith(yearFilterMort)) return false;
    return true;
  });
  const STATUS_FILTER_TABS = [
    { key: "all", label: "All Records" },
    { key: "reported", label: "Awaiting Disposal", count: awaitingDisposal },
    { key: "disposal_arranged", label: "Disposal Arranged", count: awaitingCollection },
    { key: "disposed", label: "Collected", count: awaitingCloseOut },
    { key: "closed", label: "Closed" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    awaitingDisposal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4 text-sm text-orange-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          awaitingDisposal,
          " record",
          awaitingDisposal > 1 ? "s" : "",
          " awaiting disposal"
        ] }),
        " — arrange collection immediately. Cattle deaths must be notified to BCMS within 7 days."
      ] })
    ] }),
    awaitingCollection > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
        awaitingCollection,
        " record",
        awaitingCollection > 1 ? "s" : "",
        " awaiting contractor collection"
      ] }),
      " — log the disposal reference when the contractor collects."
    ] }),
    awaitingCloseOut > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
        awaitingCloseOut,
        " collected record",
        awaitingCloseOut > 1 ? "s" : "",
        " awaiting close-out"
      ] }),
      " — record vet findings and invoice details to close."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by tag, species or cause…", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterMort, onValueChange: setYearFilterMort, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsMort.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNewRecord, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Report Death"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal requirement:" }),
      " Keep mortality records for a minimum of 3 years. Cattle deaths must be notified to BCMS within 7 days. Retain disposal certificates."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mb-4", children: STATUS_FILTER_TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setStatusFilter(t.key),
        className: `text-xs px-3 py-1.5 rounded-full border font-medium transition-all
              ${statusFilter === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`,
        children: [
          t.label,
          t.count !== void 0 && t.count > 0 ? ` (${t.count})` : ""
        ]
      },
      t.key
    )) }),
    !isLoading && filtered.length > 0 && (() => {
      const bySp = {};
      filtered.forEach((r) => {
        bySp[r.species] = (bySp[r.species] || 0) + 1;
      });
      const spRows = Object.entries(bySp).sort((a, b) => b[1] - a[1]);
      const totalCost = filtered.reduce((s, r) => s + (r.invoiceAmount ? parseFloat(String(r.invoiceAmount)) : 0), 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "flex-start" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Deaths (filtered)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }, children: filtered.length })
        ] }),
        spRows.map(([sp, n]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 16px", minWidth: 100 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "capitalize", color: "#c2410c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: sp }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#9a3412", lineHeight: 1, margin: 0 }, children: n })
        ] }, sp)),
        totalCost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Disposal Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: [
            "£",
            totalCost.toFixed(2)
          ] })
        ] })
      ] });
    })(),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: search || statusFilter !== "all" ? "No matching records found." : "No mortality records yet." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Tag / Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Cause" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Next Action" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs whitespace-nowrap", children: formatDate$1(r.dateOfDeath) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: r.tagNumber || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "No tag" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground capitalize", children: [
            r.species,
            r.breed ? ` · ${r.breed}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: CAUSE_LABELS[r.causeOfDeath] ?? r.causeOfDeath }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.status ?? "reported" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          r.status === "reported" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-amber-700 border-amber-300 hover:bg-amber-50 h-7 text-xs", onClick: () => setArrangingDisposal(r), children: [
            "Arrange Disposal ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3 ml-1" })
          ] }),
          r.status === "disposal_arranged" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-blue-700 border-blue-300 hover:bg-blue-50 h-7 text-xs", onClick: () => setLoggingCollection(r), children: [
            "Log Collection ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3 ml-1" })
          ] }),
          r.status === "disposed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-green-700 border-green-300 hover:bg-green-50 h-7 text-xs", onClick: () => setClosingRecord(r), children: [
            "Close Record ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3 ml-1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          (attachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
            attachMap[r.id]
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openFullEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mortality Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordStepper, { status: viewRecord.status ?? "reported" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 space-y-2 bg-gray-50/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Stage 1 — Death Reported" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Date of Death" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate$1(viewRecord.dateOfDeath) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Tag Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.tagNumber || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Species / Breed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "capitalize", children: [
                viewRecord.species,
                viewRecord.breed ? ` — ${viewRecord.breed}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Cause of Death" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: CAUSE_LABELS[viewRecord.causeOfDeath] ?? viewRecord.causeOfDeath })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Planned Disposal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: DISPOSAL_LABELS[viewRecord.disposalMethod] ?? viewRecord.disposalMethod ?? "—" })
            ] }),
            viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewRecord.notes })
            ] })
          ] })
        ] }),
        ["disposal_arranged", "disposed", "closed"].includes(viewRecord.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 space-y-2 bg-amber-50/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Stage 2 — Disposal Arranged" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Contractor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.contractorName || viewRecord.disposalOperator || "—" })
            ] }),
            viewRecord.contractorApprovalNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "APHA Approval No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.contractorApprovalNumber })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "BCMS Notified" }),
              viewRecord.bcmsNotified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-green-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                " Yes",
                viewRecord.bcmsNotificationRef ? ` — ${viewRecord.bcmsNotificationRef}` : ""
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400", children: "Not notified" })
            ] })
          ] })
        ] }),
        ["disposed", "closed"].includes(viewRecord.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 space-y-2 bg-blue-50/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Stage 3 — Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Disposal Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.disposalRef || "—" })
          ] }) })
        ] }),
        viewRecord.status === "closed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 space-y-2 bg-green-50/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Stage 4 — Closed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Vet Attended" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.veterinaryAttended ? viewRecord.vetName || "Yes" : "No" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Post-mortem" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.postMortemCarriedOut ? "Yes" : "No" })
            ] }),
            viewRecord.postMortemFindings && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "PM Findings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.postMortemFindings })
            ] }),
            viewRecord.invoiceStatus !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Invoice" }),
                viewRecord.invoiceStatus === "awaiting" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-700", children: "Awaiting" }),
                viewRecord.invoiceStatus === "received" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-blue-700", children: "Received" }),
                viewRecord.invoiceStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-700", children: "Paid" })
              ] }),
              viewRecord.invoiceRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Invoice Ref" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.invoiceRef })
              ] }),
              viewRecord.invoiceAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-0.5", children: "Amount" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "£",
                  viewRecord.invoiceAmount
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "mortality", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        viewRecord.status !== "closed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "default", size: "sm", onClick: () => {
          if (viewRecord.status === "reported") {
            setArrangingDisposal(viewRecord);
            setViewRecord(null);
          } else if (viewRecord.status === "disposal_arranged") {
            setLoggingCollection(viewRecord);
            setViewRecord(null);
          } else if (viewRecord.status === "disposed") {
            setClosingRecord(viewRecord);
            setViewRecord(null);
          }
        }, children: [
          viewRecord.status === "reported" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Arrange Disposal ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 ml-1" })
          ] }),
          viewRecord.status === "disposal_arranged" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Log Collection ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 ml-1" })
          ] }),
          viewRecord.status === "disposed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Close Record ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 ml-1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openFullEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    showFullEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowFullEdit(false);
        setEditRecord(null);
        setUseOtherVet(false);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Mortality Record" : "Report Animal Death" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Required for Red Tractor and BCMS compliance. Retain for 3 years." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleFullSubmit, className: "space-y-4 mt-2 max-h-[75vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Animal from Register ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          activeAnimals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800 flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 mt-0.5 shrink-0" }),
            "No active animals registered. Add animals in the Individual Animals tab first."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fullForm.animalId || "__unset__", onValueChange: handleAnimalSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: !fullForm.animalId ? "border-red-300 mt-1" : "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select registered animal…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: activeAnimals.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(a.id), children: [
                a.earTagNumber ?? a.tagNumber ?? `#${a.id}`,
                " — ",
                a.species,
                a.breed ? ` (${a.breed})` : ""
              ] }, a.id)) })
            ] }),
            selectedAnimal && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              " Tag, species and breed auto-filled."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ear Tag / Tag Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullForm.tagNumber, readOnly: true, className: "bg-muted/40 text-muted-foreground mt-1", placeholder: "Auto-filled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullForm.species, readOnly: true, className: "bg-muted/40 text-muted-foreground mt-1 capitalize", placeholder: "Auto-filled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullForm.breed, readOnly: true, className: "bg-muted/40 text-muted-foreground mt-1", placeholder: "Auto-filled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date of Death *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fullForm.dateOfDeath, onChange: (e) => setField("dateOfDeath", e.target.value), required: true, className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cause of Death *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fullForm.causeOfDeath || void 0, onValueChange: (v) => setField("causeOfDeath", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select cause" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(CAUSE_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fullForm.disposalMethod || void 0, onValueChange: (v) => setField("disposalMethod", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(DISPOSAL_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Operator / Collector" }),
            activeContractors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fullForm.contractorId || "__none__", onValueChange: handleContractorSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select registered contractor…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select contractor —" }),
                activeContractors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                  c.name,
                  " (",
                  CONTRACTOR_TYPES$1[c.operatorType] ?? c.operatorType,
                  ")"
                ] }, c.id))
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullForm.disposalOperator, onChange: (e) => setField("disposalOperator", e.target.value), className: "mt-1", placeholder: "Operator name" }),
            selectedContractor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 rounded bg-purple-50 border border-purple-100 px-3 py-2 text-xs text-purple-800 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-purple-600 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "APHA Approval No: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: selectedContractor.approvalNumber })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Reference / Certificate No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullForm.disposalRef, onChange: (e) => setField("disposalRef", e.target.value), className: "mt-1", placeholder: "NFAS certificate no. or collection note ref" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: fullForm.veterinaryAttended, onChange: (e) => setField("veterinaryAttended", e.target.checked), className: "rounded" }),
            "Veterinary attended"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: fullForm.postMortemCarriedOut, onChange: (e) => setField("postMortemCarriedOut", e.target.checked), className: "rounded" }),
            "Post-mortem carried out"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: fullForm.bcmsNotified, onChange: (e) => setField("bcmsNotified", e.target.checked), className: "rounded" }),
            "BCMS notified"
          ] })
        ] }),
        fullForm.veterinaryAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Attending Vet / Practice" }),
          knownVets.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: !useOtherVet && knownVets.find((v) => v.value === fullForm.vetName) ? fullForm.vetName : useOtherVet ? "__other__" : "__none__",
                onValueChange: (v) => {
                  if (v === "__none__") {
                    setUseOtherVet(false);
                    setField("vetName", "");
                  } else if (v === "__other__") {
                    setUseOtherVet(true);
                    setField("vetName", "");
                  } else {
                    setUseOtherVet(false);
                    setField("vetName", v);
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from your vet register…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select vet —" }),
                    knownVets.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v.value, children: v.label }, v.value)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / manual entry…" })
                  ] })
                ]
              }
            ),
            useOtherVet && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: fullForm.vetName, onChange: (e) => setField("vetName", e.target.value), placeholder: "e.g. Mr A. Jones BVSc — Shire Vets" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullForm.vetName, onChange: (e) => setField("vetName", e.target.value), className: "mt-1", placeholder: "Vet name / practice" })
        ] }),
        fullForm.postMortemCarriedOut && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Post-mortem Findings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: fullForm.postMortemFindings, onChange: (e) => setField("postMortemFindings", e.target.value), className: "mt-1", rows: 2 })
        ] }),
        fullForm.bcmsNotified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BCMS Notification Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullForm.bcmsNotificationRef, onChange: (e) => setField("bcmsNotificationRef", e.target.value), className: "mt-1", placeholder: "BCMS submission reference" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: fullForm.notes, onChange: (e) => setField("notes", e.target.value), className: "mt-1", rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-slate-50 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700", children: "Collection Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Invoice status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fullForm.invoiceStatus, onValueChange: (v) => setField("invoiceStatus", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No invoice expected" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "awaiting", children: "Awaiting invoice from collector" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Invoice received — payment pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Invoice received and paid" })
              ] })
            ] })
          ] }),
          fullForm.invoiceStatus !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Invoice reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: fullForm.invoiceRef, onChange: (e) => setField("invoiceRef", e.target.value), placeholder: "e.g. INV-2024-0041" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Amount (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: fullForm.invoiceAmount, onChange: (e) => setField("invoiceAmount", e.target.value), placeholder: "e.g. 45.00" })
            ] }),
            fullForm.invoiceStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: fullForm.invoicePaidDate, onChange: (e) => setField("invoicePaidDate", e.target.value) })
            ] })
          ] })
        ] }),
        editRecord && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-slate-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Record Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fullForm.status, onValueChange: (v) => setField("status", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(STATUS_CONFIG).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v.label }, k)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Use the stage buttons in the table for normal workflow progression. Change status here only to correct an error." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setShowFullEdit(false);
            setEditRecord(null);
            setUseOtherVet(false);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createMut.isPending || updateMut.isPending || !fullForm.animalId, children: createMut.isPending || updateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
            " Saving…"
          ] }) : editRecord ? "Update Record" : "Save Record" })
        ] })
      ] })
    ] }) }),
    arrangingDisposal && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrangeDisposalDialog, { farmId, record: arrangingDisposal, contractors: activeContractors, onClose: () => setArrangingDisposal(null) }),
    loggingCollection && /* @__PURE__ */ jsxRuntimeExports.jsx(LogCollectionDialog, { farmId, record: loggingCollection, onClose: () => setLoggingCollection(null) }),
    closingRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(CloseRecordDialog, { farmId, record: closingRecord, vetOptions: knownVets, onClose: () => setClosingRecord(null) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Mortality Record?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Delete" })
      ] })
    ] }) })
  ] });
}
function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}
function formatDateLong(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return val;
  }
}
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: onConfirm, children: confirmLabel })
    ] })
  ] }) });
}
const PRODUCTION_TYPE_OPTIONS = {
  cattle: [
    { value: "dairy", label: "Dairy" },
    { value: "beef", label: "Beef" },
    { value: "suckler", label: "Suckler / Beef" },
    { value: "mixed", label: "Mixed (Beef & Dairy)" }
  ],
  sheep: [
    { value: "meat", label: "Meat / Lamb" },
    { value: "dairy", label: "Dairy" },
    { value: "wool", label: "Wool" },
    { value: "mixed", label: "Mixed" }
  ],
  pigs: [
    { value: "farrow-to-finish", label: "Farrow-to-Finish" },
    { value: "breeding", label: "Breeding / Sows" },
    { value: "finishing", label: "Finishing / Growing" },
    { value: "weaners", label: "Weaners" }
  ],
  goats: [
    { value: "dairy", label: "Dairy" },
    { value: "meat", label: "Meat / Fibre" },
    { value: "mixed", label: "Mixed" }
  ],
  poultry: [
    { value: "layers", label: "Layers (Eggs)" },
    { value: "broilers", label: "Broilers (Meat)" },
    { value: "breeders", label: "Breeders" },
    { value: "mixed", label: "Mixed" }
  ],
  deer: [
    { value: "venison", label: "Venison (Meat)" },
    { value: "breeding", label: "Breeding" },
    { value: "mixed", label: "Mixed" }
  ]
};
const EMPTY_SIRE = {
  name: "",
  species: "Cattle",
  breed: "",
  tagNumber: "",
  passportNumber: "",
  dateOfBirth: "",
  ownershipType: "owned",
  supplierName: "",
  supplierContact: "",
  hireStartDate: "",
  hireEndDate: "",
  returnDate: "",
  bvdStatus: "",
  fertilityTestDate: "",
  fertilityTestResult: "",
  scrapieGenotype: "",
  notes: ""
};
const EMPTY_STRAW = {
  sireRegisterId: "",
  sireName: "",
  sireBreed: "",
  sireSpecies: "Cattle",
  supplierName: "",
  batchNumber: "",
  strawsReceived: 0,
  storageLocation: "",
  deliveryDate: "",
  unitCostPence: "",
  notes: ""
};
const EMPTY_HERD = { name: "", type: "", productionType: "", breed: "", herdNumber: "", registrationDocumentUrl: "", registrationDocumentName: "", notes: "", isOrganicHerd: false, organicCertBody: "", organicCertNumber: "", organicConversionStartDate: "" };
const EMPTY_PLAN = {
  planYear: (/* @__PURE__ */ new Date()).getFullYear(),
  vetName: "",
  practiceName: "",
  practicePhone: "",
  practiceAddress: "",
  planDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  reviewDate: "",
  healthPriorities: "",
  vaccinationProtocol: "",
  biosecurityMeasures: "",
  wormingProtocol: "",
  flukeTreatment: "",
  mastitisPrevention: "",
  notes: ""
};
const EMPTY_ANIMAL = {
  herdId: "",
  earTagNumber: "",
  eidNumber: "",
  tagNumber: "",
  species: "",
  breed: "",
  sex: "",
  dateOfBirth: "",
  acquisitionDate: "",
  acquisitionSource: "",
  status: "active",
  notes: ""
};
function PrintHerdRegisterDialog({ farmId, herds, onClose }) {
  const { data: farmData } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json())
  });
  const farm = farmData?.record;
  const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const handleHerdPrint = () => {
    const rows = herds.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:#9ca3af;font-style:italic;padding:12px">No herds recorded</td></tr>` : herds.map((h) => `<tr>
          <td><strong>${h.name}</strong></td>
          <td>${h.type ? herdSpeciesDisplayLabel(h.type) + (herdProductionSubtype(h.type, h.productionType) ? ` (${herdProductionSubtype(h.type, h.productionType)})` : "") : "—"}</td>
          <td>${h.breed || "—"}</td>
          <td style="font-family:monospace">${h.herdNumber || "—"}</td>
          <td>${h.isActive ? "Active" : "Inactive"}</td>
          <td style="color:#6b7280">${h.notes || "—"}</td>
        </tr>`).join("");
    const tableHtml = `<table><thead><tr>
      <th>Name</th><th>Species</th><th>Breed</th><th>Herd / Flock No.</th><th>Status</th><th>Notes</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <p style="font-size:7px;color:#6b7280;margin:6px 0 0"><strong>${herds.length}</strong> herd${herds.length !== 1 ? "s" : ""} / flock${herds.length !== 1 ? "s" : ""} registered  ·  <strong>${herds.filter((h) => h.isActive).length}</strong> active</p>`;
    printProReport({
      title: "Herd & Flock Register",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      redTractorId: farm?.redTractorId ?? void 0,
      recordCount: herds.length,
      recordLabel: "herd / flock",
      tableHtml,
      landscape: false
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
          @media print {
            body > * { display: none !important; }
            [role="dialog"] { position: fixed; inset: 0; overflow: visible !important; }
            [role="dialog"] > * { display: none !important; }
            [role="dialog"] #livestock-herd-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
          }
        ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-5 h-5 text-green-600" }),
        "Herd & Flock Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Review the register below, then click Print to produce a compliance document for Red Tractor audit." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "livestock-herd-print-area", className: "border border-border rounded-lg p-6 space-y-5 text-sm mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start border-b pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-foreground", children: farm?.name ?? "Farm" }),
          farm?.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60", children: [
            farm.address,
            farm.postcode ? `, ${farm.postcode}` : ""
          ] }),
          farm?.cphNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60 mt-0.5", children: [
            "CPH: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: farm.cphNumber })
          ] }),
          farm?.redTractorId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60 mt-0.5", children: [
            "Red Tractor ID: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: farm.redTractorId })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-foreground/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm", children: "Herd & Flock Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Printed: ",
            printedDate
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs border-collapse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-green-50 text-foreground/70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Herd / Flock No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Notes" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: herds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "border border-border/60 px-3 py-4 text-center text-foreground/40 italic", children: "No herds recorded" }) }) : herds.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i % 2 === 0 ? "bg-white" : "bg-black/[0.02]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2 font-medium", children: h.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "border border-border/60 px-3 py-2", children: [
            h.type ? herdSpeciesDisplayLabel(h.type) : "—",
            h.type && herdProductionSubtype(h.type, h.productionType) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs text-muted-foreground", children: [
              "(",
              herdProductionSubtype(h.type, h.productionType),
              ")"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2", children: h.breed || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2 font-mono", children: h.herdNumber || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2", children: h.isActive ? "Active" : "Inactive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2 text-foreground/60", children: h.notes || "—" })
        ] }, h.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 pt-2 text-xs text-foreground/60 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: herds.length }),
          " herd",
          herds.length !== 1 ? "s" : "",
          " / flock",
          herds.length !== 1 ? "s" : "",
          " registered"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: herds.filter((h) => h.isActive).length }),
          " active"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground/40 border-t pt-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: "This is an on-farm record for Red Tractor compliance purposes. Retain for a minimum of 3 years and make available for inspection at audit." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium not-italic text-foreground/50 ml-4 whitespace-nowrap", children: [
          "BDE Farm Trac · ",
          printedDate
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleHerdPrint, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
        " Print Register"
      ] })
    ] })
  ] }) });
}
function PrintVetPlanDialog({ farmId, plan, onClose }) {
  const { data: farmData } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json())
  });
  const farm = farmData?.record;
  const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const sections = [
    { label: "Key Health Priorities", value: plan.healthPriorities },
    { label: "Vaccination Protocol", value: plan.vaccinationProtocol },
    { label: "Biosecurity Measures", value: plan.biosecurityMeasures },
    { label: "Worming / Parasite Protocol", value: plan.wormingProtocol },
    { label: "Fluke Treatment", value: plan.flukeTreatment },
    { label: "Mastitis Prevention (Dairy)", value: plan.mastitisPrevention },
    { label: "Additional Notes", value: plan.notes }
  ].filter((s) => s.value);
  const handleVetPrint = () => {
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Vet Health Plan ${plan.planYear}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.hdr h1{font-size:13px;font-weight:700;margin:0 0 4px}.hdr p{font-size:10px;color:#374151;margin:4px 0}.hdr-r{text-align:right;font-size:10px;color:#374151;line-height:1.8}.hdr-r b{display:block;font-size:12px;font-weight:600;color:#000}.meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 32px;padding:10px 0;border-bottom:1px solid #e5e7eb;margin-bottom:12px}.meta-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555}.section{border:1px solid #e5e7eb;border-radius:4px;padding:10px;margin-bottom:8px}.section-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555;margin:0 0 4px}.section-body{white-space:pre-line;line-height:1.5}.sig{border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.sigline{border-bottom:1px solid #999;height:32px;margin:24px 0 4px}.note{font-size:9px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h1>${farm?.name ?? "Farm"}</h1>${farm?.address ? `<p>${farm.address}${farm.postcode ? ", " + farm.postcode : ""}</p>` : ""}${farm?.cphNumber ? `<p>CPH: <span style="font-family:monospace;font-weight:600">${farm.cphNumber}</span></p>` : ""}${farm?.redTractorId ? `<p>Red Tractor ID: <span style="font-family:monospace;font-weight:600">${farm.redTractorId}</span></p>` : ""}</div><div class="hdr-r"><b>Vet Health Plan ${plan.planYear}</b>Plan date: <b>${formatDateLong(plan.planDate)}</b>${plan.reviewDate ? `<br>Review due: ${formatDateLong(plan.reviewDate)}` : ""}<br>Printed: ${printedDate}</div></div>
<div class="meta"><div><div class="meta-label">Attending Vet</div><div style="font-weight:600">${plan.vetName}</div></div>${plan.practiceName ? `<div><div class="meta-label">Practice</div><div style="font-weight:600">${plan.practiceName}</div></div>` : ""}${plan.practicePhone ? `<div><div class="meta-label">Phone</div><div>${plan.practicePhone}</div></div>` : ""}${plan.practiceAddress ? `<div><div class="meta-label">Address</div><div>${plan.practiceAddress}</div></div>` : ""}</div>
${sections.length === 0 ? `<p style="color:#555;font-style:italic;text-align:center;padding:12px">No plan content recorded.</p>` : sections.map((s) => `<div class="section"><p class="section-label">${s.label}</p><p class="section-body">${s.value ?? ""}</p></div>`).join("")}
<div class="sig"><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555">Farmer Signature</p><div class="sigline"></div><p style="font-size:9px;color:#555">Name &amp; Date</p></div><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555">Vet Signature</p><div class="sigline"></div><p style="font-size:9px;color:#555">Name &amp; Date</p></div></div>
<div class="note">This veterinary health plan is an on-farm record required by Red Tractor Livestock Standards. Retain for a minimum of 3 years and make available for inspection at audit.</div>
</body></html>`;
    openPrintWindow(html);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
          @media print {
            body > * { display: none !important; }
            [role="dialog"] { position: fixed; inset: 0; overflow: visible !important; }
            [role="dialog"] > * { display: none !important; }
            [role="dialog"] #vet-plan-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
          }
        ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-5 h-5 text-green-600" }),
        "Vet Health Plan — ",
        plan.planYear
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Review the plan below, then click Print to produce a signed compliance document for Red Tractor audit." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "vet-plan-print-area", className: "border border-border rounded-lg p-6 space-y-5 text-sm mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start border-b pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-foreground", children: farm?.name ?? "Farm" }),
          farm?.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60", children: [
            farm.address,
            farm.postcode ? `, ${farm.postcode}` : ""
          ] }),
          farm?.cphNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60 mt-0.5", children: [
            "CPH: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: farm.cphNumber })
          ] }),
          farm?.redTractorId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60 mt-0.5", children: [
            "Red Tractor ID: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: farm.redTractorId })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-foreground/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-foreground text-sm", children: [
            "Vet Health Plan ",
            plan.planYear
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Plan date: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: formatDateLong(plan.planDate) })
          ] }),
          plan.reviewDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Review due: ",
            formatDateLong(plan.reviewDate)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
            "Printed: ",
            printedDate
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-1 text-xs pb-3 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground/50 uppercase tracking-wider", children: "Attending Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground mt-0.5", children: plan.vetName })
        ] }),
        plan.practiceName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground/50 uppercase tracking-wider", children: "Practice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground mt-0.5", children: plan.practiceName })
        ] }),
        plan.practicePhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground/50 uppercase tracking-wider", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground mt-0.5", children: plan.practicePhone })
        ] }),
        plan.practiceAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground/50 uppercase tracking-wider", children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground mt-0.5", children: plan.practiceAddress })
        ] })
      ] }),
      sections.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/40 italic text-xs text-center py-4", children: "No plan content recorded." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: sections.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/40 rounded-md p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5", children: s.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/80 whitespace-pre-line leading-relaxed", children: s.value })
      ] }, s.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border pt-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50 mb-6", children: "Farmer Signature" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-foreground/30 mb-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: "Name & Date" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50 mb-6", children: "Vet Signature" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-foreground/30 mb-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: "Name & Date" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground/40 border-t pt-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: "This veterinary health plan is an on-farm record required by Red Tractor Livestock Standards. Retain for a minimum of 3 years and make available for inspection at audit." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium not-italic text-foreground/50 ml-4 whitespace-nowrap", children: [
          "BDE Farm Trac · ",
          printedDate
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleVetPrint, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
        " Print Plan"
      ] })
    ] })
  ] }) });
}
function getHerdNumberConfig(species) {
  const s = canonicalHerdSpecies(species);
  if (s === "cattle") return {
    label: "BCMS Herd Number",
    placeholder: "e.g. 12/345/0001",
    hint: "Issued by BCMS (British Cattle Movement Service). Found on your annual BCMS letter, cattle passports, or CPH registration documents from the Rural Payments Agency."
  };
  if (s === "sheep" || s === "goats" || s === "goat") return {
    label: "Flock Number",
    placeholder: "e.g. 12/345/0001",
    hint: "Your CPH-based flock number assigned by APHA. Found on EID ear tag documentation, your APHA holding registration letter, or Rural Payments Agency CPH paperwork."
  };
  if (s === "pigs" || s === "pig") return {
    label: "Herd Mark",
    placeholder: "e.g. AB1234",
    hint: "Your unique herd mark issued by AHDB Pork on pig registration. Found on movement licences (eAML2 / paper AML2) or your AHDB pig registration letter."
  };
  if (s === "deer") return {
    label: "Herd Number",
    placeholder: "e.g. 12/345/0001",
    hint: "Deer herd number from your APHA / Rural Payments Agency CPH registration. Found on your holding registration or movement documents."
  };
  if (s === "poultry" || s === "chickens" || s === "turkeys") return {
    label: "Flock Registration No.",
    placeholder: "e.g. GB-12345",
    hint: "Required for flocks of 50+ birds notifiable to APHA. Found on your APHA poultry registration letter."
  };
  return {
    label: "Herd / Flock Number",
    placeholder: "Enter official registration number",
    hint: "Enter the official herd or flock number issued by the relevant authority (APHA, BCMS, AHDB, or Rural Payments Agency)."
  };
}
function getBreedPlaceholder(species) {
  const s = canonicalHerdSpecies(species);
  if (s === "cattle") return "e.g. Holstein Friesian, Hereford × Angus, Limousin";
  if (s === "sheep") return "e.g. Suffolk, Texel, Mule, Welsh Mountain";
  if (s === "pigs" || s === "pig") return "e.g. Large White, Landrace, Duroc";
  if (s === "goats" || s === "goat") return "e.g. Saanen, British Alpine, Boer";
  if (s === "deer") return "e.g. Red Deer, Fallow Deer, Sika";
  if (s === "poultry") return "e.g. Ross 308, Cobb 500, Lohmann Brown";
  return "e.g. breed name";
}
function getHerdNamePlaceholder(species) {
  const s = canonicalHerdSpecies(species);
  if (s === "cattle") return "e.g. Main Dairy Herd, Suckler Herd";
  if (s === "sheep") return "e.g. Main Ewe Flock, Lowland Flock";
  if (s === "pigs" || s === "pig") return "e.g. Breeding Herd, Finishing Unit";
  if (s === "goats" || s === "goat") return "e.g. Milking Goat Herd";
  if (s === "deer") return "e.g. Red Deer Park";
  if (s === "poultry") return "e.g. Layer Flock, Broiler Unit";
  return "e.g. Main Herd / Flock";
}
function HerdsSection({ farmId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const livestockSpecies = useLookupStrings("livestock_species", ANIMAL_SPECIES_FALLBACK);
  const [search, setSearch] = reactExports.useState("");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingHerd, setEditingHerd] = reactExports.useState(null);
  const [viewHerd, setViewHerd] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(EMPTY_HERD);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [printOpen, setPrintOpen] = reactExports.useState(false);
  const baseUrl = `/api/farms/${farmId}/herds`;
  const { data, isLoading } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });
  const { data: countsData } = useQuery({
    queryKey: ["animal-counts-by-herd", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/animal-counts-by-herd`);
      if (!res.ok) return { counts: [] };
      return res.json();
    }
  });
  const countByHerd = {};
  for (const c of countsData?.counts ?? []) {
    if (c.herdId != null) countByHerd[c.herdId] = { total: c.total, male: c.male, female: c.female };
  }
  const createMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["herds", farmId] });
      setShowForm(false);
      setFormData(EMPTY_HERD);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["herds", farmId] });
      setEditingHerd(null);
      setShowForm(false);
      setFormData(EMPTY_HERD);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["herds", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const records = data?.records ?? [];
  const filtered = records.filter(
    (r) => !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase())
  );
  function openEdit(h) {
    setEditingHerd(h);
    setFormData({
      name: h.name ?? "",
      type: h.type ?? "",
      productionType: h.productionType ?? "",
      breed: h.breed ?? "",
      herdNumber: h.herdNumber ?? "",
      registrationDocumentUrl: h.registrationDocumentUrl ?? "",
      registrationDocumentName: h.registrationDocumentName ?? "",
      notes: h.notes ?? "",
      isOrganicHerd: h.isOrganicHerd ?? false,
      organicCertBody: h.organicCertBody ?? "",
      organicCertNumber: h.organicCertNumber ?? "",
      organicConversionStartDate: h.organicConversionStartDate ? new Date(h.organicConversionStartDate).toISOString().slice(0, 10) : ""
    });
    setShowForm(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const body = { ...formData };
    if (editingHerd) {
      updateMutation.mutate({ id: editingHerd.id, body });
    } else {
      createMutation.mutate(body);
    }
  }
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const herdNumConfig = getHerdNumberConfig(formData.type);
  const { uploadFile: uploadDoc, isUploading: isUploadingDoc } = useUpload({
    onSuccess: (response) => {
      const fileName = response.filename ?? response.objectPath?.split("/").pop() ?? "Registration document";
      setFormData((f) => ({
        ...f,
        registrationDocumentUrl: response.objectPath ?? "",
        registrationDocumentName: fileName
      }));
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search herds...", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setPrintOpen(true), disabled: records.length === 0, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditingHerd(null);
          setFormData(EMPTY_HERD);
          setShowForm(true);
        }, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
          " Add Herd / Flock"
        ] })
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-base mb-4", children: editingHerd ? "Edit Herd / Flock" : "New Herd / Flock" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Species ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", value: formData.type, onChange: (e) => setFormData((f) => ({ ...f, type: e.target.value, productionType: "" })), required: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select species..." }),
              livestockSpecies.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.toLowerCase(), children: s }, s))
            ] })
          ] }),
          PRODUCTION_TYPE_OPTIONS[canonicalHerdSpecies(formData.type)] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Production Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
                value: formData.productionType ?? "",
                onChange: (e) => setFormData((f) => ({ ...f, productionType: e.target.value })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not specified" }),
                  PRODUCTION_TYPE_OPTIONS[canonicalHerdSpecies(formData.type)].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.value, children: o.label }, o.value))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Specifies what this herd is farmed for — used to filter herds correctly in Welfare Outcome Assessments and reports." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: formData.type ? getHerdNamePlaceholder(formData.type) : "e.g. Main Dairy Herd",
                value: formData.name,
                onChange: (e) => setFormData((f) => ({ ...f, name: e.target.value })),
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: formData.type ? getBreedPlaceholder(formData.type) : "e.g. Holstein Friesian",
                value: formData.breed,
                onChange: (e) => setFormData((f) => ({ ...f, breed: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: herdNumConfig.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: herdNumConfig.placeholder,
                value: formData.herdNumber,
                onChange: (e) => setFormData((f) => ({ ...f, herdNumber: e.target.value }))
              }
            ),
            formData.type && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-start gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3 mt-0.5 shrink-0 text-blue-500" }),
              herdNumConfig.hint
            ] }),
            !formData.type && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Select a species above to see which official number applies." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Official Registration Document" }),
            formData.registrationDocumentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-green-700 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-green-800 font-medium flex-1 truncate", children: formData.registrationDocumentName || "Document attached" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: formData.registrationDocumentUrl, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:underline shrink-0", children: "View" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFormData((f) => ({ ...f, registrationDocumentUrl: "", registrationDocumentName: "" })), className: "text-xs text-red-500 hover:text-red-700 shrink-0", children: "Remove" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors", children: [
              isUploadingDoc ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Uploading…" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Upload registration letter, BCMS letter, or herd/flock number document" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf", className: "hidden", onChange: (e) => {
                if (e.target.files?.[0]) uploadDoc(e.target.files[0]);
              } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Attach a photo or scan of the official letter or certificate for easy access during inspections." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Any additional notes", value: formData.notes, onChange: (e) => setFormData((f) => ({ ...f, notes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border-2 p-4 transition-colors ${formData.isOrganicHerd ? "border-green-400 bg-green-50" : "border-dashed border-border"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: formData.isOrganicHerd ?? false,
                  onChange: (e) => setFormData((f) => ({ ...f, isOrganicHerd: e.target.checked })),
                  className: "w-5 h-5 rounded accent-green-600"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Organic Certified / In Conversion Herd" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enables organic compliance tracking, doubled withdrawal periods, and certifier notifications across all modules." })
              ] })
            ] }),
            formData.isOrganicHerd && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Certifying Body" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
                    value: formData.organicCertBody ?? "",
                    onChange: (e) => setFormData((f) => ({ ...f, organicCertBody: e.target.value })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select certifier..." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Soil Association", children: "Soil Association" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "OF&G", children: "OF&G (Organic Farmers & Growers)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Organic Food Federation", children: "Organic Food Federation (OFF)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Biodynamic Association", children: "Biodynamic Association" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SOPA", children: "SOPA (Scottish Organic Producers Association)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "QWFC", children: "Quality Welsh Food Certification (QWFC)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Certification / Licence Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. SA-CERT-12345", value: formData.organicCertNumber ?? "", onChange: (e) => setFormData((f) => ({ ...f, organicCertNumber: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Conversion Start Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formData.organicConversionStartDate ?? "", onChange: (e) => setFormData((f) => ({ ...f, organicConversionStartDate: e.target.value })) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "The date this herd/flock entered organic conversion. Used to enforce the 12-month minimum conversion period." })
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end pt-2 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", type: "button", onClick: () => {
            setShowForm(false);
            setEditingHerd(null);
            setFormData(EMPTY_HERD);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editingHerd ? "Update" : "Save Herd"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
      "Loading..."
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-8 h-8 text-primary/40" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No herds registered" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search ? "No records match your search." : "Register your first herd or flock to get started." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Breed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Head Count" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Herd No." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Doc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((h) => {
        const cnt = countByHerd[h.id];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-black/[0.02] transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm font-medium", children: h.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: h.type ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex flex-col gap-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: herdSpeciesDisplayLabel(h.type) }),
            herdProductionSubtype(h.type, h.productionType) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/60 leading-tight", children: herdProductionSubtype(h.type, h.productionType) })
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: h.breed || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: cnt ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: cnt.total }),
            (cnt.male > 0 || cnt.female > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs text-muted-foreground", children: [
              "♂",
              cnt.male,
              " / ♀",
              cnt.female
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40 text-xs", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm font-mono text-foreground/70", children: h.herdNumber || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm", children: h.registrationDocumentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3" }),
            "Doc"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40 text-xs", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewHerd(h), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-blue-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(h), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(h.id), className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
          ] }) })
        ] }, h.id);
      }) })
    ] }) }) }),
    viewHerd && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewHerd(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 440 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Herd Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewHerd.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              viewHerd.type ? herdSpeciesDisplayLabel(viewHerd.type) : "—",
              viewHerd.type && herdProductionSubtype(viewHerd.type, viewHerd.productionType) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs text-gray-400", children: [
                "(",
                herdProductionSubtype(viewHerd.type, viewHerd.productionType),
                ")"
              ] }) : null
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewHerd.breed || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Herd Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewHerd.herdNumber || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewHerd.isActive ? "Active" : "Inactive" })
          ] })
        ] }),
        viewHerd.registrationDocumentUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Registration Document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: viewHerd.registrationDocumentUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }),
                viewHerd.registrationDocumentName || "View document"
              ]
            }
          )
        ] }),
        viewHerd.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewHerd.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewHerd);
          setViewHerd(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewHerd(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Herd Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Are you sure? This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteMutation.mutate(deleteId), disabled: deleteMutation.isPending, children: [
          deleteMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Delete"
        ] })
      ] })
    ] }) }),
    printOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PrintHerdRegisterDialog,
      {
        farmId,
        herds: records,
        onClose: () => setPrintOpen(false)
      }
    )
  ] });
}
const ACTION_CATEGORIES = {
  vaccination: "Vaccination",
  disease_monitoring: "Disease Monitoring",
  medicine_review: "Medicine / Antibiotics",
  biosecurity: "Biosecurity",
  nutrition: "Nutrition",
  welfare: "Animal Welfare",
  worming: "Worming / Parasites",
  fluke: "Fluke Treatment",
  breeding: "Breeding",
  records: "Record Keeping",
  staff_training: "Staff Training",
  other: "Other"
};
const ACTION_FREQUENCIES = {
  one_off: "One-off",
  annual: "Annual",
  six_monthly: "Six-monthly",
  quarterly: "Quarterly",
  monthly: "Monthly",
  weekly: "Weekly",
  as_required: "As required"
};
const CATEGORY_COLOURS = {
  vaccination: "bg-blue-100 text-blue-800 border-blue-200",
  disease_monitoring: "bg-purple-100 text-purple-800 border-purple-200",
  medicine_review: "bg-orange-100 text-orange-800 border-orange-200",
  biosecurity: "bg-amber-100 text-amber-800 border-amber-200",
  nutrition: "bg-lime-100 text-lime-800 border-lime-200",
  welfare: "bg-pink-100 text-pink-800 border-pink-200",
  worming: "bg-teal-100 text-teal-800 border-teal-200",
  fluke: "bg-cyan-100 text-cyan-800 border-cyan-200",
  breeding: "bg-rose-100 text-rose-800 border-rose-200",
  records: "bg-slate-100 text-slate-800 border-slate-200",
  staff_training: "bg-indigo-100 text-indigo-800 border-indigo-200",
  other: "bg-gray-100 text-gray-700 border-gray-200"
};
const EMPTY_ACTION = { description: "", category: "other", categoryOther: "", frequency: "annual", nextDueDate: "", assignedTo: "", notes: "" };
function calcNextDueFromFrequency(freq, fromDate) {
  const base = /* @__PURE__ */ new Date();
  const d = new Date(base);
  if (freq === "annual") d.setFullYear(d.getFullYear() + 1);
  else if (freq === "six_monthly") d.setMonth(d.getMonth() + 6);
  else if (freq === "quarterly") d.setMonth(d.getMonth() + 3);
  else if (freq === "monthly") d.setMonth(d.getMonth() + 1);
  else if (freq === "weekly") d.setDate(d.getDate() + 7);
  else return "";
  return d.toISOString().slice(0, 10);
}
function actionIsOverdue(action) {
  if (!action.nextDueDate) return false;
  return new Date(action.nextDueDate) < /* @__PURE__ */ new Date();
}
function actionStatus(action) {
  if (!action.nextDueDate) return "no-date";
  const due = new Date(action.nextDueDate);
  const now = /* @__PURE__ */ new Date();
  if (due < now) return "overdue";
  const soon = /* @__PURE__ */ new Date();
  soon.setDate(soon.getDate() + 30);
  if (due <= soon) return "due-soon";
  return "upcoming";
}
function CompletionHistoryDialog({ farmId, action, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["vhp-completions", farmId, action.id],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/vet-health-plan-actions/${action.id}/completions`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/vet-health-plan-action-completions/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vhp-completions", farmId, action.id] });
      qc.invalidateQueries({ queryKey: ["vhp-actions"] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const completions = data?.completions ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[80vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-4 h-4 text-primary" }),
        " Completion History"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-sm", children: action.description })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : completions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground text-sm", children: "No completions recorded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: completions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-lg p-3 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMut.mutate(c.id), className: "absolute top-2 right-2 p-1 rounded hover:bg-red-50 text-muted-foreground/40 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-emerald-600 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: new Date(c.completedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }),
        c.completedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "by ",
          c.completedBy
        ] })
      ] }),
      c.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground ml-6 whitespace-pre-line", children: c.notes }),
      c.attachmentUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: c.attachmentUrl, target: "_blank", rel: "noopener noreferrer", className: "ml-6 mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
        c.attachmentName || "View evidence"
      ] }),
      (c.verifiedBy || c.verifiedDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "ml-6 mt-1 text-xs text-muted-foreground flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 text-emerald-500" }),
        "Verified by ",
        c.verifiedBy ?? "—",
        c.verifiedDate ? ` on ${new Date(c.verifiedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""
      ] })
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) })
  ] }) });
}
function MarkCompleteDialog({ farmId, action, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [completedDate, setCompletedDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [completedBy, setCompletedBy] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [attachmentUrl, setAttachmentUrl] = reactExports.useState("");
  const [attachmentName, setAttachmentName] = reactExports.useState("");
  const [verifiedBy, setVerifiedBy] = reactExports.useState("");
  const [verifiedDate, setVerifiedDate] = reactExports.useState("");
  const [updateNextDue, setUpdateNextDue] = reactExports.useState(action.frequency !== "one_off" && action.frequency !== "as_required");
  const [nextDueDateVal, setNextDueDateVal] = reactExports.useState(() => calcNextDueFromFrequency(action.frequency));
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (r) => {
      const resp = r;
      setAttachmentUrl(resp.objectPath ?? "");
      setAttachmentName(resp.filename ?? resp.objectPath?.split("/").pop() ?? "Evidence file");
    }
  });
  const aStatus = actionStatus(action);
  const isOverdue = aStatus === "overdue";
  const isDueSoon = aStatus === "due-soon";
  const freqLabel = ACTION_FREQUENCIES[action.frequency] ?? action.frequency;
  const nextDueFormatted = action.nextDueDate ? new Date(action.nextDueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  const completeMut = useMutation({
    mutationFn: async () => {
      const body = {
        completedDate,
        completedBy: completedBy || null,
        notes: notes || null,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        verifiedBy: verifiedBy || null,
        verifiedDate: verifiedDate || null
      };
      const res = await fetch(`/api/farms/${farmId}/vet-health-plan-actions/${action.id}/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to save");
      if (updateNextDue && nextDueDateVal) {
        await fetch(`/api/farms/${farmId}/vet-health-plan-actions/${action.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nextDueDate: nextDueDateVal })
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vhp-actions"] });
      qc.invalidateQueries({ queryKey: ["vhp-completions", farmId, action.id] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-4 h-4 text-emerald-600" }),
        " Record Completion"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-sm", children: action.description })
    ] }),
    (isOverdue || isDueSoon || nextDueFormatted) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg px-3 py-2 text-sm flex items-center gap-2 border
            ${isOverdue ? "bg-red-50 text-red-800 border-red-200" : isDueSoon ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-800 border-blue-200"}`, children: [
      isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Overdue" }),
      isDueSoon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Due soon" }),
      nextDueFormatted && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "— was due ",
        nextDueFormatted
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs opacity-70", children: freqLabel })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 mt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "What Was Done" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Completed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: completedDate, onChange: (e) => setCompletedDate(e.target.value), className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carried Out By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: completedBy, onChange: (e) => setCompletedBy(e.target.value), placeholder: "Name of person", className: "mt-1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes & Observations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "What was done, results, observations, any concerns…", rows: 3, className: "mt-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Evidence" }),
        attachmentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 border border-emerald-200 bg-emerald-50 rounded-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4 text-emerald-600 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-emerald-800 truncate flex-1", children: attachmentName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-muted-foreground hover:text-red-500", onClick: () => {
            setAttachmentUrl("");
            setAttachmentName("");
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
          isUploading ? "Uploading…" : "Upload photo, invoice or certificate",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,.pdf", className: "sr-only", disabled: isUploading, onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
          } })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: [
          "Manager Sign-off ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case font-normal", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Verified By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: verifiedBy, onChange: (e) => setVerifiedBy(e.target.value), placeholder: "Manager name", className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Verification Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: verifiedDate, onChange: (e) => setVerifiedDate(e.target.value), className: "mt-1" })
          ] })
        ] })
      ] }),
      action.frequency !== "one_off" && action.frequency !== "as_required" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/60 rounded-lg p-3 bg-muted/20 space-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "updateDue", checked: updateNextDue, onChange: (e) => setUpdateNextDue(e.target.checked), className: "rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "updateDue", className: "text-sm font-medium cursor-pointer flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5 text-primary" }),
            "Schedule next occurrence"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-muted-foreground", children: freqLabel })
        ] }),
        updateNextDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Next Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: nextDueDateVal, onChange: (e) => setNextDueDateVal(e.target.value), className: "mt-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Auto-calculated from today (",
            freqLabel.toLowerCase(),
            ") — adjust if needed."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => completeMut.mutate(), disabled: completeMut.isPending || isUploading, className: "bg-emerald-600 hover:bg-emerald-700", children: completeMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
        " Saving…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-4 w-4 mr-1" }),
        " Record Completion"
      ] }) })
    ] })
  ] }) });
}
function ActionPointsDialog({ farmId, plan, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = reactExports.useState(false);
  const [editingAction, setEditingAction] = reactExports.useState(null);
  const [actionForm, setActionForm] = reactExports.useState(EMPTY_ACTION);
  const [markingAction, setMarkingAction] = reactExports.useState(null);
  const [historyAction, setHistoryAction] = reactExports.useState(null);
  const [deletingActionId, setDeletingActionId] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = (membersData?.members ?? []).filter((m) => m.isActive);
  const staffNames = activeMembers.map((m) => memberFullName(m));
  const actionsUrl = `/api/farms/${farmId}/vet-health-plans/${plan.id}/actions`;
  const { data: actionsData, isLoading } = useQuery({
    queryKey: ["vhp-actions", farmId, plan.id],
    queryFn: async () => {
      const res = await fetch(actionsUrl);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });
  const actions = actionsData?.actions ?? [];
  const overdueCount = actions.filter(actionIsOverdue).length;
  const createActionMut = useMutation({
    mutationFn: (body) => fetch(actionsUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, nextDueDate: body.nextDueDate || null }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] });
      setShowAddForm(false);
      setActionForm(EMPTY_ACTION);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateActionMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/vet-health-plan-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, nextDueDate: body.nextDueDate || null }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] });
      setEditingAction(null);
      setShowAddForm(false);
      setActionForm(EMPTY_ACTION);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteActionMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/vet-health-plan-actions/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vhp-actions", farmId, plan.id] });
      setDeletingActionId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAddForm() {
    setEditingAction(null);
    setActionForm(EMPTY_ACTION);
    setShowAddForm(true);
  }
  function openEditAction(a) {
    setEditingAction(a);
    const isKnownCategory = a.category in ACTION_CATEGORIES;
    setActionForm({
      description: a.description,
      category: isKnownCategory ? a.category : "other",
      categoryOther: isKnownCategory ? "" : a.category,
      frequency: a.frequency,
      nextDueDate: a.nextDueDate?.slice(0, 10) ?? "",
      assignedTo: a.assignedTo ?? "",
      notes: a.notes ?? ""
    });
    setShowAddForm(true);
  }
  function handleActionSubmit(e) {
    e.preventDefault();
    const finalCategory = actionForm.category === "other" && actionForm.categoryOther.trim() ? actionForm.categoryOther.trim() : actionForm.category;
    const body = { ...actionForm, category: finalCategory };
    if (editingAction) updateActionMut.mutate({ id: editingAction.id, body });
    else createActionMut.mutate(body);
  }
  function setActionField(k, v) {
    setActionForm((f) => ({ ...f, [k]: v }));
  }
  function handlePrintEvidence() {
    fetch(`/api/farms/${farmId}/vet-health-plans/${plan.id}/evidence-report`).then((r) => r.json()).then(({ plan: p, actions: acts }) => {
      const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      const statusLabel = (a) => {
        const s = actionStatus(a);
        if (s === "overdue") return `<span style="color:#dc2626;font-weight:bold">OVERDUE</span>`;
        if (s === "due-soon") return `<span style="color:#d97706;font-weight:bold">Due Soon</span>`;
        if (s === "upcoming") return `<span style="color:#2563eb">Upcoming</span>`;
        return `<span style="color:#6b7280">No target date</span>`;
      };
      const compLines = (comps) => comps.slice(0, 5).map(
        (c) => `<div style="border-left:2px solid #10b981;padding-left:6px;margin-bottom:4px;font-size:10px">
            <b>${new Date(c.completedDate).toLocaleDateString("en-GB")}</b>${c.completedBy ? ` — ${c.completedBy}` : ""}
            ${c.notes ? `<div style="color:#555">${c.notes}</div>` : ""}
            ${c.attachmentUrl ? `<a href="${c.attachmentUrl}" style="color:#2563eb">${c.attachmentName || "Evidence file"}</a>` : ""}
          </div>`
      ).join("");
      const rows = acts.map((a) => `
          <tr>
            <td style="vertical-align:top"><span style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:9px">${ACTION_CATEGORIES[a.category] ?? a.category}</span></td>
            <td style="vertical-align:top"><b>${a.description}</b>${a.notes ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">${a.notes}</div>` : ""}</td>
            <td style="vertical-align:top">${ACTION_FREQUENCIES[a.frequency] ?? a.frequency}</td>
            <td style="vertical-align:top">${a.nextDueDate ? new Date(a.nextDueDate).toLocaleDateString("en-GB") : "—"}</td>
            <td style="vertical-align:top">${statusLabel(a)}</td>
            <td style="vertical-align:top">${a.assignedTo || "—"}</td>
            <td style="vertical-align:top">${a.completionCount ?? 0} entries${a.completions?.length > 0 ? `<div style="margin-top:4px">${compLines(a.completions)}</div>` : ""}</td>
          </tr>`).join("");
      const totalCount = acts.length;
      const overdueN = acts.filter(actionIsOverdue).length;
      const completedRecently = acts.filter((a) => a.completions?.length > 0).length;
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Health Plan Evidence — ${p.planYear}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}h1{font-size:16px;margin:0 0 2px}h2{font-size:13px;margin:12px 0 4px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#f3f4f6;border:1px solid #d1d5db;padding:6px;text-align:left;font-size:9px;font-weight:bold;text-transform:uppercase;color:#6b7280}
td{border:1px solid #e5e7eb;padding:7px 6px;font-size:11px}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.summary-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}.summary-num{font-size:22px;font-weight:bold}.summary-label{font-size:9px;color:#6b7280;text-transform:uppercase}
.note{margin-top:20px;padding:8px;background:#fef3c7;border:1px solid #fcd34d;font-size:9px}@media print{@page{margin:1.5cm}}</style>
</head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:12px">
  <div><h1>Health Plan Evidence Report — ${p.planYear}</h1><div style="font-size:10px;color:#555">Vet: <b>${p.vetName}</b>${p.practiceName ? ` — ${p.practiceName}` : ""}${p.practicePhone ? ` · ${p.practicePhone}` : ""}</div>
  <div style="font-size:10px;color:#555">Plan date: ${p.planDate ? new Date(p.planDate).toLocaleDateString("en-GB") : "—"} · Review due: ${p.reviewDate ? new Date(p.reviewDate).toLocaleDateString("en-GB") : "—"}</div></div>
  <div style="text-align:right;font-size:10px;color:#555">Printed: ${today}</div>
</div>
<div class="summary">
  <div class="summary-box"><div class="summary-num">${totalCount}</div><div class="summary-label">Total Actions</div></div>
  <div class="summary-box" style="border-color:${overdueN > 0 ? "#fca5a5" : "#e5e7eb"}"><div class="summary-num" style="color:${overdueN > 0 ? "#dc2626" : "#000"}">${overdueN}</div><div class="summary-label">Overdue</div></div>
  <div class="summary-box" style="border-color:#a7f3d0"><div class="summary-num" style="color:#059669">${completedRecently}</div><div class="summary-label">With Evidence</div></div>
</div>
<h2>Action Points &amp; Completion Evidence</h2>
<table><thead><tr><th>Category</th><th>Action</th><th>Frequency</th><th>Next Due</th><th>Status</th><th>Responsible</th><th>Evidence Log</th></tr></thead><tbody>${rows}</tbody></table>
<div class="note">This evidence report documents actions taken against the ${p.planYear} Veterinary Health Plan. It is a Red Tractor compliance record — retain for a minimum of 3 years and make available at audit.</div>
</body></html>`;
      openPrintWindow(html);
    });
  }
  const isSaving = createActionMut.isPending || updateActionMut.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "w-5 h-5 text-primary" }),
          "Action Points — ",
          plan.planYear,
          " Health Plan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          plan.vetName,
          plan.practiceName ? ` — ${plan.practiceName}` : "",
          overdueCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-red-600 font-medium", children: [
            "· ",
            overdueCount,
            " overdue"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddForm, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
          " Add Action Point"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5 text-green-700 border-green-200 hover:bg-green-50", onClick: handlePrintEvidence, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
          " Print Evidence Report"
        ] })
      ] }),
      showAddForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm mb-3", children: editingAction ? "Edit Action Point" : "New Action Point" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleActionSubmit, className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Action Description ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: actionForm.description, onChange: (e) => setActionField("description", e.target.value), placeholder: "e.g. Vaccinate all heifers against BVD before first service", required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: actionForm.category, onValueChange: (v) => {
                setActionField("category", v);
                if (v !== "other") setActionField("categoryOther", "");
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(ACTION_CATEGORIES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
              ] }),
              actionForm.category === "other" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: actionForm.categoryOther, onChange: (e) => setActionField("categoryOther", e.target.value), placeholder: "Specify category…" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Frequency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: actionForm.frequency, onValueChange: (v) => {
                setActionField("frequency", v);
                if (!actionForm.nextDueDate) setActionField("nextDueDate", calcNextDueFromFrequency(v));
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(ACTION_FREQUENCIES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Due Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: actionForm.nextDueDate, onChange: (e) => setActionField("nextDueDate", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Responsible Person" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: staffNames.includes(actionForm.assignedTo) ? actionForm.assignedTo : actionForm.assignedTo ? "__other__" : "__none__",
                  onValueChange: (v) => {
                    if (v === "__none__") setActionField("assignedTo", "");
                    else if (v === "__other__") setActionField("assignedTo", "");
                    else setActionField("assignedTo", v);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not assigned —" }),
                      staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / type manually…" })
                    ] })
                  ]
                }
              ),
              !staffNames.includes(actionForm.assignedTo) && actionForm.assignedTo !== "" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: actionForm.assignedTo, onChange: (e) => setActionField("assignedTo", e.target.value), placeholder: "Enter name manually" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: actionForm.notes, onChange: (e) => setActionField("notes", e.target.value), placeholder: "Additional details…" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", disabled: isSaving, children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-3.5 h-3.5 mr-1" }),
              "Saving…"
            ] }) : editingAction ? "Update" : "Add Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => {
              setShowAddForm(false);
              setEditingAction(null);
              setActionForm(EMPTY_ACTION);
            }, children: "Cancel" })
          ] })
        ] })
      ] }) }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : actions.length === 0 && !showAddForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10 border border-dashed border-border rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "w-8 h-8 text-muted-foreground/40 mx-auto mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "No action points yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Add the requirements from this plan so you can track and evidence completion." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-3", onClick: openAddForm, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          " Add First Action"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: actions.map((a) => {
        const status = actionStatus(a);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `border rounded-lg p-3 ${status === "overdue" ? "border-red-200 bg-red-50/40" : "border-border bg-card"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLOURS[a.category] ?? CATEGORY_COLOURS.other}`, children: ACTION_CATEGORIES[a.category] ?? a.category }),
              status === "overdue" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-xs font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
                " Overdue"
              ] }),
              status === "due-soon" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                " Due Soon"
              ] }),
              a.completionCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                " ",
                a.completionCount,
                " ",
                a.completionCount === 1 ? "entry" : "entries"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: a.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ACTION_FREQUENCIES[a.frequency] ?? a.frequency }),
              a.nextDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                " Due ",
                new Date(a.nextDueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              ] }),
              a.assignedTo && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "👤 ",
                a.assignedTo
              ] }),
              a.latestCompletion && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-600", children: [
                "Last done ",
                new Date(a.latestCompletion.completedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                a.latestCompletion.completedBy ? ` by ${a.latestCompletion.completedBy}` : ""
              ] })
            ] }),
            a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-0.5 italic", children: a.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "default", className: "h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700", onClick: () => setMarkingAction(a), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-3 h-3" }),
              " Done"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs gap-1", onClick: () => setHistoryAction(a), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-3 h-3" }),
              " ",
              a.completionCount > 0 ? `History (${a.completionCount})` : "History"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditAction(a), className: "p-1.5 rounded hover:bg-black/5 text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeletingActionId(a.id), className: "p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) }),
            (status === "overdue" || status === "due-soon") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRaiseTaskFor(a), className: "p-1.5 rounded hover:bg-purple-50 text-muted-foreground hover:text-purple-600", title: "Raise Task", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }) })
          ] })
        ] }) }, a.id);
      }) })
    ] }),
    markingAction && /* @__PURE__ */ jsxRuntimeExports.jsx(MarkCompleteDialog, { farmId, action: markingAction, onClose: () => setMarkingAction(null) }),
    historyAction && /* @__PURE__ */ jsxRuntimeExports.jsx(CompletionHistoryDialog, { farmId, action: historyAction, onClose: () => setHistoryAction(null) }),
    deletingActionId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setDeletingActionId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Action Point?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This action point and its completion history will be removed. This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeletingActionId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteActionMut.mutate(deletingActionId), disabled: deleteActionMut.isPending, children: deleteActionMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          "Deleting…"
        ] }) : "Delete" })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `VHP Action Overdue — ${String(raiseTaskFor.description ?? "Action Point").slice(0, 60)}`,
        defaultDescription: `Category: ${raiseTaskFor.category ?? "—"} · Due: ${raiseTaskFor.nextDueDate ? new Date(String(raiseTaskFor.nextDueDate)).toLocaleDateString("en-GB") : "—"} · Assigned: ${raiseTaskFor.assignedTo ?? "—"}`,
        module: "livestock"
      }
    )
  ] });
}
function VetHealthPlansSection({ farmId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingPlan, setEditingPlan] = reactExports.useState(null);
  const [viewPlan, setViewPlan] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(EMPTY_PLAN);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [printPlan, setPrintPlan] = reactExports.useState(null);
  const [actionsPlan, setActionsPlan] = reactExports.useState(null);
  const baseUrl = `/api/farms/${farmId}/vet-health-plans`;
  const { data, isLoading } = useQuery({
    queryKey: ["vet-health-plans", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });
  const createMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] });
      setShowForm(false);
      setFormData(EMPTY_PLAN);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] });
      setEditingPlan(null);
      setShowForm(false);
      setFormData(EMPTY_PLAN);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vet-health-plans", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const records = data?.records ?? [];
  const [yearFilterVhp, setYearFilterVhp] = reactExports.useState("all");
  const yearsVhp = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.planYear ?? "")).filter(Boolean))).sort().reverse(), [records]);
  const filteredVhpRecords = yearFilterVhp === "all" ? records : records.filter((r) => String(r.planYear ?? "") === yearFilterVhp);
  function openEdit(p) {
    setEditingPlan(p);
    setFormData({
      planYear: p.planYear,
      vetName: p.vetName ?? "",
      practiceName: p.practiceName ?? "",
      practicePhone: p.practicePhone ?? "",
      practiceAddress: p.practiceAddress ?? "",
      planDate: p.planDate ? p.planDate.slice(0, 10) : "",
      reviewDate: p.reviewDate ? p.reviewDate.slice(0, 10) : "",
      healthPriorities: p.healthPriorities ?? "",
      vaccinationProtocol: p.vaccinationProtocol ?? "",
      biosecurityMeasures: p.biosecurityMeasures ?? "",
      wormingProtocol: p.wormingProtocol ?? "",
      flukeTreatment: p.flukeTreatment ?? "",
      mastitisPrevention: p.mastitisPrevention ?? "",
      notes: p.notes ?? ""
    });
    setShowForm(true);
  }
  function setField(key, val) {
    setFormData((f) => ({ ...f, [key]: val }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      ...formData,
      planYear: Number(formData.planYear),
      planDate: formData.planDate ? new Date(formData.planDate).toISOString() : null,
      reviewDate: formData.reviewDate ? new Date(formData.reviewDate).toISOString() : null
    };
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, body });
    } else {
      createMutation.mutate(body);
    }
  }
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60", children: "Annual veterinary health plans signed by your vet — required for Red Tractor livestock standards." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterVhp, onValueChange: setYearFilterVhp, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsVhp.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditingPlan(null);
          setFormData(EMPTY_PLAN);
          setShowForm(true);
        }, className: "gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
          " Add Health Plan"
        ] })
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-base mb-4", children: editingPlan ? "Edit Vet Health Plan" : "New Vet Health Plan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Plan Year ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "2000", max: "2099", value: formData.planYear, onChange: (e) => setField("planYear", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Plan Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formData.planDate, onChange: (e) => setField("planDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Review Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formData.reviewDate, onChange: (e) => setField("reviewDate", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3", children: "Veterinary Practice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Vet Name ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Mr J. Smith BVSc", value: formData.vetName, onChange: (e) => setField("vetName", e.target.value), required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Practice Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Green Pastures Vets", value: formData.practiceName, onChange: (e) => setField("practiceName", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Practice Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 01234 567890", value: formData.practicePhone, onChange: (e) => setField("practicePhone", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Practice Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Address", value: formData.practiceAddress, onChange: (e) => setField("practiceAddress", e.target.value) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3", children: "Health Plan Content" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Key Health Priorities" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  className: "w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y",
                  placeholder: "Key health issues identified for this farm (e.g. BVD control, lameness reduction, pneumonia prevention...)",
                  value: formData.healthPriorities,
                  onChange: (e) => setField("healthPriorities", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Vaccination Protocol" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y", placeholder: "Vaccines used, schedule, products...", value: formData.vaccinationProtocol, onChange: (e) => setField("vaccinationProtocol", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Biosecurity Measures" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y", placeholder: "Quarantine, testing, visitor controls...", value: formData.biosecurityMeasures, onChange: (e) => setField("biosecurityMeasures", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Worming / Parasite Protocol" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y", placeholder: "Products, timing, rotation strategy...", value: formData.wormingProtocol, onChange: (e) => setField("wormingProtocol", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Fluke Treatment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y", placeholder: "Flukicide products and timing...", value: formData.flukeTreatment, onChange: (e) => setField("flukeTreatment", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Mastitis Prevention (dairy)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y", placeholder: "Dry cow therapy, teat dipping, cell count targets...", value: formData.mastitisPrevention, onChange: (e) => setField("mastitisPrevention", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Additional Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y", placeholder: "Any other notes...", value: formData.notes, onChange: (e) => setField("notes", e.target.value) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end pt-2 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", type: "button", onClick: () => {
            setShowForm(false);
            setEditingPlan(null);
            setFormData(EMPTY_PLAN);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editingPlan ? "Update Plan" : "Save Health Plan"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
      "Loading..."
    ] }) : filteredVhpRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "w-8 h-8 text-primary/40" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No vet health plans recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: "Add your annual veterinary health plan. Red Tractor requires a current signed plan from your vet." })
    ] }) }) : filteredVhpRecords.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "w-6 h-6 text-primary/70" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base font-bold", children: [
                p.planYear,
                " Health Plan"
              ] }),
              p.isActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                " Current"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/70", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: p.vetName }),
              p.practiceName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/50", children: [
                " — ",
                p.practiceName
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-0.5", children: [
              "Plan date: ",
              formatDate(p.planDate),
              p.reviewDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                " · Review due: ",
                formatDate(p.reviewDate)
              ] }),
              p.practicePhone && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                " · ",
                p.practicePhone
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5", onClick: () => setActionsPlan(p), title: "Manage action points", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "w-3.5 h-3.5" }),
            " Action Points"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewPlan(p), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-blue-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setPrintPlan(p),
              className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-green-600",
              title: "Print this plan",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(p), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(p.id), className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
        ] })
      ] }),
      (p.healthPriorities || p.vaccinationProtocol || p.wormingProtocol || p.flukeTreatment) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/50 px-5 py-3 bg-muted/20 grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        p.healthPriorities && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1", children: "Health Priorities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/70 whitespace-pre-line", children: p.healthPriorities })
        ] }),
        p.vaccinationProtocol && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1", children: "Vaccination" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/70 whitespace-pre-line", children: p.vaccinationProtocol })
        ] }),
        p.wormingProtocol && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1", children: "Worming" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/70 whitespace-pre-line", children: p.wormingProtocol })
        ] }),
        p.flukeTreatment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1", children: "Fluke" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/70 whitespace-pre-line", children: p.flukeTreatment })
        ] })
      ] })
    ] }, p.id)) }),
    viewPlan && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewPlan(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Vet Health Plan ",
        viewPlan.planYear
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewPlan.planYear })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Vet Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewPlan.vetName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Practice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewPlan.practiceName || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Practice Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewPlan.practicePhone || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Plan Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewPlan.planDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Review Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewPlan.reviewDate) })
          ] })
        ] }),
        viewPlan.healthPriorities && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Health Priorities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewPlan.healthPriorities })
        ] }),
        viewPlan.vaccinationProtocol && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Vaccination Protocol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewPlan.vaccinationProtocol })
        ] }),
        viewPlan.wormingProtocol && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Worming Protocol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewPlan.wormingProtocol })
        ] }),
        viewPlan.flukeTreatment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Fluke Treatment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewPlan.flukeTreatment })
        ] }),
        viewPlan.biosecurityMeasures && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Biosecurity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewPlan.biosecurityMeasures })
        ] }),
        viewPlan.mastitisPrevention && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Mastitis Prevention" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewPlan.mastitisPrevention })
        ] }),
        viewPlan.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewPlan.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "vet_plan", recordId: viewPlan.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewPlan);
          setViewPlan(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewPlan(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Vet Health Plan" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Are you sure? This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteMutation.mutate(deleteId), disabled: deleteMutation.isPending, children: [
          deleteMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Delete"
        ] })
      ] })
    ] }) }),
    printPlan && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PrintVetPlanDialog,
      {
        farmId,
        plan: printPlan,
        onClose: () => setPrintPlan(null)
      }
    ),
    actionsPlan && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ActionPointsDialog,
      {
        farmId,
        plan: actionsPlan,
        onClose: () => setActionsPlan(null)
      }
    )
  ] });
}
const CONTRACTOR_TYPES = {
  "nfas-collector": "NFAS Fallen Stock Collector",
  "hunt-kennel": "Hunt Kennel",
  "knacker": "Knacker / Slaughterer",
  "rendering": "Rendering Plant",
  "incinerator": "Licensed Incinerator",
  "other": "Other"
};
const FEED_TYPE_LABELS = {
  "compound-pellets": "Compound Pellets",
  "rolled-barley": "Rolled Barley",
  "wholecrop-silage": "Wholecrop Silage",
  "grass-silage": "Grass Silage",
  "maize-silage": "Maize Silage",
  hay: "Hay",
  straw: "Straw (feed)",
  "sugar-beet-pulp": "Sugar Beet Pulp",
  "distillers-grains": "Distillers' Grains",
  "soya-meal": "Soya Meal",
  "rape-meal": "Rape Meal",
  minerals: "Minerals / Boluses",
  "creep-feed": "Creep Feed",
  "milk-replacer": "Milk Replacer",
  "total-mixed-ration": "TMR",
  other: "Other"
};
const EMPTY_FEED = {
  feedType: "",
  supplier: "",
  batchNumber: "",
  quantityKg: "",
  feedDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  notes: "",
  herdId: "",
  feedStockItemId: "",
  deliveryId: ""
};
function FallenStockContractorsSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" });
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then((r) => r.json())
  });
  function setF(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/fallen-stock-contractors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] });
      setShowForm(false);
      setForm({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] });
      setEditing(null);
      setShowForm(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }),
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(c) {
    setEditing(c);
    setForm({ name: c.name, approvalNumber: c.approvalNumber, operatorType: c.operatorType, contactName: c.contactName ?? "", phone: c.phone ?? "", email: c.email ?? "", notes: c.notes ?? "" });
    setShowForm(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Fallen Stock Collectors & Disposal Operators" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "APHA-approved collection and disposal operators for animal by-products only. These are not general suppliers or hauliers — add those in Trade Contacts & Stock." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setForm({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" });
        setShowForm(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Add Collector"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Regulatory note:" }),
      " Under the Animal By-Products Regulations, fallen stock must be collected by an APHA-approved operator. Record their official approval/registration number here so it appears automatically on every mortality record — this is the evidence inspectors will check.",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "If a collector also provides other services" }),
      " (e.g. stock haulage, feed delivery), add them separately as a Trade Contact in ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Trade Contacts & Stock" }),
      " so that invoices and purchase orders for those services are kept distinct from fallen stock disposal records. Use exactly the same company name in both places to make reconciliation straightforward."
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : contractors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700 mb-1", children: "No contractors added yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Add your fallen stock collectors and disposal operators so they appear on mortality records." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Contractor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "APHA Approval No." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: contractors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-gray-900", children: c.name }),
          c.email && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: c.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-600", children: CONTRACTOR_TYPES[c.operatorType] ?? c.operatorType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs font-semibold text-primary", children: c.approvalNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-600", children: [c.contactName, c.phone].filter(Boolean).join(" · ") || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => toggleActive.mutate({ id: c.id, isActive: !c.isActive }),
            className: `inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium transition-colors ${c.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`,
            children: c.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              " Active"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
              " Inactive"
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(c.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, c.id)) })
    ] }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Fallen Stock Collector" : "Add Fallen Stock Collector" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record the contractor's APHA approval number for audit compliance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contractor / Company Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setF("name", e.target.value), placeholder: "e.g. ABC Fallen Stock Services Ltd", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Approval / Registration Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.approvalNumber, onChange: (e) => setF("approvalNumber", e.target.value), placeholder: "e.g. ABP-XXXX-XXXX", required: true, className: "font-mono" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Required under Animal By-Products Regulations. Available on operator's APHA certificate." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.operatorType, onValueChange: (v) => setF("operatorType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(CONTRACTOR_TYPES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.contactName, onChange: (e) => setF("contactName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone, onChange: (e) => setF("phone", e.target.value), type: "tel" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.email, onChange: (e) => setF("email", e.target.value), type: "email" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setF("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowForm(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form),
            disabled: !form.name || !form.approvalNumber || createMut.isPending || updateMut.isPending,
            children: [
              createMut.isPending || updateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }) : null,
              editing ? "Update" : "Add Collector"
            ]
          }
        )
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Fallen Stock Collector?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This will remove them from the register. Existing mortality records won't be affected." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Remove" })
      ] })
    ] }) })
  ] });
}
function FeedSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/feed-records`;
  const { data, isLoading } = useQuery({
    queryKey: ["feed-records", farmId],
    queryFn: () => fetch(base).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json())
  });
  const herds = herdsData?.records ?? [];
  const { data: feedBinsData } = useQuery({
    queryKey: ["feed-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then((r) => r.json())
  });
  const feedBins = feedBinsData?.records ?? [];
  const { data: deliveriesData } = useQuery({
    queryKey: ["feed-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-deliveries`).then((r) => r.json())
  });
  const allDeliveries = deliveriesData?.records ?? [];
  const [search, setSearch] = reactExports.useState("");
  const [yearFilterFeed, setYearFilterFeed] = reactExports.useState("all");
  const yearsFeed = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.feedDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_FEED);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const binDeliveries = form.feedStockItemId ? allDeliveries.filter((d) => String(d.feedStockItemId) === String(form.feedStockItemId)) : allDeliveries;
  const herdMap = Object.fromEntries(herds.map((h) => [h.id, h.name]));
  const binMap = Object.fromEntries(feedBins.map((b) => [b.id, b]));
  const createMut = useMutation({
    mutationFn: (body) => {
      const payload = { ...body };
      if (!payload.feedStockItemId) delete payload.feedStockItemId;
      else payload.feedStockItemId = Number(payload.feedStockItemId);
      if (!payload.deliveryId) delete payload.deliveryId;
      else payload.deliveryId = Number(payload.deliveryId);
      if (!payload.herdId) delete payload.herdId;
      else payload.herdId = Number(payload.herdId);
      return fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-records", farmId] });
      qc.invalidateQueries({ queryKey: ["feed-stock", farmId] });
      setShowForm(false);
      setForm(EMPTY_FEED);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => {
      const payload = { ...body };
      if (!payload.feedStockItemId) delete payload.feedStockItemId;
      else payload.feedStockItemId = Number(payload.feedStockItemId);
      if (!payload.deliveryId) delete payload.deliveryId;
      else payload.deliveryId = Number(payload.deliveryId);
      if (!payload.herdId) delete payload.herdId;
      else payload.herdId = Number(payload.herdId);
      return fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-records", farmId] });
      qc.invalidateQueries({ queryKey: ["feed-stock", farmId] });
      setEditing(null);
      setShowForm(false);
      setForm(EMPTY_FEED);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-records", farmId] });
      qc.invalidateQueries({ queryKey: ["feed-stock", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setForm({
      feedType: r.feedType,
      supplier: r.supplier ?? "",
      batchNumber: r.batchNumber ?? "",
      quantityKg: r.quantityKg ?? "",
      feedDate: r.feedDate?.slice(0, 10) ?? "",
      notes: r.notes ?? "",
      herdId: r.herdId ? String(r.herdId) : "",
      feedStockItemId: r.feedStockItemId ? String(r.feedStockItemId) : "",
      deliveryId: r.deliveryId ? String(r.deliveryId) : ""
    });
    setShowForm(true);
  }
  function handleBinSelect(binId) {
    if (binId === "__none__") {
      setForm((f) => ({ ...f, feedStockItemId: "", deliveryId: "" }));
      return;
    }
    const bin = feedBins.find((b) => String(b.id) === binId);
    setForm((f) => ({
      ...f,
      feedStockItemId: binId,
      deliveryId: "",
      feedType: bin?.feedType ?? f.feedType
    }));
  }
  function handleDeliverySelect(delivId) {
    if (delivId === "__none__") {
      setForm((f) => ({ ...f, deliveryId: "" }));
      return;
    }
    const d = allDeliveries.find((x) => String(x.id) === delivId);
    setForm((f) => ({
      ...f,
      deliveryId: delivId,
      supplier: d?.supplierName ?? f.supplier,
      batchNumber: d?.batchNumber ?? d?.lotNumber ?? f.batchNumber
    }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) updateMut.mutate({ ...form, id: editing.id });
    else createMut.mutate(form);
  }
  const filtered = records.filter(
    (r) => (r.feedType.toLowerCase().includes(search.toLowerCase()) || (r.supplier ?? "").toLowerCase().includes(search.toLowerCase()) || (r.batchNumber ?? "").toLowerCase().includes(search.toLowerCase())) && (yearFilterFeed === "all" || String(r.feedDate ?? "").startsWith(yearFilterFeed))
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by feed type, supplier or batch…", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterFeed, onValueChange: setYearFilterFeed, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsFeed.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm(EMPTY_FEED);
          setShowForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Add Feed Record"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Traceability requirement:" }),
      " Link each feeding event to a source bin and delivery batch. This creates a full audit chain from supplier → bin → herd. Retain invoices and delivery notes for 3 years."
    ] }),
    !isLoading && filtered.length > 0 && (() => {
      const totalKg = filtered.reduce((s, r) => s + (r.quantityKg ? Number(r.quantityKg) : 0), 0);
      const byType = {};
      filtered.forEach((r) => {
        const key = FEED_TYPE_LABELS[r.feedType] ?? r.feedType;
        byType[key] = (byType[key] ?? 0) + (r.quantityKg ? Number(r.quantityKg) : 0);
      });
      const typeRows = Object.entries(byType).sort((a, b) => b[1] - a[1]);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Feed Events" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: filtered.length })
        ] }),
        totalKg > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 150 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Fed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: [
            totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "kg" })
          ] })
        ] }),
        typeRows.length > 1 && typeRows.map(([type, kg]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: type }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: [
            kg.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "kg" })
          ] })
        ] }, type))
      ] });
    })(),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: search ? "No matching records." : "No feed records yet. Add the first feeding event." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Herd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Feed Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Source Bin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Batch No." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Qty (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filtered.map((r) => {
        const bin = r.feedStockItemId ? binMap[r.feedStockItemId] : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: formatDate(r.feedDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm", children: r.herdId ? herdMap[r.herdId] ?? `Herd ${r.herdId}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: FEED_TYPE_LABELS[r.feedType] ?? r.feedType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: bin ? (bin.productName || bin.feedType) + (bin.storageLocation ? ` — ${bin.storageLocation}` : "") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: r.batchNumber || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: r.quantityKg ? `${Number(r.quantityKg).toLocaleString()} kg` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Feed Record" : "Record Feeding Event" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Link to a source bin and delivery batch to build the full traceability chain." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-800 uppercase tracking-wide", children: "Traceability Links" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Bin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.feedStockItemId || "__none__", onValueChange: handleBinSelect, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select feed bin…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked" }),
                  feedBins.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(b.id), children: [
                    b.productName || FEED_TYPE_LABELS[b.feedType] || b.feedType,
                    b.storageLocation ? ` — ${b.storageLocation}` : ""
                  ] }, b.id))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Delivery Batch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.deliveryId || "__none__", onValueChange: handleDeliverySelect, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select delivery…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked" }),
                  binDeliveries.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(d.id), children: [
                    d.deliveryDate?.slice(0, 10),
                    " — ",
                    d.batchNumber || d.lotNumber || "no batch",
                    " — ",
                    d.supplierName
                  ] }, d.id))
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Group" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdId || "__none__", onValueChange: (v) => setField("herdId", v === "__none__" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.feedDate, onChange: (e) => setField("feedDate", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.feedType || void 0, onValueChange: (v) => setField("feedType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(FEED_TYPE_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.quantityKg, onChange: (e) => setField("quantityKg", e.target.value), placeholder: "e.g. 500", min: "0", step: "0.1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplier, onChange: (e) => setField("supplier", e.target.value), placeholder: "Auto-filled from delivery" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch / Lot Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.batchNumber, onChange: (e) => setField("batchNumber", e.target.value), placeholder: "Auto-filled from delivery" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setField("notes", e.target.value), placeholder: "Ration changes, refusals, withdrawal periods, etc.", rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setShowForm(false);
            setEditing(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createMut.isPending || updateMut.isPending, children: createMut.isPending || updateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
            " Saving…"
          ] }) : editing ? "Update" : "Save Record" })
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Feed Record?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This will also restore the consumed quantity to the source bin. This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Delete" })
      ] })
    ] }) })
  ] });
}
const WATER_SOURCE_LABELS = {
  mains: "Mains Supply",
  borehole: "Borehole / Well",
  stream: "Stream / River",
  reservoir: "Farm Reservoir / Pond",
  rainwater: "Rainwater Harvesting",
  bowser: "Water Bowser / Tanker",
  other: "Other"
};
const EMPTY_WATER = {
  waterSource: "",
  sourceDescription: "",
  testDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  testResult: "",
  testPass: "true",
  notes: ""
};
function WaterCertificatesDialog({
  farmId,
  record,
  onClose
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [labRef, setLabRef] = reactExports.useState("");
  const [certTitle, setCertTitle] = reactExports.useState("");
  const qKey = ["water-attachments", record.id];
  const { data, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });
  const deleteMut = useMutation({
    mutationFn: async (docId) => {
      await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments/${docId}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const title = certTitle.trim() || (labRef.trim() ? `Lab Certificate — ${labRef.trim()}` : "Lab Certificate");
      await fetch(`/api/farms/${farmId}/water-records/${record.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          filePath: response.objectPath,
          referenceNumber: labRef.trim() || null,
          notes: null
        })
      });
      qc.invalidateQueries({ queryKey: qKey });
      setLabRef("");
      setCertTitle("");
    }
  });
  const attachments = data?.attachments ?? [];
  const sourceLabel = WATER_SOURCE_LABELS[record.waterSource] ?? record.waterSource;
  const testDateStr = record.testDate ? new Date(record.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4 text-blue-600" }),
        "Lab Certificates"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        sourceLabel,
        " · ",
        testDateStr,
        record.testResult ? ` · ${record.testResult}` : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2", children: "Attached Certificates" }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          " Loading…"
        ] }) : attachments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground italic py-2 border border-dashed rounded-lg px-3", children: "No certificates attached yet. Upload the lab report below to link it to this test record." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: attachments.map((att) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between bg-muted/40 rounded-lg px-3 py-2.5 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-blue-500 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: att.filePath ? `/api/storage${att.filePath}` : "#",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-sm font-medium text-blue-700 hover:underline block truncate",
                  children: att.title
                }
              ),
              att.referenceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Ref: ",
                att.referenceNumber
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Added ",
                new Date(att.createdAt).toLocaleDateString("en-GB")
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "shrink-0 text-destructive hover:text-destructive hover:bg-red-50 h-7 px-2",
              onClick: () => deleteMut.mutate(att.id),
              disabled: deleteMut.isPending,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }, att.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-dashed rounded-lg p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Attach Lab Certificate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Lab Reference Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. WA-2026-00291",
                value: labRef,
                onChange: (e) => setLabRef(e.target.value),
                className: "h-8 text-xs mt-1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Certificate Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. Annual water test — Borehole",
                value: certTitle,
                onChange: (e) => setCertTitle(e.target.value),
                className: "h-8 text-xs mt-1"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: "image/*,application/pdf",
              className: "hidden",
              onChange: (e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
                e.target.value = "";
              },
              disabled: isUploading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "text-xs h-8 gap-1.5", disabled: isUploading, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
            " Uploading ",
            progress,
            "%"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
            " Choose File"
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "PDF, JPG, PNG accepted" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Uploaded certificates are stored securely and linked to this specific water quality test record. They will appear in audit exports." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) })
  ] }) });
}
function WaterSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/water-records`;
  const { data, isLoading } = useQuery({
    queryKey: ["water-records", farmId],
    queryFn: () => fetch(base).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const [search, setSearch] = reactExports.useState("");
  const [yearFilterWater, setYearFilterWater] = reactExports.useState("all");
  const yearsWater = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_WATER);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [certRecord, setCertRecord] = reactExports.useState(null);
  const [waterLabId, setWaterLabId] = reactExports.useState(null);
  const [waterLabName, setWaterLabName] = reactExports.useState(null);
  const [mode, setMode] = reactExports.useState("log");
  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const createMut = useMutation({
    mutationFn: (body) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, testPass: body.testPass === "true" }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["water-records", farmId] });
      setShowForm(false);
      setForm(EMPTY_WATER);
      setWaterLabId(null);
      setWaterLabName(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, testPass: body.testPass === "true" }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["water-records", farmId] });
      setEditing(null);
      setShowForm(false);
      setForm(EMPTY_WATER);
      setWaterLabId(null);
      setWaterLabName(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["water-records", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setForm({
      waterSource: r.waterSource,
      sourceDescription: r.sourceDescription ?? "",
      testDate: r.testDate?.slice(0, 10) ?? "",
      testResult: r.testResult ?? "",
      testPass: r.testPass === false ? "false" : "true",
      notes: r.notes ?? ""
    });
    setWaterLabId(r.labSupplierId ?? null);
    setWaterLabName(null);
    setMode("edit");
    setShowForm(true);
  }
  function openEnterResult(r) {
    setEditing(r);
    setForm({
      waterSource: r.waterSource,
      sourceDescription: r.sourceDescription ?? "",
      testDate: r.testDate?.slice(0, 10) ?? "",
      testResult: r.testResult ?? "",
      testPass: r.testPass === false ? "false" : "true",
      notes: r.notes ?? ""
    });
    setWaterLabId(r.labSupplierId ?? null);
    setWaterLabName(null);
    setMode("result");
    setShowForm(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, labSupplierId: waterLabId ?? void 0 };
    if (editing) updateMut.mutate({ ...payload, id: editing.id });
    else createMut.mutate(payload);
  }
  const filtered = records.filter(
    (r) => ((WATER_SOURCE_LABELS[r.waterSource] ?? r.waterSource).toLowerCase().includes(search.toLowerCase()) || (r.testResult ?? "").toLowerCase().includes(search.toLowerCase())) && (yearFilterWater === "all" || String(r.testDate ?? "").startsWith(yearFilterWater))
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by source or result…", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterWater, onValueChange: setYearFilterWater, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsWater.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm(EMPTY_WATER);
          setMode("log");
          setShowForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Log Sample"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Annual testing required" }),
        " for pigs and poultry, and for all species where the water source is not mains supply. Use the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Lab Certs" }),
        " button on each record to attach your lab certificate — certificates are stored against the specific test and included in audit exports."
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: search ? "No matching records." : "No water quality records yet." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Test Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Water Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Location / Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Result" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: formatDate(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: WATER_SOURCE_LABELS[r.waterSource] ?? r.waterSource }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate", children: r.sourceDescription || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground", children: r.testResult || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: !r.testResult ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : r.testPass === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) : r.testPass ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
          " Pass"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
          " Fail"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate", children: r.notes || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          !r.testResult && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "text-xs h-7 gap-1 text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openEnterResult(r), children: "Enter results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "text-xs h-7 gap-1 text-blue-700 border-blue-200 hover:bg-blue-50",
              onClick: () => setCertRecord(r),
              title: "Attach or view lab certificates",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3" }),
                " Lab Certs"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mode === "log" ? "Log Water Quality Sample" : mode === "result" ? "Enter Water Test Results" : "Edit Water Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: mode === "log" ? "Record the sampling event now. Return to enter laboratory results once the report arrives." : mode === "result" && editing ? `Sample from ${formatDate(editing.testDate ?? "")}. Enter results from your lab report.` : "Log water source and annual test results for Red Tractor compliance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 mt-2", children: [
        mode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Water Source *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.waterSource || void 0, onValueChange: (v) => setField("waterSource", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select source" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(WATER_SOURCE_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate, onChange: (e) => setField("testDate", e.target.value) })
          ] })
        ] }),
        mode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Location / Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.sourceDescription,
              onChange: (e) => setField("sourceDescription", e.target.value),
              placeholder: form.waterSource === "borehole" ? "Name, depth (m), grid reference" : form.waterSource === "stream" ? "River / stream name and location" : form.waterSource === "reservoir" ? "Reservoir name and location" : form.waterSource === "bowser" ? "Vehicle registration and supplier" : form.waterSource === "mains" ? "Meter/supply point reference (optional)" : "Specific location or description of this source"
            }
          )
        ] }),
        mode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Testing Laboratory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            LabSelector,
            {
              farmId,
              value: waterLabId ?? void 0,
              labName: waterLabName ?? void 0,
              onChange: (id, name) => {
                setWaterLabId(id ?? null);
                setWaterLabName(name ?? null);
              }
            }
          )
        ] }),
        mode !== "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Result / Lab Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.testResult, onChange: (e) => setField("testResult", e.target.value), placeholder: "e.g. Pass — E. coli <1 CFU/100ml" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Outcome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.testPass, onValueChange: (v) => setField("testPass", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Pass — Suitable for livestock" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "Fail — Action required" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setField("notes", e.target.value), placeholder: "Lab reference, remedial actions, retest date, etc.", rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setShowForm(false);
            setEditing(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createMut.isPending || updateMut.isPending, children: createMut.isPending || updateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
            " Saving…"
          ] }) : mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Update" })
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Water Record?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Delete" })
      ] })
    ] }) }),
    certRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
      WaterCertificatesDialog,
      {
        farmId,
        record: certRecord,
        onClose: () => setCertRecord(null)
      }
    )
  ] });
}
const ANIMAL_SPECIES_FALLBACK = ["Cattle", "Sheep", "Pigs", "Goats", "Deer", "Horses", "Poultry", "Other"];
const ANIMAL_STATUS_LABELS = {
  active: "On Farm",
  sold: "Sold / Moved Off",
  dead: "Deceased",
  removed: "Removed"
};
const MOVEMENT_TYPE_LABELS = {
  arrival: "Arrival / Purchase",
  departure: "Departure / Sale",
  "inter-farm": "Inter-Farm Move",
  "within-farm": "Within-Farm Move",
  "to-slaughter": "Off to Slaughter",
  "to-show": "To Show / Market",
  temporary: "Temporary Move",
  other: "Other"
};
const OUTCOME_COLOURS = {
  clear: "bg-green-50 text-green-700",
  restricted: "bg-red-50 text-red-700",
  breakdown: "bg-red-100 text-red-800",
  inconclusive: "bg-amber-50 text-amber-700"
};
const DOC_TYPE_LABELS = {
  passport: "Cattle Passport",
  tb_test: "TB Test Certificate",
  movement_licence: "Movement Licence",
  vet_certificate: "Veterinary Certificate",
  johnes_test: "Johne's Disease Test",
  breed_certificate: "Breed / Pedigree Certificate",
  health_certificate: "Health Certificate",
  export_certificate: "Export Certificate",
  other: "Other Document"
};
function AnimalQuickViewDialog({ animal, herds, farmId, onClose, onEdit, onProfile }) {
  const herdName = (herdId) => herds.find((h) => h.id === herdId)?.name ?? "Unassigned";
  const earTag = (animal.earTagNumber || animal.tagNumber || "").trim().toUpperCase();
  const { data: tbData } = useQuery({
    queryKey: ["tb-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`).then((r) => r.json()),
    enabled: !!earTag
  });
  const tbHistory = (tbData?.records ?? []).filter((t) => {
    if (!earTag || !t.animalEarTags) return false;
    try {
      const tags = JSON.parse(t.animalEarTags);
      return tags.map((x) => x.trim().toUpperCase()).includes(earTag);
    } catch {
      return t.animalEarTags.split("\n").map((x) => x.trim().toUpperCase()).includes(earTag);
    }
  }).sort((a, b) => b.testDate.localeCompare(a.testDate));
  const statusColor = {
    active: "bg-green-50 text-green-700",
    sold: "bg-amber-50 text-amber-700",
    dead: "bg-red-50 text-red-700",
    removed: "bg-gray-50 text-gray-600"
  }[animal.status] ?? "bg-gray-50 text-gray-600";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, "aria-describedby": void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-base", children: animal.earTagNumber || animal.tagNumber || `Animal #${animal.id}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`, children: ANIMAL_STATUS_LABELS[animal.status] ?? animal.status })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "UK Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-bold text-gray-900", children: animal.earTagNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "EID Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-gray-700", children: animal.eidNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capitalize", children: animal.species })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: animal.breed || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capitalize", children: animal.sex || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "Date of Birth" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(animal.dateOfBirth) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "Herd / Flock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: herdName(animal.herdId) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "Arrived on Holding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(animal.acquisitionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: animal.acquisitionSource || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "Alt. ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: animal.tagNumber || "—" })
        ] })
      ] }),
      animal.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-semibold mb-0.5", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: animal.notes })
      ] }),
      earTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md overflow-hidden mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "TB Test History" }),
        tbHistory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-2 text-xs text-muted-foreground italic", children: "No SICCT tests recorded for this ear tag" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-1.5 font-medium text-muted-foreground", children: "Injection" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-1.5 font-medium text-muted-foreground", children: "Stage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-1.5 font-medium text-muted-foreground", children: "Result" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: tbHistory.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 font-medium", children: formatDate(t.testDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: t.readingDate ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 font-semibold", children: "✓ Complete" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 font-semibold", children: "⏳ Reading pending" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: t.readingDate ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex text-xs font-semibold rounded-full px-1.5 py-0.5 ${OUTCOME_COLOURS[t.outcome] ?? "bg-gray-100 text-gray-700"}`, children: t.outcome.toUpperCase() }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500 text-xs italic", children: "Awaiting reading" }) })
          ] }, t.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
        onEdit(animal);
        onClose();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
        " Edit"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        onProfile(animal);
        onClose();
      }, className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
        " Full Animal Profile"
      ] })
    ] })
  ] }) });
}
function AnimalProfileDialog({ animal, farmId, onClose, onEdit }) {
  const [tab, setTab] = reactExports.useState("overview");
  const { data, isLoading } = useQuery({
    queryKey: ["animal-profile", farmId, animal.id],
    queryFn: () => fetch(`/api/farms/${farmId}/animals/${animal.id}/profile`, { credentials: "include" }).then((r) => r.json())
  });
  const statusColor = {
    active: "bg-green-100 text-green-800",
    sold: "bg-amber-100 text-amber-800",
    dead: "bg-red-100 text-red-800",
    removed: "bg-gray-100 text-gray-700"
  }[animal.status] ?? "bg-gray-100 text-gray-700";
  const isCattle = animal.species?.toLowerCase() === "cattle";
  const isFemale = animal.sex === "female";
  const showBreeding = isCattle && isFemale;
  const { data: docsData, isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ["animal-documents", farmId, animal.id],
    queryFn: () => fetch(`/api/farms/${farmId}/animals/${animal.id}/documents`, { credentials: "include" }).then((r) => r.json())
  });
  const earTag = (animal.earTagNumber || animal.tagNumber || "").trim().toUpperCase();
  const { data: tbData } = useQuery({
    queryKey: ["tb-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`).then((r) => r.json()),
    enabled: !!earTag
  });
  const animalTbHistory = (tbData?.records ?? []).filter((t) => {
    if (!earTag || !t.animalEarTags) return false;
    try {
      const tags = JSON.parse(t.animalEarTags);
      return tags.map((x) => x.trim().toUpperCase()).includes(earTag);
    } catch {
      return t.animalEarTags.split("\n").map((x) => x.trim().toUpperCase()).includes(earTag);
    }
  }).sort((a, b) => b.testDate.localeCompare(a.testDate));
  const [docType, setDocType] = reactExports.useState("other");
  const [docTitle, setDocTitle] = reactExports.useState("");
  const [docNotes, setDocNotes] = reactExports.useState("");
  const [deletingDocId, setDeletingDocId] = reactExports.useState(null);
  const { uploadFile: uploadDoc, isUploading: isUploadingDoc } = useUpload({
    onSuccess: async (response) => {
      const path = response.objectPath ?? "";
      const name = response.filename ?? path.split("/").pop() ?? "Document";
      const title = docTitle.trim() || DOC_TYPE_LABELS[docType] || "Document";
      await fetch(`/api/farms/${farmId}/animals/${animal.id}/documents`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, documentType: docType, documentUrl: path, documentName: name, notes: docNotes.trim() || null })
      });
      setDocTitle("");
      setDocNotes("");
      refetchDocs();
    }
  });
  async function deleteDoc(docId) {
    setDeletingDocId(docId);
    await fetch(`/api/farms/${farmId}/animals/${animal.id}/documents/${docId}`, { method: "DELETE", credentials: "include" });
    setDeletingDocId(null);
    refetchDocs();
  }
  const { data: vaccData, isLoading: vaccLoading } = useQuery({
    queryKey: ["animal-vaccination-history", farmId, animal.id],
    queryFn: () => fetch(`/api/farms/${farmId}/animals/${animal.id}/vaccination-history`, { credentials: "include" }).then((r) => r.json())
  });
  const vaccRecords = vaccData?.records ?? [];
  const tabDef = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    { key: "medicines", label: "Medicines", icon: Stethoscope, count: data?.stats.medicineCount },
    { key: "vaccinations", label: "Vaccinations", icon: Syringe, count: vaccRecords.length || void 0 },
    { key: "movements", label: "Movements", icon: FileText, count: data?.stats.movementCount },
    ...showBreeding ? [{ key: "breeding", label: "Calving", icon: CircleCheck, count: data?.stats.calvingCount }] : [],
    { key: "health", label: "Health Incidents", icon: TriangleAlert, count: data?.stats.diseaseIncidentCount },
    ...earTag ? [{ key: "tb-tests", label: "TB Tests", icon: Stethoscope, count: animalTbHistory.length }] : [],
    { key: "documents", label: "Documents", icon: Paperclip, count: docsData?.documents.length }
  ];
  function printAnimalReport() {
    if (!data) return;
    const d = data;
    const a = animal;
    const fmtD = (s) => s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    const overviewRows = [
      ["UK Ear Tag", a.earTagNumber || "—"],
      ["EID Transponder", a.eidNumber || "—"],
      ["Species / Breed", [a.species, a.breed].filter(Boolean).join(" · ") || "—"],
      ["Sex", a.sex || "—"],
      ["Date of Birth", fmtD(a.dateOfBirth)],
      ["Herd / Flock", d.herd ? `${d.herd.name}${d.herd.herdNumber ? ` (${d.herd.herdNumber})` : ""}` : "—"],
      ["Arrived on Holding", fmtD(a.acquisitionDate)],
      ["Acquired From", a.acquisitionSource || "—"],
      ["Current Status", ANIMAL_STATUS_LABELS[a.status] ?? a.status]
    ];
    const overviewHtml = `<div class="section-head">Animal Overview</div><table><tbody>${overviewRows.map(([k, v]) => `<tr><td style="font-weight:600;width:35%">${k}</td><td>${v}</td></tr>`).join("")}${a.notes ? `<tr><td style="font-weight:600">Notes</td><td>${a.notes}</td></tr>` : ""}</tbody></table>`;
    const medicinesHtml = d.medicines.length === 0 ? "" : `<div class="section-head">Medicine Records (${d.medicines.length})</div><table><thead><tr><th>Date</th><th>Medicine</th><th>Dosage</th><th>Route</th><th>Administered By</th><th>Vet</th><th>Withdrawal Ends</th><th>Reason</th><th>Type</th></tr></thead><tbody>${d.medicines.map((m) => `<tr><td>${fmtD(m.administeredDate)}</td><td>${m.medicineName}</td><td>${m.dosage || "—"}</td><td>${m.administrationRoute || "—"}</td><td>${m.administeredBy || "—"}</td><td>${m.vetName || "—"}</td><td>${fmtD(m.withdrawalEndDate)}</td><td>${m.reason || "—"}</td><td>${m._source === "herd_treatment" ? m.treatmentScope === "group" ? "Group" : "Herd" : "Individual"}</td></tr>`).join("")}</tbody></table>`;
    const movementsHtml = d.movements.length === 0 ? "" : `<div class="section-head">Movement History (${d.movements.length})</div><table><thead><tr><th>Date</th><th>Type</th><th>From</th><th>To</th><th>Licence No.</th><th>BCMS Ref</th><th>Reason</th></tr></thead><tbody>${d.movements.map((m) => `<tr><td>${fmtD(m.movementDate)}</td><td>${MOVEMENT_TYPE_LABELS[m.movementType] ?? m.movementType}</td><td>${m.fromLocation || "—"}</td><td>${m.toLocation || "—"}</td><td>${m.licenceNumber || "—"}</td><td>${m.bcmsSubmissionRef || "—"}</td><td>${m.reason || "—"}</td></tr>`).join("")}</tbody></table>`;
    const tbHtml = animalTbHistory.length === 0 ? "" : `<div class="section-head">TB Test History (${animalTbHistory.length})</div><table><thead><tr><th>Injection Date</th><th>Reading Date</th><th>Test Type</th><th>Herd / Flock</th><th>Testing Vet</th><th>Stage</th><th>Result</th><th>Reactors</th><th>Inconc.</th></tr></thead><tbody>${animalTbHistory.map((t) => `<tr><td>${fmtD(t.testDate)}</td><td>${fmtD(t.readingDate)}</td><td>${t.testType.replace(/-/g, " ")}</td><td>${t.herdFlockRef || "—"}</td><td>${t.testingVet || "—"}</td><td>${t.readingDate ? "Complete" : "Reading pending"}</td><td>${t.readingDate ? t.outcome.toUpperCase() : "Awaiting"}</td><td>${t.reactors}</td><td>${t.inconclusives}</td></tr>`).join("")}</tbody></table>`;
    const healthHtml = !d.diseaseIncidents || d.diseaseIncidents.length === 0 ? "" : `<div class="section-head">Health & Disease Incidents (${d.diseaseIncidents.length})</div><table><thead><tr><th>Date</th><th>Type</th><th>Status</th><th>Symptoms</th><th>Diagnosis</th><th>Vet</th><th>Treatment</th></tr></thead><tbody>${d.diseaseIncidents.map((inc) => `<tr><td>${fmtD(inc.incidentDate)}</td><td style="text-transform:capitalize">${inc.incidentType?.replace(/_/g, " ") || "—"}</td><td style="text-transform:capitalize">${inc.status}${inc._involvedAs === "mortality" ? " (Mortality)" : ""}</td><td>${inc.symptomsObserved || "—"}</td><td>${inc.confirmedDiagnosis || inc.suspectedDiagnosis || "—"}</td><td>${inc.vetName || (inc.vetCalled ? "Yes" : "No")}</td><td>${inc.treatmentGiven || "—"}</td></tr>`).join("")}</tbody></table>`;
    const calvingHtml = showBreeding && d.calvings.length > 0 ? `<div class="section-head">Calving Records (${d.calvings.length})</div><table><thead><tr><th>Date</th><th>Calves</th><th>Calf Sex</th><th>Calf Tag</th><th>Outcome</th><th>Ease Score</th><th>Assistance</th><th>Vet</th></tr></thead><tbody>${d.calvings.map((c) => `<tr><td>${fmtD(c.calvingDate)}</td><td>${c.numberOfCalves}</td><td>${c.calfSex || "—"}</td><td>${c.calfEarTag || "—"}</td><td>${c.calfOutcome || "—"}</td><td>${c.calvingEaseScore ?? "—"}</td><td>${c.assistanceRequired ? "Yes" : "No"}</td><td>${c.vetAttended ? "Yes" : "No"}</td></tr>`).join("")}</tbody></table>` : "";
    const mortalityHtml = d.mortality ? `<div class="section-head">Mortality &amp; Disposal Record</div><table><tbody>
      <tr><td style="font-weight:600;width:35%">Date of Death</td><td>${fmtD(d.mortality.dateOfDeath)}</td></tr>
      <tr><td style="font-weight:600">Cause of Death</td><td>${d.mortality.causeOfDeath}</td></tr>
      <tr><td style="font-weight:600">Disposal Method</td><td>${d.mortality.disposalMethod}</td></tr>
      ${d.mortality.disposalOperator ? `<tr><td style="font-weight:600">Disposal Operator</td><td>${d.mortality.disposalOperator}</td></tr>` : ""}
      ${d.mortality.disposalRef ? `<tr><td style="font-weight:600">Disposal Reference</td><td>${d.mortality.disposalRef}</td></tr>` : ""}
      ${d.mortality.contractorName ? `<tr><td style="font-weight:600">Collection Contractor</td><td>${d.mortality.contractorName}</td></tr>` : ""}
      ${d.mortality.contractorApprovalNumber ? `<tr><td style="font-weight:600">APHA Approval No.</td><td>${d.mortality.contractorApprovalNumber}</td></tr>` : ""}
      ${d.mortality.contractorOperatorType ? `<tr><td style="font-weight:600">Operator Type</td><td>${d.mortality.contractorOperatorType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td></tr>` : ""}
      <tr><td style="font-weight:600">Vet Attended</td><td>${d.mortality.veterinaryAttended ? d.mortality.vetName ? `Yes — ${d.mortality.vetName}` : "Yes" : "No"}</td></tr>
      <tr><td style="font-weight:600">Post-Mortem</td><td>${d.mortality.postMortemCarriedOut ? d.mortality.postMortemFindings ? `Yes — ${d.mortality.postMortemFindings}` : "Yes" : "No"}</td></tr>
      <tr><td style="font-weight:600">BCMS Notified</td><td>${d.mortality.bcmsNotified ? d.mortality.bcmsNotificationRef ? `Yes — Ref: ${d.mortality.bcmsNotificationRef}` : "Yes" : "No"}</td></tr>
      ${d.mortality.notes ? `<tr><td style="font-weight:600">Notes</td><td>${d.mortality.notes}</td></tr>` : ""}
    </tbody></table>` : "";
    const html = buildProReport({
      title: `Animal Record — ${a.earTagNumber || a.tagNumber || `Animal #${a.id}`}`,
      subtitle: `${a.species}${a.breed ? ` · ${a.breed}` : ""}${a.sex ? ` · ${a.sex}` : ""}`,
      landscape: false,
      footerNote: "This report documents the full history of this animal on the holding. Retain for a minimum of 3 years.",
      tableHtml: overviewHtml + medicinesHtml + movementsHtml + tbHtml + healthHtml + calvingHtml + mortalityHtml
    });
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "56rem", maxHeight: "88vh", display: "flex", flexDirection: "column", padding: 0 }, "aria-describedby": void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "20px 24px 0 24px", borderBottom: "1px solid #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1.15rem", fontWeight: 700, margin: 0 }, children: animal.earTagNumber || animal.tagNumber || `Animal #${animal.id}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`, children: ANIMAL_STATUS_LABELS[animal.status] ?? animal.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, fontSize: "0.82rem", color: "#6b7280" }, children: [
            animal.species,
            animal.breed ? ` · ${animal.breed}` : "",
            animal.sex ? ` · ${animal.sex}` : "",
            data?.herd ? ` · ${data.herd.name}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          onEdit(animal);
          onClose();
        }, className: "gap-1.5 shrink-0 mr-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
          " Edit Record"
        ] })
      ] }),
      data?.mortality && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 12, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: "0.8rem", color: "#991b1b" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: 700, marginBottom: 4 }, children: [
          "⚠ Deceased — ",
          formatDate(data.mortality.dateOfDeath)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cause:" }),
            " ",
            data.mortality.causeOfDeath
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Disposal method:" }),
            " ",
            data.mortality.disposalMethod
          ] }),
          data.mortality.disposalOperator && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Disposal operator:" }),
            " ",
            data.mortality.disposalOperator
          ] }),
          data.mortality.disposalRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Disposal ref:" }),
            " ",
            data.mortality.disposalRef
          ] }),
          data.mortality.contractorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Collection contractor:" }),
            " ",
            data.mortality.contractorName
          ] }),
          data.mortality.contractorApprovalNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "APHA approval no.:" }),
            " ",
            data.mortality.contractorApprovalNumber
          ] }),
          data.mortality.veterinaryAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Vet attended:" }),
            " ",
            data.mortality.vetName || "Yes"
          ] }),
          data.mortality.postMortemCarriedOut && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Post-mortem:" }),
            " ",
            data.mortality.postMortemFindings || "Carried out"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BCMS notified:" }),
            " ",
            data.mortality.bcmsNotified ? data.mortality.bcmsNotificationRef ? `Yes — ref ${data.mortality.bcmsNotificationRef}` : "Yes" : "No"
          ] })
        ] }),
        data.mortality.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 4, color: "#7f1d1d" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Notes:" }),
          " ",
          data.mortality.notes
        ] })
      ] }),
      data && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }, children: [
        { label: "Medicine records", val: data.stats.medicineCount },
        { label: "Movements", val: data.stats.movementCount },
        { label: "Calvings", val: data.stats.calvingCount },
        { label: "Mastitis episodes", val: data.stats.mastitisCount },
        { label: "Health incidents", val: data.stats.diseaseIncidentCount, alert: data.stats.diseaseIncidentCount > 0 }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, lineHeight: 1, color: s.alert ? "#b45309" : s.val > 0 ? "#166534" : "#9ca3af" }, children: s.val }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.65rem", color: "#9ca3af", marginTop: 2 }, children: s.label })
      ] }, s.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 0, borderBottom: "none" }, children: tabDef.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab(t.key),
          style: {
            padding: "8px 16px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "0.83rem",
            fontWeight: 600,
            color: tab === t.key ? "#166534" : "#6b7280",
            borderBottom: tab === t.key ? "2px solid #166534" : "2px solid transparent",
            display: "flex",
            alignItems: "center",
            gap: 6
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { size: 13 }),
            t.label,
            t.count !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", background: tab === t.key ? "#dcfce7" : "#f3f4f6", color: tab === t.key ? "#166534" : "#6b7280", padding: "1px 5px", borderRadius: 10, fontWeight: 700 }, children: t.count })
          ]
        },
        t.key
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, overflowY: "auto", padding: "16px 24px 20px" }, children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", padding: 40 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : !data ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", textAlign: "center", padding: 40 }, children: "Failed to load profile." }) : tab === "overview" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }, children: [
      [
        { label: "UK Ear Tag", val: animal.earTagNumber, mono: true },
        { label: "EID Transponder", val: animal.eidNumber, mono: true },
        { label: "Alt. / Internal ID", val: animal.tagNumber, mono: true },
        { label: "Species", val: animal.species, capitalize: true },
        { label: "Breed", val: animal.breed },
        { label: "Sex", val: animal.sex, capitalize: true },
        { label: "Date of Birth", val: formatDate(animal.dateOfBirth) },
        { label: "Age", val: animal.dateOfBirth ? `${Math.floor((Date.now() - new Date(animal.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1e3))} years` : null },
        { label: "Herd / Flock", val: data.herd ? `${data.herd.name} (${data.herd.herdNumber || "no reg. no."})` : null },
        { label: "Arrival Date (on Holding)", val: formatDate(animal.acquisitionDate) },
        { label: "Acquired From", val: animal.acquisitionSource },
        { label: "QR / Animal Code", val: animal.animalCode, mono: true }
      ].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "0.68rem", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }, children: f.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "0.85rem", color: f.val ? "#111827" : "#d1d5db", fontFamily: f.mono ? "monospace" : void 0, textTransform: f.capitalize ? "capitalize" : void 0 }, children: f.val || "—" })
      ] }, f.label)),
      animal.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 2px", fontSize: "0.68rem", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "0.85rem", color: "#374151", whiteSpace: "pre-line" }, children: animal.notes })
      ] })
    ] }) : tab === "medicines" ? data.medicines.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 0", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No medicine records linked to this animal." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem" }, children: "Records appear here when a medicine is administered to this animal individually, or when a group / whole-herd treatment is recorded for the herd this animal belongs to." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: data.medicines.map((m) => {
      const isHerdTreatment = m._source === "herd_treatment";
      const withdrawalActive = m.withdrawalEndDate && new Date(m.withdrawalEndDate) > /* @__PURE__ */ new Date();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: isHerdTreatment ? "#f0fdf4" : "#f9fafb", border: `1px solid ${isHerdTreatment ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 8, padding: "10px 14px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 600, fontSize: "0.9rem", color: "#111827" }, children: m.medicineName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }, children: [
              formatDate(m.administeredDate),
              m.administeredBy ? ` · ${m.administeredBy}` : "",
              m.vetName ? ` · ${m.vetName}` : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }, children: [
            isHerdTreatment && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 700, color: "#166534", background: "#dcfce7", border: "1px solid #86efac", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }, children: m.treatmentScope === "group" ? "GROUP TREATMENT" : "HERD TREATMENT" }),
            withdrawalActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 700, color: "#854d0e", background: "#fef9c3", border: "1px solid #fde047", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }, children: "WITHDRAWAL ACTIVE" })
          ] })
        ] }),
        (m.dosage || m.administrationRoute || m.reason) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "6px 0 0", fontSize: "0.78rem", color: "#374151" }, children: [m.dosage && `Dosage: ${m.dosage}`, m.administrationRoute && `Route: ${m.administrationRoute}`, m.reason && `Reason: ${m.reason}`].filter(Boolean).join("  ·  ") }),
        (m.batchNumber || m.medicineRef) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "4px 0 0", fontSize: "0.72rem", color: "#6b7280", fontFamily: "monospace" }, children: [
          m.batchNumber && `Batch: ${m.batchNumber}`,
          m.batchNumber && m.medicineRef && "  ·  ",
          m.medicineRef && `Ref: ${m.medicineRef}`
        ] }),
        m.withdrawalEndDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "4px 0 0", fontSize: "0.75rem", color: "#854d0e" }, children: [
          "Withdrawal ends: ",
          formatDate(m.withdrawalEndDate),
          " (",
          m.withdrawalPeriodDays,
          " days)"
        ] })
      ] }, m.id);
    }) }) : tab === "vaccinations" ? vaccLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: "40px 0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-6 h-6 mx-auto text-gray-400" }) }) : vaccRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 0", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Syringe, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0 }, children: "No vaccination records found for this animal." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", marginTop: 4 }, children: "Vaccination events are pulled automatically from the vaccination programmes recorded for this animal's herd or flock. Record vaccines in the relevant production module (Sheep Production → Vaccination, Pig Production → Vaccination, etc.)." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: vaccRecords.map((v, i) => {
      const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
      const sourceLabel = v.source === "medicine_record" ? "Medicine Record" : "Vaccination Programme";
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = v.nextDueDate ? new Date(v.nextDueDate) : null;
      const isOverdue = dueDate && dueDate < today;
      const isDueSoon = dueDate && !isOverdue && dueDate <= new Date(today.getTime() + 30 * 864e5);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", background: "#fafafa" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: [
            v.vaccineProduct,
            v.vetPrescribed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 6, fontSize: "0.68rem", fontWeight: 700, padding: "1px 5px", borderRadius: 9999, background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }, children: "POM-V" })
          ] }),
          v.vaccinationCategory && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }, children: v.vaccinationCategory }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "3px 0 0", fontSize: "0.75rem", color: "#6b7280" }, children: [
            fmtD(v.date),
            v.ageGroupTreated ? ` · ${v.ageGroupTreated}` : "",
            v.numberTreated != null ? ` · ${v.numberTreated} treated` : "",
            v.administrationRoute ? ` · ${v.administrationRoute}` : "",
            v.administeredBy ? ` · ${v.administeredBy}` : ""
          ] }),
          v.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.72rem", color: "#9ca3af" }, children: [
            "Batch: ",
            v.batchNumber
          ] }),
          v.withdrawalPeriodDays != null && v.withdrawalPeriodDays > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.72rem", color: "#b45309", fontWeight: 600 }, children: [
            "Withdrawal: ",
            v.withdrawalPeriodDays,
            " days"
          ] }),
          v.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "4px 0 0", fontSize: "0.75rem", color: "#374151", fontStyle: "italic" }, children: v.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: v.source === "medicine_record" ? "#f3f4f6" : "#f0fdf4", color: v.source === "medicine_record" ? "#6b7280" : "#166534", border: `1px solid ${v.source === "medicine_record" ? "#e5e7eb" : "#bbf7d0"}` }, children: sourceLabel }),
          v.nextDueDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: isOverdue ? "#fef2f2" : isDueSoon ? "#fffbeb" : "#f9fafb", color: isOverdue ? "#991b1b" : isDueSoon ? "#92400e" : "#6b7280", border: `1px solid ${isOverdue ? "#fca5a5" : isDueSoon ? "#fde68a" : "#e5e7eb"}` }, children: isOverdue ? "⚠ Booster overdue" : isDueSoon ? "⚠ Booster due soon" : `Next: ${fmtD(v.nextDueDate)}` })
        ] })
      ] }) }, `${v.source}-${v.id}-${i}`);
    }) }) : tab === "movements" ? data.movements.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 0", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No movement records linked to this animal." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem" }, children: "Records appear here when a movement is logged against this specific animal in the Movement Records module." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: data.movements.map((mv) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 12, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 6 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#111827" }, children: MOVEMENT_TYPE_LABELS[mv.movementType] ?? mv.movementType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "0.75rem", color: "#9ca3af" }, children: formatDate(mv.movementDate) })
        ] }),
        (mv.fromLocation || mv.toLocation) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "3px 0 0", fontSize: "0.78rem", color: "#6b7280" }, children: [
          mv.fromLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "From: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: mv.fromLocation })
          ] }),
          mv.fromLocation && mv.toLocation && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: " → " }),
          mv.toLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "To: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: mv.toLocation })
          ] })
        ] }),
        (mv.licenceNumber || mv.bcmsSubmissionRef) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "3px 0 0", fontSize: "0.72rem", color: "#9ca3af", fontFamily: "monospace" }, children: [
          mv.licenceNumber && `Licence: ${mv.licenceNumber}`,
          mv.licenceNumber && mv.bcmsSubmissionRef && "  ·  ",
          mv.bcmsSubmissionRef && `BCMS ref: ${mv.bcmsSubmissionRef}`
        ] })
      ] })
    ] }, mv.id)) }) : tab === "breeding" ? data.calvings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 0", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No calving records linked to this cow." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem" }, children: "Records appear here when a calving event is logged against this cow in the Dairy / Calving module." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: data.calvings.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#14532d" }, children: [
            "Calving #",
            data.calvings.length - i,
            " — ",
            formatDate(c.calvingDate)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.75rem", color: "#166534" }, children: [
            c.numberOfCalves,
            " ",
            c.numberOfCalves === 1 ? "calf" : "calves",
            " · ",
            c.calfSex || "sex unknown",
            " · Outcome: ",
            c.calfOutcome || "not recorded"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
          c.assistanceRequired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 600, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "1px 5px", borderRadius: 4 }, children: "Assisted" }),
          c.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 600, background: "#ede9fe", color: "#6d28d9", border: "1px solid #c4b5fd", padding: "1px 5px", borderRadius: 4 }, children: "Vet" })
        ] })
      ] }),
      (c.calfEarTag || c.sireBreed) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "5px 0 0", fontSize: "0.78rem", color: "#374151" }, children: [
        c.calfEarTag && `Calf tag: ${c.calfEarTag}`,
        c.calfEarTag && c.sireBreed && "  ·  ",
        c.sireBreed && `Sire breed: ${c.sireBreed}`
      ] }),
      c.cowComplications && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "4px 0 0", fontSize: "0.75rem", color: "#b45309" }, children: [
        "Complications: ",
        c.cowComplications
      ] }),
      !c.bcmsPassportApplied && isCattle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "4px 0 0", fontSize: "0.72rem", color: "#ef4444", fontWeight: 600 }, children: "⚠ BCMS passport not yet applied for" })
    ] }, c.id)) }) : tab === "health" ? !data.diseaseIncidents || data.diseaseIncidents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 0", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No health or disease incidents recorded for this animal." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem" }, children: "Incidents appear here when this animal is listed in a Disease & Incident Log entry as affected or a mortality." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: data.diseaseIncidents.map((inc) => {
      const isMortality = inc._involvedAs === "mortality";
      const statusColors = {
        open: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
        monitoring: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
        resolved: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" }
      };
      const sc = statusColors[inc.status] ?? statusColors.open;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: isMortality ? "#fef2f2" : "#fff", border: `1px solid ${isMortality ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 8, padding: "10px 14px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.88rem", color: "#111827", textTransform: "capitalize" }, children: inc.incidentType?.replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: "1px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }, children: inc.status }),
              isMortality && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }, children: "MORTALITY" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "0.75rem", color: "#6b7280" }, children: new Date(inc.incidentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 4 }, children: inc.vetCalled && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.65rem", fontWeight: 700, background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe", padding: "1px 6px", borderRadius: 4 }, children: [
            "Vet called",
            inc.vetName ? ` — ${inc.vetName}` : ""
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "5px 0 0", fontSize: "0.8rem", color: "#374151" }, children: inc.symptomsObserved }),
        (inc.confirmedDiagnosis || inc.suspectedDiagnosis) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "3px 0 0", fontSize: "0.76rem", color: "#374151" }, children: inc.confirmedDiagnosis ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Confirmed:" }),
          " ",
          inc.confirmedDiagnosis
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Suspected:" }),
          " ",
          inc.suspectedDiagnosis
        ] }) }),
        inc.treatmentGiven && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "3px 0 0", fontSize: "0.76rem", color: "#166534" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Treatment:" }),
          " ",
          inc.treatmentGiven
        ] }),
        inc.vetVisitDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "3px 0 0", fontSize: "0.72rem", color: "#6b7280" }, children: [
          "Vet visit: ",
          new Date(inc.vetVisitDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        ] })
      ] }, inc.id);
    }) }) : tab === "documents" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontWeight: 700, fontSize: "0.82rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Attach a New Document" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }, children: "Document Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: docType,
                onChange: (e) => setDocType(e.target.value),
                style: { width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: "0.85rem", background: "#fff", color: "#111827" },
                children: Object.entries(DOC_TYPE_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }, children: [
              "Title ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#9ca3af" }, children: "(optional — defaults to type)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: docTitle,
                onChange: (e) => setDocTitle(e.target.value),
                placeholder: DOC_TYPE_LABELS[docType] ?? "Document title",
                style: { width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: "0.85rem", color: "#111827", boxSizing: "border-box" }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "2px dashed #d1d5db", borderRadius: 8, cursor: "pointer", background: "#fff", transition: "border-color 0.15s" }, children: [
          isUploadingDoc ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, style: { animation: "spin 1s linear infinite", color: "#6366f1" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", color: "#6b7280" }, children: "Uploading…" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16, style: { color: "#9ca3af" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", color: "#6b7280" }, children: "Choose a photo, scan or PDF to upload" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf", style: { display: "none" }, onChange: (e) => {
            if (e.target.files?.[0]) uploadDoc(e.target.files[0]);
          } })
        ] })
      ] }),
      docsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: "24px 0", color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 20, style: { margin: "0 auto" } }) }) : !docsData?.documents.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "32px 0", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0 }, children: "No documents attached yet." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "4px 0 0", fontSize: "0.78rem" }, children: "Use the upload zone above to add a cattle passport, TB certificate, or any other official document." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: docsData.documents.map((doc) => {
        const typeColor = {
          passport: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
          tb_test: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
          movement_licence: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
          vet_certificate: { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
          johnes_test: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
          breed_certificate: { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
          health_certificate: { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
          export_certificate: { bg: "#fefce8", text: "#854d0e", border: "#fef08a" }
        };
        const colors = typeColor[doc.documentType] ?? { bg: "#f9fafb", text: "#374151", border: "#e5e7eb" };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 18, style: { color: "#6b7280", flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.62rem", fontWeight: 700, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 4, padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }, children: DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: doc.documentUrl, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.85rem", fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }, children: doc.title }),
            doc.documentName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#9ca3af", marginLeft: 6 }, children: doc.documentName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "1px 0 0", fontSize: "0.72rem", color: "#9ca3af" }, children: new Date(doc.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }),
            doc.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }, children: doc.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => deleteDoc(doc.id),
              disabled: deletingDocId === doc.id,
              style: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4, flexShrink: 0, opacity: deletingDocId === doc.id ? 0.4 : 1 },
              children: deletingDocId === doc.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
            }
          )
        ] }, doc.id);
      }) })
    ] }) : tab === "tb-tests" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: animalTbHistory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 0", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No SICCT TB tests recorded for this ear tag." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem" }, children: "Tests appear here when this animal's ear tag is listed in a TB Test entry under Livestock → TB Tests." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: animalTbHistory.map((t) => {
      const stageDone = !!t.readingDate;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: `1px solid ${stageDone ? "#bbf7d0" : "#fde68a"}`, borderRadius: 8, padding: "10px 14px", background: stageDone ? "#f0fdf4" : "#fffbeb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: t.testType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }, children: [
              "Stage 1 — Injection: ",
              new Date(t.testDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              t.herdFlockRef ? `  ·  ${t.herdFlockRef}` : "",
              t.testingVet ? `  ·  Vet: ${t.testingVet}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.75rem", color: stageDone ? "#166534" : "#92400e" }, children: [
              "Stage 2 — Reading: ",
              t.readingDate ? new Date(t.readingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Pending (72 h after injection)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px", borderRadius: 9999, background: stageDone ? "#dcfce7" : "#fef9c3", color: stageDone ? "#166534" : "#92400e", border: `1px solid ${stageDone ? "#86efac" : "#fde047"}` }, children: stageDone ? "✓ Both stages complete" : "⏳ Reading pending" }),
            stageDone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px", borderRadius: 9999, ...OUTCOME_COLOURS[t.outcome] ? {} : {}, background: t.outcome === "clear" ? "#f0fdf4" : t.outcome === "inconclusive" ? "#fffbeb" : "#fef2f2", color: t.outcome === "clear" ? "#166534" : t.outcome === "inconclusive" ? "#92400e" : "#991b1b", border: `1px solid ${t.outcome === "clear" ? "#bbf7d0" : t.outcome === "inconclusive" ? "#fde68a" : "#fca5a5"}` }, children: t.outcome.toUpperCase() })
          ] })
        ] }),
        stageDone && (t.reactors > 0 || t.inconclusives > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "6px 0 0", fontSize: "0.78rem", color: "#991b1b", fontWeight: 600 }, children: [
          t.reactors > 0 ? `${t.reactors} reactor${t.reactors > 1 ? "s" : ""}` : "",
          t.reactors > 0 && t.inconclusives > 0 ? "  ·  " : "",
          t.inconclusives > 0 ? `${t.inconclusives} inconclusive${t.inconclusives > 1 ? "s" : ""}` : ""
        ] })
      ] }, t.id);
    }) }) }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "12px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printAnimalReport, disabled: !data, className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
        " Print Animal Report"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
          onEdit(animal);
          onClose();
        }, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
          " Edit"
        ] })
      ] })
    ] })
  ] }) });
}
function AnimalsSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const animalSpecies = useLookupStrings("livestock_species", ANIMAL_SPECIES_FALLBACK);
  const base = `/api/farms/${farmId}/animals`;
  const { data: animalsData, isLoading } = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(base).then((r) => r.json())
  });
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json())
  });
  const { data: farmData } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json())
  });
  const animals = animalsData?.records ?? [];
  const herds = herdsData?.records ?? [];
  const farmName = farmData?.record?.name ?? "BDE Farm";
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("active");
  const [speciesFilter, setSpeciesFilter] = reactExports.useState("__all__");
  const [herdFilter, setHerdFilter] = reactExports.useState("__all__");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_ANIMAL);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [qrAnimal, setQrAnimal] = reactExports.useState(null);
  const [viewAnimal, setViewAnimal] = reactExports.useState(null);
  const [profileAnimal, setProfileAnimal] = reactExports.useState(null);
  const [isSavingAnimalCode, setIsSavingAnimalCode] = reactExports.useState(false);
  const qrPrintRef = reactExports.useRef(null);
  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const createMut = useMutation({
    mutationFn: (body) => {
      const payload = { ...body, herdId: body.herdId ? Number(body.herdId) : null };
      return fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["animals", farmId] });
      setShowForm(false);
      setForm(EMPTY_ANIMAL);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => {
      const payload = { ...body, herdId: body.herdId ? Number(body.herdId) : null };
      return fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["animals", farmId] });
      setEditing(null);
      setShowForm(false);
      setForm(EMPTY_ANIMAL);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["animals", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(a) {
    setEditing(a);
    setForm({
      herdId: a.herdId ? String(a.herdId) : "",
      earTagNumber: a.earTagNumber ?? "",
      eidNumber: a.eidNumber ?? "",
      tagNumber: a.tagNumber ?? "",
      species: a.species,
      breed: a.breed ?? "",
      sex: a.sex ?? "",
      dateOfBirth: a.dateOfBirth?.slice(0, 10) ?? "",
      acquisitionDate: a.acquisitionDate?.slice(0, 10) ?? "",
      acquisitionSource: a.acquisitionSource ?? "",
      status: a.status,
      notes: a.notes ?? ""
    });
    setShowForm(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) updateMut.mutate({ ...form, id: editing.id });
    else createMut.mutate(form);
  }
  const herdName = (herdId) => herds.find((h) => h.id === herdId)?.name ?? "—";
  const availableSpecies = Array.from(new Set(animals.map((a) => a.species))).sort();
  const herdsWithAnimals = herds.filter((h) => animals.some((a) => a.herdId === h.id));
  const statusCounts = {
    active: animals.filter((a) => a.status === "active").length,
    sold: animals.filter((a) => a.status === "sold").length,
    dead: animals.filter((a) => a.status === "dead").length,
    all: animals.length
  };
  const filtered = animals.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (speciesFilter !== "__all__" && a.species !== speciesFilter) return false;
    if (herdFilter !== "__all__") {
      if (herdFilter === "__unassigned__") {
        if (a.herdId !== null) return false;
      } else if (a.herdId !== Number(herdFilter)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (a.earTagNumber ?? "").toLowerCase().includes(q) || (a.eidNumber ?? "").toLowerCase().includes(q) || (a.tagNumber ?? "").toLowerCase().includes(q) || a.species.toLowerCase().includes(q) || (a.breed ?? "").toLowerCase().includes(q) || (a.acquisitionSource ?? "").toLowerCase().includes(q);
    }
    return true;
  });
  const STATUS_TABS = [
    { key: "active", label: "On Farm", color: "bg-green-100 text-green-800 border-green-200" },
    { key: "sold", label: "Sold / Moved Off", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { key: "dead", label: "Deceased", color: "bg-red-100 text-red-700 border-red-200" },
    { key: "all", label: "All Records", color: "bg-gray-100 text-gray-600 border-gray-200" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-4 flex-wrap", children: STATUS_TABS.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setStatusFilter(tab.key),
        className: `inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${statusFilter === tab.key ? tab.color + " ring-2 ring-offset-1 ring-current" : "bg-white text-muted-foreground border-border hover:border-foreground/30"}`,
        children: [
          tab.label,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold px-1.5 py-0.5 rounded-full ${statusFilter === tab.key ? "bg-white/60" : "bg-muted"}`, children: statusCounts[tab.key] ?? 0 })
        ]
      },
      tab.key
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[180px] max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search tag, EID, breed…", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      availableSpecies.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: speciesFilter,
          onChange: (e) => setSpeciesFilter(e.target.value),
          className: "h-10 rounded-lg border border-border bg-white px-3 text-sm text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All species" }),
            availableSpecies.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
          ]
        }
      ),
      herdsWithAnimals.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: herdFilter,
          onChange: (e) => setHerdFilter(e.target.value),
          className: "h-10 rounded-lg border border-border bg-white px-3 text-sm text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All herds" }),
            herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(h.id), children: h.name }, h.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__unassigned__", children: "Unassigned" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setForm(EMPTY_ANIMAL);
        setShowForm(true);
      }, className: "ml-auto shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Register Animal"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: "Register individual animals with their ear tag, EID transponder, and key details. For cattle, each animal must have a UK ear tag matching the BCMS cattle passport. For sheep, the EID (electronic transponder) number is required for flocks of 10 or more under retained UK law." }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-12 text-center text-muted-foreground", children: animals.length === 0 ? "No individual animals registered yet. Click 'Register Animal' to add the first record." : search ? `No animals match "${search}" in the current filter.` : statusFilter === "active" ? "No animals currently on farm. Register an animal or check the 'Sold / Moved Off' or 'All Records' view." : statusFilter === "sold" ? "No sold or moved animals on record." : statusFilter === "dead" ? "No deceased animals on record." : "No animals match the current filter." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs text-muted-foreground uppercase tracking-wide", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Ear Tag (UK)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "EID Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Alt. ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Breed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Sex" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Date of Birth" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Herd / Flock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/40", children: filtered.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs font-semibold", children: a.earTagNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: a.eidNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: a.tagNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 capitalize", children: a.species }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: a.breed || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 capitalize text-muted-foreground", children: a.sex || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: formatDate(a.dateOfBirth) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: herdName(a.herdId) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "active" ? "bg-green-50 text-green-700" : a.status === "sold" ? "bg-amber-50 text-amber-700" : a.status === "dead" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600"}`, children: ANIMAL_STATUS_LABELS[a.status] ?? a.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "View animal", onClick: () => setViewAnimal(a), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3 text-blue-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Full profile", onClick: () => setProfileAnimal(a), className: "text-green-700 hover:text-green-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "QR Code", onClick: () => setQrAnimal(a), children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-3 w-3 text-teal-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(a), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(a.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, a.id)) })
    ] }) }),
    qrAnimal && (() => {
      const autoCode = `ANM-${String(qrAnimal.id).padStart(4, "0")}`;
      const displayCode = qrAnimal.animalCode || null;
      const tagLabel = qrAnimal.earTagNumber || qrAnimal.tagNumber || `Animal #${qrAnimal.id}`;
      const qrValue = displayCode ? `BDE:F${farmId}:${displayCode}` : `BDE:F${farmId}:${autoCode}`;
      const LCSS = `@page{size:62mm 90mm;margin:0}body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}.brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em}.farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}svg{display:block;margin:0 auto}.code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}.iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}.hint{font-size:8px;color:#d1d5db;margin-top:4px}`;
      const saveAnimalCode = async (code) => {
        setIsSavingAnimalCode(true);
        try {
          await fetch(`/api/farms/${farmId}/animals/${qrAnimal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ animalCode: code }) });
          qc.invalidateQueries({ queryKey: ["animals", farmId] });
          setQrAnimal((prev) => prev ? { ...prev, animalCode: code } : null);
        } finally {
          setIsSavingAnimalCode(false);
        }
      };
      function handleQrPrint() {
        const win = window.open("", "_blank");
        if (!win || !qrPrintRef.current) return;
        win.document.write(`<html><head><title>Animal Label</title><style>${LCSS}</style></head><body>${qrPrintRef.current.innerHTML}</body></html>`);
        win.document.close();
        win.focus();
        win.addEventListener("afterprint", () => win.close());
        win.print();
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) setQrAnimal(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, "aria-describedby": void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-4 h-4 text-teal-600" }),
          " Animal QR Label"
        ] }) }),
        displayCode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 border rounded-xl bg-white px-5 py-3 shadow-sm", ref: qrPrintRef, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold text-teal-700 tracking-widest mt-1", children: "🌿 BDE Farm Trac" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "w-full border-gray-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-gray-900 uppercase tracking-wider", children: farmName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { value: qrValue, size: 180, bgColor: "#ffffff", fgColor: "#0f766e", level: "M" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xl font-bold tracking-widest text-teal-700 mt-1", children: displayCode }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700", children: tagLabel }),
            qrAnimal.species && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
              qrAnimal.species,
              qrAnimal.breed ? ` · ${qrAnimal.breed}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-gray-300 mb-1", children: "Scan to view animal record" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setQrAnimal(null), children: "Close" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleQrPrint, className: "gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
              " Print Label"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-muted-foreground/30 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-16 h-16 text-muted-foreground/30" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground text-center", children: [
            "No QR code yet. Assign code ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: autoCode }),
            " to this animal."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveAnimalCode(autoCode), disabled: isSavingAnimalCode, className: "gap-2", children: [
            isSavingAnimalCode ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-4 h-4" }),
            "Generate QR Code"
          ] })
        ] })
      ] }) });
    })(),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Animal Record" : "Register Individual Animal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record the individual identifier, species, and key details for this animal." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UK Ear Tag Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.earTagNumber, onChange: (e) => setField("earTagNumber", e.target.value), placeholder: "e.g. UK123456 789012", className: "font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "BCMS format for cattle. For sheep, use the holding number + individual number printed on the visual tag." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EID Transponder Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eidNumber, onChange: (e) => setField("eidNumber", e.target.value), placeholder: "e.g. 826 00123456789", className: "font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "15-digit electronic ID (ISO 11784). Required for sheep in flocks ≥ 10. Also used for cattle electronic tags." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Alternative / Internal ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.tagNumber, onChange: (e) => setField("tagNumber", e.target.value), placeholder: "e.g. breed society number, dam/sire ref" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Species ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species || void 0, onValueChange: (v) => setField("species", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: animalSpecies.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.breed, onChange: (e) => setField("breed", e.target.value), placeholder: "e.g. Holstein Friesian, Texel" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sex || void 0, onValueChange: (v) => setField("sex", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select sex" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Male (entire)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Female" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "castrated", children: "Castrated / Spayed" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date of Birth" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateOfBirth, onChange: (e) => setField("dateOfBirth", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdId || "__none__", onValueChange: (v) => setField("herdId", v === "__none__" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Assign to herd (optional)" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Unassigned —" }),
                herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Arrival Date (on Holding)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Date the animal physically arrived at this holding — used for BCMS notifications and movement records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.acquisitionDate, onChange: (e) => setField("acquisitionDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Acquired From" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.acquisitionSource, onChange: (e) => setField("acquisitionSource", e.target.value), placeholder: "e.g. Supplier name / CPH / auction market" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setField("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(ANIMAL_STATUS_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.notes, onChange: (e) => setField("notes", e.target.value), placeholder: "Any additional notes" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setShowForm(false);
            setEditing(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createMut.isPending || updateMut.isPending, children: createMut.isPending || updateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
            " Saving…"
          ] }) : editing ? "Update" : "Register Animal" })
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Animal Record?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This will mark the record as removed. It cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Remove" })
      ] })
    ] }) }),
    viewAnimal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnimalQuickViewDialog,
      {
        animal: viewAnimal,
        farmId,
        herds,
        onClose: () => setViewAnimal(null),
        onEdit: (a) => {
          setViewAnimal(null);
          openEdit(a);
        },
        onProfile: (a) => {
          setViewAnimal(null);
          setProfileAnimal(a);
        }
      }
    ),
    profileAnimal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnimalProfileDialog,
      {
        animal: profileAnimal,
        farmId,
        onClose: () => setProfileAnimal(null),
        onEdit: (a) => {
          setProfileAnimal(null);
          openEdit(a);
        }
      }
    )
  ] });
}
function SiresSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_SIRE);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const baseUrl = `/api/farms/${farmId}/sires`;
  const { data, isLoading } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(baseUrl, { credentials: "include" }).then((r) => r.json())
  });
  const records = (data?.records ?? []).filter((s) => s.isActive);
  const filtered = records.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.breed ?? "").toLowerCase().includes(search.toLowerCase()));
  const createMut = useMutation({
    mutationFn: (body) => fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sires", farmId] });
      setOpen(false);
      setForm(EMPTY_SIRE);
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sires", farmId] });
      setOpen(false);
      setForm(EMPTY_SIRE);
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`${baseUrl}/${id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sires", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm(EMPTY_SIRE);
    setOpen(true);
  }
  function openEdit(s) {
    setEditing(s);
    setForm({
      name: s.name ?? "",
      species: s.species ?? "Cattle",
      breed: s.breed ?? "",
      tagNumber: s.tagNumber ?? "",
      passportNumber: s.passportNumber ?? "",
      dateOfBirth: s.dateOfBirth ?? "",
      ownershipType: s.ownershipType ?? "owned",
      supplierName: s.supplierName ?? "",
      supplierContact: s.supplierContact ?? "",
      hireStartDate: s.hireStartDate ?? "",
      hireEndDate: s.hireEndDate ?? "",
      returnDate: s.returnDate ?? "",
      bvdStatus: s.bvdStatus ?? "",
      fertilityTestDate: s.fertilityTestDate ?? "",
      fertilityTestResult: s.fertilityTestResult ?? "",
      scrapieGenotype: s.scrapieGenotype ?? "",
      notes: s.notes ?? ""
    });
    setOpen(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const clean = {};
    for (const [k, v] of Object.entries(form)) clean[k] = v === "" ? null : v;
    if (editing) updateMut.mutate({ id: editing.id, body: clean });
    else createMut.mutate(clean);
  }
  const saving = createMut.isPending || updateMut.isPending;
  const isHiredOrLoaned = form.ownershipType === "hired_in" || form.ownershipType === "loaned";
  const ownershipLabel = { owned: "Owned", hired_in: "Hired In", loaned: "Loaned" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search sires…", value: search, onChange: (e) => setSearch(e.target.value), className: "w-64" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, className: "gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add Sire / Ram"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: search ? "No sires match your search" : "No sires registered yet" }),
      !search && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Add your bulls and rams — both on-site and hired in." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Name", "Species", "Breed", "Tag / Passport", "Ownership", "BVD / Scrapie", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i % 2 === 0 ? "bg-white" : "bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-foreground", children: s.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: s.species }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: s.breed ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-muted-foreground", children: [
          s.tagNumber ?? "—",
          s.passportNumber ? ` / ${s.passportNumber}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.ownershipType === "owned" ? "bg-green-100 text-green-800" : s.ownershipType === "hired_in" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`, children: ownershipLabel[s.ownershipType] ?? s.ownershipType }),
          (s.ownershipType === "hired_in" || s.ownershipType === "loaned") && s.hireStartDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "From ",
            s.hireStartDate
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-muted-foreground text-xs", children: [
          s.species === "Cattle" && s.bvdStatus ? s.bvdStatus : "",
          s.species === "Sheep" && s.scrapieGenotype ? s.scrapieGenotype : "",
          !s.bvdStatus && !s.scrapieGenotype ? "—" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: () => openEdit(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0 text-destructive hover:text-destructive", onClick: () => setDeleteId(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) })
      ] }, s.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setEditing(null);
        setForm(EMPTY_SIRE);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Sire / Ram" : "Add Sire / Ram" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), placeholder: "e.g. Oakfield Commander", required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species, onValueChange: (v) => setForm((f) => ({ ...f, species: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Cattle", "Sheep", "Pig", "Goat", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.breed, onChange: (e) => setForm((f) => ({ ...f, breed: e.target.value })), placeholder: { Cattle: "e.g. Aberdeen Angus", Sheep: "e.g. Suffolk", Pig: "e.g. Large White", Goat: "e.g. Boer" }[form.species] ?? "e.g. enter breed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ear Tag Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.tagNumber, onChange: (e) => setForm((f) => ({ ...f, tagNumber: e.target.value })), placeholder: "e.g. UK141092 12345" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Passport Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.passportNumber, onChange: (e) => setForm((f) => ({ ...f, passportNumber: e.target.value })), placeholder: "Cattle passport / flock no." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date of Birth" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateOfBirth, onChange: (e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ownership *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.ownershipType, onValueChange: (v) => setForm((f) => ({ ...f, ownershipType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "owned", children: "Owned — permanently on farm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hired_in", children: "Hired In — brought on for a season" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "loaned", children: "Loaned — temporary loan from another farm" })
              ] })
            ] })
          ] }),
          isHiredOrLoaned && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide", children: "Hire / Loan Details" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier / Owner Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierName, onChange: (e) => setForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "Farm or stud name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Contact" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierContact, onChange: (e) => setForm((f) => ({ ...f, supplierContact: e.target.value })), placeholder: "Phone or email" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Arrived on Farm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.hireStartDate, onChange: (e) => setForm((f) => ({ ...f, hireStartDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Return Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.hireEndDate, onChange: (e) => setForm((f) => ({ ...f, hireEndDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actual Return Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.returnDate, onChange: (e) => setForm((f) => ({ ...f, returnDate: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide", children: "Health Status" }) }),
          form.species === "Cattle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BVD Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.bvdStatus || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, bvdStatus: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not recorded —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Tested Negative", children: "Tested Negative" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Vaccinated", children: "Vaccinated" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Not Tested", children: "Not Tested" })
              ] })
            ] })
          ] }),
          form.species === "Sheep" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scrapie Genotype" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.scrapieGenotype, onChange: (e) => setForm((f) => ({ ...f, scrapieGenotype: e.target.value })), placeholder: "e.g. ARR/ARR" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fertility Test Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fertilityTestDate, onChange: (e) => setForm((f) => ({ ...f, fertilityTestDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fertility Test Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.fertilityTestResult, onChange: (e) => setForm((f) => ({ ...f, fertilityTestResult: e.target.value })), placeholder: "e.g. Satisfactory" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpen(false);
            setEditing(null);
            setForm(EMPTY_SIRE);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving || !form.name.trim(), children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : editing ? "Save Changes" : "Add Sire" })
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Sire from Register?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This will deactivate the sire record. Existing AI/reproduction records linked to this sire are unaffected." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Remove" })
      ] })
    ] }) })
  ] });
}
function AIReproductionSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [pendingConfirm, setPendingConfirm] = reactExports.useState(null);
  const [viewAIRecord, setViewAIRecord] = reactExports.useState(null);
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`, { credentials: "include" }).then((r) => r.json())
  });
  const { data: animalsData } = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then((r) => r.json())
  });
  const { data: siresData } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then((r) => r.json())
  });
  const { data: strawsData } = useQuery({
    queryKey: ["straws", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straws`, { credentials: "include" }).then((r) => r.json())
  });
  const { data: membersData } = useFarmMembers(farmId);
  const { data: aiAttachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const aiAttachMap = Object.fromEntries(aiAttachCountsRaw.filter((c) => c.recordType === "ai_breeding").map((c) => [c.recordId, c.count]));
  const herds = (herdsData?.records ?? []).filter((h) => h.isActive);
  const allAnimals = animalsData?.records ?? [];
  const activeSires = (siresData?.records ?? []).filter((s) => s.isActive);
  const inStockStraws = (strawsData?.records ?? []).filter((s) => s.strawsReceived - (s.strawsUsed ?? 0) > 0);
  const selectedHerdId = form.herdId ? Number(form.herdId) : null;
  const herdAnimals = allAnimals.filter(
    (a) => a.status !== "Dead" && a.status !== "Sold" && (selectedHerdId ? a.herdId === selectedHerdId : true)
  );
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ai-reproduction", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ai-reproduction-records`, { credentials: "include" }).then((r) => r.json())
  });
  const staffNames = (membersData?.members ?? []).map((m) => memberFullName(m));
  function handleSireSelect(val) {
    if (val === "__none__") {
      setForm((f) => ({ ...f, sireRegisterId: "", sireName: "", sireBreed: "" }));
      return;
    }
    const sire = activeSires.find((s) => String(s.id) === val);
    if (sire) {
      setForm((f) => ({ ...f, sireRegisterId: String(sire.id), sireName: sire.name, sireBreed: sire.breed ?? "" }));
    }
  }
  function handleStrawSelect(val) {
    if (val === "__none__") {
      setForm((f) => ({ ...f, strawInventoryId: "", strawBatchRef: "", sireName: "", sireBreed: "" }));
      return;
    }
    const straw = inStockStraws.find((s) => String(s.id) === val);
    if (straw) {
      setForm((f) => ({
        ...f,
        strawInventoryId: String(straw.id),
        strawBatchRef: straw.batchNumber,
        sireName: straw.sireName,
        sireBreed: straw.sireBreed ?? ""
      }));
    }
  }
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? `/api/farms/${farmId}/ai-reproduction-records/${editing.id}` : `/api/farms/${farmId}/ai-reproduction-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-reproduction", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/ai-reproduction-records/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-reproduction", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const handleHerdSelect = (herdId) => {
    if (herdId === "__none__") {
      setForm((f) => ({ ...f, herdId: "", herdName: "", animalTag: "", animalId: "" }));
      return;
    }
    const herd = herds.find((h) => String(h.id) === herdId);
    setForm((f) => ({ ...f, herdId, herdName: herd?.name ?? "", animalTag: "", animalId: "" }));
  };
  const handleAnimalSelect = (animalId) => {
    if (animalId === "__none__") {
      setForm((f) => ({ ...f, animalId: "", animalTag: "" }));
      return;
    }
    const animal = allAnimals.find((a) => String(a.id) === animalId);
    if (animal) {
      setForm((f) => ({
        ...f,
        animalId,
        animalTag: animal.earTagNumber ?? animal.tagNumber ?? ""
      }));
    }
  };
  const allAIRows = records;
  const [yearFilterAI, setYearFilterAI] = reactExports.useState("all");
  const yearsAI = reactExports.useMemo(() => Array.from(new Set(allAIRows.map((r) => String(r.eventDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allAIRows]);
  const rows = yearFilterAI === "all" ? allAIRows : allAIRows.filter((r) => String(r.eventDate ?? "").startsWith(yearFilterAI));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "AI & Reproduction Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Log AI, natural service, RVI confirmation and expected calving / lambing dates." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterAI, onValueChange: setYearFilterAI, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsAI.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm({ servicingMethod: "AI", conceptionConfirmed: false });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          " Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-4 text-center", children: "No AI/reproduction records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        ["Event Date", "Animal Tag", "Herd", "Type", "Method", "Sire", "Conception", "Expected Due"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: h }, h)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: r.eventDate ? new Date(r.eventDate).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: String(r.animalTag ?? "—") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: String(r.herdName ?? "—") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: String(r.recordType ?? "—") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: String(r.servicingMethod ?? "—") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: String(r.sireName ?? r.sireId ?? "—") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: r.conceptionConfirmed ? "Yes" : "No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: r.expectedDueDate ? new Date(r.expectedDueDate).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          (aiAttachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
            aiAttachMap[r.id]
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setViewAIRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
            setEditing(r);
            setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])));
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setPendingConfirm({ msg: "Delete this AI/Reproduction record? This cannot be undone.", fn: () => del.mutate(r.id) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] }) })
      ] }, i)) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!pendingConfirm,
        title: "Delete Record",
        message: pendingConfirm?.msg ?? "",
        onConfirm: () => {
          pendingConfirm?.fn();
          setPendingConfirm(null);
        },
        onCancel: () => setPendingConfirm(null),
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    ),
    viewAIRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewAIRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "AI / Reproduction Record — ",
        String(viewAIRecord.animalTag || `Record #${viewAIRecord.id}`)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-3 text-sm mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Event Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewAIRecord.eventDate ? new Date(viewAIRecord.eventDate).toLocaleDateString("en-GB") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Record Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewAIRecord.recordType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animal Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: String(viewAIRecord.animalTag ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd / Flock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewAIRecord.herdName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Servicing Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewAIRecord.servicingMethod ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Inseminator / Technician" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewAIRecord.inseminatorName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sire / Bull / Ram" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            String(viewAIRecord.sireName ?? "—"),
            viewAIRecord.sireBreed ? ` (${viewAIRecord.sireBreed})` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Straw Batch Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: String(viewAIRecord.strawBatchRef ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Conception Confirmed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewAIRecord.conceptionConfirmed ? "Yes ✓" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewAIRecord.expectedDueDate ? new Date(viewAIRecord.expectedDueDate).toLocaleDateString("en-GB") : "—" })
        ] }),
        !!viewAIRecord.pregnancyDiagDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pregnancy Diag Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: new Date(viewAIRecord.pregnancyDiagDate).toLocaleDateString("en-GB") })
        ] }),
        !!viewAIRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewAIRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "ai_breeding", recordId: viewAIRecord.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewAIRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(viewAIRecord);
          setForm(Object.fromEntries(Object.entries(viewAIRecord).map(([k, v]) => [k, v ?? ""])));
          setOpen(true);
          setViewAIRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Record" : "Add AI / Reproduction Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 max-h-[75vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.eventDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, eventDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Record Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.recordType ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, recordType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["AI Service", "Natural Service", "Pregnancy Diagnosis", "Calving / Kidding / Lambing", "Embryo Transfer"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.herdId || "__none__"), onValueChange: handleHerdSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No specific herd —" }),
              herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
                h.name,
                h.type ? ` (${herdSpeciesDisplayLabel(h.type)}${herdProductionSubtype(h.type, h.productionType) ? ` · ${herdProductionSubtype(h.type, h.productionType)}` : ""})` : ""
              ] }, h.id))
            ] })
          ] }),
          herds.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "No herds registered — add one in the Herds & Flocks tab first." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animal Tag *" }),
          herdAnimals.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.animalId || "__none__"), onValueChange: handleAnimalSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select animal…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Type manually below —" }),
              herdAnimals.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(a.id), children: [
                a.earTagNumber ?? a.tagNumber ?? `Animal #${a.id}`,
                a.breed ? ` — ${a.breed}` : "",
                a.sex ? ` (${a.sex})` : ""
              ] }, a.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 mb-1", children: selectedHerdId ? "No active animals in this herd" : "Select a herd to filter animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "mt-1",
              placeholder: "Ear tag / tag number",
              value: String(form.animalTag ?? ""),
              onChange: (e) => setForm((f) => ({ ...f, animalTag: e.target.value, animalId: "" }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Servicing Method *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.servicingMethod ?? "AI"), onValueChange: (v) => setForm((f) => ({ ...f, servicingMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["AI", "Natural Service", "Embryo Transfer", "N/A"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inseminator / Technician" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StaffSelect,
            {
              staffNames,
              value: String(form.inseminatorName ?? ""),
              onChange: (v) => setForm((f) => ({ ...f, inseminatorName: v }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select from Straw Inventory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.strawInventoryId || "__none__"), onValueChange: handleStrawSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Pick an in-stock batch…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Enter batch ref manually —" }),
              inStockStraws.map((s) => {
                const remaining = s.strawsReceived - (s.strawsUsed ?? 0);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                  s.sireName,
                  " — ",
                  s.batchNumber,
                  s.supplierName ? ` (${s.supplierName})` : "",
                  " · ",
                  remaining,
                  " left"
                ] }, s.id);
              })
            ] })
          ] }),
          inStockStraws.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "No straws in stock — add a delivery in the Straw Inventory tab, or enter the batch ref manually below." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Straw / Batch Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.strawBatchRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, strawBatchRef: e.target.value })), placeholder: "Auto-filled from inventory, or enter manually" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sire / Bull / Ram" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.sireRegisterId || "__none__"), onValueChange: handleSireSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from sire register…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Enter manually below —" }),
              activeSires.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                s.name,
                s.breed ? ` (${s.breed})` : "",
                s.tagNumber ? ` — ${s.tagNumber}` : ""
              ] }, s.id))
            ] })
          ] }),
          activeSires.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "No sires in register — add one in the Sires & Rams tab, or type a name below." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sire Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.sireName ?? ""), onChange: (e) => setForm((f) => ({ ...f, sireName: e.target.value })), placeholder: "Auto-filled from register, or type manually" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sire Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.sireBreed ?? ""), onChange: (e) => setForm((f) => ({ ...f, sireBreed: e.target.value })), placeholder: "Auto-filled from register" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expectedDueDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, expectedDueDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "conceptionConfirmed", checked: Boolean(form.conceptionConfirmed), onChange: (e) => setForm((f) => ({ ...f, conceptionConfirmed: e.target.checked })), className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "conceptionConfirmed", children: "Conception confirmed?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confirmation Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.confirmationMethod ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, confirmationMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["RVI Scanning", "Blood Test", "Milk Progesterone", "Return to Service not observed", "Visual Assessment"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confirmation Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.confirmationDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, confirmationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
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
    queryFn: () => fetch(`/api/farms/${farmId}/vet-prescriptions`, { credentials: "include" }).then((r) => r.json())
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
    mutationFn: (id) => fetch(`/api/farms/${farmId}/vet-prescriptions/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const allRxRows = records;
  const [yearFilterRx, setYearFilterRx] = reactExports.useState("all");
  const yearsRx = reactExports.useMemo(() => Array.from(new Set(allRxRows.map((r) => String(r.prescriptionDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allRxRows]);
  const rows = yearFilterRx === "all" ? allRxRows : allRxRows.filter((r) => String(r.prescriptionDate ?? "").startsWith(yearFilterRx));
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
        ["Rx Date", "Product / Active Ingredient", "Indication", "Withdrawal Meat", "Withdrawal Milk", "Vet / Practice", "Valid Until", "Treatments"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r, i) => {
        const treatmentsRecorded = Number(r.treatmentsRecorded ?? 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: r.prescriptionDate ? new Date(r.prescriptionDate).toLocaleDateString("en-GB") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: String(r.productName ?? "—") }),
            r.activeIngredient != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: String(r.activeIngredient) }),
            Boolean(r.isCascade) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block", children: "Cascade" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 max-w-[200px] text-xs text-muted-foreground", children: r.indicationOrDiagnosis ? String(r.indicationOrDiagnosis).slice(0, 80) + (String(r.indicationOrDiagnosis).length > 80 ? "…" : "") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: r.withdrawalPeriodMeat ? `${r.withdrawalPeriodMeat}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: r.withdrawalPeriodMilk ? `${r.withdrawalPeriodMilk}d` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: String(r.vetName ?? "—") }),
            r.vrcPracticeName != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: String(r.vrcPracticeName) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 whitespace-nowrap", children: r.expiryDate ? (() => {
            const exp = new Date(r.expiryDate);
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "View", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
              setEditing(r);
              setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])));
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setPendingConfirm({ msg: "Delete this prescription record? This cannot be undone.", fn: () => del.mutate(r.id) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
          ] })
        ] }, i);
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
          setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v ?? ""])));
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
        onConfirm: () => {
          pendingConfirm?.fn();
          setPendingConfirm(null);
        },
        onCancel: () => setPendingConfirm(null),
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Medicine Record" : "Add Prescription / Medicine Treatment Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record the veterinary prescription and the animals treated. Required under VMR 2013 and Red Tractor standards." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 max-h-[72vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1", children: "Prescription Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.prescriptionDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, prescriptionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.prescriptionRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, prescriptionRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetName ?? ""), onChange: (e) => setForm((f) => ({ ...f, vetName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Practice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetPractice ?? ""), onChange: (e) => setForm((f) => ({ ...f, vetPractice: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet RCVS Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.vetRcvsNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, vetRcvsNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Valid Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.prescriptionValidUntil ?? ""), onChange: (e) => setForm((f) => ({ ...f, prescriptionValidUntil: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 border-t", children: "Medicine Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.productName ?? ""), onChange: (e) => setForm((f) => ({ ...f, productName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.activeIngredient ?? ""), onChange: (e) => setForm((f) => ({ ...f, activeIngredient: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Route of Administration *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.routeOfAdministration ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, routeOfAdministration: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Oral", "Injection (IM)", "Injection (SC)", "Injection (IV)", "Topical", "Pour-on", "Intramammary", "Intrauterine", "In-water", "In-feed"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dose" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.dose ?? ""), onChange: (e) => setForm((f) => ({ ...f, dose: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.frequency ?? ""), onChange: (e) => setForm((f) => ({ ...f, frequency: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.treatmentDuration ?? ""), onChange: (e) => setForm((f) => ({ ...f, treatmentDuration: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Authorised" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.quantityAuthorised ?? ""), onChange: (e) => setForm((f) => ({ ...f, quantityAuthorised: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Dispensed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.dispensedQuantity ?? ""), onChange: (e) => setForm((f) => ({ ...f, dispensedQuantity: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.batchNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, batchNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expiryDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal — Meat (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodMeat ?? ""), onChange: (e) => setForm((f) => ({ ...f, withdrawalPeriodMeat: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal — Milk (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodMilk ?? ""), onChange: (e) => setForm((f) => ({ ...f, withdrawalPeriodMilk: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal — Eggs (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.withdrawalPeriodEggs ?? ""), onChange: (e) => setForm((f) => ({ ...f, withdrawalPeriodEggs: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 space-y-2", children: [["signedByVet", "Signed by vet?"], ["isCascade", "Cascade / off-label use?"], ["farmRegistered", "Farm registered for prescribing?"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: `rx-${k}`, checked: Boolean(form[k]), onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.checked })), className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `rx-${k}`, children: l })
        ] }, k)) }),
        Boolean(form.isCascade) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cascade Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.cascadeJustification ?? ""), onChange: (e) => setForm((f) => ({ ...f, cascadeJustification: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Indication / Diagnosis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.indicationOrDiagnosis ?? ""), onChange: (e) => setForm((f) => ({ ...f, indicationOrDiagnosis: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.targetSpecies ?? ""), onChange: (e) => setForm((f) => ({ ...f, targetSpecies: e.target.value })), placeholder: "e.g. Cattle, Sheep, Pigs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 mt-1 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Recording actual treatments?" }),
          " Once medicine has been administered, record each treatment event — ear tags, date given, who administered it, batch number used — in the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Medicine" }),
          " module (sidebar). When creating a treatment entry there, you can link it back to this prescription for a full audit trail. Keeping prescription authorisation and treatment administration in separate registers is the VMR 2013 standard."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save Record" })
      ] })
    ] }) })
  ] });
}
function StrawInventorySection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_STRAW);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const { data: siresData } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then((r) => r.json())
  });
  const activeSires = (siresData?.records ?? []).filter((s) => s.isActive);
  const { data, isLoading } = useQuery({
    queryKey: ["straws", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straws`, { credentials: "include" }).then((r) => r.json())
  });
  const straws = data?.records ?? [];
  const [yearFilterStraws, setYearFilterStraws] = reactExports.useState("all");
  const yearsStraws = reactExports.useMemo(() => Array.from(new Set(straws.map((r) => String(r.deliveryDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [straws]);
  const filteredStraws = yearFilterStraws === "all" ? straws : straws.filter((r) => String(r.deliveryDate ?? "").startsWith(yearFilterStraws));
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? `/api/farms/${farmId}/straws/${editing.id}` : `/api/farms/${farmId}/straws`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straws", farmId] });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY_STRAW);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/straws/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straws", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm(EMPTY_STRAW);
    setOpen(true);
  }
  function openEdit(s) {
    setEditing(s);
    setForm({
      sireRegisterId: s.sireRegisterId ?? "",
      sireName: s.sireName,
      sireBreed: s.sireBreed ?? "",
      sireSpecies: s.sireSpecies,
      supplierName: s.supplierName ?? "",
      batchNumber: s.batchNumber,
      strawsReceived: s.strawsReceived,
      storageLocation: s.storageLocation ?? "",
      deliveryDate: s.deliveryDate ?? "",
      unitCostPence: s.unitCostPence ?? "",
      notes: s.notes ?? ""
    });
    setOpen(true);
  }
  function handleSireSelect(val) {
    if (val === "__none__") {
      setForm((f) => ({ ...f, sireRegisterId: "", sireName: "", sireBreed: "" }));
      return;
    }
    const sire = activeSires.find((s) => String(s.id) === val);
    if (sire) setForm((f) => ({ ...f, sireRegisterId: sire.id, sireName: sire.name, sireBreed: sire.breed ?? "", sireSpecies: sire.species }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      ...form,
      sireRegisterId: form.sireRegisterId !== "" ? Number(form.sireRegisterId) : null,
      strawsReceived: Number(form.strawsReceived),
      unitCostPence: form.unitCostPence !== "" ? Number(form.unitCostPence) : null
    };
    save.mutate(body);
  }
  function stockBadge(s) {
    const remaining = s.strawsReceived - (s.strawsUsed ?? 0);
    if (remaining <= 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800", children: "Out of Stock" });
    if (remaining <= 2) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800", children: [
      "Low — ",
      remaining,
      " left"
    ] });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [
      remaining,
      " remaining"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Straw Inventory" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Track AI straw deliveries by batch number — straws used are counted automatically from AI records." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterStraws, onValueChange: setYearFilterStraws, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsStraws.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Add Delivery"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading…" }) : filteredStraws.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-8 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No straw deliveries logged yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Add your first delivery to start tracking stock and verifying batch numbers at AI service time." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      (() => {
        const totalReceived = straws.reduce((s, r) => s + (r.strawsReceived ?? 0), 0);
        const totalUsed = straws.reduce((s, r) => s + (r.strawsUsed ?? 0), 0);
        const totalInStock = straws.reduce((s, r) => s + Math.max(0, (r.strawsReceived ?? 0) - (r.strawsUsed ?? 0)), 0);
        const totalCostPence = straws.reduce((s, r) => s + (r.unitCostPence ?? 0) * (r.strawsReceived ?? 0), 0);
        const hasCost = straws.some((r) => r.unitCostPence);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: totalInStock > 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${totalInStock > 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: totalInStock > 0 ? "#15803d" : "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "In Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: totalInStock > 0 ? "#14532d" : "#7f1d1d", lineHeight: 1, margin: 0 }, children: totalInStock }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }, children: [
              "straw",
              totalInStock !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 100 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: totalReceived }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }, children: "straws" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 100 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Used to Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: totalUsed }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }, children: "straws" })
          ] }),
          hasCost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Stock Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: [
              "£",
              (totalCostPence / 100).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", color: "#6b7280", marginTop: 2 }, children: "total received" })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Sire / Bull / Ram" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Batch No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Stock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Storage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Delivered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredStraws.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: s.sireName }),
            s.sireBreed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              s.sireBreed,
              " · ",
              s.sireSpecies
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: s.batchNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: s.supplierName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            stockBadge(s),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              s.strawsReceived,
              " received · ",
              s.strawsUsed ?? 0,
              " used"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: s.storageLocation || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: s.deliveryDate || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: () => openEdit(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0 text-destructive hover:text-destructive", onClick: () => setDeleteId(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] }) })
        ] }, s.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove from inventory?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This will mark the batch as inactive. AI records linked to it will not be affected." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId && del.mutate(deleteId), disabled: del.isPending, children: "Remove" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setEditing(null);
        setForm(EMPTY_STRAW);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Straw Batch" : "Log Straw Delivery" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record the delivery details and batch number from the AI centre documentation." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Sire Register" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.sireRegisterId || "__none__"), onValueChange: handleSireSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from sire register…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not in register / enter manually —" }),
                activeSires.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                  s.name,
                  s.breed ? ` (${s.breed})` : "",
                  s.tagNumber ? ` — ${s.tagNumber}` : ""
                ] }, s.id))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Linking to the register enables automatic donor verification. You can also enter details manually below." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Donor Sire Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sireName, onChange: (e) => setForm((f) => ({ ...f, sireName: e.target.value })), placeholder: "e.g. Cogent Commander", required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sireSpecies, onValueChange: (v) => setForm((f) => ({ ...f, sireSpecies: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Cattle", "Sheep", "Pig", "Goat", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sireBreed, onChange: (e) => setForm((f) => ({ ...f, sireBreed: e.target.value })), placeholder: { Cattle: "e.g. Aberdeen Angus", Sheep: "e.g. Suffolk", Pig: "e.g. Large White", Goat: "e.g. Boer" }[form.sireSpecies] ?? "e.g. enter breed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch / Lot Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.batchNumber, onChange: (e) => setForm((f) => ({ ...f, batchNumber: e.target.value })), placeholder: "As printed on straw label", required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier / AI Centre" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierName, onChange: (e) => setForm((f) => ({ ...f, supplierName: e.target.value })), placeholder: "e.g. Cogent Breeding, Genus ABS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Straws Received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.strawsReceived, onChange: (e) => setForm((f) => ({ ...f, strawsReceived: Number(e.target.value) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.storageLocation, onChange: (e) => setForm((f) => ({ ...f, storageLocation: e.target.value })), placeholder: "e.g. Tank 2, Goblet 3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.deliveryDate, onChange: (e) => setForm((f) => ({ ...f, deliveryDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: 0.01, value: form.unitCostPence !== "" ? Number(form.unitCostPence) / 100 : "", onChange: (e) => setForm((f) => ({ ...f, unitCostPence: e.target.value !== "" ? Math.round(Number(e.target.value) * 100) : "" })), placeholder: "e.g. 18.50" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "Health cert reference, catalogue page, etc." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpen(false);
            setEditing(null);
            setForm(EMPTY_STRAW);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: save.isPending, children: "Save" })
        ] })
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
function LambSection({ n, form, set }) {
  const outcomeKey = `lambOutcome${n}`;
  const sexKey = `lambSex${n}`;
  const tagKey = `lambEarTag${n}`;
  const eidKey = `lambEidNumber${n}`;
  const weightKey = `lambBirthWeightKg${n}`;
  const animalIdKey = `lambAnimalId${n}`;
  const outcome = form[outcomeKey];
  const earTag = form[tagKey];
  const animalId = form[animalIdKey];
  const showHint = outcome === "live" && earTag?.trim();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-3 space-y-2 bg-gray-50/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: [
      "Lamb ",
      n
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form[tagKey] || "", onChange: (e) => set(tagKey, e.target.value), placeholder: "e.g. UK0141092 0200" }),
        showHint && !animalId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-teal-600 mt-1", children: "Live lamb — will be registered in Livestock on save." }),
        animalId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 mt-1", children: [
          "Already in Flock Register (ID #",
          animalId,
          ") ✓"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EID / Transponder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form[eidKey] || "", onChange: (e) => set(eidKey, e.target.value), placeholder: "15-digit ISO 11784 EID" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Weight (kg)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form[weightKey] || "", onChange: (e) => set(weightKey, e.target.value || null), placeholder: "e.g. 4.2", className: "w-32" })
    ] })
  ] });
}
function LambingSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
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
  const [yearFilter, setYearFilter] = reactExports.useState(String(CURRENT_YEAR));
  const { data, isLoading } = useQuery({
    queryKey: ["lambing-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lambing-records`, { credentials: "include" }).then((r) => r.json())
  });
  const animalsQ = useQuery({
    queryKey: ["lambing-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const SHEEP_SPECIES = ["sheep", "ovine"];
  const ewes = (animalsQ.data?.records ?? []).filter((a) => SHEEP_SPECIES.includes(a.species?.toLowerCase()) && a.status === "active" && a.earTagNumber);
  const siresQ = useQuery({
    queryKey: ["lambing-sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const ramSires = (siresQ.data?.records ?? []).filter((s) => s.isActive !== false && ["sheep", "ovine"].includes(s.species?.toLowerCase()));
  const vetVisitsQ = useQuery({
    queryKey: ["lambing-vet-visits", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-visits`, { credentials: "include" }).then((r) => r.json()),
    enabled: open && !!form.vetAttended
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map((v) => v.vetName).filter(Boolean))];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter((v) => v.vetName && v.vetPractice).map((v) => [v.vetName, v.vetPractice])
  );
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const lambingAttachMap = Object.fromEntries(attachCountsRaw.filter((c) => c.recordType === "lambing").map((c) => [c.recordId, c.count]));
  const contractorsQ = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`, { credentials: "include" }).then((r) => r.json())
  });
  const contractors = contractorsQ.data ?? [];
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? `/api/farms/${farmId}/lambing-records/${editing.id}` : `/api/farms/${farmId}/lambing-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lambing-records", farmId] });
      closeDialog();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/lambing-records/${id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json()),
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
  }
  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY, lambingDate: todayStr() });
    setShowManualEwe(false);
    setShowManualVet(false);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, lambingDate: r.lambingDate?.slice(0, 10) ?? "" });
    setShowManualEwe(!r.eweAnimalId && !!r.eweEarTag);
    setShowManualVet(!!r.vetAttended && !!r.vetName);
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const numLambs = form.numberOfLambs ?? 1;
  const hasDeadLambs = [form.lambOutcome1, form.lambOutcome2, form.lambOutcome3, form.lambOutcome4].slice(0, numLambs).some((o) => o === "stillborn" || o === "died-within-24h");
  const allRecords = data?.records ?? [];
  const records = yearFilter === "all" ? allRecords : allRecords.filter((r) => r.lambingDate?.startsWith(yearFilter));
  const availableYears = [...new Set(allRecords.map((r) => r.lambingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));
  function lambSeasonStats(recs) {
    const totalBorn = recs.reduce((s, r) => s + (r.numberOfLambs ?? 0), 0);
    const allOutcomes = recs.flatMap((r) => [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(Boolean));
    const stillborns = allOutcomes.filter((o) => o === "stillborn").length;
    const died24h = allOutcomes.filter((o) => o === "died-within-24h").length;
    const perinatal = stillborns + died24h;
    const pct = (n) => totalBorn > 0 ? (n / totalBorn * 100).toFixed(1) : "—";
    return { ewes: recs.length, totalBorn, stillborns, died24h, perinatal, pct };
  }
  const currentStats = lambSeasonStats(records);
  const yearlyStats = availableYears.map((y) => ({ year: y, ...lambSeasonStats(allRecords.filter((r) => r.lambingDate?.startsWith(y))) }));
  function generateLambingReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
    const fv2 = (v) => v === null || v === void 0 || v === "" ? "—" : String(v);
    const easeLabel = (n) => n ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][n] ?? String(n) : "—";
    const yesNo = (v) => v === true ? "Yes" : v === false ? "No" : "—";
    const litterLabel = (n) => n === 1 ? "Single" : n === 2 ? "Twins" : n === 3 ? "Triplets" : n === 4 ? "Quads" : fv2(n);
    const rptStats = lambSeasonStats(records);
    const summaryRows = yearlyStats.map(
      (s) => `<tr><td>${s.year}</td><td>${s.ewes}</td><td>${s.totalBorn}</td><td>${s.stillborns} (${s.pct(s.stillborns)}%)</td><td>${s.died24h} (${s.pct(s.died24h)}%)</td><td style="font-weight:700">${s.perinatal} (${s.pct(s.perinatal)}%)</td></tr>`
    ).join("");
    const tableRows = records.map((r) => {
      const outcomes = [
        r.lambOutcome1 ? `${r.lambOutcome1} (${r.lambSex1 ?? "?"}) ${r.lambEarTag1 ? `[${r.lambEarTag1}]` : ""}` : null,
        r.lambOutcome2 ? `${r.lambOutcome2} (${r.lambSex2 ?? "?"}) ${r.lambEarTag2 ? `[${r.lambEarTag2}]` : ""}` : null,
        r.lambOutcome3 ? `${r.lambOutcome3} (${r.lambSex3 ?? "?"}) ${r.lambEarTag3 ? `[${r.lambEarTag3}]` : ""}` : null,
        r.lambOutcome4 ? `${r.lambOutcome4} (${r.lambSex4 ?? "?"}) ${r.lambEarTag4 ? `[${r.lambEarTag4}]` : ""}` : null
      ].filter(Boolean).join("; ");
      const liveCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter((o) => o === "live").length;
      const deadCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter((o) => o === "stillborn" || o === "died-within-24h").length;
      const disposalCell = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod ? `${r.perinatalCollectionDate ? fmtD(r.perinatalCollectionDate) : "—"} · ${fv2(r.perinatalCollectionRef)} · ${fv2(r.perinatalDisposalMethod)}` : deadCount > 0 ? "<span style='color:#b91c1c'>DISPOSAL NOT RECORDED</span>" : "—";
      return `<tr>
        <td>${fmtD(r.lambingDate)}</td>
        <td>${fv2(r.eweEarTag)}</td>
        <td>${easeLabel(r.lambingEaseScore)}</td>
        <td>${litterLabel(r.numberOfLambs)}</td>
        <td style="font-size:9px">${outcomes || "—"}</td>
        <td>${liveCount} live${deadCount ? ` / ${deadCount} dead` : ""}</td>
        <td>${yesNo(r.colostrumGivenWithin2Hours)}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td>${yesNo(r.vetAttended)}</td>
        <td>${r.fosteringRequired ? `Yes — ${fv2(r.fosteringDetails).slice(0, 40)}` : "No"}</td>
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: yearlyStats.map((s, i) => {
            const maxRate = Math.max(...yearlyStats.map((x) => Number(x.pct(x.perinatal)) || 0), 0.1);
            const rate = Number(s.pct(s.perinatal)) || 0;
            const barWidth = Math.round(rate / maxRate * 100);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i % 2 === 0 ? "bg-white" : "bg-gray-50", children: [
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
      records.map((r) => {
        const liveCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter((o) => o === "live").length;
        const deadCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter((o) => o === "stillborn" || o === "died-within-24h").length;
        const registeredCount = [r.lambAnimalId1, r.lambAnimalId2, r.lambAnimalId3, r.lambAnimalId4].filter(Boolean).length;
        const litterLabel = r.numberOfLambs === 1 ? "Single" : r.numberOfLambs === 2 ? "Twins" : r.numberOfLambs === 3 ? "Triplets" : "Quads";
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.lambingDate) }),
              r.eweEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700 font-mono", children: [
                "Ewe: ",
                r.eweEarTag
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LambingEaseBadge, { v: r.lambingEaseScore }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded", children: [
                litterLabel,
                " (",
                r.numberOfLambs,
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
              r.expectedLitterSize && r.expectedLitterSize !== r.numberOfLambs && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded", children: [
                "Scan: ",
                r.expectedLitterSize,
                " → Actual: ",
                r.numberOfLambs
              ] }),
              registeredCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded", children: [
                "In Flock Register ✓ ×",
                registeredCount
              ] }),
              r.fosteringRequired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded", children: "Fostered" }),
              r.colostrumGivenWithin2Hours !== null && r.colostrumGivenWithin2Hours !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded ${r.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`, children: r.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h" }),
              r.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded", children: r.vetName ? `Vet: ${r.vetName}` : "Vet attended" }),
              r.expectedLambingDate && (() => {
                const days = Math.floor((new Date(r.expectedLambingDate).getTime() - Date.now()) / 864e5);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded border ${days >= 0 && days <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"}`, children: [
                  "Expected: ",
                  formatDate(r.expectedLambingDate)
                ] });
              })(),
              deadCount > 0 && (() => {
                const hasDisposal = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod || r.perinatalDisposalContractorId;
                return hasDisposal ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded", children: "Disposal recorded ✓" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded", children: "Disposal not recorded" });
              })(),
              (lambingAttachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
                lambingAttachMap[r.id]
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => setConfirmDelete(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.notes })
        ] }) }, r.id);
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
        [1, 2, 3, 4].slice(0, viewRecord.numberOfLambs ?? 1).map((n) => {
          const outcome = viewRecord[`lambOutcome${n}`];
          const sex = viewRecord[`lambSex${n}`];
          const tag = viewRecord[`lambEarTag${n}`];
          const wt = viewRecord[`lambBirthWeightKg${n}`];
          if (!outcome) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 bg-gray-50 rounded p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1", children: [
              "Lamb ",
              n
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
              outcome,
              sex ? ` · ${sex}` : "",
              tag ? ` · Tag: ${tag}` : "",
              wt ? ` · ${wt} kg` : ""
            ] })
          ] }, n);
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
          const deadCount = [viewRecord.lambOutcome1, viewRecord.lambOutcome2, viewRecord.lambOutcome3, viewRecord.lambOutcome4].filter((o) => o === "stillborn" || o === "died-within-24h").length;
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
        onConfirm: () => confirmDelete !== null && del.mutate(confirmDelete),
        onCancel: () => setConfirmDelete(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) closeDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "68rem" }, className: "max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Lambing Record" : "Add Lambing Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Ewe Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lambing Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lambingDate?.slice(0, 10) || "", onChange: (e) => set("lambingDate", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Lambing Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedLambingDate?.slice(0, 10) || "", onChange: (e) => set("expectedLambingDate", e.target.value || null) }),
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
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweEarTag || "", onChange: (e) => set("eweEarTag", e.target.value), placeholder: "Ewe ear tag" }),
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
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweComplications || "", onChange: (e) => set("eweComplications", e.target.value), placeholder: "e.g. prolapse, twin lamb disease" })
              ] })
            ] })
          ] }),
          [1, 2, 3, 4].slice(0, numLambs).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(LambSection, { n, form, set }, n))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-72 flex-shrink-0 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Assistance & Vet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "ar-lamb", checked: !!form.assistanceRequired, onChange: (e) => {
                set("assistanceRequired", e.target.checked);
                if (!e.target.checked) set("assistanceType", null);
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "va-lamb", checked: !!form.vetAttended, onChange: (e) => {
                set("vetAttended", e.target.checked);
                if (!e.target.checked) {
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
                  uniqueVetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: n, children: [
                    n,
                    vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""
                  ] }, n)),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Enter name manually…" })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "Vet's full name" }),
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "col-lamb", checked: form.colostrumGivenWithin2Hours === true, onChange: (e) => set("colostrumGivenWithin2Hours", e.target.checked ? true : false), className: "rounded" }),
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "foster-lamb", checked: !!form.fosteringRequired, onChange: (e) => {
                set("fosteringRequired", e.target.checked);
                if (!e.target.checked) set("fosteringDetails", null);
              }, className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "foster-lamb", children: "Fostering required" })
            ] }),
            form.fosteringRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fostering Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.fosteringDetails || "", onChange: (e) => set("fosteringDetails", e.target.value), placeholder: "e.g. Lamb 2 fostered onto ewe UK0141092 0301 — skin graft method used", rows: 3 })
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
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ramEarTag || "", onChange: (e) => set("ramEarTag", e.target.value), placeholder: "Tag no." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ram Breed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ramBreed || "", onChange: (e) => set("ramBreed", e.target.value), placeholder: "e.g. Texel" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), placeholder: "Any additional notes...", rows: 3 })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.perinatalCollectionDate?.slice(0, 10) || "", onChange: (e) => set("perinatalCollectionDate", e.target.value || null) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consignment / NFAS Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalCollectionRef || "", onChange: (e) => set("perinatalCollectionRef", e.target.value || null), placeholder: "e.g. NFAS-LIN-0042-240317" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Collection note or NFAS certificate reference" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method (if no contractor)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalMethod || "", onChange: (e) => set("perinatalDisposalMethod", e.target.value || null), placeholder: "e.g. Hunt kennels, on-farm incinerator" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalNotes || "", onChange: (e) => set("perinatalDisposalNotes", e.target.value || null), placeholder: "Any additional disposal details..." })
        ] })
      ] }),
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
const EMPTY_TB = { testDate: "", readingDate: null, testType: "routine-skin", species: "cattle", herdFlockRef: null, herdId: null, animalsTested: null, animalEarTags: null, reactors: 0, inconclusives: 0, outcome: "clear", aphaOfficer: null, aphaCaseRef: null, movementRestriction: false, restrictionLiftedDate: null, nextTestDueDate: null, testingVet: null, documentUrl: null, documentName: null, documentPath: null, movementId: null, notes: null };
function TbTestsSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/tb-tests`;
  const { data, isLoading } = useQuery({ queryKey: ["tb-tests", farmId], queryFn: () => fetch(base).then((r) => r.json()) });
  const records = data?.records ?? [];
  const [yearFilterTb, setYearFilterTb] = reactExports.useState("all");
  const yearsTb = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredTbRecords = yearFilterTb === "all" ? records : records.filter((r) => String(r.testDate ?? "").startsWith(yearFilterTb));
  const { data: herdsData } = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()) });
  const herds = herdsData?.records ?? [];
  const vetNames = [...new Set(records.map((r) => r.testingVet).filter((v) => !!v))];
  const outMovQ = useQuery({ queryKey: ["outgoing-movements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-movements/outgoing`).then((r) => r.json()), enabled: !!farmId });
  const outgoingMovements = outMovQ.data?.records ?? [];
  const { uploadFile, isUploading: isUploadingDoc } = useUpload();
  const [pendingDoc, setPendingDoc] = reactExports.useState(null);
  const docInputRef = reactExports.useRef(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...EMPTY_TB });
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const createMut = useMutation({ mutationFn: (b) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["tb-tests", farmId] });
    setShowForm(false);
    setForm({ ...EMPTY_TB });
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["tb-tests", farmId] });
    setShowForm(false);
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["tb-tests", farmId] });
    setDeleteId(null);
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openEdit(r) {
    setEditing(r);
    setPendingDoc(null);
    setForm({ testDate: r.testDate, readingDate: r.readingDate ?? null, testType: r.testType, species: r.species, herdFlockRef: r.herdFlockRef ?? null, herdId: r.herdId ?? null, animalsTested: r.animalsTested, animalEarTags: r.animalEarTags ?? null, reactors: r.reactors, inconclusives: r.inconclusives, outcome: r.outcome, aphaOfficer: r.aphaOfficer ?? null, aphaCaseRef: r.aphaCaseRef ?? null, movementRestriction: r.movementRestriction, restrictionLiftedDate: r.restrictionLiftedDate ?? null, nextTestDueDate: r.nextTestDueDate ?? null, testingVet: r.testingVet ?? null, documentUrl: r.documentUrl ?? null, documentName: r.documentName ?? null, documentPath: r.documentPath ?? null, movementId: r.movementId ?? null, notes: r.notes ?? null });
    setShowForm(true);
  }
  function printReport() {
    const rows = records.map((r) => `<tr><td>${formatDate(r.testDate)}</td><td>${r.testType.replace(/-/g, " ")}</td><td>${r.species}</td><td>${r.herdFlockRef ?? "—"}</td><td>${r.animalsTested ?? "—"}</td><td>${r.reactors}</td><td>${r.inconclusives}</td><td>${r.outcome.toUpperCase()}</td><td>${r.movementRestriction ? "YES" : "No"}</td><td>${formatDate(r.nextTestDueDate)}</td><td style="text-align:center;color:${r.movementId ? "#166534" : "#9ca3af"};font-weight:${r.movementId ? "700" : "400"}">${r.movementId ? "✓ Linked" : "—"}</td></tr>`).join("");
    printProReport({ title: "TB Test Register", subtitle: `${records.length} test records`, tableHtml: `<table><thead><tr><th>Test Date</th><th>Test Type</th><th>Species</th><th>Herd/Flock</th><th>Tested</th><th>Reactors</th><th>Inconc.</th><th>Outcome</th><th>Restriction</th><th>Next Due</th><th>Movement Linked</th></tr></thead><tbody>${rows}</tbody></table>` });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "TB Test Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Official bovine tuberculosis test records as required under TB (England) Order 2021 and Red Tractor standards." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterTb, onValueChange: setYearFilterTb, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsTb.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm({ ...EMPTY_TB });
          setShowForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Log TB Test"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor Requirement:" }),
      " All bovine TB test results must be recorded with test date, reading date, number tested, reactors, inconclusives and outcome. Movement restrictions must be noted where applicable."
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filteredTbRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700 mb-1", children: "No TB tests recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Log your first bovine TB test result to start your register." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Injection / Reading" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Herd/Flock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Tested" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Reactors" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Next Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredTbRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: formatDate(r.testDate) }),
          r.readingDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "Reading: ",
            formatDate(r.readingDate)
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-600 font-semibold mt-0.5", children: "⏳ Reading pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-xs text-gray-600 capitalize", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: r.testType.replace(/-/g, " ") }),
          r.movementId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold rounded px-1 py-0.5", style: { fontSize: "0.65rem", background: "#dcfce7", color: "#166534" }, children: "Movement" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs capitalize", children: r.species }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-600", children: r.herdFlockRef ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: r.animalsTested ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-semibold", children: r.reactors > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: r.reactors }) : r.reactors }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex text-xs font-semibold rounded-full px-2 py-0.5 ${OUTCOME_COLOURS[r.outcome] ?? "bg-gray-100 text-gray-700"}`, children: r.outcome.toUpperCase() }),
          r.movementRestriction && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-red-600 font-semibold", children: "⚠ Restricted" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: formatDate(r.nextTestDueDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3 text-blue-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "TB Test — ",
          formatDate(viewItem.testDate)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          viewItem.species,
          " · ",
          viewItem.testType.replace(/-/g, " ")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-1 mb-2", children: viewItem.readingDate ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800", children: "✓ Both stages complete" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800", children: "⏳ Stage 1 done — Reading pending" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Stage 1 — Injection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.testDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Stage 2 — Reading (72 h)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.readingDate ? formatDate(viewItem.readingDate) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600", children: "Pending" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewItem.testType.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewItem.species })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd / Flock Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.herdFlockRef ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animals Tested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.animalsTested ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reactors" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-red-600", children: viewItem.reactors })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Inconclusives" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.inconclusives })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold uppercase", children: viewItem.outcome })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Movement Restriction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: viewItem.movementRestriction ? "font-semibold text-red-600" : "", children: viewItem.movementRestriction ? "YES — Restricted" : "No" })
        ] }),
        viewItem.restrictionLiftedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Restriction Lifted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.restrictionLiftedDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.nextTestDueDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Testing Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.testingVet ?? "—" })
        ] }),
        viewItem.aphaOfficer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "APHA Officer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.aphaOfficer })
        ] }),
        viewItem.aphaCaseRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "APHA Case Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewItem.aphaCaseRef })
        ] }),
        viewItem.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line", children: viewItem.notes })
        ] }),
        (viewItem.documentName || viewItem.documentPath) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: viewItem.documentPath ? `/api/storage${viewItem.documentPath}` : viewItem.documentUrl ?? "#", target: "_blank", rel: "noreferrer", className: "text-primary text-xs underline", children: viewItem.documentName || "View Document" })
        ] }),
        viewItem.animalEarTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: [
            "Ear Tags (",
            viewItem.animalEarTags.split("\n").filter((t) => t.trim()).length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs font-mono bg-muted rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap", children: viewItem.animalEarTags })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Linked Movement Record" }),
          viewItem.movementId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 mt-0.5", children: [
            "✓ Movement #",
            viewItem.movementId,
            " linked — pre/post-movement audit trail complete"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: viewItem.testType === "pre-movement" || viewItem.testType === "post-movement" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-700 font-medium", children: "Not yet linked — edit this record to link the corresponding off-farm movement" }) : "Not linked (optional for routine tests)" })
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
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit TB Test Record" : "Log TB Test" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record bovine TB test results as required by APHA and Red Tractor standards." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate ?? "", onChange: (e) => setF("testDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reading Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.readingDate ?? "", onChange: (e) => setF("readingDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.testType, onValueChange: (v) => setF("testType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "routine-skin", children: "Routine Skin Test" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "short-interval", children: "Short Interval Test (SIT)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "check-test", children: "Check Test" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "gamma-interferon", children: "Gamma Interferon Blood Test" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pre-movement", children: "Pre-movement Test (PMT)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "post-movement", children: "Post-movement Test" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "new-herd", children: "New Herd Test" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species, onValueChange: (v) => setF("species", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cattle", children: "Cattle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "deer", children: "Deer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "camelids", children: "Camelids / Llamas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "goats", children: "Goats" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
          herds.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdId ? String(form.herdId) : "__manual", onValueChange: (v) => {
            if (v === "__manual") {
              setF("herdId", null);
            } else {
              const h = herds.find((h2) => h2.id === Number(v));
              setF("herdId", Number(v));
              if (h) setF("herdFlockRef", h.herdNumber || h.name);
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
                h.name,
                h.herdNumber ? ` (${h.herdNumber})` : ""
              ] }, h.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual", children: "Enter manually…" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdFlockRef ?? "", onChange: (e) => setF("herdFlockRef", e.target.value || null), placeholder: "CPH / herd name" }),
          form.herdId === null && herds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.herdFlockRef ?? "", onChange: (e) => setF("herdFlockRef", e.target.value || null), placeholder: "Herd / flock number or name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.animalsTested ?? "", onChange: (e) => setF("animalsTested", e.target.value ? Number(e.target.value) : null), placeholder: form.animalEarTags ? String(form.animalEarTags.split("\n").filter((t) => t.trim()).length) : "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Animal Ear Tags ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(one per line — count auto-fills Animals Tested)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              rows: 4,
              value: form.animalEarTags ?? "",
              onChange: (e) => {
                const raw = e.target.value || null;
                setF("animalEarTags", raw);
                const count = raw ? raw.split("\n").filter((t) => t.trim()).length : null;
                if (count) setF("animalsTested", count);
              },
              placeholder: "UK123456789012\nUK123456789013\n…",
              className: "font-mono text-xs"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reactors" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.reactors, onChange: (e) => setF("reactors", Number(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inconclusives" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.inconclusives, onChange: (e) => setF("inconclusives", Number(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome, onValueChange: (v) => setF("outcome", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "clear", children: "Clear — All animals negative" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inconclusive", children: "Inconclusive — Some reactors inconclusive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "restricted", children: "Restricted — Movement restriction imposed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "breakdown", children: "Breakdown — TB confirmed" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "tbRestriction", checked: form.movementRestriction, onChange: (e) => setF("movementRestriction", e.target.checked), className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "tbRestriction", children: "Movement restriction currently in place" })
        ] }),
        form.movementRestriction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restriction Lifted Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.restrictionLiftedDate ?? "", onChange: (e) => setF("restrictionLiftedDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDueDate ?? "", onChange: (e) => setF("nextTestDueDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Testing Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "tb-vet-list", value: form.testingVet ?? "", onChange: (e) => setF("testingVet", e.target.value || null), placeholder: "Veterinary surgeon name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "tb-vet-list", children: vetNames.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: v }, v)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Officer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.aphaOfficer ?? "", onChange: (e) => setF("aphaOfficer", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Case Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.aphaCaseRef ?? "", onChange: (e) => setF("aphaCaseRef", e.target.value || null), className: "font-mono" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: docInputRef, className: "hidden", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx", onChange: async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const upload = await uploadFile(file);
            if (upload?.objectPath) {
              setPendingDoc({ path: upload.objectPath, name: file.name });
              setF("documentPath", upload.objectPath);
              setF("documentName", file.name);
            }
            if (docInputRef.current) docInputRef.current.value = "";
          } }),
          pendingDoc || form.documentPath || form.documentName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 p-2 border rounded text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "📎" }),
            form.documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${form.documentPath}`, target: "_blank", rel: "noreferrer", className: "text-primary underline truncate flex-1", children: form.documentName || "Document" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate flex-1", children: form.documentName || "Document" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: () => {
              setPendingDoc(null);
              setF("documentPath", null);
              setF("documentName", null);
            }, children: "×" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "mt-1", onClick: () => docInputRef.current?.click(), disabled: isUploadingDoc, children: isUploadingDoc ? "Uploading…" : "Upload Document (PDF / image)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Link to Livestock Movement Record ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground text-xs", children: form.testType === "pre-movement" || form.testType === "post-movement" ? "(required for pre/post-movement tests)" : "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: form.movementId ?? "",
              onChange: (e) => setF("movementId", e.target.value ? Number(e.target.value) : null),
              className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Not linked to a movement record —" }),
                outgoingMovements.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: m.id, children: [
                  new Date(m.movementDate).toLocaleDateString("en-GB"),
                  " · ",
                  m.movementType.toUpperCase(),
                  " · ",
                  m.species ?? "Unknown",
                  " · ",
                  m.numberOfAnimals ?? "?",
                  " head ",
                  m.toLocation ? `→ ${m.toLocation}` : "",
                  " ",
                  m.licenceNumber ? `[${m.licenceNumber}]` : ""
                ] }, m.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setF("notes", e.target.value || null), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowForm(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form), disabled: !form.testDate || !form.outcome || createMut.isPending || updateMut.isPending, children: [
          (createMut.isPending || updateMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          editing ? "Update" : "Log TB Test"
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: true, title: "Delete TB Test Record?", message: "This record will be permanently removed from your TB register.", onConfirm: () => deleteMut.mutate(deleteId), onCancel: () => setDeleteId(null), confirmLabel: "Delete", confirmVariant: "destructive" })
  ] });
}
const EMPTY_WOA = {
  assessmentDate: "",
  assessorName: "",
  assessorRole: null,
  assessorType: "external",
  assessorMemberId: null,
  assessorSupplierId: null,
  expectedFeeAmountPence: null,
  purchaseOrderId: null,
  species: "",
  herdFlockRef: null,
  sampleSize: null,
  lamenessScore: null,
  bodyConditionScore: null,
  dungScore: null,
  skinLesionScore: null,
  nasalDischargeScore: null,
  eyeDischargeScore: null,
  mortalityRate: null,
  calvingLambingScore: null,
  dagScore: null,
  tailBitingScore: null,
  snoutRootingScore: null,
  featherCoverageScore: null,
  footpadDermatitisScore: null,
  hockBurnScore: null,
  culledBirdsRate: null,
  stockingDensityCompliant: null,
  overallOutcome: "acceptable",
  correctiveActions: null,
  targetDate: null,
  nextAssessmentDue: null,
  documentUrl: null,
  documentName: null,
  documentPath: null,
  notes: null
};
const EMPTY_WALKTHROUGH = {
  observedBy: "",
  observerMemberId: null,
  assessmentDate: "",
  sampleSize: null,
  lamenessAffected: null,
  lamenessTotal: null,
  bcsAffected: null,
  bcsTotal: null,
  dungAffected: null,
  dungTotal: null,
  skinLesionAffected: null,
  skinLesionTotal: null,
  nasalDischargeAffected: null,
  nasalDischargeTotal: null,
  eyeDischargeAffected: null,
  eyeDischargeTotal: null,
  calvingLambingAffected: null,
  calvingLambingTotal: null,
  dagAffected: null,
  dagTotal: null,
  tailBitingAffected: null,
  tailBitingTotal: null,
  snoutRootingAffected: null,
  snoutRootingTotal: null,
  featherCoverageAffected: null,
  featherCoverageTotal: null,
  footpadDermatitisAffected: null,
  footpadDermatitisTotal: null,
  hockBurnAffected: null,
  hockBurnTotal: null,
  culledBirdsAffected: null,
  culledBirdsTotal: null,
  walkthroughNotes: "",
  weatherConditions: ""
};
function getSpeciesMeasures(species) {
  const common = [
    { key: "lamenessScore", label: "Lameness (%)", placeholder: "% animals lame" },
    { key: "bodyConditionScore", label: "Body Condition (%)", placeholder: "% thin animals" },
    { key: "skinLesionScore", label: "Skin Lesions (%)", placeholder: "% with injuries" },
    { key: "nasalDischargeScore", label: "Nasal Discharge (%)", placeholder: "% respiratory signs" },
    { key: "eyeDischargeScore", label: "Eye Discharge (%)", placeholder: "% with eye issues" }
  ];
  if (species === "cattle" || species === "beef-cattle") return [
    ...common,
    { key: "dungScore", label: "Dung Score (%)", placeholder: "% dirty hindquarters" }
  ];
  if (species === "sheep") return [
    ...common,
    { key: "dagScore", label: "Dag / Fleece Score (%)", placeholder: "% with dirty fleece or dag" }
  ];
  if (species === "pigs") return [
    { key: "lamenessScore", label: "Lameness (%)", placeholder: "% animals lame" },
    { key: "bodyConditionScore", label: "Body Condition (%)", placeholder: "% thin sows (BCS <2)" },
    { key: "tailBitingScore", label: "Tail Biting / Wounds (%)", placeholder: "% with tail wounds" },
    { key: "snoutRootingScore", label: "Snout Damage (%)", placeholder: "% with snout lesions" },
    { key: "skinLesionScore", label: "Fight Wounds / Skin Lesions (%)", placeholder: "% with skin injuries" }
  ];
  if (species === "poultry") return [
    { key: "featherCoverageScore", label: "Feather Coverage (%)", placeholder: "% with poor feathering (score 3–4)" },
    { key: "footpadDermatitisScore", label: "Footpad Dermatitis (%)", placeholder: "% with FPD score ≥2" },
    { key: "hockBurnScore", label: "Hock Burn (%)", placeholder: "% with hock burn score ≥2" },
    { key: "culledBirdsRate", label: "Culled / Rejected Birds (%)", placeholder: "% culled or rejected at processing" },
    { key: "stockingDensityCompliant", label: "Stocking Density", placeholder: "", isSelect: true, options: [
      { value: "yes", label: "Yes — within legal maximum" },
      { value: "no", label: "No — exceeds legal maximum" },
      { value: "not_checked", label: "Not checked this assessment" }
    ] }
  ];
  return common;
}
function getWalkthroughCriteria(species) {
  const base = [
    { label: "Lame animals", affKey: "lamenessAffected", totKey: "lamenessTotal", resultKey: "lamenessScore" },
    { label: "Thin / poor BCS", affKey: "bcsAffected", totKey: "bcsTotal", resultKey: "bodyConditionScore" },
    { label: "Skin lesions / injuries", affKey: "skinLesionAffected", totKey: "skinLesionTotal", resultKey: "skinLesionScore" },
    { label: "Nasal discharge", affKey: "nasalDischargeAffected", totKey: "nasalDischargeTotal", resultKey: "nasalDischargeScore" },
    { label: "Eye discharge", affKey: "eyeDischargeAffected", totKey: "eyeDischargeTotal", resultKey: "eyeDischargeScore" }
  ];
  if (species === "cattle" || species === "beef-cattle") return [
    ...base,
    { label: "Dirty hindquarters", affKey: "dungAffected", totKey: "dungTotal", resultKey: "dungScore" }
  ];
  if (species === "sheep") return [
    ...base,
    { label: "Dag / dirty fleece", affKey: "dagAffected", totKey: "dagTotal", resultKey: "dagScore" }
  ];
  if (species === "pigs") return [
    { label: "Lame animals", affKey: "lamenessAffected", totKey: "lamenessTotal", resultKey: "lamenessScore" },
    { label: "Thin / poor BCS (<2)", affKey: "bcsAffected", totKey: "bcsTotal", resultKey: "bodyConditionScore" },
    { label: "Tail biting / wounds", affKey: "tailBitingAffected", totKey: "tailBitingTotal", resultKey: "tailBitingScore" },
    { label: "Snout damage", affKey: "snoutRootingAffected", totKey: "snoutRootingTotal", resultKey: "snoutRootingScore" },
    { label: "Skin lesions / fight wounds", affKey: "skinLesionAffected", totKey: "skinLesionTotal", resultKey: "skinLesionScore" }
  ];
  if (species === "poultry") return [
    { label: "Poor feather coverage", affKey: "featherCoverageAffected", totKey: "featherCoverageTotal", resultKey: "featherCoverageScore" },
    { label: "Footpad dermatitis (≥2)", affKey: "footpadDermatitisAffected", totKey: "footpadDermatitisTotal", resultKey: "footpadDermatitisScore" },
    { label: "Hock burn (≥2)", affKey: "hockBurnAffected", totKey: "hockBurnTotal", resultKey: "hockBurnScore" },
    { label: "Culled / rejected birds", affKey: "culledBirdsAffected", totKey: "culledBirdsTotal", resultKey: "culledBirdsRate" }
  ];
  return base;
}
function calcPct(aff, tot) {
  if (aff == null || tot == null || tot === 0) return null;
  return (aff / tot * 100).toFixed(1);
}
function WelfareOutcomeSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/welfare-outcome-assessments`;
  const { data, isLoading } = useQuery({ queryKey: ["welfare-outcomes", farmId], queryFn: () => fetch(base).then((r) => r.json()) });
  const records = data?.records ?? [];
  const [yearFilterWoa, setYearFilterWoa] = reactExports.useState("all");
  const yearsWoa = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.assessmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredWoaRecords = yearFilterWoa === "all" ? records : records.filter((r) => String(r.assessmentDate ?? "").startsWith(yearFilterWoa));
  const { data: herdsData } = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()) });
  const herds = herdsData?.records ?? [];
  const { data: membersData } = useFarmMembers(farmId);
  const members = (membersData?.members ?? []).filter((m) => m.isActive);
  const { data: suppliersData } = useQuery({
    queryKey: ["woa-suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/woa-suppliers`).then((r) => r.json())
  });
  const suppliers = suppliersData?.records ?? [];
  const { uploadFile: uploadWoaDoc, isUploading: isUploadingWoaDoc } = useUpload();
  const [pendingWoaDoc, setPendingWoaDoc] = reactExports.useState(null);
  const woaDocRef = reactExports.useRef(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...EMPTY_WOA });
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [selectedHerdId, setSelectedHerdId] = reactExports.useState(null);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [showWalkthrough, setShowWalkthrough] = reactExports.useState(false);
  const [wt, setWt] = reactExports.useState({ ...EMPTY_WALKTHROUGH });
  const setW = (k, v) => setWt((w) => ({ ...w, [k]: v }));
  const [feeInputStr, setFeeInputStr] = reactExports.useState("");
  const { data: autoCalc } = useQuery({
    queryKey: ["woa-auto-calc", farmId, selectedHerdId, form.species],
    queryFn: () => fetch(`/api/farms/${farmId}/woa-auto-calc?herdId=${selectedHerdId}&species=${form.species}`).then((r) => r.json()),
    enabled: selectedHerdId !== null && showForm,
    staleTime: 6e4
  });
  function woaSpeciesMatchesHerdType(woaSpecies, herdType, productionType) {
    const s = woaSpecies.toLowerCase();
    const t = herdType.toLowerCase();
    if (s === "cattle" || s === "beef-cattle") {
      const isCattleHerd = canonicalHerdSpecies(t) === "cattle";
      if (!isCattleHerd) return false;
      const p = (productionType ?? "").toLowerCase().trim();
      if (p) {
        const pIsBeef = p === "beef" || p === "suckler";
        const pIsDairy = p === "dairy";
        const pIsMixed = p === "mixed" || p === "mixed (beef & dairy)";
        if (s === "cattle") return pIsDairy || pIsMixed || !pIsBeef && !pIsDairy;
        if (s === "beef-cattle") return pIsBeef || pIsMixed || !pIsBeef && !pIsDairy;
      }
      const typeIsOnlyDairy = t.includes("dairy") && !t.includes("beef") && !t.includes("suckler");
      const typeIsOnlyBeef = (t.includes("beef") || t.includes("suckler")) && !t.includes("dairy");
      if (typeIsOnlyDairy) return s === "cattle";
      if (typeIsOnlyBeef) return s === "beef-cattle";
      return true;
    }
    if (s === "sheep") return canonicalHerdSpecies(t) === "sheep";
    if (s === "pigs") return canonicalHerdSpecies(t) === "pigs";
    if (s === "poultry") return canonicalHerdSpecies(t) === "poultry";
    if (s === "goats") return canonicalHerdSpecies(t) === "goats";
    return canonicalHerdSpecies(t) === s;
  }
  const filteredHerds = herds.filter((h) => woaSpeciesMatchesHerdType(form.species, h.type, h.productionType));
  const herdPool = filteredHerds.length > 0 ? filteredHerds : herds;
  const currentHerdStillValid = !form.herdFlockRef || herdPool.some((h) => h.name === form.herdFlockRef);
  const createMut = useMutation({ mutationFn: (b) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] });
    setShowForm(false);
    setForm({ ...EMPTY_WOA });
    setPendingWoaDoc(null);
    setFeeInputStr("");
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] });
    setShowForm(false);
    setEditing(null);
    setPendingWoaDoc(null);
    setFeeInputStr("");
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] });
    setDeleteId(null);
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const walkthroughMut = useMutation({
    mutationFn: (b) => fetch(`/api/farms/${farmId}/woa-walkthrough`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] });
      qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const activeWoaId = viewItem?.id ?? editing?.id ?? null;
  const { data: linkedWalkthroughsData } = useQuery({
    queryKey: ["woa-walkthroughs", farmId, activeWoaId],
    queryFn: () => fetch(`/api/farms/${farmId}/woa-walkthrough?woaId=${activeWoaId}`).then((r) => r.json()),
    enabled: activeWoaId !== null
  });
  const linkedWalkthroughs = linkedWalkthroughsData?.records ?? [];
  const applyWalkthroughMut = useMutation({
    mutationFn: (wtId) => fetch(`/api/farms/${farmId}/woa-walkthrough/${wtId}/apply`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] });
      qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteWalkthroughMut = useMutation({
    mutationFn: (wtId) => fetch(`/api/farms/${farmId}/woa-walkthrough/${wtId}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setPendingWoaDoc(null);
    setFeeInputStr(r.expectedFeeAmountPence != null ? (r.expectedFeeAmountPence / 100).toString() : "");
    setForm({
      assessmentDate: r.assessmentDate,
      assessorName: r.assessorName,
      assessorRole: r.assessorRole ?? null,
      assessorType: r.assessorType ?? "external",
      assessorMemberId: r.assessorMemberId ?? null,
      assessorSupplierId: r.assessorSupplierId ?? null,
      expectedFeeAmountPence: r.expectedFeeAmountPence ?? null,
      purchaseOrderId: r.purchaseOrderId ?? null,
      species: r.species,
      herdFlockRef: r.herdFlockRef ?? null,
      sampleSize: r.sampleSize,
      lamenessScore: r.lamenessScore ?? null,
      bodyConditionScore: r.bodyConditionScore ?? null,
      dungScore: r.dungScore ?? null,
      skinLesionScore: r.skinLesionScore ?? null,
      nasalDischargeScore: r.nasalDischargeScore ?? null,
      eyeDischargeScore: r.eyeDischargeScore ?? null,
      mortalityRate: r.mortalityRate ?? null,
      calvingLambingScore: r.calvingLambingScore ?? null,
      dagScore: r.dagScore ?? null,
      tailBitingScore: r.tailBitingScore ?? null,
      snoutRootingScore: r.snoutRootingScore ?? null,
      featherCoverageScore: r.featherCoverageScore ?? null,
      footpadDermatitisScore: r.footpadDermatitisScore ?? null,
      hockBurnScore: r.hockBurnScore ?? null,
      culledBirdsRate: r.culledBirdsRate ?? null,
      stockingDensityCompliant: r.stockingDensityCompliant ?? null,
      overallOutcome: r.overallOutcome,
      correctiveActions: r.correctiveActions ?? null,
      targetDate: r.targetDate ?? null,
      nextAssessmentDue: r.nextAssessmentDue ?? null,
      documentUrl: r.documentUrl ?? null,
      documentName: r.documentName ?? null,
      documentPath: r.documentPath ?? null,
      notes: r.notes ?? null
    });
    if (r.herdFlockRef) {
      const h = herds.find((hx) => hx.name === r.herdFlockRef);
      setSelectedHerdId(h?.id ?? null);
    } else {
      setSelectedHerdId(null);
    }
    setShowForm(true);
  }
  function applyWalkthrough() {
    const criteria = getWalkthroughCriteria(form.species);
    const updates = {};
    for (const c of criteria) {
      const pct = calcPct(wt[c.affKey], wt[c.totKey]);
      if (pct !== null) {
        updates[c.resultKey] = pct;
      }
    }
    setForm((f) => ({ ...f, ...updates }));
    walkthroughMut.mutate({ ...wt, woaId: editing?.id ?? null, species: form.species, herdFlockRef: form.herdFlockRef });
    setShowWalkthrough(false);
    setWt({ ...EMPTY_WALKTHROUGH });
  }
  function printReport() {
    const rows = records.map((r) => `<tr><td>${formatDate(r.assessmentDate)}</td><td>${r.species}</td><td>${r.assessorType === "internal" ? "Internal" : "External"}</td><td>${r.assessorName}</td><td>${r.herdFlockRef ?? "—"}</td><td>${r.sampleSize ?? "—"}</td><td>${r.lamenessScore ?? "—"}</td><td>${r.overallOutcome.toUpperCase()}</td><td>${formatDate(r.nextAssessmentDue)}</td></tr>`).join("");
    printProReport({ title: "Welfare Outcome Assessment Register", subtitle: `${records.length} assessments on record`, tableHtml: `<table><thead><tr><th>Date</th><th>Species</th><th>Type</th><th>Assessor</th><th>Herd/Flock</th><th>Sample</th><th>Lameness</th><th>Outcome</th><th>Next Due</th></tr></thead><tbody>${rows}</tbody></table>` });
  }
  const OUTCOME_COL = { good: "bg-green-50 text-green-700", acceptable: "bg-blue-50 text-blue-700", "needs-improvement": "bg-amber-50 text-amber-700", poor: "bg-red-50 text-red-700" };
  function primaryScore(r) {
    if (r.species === "poultry") return r.featherCoverageScore ? `Feat: ${r.featherCoverageScore}%` : "—";
    if (r.species === "pigs") return r.tailBitingScore ? `Tail: ${r.tailBitingScore}%` : r.lamenessScore ? `Lame: ${r.lamenessScore}%` : "—";
    return r.lamenessScore ? `${r.lamenessScore}%` : "—";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Welfare Outcome Assessments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Animal welfare outcome measures (WOA) as required by Red Tractor Beef & Lamb, Dairy, and Cross Compliance standards." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterWoa, onValueChange: setYearFilterWoa, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsWoa.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm({ ...EMPTY_WOA });
          setFeeInputStr("");
          setShowForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Record Assessment"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor WOA:" }),
      " Assessments should be completed at least twice per year for beef & dairy cattle, and annually for other species. Record outcome measures and corrective actions to satisfy assurance requirements."
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filteredWoaRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700 mb-1", children: "No welfare assessments recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Record your first welfare outcome assessment to satisfy Red Tractor requirements." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Assessor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Herd/Flock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Primary Score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Next Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredWoaRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: formatDate(r.assessmentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs capitalize", children: r.species }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: r.assessorName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex text-[10px] font-medium rounded px-1 py-0.5 mt-0.5 ${r.assessorType === "internal" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`, children: r.assessorType === "internal" ? "Farm Staff" : "External" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-600", children: r.herdFlockRef ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs font-mono", children: primaryScore(r) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex text-xs font-semibold rounded-full px-2 py-0.5 ${OUTCOME_COL[r.overallOutcome] ?? "bg-gray-100 text-gray-700"}`, children: r.overallOutcome.replace(/-/g, " ").toUpperCase() }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: formatDate(r.nextAssessmentDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3 text-blue-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "WOA — ",
          formatDate(viewItem.assessmentDate)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          viewItem.species,
          " · ",
          viewItem.assessorName,
          " · ",
          viewItem.assessorType === "internal" ? "Farm Staff" : "External Assessor"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.assessmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewItem.species })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.assessorName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessor Role / Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.assessorRole ?? (viewItem.assessorType === "internal" ? "Farm Staff" : "External") })
        ] }),
        viewItem.purchaseOrderId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-2 bg-sky-50 border border-sky-200 rounded text-xs text-sky-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Expected invoice logged" }),
          " — a purchase order was created in Stock & Supplies when this assessment was saved."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd / Flock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.herdFlockRef ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sample Size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.sampleSize ?? "—" })
        ] }),
        viewItem.lamenessScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lameness" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.lamenessScore,
            "%"
          ] })
        ] }),
        viewItem.bodyConditionScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Body Condition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.bodyConditionScore,
            "%"
          ] })
        ] }),
        viewItem.dungScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dung Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.dungScore,
            "%"
          ] })
        ] }),
        viewItem.dagScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dag / Fleece" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.dagScore,
            "%"
          ] })
        ] }),
        viewItem.tailBitingScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Tail Biting" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.tailBitingScore,
            "%"
          ] })
        ] }),
        viewItem.snoutRootingScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Snout Damage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.snoutRootingScore,
            "%"
          ] })
        ] }),
        viewItem.featherCoverageScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feather Coverage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.featherCoverageScore,
            "%"
          ] })
        ] }),
        viewItem.footpadDermatitisScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Footpad Dermatitis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.footpadDermatitisScore,
            "%"
          ] })
        ] }),
        viewItem.hockBurnScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Hock Burn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.hockBurnScore,
            "%"
          ] })
        ] }),
        viewItem.skinLesionScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Skin Lesions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.skinLesionScore,
            "%"
          ] })
        ] }),
        viewItem.nasalDischargeScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Nasal Discharge" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.nasalDischargeScore,
            "%"
          ] })
        ] }),
        viewItem.eyeDischargeScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Eye Discharge" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.eyeDischargeScore,
            "%"
          ] })
        ] }),
        viewItem.mortalityRate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mortality Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.mortalityRate,
            "%"
          ] })
        ] }),
        viewItem.calvingLambingScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calving/Lambing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewItem.calvingLambingScore,
            "%"
          ] })
        ] }),
        viewItem.stockingDensityCompliant && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Stocking Density" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewItem.stockingDensityCompliant.replace(/_/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Overall Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: viewItem.overallOutcome.replace(/-/g, " ").toUpperCase() })
        ] }),
        viewItem.correctiveActions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Corrective Actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line", children: viewItem.correctiveActions })
        ] }),
        viewItem.targetDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Target Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.targetDate) })
        ] }),
        viewItem.nextAssessmentDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Assessment Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewItem.nextAssessmentDue) })
        ] }),
        viewItem.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line", children: viewItem.notes })
        ] })
      ] }),
      linkedWalkthroughs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 px-3 py-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: [
            "Saved Walkthroughs (",
            linkedWalkthroughs.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y text-sm", children: linkedWalkthroughs.map((wk) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatDate(wk.assessmentDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-2 text-xs", children: [
              "by ",
              wk.observedBy
            ] }),
            wk.sampleSize != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-1 text-xs", children: [
              "· ",
              wk.sampleSize,
              " animals"
            ] }),
            wk.appliedToWoa && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1 py-0.5", children: "Applied" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", disabled: applyWalkthroughMut.isPending, onClick: () => applyWalkthroughMut.mutate(wk.id), children: [
              applyWalkthroughMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }),
              "Re-apply"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 text-destructive hover:text-destructive", onClick: () => deleteWalkthroughMut.mutate(wk.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
          ] })
        ] }, wk.id)) })
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
    showWalkthrough && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setShowWalkthrough(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Walkthrough Observations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter raw animal counts per welfare criterion. Percentages are calculated automatically and will pre-fill the assessment when you apply." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observer Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: wt.observerMemberId != null ? String(wt.observerMemberId) : "__free__", onValueChange: (v) => {
              if (v === "__free__") {
                setW("observerMemberId", null);
              } else {
                const m = members.find((mx) => String(mx.id) === v);
                if (m) {
                  setW("observerMemberId", m.id);
                  setW("observedBy", memberFullName(m));
                }
              }
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__free__", children: "— Enter name manually —" }),
                members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                  memberFullName(m),
                  m.jobTitle ? ` — ${m.jobTitle}` : ""
                ] }, m.id))
              ] })
            ] }),
            wt.observerMemberId == null && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: wt.observedBy, onChange: (e) => setW("observedBy", e.target.value), placeholder: "Observer name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Walk Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: wt.assessmentDate, onChange: (e) => setW("assessmentDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Observed (Total)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: wt.sampleSize ?? "", onChange: (e) => setW("sampleSize", e.target.value ? Number(e.target.value) : null), placeholder: "Total observed in walkthrough" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weather / Conditions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: wt.weatherConditions, onChange: (e) => setW("weatherConditions", e.target.value), placeholder: "e.g. Dry, housed, outdoor" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground", children: "Criterion" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2 font-medium text-muted-foreground", children: "Affected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2 font-medium text-muted-foreground", children: "Total observed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2 font-medium text-muted-foreground", children: "%" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: getWalkthroughCriteria(form.species).map((c) => {
            const aff = wt[c.affKey];
            const tot = wt[c.totKey];
            const pct = calcPct(aff, tot);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium text-gray-700", children: c.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, className: "h-8 text-center", value: aff ?? "", onChange: (e) => setW(c.affKey, e.target.value ? Number(e.target.value) : null) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, className: "h-8 text-center", value: tot ?? "", onChange: (e) => setW(c.totKey, e.target.value ? Number(e.target.value) : null) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center font-mono text-sm", children: pct !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${parseFloat(pct) > 10 ? "text-amber-700" : "text-green-700"}`, children: [
                pct,
                "%"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) })
            ] }, c.label);
          }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Walkthrough Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: wt.walkthroughNotes, onChange: (e) => setW("walkthroughNotes", e.target.value), rows: 2, placeholder: "Any specific observations, environmental factors, or notes about individual animals" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Apply to assessment:" }),
          " Calculated percentages will be copied to the welfare measures fields. You can still edit them manually before saving."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setShowWalkthrough(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: applyWalkthrough, disabled: !wt.observedBy, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-1" }),
          "Apply to Assessment"
        ] })
      ] })
    ] }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Welfare Assessment" : "Record Welfare Outcome Assessment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Complete welfare outcome measures as required by Red Tractor and cross compliance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate ?? "", onChange: (e) => setF("assessmentDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species || "__none__", onValueChange: (v) => {
              const species = v === "__none__" ? "" : v;
              setF("species", species);
              const herdStillValid = !form.herdFlockRef || herds.filter((h) => woaSpeciesMatchesHerdType(species, h.type, h.productionType)).some((h) => h.name === form.herdFlockRef);
              if (!herdStillValid) {
                setF("herdFlockRef", null);
                setSelectedHerdId(null);
              }
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select species —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cattle", children: "Cattle (Dairy)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "beef-cattle", children: "Cattle (Beef)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sheep", children: "Sheep" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pigs", children: "Pigs" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "poultry", children: "Poultry" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: currentHerdStillValid ? form.herdFlockRef ?? "__none__" : "__none__", onValueChange: (v) => {
              if (v === "__none__") {
                setF("herdFlockRef", null);
                setSelectedHerdId(null);
              } else {
                const h = herdPool.find((h2) => h2.name === v);
                setF("herdFlockRef", v);
                setSelectedHerdId(h?.id ?? null);
              }
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd / flock" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
                herdPool.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: h.name, children: [
                  h.name,
                  h.herdNumber ? ` (${h.herdNumber})` : ""
                ] }, h.id))
              ] })
            ] }),
            filteredHerds.length === 0 && herds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "No ",
              form.species,
              " herds matched — showing all."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sample Size" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.sampleSize ?? "", onChange: (e) => setF("sampleSize", e.target.value ? Number(e.target.value) : null), placeholder: "No. animals observed" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm text-gray-800", children: "Assessor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Assessor Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setF("assessorType", "internal"),
                  className: `flex-1 py-2 px-3 text-sm rounded-md border font-medium transition-colors ${form.assessorType === "internal" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400"}`,
                  children: "Farm Staff"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setF("assessorType", "external"),
                  className: `flex-1 py-2 px-3 text-sm rounded-md border font-medium transition-colors ${form.assessorType === "external" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-gray-700 border-gray-300 hover:border-sky-400"}`,
                  children: "External Assessor"
                }
              )
            ] })
          ] }),
          form.assessorType === "internal" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assessorMemberId != null ? String(form.assessorMemberId) : "__none__", onValueChange: (v) => {
                if (v === "__none__") {
                  setF("assessorMemberId", null);
                  setF("assessorName", "");
                  setF("assessorRole", null);
                } else {
                  const m = members.find((mx) => String(mx.id) === v);
                  if (m) {
                    setF("assessorMemberId", m.id);
                    setF("assessorName", memberFullName(m));
                    setF("assessorRole", m.jobTitle ?? "Farm Staff");
                  }
                }
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                  members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                    memberFullName(m),
                    m.jobTitle ? ` — ${m.jobTitle}` : ""
                  ] }, m.id))
                ] })
              ] }),
              members.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                "No staff registered — ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/staff", className: "underline text-primary", children: "add staff" }),
                " or enter name below."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role / Job Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assessorRole ?? "", onChange: (e) => setF("assessorRole", e.target.value || null), placeholder: "Auto-filled from staff register" })
            ] }),
            form.assessorMemberId == null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name (if not in register) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assessorName ?? "", onChange: (e) => setF("assessorName", e.target.value), placeholder: "Full name" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier / Trade Contact *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assessorSupplierId != null ? String(form.assessorSupplierId) : "__none__", onValueChange: (v) => {
                if (v === "__none__") {
                  setF("assessorSupplierId", null);
                  setF("assessorName", "");
                } else {
                  const s = suppliers.find((sx) => String(sx.id) === v);
                  if (s) {
                    setF("assessorSupplierId", s.id);
                    setF("assessorName", s.contactName ?? s.name);
                  }
                }
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from suppliers" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                  suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                    s.name,
                    s.contactName ? ` (${s.contactName})` : ""
                  ] }, s.id))
                ] })
              ] }),
              suppliers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "No suppliers registered. Add in Stock & Supplies, or enter name below." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Role / Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assessorRole ?? "", onChange: (e) => setF("assessorRole", e.target.value || null), placeholder: "e.g. Farm Vet, Welfare Consultant" })
            ] }),
            form.assessorSupplierId == null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name (if not in register) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assessorName ?? "", onChange: (e) => setF("assessorName", e.target.value), placeholder: "Assessor full name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Fee (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 0,
                  step: 0.01,
                  value: feeInputStr,
                  onChange: (e) => {
                    setFeeInputStr(e.target.value);
                    setF("expectedFeeAmountPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null);
                  },
                  placeholder: "0.00 — leave blank if no fee"
                }
              )
            ] }),
            form.assessorSupplierId != null && form.expectedFeeAmountPence != null && form.expectedFeeAmountPence > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 mt-0.5 flex-shrink-0 text-sky-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "An expected invoice (purchase order) will be automatically logged in ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Stock & Supplies → Purchase Orders" }),
                " when you save this assessment."
              ] })
            ] }),
            editing?.purchaseOrderId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700", children: [
              "✓ Purchase order already created for this assessment (PO #",
              editing.purchaseOrderId,
              ")."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-medium text-sm text-gray-800", children: [
              "Welfare Measures — ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize text-muted-foreground font-normal", children: form.species })
            ] }),
            form.assessorType === "internal" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => {
              setWt({ ...EMPTY_WALKTHROUGH, observedBy: form.assessorName, assessmentDate: form.assessmentDate, sampleSize: form.sampleSize });
              setShowWalkthrough(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5 mr-1" }),
              "Enter Raw Counts"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            getSpeciesMeasures(form.species).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: m.label }),
              m.isSelect ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form[m.key] ?? "", onValueChange: (v) => setF(m.key, v || null), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: m.options?.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form[m.key] ?? "", onChange: (e) => setF(m.key, e.target.value || null), placeholder: m.placeholder })
            ] }, m.key)),
            form.species !== "poultry" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mortality Rate (%, 12-month)" }),
                  autoCalc?.mortalityRate && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "text-xs text-primary underline", onClick: () => setF("mortalityRate", autoCalc.mortalityRate), children: [
                    "Use ",
                    autoCalc.mortalityRate,
                    "% (calculated)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.mortalityRate ?? "", onChange: (e) => setF("mortalityRate", e.target.value || null), placeholder: autoCalc?.mortalityRate ? `Calculated: ${autoCalc.mortalityRate}%` : "Rolling 12-month mortality %" }),
                autoCalc?.mortalityRate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 mt-0.5", children: [
                  "✓ From Mortality Register: ",
                  autoCalc.deathCount,
                  " deaths / ",
                  autoCalc.herdSize,
                  " animals."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: selectedHerdId ? "No mortality records found — enter manually." : "Select a herd to auto-calculate." })
              ] }),
              (form.species === "cattle" || form.species === "beef-cattle" || form.species === "sheep") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                    form.species === "sheep" ? "Lambing Score" : "Calving Score",
                    " (% assisted)"
                  ] }),
                  autoCalc?.calvingLambingScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "text-xs text-primary underline", onClick: () => setF("calvingLambingScore", autoCalc.calvingLambingScore), children: [
                    "Use ",
                    autoCalc.calvingLambingScore,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.calvingLambingScore ?? "", onChange: (e) => setF("calvingLambingScore", e.target.value || null), placeholder: "% assisted births" }),
                autoCalc?.calvingLambingScore ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 mt-0.5", children: [
                  "✓ From ",
                  form.species === "sheep" ? "Lambing" : "Calving",
                  " records."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: selectedHerdId ? "No records found — enter manually." : "Select a herd to auto-calculate." })
              ] })
            ] })
          ] })
        ] }),
        editing && linkedWalkthroughs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 px-3 py-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: [
              "Saved Walkthroughs (",
              linkedWalkthroughs.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground ml-1", children: "— click Re-apply to push tally counts to the scores below" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y text-sm", children: linkedWalkthroughs.map((wk) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatDate(wk.assessmentDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-2 text-xs", children: [
                "by ",
                wk.observedBy
              ] }),
              wk.sampleSize != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-1 text-xs", children: [
                "· ",
                wk.sampleSize,
                " animals"
              ] }),
              wk.weatherConditions && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-1 text-xs", children: [
                "· ",
                wk.weatherConditions
              ] }),
              wk.appliedToWoa && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1 py-0.5", children: "Applied" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", disabled: applyWalkthroughMut.isPending, onClick: () => applyWalkthroughMut.mutate(wk.id), children: [
                applyWalkthroughMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }),
                "Re-apply"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 text-destructive hover:text-destructive", onClick: () => deleteWalkthroughMut.mutate(wk.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
            ] })
          ] }, wk.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Outcome *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.overallOutcome, onValueChange: (v) => setF("overallOutcome", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "good", children: "Good — All measures within target" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "acceptable", children: "Acceptable — Minor areas for attention" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "needs-improvement", children: "Needs Improvement — Action plan required" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "poor", children: "Poor — Urgent action required" })
              ] })
            ] })
          ] }),
          (form.overallOutcome === "needs-improvement" || form.overallOutcome === "poor") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm text-amber-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠ Action required" }),
            " — A task will appear on the Week Ahead planner for all farm staff so this can be tracked and signed off before the target date."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Actions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.correctiveActions ?? "", onChange: (e) => setF("correctiveActions", e.target.value || null), rows: 3, placeholder: "Describe the specific actions that must be taken — who, what, and by when" }),
            (form.overallOutcome === "needs-improvement" || form.overallOutcome === "poor") && !form.correctiveActions && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-0.5", children: "Required when outcome is Needs Improvement or Poor" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Completion Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.targetDate ?? "", onChange: (e) => setF("targetDate", e.target.value || null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Assessment Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextAssessmentDue ?? "", onChange: (e) => setF("nextAssessmentDue", e.target.value || null) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Document" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: woaDocRef, className: "hidden", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx", onChange: async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const upload = await uploadWoaDoc(file);
              if (upload?.objectPath) {
                setPendingWoaDoc({ path: upload.objectPath, name: file.name });
                setF("documentPath", upload.objectPath);
                setF("documentName", file.name);
              }
              if (woaDocRef.current) woaDocRef.current.value = "";
            } }),
            pendingWoaDoc || form.documentPath || form.documentName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 p-2 border rounded text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "📎" }),
              form.documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${form.documentPath}`, target: "_blank", rel: "noreferrer", className: "text-primary underline truncate flex-1", children: form.documentName || "Document" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate flex-1", children: form.documentName || "Document" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: () => {
                setPendingWoaDoc(null);
                setF("documentPath", null);
                setF("documentName", null);
              }, children: "×" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "mt-1", onClick: () => woaDocRef.current?.click(), disabled: isUploadingWoaDoc, children: isUploadingWoaDoc ? "Uploading…" : "Upload Document (PDF / image)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setF("notes", e.target.value || null), rows: 2 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowForm(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form), disabled: !form.assessmentDate || !form.assessorName || createMut.isPending || updateMut.isPending, children: [
          (createMut.isPending || updateMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          editing ? "Update" : "Save Assessment"
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: true, title: "Delete Assessment?", message: "This welfare outcome assessment will be permanently deleted.", onConfirm: () => deleteMut.mutate(deleteId), onCancel: () => setDeleteId(null), confirmLabel: "Delete", confirmVariant: "destructive" })
  ] });
}
const EMPTY_DIP = { dipDate: "", productName: "", mappNumber: null, activeIngredient: null, dipType: "plunge", dipConcentrationPct: null, volumeOfDipLitres: null, sheepCount: 0, herdFlockRef: null, operatorName: "", operatorCertNumber: null, operatorCertExpiry: null, bathFillDate: null, daysSinceLastUse: null, topUpVolumeAdded: null, disposalMethod: null, disposalQuantityLitres: null, disposalDate: null, disposalContractorName: null, disposalWasteTransferNoteRef: null, withdrawalPeriodDays: null, withdrawalClearDate: null, stockItemId: null, quantityUsed: null, documentPath: null, documentUrl: null, documentName: null, notes: null };
function SheepDippingSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/sheep-dipping-records`;
  const { data, isLoading } = useQuery({ queryKey: ["sheep-dipping", farmId], queryFn: () => fetch(base).then((r) => r.json()) });
  const records = data?.records ?? [];
  const [yearFilterDip, setYearFilterDip] = reactExports.useState("all");
  const yearsDip = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.dipDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredDipRecords = yearFilterDip === "all" ? records : records.filter((r) => String(r.dipDate ?? "").startsWith(yearFilterDip));
  const { data: stockData } = useQuery({ queryKey: ["stock-items", farmId], queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then((r) => r.json()) });
  const chemicalItems = (stockData?.records ?? []).filter((s) => s.isActive);
  const { data: herdsData } = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()) });
  const sheepHerds = (herdsData?.herds ?? []).filter((h) => h.species === "sheep" || h.species === "goat");
  const { data: certsData } = useQuery({
    queryKey: ["staff-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then((r) => r.ok ? r.json() : { records: [] })
  });
  const allCerts = certsData?.records ?? [];
  const PESTICIDE_TYPES = ["PA1", "PA2", "PA3", "PA4", "PA6", "PA6AW", "Safe use of pesticides", "Safe use of rodenticides"];
  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = (membersData?.members ?? []).filter((m) => m.isActive !== false);
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
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const selectedStockItem = chemicalItems.find((s) => s.id === form.stockItemId) ?? null;
  const createMut = useMutation({ mutationFn: (b) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-items", farmId] });
    setShowForm(false);
    setForm({ ...EMPTY_DIP });
    setPendingDoc(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
    setShowForm(false);
    setEditing(null);
    setPendingDoc(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dipping", farmId] });
    setDeleteId(null);
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openEdit(r) {
    setEditing(r);
    setPendingDoc(null);
    setForm({ dipDate: r.dipDate, productName: r.productName, mappNumber: r.mappNumber ?? null, activeIngredient: r.activeIngredient ?? null, dipType: r.dipType, dipConcentrationPct: r.dipConcentrationPct ?? null, volumeOfDipLitres: r.volumeOfDipLitres ?? null, sheepCount: r.sheepCount, herdFlockRef: r.herdFlockRef ?? null, operatorName: r.operatorName, operatorCertNumber: r.operatorCertNumber ?? null, operatorCertExpiry: r.operatorCertExpiry ?? null, bathFillDate: r.bathFillDate ?? null, daysSinceLastUse: r.daysSinceLastUse, topUpVolumeAdded: r.topUpVolumeAdded ?? null, disposalMethod: r.disposalMethod ?? null, disposalQuantityLitres: r.disposalQuantityLitres ?? null, disposalDate: r.disposalDate ?? null, disposalContractorName: r.disposalContractorName ?? null, disposalWasteTransferNoteRef: r.disposalWasteTransferNoteRef ?? null, withdrawalPeriodDays: r.withdrawalPeriodDays, withdrawalClearDate: r.withdrawalClearDate ?? null, stockItemId: r.stockItemId ?? null, quantityUsed: r.quantityUsed ?? null, documentPath: r.documentPath ?? null, documentUrl: r.documentUrl ?? null, documentName: r.documentName ?? null, notes: r.notes ?? null });
    setShowForm(true);
  }
  function printReport() {
    const rows = records.map((r) => `<tr><td>${formatDate(r.dipDate)}</td><td>${r.productName}</td><td>${r.dipType}</td><td>${r.sheepCount}</td><td>${r.operatorName}</td><td>${r.operatorCertNumber ?? "—"}</td><td>${r.disposalMethod ?? "—"}</td><td>${r.withdrawalPeriodDays != null ? r.withdrawalPeriodDays + " days" : "—"}</td><td>${formatDate(r.withdrawalClearDate)}</td></tr>`).join("");
    printProReport({ title: "Sheep Dipping Register", subtitle: `${records.length} dipping records`, tableHtml: `<table><thead><tr><th>Dip Date</th><th>Product</th><th>Type</th><th>Sheep Count</th><th>Operator</th><th>Cert No.</th><th>Disposal</th><th>W/drawal</th><th>Clear Date</th></tr></thead><tbody>${rows}</tbody></table>` });
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredDipRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: formatDate(r.dipDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-gray-900 text-xs", children: r.productName }),
          r.mappNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "MAPP: ",
            r.mappNumber
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs capitalize", children: r.dipType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: r.sheepCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: r.operatorName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: r.disposalMethod ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: formatDate(r.withdrawalClearDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3 text-blue-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(r.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, r.id)) })
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
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: "0.001", value: form.quantityUsed ?? "", onChange: (e) => setF("quantityUsed", e.target.value || null), placeholder: `Amount in ${selectedStockItem.unit ?? "units"}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dipping Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dipDate ?? "", onChange: (e) => setF("dipDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name (MAPP) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productName ?? "", onChange: (e) => setF("productName", e.target.value), placeholder: "e.g. Ridect Pour-On" }),
          form.stockItemId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Auto-filled from chemical store — edit if needed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "MAPP Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.mappNumber ?? "", onChange: (e) => setF("mappNumber", e.target.value || null), className: "font-mono" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.activeIngredient ?? "", onChange: (e) => setF("activeIngredient", e.target.value || null), placeholder: "e.g. Cypermethrin" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.dipConcentrationPct ?? "", onChange: (e) => setF("dipConcentrationPct", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume of Dip (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.volumeOfDipLitres ?? "", onChange: (e) => setF("volumeOfDipLitres", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sheep Count *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.sheepCount || "", onChange: (e) => setF("sheepCount", Number(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Flock" }),
          sheepHerds.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdFlockRef ?? "", onValueChange: (v) => setF("herdFlockRef", v || null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select flock…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None —" }),
              sheepHerds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: h.herdFlockMark ?? h.name, children: [
                h.name,
                h.herdFlockMark ? ` (${h.herdFlockMark})` : ""
              ] }, h.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdFlockRef ?? "", onChange: (e) => setF("herdFlockRef", e.target.value || null), placeholder: "Flock mark / reference" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.operatorCertNumber ?? "", onChange: (e) => setF("operatorCertNumber", e.target.value || null), className: "font-mono", placeholder: "PA6AW / equivalent" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cert. Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.operatorCertExpiry ?? "", onChange: (e) => setF("operatorCertExpiry", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bath Fill Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.bathFillDate ?? "", onChange: (e) => setF("bathFillDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Days Since Last Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.daysSinceLastUse ?? "", onChange: (e) => setF("daysSinceLastUse", e.target.value ? Number(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Top-Up Volume Added (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.topUpVolumeAdded ?? "", onChange: (e) => setF("topUpVolumeAdded", e.target.value || null) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.disposalQuantityLitres ?? "", onChange: (e) => setF("disposalQuantityLitres", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.disposalDate ?? "", onChange: (e) => setF("disposalDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Contractor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.disposalContractorName ?? "", onChange: (e) => setF("disposalContractorName", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste Transfer Note Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.disposalWasteTransferNoteRef ?? "", onChange: (e) => setF("disposalWasteTransferNoteRef", e.target.value || null), className: "font-mono" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3", children: "Withdrawal Period" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal Period (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.withdrawalPeriodDays ?? "", onChange: (e) => setF("withdrawalPeriodDays", e.target.value ? Number(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal Clear Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.withdrawalClearDate ?? "", onChange: (e) => setF("withdrawalClearDate", e.target.value || null) })
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
              onChange: async (e) => {
                const file = e.target.files?.[0];
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setF("notes", e.target.value || null), rows: 2 })
        ] })
      ] }),
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
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: true, title: "Delete Dipping Record?", message: "This sheep dipping record will be permanently deleted.", onConfirm: () => deleteMut.mutate(deleteId), onCancel: () => setDeleteId(null), confirmLabel: "Delete", confirmVariant: "destructive" })
  ] });
}
const LIVESTOCK_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
function LivestockAnalyticsSection({ farmId }) {
  const { data: mortalityData } = useQuery({ queryKey: ["mortality", farmId], queryFn: () => fetch(`/api/farms/${farmId}/mortality-records`).then((r) => r.json()) });
  const { data: bvdData } = useQuery({ queryKey: ["bvd-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/bvd-tests`).then((r) => r.json()).then((d) => d.records ?? []) });
  const { data: tbData } = useQuery({ queryKey: ["tb-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`).then((r) => r.json()) });
  const { data: aiData } = useQuery({ queryKey: ["ai-reproduction", farmId], queryFn: () => fetch(`/api/farms/${farmId}/ai-reproduction-records`).then((r) => r.json()).then((d) => d.records ?? []) });
  const mortality = reactExports.useMemo(() => mortalityData?.records ?? mortalityData ?? [], [mortalityData]);
  const bvdTests = reactExports.useMemo(() => Array.isArray(bvdData) ? bvdData : [], [bvdData]);
  const tbTests = reactExports.useMemo(() => tbData?.records ?? [], [tbData]);
  const aiRecords = reactExports.useMemo(() => Array.isArray(aiData) ? aiData : [], [aiData]);
  const mortalityByCause = reactExports.useMemo(() => {
    const map = {};
    mortality.forEach((r) => {
      const c = String(r.causeOfDeath || r.cause || "Unknown");
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name: name.length > 16 ? name.slice(0, 15) + "…" : name, count }));
  }, [mortality]);
  const mortalityByMonth = reactExports.useMemo(() => {
    const map = {};
    const now = /* @__PURE__ */ new Date();
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 11);
    mortality.forEach((r) => {
      const d = new Date(String(r.dateOfDeath || r.date || ""));
      if (isNaN(d.getTime()) || d < cutoff) return;
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort().map(([m, count]) => ({ month: m.slice(5), count }));
  }, [mortality]);
  const bvdResultCounts = reactExports.useMemo(() => {
    const map = {};
    bvdTests.forEach((r) => {
      const k = String(r.result || "Unknown");
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bvdTests]);
  const tbPassRate = reactExports.useMemo(() => {
    const passed = tbTests.filter((r) => r.testResult === "clear" || r.testResult === "passed" || r.passed === true).length;
    return tbTests.length ? Math.round(passed / tbTests.length * 100) : null;
  }, [tbTests]);
  const aiConceptionRate = reactExports.useMemo(() => {
    const confirmed = aiRecords.filter((r) => r.pregnancyConfirmed === true || r.status === "pregnant").length;
    return aiRecords.length ? Math.round(confirmed / aiRecords.length * 100) : null;
  }, [aiRecords]);
  const noData = mortality.length === 0 && bvdTests.length === 0 && tbTests.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add mortality, BVD, or TB records to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Mortality Records", value: mortality.length, bg: "bg-red-50 border-red-100", text: "text-red-800", sub: "text-red-700" },
      { label: "BVD Tests", value: bvdTests.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
      { label: "TB Test Pass Rate", value: tbPassRate !== null ? `${tbPassRate}%` : "—", bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
      { label: "AI Conception Rate", value: aiConceptionRate !== null ? `${aiConceptionRate}%` : "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      mortalityByCause.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Mortality by Cause" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: mortalityByCause, layout: "vertical", margin: { left: 4, right: 24, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 10 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 90 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} animals`, "Deaths"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#b91c1c", radius: [0, 3, 3, 0] })
        ] }) }) })
      ] }),
      bvdResultCounts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "BVD Test Results" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: bvdResultCounts, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: bvdResultCounts.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: LIVESTOCK_COLORS[i % LIVESTOCK_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} tests`, ""] })
        ] }) }) })
      ] })
    ] }),
    mortalityByMonth.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Monthly Mortality (last 12 months)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: mortalityByMonth, margin: { left: 0, right: 16, top: 4, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}`, "Deaths"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#b91c1c", radius: [3, 3, 0, 0] })
      ] }) }) })
    ] })
  ] });
}
function LivestockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = reactExports.useState(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab");
    const valid = ["herds", "vet-plans", "mortality", "contractors", "feed", "water", "animals", "ai-repro", "vet-rx", "sires", "straws", "lambing", "tb-tests", "welfare-outcomes", "sheep-dipping", "bvd", "casualty-slaughter", "isolation", "analytics"];
    return valid.includes(t) ? t : "herds";
  });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Herds & Animals", children: [
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
      tab === "animals" && /* @__PURE__ */ jsxRuntimeExports.jsx(AnimalsSection, { farmId }),
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
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["bvd-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bvd-tests`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const [yearFilterBvd, setYearFilterBvd] = reactExports.useState("all");
  const yearsBvd = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredBvdRecords = yearFilterBvd === "all" ? records : records.filter((r) => String(r.testDate ?? "").startsWith(yearFilterBvd));
  const { data: herdsRaw } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId
  });
  const herds = Array.isArray(herdsRaw) ? herdsRaw : herdsRaw?.records ?? [];
  function openAdd() {
    setEditing(null);
    setForm({ result: "negative" });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }
  function printBvdRegister() {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = records.map((r) => `<tr>
      <td>${fmtD(r.testDate)}</td>
      <td>${BVD_TEST_TYPES.find((t) => t.value === r.testType)?.label ?? r.testType ?? "—"}</td>
      <td>${herds.find((h) => h.id === r.herdId)?.name ?? "—"}</td>
      <td>${r.result}</td>
      <td>${r.animalsTestedCount ?? "—"}</td>
      <td>${r.piAnimalsFound ?? 0}</td>
      <td>${r.labName ?? "—"}</td>
      <td>${r.labRef ?? "—"}</td>
      <td>${BVD_ACCRED.find((a) => a.value === r.accreditationStatus)?.label ?? "—"}</td>
      <td>${fmtD(r.nextTestDue)}</td>
      <td>${r.vetName ?? "—"}</td>
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
  async function del(id) {
    if (!confirm("Delete this BVD test record?")) return;
    await fetch(`/api/farms/${farmId}/bvd-tests/${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["bvd-tests", farmId] });
  }
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const resultBadge = (r) => {
    const colours = { negative: "bg-green-100 text-green-800", positive: "bg-red-100 text-red-800", pi_identified: "bg-red-200 text-red-900", inconclusive: "bg-amber-100 text-amber-800" };
    const label = BVD_RESULTS.find((x) => x.value === r)?.label ?? r;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[r] ?? "bg-gray-100 text-gray-700"}`, children: label });
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Test Date", "Test Type", "Herd", "Result", "Animals Tested", "PI Found", "Accreditation Status", "Next Test Due", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredBvdRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDate(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: BVD_TEST_TYPES.find((t) => t.value === r.testType)?.label ?? r.testType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: herds.find((h) => h.id === r.herdId)?.name ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: resultBadge(r.result) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.animalsTestedCount ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.piAnimalsFound ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: BVD_ACCRED.find((a) => a.value === r.accreditationStatus)?.label ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDate(r.nextTestDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => del(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " BVD Test Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate || "", onChange: (e) => set("testDate", e.target.value) })
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
              herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Result *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.result || "negative", onValueChange: (v) => set("result", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BVD_RESULTS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labName || "", onChange: (e) => set("labName", e.target.value), placeholder: "e.g. SRUC, Biobest" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e) => set("animalsTestedCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PI Animals Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.piAnimalsFound ?? 0, onChange: (e) => set("piAnimalsFound", e.target.value) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.schemeMembershipNumber || "", onChange: (e) => set("schemeMembershipNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDue || "", onChange: (e) => set("nextTestDue", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.actionsTaken || "", onChange: (e) => set("actionsTaken", e.target.value), placeholder: "PI removal, vaccination decisions, biosecurity changes…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: editing ? "Save Changes" : "Add Record" })
      ] })
    ] }) })
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
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["casualty-slaughter", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/casualty-slaughter`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const [yearFilterCasualty, setYearFilterCasualty] = reactExports.useState("all");
  const yearsCasualty = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.eventDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredCasualtyRecords = yearFilterCasualty === "all" ? records : records.filter((r) => String(r.eventDate ?? "").startsWith(yearFilterCasualty));
  const { data: fallenContractors = [] } = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const { data: animalsData } = useQuery({
    queryKey: ["farm-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 6e4
  });
  const animals = animalsData?.records ?? [];
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`, { credentials: "include" }).then((r) => r.json()),
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
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }
  function printCasualtyRegister() {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = records.map((r) => `<tr>
      <td>${fmtD(r.eventDate)}</td>
      <td>${r.animalEarTag ?? "—"}</td>
      <td>${r.species}</td>
      <td>${r.ageOrDescription ?? "—"}</td>
      <td>${r.reasonForSlaughter ?? "—"}</td>
      <td>${CASUALTY_METHODS.find((m) => m.value === r.method)?.label ?? r.method ?? "—"}</td>
      <td>${r.veterinaryInvolved ? r.vetName ?? r.performedBy ?? "—" : r.performedBy ?? "—"}</td>
      <td>${r.veterinaryInvolved ? r.rcvsNumber ?? "—" : r.waskWatokCertRef ?? "—"}</td>
      <td>${CARCASE_DISPOSAL.find((c) => c.value === r.carcaseDisposalMethod)?.label ?? r.carcaseDisposalMethod ?? "—"}</td>
      <td>${r.notes ?? "—"}</td>
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
  async function del(id) {
    if (!confirm("Delete this casualty slaughter record?")) return;
    await fetch(`/api/farms/${farmId}/casualty-slaughter/${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["casualty-slaughter", farmId] });
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Ear Tag", "Species", "Reason", "Method", "Performed By", "WASK/WATOK / RCVS", "Disposal", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredCasualtyRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDate(r.eventDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs", children: r.animalEarTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.species }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 max-w-[140px] truncate", title: r.reasonForSlaughter, children: r.reasonForSlaughter }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: CASUALTY_METHODS.find((m) => m.value === r.method)?.label ?? r.method }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.veterinaryInvolved ? r.vetName || r.performedBy : r.performedBy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs", children: r.veterinaryInvolved ? r.rcvsNumber || "—" : r.waskWatokCertRef || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: CARCASE_DISPOSAL.find((c) => c.value === r.carcaseDisposalMethod)?.label ?? r.carcaseDisposalMethod ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => del(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Casualty Slaughter Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.eventDate || "", onChange: (e) => set("eventDate", e.target.value) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.animalEarTag || "", onChange: (e) => handleEarTagChange(e.target.value), placeholder: "UK ear tag number" }),
          form.animalEarTag && matchedAnimal(form.animalEarTag) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "Matched — breed & age auto-filled from animal register." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed / Age" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ageOrDescription || "", onChange: (e) => set("ageOrDescription", e.target.value), placeholder: "e.g. 3yo Holstein cow" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason for Slaughter *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.reasonForSlaughter || "", onChange: (e) => set("reasonForSlaughter", e.target.value), placeholder: "e.g. Severe fracture — irretrievable" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Method *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.method || "captive_bolt", onValueChange: handleMethodChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CASUALTY_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Witness" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.witnessName || "", onChange: (e) => set("witnessName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "vetinv", checked: !!form.veterinaryInvolved, onChange: (e) => set("veterinaryInvolved", e.target.checked), className: "rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vetinv", children: "Veterinary surgeon involved" })
        ] }),
        form.veterinaryInvolved ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "Full name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "RCVS Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.rcvsNumber || "", onChange: (e) => set("rcvsNumber", e.target.value), placeholder: "e.g. 1234567" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Performed By *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.performedBy || "", onChange: (v) => set("performedBy", v), staffNames, loading: staffLoading })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "WASK/WATOK Certificate Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.waskWatokCertRef || "", onChange: (e) => set("waskWatokCertRef", e.target.value), placeholder: "Certificate number" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.carcaseCollectionDate || "", onChange: (e) => set("carcaseCollectionDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal / Collection Note Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.carcaseDisposalRef || "", onChange: (e) => set("carcaseDisposalRef", e.target.value), placeholder: "NFAS cert / waste transfer note ref" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: editing ? "Save Changes" : "Add Record" })
      ] })
    ] }) })
  ] });
}
function IsolationRegisterSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: isoMembersData, isLoading: isoMembersLoading } = useFarmMembers(farmId);
  const isoStaffNames = (isoMembersData?.members ?? []).filter((m) => m.isActive !== false).map((m) => memberFullName(m));
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
  const recordsQ = useQuery({ queryKey: ["isolation-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/isolation-records`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const hcQ = useQuery({ queryKey: ["isolation-hc", farmId, expandedId], queryFn: () => expandedId ? fetch(`/api/farms/${farmId}/isolation-records/${expandedId}/health-checks`).then((r) => r.json()) : null, enabled: !!expandedId, select: (d) => d?.healthChecks ?? [] });
  const records = recordsQ.data ?? [];
  const hcs = hcQ.data ?? [];
  const createMut = useMutation({ mutationFn: (b) => fetch(`/api/farms/${farmId}/isolation-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Isolation record created" });
    qc.invalidateQueries({ queryKey: ["isolation-records", farmId] });
    setAddOpen(false);
    setForm({ ...emptyForm });
  }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }) => fetch(`/api/farms/${farmId}/isolation-records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Record updated" });
    qc.invalidateQueries({ queryKey: ["isolation-records", farmId] });
    setEditRec(null);
  }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id) => fetch(`/api/farms/${farmId}/isolation-records/${id}`, { method: "DELETE" }), onSuccess: () => {
    toast({ title: "Record deleted" });
    qc.invalidateQueries({ queryKey: ["isolation-records", farmId] });
    setDeleteId(null);
  }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });
  const createHcMut = useMutation({ mutationFn: ({ recId, b }) => fetch(`/api/farms/${farmId}/isolation-records/${recId}/health-checks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Health check added" });
    qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, expandedId] });
    setHcOpen(null);
    setHcForm({ ...emptyHc });
  }, onError: () => toast({ title: "Failed to save health check", variant: "destructive" }) });
  const deleteHcMut = useMutation({ mutationFn: ({ recId, checkId }) => fetch(`/api/farms/${farmId}/isolation-records/${recId}/health-checks/${checkId}`, { method: "DELETE" }), onSuccess: () => {
    toast({ title: "Health check deleted" });
    qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, expandedId] });
    setDeleteHcId(null);
  }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const active = records.filter((r) => !r.clearanceDate);
  const cleared = records.filter((r) => !!r.clearanceDate);
  const overdue = records.filter((r) => !r.clearanceDate && r.isolationEndDate && new Date(r.isolationEndDate) < /* @__PURE__ */ new Date());
  function openEdit(r) {
    setEditRec(r);
    setForm({ isolationStartDate: r.isolationStartDate?.slice(0, 10) ?? "", isolationEndDate: r.isolationEndDate?.slice(0, 10) ?? "", animalCount: String(r.animalCount ?? ""), animalDescription: r.animalDescription ?? "", isolationReason: r.isolationReason ?? "", supplierName: r.supplierName ?? "", clearanceDate: r.clearanceDate?.slice(0, 10) ?? "", clearanceSignedBy: r.clearanceSignedBy ?? "", notes: r.notes ?? "", sourceJohnesVaccStatus: r.sourceJohnesVaccStatus ?? "", sourceJohnesVaccNotes: r.sourceJohnesVaccNotes ?? "", sourcePrrsStatus: r.sourcePrrsStatus ?? "", sourcePrrsNotes: r.sourcePrrsNotes ?? "", sourceMhStatus: r.sourceMhStatus ?? "", sourceMhNotes: r.sourceMhNotes ?? "", sourceMareksStatus: r.sourceMareksStatus ?? "", sourceMareksNotes: r.sourceMareksNotes ?? "", sourceSalmonellaNcpCategory: r.sourceSalmonellaNcpCategory ?? "", sourceSalmonellaNotes: r.sourceSalmonellaNotes ?? "" });
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: records.map((r) => {
      const isExp = expandedId === r.id;
      const isOverdue = !r.clearanceDate && r.isolationEndDate && new Date(r.isolationEndDate) < /* @__PURE__ */ new Date();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-lg overflow-hidden ${isOverdue ? "border-red-300" : r.clearanceDate ? "border-green-300" : "border-amber-300"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50", onClick: () => {
          if (isExp) setExpandedId(null);
          else {
            setExpandedId(r.id);
            qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, r.id] });
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOverdue ? "bg-red-500" : r.clearanceDate ? "bg-green-500" : "bg-amber-400"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: r.animalDescription || r.isolationReason || "Isolation Record" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                fmtD(r.isolationStartDate),
                " — ",
                r.isolationEndDate ? fmtD(r.isolationEndDate) : "ongoing",
                r.animalCount ? ` · ${r.animalCount} animals` : "",
                r.supplierName ? ` · ${r.supplierName}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
            r.clearanceDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5", children: "Cleared" }),
            isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5", children: "Overdue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-gray-200", onClick: (e) => {
              e.stopPropagation();
              openEdit(r);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 text-gray-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-red-100", onClick: (e) => {
              e.stopPropagation();
              setDeleteId(r.id);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-400" }) }),
            isExp ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })
          ] })
        ] }),
        isExp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t bg-gray-50 px-4 py-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: r.isolationReason || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: r.supplierName || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Animal Count" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: r.animalCount ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Clearance Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtD(r.clearanceDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Clearance Signed By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: r.clearanceSignedBy || "—" })
            ] }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line", children: r.notes })
            ] }),
            r.sourceJohnesVaccStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourceJohnesVaccStatus === "vaccinating" ? "bg-green-50 border-green-200 text-green-800" : r.sourceJohnesVaccStatus === "not_vaccinating" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "Johne's (source flock):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r.sourceJohnesVaccStatus === "vaccinating" ? "✓ Vaccinating with Gudair — confirmed" : r.sourceJohnesVaccStatus === "not_vaccinating" ? "✗ Not vaccinating — biosecurity risk noted" : "Unknown — not confirmed by supplier",
                r.sourceJohnesVaccNotes ? ` · ${r.sourceJohnesVaccNotes}` : ""
              ] })
            ] }),
            r.sourcePrrsStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourcePrrsStatus === "negative" ? "bg-green-50 border-green-200 text-green-800" : r.sourcePrrsStatus === "positive_stable" ? "bg-amber-50 border-amber-200 text-amber-800" : r.sourcePrrsStatus === "positive_unstable" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "PRRS (source herd):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r.sourcePrrsStatus === "negative" ? "✓ PRRS-negative — confirmed" : r.sourcePrrsStatus === "positive_stable" ? "⚠ PRRS-positive stable" : r.sourcePrrsStatus === "positive_unstable" ? "✗ PRRS-positive unstable — biosecurity risk" : "Unknown — not confirmed by supplier",
                r.sourcePrrsNotes ? ` · ${r.sourcePrrsNotes}` : ""
              ] })
            ] }),
            r.sourceMhStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourceMhStatus === "negative" ? "bg-green-50 border-green-200 text-green-800" : r.sourceMhStatus === "positive_stable" ? "bg-amber-50 border-amber-200 text-amber-800" : r.sourceMhStatus === "positive" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "MH / Enzootic Pneumonia (source herd):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r.sourceMhStatus === "negative" ? "✓ MH-negative — confirmed" : r.sourceMhStatus === "positive_stable" ? "⚠ MH-positive stable" : r.sourceMhStatus === "positive" ? "✗ MH-positive" : "Unknown — not confirmed by supplier",
                r.sourceMhNotes ? ` · ${r.sourceMhNotes}` : ""
              ] })
            ] }),
            r.sourceMareksStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourceMareksStatus === "vaccinated" ? "bg-green-50 border-green-200 text-green-800" : r.sourceMareksStatus === "not_vaccinated" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "Marek's Disease (source flock):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r.sourceMareksStatus === "vaccinated" ? "✓ Vaccinated — confirmed by hatchery/supplier" : r.sourceMareksStatus === "not_vaccinated" ? "✗ Not vaccinated — biosecurity risk noted" : "Unknown — not confirmed by supplier",
                r.sourceMareksNotes ? ` · ${r.sourceMareksNotes}` : ""
              ] })
            ] }),
            r.sourceSalmonellaNcpCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourceSalmonellaNcpCategory === "category_1" ? "bg-green-50 border-green-200 text-green-800" : r.sourceSalmonellaNcpCategory === "category_2" ? "bg-amber-50 border-amber-200 text-amber-800" : r.sourceSalmonellaNcpCategory === "category_3" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold shrink-0", children: "Salmonella NCP (source flock):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r.sourceSalmonellaNcpCategory === "category_1" ? "✓ Category 1 — low prevalence" : r.sourceSalmonellaNcpCategory === "category_2" ? "⚠ Category 2 — moderate prevalence" : r.sourceSalmonellaNcpCategory === "category_3" ? "✗ Category 3 — high prevalence" : r.sourceSalmonellaNcpCategory === "not_tested" ? "Not tested" : "Unknown — not confirmed by supplier",
                r.sourceSalmonellaNotes ? ` · ${r.sourceSalmonellaNotes}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Daily Health Checks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                setHcOpen(r.id);
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-red-100", onClick: () => setDeleteHcId({ recId: r.id, checkId: hc.id }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3 text-red-400" }) })
            ] }, hc.id)) })
          ] })
        ] })
      ] }, r.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen || !!editRec, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRec(null);
        setForm({ ...emptyForm });
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRec ? "Edit Isolation Record" : "New Isolation Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Start Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.isolationStartDate, onChange: (e) => setForm((f) => ({ ...f, isolationStartDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Expected End Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.isolationEndDate, onChange: (e) => setForm((f) => ({ ...f, isolationEndDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Animal Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.animalDescription, onChange: (e) => setForm((f) => ({ ...f, animalDescription: e.target.value })), placeholder: "e.g. 12 Hereford heifers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Number of Animals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalCount, onChange: (e) => setForm((f) => ({ ...f, animalCount: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Supplier / Source" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierName, onChange: (e) => setForm((f) => ({ ...f, supplierName: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Reason for Isolation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.isolationReason, onChange: (e) => setForm((f) => ({ ...f, isolationReason: e.target.value })), placeholder: "e.g. New purchase, returned from show" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clearance Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.clearanceDate, onChange: (e) => setForm((f) => ({ ...f, clearanceDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clearance Signed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.clearanceSignedBy, onChange: (e) => setForm((f) => ({ ...f, clearanceSignedBy: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Johne's Biosecurity — Sheep & Goats" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "AHDB recommends sourcing only from flocks vaccinating with Gudair (Ovilis Gudair). Record the source flock's status here for audit purposes." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Flock Johne's Vaccination Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourceJohnesVaccStatus, onChange: (e) => setForm((f) => ({ ...f, sourceJohnesVaccStatus: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "vaccinating", children: "Vaccinating with Gudair — confirmed by supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "not_vaccinating", children: "Not vaccinating — risk noted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Johne's Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourceJohnesVaccNotes, onChange: (e) => setForm((f) => ({ ...f, sourceJohnesVaccNotes: e.target.value })), placeholder: "e.g. Supplier confirmed Gudair programme since 2022…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "PRRS Biosecurity — Pigs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "AHDB PRRS Accreditation Scheme: purchase only from herds with the same or lower PRRS risk status. Record the source herd's status at point of purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Herd PRRS Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourcePrrsStatus, onChange: (e) => setForm((f) => ({ ...f, sourcePrrsStatus: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "negative", children: "PRRS-negative — confirmed by supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "positive_stable", children: "PRRS-positive stable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "positive_unstable", children: "PRRS-positive unstable — elevated biosecurity risk" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "PRRS Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourcePrrsNotes, onChange: (e) => setForm((f) => ({ ...f, sourcePrrsNotes: e.target.value })), placeholder: "e.g. Supplier holds AHDB PRRS Negative accreditation…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Enzootic Pneumonia / MH Biosecurity — Pigs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "AHDB MH Accreditation: source from MH-negative herds where possible. Record the source herd's Mycoplasma hyopneumoniae status at point of purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Herd MH Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourceMhStatus, onChange: (e) => setForm((f) => ({ ...f, sourceMhStatus: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "negative", children: "MH-negative — confirmed by supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "positive_stable", children: "MH-positive stable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "positive", children: "MH-positive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "MH Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourceMhNotes, onChange: (e) => setForm((f) => ({ ...f, sourceMhNotes: e.target.value })), placeholder: "e.g. Supplier holds AHDB MH Negative accreditation…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Marek's Disease Biosecurity — Poultry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Marek's Disease is a highly contagious herpesvirus. Commercial chicks are typically vaccinated at the hatchery. Record the Marek's vaccination status of the source flock/hatchery at point of purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Flock / Hatchery Marek's Vaccination Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourceMareksStatus, onChange: (e) => setForm((f) => ({ ...f, sourceMareksStatus: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not applicable / not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "vaccinated", children: "Vaccinated — confirmed by hatchery/supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "not_vaccinated", children: "Not vaccinated — biosecurity risk noted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown — not confirmed by supplier" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Marek's Biosecurity Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourceMareksNotes, onChange: (e) => setForm((f) => ({ ...f, sourceMareksNotes: e.target.value })), placeholder: "e.g. Confirmed HVT-vaccinated in ovo at hatchery…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Salmonella NCP Biosecurity — Poultry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red Tractor Poultry and BEIC require knowledge of source flock Salmonella NCP category. Record the most recent Salmonella NCP category of the source flock at point of purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source Flock Salmonella NCP Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1", value: form.sourceSalmonellaNcpCategory, onChange: (e) => setForm((f) => ({ ...f, sourceSalmonellaNcpCategory: e.target.value })), children: [
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.sourceSalmonellaNotes, onChange: (e) => setForm((f) => ({ ...f, sourceSalmonellaNotes: e.target.value })), placeholder: "e.g. Source flock most recent NCP result June 2026 Category 1…" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRec(null);
          setForm({ ...emptyForm });
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.isolationStartDate || createMut.isPending || updateMut.isPending, onClick: () => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form), children: createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Create Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Isolation Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This will permanently delete this isolation record and all associated health checks." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: hcOpen !== null, onOpenChange: (o) => {
      if (!o) setHcOpen(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Daily Health Check" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Check Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: hcForm.checkDate, onChange: (e) => setHcForm((f) => ({ ...f, checkDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Checked By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: hcForm.checkedBy, onChange: (v) => setHcForm((f) => ({ ...f, checkedBy: v })), staffNames: isoStaffNames, loading: isoMembersLoading })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Health Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background", value: hcForm.healthStatus, onChange: (e) => setHcForm((f) => ({ ...f, healthStatus: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "satisfactory", children: "Satisfactory" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "monitoring", children: "Monitoring Required" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "poor", children: "Poor — Vet Notified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "clear", children: "Clear — Released" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: hcForm.temperatureCelsius, onChange: (e) => setHcForm((f) => ({ ...f, temperatureCelsius: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: hcForm.notes, onChange: (e) => setHcForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: hcForm.actionTaken, onChange: (e) => setHcForm((f) => ({ ...f, actionTaken: e.target.value })), placeholder: "e.g. Vet called, medication administered" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setHcOpen(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !hcForm.checkDate || createHcMut.isPending, onClick: () => hcOpen !== null && createHcMut.mutate({ recId: hcOpen, b: hcForm }), children: createHcMut.isPending ? "Saving…" : "Add Health Check" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteHcId !== null, onOpenChange: (o) => {
      if (!o) setDeleteHcId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Health Check" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Permanently delete this health check entry?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteHcId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteHcMut.isPending, onClick: () => deleteHcId && deleteHcMut.mutate(deleteHcId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
const LivestockPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AIReproductionSection,
  AnimalsSection,
  FallenStockContractorsSection,
  FeedSection,
  HerdsSection,
  LambingSection,
  SheepDippingSection,
  SiresSection,
  StrawInventorySection,
  TbTestsSection,
  VetHealthPlansSection,
  VetPrescriptionsSection,
  WaterSection,
  WelfareOutcomeSection,
  default: LivestockPage
}, Symbol.toStringTag, { value: "Module" }));
export {
  AnimalsSection as A,
  FallenStockContractorsSection as F,
  HerdsSection as H,
  LivestockPage$1 as L,
  MortalitySection as M,
  SiresSection as S,
  TbTestsSection as T,
  VetHealthPlansSection as V,
  WaterSection as W,
  FeedSection as a,
  StrawInventorySection as b,
  AIReproductionSection as c,
  WelfareOutcomeSection as d
};
