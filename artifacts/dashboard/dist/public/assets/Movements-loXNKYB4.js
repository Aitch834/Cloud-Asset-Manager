import { s as createLucideIcon, a as useToast, c as useQueryClient, m as useQuery, r as reactExports, O as React, S as useMutation, j as jsxRuntimeExports, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, T as Plus, d as Button, J as DialogFooter, b as useAppStore, u as useLocation, X, R as Redirect, n as Card, o as CardContent, e as LoaderCircle, N as DialogMutationError, A as ArrowRight, H as DialogDescription } from "./index-Drr5GNr8.js";
import { d as downloadCsvFile } from "./csv-DqFyucvM.js";
import { u as usePersistedTab } from "./use-persisted-tab-DJBD8mg3.js";
import { u as usePersistedNumberFilter, a as usePersistedFilter } from "./use-persisted-filter-SqcrNPFE.js";
import { j as Truck, A as AppLayout, R as RotateCcw } from "./AppLayout-DwIbxNRo.js";
import { T as TabBar, a as TabButton } from "./tab-button-C9UPEaUn.js";
import { u as useFarmMeta } from "./shared-ldaUV7Kf.js";
import { u as useUpload } from "./use-upload-BnimE88C.js";
import { C as ClipboardCheck, F as FileText } from "./shield-alert-oVOAtE0i.js";
import { C as CircleCheck } from "./circle-check-D-lr4YKr.js";
import { S as ShieldCheck } from "./shield-check-TCP2NWHA.js";
import { T as Trash2 } from "./trash-2-CH3R1gt8.js";
import { S as Search } from "./search-DM2hBgK6.js";
import { P as PenLine } from "./pen-line-_0zpnFu3.js";
import { C as CircleAlert } from "./database-DQsLk5W4.js";
import { R as RecordAttachments } from "./RecordAttachments-B_RM4bWV.js";
import { p as printProReport, o as openPrintWindow } from "./print-report-DB1ygEK5.js";
import { C as CropYearSelector } from "./CropYearSelector-BvURdpSe.js";
import { c as currentCropYear, i as isInCropYear } from "./cropYear-Dmv-iNR6.js";
import { T as TriangleAlert } from "./triangle-alert-DCS6f_UH.js";
import { R as RefreshCw } from "./refresh-cw-DMPJobu7.js";
import { S as Send } from "./send-Bu6a3i9I.js";
import { E as ExternalLink } from "./external-link-DAq0NQni.js";
import { P as Printer } from "./printer-DMmGd-1Y.js";
import { D as Download } from "./download-CpxTd4WP.js";
import { P as Paperclip } from "./paperclip-BAn6kG7Q.js";
import { E as Eye } from "./eye-BoC4kFMJ.js";
import { S as Shield } from "./shield-YHym8qZ1.js";
import { W as WifiOff } from "./wifi-off-DQEKT4Uz.js";
import { P as Pencil } from "./pencil-CMrQbTU-.js";
import { F as File } from "./file-PMrJC84y.js";
import { U as Upload } from "./upload-KByp3QZH.js";
import "./use-safe-clerk-DIe5oks8.js";
import "./tractor-DpZYmRY5.js";
import "./api-Dhdsf4oM.js";
import "./confirm-dialog-BedrYVtS.js";
import "./chevron-up-ktMiS696.js";
import "./chevrons-up-down-BteJdYf_.js";
import "./circle-x-DjjYdlxF.js";
import "./image-DpB_MUhP.js";
import "./select-CKZnRSda.js";
import "./index-VQe6u95X.js";
import "./index-DVrG2hkl.js";
const __iconNode$2 = [
  ["path", { d: "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4", key: "1pf5j1" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m3 15 2 2 4-4", key: "1lhrkk" }]
];
const FileCheck2 = createLucideIcon("file-check-2", __iconNode$2);
const __iconNode$1 = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
];
const Inbox = createLucideIcon("inbox", __iconNode$1);
const __iconNode = [
  ["path", { d: "m12.5 17-.5-1-.5 1h1z", key: "3me087" }],
  [
    "path",
    {
      d: "M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z",
      key: "1o5pge"
    }
  ],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }]
];
const Skull = createLucideIcon("skull", __iconNode);
function CheckItem({ label, checked, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onClick: () => onChange(!checked),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        border: `1px solid ${checked ? "#bbf7d0" : "#e5e7eb"}`,
        borderRadius: 8,
        cursor: "pointer",
        background: checked ? "#f0fdf4" : "#fff",
        transition: "all 0.15s"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          width: 20,
          height: 20,
          borderRadius: 4,
          flexShrink: 0,
          border: `2px solid ${checked ? "#16a34a" : "#d1d5db"}`,
          background: checked ? "#16a34a" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }, children: checked && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12, color: "#fff" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", color: checked ? "#166534" : "#374151" }, children: label })
      ]
    }
  );
}
function SectionHeader({ icon: Icon, label, colour = "#1a6b3a" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "2px solid #f0fdf4", marginBottom: 12 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16, color: colour }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.85rem", color: colour, textTransform: "uppercase", letterSpacing: "0.06em" }, children: label })
  ] });
}
function LivestockDispatchChecklist({ farmId, movementId, onClose }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { uploadFile, isUploading } = useUpload();
  const { data: movData, isLoading: movLoading } = useQuery({
    queryKey: ["movement-detail", farmId, movementId],
    queryFn: () => fetch(`/api/farms/${farmId}/movements/${movementId}`).then((r) => r.json())
  });
  const movement = movData?.record ?? null;
  const { data: animalsData, isLoading: animalsLoading } = useQuery({
    queryKey: ["movement-animals", farmId, movementId],
    queryFn: () => fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/animals`).then((r) => r.json())
  });
  const movementAnimals = animalsData?.animals ?? [];
  const isCattle = movement?.species?.toLowerCase().includes("cattle") ?? false;
  const { data: registeredData } = useQuery({
    queryKey: ["animals-register", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then((r) => r.json()),
    enabled: isCattle
  });
  const registeredAnimals = registeredData?.records ?? [];
  const [form, setForm] = reactExports.useState({});
  const [animalSearch, setAnimalSearch] = reactExports.useState("");
  const [newTagNumber, setNewTagNumber] = reactExports.useState("");
  const [savingChecklist, setSavingChecklist] = reactExports.useState(false);
  const [signedOffBy, setSignedOffBy] = reactExports.useState("");
  React.useEffect(() => {
    if (movement && Object.keys(form).length === 0) {
      setForm({
        vehicleRegistration: movement.vehicleRegistration,
        driverName: movement.driverName,
        haulierCompany: movement.haulierCompany,
        operatorLicenceNo: movement.operatorLicenceNo,
        fciCompleted: movement.fciCompleted,
        fciWithdrawalsClear: movement.fciWithdrawalsClear,
        fciCompletedBy: movement.fciCompletedBy,
        allAnimalsTagged: movement.allAnimalsTagged,
        vehicleClean: movement.vehicleClean,
        atcRequired: movement.atcRequired,
        atcNumber: movement.atcNumber,
        journeyTimeHours: movement.journeyTimeHours,
        driverCompetencyCertNo: movement.driverCompetencyCertNo,
        emergencyContactName: movement.emergencyContactName,
        emergencyContactPhone: movement.emergencyContactPhone,
        welfareCheckComplete: movement.welfareCheckComplete,
        movementDocumentUrl: movement.movementDocumentUrl
      });
      if (movement.checklistCompletedBy) setSignedOffBy(movement.checklistCompletedBy);
    }
  }, [movement]);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const saveChecklist = async (signOff = false) => {
    setSavingChecklist(true);
    try {
      const body = { ...form, ...signOff ? { checklistCompletedBy: signedOffBy } : {} };
      await fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["movements", farmId] });
      qc.invalidateQueries({ queryKey: ["movement-detail", farmId, movementId] });
      toast({ title: signOff ? "Checklist signed off" : "Checklist saved" });
      if (signOff) onClose();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSavingChecklist(false);
    }
  };
  const addAnimalFromRegister = useMutation({
    mutationFn: (animal) => fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/animals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{
        animalId: animal.id,
        tagNumber: animal.tagNumber,
        eidNumber: animal.eidNumber,
        species: animal.species,
        breed: animal.breed,
        sex: animal.sex,
        dateOfBirth: animal.dateOfBirth
      }])
    }).then((r) => {
      if (!r.ok) throw new Error("Failed to add animal");
      return r.json();
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["movement-animals", farmId, movementId] }),
    onError: () => toast({ title: "Failed to add animal", variant: "destructive" })
  });
  const addAnimalManual = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/animals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ tagNumber: newTagNumber, species: movement?.species }])
    }).then((r) => {
      if (!r.ok) throw new Error("Failed to add animal");
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movement-animals", farmId, movementId] });
      setNewTagNumber("");
    },
    onError: () => toast({ title: "Failed to add animal", variant: "destructive" })
  });
  const removeAnimal = useMutation({
    mutationFn: (rowId) => fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/animals/${rowId}`, { method: "DELETE" }).then((r) => {
      if (!r.ok) throw new Error("Failed to remove animal");
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["movement-animals", farmId, movementId] }),
    onError: () => toast({ title: "Failed to remove animal", variant: "destructive" })
  });
  const handleDocUpload = async (file) => {
    const result = await uploadFile(file);
    if (result?.objectPath) {
      set("movementDocumentUrl", result.objectPath);
      await fetch(`/api/farms/${farmId}/livestock-movements/${movementId}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movementDocumentUrl: result?.objectPath })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["movement-detail", farmId, movementId] });
      toast({ title: "Document uploaded" });
    }
  };
  const completionItems = [
    !!form.vehicleRegistration,
    !!form.driverName,
    form.fciCompleted === true,
    form.fciWithdrawalsClear === true,
    form.allAnimalsTagged === true,
    form.vehicleClean === true,
    form.welfareCheckComplete === true,
    !!form.movementDocumentUrl,
    !isCattle || movementAnimals.length > 0
  ];
  const completionPct = Math.round(completionItems.filter(Boolean).length / completionItems.length * 100);
  const isComplete = movement?.checklistCompletedAt != null;
  const filteredAnimals = registeredAnimals.filter((a) => {
    const addedIds = new Set(movementAnimals.map((m) => m.animalId).filter(Boolean));
    return !addedIds.has(a.id);
  }).filter((a) => {
    if (!animalSearch) return true;
    const s = animalSearch.toLowerCase();
    return (a.animalCode || "").toLowerCase().includes(s) || (a.tagNumber || "").toLowerCase().includes(s) || (a.name || "").toLowerCase().includes(s);
  });
  if (movLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 680 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Dispatch Checklist" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: "Loading…" })
  ] }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { size: 18, color: "#1a6b3a" }),
        "Livestock Dispatch Checklist",
        isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", borderRadius: 12, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 600, marginLeft: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
          " Signed Off"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }, children: [
        movement?.species || "Livestock",
        " · ",
        movement?.numberOfAnimals ?? "?",
        " animals · ",
        movement?.fromLocation || "this holding",
        " → ",
        movement?.toLocation || "?"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f3f4f6", borderRadius: 8, overflow: "hidden", height: 8, marginBottom: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${completionPct}%`, background: completionPct === 100 ? "#16a34a" : "#f59e0b", transition: "width 0.3s" } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: completionPct === 100 ? "#166534" : "#92400e", marginBottom: 16 }, children: [
      completionPct,
      "% complete ",
      completionPct === 100 ? "— ready to sign off" : "— complete all items before signing off"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Truck, label: "1 · Haulier & Vehicle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-foreground/60 mb-1 block", children: [
              "Vehicle Registration ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. YD23 XKP",
                value: form.vehicleRegistration ?? "",
                onChange: (e) => set("vehicleRegistration", e.target.value),
                style: { textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.05em" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-foreground/60 mb-1 block", children: [
              "Driver Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Full name", value: form.driverName ?? "", onChange: (e) => set("driverName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "Haulier Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Company name", value: form.haulierCompany ?? "", onChange: (e) => set("haulierCompany", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "Operator Licence No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. OB0001234", value: form.operatorLicenceNo ?? "", onChange: (e) => set("operatorLicenceNo", e.target.value), style: { fontFamily: "monospace" } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "Driver Competency Cert. No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Certificate number", value: form.driverCompetencyCertNo ?? "", onChange: (e) => set("driverCompetencyCertNo", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "Estimated Journey Time (hours)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "0", placeholder: "e.g. 2.5", value: form.journeyTimeHours ?? "", onChange: (e) => set("journeyTimeHours", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "Emergency Contact Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name", value: form.emergencyContactName ?? "", onChange: (e) => set("emergencyContactName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "Emergency Contact Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", placeholder: "+44...", value: form.emergencyContactPhone ?? "", onChange: (e) => set("emergencyContactPhone", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckItem,
            {
              label: "Animal Transport Certificate (ATC) required for this journey",
              checked: form.atcRequired ?? false,
              onChange: (v) => set("atcRequired", v)
            }
          ),
          form.atcRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "ATC Reference Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "ATC number", value: form.atcNumber ?? "", onChange: (e) => set("atcNumber", e.target.value), style: { fontFamily: "monospace" } })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-foreground/60 mb-1 block", style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 12 }),
          " Link to Haulage / Transport Record (optional)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: "HR number e.g. 42",
            value: form.haulageRecordId ?? "",
            onChange: (e) => set("haulageRecordId", e.target.value ? parseInt(e.target.value) : null),
            style: { fontFamily: "monospace", maxWidth: 200 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 4 }, children: "If this movement was arranged via the haulage/transport module, enter the HR record number to cross-reference the two records." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: FileCheck2, label: "2 · Food Chain Information (FCI) / Vendor Declaration", colour: "#92400e" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 10, marginBottom: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor Requirement:" }),
          " A completed FCI / Vendor Declaration must accompany all movements off the holding. Confirm that any withdrawal periods for medicines are clear before signing."
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckItem,
            {
              label: "FCI / Vendor Declaration has been completed and signed",
              checked: form.fciCompleted ?? false,
              onChange: (v) => set("fciCompleted", v)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckItem,
            {
              label: "All medicine withdrawal periods are clear — no animals under withdrawal",
              checked: form.fciWithdrawalsClear ?? false,
              onChange: (v) => set("fciWithdrawalsClear", v)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "FCI Completed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of person completing FCI", value: form.fciCompletedBy ?? "", onChange: (e) => set("fciCompletedBy", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: ShieldCheck, label: "3 · Animal Welfare & Compliance", colour: "#1d4ed8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckItem,
            {
              label: "All animals are correctly identified / ear-tagged (EID where required)",
              checked: form.allAnimalsTagged ?? false,
              onChange: (v) => set("allAnimalsTagged", v)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckItem,
            {
              label: "Vehicle is clean, disinfected and fit for purpose (Animal Transport Welfare regs.)",
              checked: form.vehicleClean ?? false,
              onChange: (v) => set("vehicleClean", v)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckItem,
            {
              label: "Pre-movement welfare check completed — all animals fit to travel",
              checked: form.welfareCheckComplete ?? false,
              onChange: (v) => set("welfareCheckComplete", v)
            }
          )
        ] })
      ] }),
      isCattle && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: ClipboardCheck, label: "4 · Individual Animals (BCMS / Cattle Tracing)", colour: "#7c3aed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: 10, marginBottom: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#5b21b6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BCMS Requirement:" }),
          " For cattle movements you must record each individual animal. Select from your herd register or enter a tag number manually."
        ] }) }),
        movementAnimals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: [
            "Animals on this movement (",
            movementAnimals.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: movementAnimals.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: i < movementAnimals.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600, color: "#111827" }, children: a.tagNumber || a.animalCode || "—" }),
              a.animalName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.8rem", marginLeft: 8 }, children: a.animalName }),
              a.breed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontSize: "0.75rem", marginLeft: 8 }, children: a.breed }),
              a.sex && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#6b7280", marginLeft: 8 }, children: [
                "(",
                a.sex,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => removeAnimal.mutate(a.id),
                style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 },
                title: "Remove",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
              }
            )
          ] }, a.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "Add from herd register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8, marginBottom: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 13, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                style: { paddingLeft: 30, fontSize: "0.85rem" },
                placeholder: "Search by tag, code or name…",
                value: animalSearch,
                onChange: (e) => setAnimalSearch(e.target.value)
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { maxHeight: 180, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }, children: filteredAnimals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 16, textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }, children: animalSearch ? "No animals match your search" : "All registered animals already added, or no cattle registered" }) : filteredAnimals.slice(0, 50).map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onClick: () => addAnimalFromRegister.mutate(a),
              style: { display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", cursor: "pointer", background: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #f3f4f6" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, color: "#1a6b3a" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 600 }, children: a.animalCode }),
                a.tagNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: "0.8rem" }, children: a.tagNumber }),
                a.name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#374151", fontSize: "0.8rem" }, children: a.name }),
                a.breed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontSize: "0.75rem" }, children: a.breed })
              ]
            },
            a.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "Or enter tag number manually" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. UK123456 78901",
                value: newTagNumber,
                onChange: (e) => setNewTagNumber(e.target.value),
                style: { fontFamily: "monospace", flex: 1 },
                onKeyDown: (e) => {
                  if (e.key === "Enter" && newTagNumber.trim()) addAnimalManual.mutate();
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: () => {
                  if (newTagNumber.trim()) addAnimalManual.mutate();
                },
                disabled: !newTagNumber.trim() || addAnimalManual.isPending,
                style: { whiteSpace: "nowrap" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                  " Add Tag"
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: FileText, label: isCattle ? "5 · Movement Document" : "4 · Movement Document", colour: "#374151" }),
        form.movementDocumentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15, color: "#16a34a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { flex: 1, fontSize: "0.875rem", color: "#166534" }, children: "Movement document uploaded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: `/api/storage${form.movementDocumentUrl}`,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { fontSize: "0.8rem", color: "#1a6b3a", textDecoration: "underline" },
              children: "View"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => set("movementDocumentUrl", null),
              style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }, children: "Upload the signed AML2 / movement licence or eAML2 reference document." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#f3f4f6", border: "1px dashed #d1d5db", borderRadius: 8, padding: "10px 16px", cursor: isUploading ? "wait" : "pointer", fontSize: "0.875rem", color: "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: ".pdf,.jpg,.jpeg,.png",
                style: { display: "none" },
                onChange: (e) => {
                  const f = e.target.files?.[0];
                  if (f) handleDocUpload(f);
                },
                disabled: isUploading
              }
            ),
            isUploading ? "Uploading…" : "Upload movement document (PDF / image)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: PenLine, label: isCattle ? "6 · Sign Off" : "5 · Sign Off", colour: "#374151" }),
        isComplete ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#166534", fontWeight: 600 }, children: [
            "✓ Checklist signed off by ",
            movement?.checklistCompletedBy
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#16a34a", marginTop: 2 }, children: movement?.checklistCompletedAt ? new Date(movement.checklistCompletedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 10 }, children: "By signing off you confirm all compliance checks have been completed for this dispatch. This record is retained as part of Red Tractor traceability requirements." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, alignItems: "flex-end" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-foreground/60 mb-1 block", children: "Your Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Full name of person signing off", value: signedOffBy, onChange: (e) => setSignedOffBy(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: () => saveChecklist(true),
                disabled: !signedOffBy.trim() || savingChecklist || completionPct < 70,
                style: { background: "#1a6b3a", color: "#fff", whiteSpace: "nowrap" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, style: { marginRight: 4 } }),
                  "Sign Off Checklist"
                ]
              }
            )
          ] }),
          completionPct < 70 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#dc2626", marginTop: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 11, style: { display: "inline", marginRight: 4 } }),
            "Complete more items before signing off (",
            completionPct,
            "% done)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", style: { display: "flex", gap: 8, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveChecklist(false), disabled: savingChecklist, children: savingChecklist ? "Saving…" : "Save Progress" })
    ] })
  ] }) });
}
function AnimalRegisterPicker({
  animals,
  speciesFilter,
  selectedIds,
  onChange
}) {
  const [search, setSearch] = reactExports.useState("");
  const active = animals.filter(
    (a) => a.status === "active" && (!speciesFilter || a.species === speciesFilter) && (!search || (a.earTagNumber ?? a.tagNumber ?? a.animalCode ?? "").toLowerCase().includes(search.toLowerCase()) || (a.name ?? "").toLowerCase().includes(search.toLowerCase()))
  );
  const toggleId = (id) => onChange(
    selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-3.5 h-3.5 text-foreground/40 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          className: "flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40",
          placeholder: "Search by ear tag, name or code…",
          value: search,
          onChange: (e) => setSearch(e.target.value)
        }
      ),
      selectedIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full", children: [
        selectedIds.length,
        " selected"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-52 overflow-y-auto divide-y divide-border/50", children: active.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic px-3 py-4 text-center", children: speciesFilter ? `No active ${speciesFilter} found in your Animal Register` : "No active animals found in your Animal Register" }) : active.map((a) => {
      const tag = a.earTagNumber ?? a.tagNumber ?? a.animalCode ?? `#${a.id}`;
      const selected = selectedIds.includes(a.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "label",
        {
          className: `flex items-center gap-3 px-3 py-2 cursor-pointer select-none transition-colors ${selected ? "bg-green-50" : "hover:bg-muted/30"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                className: "w-4 h-4 flex-shrink-0",
                style: { accentColor: "#16a34a" },
                checked: selected,
                onChange: () => toggleId(a.id)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-medium text-foreground flex-1 truncate", children: tag }),
            a.name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/60 truncate max-w-[80px]", children: a.name }),
            a.breed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50 hidden sm:inline", children: a.breed }),
            a.sex && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40 capitalize hidden sm:inline", children: a.sex })
          ]
        },
        a.id
      );
    }) }),
    selectedIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 bg-green-50/60 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-800 font-medium", children: [
        selectedIds.length,
        " animal",
        selectedIds.length !== 1 ? "s" : "",
        " linked to this movement"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange([]),
          className: "text-xs text-red-500 hover:text-red-700 font-medium",
          children: "Clear"
        }
      )
    ] })
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
function daysSince(date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 864e5);
}
function printMovementsRegister(movements, farm, filterLabel) {
  const typeLabels = { on: "On", off: "Off", between: "Between", birth: "Birth", death: "Death" };
  const rows = movements.map((m) => {
    const isExempt = m.movementType === "birth" || m.movementType === "between";
    const notified = isExempt ? "<em style='color:#555'>N/A</em>" : m.legalNotificationSubmitted ? "<span style='color:#065f46;font-weight:700'>✓ Notified</span>" : "<span style='color:#991b1b;font-weight:700'>⚠ Pending</span>";
    return `<tr>
      <td style="white-space:nowrap">${formatDate(m.movementDate)}</td>
      <td>${typeLabels[m.movementType] ?? m.movementType}</td>
      <td>${m.species ?? "—"}</td>
      <td style="text-align:center">${m.numberOfAnimals ?? "—"}</td>
      <td style="font-family:monospace">${m.fromLocation ?? "—"}</td>
      <td style="font-family:monospace">${m.toLocation ?? "—"}</td>
      <td style="font-family:monospace">${m.licenceNumber ?? "—"}</td>
      <td>${notified}</td>
      <td style="font-family:monospace">${m.bcmsSubmissionRef ?? "—"}</td>
    </tr>`;
  }).join("");
  const tableHtml = `<table><thead><tr>
    <th>Date</th><th>Type</th><th>Species</th><th>No.</th><th>From CPH</th><th>To CPH</th><th>Licence / AML Ref</th><th>BCMS Notified</th><th>BCMS/eAML2 Ref</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
  printProReport({
    title: "Livestock Movements Register",
    subtitle: "Cattle Identification Regulations · Sheep & Goat Movement Order",
    farmName: farm?.name,
    cphNumber: farm?.cphNumber ?? void 0,
    recordCount: movements.length,
    extraMeta: `Filter: ${filterLabel}`,
    tableHtml,
    footerNote: "Movement records must be retained for a minimum of 3 years. All on/off movements must be notified to the relevant government portal (BCMS, eAML2, ScotEID, EIDCymru, or NIFAIS)."
  });
}
function printLisComplianceReport(movements, farm, periodLabel, lastSyncedAt) {
  const LIS_SPECIES = ["sheep", "goat", "deer"];
  const lisMovements = movements.filter((m) => LIS_SPECIES.includes((m.species ?? "").toLowerCase()));
  const notified = lisMovements.filter((m) => m.legalNotificationSubmitted || !!m.lisMovementRef);
  const unnotified = lisMovements.filter((m) => !m.legalNotificationSubmitted && !m.lisMovementRef);
  const formatDate2 = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const summaryHtml = `
    <table style="width:100%;margin-bottom:1.5rem;border-collapse:collapse;font-size:0.85rem;">
      <tbody>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;width:40%">Total LIS-reportable movements</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;">${lisMovements.length}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">Notified to LIS / bearing LIS reference</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;color:#166534;font-weight:600">✓ ${notified.length}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">Unnotified (compliance gap)</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;color:${unnotified.length > 0 ? "#dc2626" : "#166534"};font-weight:600">${unnotified.length > 0 ? "✗ " : "✓ "}${unnotified.length}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">Compliance rate</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600">${lisMovements.length === 0 ? "N/A" : Math.round(notified.length / lisMovements.length * 100) + "%"}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600">LIS last data sync</td>
          <td style="padding:6px 12px;border:1px solid #e5e7eb;">${lastSyncedAt ? new Date(lastSyncedAt).toLocaleString("en-GB") : "Not yet synced"}</td>
        </tr>
      </tbody>
    </table>
  `;
  const rows = lisMovements.map((m) => {
    const isNotified = m.legalNotificationSubmitted || !!m.lisMovementRef;
    const rowBg = isNotified ? "" : "background:#fff5f5";
    return `<tr style="${rowBg}">
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${formatDate2(m.movementDate)}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;text-transform:capitalize;">${m.movementType ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;text-transform:capitalize;">${m.species ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">${m.numberOfAnimals ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${m.fromLocation ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${m.toLocation ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;font-family:monospace;font-size:0.78rem;">${m.lisMovementRef ?? m.licenceNumber ?? "—"}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;font-weight:700;color:${isNotified ? "#166534" : "#dc2626"};">${isNotified ? "✓ Notified" : "✗ Not notified"}</td>
    </tr>`;
  }).join("");
  const tableHtml = `
    <h3 style="font-size:0.9rem;font-weight:700;margin:0 0 0.5rem;color:#111827">Compliance Summary</h3>
    ${summaryHtml}
    <h3 style="font-size:0.9rem;font-weight:700;margin:1rem 0 0.5rem;color:#111827">Movement Detail — LIS-Reportable Species (Sheep / Goat / Deer)</h3>
    <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
      <thead><tr style="background:#f3f4f6;">
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">Date</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">Type</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">Species</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">Animals</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">From</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">To</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">LIS / Licence Ref</th>
        <th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">Notification Status</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="8" style="padding:12px;text-align:center;color:#6b7280;border:1px solid #e5e7eb;">No LIS-reportable movements in this period</td></tr>'}</tbody>
    </table>
  `;
  printProReport({
    title: "LIS Movement Notification Compliance Report",
    subtitle: "Livestock Information Service — Red Tractor Audit Evidence",
    farmName: farm?.name,
    cphNumber: farm?.cphNumber ?? void 0,
    recordCount: lisMovements.length,
    extraMeta: `Period: ${periodLabel} · Generated: ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}`,
    tableHtml,
    footerNote: "This report is generated from BDE Farm Trac records and constitutes evidence of LIS movement notification compliance. LIS notification of sheep, goat and deer movements is required under the Livestock (England) Order 2015 (as amended). Records must be retained for a minimum of 3 years for Red Tractor audit purposes."
  });
}
function movementTypeBadge(type) {
  const map = {
    on: { label: "On", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    off: { label: "Off", className: "bg-amber-100 text-amber-800 border-amber-200" },
    between: { label: "Between", className: "bg-blue-100 text-blue-800 border-blue-200" },
    birth: { label: "Birth", className: "bg-purple-100 text-purple-800 border-purple-200" },
    death: { label: "Death", className: "bg-red-100 text-red-800 border-red-200" }
  };
  const entry = map[type] ?? { label: type, className: "bg-gray-100 text-gray-700 border-gray-200" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${entry.className}`, children: entry.label });
}
function BcmsStatusBadge({ movement }) {
  const isExempt = movement.movementType === "birth" || movement.movementType === "between";
  if (isExempt) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40 italic", children: "N/A" });
  }
  if (movement.legalNotificationSubmitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
      " Notified"
    ] });
  }
  const days = daysSince(movement.movementDate);
  const isOverdue = days > 3;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${isOverdue ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
    isOverdue ? `Overdue (${days}d)` : "Pending"
  ] });
}
function AttachmentsPanel({ movementId, farmId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadTitle, setUploadTitle] = reactExports.useState("");
  const [uploadNotes, setUploadNotes] = reactExports.useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["movement-attachments", movementId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/movements/${movementId}/attachments`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (docId) => {
      await fetch(`/api/farms/${farmId}/movements/${movementId}/attachments/${docId}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movement-attachments", movementId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const title = uploadTitle.trim() || "AML / Movement Document";
      await fetch(`/api/farms/${farmId}/movements/${movementId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          filePath: response.objectPath,
          notes: uploadNotes.trim() || null
        })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      queryClient.invalidateQueries({ queryKey: ["movement-attachments", movementId] });
      setUploadTitle("");
      setUploadNotes("");
    }
  });
  const attachments = data?.attachments ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2", children: "Attached Documents (AML forms / eAML2 confirmations)" }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-foreground/50", children: "Loading..." }) : attachments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-foreground/50 italic", children: "No documents attached yet. Upload your AML form or eAML2 confirmation below." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: attachments.map((att) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "w-4 h-4 text-primary/60" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: att.filePath ? `/api/storage${att.filePath}` : "#",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-sm font-medium text-primary hover:underline",
              children: att.title
            }
          ),
          att.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: att.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => deleteMutation.mutate(att.id),
          className: "p-1 rounded hover:bg-red-50 text-foreground/40 hover:text-red-500",
          title: "Remove attachment",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
        }
      )
    ] }, att.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-dashed border-border rounded-lg p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground/60", children: "Attach a document (photo/scan of AML form, eAML2 screenshot)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Document title (e.g. AML2-2026-00291)",
            value: uploadTitle,
            onChange: (e) => setUploadTitle(e.target.value),
            className: "text-xs h-8"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Notes (optional)",
            value: uploadNotes,
            onChange: (e) => setUploadNotes(e.target.value),
            className: "text-xs h-8"
          }
        )
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "text-xs h-7 gap-1.5", disabled: isUploading, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }),
          " Uploading ",
          progress,
          "%"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5" }),
          " Choose File"
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40", children: "PDF, JPG, PNG accepted" })
      ] })
    ] })
  ] });
}
function PrintRecord({ movement, farm, onClose }) {
  const typeLabels = {
    on: "On (Animals Arriving at Holding)",
    off: "Off (Animals Leaving Holding)",
    between: "Between Holdings",
    birth: "Birth on Holding",
    death: "Death on Holding"
  };
  const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const handlePrint = () => {
    const farmBlock = farm ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px;margin-bottom:12px"><p style="font-weight:600;margin:0 0 4px">${farm.name}</p>${farm.address ? `<p style="font-size:10px;color:#374151;margin:4px 0">${farm.address}${farm.postcode ? ", " + farm.postcode : ""}</p>` : ""}${farm.cphNumber ? `<p style="font-size:10px;color:#374151;margin:4px 0">CPH: <span style="font-family:monospace;font-weight:600">${farm.cphNumber}</span></p>` : ""}</div>` : "";
    const field = (label, value, cls = "") => `<div style="margin-bottom:10px"><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555;margin:0 0 2px">${label}</p><p style="font-weight:500;margin:0;${cls}">${value}</p></div>`;
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Livestock Movement Record #${movement.id}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 32px}.col2{grid-column:span 2}.sig{border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.sigline{border-bottom:1px solid #999;height:32px;margin:16px 0 4px}.note{font-size:9px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h2 style="font-size:14px;font-weight:700;margin:0 0 4px">Livestock Movement Record</h2><p style="font-size:10px;color:#374151;margin:0">BDE Farm Trac — On-Farm Compliance Record</p></div><div style="text-align:right;font-size:10px;color:#374151;line-height:1.8"><p style="margin:4px 0">Printed: ${printedDate}</p><p style="margin:4px 0">Record ID: #${movement.id}</p></div></div>
${farmBlock}
<div class="grid">
${field("Movement Type", typeLabels[movement.movementType] ?? movement.movementType)}
${field("Movement Date", formatDate(movement.movementDate))}
${field("Number of Animals", String(movement.numberOfAnimals ?? "—"))}
${field("AML Licence Reference", movement.licenceNumber || "—")}
${field("BCMS/eAML2 Submission Ref", movement.bcmsSubmissionRef || "—")}
${field("BCMS/APHA Notified", movement.legalNotificationSubmitted ? `Yes — ${movement.legalNotificationDate ? formatDate(movement.legalNotificationDate) : "date not recorded"}` : "⚠ Not yet notified", movement.legalNotificationSubmitted ? "color:#065f46" : "color:#991b1b")}
${field("From Location / CPH", movement.fromLocation || "—")}
${field("To Location / CPH", movement.toLocation || "—")}
${movement.transporterDetails ? `<div class="col2">${field("Transporter / Haulier", movement.transporterDetails)}</div>` : ""}
${movement.reason ? `<div class="col2">${field("Reason", movement.reason)}</div>` : ""}
${movement.notes ? `<div class="col2">${field("Notes", movement.notes)}</div>` : ""}
</div><div class="sig"><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555">Recorded By</p><div class="sigline"></div><p style="font-size:9px;color:#555">Signature / Name</p></div><div><p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555">Date Recorded</p><div class="sigline"></div><p style="font-size:9px;color:#555">Date</p></div></div>
<div class="note">This is an on-farm record for Red Tractor compliance purposes. Official livestock movement documents (AML1/AML2/eAML2) must be submitted separately to APHA/BCMS as required by UK livestock movement regulations. Records must be kept for a minimum of 3 years.</div>
</body></html>`;
    openPrintWindow(html);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Print Movement Record" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "movement-print-area", className: "border border-border rounded-lg p-6 space-y-5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between border-b border-border pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold font-display text-foreground", children: "Livestock Movement Record" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/60 text-xs mt-0.5", children: "BDE Farm Trac — On-Farm Compliance Record" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Printed: ",
            (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Record ID: #",
            movement.id
          ] })
        ] })
      ] }),
      farm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: farm.name }),
        farm.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground/70 text-xs", children: [
          farm.address,
          farm.postcode ? `, ${farm.postcode}` : ""
        ] }),
        farm.cphNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground/70 text-xs mt-0.5", children: [
          "CPH: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium", children: farm.cphNumber })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "Movement Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: typeLabels[movement.movementType] ?? movement.movementType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "Movement Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(movement.movementDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: movement.numberOfAnimals ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "AML Licence Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: movement.licenceNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "BCMS/eAML2 Submission Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: movement.bcmsSubmissionRef || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "BCMS/APHA Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-medium ${movement.legalNotificationSubmitted ? "text-emerald-700" : "text-red-600"}`, children: movement.legalNotificationSubmitted ? `Yes — ${movement.legalNotificationDate ? formatDate(movement.legalNotificationDate) : "date not recorded"}` : "⚠ Not yet notified" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "From Location / CPH" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: movement.fromLocation || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "To Location / CPH" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: movement.toLocation || "—" })
        ] }),
        movement.transporterDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "Transporter / Haulier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: movement.transporterDetails })
        ] }),
        movement.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: movement.reason })
        ] }),
        movement.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider font-bold text-foreground/40 mb-0.5", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/80", children: movement.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-4 grid grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4", children: "Recorded By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-foreground/20 h-8 mb-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: "Signature / Name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4", children: "Date Recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-foreground/20 h-8 mb-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: "Date" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 border-t border-border pt-3", children: "This is an on-farm record for Red Tractor compliance purposes. Official livestock movement documents (AML1/AML2/eAML2) must be submitted separately to APHA/BCMS as required by UK livestock movement regulations. Records must be kept for a minimum of 3 years." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
        " Print Record"
      ] })
    ] })
  ] }) });
}
const EMPTY_MORTALITY = {
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
  notes: ""
};
function MortalitySection({ farmId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = reactExports.useState("");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editingRecord, setEditingRecord] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(EMPTY_MORTALITY);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const baseUrl = `/api/farms/${farmId}/mortality-records`;
  const { data, isLoading } = useQuery({
    queryKey: ["mortality-records", farmId],
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
      queryClient.invalidateQueries({ queryKey: ["mortality-records", farmId] });
      setShowForm(false);
      setFormData(EMPTY_MORTALITY);
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
      queryClient.invalidateQueries({ queryKey: ["mortality-records", farmId] });
      setEditingRecord(null);
      setShowForm(false);
      setFormData(EMPTY_MORTALITY);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mortality-records", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const records = data?.records ?? [];
  const filtered = records.filter(
    (r) => !search || r.species?.toLowerCase().includes(search.toLowerCase()) || r.tagNumber?.toLowerCase().includes(search.toLowerCase()) || r.causeOfDeath?.toLowerCase().includes(search.toLowerCase())
  );
  function setField(key, val) {
    setFormData((f) => ({ ...f, [key]: val }));
  }
  function openEdit(r) {
    setEditingRecord(r);
    setFormData({
      tagNumber: r.tagNumber ?? "",
      species: r.species ?? "",
      breed: r.breed ?? "",
      dateOfDeath: r.dateOfDeath ? r.dateOfDeath.slice(0, 10) : "",
      causeOfDeath: r.causeOfDeath ?? "",
      disposalMethod: r.disposalMethod ?? "",
      disposalOperator: r.disposalOperator ?? "",
      disposalRef: r.disposalRef ?? "",
      veterinaryAttended: r.veterinaryAttended ?? false,
      vetName: r.vetName ?? "",
      postMortemCarriedOut: r.postMortemCarriedOut ?? false,
      postMortemFindings: r.postMortemFindings ?? "",
      bcmsNotified: r.bcmsNotified ?? false,
      bcmsNotificationRef: r.bcmsNotificationRef ?? "",
      notes: r.notes ?? ""
    });
    setShowForm(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      ...formData,
      dateOfDeath: formData.dateOfDeath ? new Date(formData.dateOfDeath).toISOString() : null
    };
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, body });
    } else {
      createMutation.mutate(body);
    }
  }
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 flex gap-3 items-start mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500 mt-0.5 shrink-0", children: "ℹ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fallen stock / mortality records" }),
        " — All animal deaths must be recorded. Fallen stock must be disposed of by an approved collector or permitted method. Cattle deaths must be reported to BCMS within 7 days. Retain records for a minimum of 3 years."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by species, tag, cause...", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingRecord(null);
        setFormData({ ...EMPTY_MORTALITY, dateOfDeath: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
        setShowForm(true);
      }, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        " Record Death"
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mortality Record" }) }),
      (() => {
        const r = viewRecord;
        const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
        const F = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-0.5", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", style: { color: value ? void 0 : "#d1d5db" }, children: value || "—" })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Date of Death", value: fmt(r.dateOfDeath) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Species", value: r.species }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Breed", value: r.breed })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Tag Number", value: r.tagNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Cause of Death", value: r.causeOfDeath })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Disposal Method", value: r.disposalMethod }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Disposal Operator", value: r.disposalOperator }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Disposal Ref.", value: r.disposalRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Vet Attended", value: r.veterinaryAttended ? `Yes${r.vetName ? ` — ${r.vetName}` : ""}` : "No" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Post-Mortem", value: r.postMortemCarriedOut ? `Yes${r.postMortemFindings ? ` — ${r.postMortemFindings}` : ""}` : "No" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "BCMS Notified", value: r.bcmsNotified ? `Yes${r.bcmsNotificationRef ? ` — Ref: ${r.bcmsNotificationRef}` : ""}` : "Not yet notified" }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Notes", value: r.notes })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "mortality", recordId: viewRecord.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEdit(r);
        }, children: "Edit Record" })
      ] })
    ] }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-base", children: editingRecord ? "Edit Mortality Record" : "Record Animal Death" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setShowForm(false);
          setEditingRecord(null);
          setFormData(EMPTY_MORTALITY);
        }, className: "p-1 rounded hover:bg-black/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-foreground/50" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Date of Death ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formData.dateOfDeath, onChange: (e) => setField("dateOfDeath", e.target.value), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Species ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", value: formData.species, onChange: (e) => setField("species", e.target.value), required: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select species..." }),
              ["Cattle", "Sheep", "Pigs", "Poultry", "Goats", "Other"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.toLowerCase(), children: s }, s))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Ear Tag / ID Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. UK123456789012", value: formData.tagNumber, onChange: (e) => setField("tagNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Limousin cross", value: formData.breed, onChange: (e) => setField("breed", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Cause of Death ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", value: formData.causeOfDeath, onChange: (e) => setField("causeOfDeath", e.target.value), required: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select cause..." }),
              ["Disease / Illness", "Injury / Accident", "Euthanasia (vet)", "Euthanasia (emergency)", "Natural causes", "Dystocia / Calving difficulty", "Pneumonia", "Metabolic disorder", "Unknown", "Other"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Disposal Method ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", value: formData.disposalMethod, onChange: (e) => setField("disposalMethod", e.target.value), required: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select method..." }),
              ["Fallen stock collector", "Hunt / knackerman", "On-farm burial (permitted)", "Incineration", "Rendering plant", "Other permitted method"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Disposal Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Company / collector name", value: formData.disposalOperator, onChange: (e) => setField("disposalOperator", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Disposal Reference No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Collection or permit reference", value: formData.disposalRef, onChange: (e) => setField("disposalRef", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm font-medium cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: formData.veterinaryAttended, onChange: (e) => setField("veterinaryAttended", e.target.checked), className: "rounded" }),
              "Vet attended / certified"
            ] }),
            formData.veterinaryAttended && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Vet name", value: formData.vetName, onChange: (e) => setField("vetName", e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm font-medium cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: formData.postMortemCarriedOut, onChange: (e) => setField("postMortemCarriedOut", e.target.checked), className: "rounded" }),
              "Post-mortem carried out"
            ] }),
            formData.postMortemCarriedOut && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "PM findings summary", value: formData.postMortemFindings, onChange: (e) => setField("postMortemFindings", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm font-medium cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: formData.bcmsNotified, onChange: (e) => setField("bcmsNotified", e.target.checked), className: "rounded" }),
              "BCMS / APHA notified"
            ] }),
            formData.bcmsNotified && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "BCMS notification reference", value: formData.bcmsNotificationRef, onChange: (e) => setField("bcmsNotificationRef", e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Any additional notes", value: formData.notes, onChange: (e) => setField("notes", e.target.value) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end pt-2 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", type: "button", onClick: () => {
            setShowForm(false);
            setEditingRecord(null);
            setFormData(EMPTY_MORTALITY);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editingRecord ? "Update Record" : "Save Record"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
        "Loading..."
      ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { className: "w-8 h-8 text-primary/40" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No mortality records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search ? "No records match your search." : "All animal deaths must be recorded. Use the button above to add a record." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Species / Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Cause" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Disposal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "BCMS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-black/[0.02] transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm font-medium", children: formatDate(r.dateOfDeath) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium capitalize", children: r.species }),
            r.breed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/50", children: r.breed }),
            r.tagNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono text-foreground/60", children: r.tagNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: r.causeOfDeath }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-4 text-sm text-foreground/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: r.disposalMethod }),
            r.disposalRef && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono text-foreground/50", children: r.disposalRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4", children: r.bcmsNotified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
            " Notified"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
            " Pending"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary", title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
          ] }) })
        ] }, r.id)) })
      ] }) }),
      filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-t border-border text-sm text-foreground/50", children: [
        "Showing ",
        filtered.length,
        " of ",
        records.length,
        " records"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMutation.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Mortality Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Are you sure? This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMutation, message: "Failed to delete — the record is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteMutation.mutate(deleteId), disabled: deleteMutation.isPending, children: [
          deleteMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Delete"
        ] })
      ] })
    ] }) })
  ] });
}
const EMPTY_FORM = {
  movementType: "",
  movementDate: "",
  fromLocation: "",
  toLocation: "",
  numberOfAnimals: "",
  species: "",
  earTagNumbers: "",
  licenceNumber: "",
  bcmsSubmissionRef: "",
  legalNotificationSubmitted: false,
  legalNotificationDate: "",
  transporterDetails: "",
  ataNumber: "",
  ataExpiryDate: "",
  reason: "",
  notes: ""
};
function exportMovementsCsv(records, farmCph) {
  const headers = [
    "Record ID",
    "Movement Date",
    "Movement Type",
    "Species",
    "Number of Animals",
    "Ear Tag Numbers",
    "From Location / CPH",
    "To Location / CPH",
    "AML Licence Reference",
    "BCMS/eAML2 Submission Ref",
    "BCMS/APHA Notified",
    "Notification Date",
    "Transporter / Haulier",
    "Reason",
    "Notes"
  ];
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "";
  const rows = records.map((r) => [
    r.id,
    fmtD(r.movementDate),
    r.movementType,
    r.species || "",
    r.numberOfAnimals ?? "",
    r.earTagNumbers || "",
    r.fromLocation || "",
    r.toLocation || "",
    r.licenceNumber || "",
    r.bcmsSubmissionRef || "",
    r.legalNotificationSubmitted ? "Yes" : "No",
    fmtD(r.legalNotificationDate),
    r.transporterDetails || "",
    r.reason || "",
    r.notes || ""
  ]);
  downloadCsvFile(
    `livestock-movements-cph${farmCph || "unknown"}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`,
    [headers, ...rows]
  );
}
function exportMovementsEaml2(records, farm) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19);
  const esc = (s) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const movXml = records.map((r) => {
    const tags = r.earTagNumbers ? r.earTagNumbers.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const animalsXml = tags.length > 0 ? `
        <Animals>${tags.map((t) => `
          <Animal><EarTag>${esc(t)}</EarTag></Animal>`).join("")}
        </Animals>` : "";
    return `
    <Movement>
      <MovementDate>${esc(r.movementDate?.slice(0, 10))}</MovementDate>
      <MovementType>${esc(r.movementType)}</MovementType>
      <Species>${esc(r.species)}</Species>
      <NumberOfAnimals>${r.numberOfAnimals ?? ""}</NumberOfAnimals>
      <DepartureCPH>${esc(r.fromLocation)}</DepartureCPH>
      <DestinationCPH>${esc(r.toLocation)}</DestinationCPH>
      <LicenceNumber>${esc(r.licenceNumber)}</LicenceNumber>
      <TransporterName>${esc(r.haulierCompany ?? r.driverName)}</TransporterName>
      <VehicleRegistration>${esc(r.vehicleRegistration)}</VehicleRegistration>${animalsXml}
    </Movement>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<MovementDocument xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="2.0">
  <Header>
    <HoldingCPH>${esc(farm.cphNumber)}</HoldingCPH>
    <HoldingName>${esc(farm.name)}</HoldingName>
    <ExportDate>${today}</ExportDate>
    <ExportTimestamp>${timestamp}</ExportTimestamp>
    <ExportedBy>BDE Farm Trac</ExportedBy>
    <RecordCount>${records.length}</RecordCount>
  </Header>
  <Movements>${movXml}
  </Movements>
</MovementDocument>`;
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `livestock-movements-eaml2-${farm.cphNumber?.replace(/\//g, "-") ?? "export"}-${today}.xml`;
  a.click();
  URL.revokeObjectURL(url);
}
function Movements() {
  const { farmId } = useAppStore();
  const [, navigateTo] = useLocation();
  const { farmRecord: movFarmRecord } = useFarmMeta(farmId ?? 0);
  const queryClient = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [cropYear, setCropYear] = usePersistedNumberFilter({ page: "movements", filter: "crop-year", farmId, defaultValue: currentCropYear() });
  const [showForm, setShowForm] = reactExports.useState(false);
  const [viewMovement, setViewMovement] = reactExports.useState(null);
  const [checklistMovement, setChecklistMovement] = reactExports.useState(null);
  const [editingRecord, setEditingRecord] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = reactExports.useState(null);
  const [printRecord, setPrintRecord] = reactExports.useState(null);
  const [expandedAttachments, setExpandedAttachments] = reactExports.useState(null);
  const [activeTab, setActiveTab] = usePersistedTab({ page: "movements", farmId, validIds: ["movements", "mortality", "bcms-submissions", "lis-submissions", "lip-submissions", "lip-lost-found", "eidcymru-submissions", "scoteid-submissions"], defaultTab: "movements" });
  const [lipActionDialog, setLipActionDialog] = reactExports.useState(null);
  const [lipActionReason, setLipActionReason] = reactExports.useState("");
  const [lipRejectionReasonId, setLipRejectionReasonId] = reactExports.useState("");
  const [showLostFoundForm, setShowLostFoundForm] = reactExports.useState(false);
  const [lostFoundViewId, setLostFoundViewId] = reactExports.useState(null);
  const [lostFoundEditId, setLostFoundEditId] = reactExports.useState(null);
  const [lostFoundDeleteId, setLostFoundDeleteId] = reactExports.useState(null);
  const [lostFoundForm, setLostFoundForm] = reactExports.useState({ earTag: "", status: "lost", eventDate: "", crimeReferenceNumber: "", foundDead: false, notes: "" });
  const [bcmsFilter, setBcmsFilter] = usePersistedFilter({ page: "movements", filter: "bcms", farmId, defaultValue: "all" });
  const { toast } = useToast();
  const [submitConfirmId, setSubmitConfirmId] = reactExports.useState(null);
  const [submittingId, setSubmittingId] = reactExports.useState(null);
  const [lisSubmitConfirmId, setLisSubmitConfirmId] = reactExports.useState(null);
  const [lisSubmittingId, setLisSubmittingId] = reactExports.useState(null);
  const [firstProductionSubmissionNotice, setFirstProductionSubmissionNotice] = reactExports.useState(null);
  const [lisSubTab, setLisSubTab] = reactExports.useState("outbound");
  const [lisReviewDialog, setLisReviewDialog] = reactExports.useState(null);
  const [lisReviewArrivalDate, setLisReviewArrivalDate] = reactExports.useState("");
  const [lisReviewAccepting, setLisReviewAccepting] = reactExports.useState(true);
  const [lisUndoConfirmId, setLisUndoConfirmId] = reactExports.useState(null);
  const [lisPortalRefId, setLisPortalRefId] = reactExports.useState(null);
  const [lisPortalRefInput, setLisPortalRefInput] = reactExports.useState("");
  const [bcmsPortalRefId, setBcmsPortalRefId] = reactExports.useState(null);
  const [bcmsPortalRefInput, setBcmsPortalRefInput] = reactExports.useState("");
  const [lipSubmitConfirmId, setLipSubmitConfirmId] = reactExports.useState(null);
  const [lipSubmittingId, setLipSubmittingId] = reactExports.useState(null);
  const [eidcymruSubmitConfirmId, setEidcymruSubmitConfirmId] = reactExports.useState(null);
  const [eidcymruSubmittingId, setEidcymruSubmittingId] = reactExports.useState(null);
  const [scoteidSubmitConfirmId, setScoteidSubmitConfirmId] = reactExports.useState(null);
  const [scoteidSubmittingId, setScoteidSubmittingId] = reactExports.useState(null);
  const [linkedAnimalIds, setLinkedAnimalIds] = reactExports.useState([]);
  const [incomingAnimalTags, setIncomingAnimalTags] = reactExports.useState("");
  const [incomingAnimalBreed, setIncomingAnimalBreed] = reactExports.useState("");
  const [incomingAnimalSex, setIncomingAnimalSex] = reactExports.useState("");
  const idBannerKey = `movements-id-warning-dismissed-${farmId}`;
  const BANNER_TTL_MS = 30 * 24 * 60 * 60 * 1e3;
  const readBannerDismissed = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const { ts } = JSON.parse(raw);
      return Date.now() - ts < BANNER_TTL_MS;
    } catch {
      return false;
    }
  };
  const [idBannerDismissed, setIdBannerDismissed] = reactExports.useState(() => readBannerDismissed(`movements-id-warning-dismissed-${farmId}`));
  React.useEffect(() => {
    setIdBannerDismissed(readBannerDismissed(idBannerKey));
  }, [farmId, idBannerKey]);
  const idBanner = (() => {
    if (!movFarmRecord || idBannerDismissed) return null;
    const r = movFarmRecord;
    const hasAnyLivestock = r.sectorBeef || r.sectorSheep || r.sectorDairy || r.sectorPigs || r.sectorGoats || r.sectorEquine || r.sectorDeer || r.sectorPoultry || r.sectorEggs;
    if (!hasAnyLivestock) return null;
    const missing = [];
    if (!r.cphNumber || String(r.cphNumber).trim() === "")
      missing.push({ label: "CPH Number", anchor: "settings-cph" });
    if ((r.sectorSheep || r.sectorGoats) && (!r.flockMark || String(r.flockMark).trim() === ""))
      missing.push({ label: "Flock Mark", anchor: "settings-flock-mark" });
    if ((r.sectorBeef || r.sectorDairy) && (!r.herdMark || String(r.herdMark).trim() === ""))
      missing.push({ label: "Herd Mark", anchor: "settings-herd-mark" });
    if (r.sectorPigs && (!r.pigHerdMark || String(r.pigHerdMark).trim() === ""))
      missing.push({ label: "Pig Herd Mark", anchor: "settings-pig-herd-mark" });
    if (missing.length === 0) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Missing livestock identifiers: " }),
        missing.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          i > 0 && ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "underline underline-offset-2 hover:text-amber-900 font-medium",
              onClick: () => {
                navigateTo("/settings/farm");
                setTimeout(() => {
                  const el = document.getElementById(f.anchor);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.focus({ preventScroll: true });
                  }
                }, 400);
              },
              children: f.label
            }
          )
        ] }, f.label)),
        " — submissions may fail or be incomplete. ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "underline underline-offset-2 hover:text-amber-900 font-medium",
            onClick: () => navigateTo("/settings/farm"),
            children: "Add in Farm Settings → Livestock"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "aria-label": "Dismiss warning",
          className: "shrink-0 ml-1 text-amber-500 hover:text-amber-700",
          onClick: () => {
            try {
              localStorage.setItem(idBannerKey, JSON.stringify({ ts: Date.now() }));
            } catch {
            }
            setIdBannerDismissed(true);
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
        }
      )
    ] });
  })();
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  const baseUrl = `/api/farms/${farmId}/movements`;
  const { data: movementsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["movements", farmId],
    queryFn: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });
  const { data: farmData } = useQuery({
    queryKey: ["tenant-farms"],
    queryFn: async () => {
      const res = await fetch(`/api/tenants/current/farms`);
      if (!res.ok) return null;
      const json = await res.json();
      return (json.farms ?? []).find((f) => f.id === farmId) ?? null;
    },
    enabled: !!farmId
  });
  const { data: animalsData } = useQuery({
    queryKey: ["animals-for-movements", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/animals`);
      if (!res.ok) return [];
      const d = await res.json();
      return d.records ?? [];
    },
    enabled: !!farmId
  });
  const allAnimals = animalsData ?? [];
  const { data: viewMovementAnimalsData } = useQuery({
    queryKey: ["movement-animals-view", farmId, viewMovement?.id],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/livestock-movements/${viewMovement.id}/animals`);
      if (!res.ok) return [];
      const d = await res.json();
      return d.animals ?? [];
    },
    enabled: !!farmId && !!viewMovement?.id
  });
  const viewMovementAnimals = viewMovementAnimalsData ?? [];
  const createMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      queryClient.invalidateQueries({ queryKey: ["animals-for-movements", farmId] });
      setShowForm(false);
      setFormData(EMPTY_FORM);
      setLinkedAnimalIds([]);
      setIncomingAnimalTags("");
      setIncomingAnimalBreed("");
      setIncomingAnimalSex("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      queryClient.invalidateQueries({ queryKey: ["animals-for-movements", farmId] });
      setEditingRecord(null);
      setFormData(EMPTY_FORM);
      setLinkedAnimalIds([]);
      setIncomingAnimalTags("");
      setIncomingAnimalBreed("");
      setIncomingAnimalSex("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      setDeleteConfirmId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: submissionsData, refetch: refetchSubmissions } = useQuery({
    queryKey: ["bcms-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bcms-submissions`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const bcmsSubmissions = submissionsData ?? [];
  const { data: bcmsCredsData } = useQuery({
    queryKey: ["bcms-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/bcms-credentials`).then((r) => r.json()),
    enabled: !!farmId
  });
  const bcmsConfigured = !!bcmsCredsData?.configured;
  const { data: lisSubmissionsData, refetch: refetchLisSubmissions } = useQuery({
    queryKey: ["lis-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-submissions`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.submissions ?? []
  });
  const lisSubmissions = lisSubmissionsData ?? [];
  const { data: lisInboundData, refetch: refetchLisInbound } = useQuery({
    queryKey: ["lis-inbound-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-inbound-movements`).then((r) => r.json()),
    enabled: !!farmId
  });
  const lisInbound = Array.isArray(lisInboundData) ? lisInboundData : [];
  const { data: lisCredsData } = useQuery({
    queryKey: ["lis-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lis-credentials`).then((r) => r.json()),
    enabled: !!farmId
  });
  const lisConfigured = !!lisCredsData?.configured;
  const { data: lipSubmissionsData, refetch: refetchLipSubmissions } = useQuery({
    queryKey: ["lip-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-submissions`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.submissions ?? []
  });
  const lipSubmissions = lipSubmissionsData ?? [];
  const { data: lipCredsData } = useQuery({
    queryKey: ["lip-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-credentials`).then((r) => r.json()),
    enabled: !!farmId
  });
  const lipConfigured = !!lipCredsData?.configured;
  const isWales = farmData?.country === "wales";
  const isScotland = farmData?.country === "scotland";
  const { data: eidcymruCredsData } = useQuery({
    queryKey: ["eidcymru-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/eidcymru-credentials`).then((r) => r.json()),
    enabled: !!farmId && isWales
  });
  const eidcymruConfigured = !!eidcymruCredsData?.configured;
  const { data: eidcymruSubmissionsData, refetch: refetchEidcymruSubmissions } = useQuery({
    queryKey: ["eidcymru-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/eidcymru-submissions`).then((r) => r.json()),
    enabled: !!farmId && isWales,
    select: (d) => d.submissions ?? []
  });
  const eidcymruSubmissions = eidcymruSubmissionsData ?? [];
  const { data: scoteidCredsData } = useQuery({
    queryKey: ["scoteid-credentials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/scoteid-credentials`).then((r) => r.json()),
    enabled: !!farmId && isScotland
  });
  const scoteidConfigured = !!scoteidCredsData?.configured;
  const { data: scoteidSubmissionsData, refetch: refetchScoteidSubmissions } = useQuery({
    queryKey: ["scoteid-submissions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/scoteid-submissions`).then((r) => r.json()),
    enabled: !!farmId && isScotland,
    select: (d) => d.submissions ?? []
  });
  const scoteidSubmissions = scoteidSubmissionsData ?? [];
  const { data: lipRejectionReasonsData } = useQuery({
    queryKey: ["lip-rejection-reasons", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-rejection-reasons`).then((r) => r.json()),
    enabled: lipConfigured,
    staleTime: 10 * 60 * 1e3
  });
  const lipRejectionReasons = lipRejectionReasonsData?.reasons ?? [];
  const { data: lostFoundData, refetch: refetchLostFound } = useQuery({
    queryKey: ["lip-lost-found", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lip-lost-found`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const lostFoundRecords = lostFoundData ?? [];
  const submitLipMut = useMutation({
    mutationFn: (movementId) => fetch(`/api/farms/${farmId}/lip-submit-movement/${movementId}`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onMutate: (id) => setLipSubmittingId(id),
    onSuccess: (d) => {
      setLipSubmittingId(null);
      setLipSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchLipSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Submitted to LIP (sandbox)" : "Submitted to LIP", description: d.sandbox ? `Sandbox ref: ${d.reference}` : `LIP ref: ${d.reference}` });
      } else {
        toast({ title: "LIP submission failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => {
      setLipSubmittingId(null);
      toast({ title: "LIP submission error", variant: "destructive" });
    }
  });
  const confirmLipMut = useMutation({
    mutationFn: (params) => fetch(`/api/farms/${farmId}/lip-confirm-movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lipReference: params.lipReference, action: params.action, rejectionReason: params.rejectionReason, rejectionReasonId: params.rejectionReasonId, submissionId: params.submissionId })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      setLipActionDialog(null);
      setLipActionReason("");
      setLipRejectionReasonId("");
      refetchLipSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Confirmation sent (sandbox)" : "Movement confirmed", description: d.reference ? `Ref: ${d.reference}` : void 0 });
      } else {
        toast({ title: "Confirmation failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Confirmation error", variant: "destructive" })
  });
  const checkAsyncMut = useMutation({
    mutationFn: (submissionId) => fetch(`/api/farms/${farmId}/lip-check-async/${submissionId}`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d, submissionId) => {
      refetchLipSubmissions();
      if (d.resolved) {
        const ok = /completed/i.test(d.status ?? "");
        toast({ title: ok ? "Submission confirmed" : "Submission failed", description: ok ? d.reference ? `Ref: ${d.reference}` : "Completed" : `Status: ${d.status}`, variant: ok ? "default" : "destructive" });
      } else {
        toast({ title: "Still pending", description: `LIS status: ${d.status ?? "Pending"}` });
      }
    },
    onError: () => toast({ title: "Status check failed", variant: "destructive" })
  });
  const cancelLipMut = useMutation({
    mutationFn: (params) => fetch(`/api/farms/${farmId}/lip-cancel-movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lipReference: params.lipReference, submissionId: params.submissionId })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      setLipActionDialog(null);
      refetchLipSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Cancellation sent (sandbox)" : "Movement cancelled", description: d.reference ? `Ref: ${d.reference}` : void 0 });
      } else {
        toast({ title: "Cancellation failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Cancellation error", variant: "destructive" })
  });
  const saveLostFoundMut = useMutation({
    mutationFn: (params) => fetch(params.id ? `/api/farms/${farmId}/lip-lost-found/${params.id}` : `/api/farms/${farmId}/lip-lost-found`, {
      method: params.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.body)
    }).then((r) => r.json()),
    onSuccess: (d) => {
      refetchLostFound();
      setShowLostFoundForm(false);
      setLostFoundEditId(null);
      setLostFoundForm({ earTag: "", status: "lost", eventDate: "", crimeReferenceNumber: "", foundDead: false, notes: "" });
      const rec = d.record;
      if (rec?.lipStatus === "submitted" || rec?.lipStatus === "pending") {
        toast({ title: "Lost & Found record saved", description: d.reference ? `LIP ref: ${d.reference}` : "Record saved locally" });
      } else if (d.error) {
        toast({ title: "LIP submission failed", description: d.error, variant: "destructive" });
      } else {
        toast({ title: "Lost & Found record saved" });
      }
    },
    onError: () => toast({ title: "Failed to save record", variant: "destructive" })
  });
  const submitEidcymruMut = useMutation({
    mutationFn: (movementId) => fetch(`/api/farms/${farmId}/eidcymru-submit/${movementId}`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onMutate: (id) => setEidcymruSubmittingId(id),
    onSuccess: (d) => {
      setEidcymruSubmittingId(null);
      setEidcymruSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchEidcymruSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Submitted to EIDCymru staging" : "Submitted to EIDCymru", description: `${d.sandbox ? "Staging" : "EIDCymru"} ref: ${d.reference}${d.warnings?.length ? ` — ${d.warnings.map((warning) => warning.description).filter(Boolean).join("; ")}` : ""}` });
      } else {
        toast({ title: "EIDCymru submission failed", description: d.errorMessage, variant: "destructive" });
      }
    },
    onError: () => {
      setEidcymruSubmittingId(null);
      toast({ title: "EIDCymru submission error", variant: "destructive" });
    }
  });
  const submitScoteidMut = useMutation({
    mutationFn: (movementId) => fetch(`/api/farms/${farmId}/scoteid-submit/${movementId}`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onMutate: (id) => setScoteidSubmittingId(id),
    onSuccess: (d) => {
      setScoteidSubmittingId(null);
      setScoteidSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchScoteidSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Submitted to ScotEID (sandbox)" : "Submitted to ScotEID", description: d.sandbox ? `Sandbox ref: ${d.reference}` : `ScotEID ref: ${d.reference}` });
      } else {
        toast({ title: "ScotEID submission failed", description: d.errorMessage, variant: "destructive" });
      }
    },
    onError: () => {
      setScoteidSubmittingId(null);
      toast({ title: "ScotEID submission error", variant: "destructive" });
    }
  });
  const submitLisMut = useMutation({
    mutationFn: (movementId) => fetch(`/api/farms/${farmId}/lis-submit/${movementId}`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onMutate: (id) => setLisSubmittingId(id),
    onSuccess: (d, id) => {
      setLisSubmittingId(null);
      setLisSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchLisSubmissions();
      if (d.success) {
        if (d.firstProductionSubmission) {
          setFirstProductionSubmissionNotice({ farmId, reference: d.reference ?? null });
        }
        toast({ title: d.sandbox ? "Submitted to LIS (sandbox)" : "Submitted to LIS", description: d.sandbox ? `Sandbox ref: ${d.reference}` : `LIS ref: ${d.reference}` });
      } else {
        toast({ title: "LIS submission failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => {
      setLisSubmittingId(null);
      toast({ title: "LIS submission error", variant: "destructive" });
    }
  });
  const saveBcmsPortalRefMut = useMutation({
    mutationFn: ({ movementId, bcmsManualRef }) => fetch(`/api/farms/${farmId}/movements/${movementId}/bcms-portal-ref`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ bcmsManualRef })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.success) {
        queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
        setBcmsPortalRefId(null);
        setBcmsPortalRefInput("");
        toast({ title: "BCMS reference saved", description: "Movement marked as notified on BCMS Online." });
      } else {
        toast({ title: "Failed to save reference", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Failed to save BCMS reference", variant: "destructive" })
  });
  const saveLisPortalRefMut = useMutation({
    mutationFn: ({ movementId, lisManualRef }) => fetch(`/api/farms/${farmId}/movements/${movementId}/lis-portal-ref`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lisManualRef })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.success) {
        queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
        setLisPortalRefId(null);
        setLisPortalRefInput("");
        toast({ title: "LIS portal reference saved", description: "Movement marked as notified on the LIS keeper portal." });
      } else {
        toast({ title: "Failed to save reference", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Failed to save LIS portal reference", variant: "destructive" })
  });
  const lisSyncMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/lis/sync-herds`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      refetchLisSubmissions();
      refetchLisInbound();
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      toast({ title: "LIS sync complete", description: d.message ?? "Synced with LIS successfully" });
    },
    onError: () => toast({ title: "LIS sync failed", variant: "destructive" })
  });
  const lisReviewMut = useMutation({
    mutationFn: (vars) => fetch(`/api/farms/${farmId}/lis-review-movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vars)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      setLisReviewDialog(null);
      refetchLisInbound();
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      if (d.success) {
        toast({ title: d.isAccepted ? "Movement accepted" : "Movement rejected", description: d.sandbox ? "Simulated in sandbox" : "LIS has been notified." });
      } else {
        toast({ title: "Review failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Review error", variant: "destructive" })
  });
  const lisUndoMut = useMutation({
    mutationFn: (movId) => fetch(`/api/farms/${farmId}/lis-undo-movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movId })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      setLisUndoConfirmId(null);
      refetchLisInbound();
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      if (d.success) {
        toast({ title: "Movement withdrawn", description: d.sandbox ? "Simulated in sandbox" : "LIS has been notified of the withdrawal." });
      } else {
        toast({ title: "Undo failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Undo error", variant: "destructive" })
  });
  const submitBcmsMut = useMutation({
    mutationFn: (movementId) => fetch(`/api/farms/${farmId}/bcms-submit/${movementId}`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onMutate: (id) => setSubmittingId(id),
    onSuccess: (d, id) => {
      setSubmittingId(null);
      setSubmitConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["movements", farmId] });
      refetchSubmissions();
      if (d.success) {
        toast({ title: d.sandbox ? "Submitted (sandbox)" : "Submitted to BCMS", description: d.sandbox ? `Sandbox ref: ${d.reference}` : `BCMS ref: ${d.reference}` });
      } else {
        toast({ title: "Submission failed", description: d.error, variant: "destructive" });
      }
    },
    onError: () => {
      setSubmittingId(null);
      toast({ title: "Submission error", variant: "destructive" });
    }
  });
  const records = movementsData?.records ?? [];
  const overdueMovements = records.filter((r) => {
    const exempt = r.movementType === "birth" || r.movementType === "between";
    return !exempt && !r.legalNotificationSubmitted && daysSince(r.movementDate) > 3;
  });
  const LIS_SPECIES_LIST = ["sheep", "goat", "deer"];
  const lisUnreported = records.filter(
    (r) => LIS_SPECIES_LIST.includes((r.species ?? "").toLowerCase()) && !r.legalNotificationSubmitted && !r.lisMovementRef
  );
  const lipUnreported = records.filter(
    (r) => (r.species ?? "").toLowerCase() === "cattle" && (r.movementType === "on" || r.movementType === "off") && !r.legalNotificationSubmitted && !r.bcmsSubmissionRef
  );
  const requiresBcms = (r) => r.movementType !== "birth" && r.movementType !== "between";
  const bcmsFiltered = records.filter((r) => {
    if (bcmsFilter === "all") return true;
    if (bcmsFilter === "pending") return requiresBcms(r) && !r.legalNotificationSubmitted;
    if (bcmsFilter === "submitted") return r.legalNotificationSubmitted;
    return true;
  });
  const filtered = bcmsFiltered.filter((r) => {
    if (!isInCropYear(r.movementDate, cropYear)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return r.movementType?.toLowerCase().includes(s) || r.species?.toLowerCase().includes(s) || r.fromLocation?.toLowerCase().includes(s) || r.toLocation?.toLowerCase().includes(s) || r.licenceNumber?.toLowerCase().includes(s) || r.bcmsSubmissionRef?.toLowerCase().includes(s) || r.transporterDetails?.toLowerCase().includes(s);
  });
  const yearRecords = records.filter((r) => isInCropYear(r.movementDate, cropYear));
  const pendingCount = yearRecords.filter((r) => requiresBcms(r) && !r.legalNotificationSubmitted).length;
  const submittedCount = yearRecords.filter((r) => r.legalNotificationSubmitted).length;
  const resetAnimalState = () => {
    setLinkedAnimalIds([]);
    setIncomingAnimalTags("");
    setIncomingAnimalBreed("");
    setIncomingAnimalSex("");
  };
  const openAdd = () => {
    setEditingRecord(null);
    setFormData({ ...EMPTY_FORM, movementDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    resetAnimalState();
    setShowForm(true);
  };
  const openEdit = async (r) => {
    setEditingRecord(r);
    setFormData({
      movementType: r.movementType ?? "",
      movementDate: r.movementDate ? r.movementDate.slice(0, 10) : "",
      fromLocation: r.fromLocation ?? "",
      toLocation: r.toLocation ?? "",
      numberOfAnimals: r.numberOfAnimals != null ? String(r.numberOfAnimals) : "",
      species: r.species ?? "",
      earTagNumbers: r.earTagNumbers ?? "",
      licenceNumber: r.licenceNumber ?? "",
      bcmsSubmissionRef: r.bcmsSubmissionRef ?? "",
      legalNotificationSubmitted: r.legalNotificationSubmitted ?? false,
      legalNotificationDate: r.legalNotificationDate ? r.legalNotificationDate.slice(0, 10) : "",
      transporterDetails: r.transporterDetails ?? "",
      ataNumber: r.ataNumber ?? "",
      ataExpiryDate: r.ataExpiryDate ? r.ataExpiryDate.slice(0, 10) : "",
      reason: r.reason ?? "",
      notes: r.notes ?? ""
    });
    resetAnimalState();
    if (r.movementType === "off") {
      try {
        const res = await fetch(`/api/farms/${farmId}/livestock-movements/${r.id}/animals`);
        if (res.ok) {
          const d = await res.json();
          const ids = (d.animals ?? []).filter((a) => a.animalId != null).map((a) => a.animalId);
          setLinkedAnimalIds(ids);
        }
      } catch {
      }
    }
    setShowForm(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedTags = incomingAnimalTags.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean);
    const autoCount = formData.movementType === "off" && linkedAnimalIds.length > 0 ? linkedAnimalIds.length : formData.movementType === "on" && parsedTags.length > 0 ? parsedTags.length : null;
    const body = {
      ...formData,
      numberOfAnimals: formData.numberOfAnimals ? Number(formData.numberOfAnimals) : autoCount,
      legalNotificationDate: formData.legalNotificationSubmitted && formData.legalNotificationDate ? new Date(formData.legalNotificationDate).toISOString() : null
    };
    if (formData.movementType === "off" && linkedAnimalIds.length > 0) {
      body.linkedAnimalIds = linkedAnimalIds;
    }
    if (formData.movementType === "on" && parsedTags.length > 0) {
      body.incomingAnimalEntries = parsedTags.map((tag) => ({
        tagNumber: tag,
        species: formData.species || void 0,
        breed: incomingAnimalBreed || void 0,
        sex: incomingAnimalSex || void 0
      }));
    }
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, body });
    } else {
      createMutation.mutate(body);
    }
  };
  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const showingForm = showForm || editingRecord !== null;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Livestock Movements", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-64 bg-black/5 rounded-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-32 bg-black/5 rounded-lg" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-black/5 p-6 space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-black/5 rounded w-full" }, i)) })
    ] }) });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Livestock Movements", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-6 h-6 text-red-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2", children: "Failed to load movement records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "There was a problem loading your records." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => refetch(), variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
        " Retry"
      ] })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Livestock Movements", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {
          body > * { display: none !important; }
          [role="dialog"] #movement-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:12px; color:#000; background:#fff; }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: activeTab === "movements", onClick: () => setActiveTab("movements"), children: "Movements" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: activeTab === "mortality", onClick: () => setActiveTab("mortality"), children: "Mortality Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: activeTab === "bcms-submissions", onClick: () => setActiveTab("bcms-submissions"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5" }),
        "BCMS Submissions",
        bcmsSubmissions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-60", children: [
          "(",
          bcmsSubmissions.length,
          ")"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: activeTab === "lis-submissions", onClick: () => setActiveTab("lis-submissions"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5" }),
        "LIS Submissions",
        lisSubmissions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-60", children: [
          "(",
          lisSubmissions.length,
          ")"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: activeTab === "lip-submissions", onClick: () => setActiveTab("lip-submissions"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5" }),
        "LIP Submissions",
        lipSubmissions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-60", children: [
          "(",
          lipSubmissions.length,
          ")"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: activeTab === "lip-lost-found", onClick: () => setActiveTab("lip-lost-found"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5" }),
        "Lost & Found",
        lostFoundRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-60", children: [
          "(",
          lostFoundRecords.length,
          ")"
        ] })
      ] }) }),
      isWales && /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: activeTab === "eidcymru-submissions", onClick: () => setActiveTab("eidcymru-submissions"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5" }),
        "EIDCymru",
        eidcymruSubmissions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-60", children: [
          "(",
          eidcymruSubmissions.length,
          ")"
        ] })
      ] }) }),
      isScotland && /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: activeTab === "scoteid-submissions", onClick: () => setActiveTab("scoteid-submissions"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3.5 h-3.5" }),
        "ScotEID",
        scoteidSubmissions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-60", children: [
          "(",
          scoteidSubmissions.length,
          ")"
        ] })
      ] }) })
    ] }),
    firstProductionSubmissionNotice?.farmId === farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-emerald-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "First live LIS submission sent — awaiting LIS confirmation." }),
        " LIS reference:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: firstProductionSubmissionNotice.reference ?? "not returned by LIS" })
      ] })
    ] }),
    activeTab === "movements" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: bcmsFilter === "all", onClick: () => setBcmsFilter("all"), children: [
          "All ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
            "(",
            yearRecords.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: bcmsFilter === "pending", onClick: () => setBcmsFilter("pending"), children: [
          "BCMS Pending ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
            "(",
            pendingCount,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: bcmsFilter === "submitted", onClick: () => setBcmsFilter("submitted"), children: [
          "BCMS Submitted ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
            "(",
            submittedCount,
            ")"
          ] })
        ] })
      ] }),
      idBanner,
      overdueMovements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-900 flex gap-3 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-500 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BCMS/APHA notification overdue" }),
          " — ",
          overdueMovements.length,
          " movement",
          overdueMovements.length > 1 ? "s are" : " is",
          " more than 3 days old without a legal notification recorded. These must be reported to BCMS/APHA immediately. Update each record once reported."
        ] })
      ] }),
      (() => {
        const lisUnnotified = yearRecords.filter((r) => {
          const sp = (r.species ?? "").toLowerCase();
          return (sp === "sheep" || sp === "goat" || sp === "deer") && (r.movementType === "on" || r.movementType === "off") && !r.legalNotificationSubmitted && !r.lisMovementRef;
        });
        if (lisUnnotified.length === 0) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 flex gap-3 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-500 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LIS notification gap" }),
            " — ",
            lisUnnotified.length,
            " sheep/goat/deer movement",
            lisUnnotified.length > 1 ? "s" : "",
            " in this period ",
            lisUnnotified.length > 1 ? "have" : "has",
            " not been notified to LIS. Report ",
            lisUnnotified.length > 1 ? "these" : "this",
            " at",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://cla.livestockinformation.org.uk", target: "_blank", rel: "noopener noreferrer", className: "underline font-medium", children: "cla.livestockinformation.org.uk" }),
            " ",
            "and record the reference number against each movement. Use ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Print LIS Report" }),
            " below to produce audit evidence."
          ] })
        ] });
      })(),
      (() => {
        const country = farmData?.country ?? "england";
        const isScotland2 = country === "scotland";
        const isWales2 = country === "wales";
        const isNI = country === "northern_ireland";
        const portalLinks = isScotland2 ? [
          { label: "ScotEID", href: "https://www.scoteid.com" },
          { label: "BCMS Online", href: "https://www.bcms.gov.uk" }
        ] : isWales2 ? [
          { label: "EIDCymru", href: "https://www.eidcymru.org" },
          { label: "eAML2.net", href: "https://www.eaml2.org.uk" },
          { label: "BCMS Online", href: "https://www.bcms.gov.uk" }
        ] : isNI ? [
          { label: "NIFAIS", href: "https://www.daera-ni.gov.uk/topics/animal-identification-movement-and-tracing/nifais" }
        ] : [
          { label: "eAML2.net", href: "https://www.eaml2.org.uk" },
          { label: "BCMS Online", href: "https://www.bcms.gov.uk" }
        ];
        const portalDescription = isScotland2 ? "All livestock movements in Scotland (cattle, sheep, goats, pigs) are reported to ScotEID. Cattle also require BCMS notification." : isWales2 ? "In Wales: sheep and goats use EIDCymru; pigs use eAML2.net; cattle use BCMS Online." : isNI ? "In Northern Ireland: cattle and sheep movements are recorded on NIFAIS. Contact DAERA for scheme details." : "In England: sheep, goats and pigs use eAML2.net; cattle use BCMS Online.";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-900 flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4 text-blue-500 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Submit to government portal:" }),
            " ",
            portalDescription,
            " ",
            "Paste the reference number back into each movement record once submitted."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 shrink-0", children: portalLinks.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: link.href,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 bg-white border border-blue-300 rounded-md px-2.5 py-1 hover:bg-blue-50 transition-colors",
              children: [
                link.label,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" })
              ]
            },
            link.href
          )) })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 flex gap-3 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500 mt-0.5 shrink-0", children: "ℹ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Regulatory reminder:" }),
          " All on/off livestock movements must be reported to the relevant government portal. Cattle must be reported within 3 days; sheep, goats and pigs as required by the applicable scheme. Record the submission reference here and attach a copy of the AML form. Printed records are for on-farm Red Tractor compliance use only."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search movements...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-10"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-1" }),
            " Refresh"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => {
                const filterLabel = bcmsFilter === "all" ? "All movements" : bcmsFilter === "pending" ? "BCMS Pending" : "BCMS Submitted";
                printMovementsRegister(filtered, farmData ?? null, filterLabel);
              },
              disabled: filtered.length === 0,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
                " Print Register"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => {
                const periodLabel = `Crop year ${cropYear}`;
                printLisComplianceReport(records, farmData ?? null, periodLabel, lisCredsData?.lisLastSyncedAt ?? null);
              },
              disabled: records.length === 0,
              title: "Print LIS Movement Notification Compliance Report for Red Tractor audit",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
                " LIS Report"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => exportMovementsCsv(records, farmData?.cphNumber ?? ""),
              disabled: records.length === 0,
              title: "Download all movements as CSV for eAML2 / BCMS reference",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-1" }),
                " Export CSV"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => exportMovementsEaml2(records, { cphNumber: farmData?.cphNumber, name: farmData?.name }),
              disabled: records.length === 0,
              title: "Download movements as eAML2-compatible XML (upload to eAML2.org.uk)",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-1" }),
                " eAML2 XML"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            " Add Movement"
          ] })
        ] })
      ] }),
      viewMovement && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewMovement(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Movement Record" }) }),
        (() => {
          const r = viewMovement;
          const typeLabels = { "on": "On (Purchase)", "off": "Off (Sale)", "birth": "Birth", "death": "Death", "between": "Between Holdings" };
          const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
          const F = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-0.5", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", style: { color: value ? void 0 : "#d1d5db" }, children: value || "—" })
          ] });
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Date", value: fmt(r.movementDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Type", value: typeLabels[r.movementType] ?? r.movementType }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Species", value: r.species })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "From", value: r.fromLocation }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "To", value: r.toLocation })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Number of Animals", value: r.numberOfAnimals != null ? String(r.numberOfAnimals) : null }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "AML / Licence Ref.", value: r.licenceNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "BCMS Ref.", value: r.bcmsSubmissionRef })
            ] }),
            r.earTagNumbers && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Ear Tag Numbers", value: r.earTagNumbers }),
            viewMovementAnimals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-2", children: [
                "Linked Animals (",
                viewMovementAnimals.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-lg overflow-hidden divide-y divide-border/50", children: viewMovementAnimals.map((a) => {
                const tag = a.animalEarTagNumber ?? a.animalTagNumber ?? a.tagNumber ?? a.animalCode ?? (a.animalId ? `#${a.animalId}` : "—");
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium text-foreground flex-1", children: tag }),
                  a.breed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: a.breed }),
                  a.sex && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40 capitalize", children: a.sex }),
                  !a.animalId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded", children: "Unlinked" })
                ] }, a.id);
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "BCMS / APHA Notified", value: r.legalNotificationSubmitted ? `Yes${r.legalNotificationDate ? ` — ${fmt(r.legalNotificationDate)}` : ""}` : "⚠ Not yet notified" }),
            r.transporterDetails && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Transporter", value: r.transporterDetails }),
            r.ataNumber && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Transporter ATA No.", value: r.ataNumber + (r.ataExpiryDate ? ` (expires ${fmt(r.ataExpiryDate)})` : "") }),
            r.reason && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Reason", value: r.reason }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Notes", value: r.notes }),
            r.haulageRecordId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 14px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 13, color: "#1d4ed8" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#1e40af" }, children: [
                  "Linked to Haulage Record HR-",
                  r.haulageRecordId
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }, children: "This movement was arranged via the Haulage module. See the Haulage & Transport tab for vehicle and cost details." })
            ] }),
            r.movementType === "off" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: r.checklistCompletedAt ? "#f0fdf4" : "#fffbeb", border: `1px solid ${r.checklistCompletedAt ? "#bbf7d0" : "#fde68a"}`, borderRadius: 8, padding: "10px 14px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                r.checklistCompletedAt ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, color: "#16a34a" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { size: 14, color: "#92400e" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: r.checklistCompletedAt ? "#166534" : "#92400e" }, children: r.checklistCompletedAt ? `Dispatch checklist signed off by ${r.checklistCompletedBy}` : "Dispatch checklist not yet completed" })
              ] }),
              r.vehicleRegistration && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: [
                r.haulierCompany ? `${r.haulierCompany} · ` : "",
                r.vehicleRegistration,
                r.driverName ? ` · ${r.driverName}` : ""
              ] })
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", style: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewMovement(null), children: "Close" }),
          viewMovement?.movementType === "off" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", style: { gap: 6, borderColor: "#1a6b3a", color: "#1a6b3a" }, onClick: () => {
            const r = viewMovement;
            setViewMovement(null);
            setChecklistMovement(r);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { size: 14 }),
            " Dispatch Checklist",
            viewMovement.checklistCompletedAt && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12, color: "#16a34a" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
            const r = viewMovement;
            setViewMovement(null);
            openEdit(r);
          }, children: "Edit Movement" })
        ] })
      ] }) }),
      checklistMovement && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(
        LivestockDispatchChecklist,
        {
          farmId,
          movementId: checklistMovement.id,
          onClose: () => setChecklistMovement(null)
        }
      ),
      showingForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-lg", children: editingRecord ? "Edit Movement Record" : "Record a Movement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setShowForm(false);
                setEditingRecord(null);
                setFormData(EMPTY_FORM);
              },
              className: "p-1 rounded hover:bg-black/5",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-foreground/50" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Movement Type ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                  value: formData.movementType,
                  onChange: (e) => setField("movementType", e.target.value),
                  required: true,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select type..." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "on", children: "On (Animals Arriving at Holding)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "off", children: "Off (Animals Leaving Holding)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "between", children: "Between Holdings" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "birth", children: "Birth on Holding" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "death", children: "Death on Holding" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Movement Date ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formData.movementDate, onChange: (e) => setField("movementDate", e.target.value), required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "From Location / CPH" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 32/541/0012 or Market Name", value: formData.fromLocation, onChange: (e) => setField("fromLocation", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "To Location / CPH" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 32/541/0099 or Abattoir Name", value: formData.toLocation, onChange: (e) => setField("toLocation", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Number of Animals" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: formData.numberOfAnimals, onChange: (e) => setField("numberOfAnimals", e.target.value), placeholder: "e.g. 12" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Species" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
                  value: formData.species,
                  onChange: (e) => setField("species", e.target.value),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not specified" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cattle", children: "Cattle" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sheep", children: "Sheep" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pigs", children: "Pigs" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "goats", children: "Goats" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "deer", children: "Deer" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "AML Licence / Reference No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AML12345678", value: formData.licenceNumber, onChange: (e) => setField("licenceNumber", e.target.value) })
            ] })
          ] }),
          (formData.species === "cattle" || formData.species === "sheep" || formData.species === "goats") && (formData.movementType === "off" ? (
            /* OFF movement: link existing animals from register */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 flex items-center gap-2", children: [
                "Link Animals from Register",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded", children: "Status set to Sold on save" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AnimalRegisterPicker,
                {
                  animals: allAnimals,
                  speciesFilter: formData.species,
                  selectedIds: linkedAnimalIds,
                  onChange: (ids) => {
                    setLinkedAnimalIds(ids);
                    if (ids.length > 0 && !formData.numberOfAnimals) {
                      setField("numberOfAnimals", String(ids.length));
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50", children: [
                "Select the animals leaving this holding. Their status will be updated to ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sold" }),
                " automatically."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                  "Additional / Unregistered Tags ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-foreground/40", children: "(optional)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[56px] resize-y",
                    placeholder: "Ear tags not yet in your Animal Register…",
                    value: formData.earTagNumbers,
                    onChange: (e) => setField("earTagNumbers", e.target.value)
                  }
                )
              ] })
            ] })
          ) : formData.movementType === "on" ? (
            /* ON movement: register incoming animals */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border border-emerald-200 bg-emerald-50/30 rounded-xl p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 text-emerald-700" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-emerald-900", children: "Register Incoming Animals" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded", children: "Adds to Animal Register" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Ear Tag Numbers" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px] resize-y",
                    placeholder: "Enter ear tag numbers, one per line or comma-separated\ne.g. UK123456789012\nUK123456789013",
                    value: incomingAnimalTags,
                    onChange: (e) => {
                      setIncomingAnimalTags(e.target.value);
                      const count = e.target.value.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean).length;
                      if (count > 0 && !formData.numberOfAnimals) setField("numberOfAnimals", String(count));
                    }
                  }
                ),
                incomingAnimalTags.trim() && (() => {
                  const n = incomingAnimalTags.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean).length;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-emerald-700 font-medium mt-1", children: [
                    n,
                    " animal record",
                    n !== 1 ? "s" : "",
                    " will be created in the Animal Register"
                  ] });
                })()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                    "Default Breed ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-foreground/40", children: "(optional)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      placeholder: "e.g. Charolais",
                      value: incomingAnimalBreed,
                      onChange: (e) => setIncomingAnimalBreed(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                    "Default Sex ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-foreground/40", children: "(optional)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      className: "w-full h-10 rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:outline-none",
                      value: incomingAnimalSex,
                      onChange: (e) => setIncomingAnimalSex(e.target.value),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not specified" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", children: "Male" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", children: "Female" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "castrated", children: "Castrated" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50", children: [
                "Animals will be added to your Individual Animal Register with status ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Active" }),
                ". Edit individual records from the Animal Register afterwards."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                  "Additional Tag Notes ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-foreground/40", children: "(optional free text)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "Any additional tag reference notes…",
                    value: formData.earTagNumbers,
                    onChange: (e) => setField("earTagNumbers", e.target.value)
                  }
                )
              ] })
            ] })
          ) : (
            /* Other movement types: free-text textarea */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Individual Ear Tag Numbers",
                formData.species === "cattle" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-xs font-normal text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded", children: "Required for BCMS cattle traceability" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[72px] resize-y",
                  placeholder: formData.species === "cattle" ? "e.g. UK123456789012, UK123456789013 (one per line or comma-separated)" : "e.g. UK123456789012, UK123456789013 (optional for sheep/goats)",
                  value: formData.earTagNumbers,
                  onChange: (e) => setField("earTagNumbers", e.target.value)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1", children: formData.species === "cattle" ? "BCMS requires individual ear tag numbers for all cattle movements. Enter one per line or comma-separated." : "Ear tag numbers are optional for sheep/goats (batch movements are acceptable) but aid traceability." })
            ] })
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-4 space-y-4 bg-amber-50/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "BCMS / APHA Legal Notification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "BCMS/eAML2 Submission Reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "Reference from BCMS/APHA confirmation",
                    value: formData.bcmsSubmissionRef,
                    onChange: (e) => setField("bcmsSubmissionRef", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Date Notified to BCMS/APHA" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "date",
                    value: formData.legalNotificationDate,
                    onChange: (e) => setField("legalNotificationDate", e.target.value),
                    disabled: !formData.legalNotificationSubmitted
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: formData.legalNotificationSubmitted,
                      onChange: (e) => {
                        setField("legalNotificationSubmitted", e.target.checked);
                        if (e.target.checked && !formData.legalNotificationDate) {
                          setField("legalNotificationDate", (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
                        }
                      },
                      className: "w-4 h-4 rounded border-border text-primary"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "BCMS/APHA has been notified of this movement" })
                ] }),
                !formData.legalNotificationSubmitted && formData.movementDate && daysSince(formData.movementDate) > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-600 mt-1.5 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5" }),
                  "This movement is ",
                  daysSince(formData.movementDate),
                  " days old — notification is legally required within 3 days for on/off cattle movements."
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Transporter / Haulier Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name, vehicle reg, contact", value: formData.transporterDetails, onChange: (e) => setField("transporterDetails", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Transporter ATA Number ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(Animal Transporter Authorisation)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. UK/ATA/1234567", value: formData.ataNumber, onChange: (e) => setField("ataNumber", e.target.value), className: "font-mono" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "ATA Expiry Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formData.ataExpiryDate, onChange: (e) => setField("ataExpiryDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Sale, Purchase, Slaughter", value: formData.reason, onChange: (e) => setField("reason", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Any additional notes", value: formData.notes, onChange: (e) => setField("notes", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end pt-2 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", type: "button", onClick: () => {
              setShowForm(false);
              setEditingRecord(null);
              setFormData(EMPTY_FORM);
              resetAnimalState();
            }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
              isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
              editingRecord ? "Update Record" : "Save Movement"
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteConfirmId !== null, onOpenChange: (o) => {
        if (!o) {
          setDeleteConfirmId(null);
          deleteMutation.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Movement Record" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Are you sure you want to delete this movement record? This action cannot be undone." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMutation, message: "Failed to delete — the record is still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteConfirmId(null), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteConfirmId && deleteMutation.mutate(deleteConfirmId), disabled: deleteMutation.isPending, children: [
            deleteMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
            " Delete"
          ] })
        ] })
      ] }) }),
      printRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(PrintRecord, { movement: printRecord, farm: farmData ?? null, onClose: () => setPrintRecord(null) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-8 h-8 text-primary/40" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No movement records yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search ? "No records match your search." : "Start by recording your first livestock movement." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "From → To" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Animals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "AML Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "BCMS Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-4 text-xs uppercase tracking-wider font-bold text-foreground/50", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 hover:bg-black/[0.02] transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-4 text-sm font-medium text-foreground", children: [
                formatDate(r.movementDate),
                r.lisSource && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `Imported from LIS (${r.lisSource.replace(/_/g, " ")})`, style: { marginLeft: 6, display: "inline-flex", alignItems: "center", fontSize: "0.63rem", padding: "1px 5px", borderRadius: 8, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontWeight: 700, verticalAlign: "middle", letterSpacing: "0.03em" }, children: "LIS" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4", children: movementTypeBadge(r.movementType) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4", children: r.species ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 capitalize", children: r.species }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30 text-xs", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-4 text-sm text-foreground/70", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: r.fromLocation || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1.5 text-foreground/30", children: "→" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: r.toLocation || "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm text-foreground/70", children: r.numberOfAnimals ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-sm font-mono text-foreground/70", children: r.licenceNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 3 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(BcmsStatusBadge, { movement: r }),
                (() => {
                  const speciesLower = (r.species ?? "").toLowerCase();
                  const isCattle = speciesLower === "cattle" || !r.species && r.movementType !== "birth";
                  const isLisSpecies = speciesLower === "sheep" || speciesLower === "goat" || speciesLower === "deer";
                  const isSubmittableType = r.movementType === "on" || r.movementType === "off" || r.movementType === "birth" || r.movementType === "death";
                  const isLisSubmittableType = r.movementType === "on" || r.movementType === "off";
                  const bcmsBtn = isCattle && isSubmittableType && !(r.legalNotificationSubmitted && !r.bcmsSubmissionRef?.startsWith("SANDBOX-")) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setSubmitConfirmId(r.id),
                      disabled: submittingId === r.id,
                      style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                      children: [
                        submittingId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 10, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 10 }),
                        bcmsCredsData?.sandboxMode !== false ? "Test Submit" : "Submit to BCMS"
                      ]
                    }
                  ) : null;
                  const bcmsPortalBtn = isCattle && isSubmittableType && !r.legalNotificationSubmitted ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => {
                        setBcmsPortalRefId(r.id);
                        setBcmsPortalRefInput("");
                      },
                      title: "Record the reference number you received after submitting this movement on BCMS Online",
                      style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 10 }),
                        "Record BCMS Ref"
                      ]
                    }
                  ) : null;
                  const isEngland = !isWales && !isScotland;
                  const isLisPortalType = isLisSpecies && isEngland && (r.movementType === "birth" || r.movementType === "death");
                  const lisPortalBtn = isLisPortalType ? r.lisManualRef ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      title: `LIS portal reference: ${r.lisManualRef}${r.lisManualNotifiedAt ? ` — recorded ${formatDate(r.lisManualNotifiedAt)}` : ""}`,
                      style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", fontWeight: 600, whiteSpace: "nowrap", cursor: "default" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 10 }),
                        "LIS Notified"
                      ]
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => {
                        setLisPortalRefId(r.id);
                        setLisPortalRefInput("");
                      },
                      title: "Births and deaths cannot be submitted via the LIS CLA API. Register on the LIS keeper portal and record your confirmation reference here.",
                      style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 10 }),
                        "Register via LIS portal"
                      ]
                    }
                  ) : null;
                  const lisBtn = isLisSpecies && isLisSubmittableType && !(r.legalNotificationSubmitted && r.bcmsSubmissionRef && !r.bcmsSubmissionRef.startsWith("LIS-SANDBOX-")) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setLisSubmitConfirmId(r.id),
                      disabled: lisSubmittingId === r.id,
                      style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                      children: [
                        lisSubmittingId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 10, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 10 }),
                        lisCredsData?.sandboxMode !== false ? "Test Submit (LIS)" : "Submit to LIS"
                      ]
                    }
                  ) : null;
                  const isLipSubmittable = isCattle && r.movementType !== "birth" && lipConfigured;
                  const lipBtn = isLipSubmittable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      title: "LIS Cattle API submissions are temporarily paused from 21 July 2026 while LIS transitions cattle traceability services. Please use BCMS (CTS Web Services) for cattle movements in the meantime.",
                      style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed", fontWeight: 600, whiteSpace: "nowrap" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 10 }),
                        "LIP Paused"
                      ]
                    }
                  ) : null;
                  const isEidcymruSpecies = (speciesLower === "sheep" || speciesLower === "goat") && isWales && (r.movementType === "on" || r.movementType === "off" || r.movementType === "between");
                  const eidcymruBtn = isEidcymruSpecies ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setEidcymruSubmitConfirmId(r.id),
                      disabled: eidcymruSubmittingId === r.id,
                      style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                      children: [
                        eidcymruSubmittingId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 10, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 10 }),
                        eidcymruCredsData?.sandboxMode !== false ? "Submit EIDCymru (staging)" : "Submit EIDCymru"
                      ]
                    }
                  ) : null;
                  const isScoteidSubmittable = isScotland && isSubmittableType;
                  const scoteidBtn = isScoteidSubmittable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setScoteidSubmitConfirmId(r.id),
                      disabled: scoteidSubmittingId === r.id,
                      style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, border: "1px solid #fed7aa", background: "#fff7ed", color: "#c2410c", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                      children: [
                        scoteidSubmittingId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 10, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 10 }),
                        scoteidCredsData?.sandboxMode !== false ? "Test (ScotEID)" : "Submit ScotEID"
                      ]
                    }
                  ) : null;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    bcmsBtn,
                    bcmsPortalBtn,
                    lisPortalBtn,
                    lisBtn,
                    lipBtn,
                    eidcymruBtn,
                    scoteidBtn
                  ] });
                })()
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setExpandedAttachments(expandedAttachments === r.id ? null : r.id),
                    className: `p-1.5 rounded-md hover:bg-black/5 transition-colors ${expandedAttachments === r.id ? "text-primary bg-primary/5" : "text-foreground/50"}`,
                    title: "Attach documents",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setPrintRecord(r),
                    className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary transition-colors",
                    title: "Print movement record",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setViewMovement(r),
                    className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/50 hover:text-primary transition-colors",
                    title: "View",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setDeleteConfirmId(r.id),
                    className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/50 hover:text-red-500 transition-colors",
                    title: "Delete",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] }) })
            ] }),
            expandedAttachments === r.id && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/20 border-b border-border/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AttachmentsPanel, { movementId: r.id, farmId }) }) }, `attach-${r.id}`)
          ] }, r.id)) })
        ] }) }),
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-t border-border text-sm text-foreground/50", children: [
          "Showing ",
          filtered.length,
          " of ",
          records.length,
          " records"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: submitConfirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setSubmitConfirmId(null);
        submitBcmsMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 440 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Submit to BCMS" }) }),
      (() => {
        const r = records.find((m) => m.id === submitConfirmId);
        if (!r) return null;
        const isSandbox = bcmsCredsData?.sandboxMode !== false;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          isSandbox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 14, style: { color: "#92400e", marginTop: 2, flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#92400e", lineHeight: 1.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sandbox mode:" }),
              " This will simulate the CTWS submission and log the XML payload — no data will be sent to BCMS. Go to Farm Settings → BCMS Integration to configure your credentials."
            ] })
          ] }),
          !bcmsConfigured && !isSandbox && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#dc2626" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Not configured:" }),
            " Set up your CTWS credentials in Farm Settings first."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-y-1.5", children: [["Movement", r.movementType.toUpperCase()], ["Date", formatDate(r.movementDate)], ["Species", r.species ?? "—"], ["Animals", String(r.numberOfAnimals ?? "—")], ["From", r.fromLocation ?? "—"], ["To", r.toLocation ?? "—"], ["AML Ref", r.licenceNumber ?? "—"]].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontWeight: 500 }, children: k }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: v })
          ] }, k)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: isSandbox ? "The CTWS XML payload will be logged on the server. Once BDE obtains DEFRA vendor credentials, live submissions will be enabled automatically." : "This will send the movement notification directly to BCMS via CTS Web Services. Ensure the details above are correct before proceeding." })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: submitBcmsMut, message: "BCMS submission failed — nothing was sent." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setSubmitConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "bg-green-800 hover:bg-green-900 text-white",
            disabled: submitBcmsMut.isPending,
            onClick: () => submitConfirmId !== null && submitBcmsMut.mutate(submitConfirmId),
            children: [
              submitBcmsMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14, className: "mr-1" }),
              bcmsCredsData?.sandboxMode !== false ? "Run Sandbox Test" : "Submit to BCMS"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: lisSubmitConfirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setLisSubmitConfirmId(null);
        submitLisMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 440 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Submit to LIS" }) }),
      (() => {
        const r = records.find((m) => m.id === lisSubmitConfirmId);
        if (!r) return null;
        const isSandbox = lisCredsData?.sandboxMode !== false;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          isSandbox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 14, style: { color: "#1d4ed8", marginTop: 2, flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#1d4ed8", lineHeight: 1.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sandbox mode:" }),
              " This will simulate the LIS submission and log the request payload — no data will be sent to the Livestock Information Service. Go to Farm Settings → LIS Integration to configure your credentials."
            ] })
          ] }),
          !lisConfigured && !isSandbox && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#dc2626" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Not configured:" }),
            " Set up your LIS credentials in Farm Settings first."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-y-1.5", children: [["Movement", r.movementType.toUpperCase()], ["Date", formatDate(r.movementDate)], ["Species", r.species ?? "—"], ["Animals", String(r.numberOfAnimals ?? "—")], ["From CPH", r.fromLocation ?? "—"], ["To CPH", r.toLocation ?? "—"], ["Licence Ref", r.licenceNumber ?? "—"]].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontWeight: 500 }, children: k }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: v })
          ] }, k)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: isSandbox ? "The LIS CLA API JSON payload will be logged on the server. Once BDE registers on the LIS Developer Hub and sets a subscription key, live submissions will be enabled automatically." : "This will send the movement notification directly to the Livestock Information Service (LIS) via the CLA API. Sheep/goat/deer movements must be reported within the required timescales." })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: submitLisMut, message: "LIS submission failed — nothing was sent." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setLisSubmitConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "bg-blue-700 hover:bg-blue-800 text-white",
            disabled: submitLisMut.isPending,
            onClick: () => lisSubmitConfirmId !== null && submitLisMut.mutate(lisSubmitConfirmId),
            children: [
              submitLisMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14, className: "mr-1" }),
              lisCredsData?.sandboxMode !== false ? "Run Sandbox Test" : "Submit to LIS"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: bcmsPortalRefId !== null, onOpenChange: (o) => {
      if (!o) {
        setBcmsPortalRefId(null);
        setBcmsPortalRefInput("");
        saveBcmsPortalRefMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record BCMS Reference" }) }),
      (() => {
        const r = records.find((m) => m.id === bcmsPortalRefId);
        if (!r) return null;
        const typeLabel = r.movementType === "birth" ? "birth" : r.movementType === "death" ? "death" : r.movementType === "on" ? "movement ON" : "movement OFF";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 14, style: { color: "#92400e", marginTop: 2, flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: "#92400e", lineHeight: 1.6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Manual BCMS notification required." }),
              " ",
              "The automated CTWS API is not yet active — please submit this ",
              typeLabel,
              " on BCMS Online, then record your confirmation reference here to complete the audit trail.",
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: "https://www.bcms.gov.uk",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: { color: "#1d4ed8", fontWeight: 600, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 }),
                    "  ",
                    "Open BCMS Online (www.bcms.gov.uk)"
                  ]
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-y-1.5", children: [["Event", r.movementType.toUpperCase()], ["Date", formatDate(r.movementDate)], ["Species", r.species ?? "Cattle"], ["Animals", String(r.numberOfAnimals ?? "—")], ["Ear Tags", r.earTagNumbers || "—"]].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontWeight: 500 }, children: k }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: v })
          ] }, k)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "BCMS Online confirmation or document reference ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. CTS-2026-XXXXXXXX or document number",
                value: bcmsPortalRefInput,
                onChange: (e) => setBcmsPortalRefInput(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter" && bcmsPortalRefInput.trim() && bcmsPortalRefId !== null) {
                    saveBcmsPortalRefMut.mutate({ movementId: bcmsPortalRefId, bcmsManualRef: bcmsPortalRefInput });
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280" }, children: "Once saved, this movement will be marked as BCMS notified. The reference will appear in the BCMS Submissions tab and on the movement detail panel." })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveBcmsPortalRefMut, message: "Failed to save — your reference is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setBcmsPortalRefId(null);
          setBcmsPortalRefInput("");
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: !bcmsPortalRefInput.trim() || saveBcmsPortalRefMut.isPending,
            onClick: () => bcmsPortalRefId !== null && saveBcmsPortalRefMut.mutate({ movementId: bcmsPortalRefId, bcmsManualRef: bcmsPortalRefInput }),
            style: { background: "#b45309", color: "white" },
            className: "hover:opacity-90",
            children: [
              saveBcmsPortalRefMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, className: "mr-1" }),
              "Save Reference"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: lisPortalRefId !== null, onOpenChange: (o) => {
      if (!o) {
        setLisPortalRefId(null);
        setLisPortalRefInput("");
        saveLisPortalRefMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record LIS Portal Reference" }) }),
      (() => {
        const r = records.find((m) => m.id === lisPortalRefId);
        if (!r) return null;
        const eventLabel = r.movementType === "birth" ? "birth" : "death";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 14, style: { color: "#92400e", marginTop: 2, flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: "#92400e", lineHeight: 1.6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Action required — LIS keeper portal." }),
              " ",
              "The LIS CLA v1.0 API does not support ",
              eventLabel,
              " registration. You must register this event directly on the LIS keeper portal, then save your confirmation reference here to complete the audit trail.",
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: "https://www.livestockinformation.org.uk",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: { color: "#1d4ed8", fontWeight: 600, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 }),
                    "  ",
                    "Open LIS Keeper Portal (www.livestockinformation.org.uk)"
                  ]
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-y-1.5", children: [["Event", r.movementType.toUpperCase()], ["Date", formatDate(r.movementDate)], ["Species", r.species ?? "—"], ["Animals", String(r.numberOfAnimals ?? "—")], ["Ear Tags", r.earTagNumbers || "—"]].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontWeight: 500 }, children: k }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: v })
          ] }, k)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Confirmation or document reference from the LIS portal ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. CLN-2026-ABC123 or document number",
                value: lisPortalRefInput,
                onChange: (e) => setLisPortalRefInput(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter" && lisPortalRefInput.trim() && lisPortalRefId !== null) {
                    saveLisPortalRefMut.mutate({ movementId: lisPortalRefId, lisManualRef: lisPortalRefInput });
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280" }, children: "Once saved, this movement will be marked as notified and the reference will appear on the movement row and in compliance reports." })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveLisPortalRefMut, message: "Failed to save — your reference is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setLisPortalRefId(null);
          setLisPortalRefInput("");
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: !lisPortalRefInput.trim() || saveLisPortalRefMut.isPending,
            onClick: () => lisPortalRefId !== null && saveLisPortalRefMut.mutate({ movementId: lisPortalRefId, lisManualRef: lisPortalRefInput }),
            style: { background: "#b45309", color: "white" },
            className: "hover:opacity-90",
            children: [
              saveLisPortalRefMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, className: "mr-1" }),
              "Save Reference"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: lisReviewDialog !== null, onOpenChange: (o) => {
      if (!o) {
        setLisReviewDialog(null);
        lisReviewMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 460 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Review Inbound Movement" }) }),
      lisReviewDialog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-y-1.5", children: [
          ["LIS Request ID", String(lisReviewDialog.requestId)],
          ["From CPH", lisReviewDialog.fromCph ?? "—"],
          ["To CPH", lisReviewDialog.toCph ?? "—"],
          ["Animals", String(lisReviewDialog.animalTotal)]
        ].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontWeight: 500 }, children: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: v })
        ] }, k)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Arrival date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "date",
              value: lisReviewArrivalDate,
              onChange: (e) => setLisReviewArrivalDate(e.target.value),
              style: { width: "100%", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.875rem" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Accept" }),
          " to confirm these animals arrived at your holding. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Reject" }),
          " if this movement did not happen at your holding."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: lisReviewMut, message: "LIS review failed — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setLisReviewDialog(null), disabled: lisReviewMut.isPending, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            style: { borderColor: "#fca5a5", color: "#dc2626" },
            disabled: lisReviewMut.isPending || !lisReviewDialog,
            onClick: () => lisReviewDialog && lisReviewMut.mutate({ movId: lisReviewDialog.movId, isAccepted: false, arrivalDate: lisReviewArrivalDate }),
            children: [
              lisReviewMut.isPending && !lisReviewAccepting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13, className: "mr-1" }),
              "Reject"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "bg-green-700 hover:bg-green-800 text-white",
            disabled: lisReviewMut.isPending || !lisReviewDialog || !lisReviewArrivalDate,
            onClick: () => {
              setLisReviewAccepting(true);
              lisReviewDialog && lisReviewMut.mutate({ movId: lisReviewDialog.movId, isAccepted: true, arrivalDate: lisReviewArrivalDate });
            },
            children: [
              lisReviewMut.isPending && lisReviewAccepting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13, className: "mr-1" }),
              "Accept"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: lisUndoConfirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setLisUndoConfirmId(null);
        lisUndoMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Withdraw LIS Transfer Request" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#374151" }, children: [
          "This will send an ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UndoRequest" }),
          " to LIS to withdraw this transfer. The movement will be removed from the holding register."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#dc2626" }, children: "⚠ This cannot be undone once confirmed. Only proceed if this movement was submitted in error." }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: lisUndoMut, message: "Withdrawal failed — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setLisUndoConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "destructive",
            disabled: lisUndoMut.isPending,
            onClick: () => lisUndoConfirmId !== null && lisUndoMut.mutate(lisUndoConfirmId),
            children: [
              lisUndoMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 13, className: "mr-1" }),
              "Withdraw from LIS"
            ]
          }
        )
      ] })
    ] }) }),
    activeTab === "mortality" && /* @__PURE__ */ jsxRuntimeExports.jsx(MortalitySection, { farmId }),
    activeTab === "bcms-submissions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }, children: "BCMS / CTWS Submission History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: "All cattle movement submissions sent (or simulated) via CTS Web Services from this farm." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8 }, children: bcmsCredsData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, background: bcmsCredsData.configured ? "#f0fdf4" : "#f9fafb", border: `1px solid ${bcmsCredsData.configured ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, color: bcmsCredsData.configured ? "#166534" : "#6b7280" }, children: [
          bcmsCredsData.configured ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 13 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 13 }),
          bcmsCredsData.configured ? bcmsCredsData.sandboxMode ? "Sandbox mode" : "Live mode" : "Not configured"
        ] }) })
      ] }),
      idBanner,
      !bcmsConfigured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 16, style: { color: "#92400e", flexShrink: 0, marginTop: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }, children: "CTWS credentials not configured" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f" }, children: [
            "To enable one-click submissions, go to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings → BCMS / CTS One-Click Submission" }),
            " and enter your CTS Web Services username and password. The Submit button will appear on each cattle movement row."
          ] })
        ] })
      ] }),
      bcmsSubmissions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 32, style: { margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No submissions yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af" }, children: 'Use the "Test Submit" button on any cattle movement row to run a sandbox submission test.' })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date & Time", "Movement", "Type", "Status", "Mode", "Reference", "Error", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: bcmsSubmissions.map((s, i) => {
          const mov = records.find((m) => m.id === s.movementId);
          const statusCfg = {
            submitted: { bg: "#dcfce7", color: "#166534" },
            pending: { bg: "#fef3c7", color: "#92400e" },
            failed: { bg: "#fee2e2", color: "#991b1b" }
          };
          const sc = statusCfg[s.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < bcmsSubmissions.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: new Date(s.createdAt).toLocaleDateString("en-GB") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem" }, children: new Date(s.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: mov ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 500 }, children: formatDate(mov.movementDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: [
                mov.species ?? "",
                " · ",
                mov.numberOfAnimals ?? "?",
                " head"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af" }, children: [
              "#",
              s.movementId
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600 }, children: s.submissionType?.replace("_", " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: sc.bg, color: sc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: s.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: s.sandboxMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#92400e", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 10 }),
              "Sandbox"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 10 }),
              "Live"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }, children: s.bcmsReference || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#dc2626", fontSize: "0.75rem", maxWidth: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: s.errorMessage || "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem" }, children: s.status === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => submitBcmsMut.mutate(s.movementId),
                disabled: submitBcmsMut.isPending,
                title: "Retry this submission",
                style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600, cursor: submitBcmsMut.isPending ? "not-allowed" : "pointer", opacity: submitBcmsMut.isPending ? 0.6 : 1, whiteSpace: "nowrap" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 10 }),
                  "Retry"
                ]
              }
            ) })
          ] }, s.id);
        }) })
      ] }) })
    ] }),
    activeTab === "lis-submissions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }, children: "LIS Submission History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: "All sheep, goat and deer movement submissions sent (or simulated) via the Livestock Information Service CLA API from this farm." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
          lisConfigured && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => lisSyncMut.mutate(),
              disabled: lisSyncMut.isPending,
              style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, color: "#15803d", cursor: "pointer" },
              children: [
                lisSyncMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13 }),
                "Sync from LIS"
              ]
            }
          ),
          lisCredsData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, background: lisCredsData.configured ? "#eff6ff" : "#f9fafb", border: `1px solid ${lisCredsData.configured ? "#bfdbfe" : "#e5e7eb"}`, borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, color: lisCredsData.configured ? "#1d4ed8" : "#6b7280" }, children: [
            lisCredsData.configured ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 13 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 13 }),
            lisCredsData.configured ? lisCredsData.sandboxMode ? "Sandbox mode" : "Live mode" : "Not configured"
          ] })
        ] })
      ] }),
      idBanner,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setLisSubTab("outbound"), style: { padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, border: "none", background: "none", cursor: "pointer", borderBottom: lisSubTab === "outbound" ? "2px solid #1d4ed8" : "2px solid transparent", color: lisSubTab === "outbound" ? "#1d4ed8" : "#6b7280", marginBottom: -2 }, children: [
          "Outbound (",
          lisSubmissions.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setLisSubTab("inbound"), style: { padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, border: "none", background: "none", cursor: "pointer", borderBottom: lisSubTab === "inbound" ? "2px solid #1d4ed8" : "2px solid transparent", color: lisSubTab === "inbound" ? "#1d4ed8" : "#6b7280", marginBottom: -2, display: "inline-flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { size: 13 }),
          "Inbound",
          lisInbound.length > 0 ? ` (${lisInbound.length})` : ""
        ] })
      ] }),
      lisSubTab === "outbound" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        !lisConfigured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 16, style: { color: "#1d4ed8", flexShrink: 0, marginTop: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", fontWeight: 600, color: "#1d4ed8", marginBottom: 4 }, children: "LIS credentials not configured" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#1e40af" }, children: [
              "To enable one-click submissions for sheep, goat and deer movements, go to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings → LIS Integration" }),
              " and enter your LIS username and password. The Submit button will appear on each eligible movement row."
            ] })
          ] })
        ] }),
        lisConfigured && lisCredsData?.tokenScopeMismatch && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, style: { color: "#92400e", flexShrink: 0, marginTop: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }, children: "LIS re-authorisation required" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f", lineHeight: 1.5 }, children: [
              "Your LIS account was connected under the sandbox environment. BDE Farm Trac now submits to the ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "production" }),
              " Livestock Information Service — please go to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings → LIS Integration" }),
              " and click ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Re-sign in with LIS" }),
              " to refresh your sign-in. Submissions will remain queued until you re-connect."
            ] })
          ] })
        ] }),
        lisUnreported.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, style: { color: "#92400e", flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.85rem", fontWeight: 700, color: "#92400e", margin: 0 }, children: [
              lisUnreported.length,
              " movement",
              lisUnreported.length !== 1 ? "s" : "",
              " not yet reported to LIS"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#78350f", marginBottom: 10 }, children: "These sheep, goat or deer movements have no LIS submission reference and have not been marked as notified. UK law requires notification within 3 days for most movements." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "rgba(0,0,0,0.05)" }, children: ["Date", "Type", "Species", "Animals", "From → To", "Days Old"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "4px 8px", textAlign: "left", fontWeight: 600, color: "#78350f", whiteSpace: "nowrap" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lisUnreported.map((m, i) => {
              const age = daysSince(m.movementDate);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid rgba(0,0,0,0.07)" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f", whiteSpace: "nowrap" }, children: formatDate(m.movementDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f", textTransform: "capitalize" }, children: m.movementType }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f", textTransform: "capitalize" }, children: m.species }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f" }, children: m.numberOfAnimals ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f" }, children: [m.fromLocation, m.toLocation].filter(Boolean).join(" → ") || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "3px 8px", fontWeight: 700, color: age > 3 ? "#dc2626" : "#92400e" }, children: [
                  age,
                  "d",
                  age > 3 ? " ⚠" : ""
                ] })
              ] }, m.id);
            }) })
          ] })
        ] }),
        lisSubmissions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 32, style: { margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No LIS submissions yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af" }, children: 'Use the "Test Submit (LIS)" button on any sheep, goat or deer movement row to run a sandbox submission test.' })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date & Time", "Movement", "Species", "Type", "Status", "Mode", "LIS Reference", "Error"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lisSubmissions.map((s, i) => {
            const mov = records.find((m) => m.id === s.movementId);
            const statusCfg = {
              submitted: { bg: "#dcfce7", color: "#166534" },
              pending: { bg: "#fef3c7", color: "#92400e" },
              failed: { bg: "#fee2e2", color: "#991b1b" }
            };
            const sc = statusCfg[s.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < lisSubmissions.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: new Date(s.submittedAt).toLocaleDateString("en-GB") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem" }, children: new Date(s.submittedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: mov ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 500 }, children: formatDate(mov.movementDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: [
                  mov.numberOfAnimals ?? "?",
                  " head"
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af" }, children: [
                "#",
                s.movementId
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151", fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }, children: s.species ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600 }, children: s.submissionType?.replace("_", " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: sc.bg, color: sc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: s.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: s.sandboxMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 10 }),
                "Sandbox"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 10 }),
                "Live"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }, children: s.lisReference || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#dc2626", fontSize: "0.75rem", maxWidth: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: s.errorMessage || "—" }) })
            ] }, s.id);
          }) })
        ] }) })
      ] }),
      lisSubTab === "inbound" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        lisInbound.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { size: 32, style: { margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No inbound movements pending review" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af" }, children: lisConfigured ? 'Use "Sync from LIS" to fetch movements that other keepers have submitted to your holding.' : "Configure LIS credentials in Farm Settings, then sync to see inbound movements from other keepers." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#eff6ff", borderBottom: "1px solid #bfdbfe", padding: "10px 16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#1e40af", margin: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              lisInbound.length,
              " movement",
              lisInbound.length !== 1 ? "s" : ""
            ] }),
            " submitted by other keepers are waiting for your review. Accept to confirm animals arrived, or reject if the movement didn't happen."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Movement Date", "Species", "Animals", "From CPH", "To CPH", "LIS Ref", "Action"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lisInbound.map((m, i) => {
              const raw = m.lisRawData;
              const requestId = Number(raw?.requestId ?? raw?.id ?? raw?.reviewId ?? 0);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < lisInbound.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151", whiteSpace: "nowrap" }, children: formatDate(m.movementDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151", textTransform: "capitalize" }, children: m.species ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151" }, children: m.numberOfAnimals ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#6b7280" }, children: m.fromLocation ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#6b7280" }, children: m.toLocation ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }, children: m.lisMovementRef?.replace("movement_review:", "") ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: requestId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => {
                      setLisReviewArrivalDate(m.movementDate ? new Date(m.movementDate).toISOString().slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
                      setLisReviewDialog({ movId: m.id, requestId, holding: m.toLocation ?? "", animalTotal: m.numberOfAnimals ?? 1, fromCph: m.fromLocation, toCph: m.toLocation, date: m.movementDate ?? "" });
                    },
                    style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: "0.76rem", fontWeight: 600, cursor: "pointer" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { size: 12 }),
                      " Review"
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: "Sync to review" }) })
              ] }, m.id);
            }) })
          ] })
        ] }),
        (() => {
          const undoable = records.filter((r) => r.lisSource === "transfer_request" && r.lisMovementRef);
          if (undoable.length === 0) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "1.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }, children: "Synced outbound transfers (undo available)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Species", "Animals", "From → To", "LIS Ref", "Action"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: undoable.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < undoable.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: "#374151", whiteSpace: "nowrap" }, children: formatDate(m.movementDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: "#374151", textTransform: "capitalize" }, children: m.species ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: "#374151" }, children: m.numberOfAnimals ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }, children: [m.fromLocation, m.toLocation].filter(Boolean).join(" → ") || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", fontFamily: "monospace", fontSize: "0.74rem", color: "#374151" }, children: m.lisMovementRef?.replace("transfer_request:", "") ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setLisUndoConfirmId(m.id),
                    style: { display: "inline-flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid #fca5a5", borderRadius: 7, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, color: "#dc2626", cursor: "pointer" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 11 }),
                      " Undo"
                    ]
                  }
                ) })
              ] }, m.id)) })
            ] }) })
          ] });
        })()
      ] })
    ] }),
    activeTab === "lip-submissions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }, children: "LIP Submission History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: "All cattle movement, birth and death notifications submitted (or logged in sandbox) via the LIS LIP API from this farm." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8 }, children: lipCredsData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, color: "#92400e" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13 }),
          "Service paused"
        ] }) })
      ] }),
      idBanner,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, style: { color: "#92400e", flexShrink: 0, marginTop: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", fontWeight: 700, color: "#92400e", marginBottom: 4 }, children: "LIS Cattle API — Temporarily Paused from 21 July 2026" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f", lineHeight: 1.5 }, children: [
            "The Livestock Information Service has confirmed that LIP Cattle API submissions are temporarily paused while cattle traceability services transition to a new Defra-operated service. ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "New cattle submissions via LIP cannot be made at this time." }),
            " Existing submission records below are preserved for audit purposes. Please continue reporting cattle movements via ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BCMS (CTS Web Services)" }),
            " as usual. LIS will provide further guidance in September/October 2026."
          ] })
        ] })
      ] }),
      !lipConfigured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f5f3ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 16, style: { color: "#6d28d9", flexShrink: 0, marginTop: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", fontWeight: 600, color: "#6d28d9", marginBottom: 4 }, children: "LIP account not connected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#5b21b6" }, children: [
            "LIS Cattle API submissions are temporarily paused from 21 July 2026 while LIS transitions cattle traceability services. New connections are not available at this time. Please report cattle movements via ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BCMS (CTS Web Services)" }),
            " in the meantime."
          ] })
        ] })
      ] }),
      lipUnreported.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, style: { color: "#92400e", flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.85rem", fontWeight: 700, color: "#92400e", margin: 0 }, children: [
            lipUnreported.length,
            " cattle movement",
            lipUnreported.length !== 1 ? "s" : "",
            " not yet reported to BCMS / LIP"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#78350f", marginBottom: 10 }, children: "These on/off-farm cattle movements have no submission reference and have not been marked as notified. BCMS requires cattle movement notification within 3 days of the move (or within 3 days of the animal arriving on your holding for births/acquisitions)." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "rgba(0,0,0,0.05)" }, children: ["Date", "Type", "Animals", "From → To", "Days Old"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "4px 8px", textAlign: "left", fontWeight: 600, color: "#78350f", whiteSpace: "nowrap" }, children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lipUnreported.map((m, i) => {
            const age = daysSince(m.movementDate);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid rgba(0,0,0,0.07)" : "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f", whiteSpace: "nowrap" }, children: formatDate(m.movementDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f", textTransform: "capitalize" }, children: m.movementType }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f" }, children: m.numberOfAnimals ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 8px", color: "#78350f" }, children: [m.fromLocation, m.toLocation].filter(Boolean).join(" → ") || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "3px 8px", fontWeight: 700, color: age > 3 ? "#dc2626" : "#92400e" }, children: [
                age,
                "d",
                age > 3 ? " ⚠" : ""
              ] })
            ] }, m.id);
          }) })
        ] })
      ] }),
      lipSubmissions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 32, style: { margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No LIP submissions yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af" }, children: "LIS Cattle API submissions are temporarily paused. Please report cattle movements via BCMS (CTS Web Services) in the meantime. Submission history will appear here once the LIS service resumes." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date & Time", "Record", "Type", "Status", "Mode", "LIP Reference", "Error", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lipSubmissions.map((s, i) => {
          const mov = records.find((m) => m.id === s.movementId);
          const statusCfg = {
            submitted: { bg: "#dcfce7", color: "#166534" },
            acknowledged: { bg: "#dcfce7", color: "#166534" },
            pending: { bg: "#fef3c7", color: "#92400e" },
            "async-pending": { bg: "#ede9fe", color: "#5b21b6" },
            failed: { bg: "#fee2e2", color: "#991b1b" }
          };
          const sc = statusCfg[s.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < lipSubmissions.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: new Date(s.createdAt).toLocaleDateString("en-GB") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem" }, children: new Date(s.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: s.submissionType === "movement" && mov ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 500 }, children: formatDate(mov.movementDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: [
                mov.numberOfAnimals ?? "?",
                " head · ",
                mov.movementType?.toUpperCase()
              ] })
            ] }) : s.submissionType === "death" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
              "Mortality #",
              s.mortalityId
            ] }) : s.submissionType === "birth" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
              "Calving #",
              s.calvingId
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af" }, children: [
              "#",
              s.movementId ?? s.mortalityId ?? s.calvingId
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#374151", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600 }, children: s.submissionType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: sc.bg, color: sc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: s.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: s.sandboxMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#f5f3ff", color: "#6d28d9", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 10 }),
              "Sandbox"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 10 }),
              "Live"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }, children: s.lipReference || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#dc2626", fontSize: "0.75rem", maxWidth: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: s.errorMessage || "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem" }, children: [
              s.submissionType === "movement" && s.lipReference && s.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, flexWrap: "nowrap" }, children: [
                s.status !== "confirmed" && s.confirmedAction !== "accept" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setLipActionDialog({ type: "confirm", submissionId: s.id, lipReference: s.lipReference }),
                    style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                    children: "Accept"
                  }
                ),
                s.status !== "rejected" && s.confirmedAction !== "reject" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setLipActionDialog({ type: "reject", submissionId: s.id, lipReference: s.lipReference }),
                    style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                    children: "Reject"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setLipActionDialog({ type: "cancel", submissionId: s.id, lipReference: s.lipReference }),
                    style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                    children: "Cancel"
                  }
                )
              ] }),
              s.status === "async-pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  disabled: checkAsyncMut.isPending && checkAsyncMut.variables === s.id,
                  onClick: () => checkAsyncMut.mutate(s.id),
                  style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #ddd6fe", background: "#f5f3ff", color: "#5b21b6", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
                  children: [
                    checkAsyncMut.isPending && checkAsyncMut.variables === s.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 10, className: "animate-spin" }) : null,
                    "Check Status"
                  ]
                }
              )
            ] })
          ] }, s.id);
        }) })
      ] }) })
    ] }),
    activeTab === "lip-lost-found" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }, children: "Lost & Found — LIP Notifications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: "Report lost, found or stolen cattle to the Livestock Information Platform. All reports are logged regardless of submission status." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => {
              setShowLostFoundForm(true);
              setLostFoundEditId(null);
              setLostFoundForm({ earTag: "", status: "lost", eventDate: "", crimeReferenceNumber: "", foundDead: false, notes: "" });
            },
            style: { background: "#6d28d9", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
              " Report Animal"
            ]
          }
        )
      ] }),
      showLostFoundForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { fontWeight: 600, color: "#1f2937" }, children: lostFoundEditId ? "Edit Record" : "Report Lost / Found Animal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setShowLostFoundForm(false);
            setLostFoundEditId(null);
          }, style: { background: "none", border: "none", cursor: "pointer", color: "#6b7280" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Ear Tag *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: lostFoundForm.earTag,
                onChange: (e) => setLostFoundForm((f) => ({ ...f, earTag: e.target.value })),
                placeholder: "e.g. UK123456 789012",
                style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Status *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: lostFoundForm.status,
                onChange: (e) => setLostFoundForm((f) => ({ ...f, status: e.target.value })),
                style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lost", children: "Lost" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "found", children: "Found" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "stolen", children: "Stolen" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Event Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: lostFoundForm.eventDate,
                onChange: (e) => setLostFoundForm((f) => ({ ...f, eventDate: e.target.value })),
                style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
              "Crime Reference No. ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#9ca3af" }, children: "(theft only)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: lostFoundForm.crimeReferenceNumber,
                onChange: (e) => setLostFoundForm((f) => ({ ...f, crimeReferenceNumber: e.target.value })),
                placeholder: "Police crime reference",
                style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                id: "foundDead",
                checked: lostFoundForm.foundDead,
                onChange: (e) => setLostFoundForm((f) => ({ ...f, foundDead: e.target.checked })),
                style: { width: 16, height: 16 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "foundDead", style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151" }, children: "Animal found dead" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "span 2" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: lostFoundForm.notes,
                onChange: (e) => setLostFoundForm((f) => ({ ...f, notes: e.target.value })),
                placeholder: "Additional details...",
                rows: 2,
                style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem" }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginTop: "1rem", justifyContent: "flex-end" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setShowLostFoundForm(false);
                setLostFoundEditId(null);
              },
              style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "7px 16px", fontSize: "0.875rem", cursor: "pointer" },
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              disabled: saveLostFoundMut.isPending || !lostFoundForm.earTag || !lostFoundForm.status || !lostFoundForm.eventDate,
              onClick: () => saveLostFoundMut.mutate({
                id: lostFoundEditId ?? void 0,
                body: {
                  earTag: lostFoundForm.earTag.trim(),
                  status: lostFoundForm.status,
                  eventDate: lostFoundForm.eventDate,
                  crimeReferenceNumber: lostFoundForm.crimeReferenceNumber || void 0,
                  foundDead: lostFoundForm.foundDead || void 0,
                  notes: lostFoundForm.notes || void 0,
                  submitToLip: lipConfigured && !lostFoundEditId
                }
              }),
              style: { background: "#6d28d9", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: "0.875rem", cursor: "pointer", fontWeight: 600 },
              children: saveLostFoundMut.isPending ? "Saving…" : lipConfigured && !lostFoundEditId ? "Save & Submit to LIP" : "Save Record"
            }
          )
        ] })
      ] }),
      lostFoundRecords.length === 0 && !showLostFoundForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 32, style: { margin: "0 auto 12px", opacity: 0.3, color: "#6b7280" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No lost & found reports" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af" }, children: "Use this section to report any cattle that are missing, found straying, or stolen. Reports are submitted to the LIP API." })
      ] }) : lostFoundRecords.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Ear Tag", "Status", "LIP Status", "Reference", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lostFoundRecords.map((r, i) => {
          const statusColors = {
            lost: { bg: "#fef3c7", color: "#92400e" },
            found: { bg: "#dcfce7", color: "#166534" },
            stolen: { bg: "#fee2e2", color: "#991b1b" }
          };
          const lipStatusColors = {
            submitted: { bg: "#dcfce7", color: "#166534" },
            pending: { bg: "#f3f4f6", color: "#6b7280" },
            failed: { bg: "#fee2e2", color: "#991b1b" }
          };
          const sc = statusColors[r.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
          const lc = lipStatusColors[r.lipStatus] ?? { bg: "#f3f4f6", color: "#6b7280" };
          const isViewMode = lostFoundViewId === r.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: isViewMode ? "#faf5ff" : void 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280", fontSize: "0.8rem" }, children: r.eventDate ? new Date(r.eventDate).toLocaleDateString("en-GB") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600, fontFamily: "monospace", fontSize: "0.8rem" }, children: r.earTag }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: sc.bg, color: sc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize" }, children: r.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: lc.bg, color: lc.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize" }, children: r.lipStatus }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#374151" }, children: r.lipReference || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem", maxWidth: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.notes || "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setLostFoundViewId(isViewMode ? null : r.id),
                    title: isViewMode ? "Close" : "View",
                    style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #e5e7eb", background: isViewMode ? "#f3f4f6" : "#f9fafb", color: "#374151", cursor: "pointer" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 11 })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      setLostFoundEditId(r.id);
                      setLostFoundForm({ earTag: r.earTag, status: r.status, eventDate: r.eventDate ?? "", crimeReferenceNumber: r.crimeReferenceNumber ?? "", foundDead: r.foundDead ?? false, notes: r.notes ?? "" });
                      setShowLostFoundForm(true);
                    },
                    title: "Edit",
                    style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", padding: "2px 7px", borderRadius: 5, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", cursor: "pointer" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 11 })
                  }
                )
              ] }) })
            ] }),
            isViewMode && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, style: { padding: "0.875rem 1.25rem", background: "#faf5ff", borderBottom: "1px solid #e5e7eb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem 1.5rem", fontSize: "0.82rem" }, children: [
              [
                ["Ear Tag", r.earTag],
                ["Status", r.status],
                ["Event Date", r.eventDate ? new Date(r.eventDate).toLocaleDateString("en-GB") : "—"],
                ["Crime Ref.", r.crimeReferenceNumber || "—"],
                ["Found Dead", r.foundDead ? "Yes" : "No"],
                ["LIP Reference", r.lipReference || "—"],
                ["LIP Status", r.lipStatus],
                ["Sandbox", r.sandboxMode ? "Yes" : "No"],
                ["Reported", new Date(r.createdAt).toLocaleDateString("en-GB")]
              ].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280", fontWeight: 500 }, children: [
                  k,
                  ": "
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: "#1f2937" }, children: v })
              ] }, k)),
              r.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "span 3" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontWeight: 500 }, children: "Notes: " }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#1f2937" }, children: r.notes })
              ] }),
              r.errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "span 3" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#dc2626", fontWeight: 500 }, children: "Error: " }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#dc2626" }, children: r.errorMessage })
              ] }),
              lipConfigured && r.lipStatus === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { gridColumn: "span 3", marginTop: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  disabled: saveLostFoundMut.isPending,
                  onClick: () => saveLostFoundMut.mutate({ body: { earTag: r.earTag, status: r.status, eventDate: r.eventDate, crimeReferenceNumber: r.crimeReferenceNumber, foundDead: r.foundDead, notes: r.notes, submitToLip: true } }),
                  style: { background: "#6d28d9", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 },
                  children: "Re-submit to LIP"
                }
              ) })
            ] }) }) })
          ] }, r.id);
        }) })
      ] }) }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: lipSubmitConfirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setLipSubmitConfirmId(null);
        submitLipMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Submit to LIS LIP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          (() => {
            const r = records.find((m) => m.id === lipSubmitConfirmId);
            if (!r) return "Submit this cattle movement notification to the LIS Livestock Information Platform.";
            return `Submit the ${r.movementType?.toUpperCase()} movement of ${r.numberOfAnimals ?? "?"} cattle on ${formatDate(r.movementDate)} to LIS LIP for regulatory notification.`;
          })(),
          lipCredsData?.sandboxMode !== false && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block mt-2 text-amber-700 text-xs font-medium", children: "Running in sandbox mode — payload will be logged but not sent to LIP until subscription is approved." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: submitLipMut, message: "LIP submission failed — nothing was sent." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setLipSubmitConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: submitLipMut.isPending,
            onClick: () => lipSubmitConfirmId !== null && submitLipMut.mutate(lipSubmitConfirmId),
            style: { background: "#6d28d9", color: "#fff" },
            children: submitLipMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }),
              "Submitting…"
            ] }) : "Submit to LIP"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: lipActionDialog?.type === "confirm" || lipActionDialog?.type === "reject", onOpenChange: (o) => {
      if (!o) {
        setLipActionDialog(null);
        setLipActionReason("");
        setLipRejectionReasonId("");
        confirmLipMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: lipActionDialog?.type === "confirm" ? "Accept Movement" : "Reject Movement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: lipActionDialog?.type === "confirm" ? `Accept movement ${lipActionDialog.lipReference} as confirmed at the receiving holding.` : `Reject movement ${lipActionDialog?.lipReference}. Select a reason from the list.` })
      ] }),
      lipActionDialog?.type === "reject" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0 0 8px", display: "flex", flexDirection: "column", gap: 10 }, children: [
        lipRejectionReasons.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Rejection Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lipRejectionReasonId,
              onChange: (e) => setLipRejectionReasonId(e.target.value),
              style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: "0.875rem", background: "#fff" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select a reason —" }),
                lipRejectionReasons.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r.rejectionReasonId, children: r.rejectionReason }, r.rejectionReasonId))
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Rejection Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: lipActionReason,
              onChange: (e) => setLipActionReason(e.target.value),
              placeholder: "Describe why this movement is being rejected",
              rows: 3,
              style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: "0.875rem" }
            }
          )
        ] }),
        lipRejectionReasonId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Additional Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: lipActionReason,
              onChange: (e) => setLipActionReason(e.target.value),
              placeholder: "Any additional notes",
              rows: 2,
              style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: "0.875rem" }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: confirmLipMut, message: "Action failed — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setLipActionDialog(null);
          setLipActionReason("");
          setLipRejectionReasonId("");
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: confirmLipMut.isPending,
            onClick: () => {
              if (!lipActionDialog) return;
              confirmLipMut.mutate({
                submissionId: lipActionDialog.submissionId,
                lipReference: lipActionDialog.lipReference,
                action: lipActionDialog.type === "confirm" ? "accept" : "reject",
                rejectionReason: lipActionReason || void 0,
                rejectionReasonId: lipRejectionReasonId || void 0
              });
            },
            style: { background: lipActionDialog?.type === "confirm" ? "#166534" : "#991b1b", color: "#fff" },
            children: [
              confirmLipMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : null,
              lipActionDialog?.type === "confirm" ? "Confirm Accept" : "Confirm Reject"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: lipActionDialog?.type === "cancel", onOpenChange: (o) => {
      if (!o) {
        setLipActionDialog(null);
        cancelLipMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cancel Movement Notification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "This will send a cancellation request to LIP for movement reference ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: lipActionDialog?.lipReference }),
          ". The original submission will be marked as cancelled. This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: cancelLipMut, message: "Cancellation failed — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setLipActionDialog(null), children: "Go Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: cancelLipMut.isPending,
            onClick: () => {
              if (!lipActionDialog) return;
              cancelLipMut.mutate({ submissionId: lipActionDialog.submissionId, lipReference: lipActionDialog.lipReference });
            },
            variant: "destructive",
            children: [
              cancelLipMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : null,
              "Cancel Notification"
            ]
          }
        )
      ] })
    ] }) }),
    activeTab === "eidcymru-submissions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }, children: "EIDCymru — Wales Sheep & Goat Submissions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: [
            "Sheep and goat movement notifications submitted to EIDCymru on behalf of this Wales holding.",
            eidcymruCredsData?.sandboxMode !== false && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 8, color: "#b45309", fontWeight: 600 }, children: "⚠ Staging service — real test requests go to stagews.eidcymru.org" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => refetchEidcymruSubmissions(), children: "Refresh" })
      ] }),
      !eidcymruConfigured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "EIDCymru not configured." }),
        " Go to Farm Settings and enter the keeper credentials plus the EIDCymru-registered application name and version."
      ] }),
      eidcymruSubmissions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 0", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, marginBottom: 4 }, children: "No EIDCymru submissions yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem" }, children: "Use the EIDCymru button on an eligible sheep or goat on/off movement to submit it." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "2px solid #e5e7eb", textAlign: "left" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Notes" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: eidcymruSubmissions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151" }, children: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-GB") : new Date(s.createdAt).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", textTransform: "capitalize" }, children: s.submissionType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: "0.75rem",
            fontWeight: 600,
            background: s.status === "submitted" ? "#d1fae5" : s.status === "failed" ? "#fee2e2" : "#fef3c7",
            color: s.status === "submitted" ? "#065f46" : s.status === "failed" ? "#991b1b" : "#92400e"
          }, children: s.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontFamily: "monospace", fontSize: "0.78rem" }, children: s.eidcymruReference ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", padding: "1px 6px", borderRadius: 999, background: s.sandboxMode ? "#fef3c7" : "#d1fae5", color: s.sandboxMode ? "#92400e" : "#065f46" }, children: s.sandboxMode ? "Sandbox" : "Live" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.78rem", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: s.errorMessage ?? "" })
        ] }, s.id)) })
      ] }) })
    ] }),
    activeTab === "scoteid-submissions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "1rem", fontWeight: 600, color: "#1f2937", marginBottom: 2 }, children: "ScotEID — Scotland Livestock Submissions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: [
            "All-species movement notifications submitted to ScotEID on behalf of this Scotland holding.",
            scoteidCredsData?.sandboxMode !== false && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 8, color: "#b45309", fontWeight: 600 }, children: "⚠ Sandbox mode — submissions are simulated (SCOTEID_API_KEY not configured)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => refetchScoteidSubmissions(), children: "Refresh" })
      ] }),
      !scoteidConfigured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ScotEID not configured." }),
        " Go to Farm Settings → Integrations to enter your ScotEID holding number. In sandbox mode all submissions are simulated automatically."
      ] }),
      scoteidSubmissions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 0", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, marginBottom: 4 }, children: "No ScotEID submissions yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem" }, children: 'Use the "Test (ScotEID)" button on a movement to submit it.' })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "2px solid #e5e7eb", textAlign: "left" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", fontWeight: 600, color: "#374151" }, children: "Notes" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: scoteidSubmissions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151" }, children: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-GB") : new Date(s.createdAt).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", textTransform: "capitalize" }, children: s.submissionType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: "0.75rem",
            fontWeight: 600,
            background: s.status === "submitted" ? "#d1fae5" : s.status === "failed" ? "#fee2e2" : "#fef3c7",
            color: s.status === "submitted" ? "#065f46" : s.status === "failed" ? "#991b1b" : "#92400e"
          }, children: s.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontFamily: "monospace", fontSize: "0.78rem" }, children: s.scoteidReference ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", padding: "1px 6px", borderRadius: 999, background: s.sandboxMode ? "#fef3c7" : "#d1fae5", color: s.sandboxMode ? "#92400e" : "#065f46" }, children: s.sandboxMode ? "Sandbox" : "Live" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.78rem", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: s.errorMessage ?? "" })
        ] }, s.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: eidcymruSubmitConfirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setEidcymruSubmitConfirmId(null);
        submitEidcymruMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Submit to EIDCymru" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: eidcymruCredsData?.sandboxMode !== false ? "This sends a real test SOAP request to EIDCymru’s staging service. It will not use the production EIDCymru endpoint." : "This will submit the movement notification to the live EIDCymru service on behalf of this holding." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: submitEidcymruMut, message: "EIDCymru submission failed — nothing was sent." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEidcymruSubmitConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: submitEidcymruMut.isPending,
            onClick: () => {
              if (eidcymruSubmitConfirmId) submitEidcymruMut.mutate(eidcymruSubmitConfirmId);
            },
            style: { background: "#166534", color: "#fff" },
            children: [
              submitEidcymruMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : null,
              eidcymruCredsData?.sandboxMode !== false ? "Submit to EIDCymru staging" : "Submit to EIDCymru"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: scoteidSubmitConfirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setScoteidSubmitConfirmId(null);
        submitScoteidMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Submit to ScotEID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: scoteidCredsData?.sandboxMode !== false ? "ScotEID is in sandbox mode. This will log a simulated submission without contacting the live ScotEID service." : "This will submit the movement notification to the live ScotEID service on behalf of this holding." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: submitScoteidMut, message: "ScotEID submission failed — nothing was sent." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setScoteidSubmitConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: submitScoteidMut.isPending,
            onClick: () => {
              if (scoteidSubmitConfirmId) submitScoteidMut.mutate(scoteidSubmitConfirmId);
            },
            style: { background: "#c2410c", color: "#fff" },
            children: [
              submitScoteidMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : null,
              scoteidCredsData?.sandboxMode !== false ? "Test Submit (Sandbox)" : "Submit to ScotEID"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  Movements as default
};
