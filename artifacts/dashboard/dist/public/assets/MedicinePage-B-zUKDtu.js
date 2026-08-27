import { b as useAppStore, j as jsxRuntimeExports, R as Redirect, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, d as Button, I as Input, T as Plus, e as LoaderCircle, n as Card, o as CardContent, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, H as DialogDescription, N as DialogMutationError, J as DialogFooter, O as React, X } from "./index-CDukCNha.js";
import { p as printProReport } from "./print-report-ClU8-1P0.js";
import { C as CropYearSelector } from "./CropYearSelector-DaSxqP5T.js";
import { c as currentCropYear, i as isInCropYear } from "./cropYear-Dmv-iNR6.js";
import { u as usePersistedTab } from "./use-persisted-tab-DkF_8yn6.js";
import { u as usePersistedNumberFilter } from "./use-persisted-filter-BlZwb5ik.js";
import { A as AppLayout, H as HeartPulse, c as ClipboardList, U as Users, I as Info } from "./AppLayout-CcF0mXKK.js";
import { T as TabBar, a as TabButton } from "./tab-button-D812vHXK.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Dkg4sueF.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-DrkwfBM4.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-C2WN5o9s.js";
import { V as VMD_MEDICINES, f as findVmdMedicine, D as DOSE_UNITS } from "./vmdMedicines-mq70NSvP.js";
import { T as TriangleAlert } from "./triangle-alert-CbSmXkg4.js";
import { C as CircleCheck } from "./circle-check-DeOzX17T.js";
import { C as CircleX } from "./circle-x-Cdq0zJF4.js";
import { S as ShieldCheck } from "./shield-check-SpObG-tw.js";
import { P as Pencil } from "./pencil-iIMUFqn7.js";
import { S as Search } from "./search-DlmD2G34.js";
import { H as History } from "./history-DojMKb26.js";
import { P as Printer } from "./printer-C46G2sGo.js";
import { T as Tag } from "./tag-Dkj9kqj5.js";
import { U as User } from "./user-QsVpoikF.js";
import { B as BadgeCheck } from "./badge-check-D6bY0RuC.js";
import { S as ShieldAlert } from "./shield-alert-BdARTvO8.js";
import { R as ResponsiveContainer, C as Cell, T as Tooltip, L as Legend, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-DJlHKV9g.js";
import { P as PieChart, a as Pie } from "./PieChart-BwK-OeSj.js";
import { B as BarChart } from "./BarChart-DBa6Utrl.js";
import { C as CartesianGrid } from "./CartesianGrid-BkS4Udbr.js";
import { E as Eye } from "./eye-2zMV_Yik.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-Cmi2RjiA.js";
import { C as ChevronUp } from "./chevron-up-DbU10X3h.js";
import { a as Clock } from "./database-CCTTbwNA.js";
import { R as RefreshCw } from "./refresh-cw-DplNvk2q.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-DYMHxbFA.js";
import "./use-safe-clerk-DFK3tOiq.js";
import "./tractor-DBLqaPPG.js";
import "./index-BVVHEFnd.js";
import "./index-BHuKXUMm.js";
import "./textarea-DIvtomjZ.js";
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
function addDays(dateStr, days) {
  if (!dateStr || !days) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 864e5);
}
function isInWithdrawal(endDate) {
  if (!endDate) return false;
  return daysUntil(endDate) !== null && daysUntil(endDate) >= 0;
}
function getRecordStatus(r) {
  if (!r.withdrawalPeriodDays) return "no_withdrawal";
  if (isInWithdrawal(r.withdrawalEndDate)) return "in_withdrawal";
  return "cleared";
}
function normalizeTag(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
function lookupAnimalByTag(tag, pool) {
  if (!tag) return null;
  const t = tag.toLowerCase();
  return pool.find(
    (a) => a.earTagNumber?.toLowerCase() === t || a.tagNumber?.toLowerCase() === t
  ) ?? null;
}
function animalShortLabel(a) {
  return [a.earTagNumber ?? a.tagNumber, a.breed, a.species].filter(Boolean).join(" · ");
}
const EMPTY_FORM = {
  treatmentScope: "whole_herd",
  animalId: "",
  herdId: "",
  treatedAnimalCount: "",
  treatedAnimalTags: "",
  medicineName: "",
  batchNumber: "",
  dosage: "",
  doseAmount: "",
  doseUnit: "ml",
  administrationRoute: "",
  administeredBy: "",
  administeredDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  withdrawalPeriodDays: "",
  reason: "",
  vetName: "",
  notes: "",
  // organic compliance — auto-populated when herd is organic
  isOrganicTreatment: false,
  doubledWithdrawalDays: "",
  certifierNotified: false,
  certifierNotifiedDate: "",
  // prescription link — optional FK to vet_prescription_records
  prescriptionId: "",
  // Adverse Drug Reaction (VMR 2013 Reg 58 / SARSS)
  adverseReactionSuspected: false,
  adverseReactionSigns: "",
  adverseReactionSeverity: "",
  adverseReactionOnsetHours: "",
  adverseReactionOutcome: "",
  reportedToVetDate: "",
  vetReportedToVmdDate: "",
  vmdSarssRef: "",
  // Stock register linkage — deducts from stock_levels when stockItemId provided
  stockItemId: "",
  stockQuantityUsed: ""
};
const ADMIN_ROUTES = ["Oral", "Subcutaneous injection", "Intramuscular injection", "Intravenous injection", "Intramammary", "Topical / Pour-on", "Intrauterine", "Ocular", "Nasal", "Other"];
function PrescriptionCombobox({
  prescriptions,
  value,
  onChange
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const inputRef = reactExports.useRef(null);
  const selected = value ? prescriptions.find((p) => p.id === Number(value)) : null;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  function isExpired(p) {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < today;
  }
  const filtered = reactExports.useMemo(() => {
    const q = query.toLowerCase().trim();
    const matches = q ? prescriptions.filter(
      (p) => (p.productName ?? "").toLowerCase().includes(q) || (p.prescriptionRef ?? "").toLowerCase().includes(q) || (p.vetName ?? "").toLowerCase().includes(q) || (p.activeIngredient ?? "").toLowerCase().includes(q) || (p.indicationOrDiagnosis ?? "").toLowerCase().includes(q)
    ) : prescriptions;
    const valid = matches.filter((p) => !isExpired(p));
    const expired = matches.filter((p) => isExpired(p));
    return { valid, expired };
  }, [prescriptions, query]);
  function selectPrescription(id) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }
  function formatOption(p) {
    const date = p.prescriptionDate ? new Date(p.prescriptionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "?";
    const ref = p.prescriptionRef ? ` [${p.prescriptionRef}]` : "";
    const vet = p.vetName ? ` — ${p.vetName}` : "";
    return { date, ref, vet };
  }
  const totalResults = filtered.valid.length + filtered.expired.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: `w-full flex items-center justify-between h-12 rounded-xl border-2 px-4 py-2 text-base transition-colors focus:outline-none ${open ? "border-primary ring-4 ring-primary/10 bg-white" : "border-border bg-transparent hover:border-foreground/30"}`,
        onClick: () => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        },
        children: [
          selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 text-left truncate", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: selected.productName ?? "Unknown" }),
            selected.prescriptionRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/40 ml-1 text-sm", children: [
              "[",
              selected.prescriptionRef,
              "]"
            ] }),
            selected.prescriptionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/40 ml-1 text-sm", children: [
              "· ",
              new Date(selected.prescriptionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
            ] }),
            selected.vetName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/50 ml-1 text-sm", children: [
              "— ",
              selected.vetName
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/40 flex-1 text-left", children: "Search prescriptions…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0 ml-2", children: [
            selected && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                role: "button",
                tabIndex: 0,
                className: "p-0.5 rounded hover:bg-black/10 text-foreground/30 hover:text-foreground/70",
                onClick: (e) => {
                  e.stopPropagation();
                  selectPrescription("");
                },
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    selectPrescription("");
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "w-4 h-4 text-foreground/30" })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      PopoverContent,
      {
        className: "p-0 w-[var(--radix-popover-trigger-width)] max-h-[340px] overflow-hidden flex flex-col shadow-lg border border-border rounded-xl",
        align: "start",
        sideOffset: 4,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-3.5 h-3.5 text-foreground/30 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: inputRef,
                className: "flex-1 text-sm bg-transparent focus:outline-none placeholder:text-foreground/30",
                placeholder: "Type product name, ref, vet or indication…",
                value: query,
                onChange: (e) => setQuery(e.target.value)
              }
            ),
            query && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setQuery(""), className: "text-foreground/30 hover:text-foreground/70", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "w-full text-left px-3 py-2 text-sm text-foreground/40 hover:bg-black/5 italic border-b border-border/50",
                onClick: () => selectPrescription(""),
                children: "— Not linked to a prescription —"
              }
            ),
            totalResults === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "px-3 py-4 text-sm text-foreground/40 text-center", children: [
              'No prescriptions match "',
              query,
              '"'
            ] }),
            filtered.valid.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: filtered.valid.map((p) => {
              const { date, ref, vet } = formatOption(p);
              const isSelected = Number(value) === p.id;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: `w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5 transition-colors flex items-start justify-between gap-2 ${isSelected ? "bg-primary/10" : ""}`,
                  onClick: () => selectPrescription(String(p.id)),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium truncate", children: [
                        p.productName ?? "Unknown product",
                        ref
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground/50 truncate", children: [
                        date,
                        vet,
                        p.indicationOrDiagnosis ? ` · ${p.indicationOrDiagnosis}` : ""
                      ] })
                    ] }),
                    isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-primary shrink-0 mt-0.5" })
                  ]
                },
                p.id
              );
            }) }),
            filtered.expired.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1 text-[10px] font-semibold text-foreground/30 uppercase tracking-wide border-t border-border/50 mt-1 bg-foreground/2", children: "Expired prescriptions" }),
              filtered.expired.map((p) => {
                const { date, ref, vet } = formatOption(p);
                const isSelected = Number(value) === p.id;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: `w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5 transition-colors flex items-start justify-between gap-2 opacity-60 ${isSelected ? "bg-primary/10 !opacity-100" : ""}`,
                    onClick: () => selectPrescription(String(p.id)),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium truncate text-foreground/60", children: [
                          p.productName ?? "Unknown product",
                          ref
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground/40 truncate", children: [
                          date,
                          vet,
                          " · Expired"
                        ] })
                      ] }),
                      isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-primary shrink-0 mt-0.5" })
                    ]
                  },
                  p.id
                );
              })
            ] })
          ] }),
          prescriptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/50 px-3 py-1.5 text-[10px] text-foreground/30", children: [
            totalResults,
            " of ",
            prescriptions.length,
            " prescriptions",
            query ? ` matching "${query}"` : ""
          ] })
        ]
      }
    )
  ] });
}
function EarTagValidatorPanel({
  rawInput,
  onRawChange,
  validations,
  onValidate,
  onCorrect
}) {
  const matched = validations.filter((v) => v.animal);
  const unmatched = validations.filter((v) => !v.animal);
  const hasValidated = validations.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 block", children: [
      "Ear Tags / Animal IDs ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-foreground/40 font-normal", children: "Comma-separated. Each tag will be verified against registered animals." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: "flex-1 min-h-[64px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y",
          placeholder: "e.g. UK123456/0001, UK123456/0002, UK123456/0003",
          value: rawInput,
          onChange: (e) => onRawChange(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          className: "shrink-0 gap-1.5 mt-0.5",
          onClick: onValidate,
          disabled: !rawInput.trim(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5" }),
            "Validate Tags"
          ]
        }
      )
    ] }),
    hasValidated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-3 py-2 flex items-center gap-2 text-sm font-medium ${unmatched.length === 0 ? "bg-green-50 border-b border-green-200 text-green-800" : "bg-amber-50 border-b border-amber-200 text-amber-800"}`, children: unmatched.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4" }),
        matched.length,
        " of ",
        validations.length,
        " ear tag",
        validations.length !== 1 ? "s" : "",
        " verified — all animals matched"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4" }),
        matched.length,
        " of ",
        validations.length,
        " matched · ",
        unmatched.length,
        " need",
        unmatched.length === 1 ? "s" : "",
        " attention"
      ] }) }),
      matched.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase font-semibold text-foreground/40 tracking-wide", children: "Verified Animals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: matched.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-800 border border-green-200 px-2.5 py-1 rounded-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: v.normalized }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
                "· ",
                v.animal.breed ?? v.animal.species
              ] })
            ]
          },
          i
        )) })
      ] }),
      unmatched.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 space-y-2 ${matched.length > 0 ? "border-t border-border" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase font-semibold text-foreground/40 tracking-wide", children: "Unrecognised Tags — Correction Required" }),
        validations.map((v, i) => {
          if (v.animal) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-amber-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded shrink-0", children: v.raw }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-700 shrink-0", children: "not found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                className: "h-7 text-xs font-mono flex-1",
                placeholder: "Correct ear tag...",
                value: v.correction,
                onChange: (e) => onCorrect(i, e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onCorrect(i, v.correction);
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                className: "h-7 px-2 text-xs shrink-0",
                onClick: () => onCorrect(i, v.correction),
                disabled: !v.correction.trim(),
                children: "Re-check"
              }
            )
          ] }, i);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "Correct each tag above or remove it from the list. Tags that remain unmatched will not be linked to individual animal records." })
      ] })
    ] })
  ] });
}
function StatusBadge({ record }) {
  const status = getRecordStatus(record);
  const days = daysUntil(record.withdrawalEndDate);
  if (status === "in_withdrawal") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
    days,
    "d left"
  ] });
  if (status === "cleared") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
    "Cleared"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3" }),
    "No W/D"
  ] });
}
function TreatmentScopeBadge({ record, herds, animals }) {
  const scope = record.treatmentScope;
  if (scope === "individual" && record.animalId) {
    const animal = animals.find((a) => a.id === record.animalId);
    const tag = animal?.earTagNumber ?? animal?.tagNumber ?? `Animal #${record.animalId}`;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3 h-3" }),
      tag
    ] });
  }
  if (scope === "individual" && record.treatedAnimalTags) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3 h-3" }),
      record.treatedAnimalTags
    ] });
  }
  if (scope === "group") {
    const herdName = herds.find((h) => h.id === record.herdId)?.name;
    const count = record.treatedAnimalCount;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3 h-3" }),
      "Group",
      herdName ? ` — ${herdName}` : "",
      count ? ` (${count})` : ""
    ] });
  }
  if (scope === "whole_herd" || record.herdId) {
    const herdName = herds.find((h) => h.id === record.herdId)?.name;
    const count = record.treatedAnimalCount;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3 h-3" }),
      herdName ?? "Whole Herd",
      count ? ` (${count})` : ""
    ] });
  }
  return null;
}
function treatmentTraceDetail(record, herds, animals) {
  const scope = record.treatmentScope;
  if (scope === "individual" && record.animalId) {
    const animal = animals.find((a) => a.id === record.animalId);
    return animal ? `Individual: ${animal.earTagNumber ?? animal.tagNumber ?? `#${animal.id}`}` : `Individual: Animal #${record.animalId}`;
  }
  if (scope === "individual" && record.treatedAnimalTags) return `Individual: ${record.treatedAnimalTags}`;
  if (scope === "group") {
    const herdName2 = herds.find((h) => h.id === record.herdId)?.name ?? "Group";
    const tags = record.treatedAnimalTags ? ` · Tags: ${record.treatedAnimalTags}` : "";
    return `Group: ${herdName2}${record.treatedAnimalCount ? ` (${record.treatedAnimalCount} animals)` : ""}${tags}`;
  }
  const herdName = herds.find((h) => h.id === record.herdId)?.name;
  const count = record.treatedAnimalCount;
  if (herdName) return `Whole herd: ${herdName}${count ? ` (${count} animals)` : ""}`;
  return "—";
}
function RecordCard({ record, herds, animals, prescriptions, onEdit, onDelete, onView, onRaiseTask }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const status = getRecordStatus(record);
  const borderColor = status === "in_withdrawal" ? "border-l-amber-400" : status === "cleared" ? "border-l-green-400" : "border-l-blue-400";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white border border-border rounded-xl border-l-4 ${borderColor} p-4 shadow-sm`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
          record.medicineRef && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded", children: record.medicineRef }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { record }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TreatmentScopeBadge, { record, herds, animals }),
          record.source === "vet_ledger" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200", children: "Via Vet Ledger" }),
          (() => {
            const rx = record.prescriptionId ? prescriptions.find((p) => p.id === record.prescriptionId) : null;
            if (!rx) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200", title: `Linked to prescription: ${rx.productName ?? "?"} — ${rx.vetName ?? "?"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-2.5 h-2.5" }),
              "Rx linked"
            ] });
          })(),
          status === "in_withdrawal" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-amber-700 font-medium", children: [
            "Withdrawal ends ",
            formatDate(record.withdrawalEndDate)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground text-sm", children: record.medicineName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap mt-1 text-xs text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(record.administeredDate) }),
          record.administeredBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· by ",
            record.administeredBy
          ] }),
          record.withdrawalPeriodDays && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· ",
            record.withdrawalPeriodDays,
            "d W/D"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
        status === "in_withdrawal" && onRaiseTask && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onRaiseTask(record), className: "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10", title: "Raise withdrawal check task", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3" }),
          "Raise Task"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onView(record), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/30 hover:text-blue-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onEdit(record), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/30 hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onDelete(record.id), className: "p-1.5 rounded-md hover:bg-red-50 text-foreground/30 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setExpanded((e) => !e), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/30", children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5" }) })
      ] })
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs", children: [
      [
        { label: "Animal / Group", value: treatmentTraceDetail(record, herds, animals) },
        { label: "Dosage", value: record.dosage },
        { label: "Route", value: record.administrationRoute },
        { label: "Batch No.", value: record.batchNumber },
        { label: "Vet", value: record.vetName },
        { label: "Reason", value: record.reason },
        { label: "Notes", value: record.notes }
      ].filter((f) => f.value && f.value !== "—").map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/40 uppercase tracking-wide font-semibold text-[10px]", children: f.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/80 font-medium", children: f.value })
      ] }, f.label)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/40 uppercase tracking-wide font-semibold text-[10px]", children: "Timeline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground/80 font-medium", children: [
          "Administered ",
          formatDate(record.administeredDate)
        ] }),
        record.withdrawalEndDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground/80 font-medium", children: [
          "Withdrawal ends ",
          formatDate(record.withdrawalEndDate)
        ] })
      ] }),
      record.prescriptionId && (() => {
        const rx = prescriptions.find((p) => p.id === record.prescriptionId);
        if (!rx) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full mt-1 p-2 rounded-lg border border-purple-200 bg-purple-50 text-xs text-purple-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3" }),
            "Linked Prescription"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            rx.productName ?? "Unknown",
            rx.prescriptionRef ? ` [${rx.prescriptionRef}]` : "",
            rx.vetName ? ` — ${rx.vetName}` : "",
            rx.prescriptionDate ? `, issued ${formatDate(rx.prescriptionDate)}` : ""
          ] })
        ] });
      })()
    ] })
  ] });
}
function printMedicineRegister(records, herds, animals, farm, filterLabel) {
  const tableHtml = `<table><thead><tr>
    <th>Reference</th><th>Medicine</th><th>Batch No.</th><th>Animal / Group Treated</th><th>Administered</th>
    <th>Dosage / Route</th><th>W/D Days</th><th>W/D Ends</th><th>Status</th><th>Vet</th><th>Reason</th>
  </tr></thead><tbody>${records.map((r) => {
    const status = getRecordStatus(r);
    const days = daysUntil(r.withdrawalEndDate);
    const badge = status === "in_withdrawal" ? `<span style="background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-weight:600">${days}d left</span>` : status === "cleared" ? `<span style="background:#dcfce7;color:#166534;padding:1px 5px;border-radius:3px;font-weight:600">Cleared</span>` : `<span style="background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:3px;font-weight:600">No W/D</span>`;
    return `<tr>
      <td style="font-family:monospace">${r.medicineRef ?? "—"}</td>
      <td><strong>${r.medicineName}</strong></td>
      <td style="font-family:monospace">${r.batchNumber ?? "—"}</td>
      <td>${treatmentTraceDetail(r, herds, animals)}</td>
      <td style="white-space:nowrap">${formatDateLong(r.administeredDate)}</td>
      <td>${[r.dosage, r.administrationRoute].filter(Boolean).join(" · ") || "—"}</td>
      <td>${r.withdrawalPeriodDays ?? "—"}</td>
      <td style="white-space:nowrap">${r.withdrawalEndDate ? formatDateLong(r.withdrawalEndDate) : "—"}</td>
      <td>${badge}</td>
      <td>${r.vetName ?? "—"}</td>
      <td>${r.reason ?? "—"}</td>
    </tr>`;
  }).join("")}</tbody></table>`;
  printProReport({
    title: "Medicine Register",
    subtitle: "Veterinary Medicines Regulations 2013",
    farmName: farm.name,
    cphNumber: farm.cphNumber ?? void 0,
    redTractorId: farm.redTractorId ?? void 0,
    recordCount: records.length,
    extraMeta: `Filter: ${filterLabel}`,
    tableHtml,
    footerNote: "Legally required under the Veterinary Medicines Regulations 2013 — retain for at least 5 years. Observe all withdrawal periods before slaughter, milk sale, or egg collection."
  });
}
function MedicinePageDedicated() {
  const { farmId } = useAppStore();
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Medicine Register", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MedicineRegisterContent, { farmId }) });
}
const MED_PIE_COLOURS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899"];
function MedicineAnalyticsPanel({ records }) {
  const routeMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    records.forEach((r) => {
      const route = r.administrationRoute || "Not recorded";
      m.set(route, (m.get(route) ?? 0) + 1);
    });
    return m;
  }, [records]);
  const routeData = [...routeMap.entries()].sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }));
  const monthMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    records.forEach((r) => {
      if (!r.administeredDate) return;
      const d = new Date(r.administeredDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!m.has(key)) m.set(key, { label, count: 0, inWithdrawal: 0 });
      const b = m.get(key);
      b.count++;
      if (r.withdrawalPeriodDays && r.withdrawalPeriodDays > 0) b.inWithdrawal++;
    });
    return m;
  }, [records]);
  const monthData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  const medicineMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    records.forEach((r) => {
      m.set(r.medicineName, (m.get(r.medicineName) ?? 0) + 1);
    });
    return m;
  }, [records]);
  const topMedicines = [...medicineMap.entries()].sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));
  const inWithdrawalNow = records.filter((r) => isInWithdrawal(r.withdrawalEndDate ?? null)).length;
  const withWdPeriod = records.filter((r) => r.withdrawalPeriodDays && r.withdrawalPeriodDays > 0).length;
  const avgWd = withWdPeriod > 0 ? Math.round(records.filter((r) => r.withdrawalPeriodDays && r.withdrawalPeriodDays > 0).reduce((s, r) => s + (r.withdrawalPeriodDays ?? 0), 0) / withWdPeriod) : 0;
  if (records.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-12 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-10 h-10 mx-auto mb-3 text-gray-300" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600 mb-1", children: "No medicine records yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Add medicine records to see analytics here." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: records.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Active Withdrawals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-700", children: inWithdrawalNow })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Avg. W/D Period" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-700", children: avgWd > 0 ? `${avgWd}d` : "—" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Treatments by Administration Route" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: routeData, dataKey: "value", nameKey: "name", cx: "40%", cy: "50%", outerRadius: 85, label: false, children: routeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: MED_PIE_COLOURS[i % MED_PIE_COLOURS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", formatter: (n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11 }, children: n }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Monthly Treatments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, width: 30 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#16a34a", name: "Treatments", radius: [3, 3, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "inWithdrawal", fill: "#f59e0b", name: "With W/D Period", radius: [3, 3, 0, 0] })
        ] }) })
      ] })
    ] }),
    topMedicines.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Top Medicines Used (by frequency)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(160, topMedicines.length * 34), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: topMedicines, layout: "vertical", margin: { top: 4, right: 24, left: 0, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", horizontal: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, unit: " uses", allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 200 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} treatment${v !== 1 ? "s" : ""}`, ""] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#16a34a", radius: [0, 3, 3, 0] })
      ] }) })
    ] })
  ] });
}
function MedHistoryDialog({ records, herds, onClose }) {
  const [yearFilter, setYearFilter] = React.useState("all");
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const sorted = [...records].sort((a, b) => new Date(b.administeredDate ?? 0).getTime() - new Date(a.administeredDate ?? 0).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter((r) => r.administeredDate && new Date(r.administeredDate).getFullYear() === yearFilter);
  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  }
  function handlePrint() {
    const rows = filtered.map((r) => {
      const herd = herds.find((h) => h.id === r.herdId);
      const wdEnd = r.withdrawalEndDate ? new Date(r.withdrawalEndDate).toLocaleDateString("en-GB") : "";
      return `<tr><td>${fmtDate(r.administeredDate)}</td><td>${r.medicineName}</td><td>${herd?.name ?? (r.treatmentScope === "individual" ? `Animal #${r.animalId}` : r.treatmentScope ?? "—")}</td><td>${r.dosage || "—"}</td><td>${r.administeredBy || "—"}</td><td>${r.vetName || "—"}</td><td>${r.withdrawalPeriodDays ? `${r.withdrawalPeriodDays}d (clears ${wdEnd})` : "—"}</td><td>${r.reason || ""}</td></tr>`;
    }).join("");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Medicine Treatment History</title><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:5px 6px;text-align:left;font-size:8.5pt}td{padding:4px 6px;border-bottom:1px solid #e5e7eb;font-size:9pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1 style="font-size:14pt">Medicine Treatment History</h1><p style="font-size:9pt;color:#555">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}${yearFilter !== "all" ? ` · Year: ${yearFilter}` : ""} · ${filtered.length} record${filtered.length !== 1 ? "s" : ""}</p><table><thead><tr><th>Date</th><th>Medicine</th><th>Herd / Animal</th><th>Dose</th><th>Administered By</th><th>Vet</th><th>Withdrawal</th><th>Reason</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">APHA requirement: retain medicine records for 5 years (cattle/sheep) or 3 years (pigs/poultry).</p></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-green-700" }),
      "Full Treatment History — All Years"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap border-b pb-3", children: [
      ["all", ...recentYears].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setYearFilter(y), style: { padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }, children: y === "all" ? "All years" : y }, y)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " record",
        filtered.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-14 text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-9 h-9 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "No records",
        yearFilter !== "all" ? ` for ${yearFilter}` : ""
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Medicine", "Herd / Animal", "Dose", "Administered By", "Vet", "Withdrawal", "Reason"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => {
        const herd = herds.find((h) => h.id === r.herdId);
        const wdDays = r.withdrawalPeriodDays;
        const wdEnd = r.withdrawalEndDate ? new Date(r.withdrawalEndDate) : null;
        const wdPast = wdEnd && wdEnd < /* @__PURE__ */ new Date();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280", fontSize: "0.8125rem" }, children: fmtDate(r.administeredDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 600, color: "#111827" }, children: r.medicineName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: herd ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500 }, children: herd.name }) : r.treatmentScope === "individual" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
            "Animal #",
            r.animalId
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#374151" }, children: r.dosage || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.administeredBy || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.vetName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: wdDays ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", padding: "2px 6px", borderRadius: 99, background: wdPast ? "#f0fdf4" : "#fef2f2", color: wdPast ? "#15803d" : "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }, children: [
            wdDays,
            "d",
            wdEnd ? ` — clears ${wdEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}` : ""
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.reason || "—" })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "border-t pt-3 flex-row items-center gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex-1", children: [
        "APHA: retain medicine records for ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5 years" }),
        " (cattle/sheep) or ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 years" }),
        " (pigs/poultry)."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print / Export"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "Close" })
      ] })
    ] })
  ] }) });
}
function MedicineRegisterContent({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = usePersistedTab({ page: "medicine", farmId, validIds: ["all", "in_withdrawal", "cleared", "no_withdrawal", "analytics", "adr"], defaultTab: "all" });
  const [search, setSearch] = reactExports.useState("");
  const [cropYear, setCropYear] = usePersistedNumberFilter({ page: "medicine", filter: "crop-year", farmId, defaultValue: currentCropYear() });
  const [historyOpen, setHistoryOpen] = reactExports.useState(false);
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [raiseTaskRecord, setRaiseTaskRecord] = reactExports.useState(null);
  const [tagValidations, setTagValidations] = reactExports.useState([]);
  const [pendingBodyWithUnmatched, setPendingBodyWithUnmatched] = reactExports.useState(null);
  const [vmdMatch, setVmdMatch] = reactExports.useState(null);
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json())
  });
  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`, { credentials: "include" }).then((r) => r.json())
  });
  const animalsQ = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then((r) => r.json())
  });
  const medicineQ = useQuery({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`, { credentials: "include" }).then((r) => r.json())
  });
  const vetPlansQ = useQuery({
    queryKey: ["vet-health-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-health-plans`, { credentials: "include" }).then((r) => r.json())
  });
  const prescriptionsQ = useQuery({
    queryKey: ["vet-prescriptions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-prescriptions`, { credentials: "include" }).then((r) => r.json())
  });
  const stockItemsQ = useQuery({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`, { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1e3
  });
  const allStockItems = (stockItemsQ.data?.records ?? []).filter((s) => s.isActive);
  const medicineStockItems = allStockItems.filter(
    (s) => !s.category || ["medic", "vet", "pharma", "drug", "treatment"].some((k) => s.category.toLowerCase().includes(k))
  );
  const stockItemsForPicker = medicineStockItems.length > 0 ? medicineStockItems : allStockItems;
  const farm = farmQ.data?.record ?? { name: "Farm", cphNumber: null, redTractorId: null };
  const herds = herdsQ.data?.records ?? [];
  const animals = animalsQ.data?.records ?? [];
  const prescriptions = prescriptionsQ.data ?? [];
  const allRecords = medicineQ.data?.records ?? [];
  const uniqueVetNames = reactExports.useMemo(() => {
    const names = /* @__PURE__ */ new Set();
    vetPlansQ.data?.records?.forEach((p) => {
      if (p.vetName) names.add(p.vetName);
    });
    allRecords.forEach((r) => {
      if (r.vetName) names.add(r.vetName);
    });
    return Array.from(names).sort();
  }, [vetPlansQ.data, allRecords]);
  const tagPool = form.herdId ? animals.filter((a) => a.herdId === Number(form.herdId)) : animals;
  reactExports.useEffect(() => {
    setTagValidations([]);
    setPendingBodyWithUnmatched(null);
  }, [form.treatmentScope, form.herdId]);
  function runTagValidation() {
    const parts = form.treatedAnimalTags.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const results = parts.map((raw) => {
      const normalized = normalizeTag(raw);
      return { raw, normalized, animal: lookupAnimalByTag(normalized, tagPool), correction: "" };
    });
    setTagValidations(results);
  }
  function applyCorrection(index, correction) {
    const normalized = normalizeTag(correction);
    const animal = lookupAnimalByTag(normalized, tagPool);
    setTagValidations((vs) => vs.map(
      (v, i) => i === index ? { ...v, correction, normalized: animal ? normalized : v.normalized, animal } : v
    ));
  }
  function getVerifiedTags() {
    if (form.treatmentScope !== "group" || tagValidations.length === 0) {
      return { tags: form.treatedAnimalTags, count: Number(form.treatedAnimalCount) || 0, hasUnmatched: false };
    }
    const matched = tagValidations.filter((v) => v.animal);
    const unmatched = tagValidations.filter((v) => !v.animal);
    return {
      tags: matched.map((v) => v.normalized).join(", "),
      count: matched.length,
      hasUnmatched: unmatched.length > 0
    };
  }
  const createM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/medicine-records`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicine-records", farmId] });
      closeForm();
      toast({ title: "Medicine record saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/medicine-records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicine-records", farmId] });
      closeForm();
      toast({ title: "Record updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/medicine-records/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicine-records", farmId] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setTagValidations([]);
    setPendingBodyWithUnmatched(null);
    setVmdMatch(null);
    createM.reset();
    updateM.reset();
  }
  const yearRecords = allRecords.filter((r) => isInCropYear(r.administeredDate, cropYear));
  const inWithdrawal = yearRecords.filter((r) => getRecordStatus(r) === "in_withdrawal");
  const cleared = yearRecords.filter((r) => getRecordStatus(r) === "cleared");
  const noWithdrawal = yearRecords.filter((r) => getRecordStatus(r) === "no_withdrawal");
  const adrRecords = yearRecords.filter((r) => r.adverseReactionSuspected);
  const tabCounts = { all: yearRecords.length, in_withdrawal: inWithdrawal.length, cleared: cleared.length, no_withdrawal: noWithdrawal.length, adr: adrRecords.length };
  const baseFiltered = statusFilter === "all" ? yearRecords : statusFilter === "in_withdrawal" ? inWithdrawal : statusFilter === "cleared" ? cleared : statusFilter === "adr" ? adrRecords : noWithdrawal;
  const filtered = baseFiltered.filter(
    (r) => !search || r.medicineName.toLowerCase().includes(search.toLowerCase()) || r.medicineRef?.toLowerCase().includes(search.toLowerCase()) || r.vetName?.toLowerCase().includes(search.toLowerCase()) || r.reason?.toLowerCase().includes(search.toLowerCase()) || r.treatedAnimalTags?.toLowerCase().includes(search.toLowerCase()) || herds.find((h) => h.id === r.herdId)?.name.toLowerCase().includes(search.toLowerCase()) || r.animalId && animals.find((a) => a.id === r.animalId)?.earTagNumber?.toLowerCase().includes(search.toLowerCase())
  );
  const filterLabel = statusFilter === "all" ? "All records" : statusFilter === "in_withdrawal" ? "In Withdrawal" : statusFilter === "cleared" ? "Cleared" : "No Withdrawal Required";
  function openEdit(r) {
    setEditing(r);
    setTagValidations([]);
    setPendingBodyWithUnmatched(null);
    setVmdMatch(findVmdMedicine(r.medicineName));
    const doseMatch = (r.dosage ?? "").match(/^(\d+(?:\.\d+)?)\s*(ml|mg|g|IU|tablets?|capsules?|doses?|sachets?)$/i);
    const newForm = {
      treatmentScope: r.treatmentScope ?? "whole_herd",
      animalId: r.animalId ? String(r.animalId) : "",
      herdId: r.herdId ? String(r.herdId) : "",
      treatedAnimalCount: r.treatedAnimalCount ? String(r.treatedAnimalCount) : "",
      treatedAnimalTags: r.treatedAnimalTags ?? "",
      medicineName: r.medicineName,
      batchNumber: r.batchNumber ?? "",
      dosage: r.dosage ?? "",
      doseAmount: doseMatch ? doseMatch[1] : "",
      doseUnit: doseMatch ? doseMatch[2].toLowerCase() : "ml",
      administrationRoute: r.administrationRoute ?? "",
      administeredBy: r.administeredBy ?? "",
      administeredDate: r.administeredDate?.slice(0, 10) ?? "",
      withdrawalPeriodDays: r.withdrawalPeriodDays ? String(r.withdrawalPeriodDays) : "",
      reason: r.reason ?? "",
      vetName: r.vetName ?? "",
      notes: r.notes ?? "",
      isOrganicTreatment: r.isOrganicTreatment ?? false,
      doubledWithdrawalDays: r.doubledWithdrawalDays ? String(r.doubledWithdrawalDays) : "",
      certifierNotified: r.certifierNotified ?? false,
      certifierNotifiedDate: r.certifierNotifiedDate ? new Date(r.certifierNotifiedDate).toISOString().slice(0, 10) : "",
      prescriptionId: r.prescriptionId ? String(r.prescriptionId) : "",
      adverseReactionSuspected: r.adverseReactionSuspected ?? false,
      adverseReactionSigns: r.adverseReactionSigns ?? "",
      adverseReactionSeverity: r.adverseReactionSeverity ?? "",
      adverseReactionOnsetHours: r.adverseReactionOnsetHours ? String(r.adverseReactionOnsetHours) : "",
      adverseReactionOutcome: r.adverseReactionOutcome ?? "",
      reportedToVetDate: r.reportedToVetDate ? new Date(r.reportedToVetDate).toISOString().slice(0, 10) : "",
      vetReportedToVmdDate: r.vetReportedToVmdDate ? new Date(r.vetReportedToVmdDate).toISOString().slice(0, 10) : "",
      vmdSarssRef: r.vmdSarssRef ?? "",
      stockItemId: "",
      stockQuantityUsed: ""
    };
    setForm(newForm);
    if (r.treatmentScope === "group" && r.treatedAnimalTags) {
      const herdPool = r.herdId ? animals.filter((a) => a.herdId === r.herdId) : animals;
      const parts = r.treatedAnimalTags.split(",").map((s) => s.trim()).filter(Boolean);
      setTagValidations(parts.map((raw) => {
        const normalized = normalizeTag(raw);
        return { raw, normalized, animal: lookupAnimalByTag(normalized, herdPool), correction: "" };
      }));
    }
    setFormOpen(true);
  }
  function buildBody(verifiedTags, verifiedCount) {
    const wdDays = form.withdrawalPeriodDays ? Number(form.withdrawalPeriodDays) : null;
    const wdEnd = wdDays && form.administeredDate ? new Date(addDays(form.administeredDate, wdDays)).toISOString() : null;
    return {
      treatmentScope: form.treatmentScope,
      animalId: form.treatmentScope === "individual" && form.animalId ? Number(form.animalId) : null,
      herdId: form.treatmentScope !== "individual" && form.herdId ? Number(form.herdId) : null,
      treatedAnimalCount: (form.treatmentScope === "group" || form.treatmentScope === "whole_herd") && verifiedCount > 0 ? verifiedCount : null,
      treatedAnimalTags: verifiedTags || null,
      medicineName: form.medicineName,
      batchNumber: form.batchNumber || null,
      dosage: form.doseAmount ? `${form.doseAmount} ${form.doseUnit}`.trim() : form.dosage || null,
      administrationRoute: form.administrationRoute || null,
      administeredBy: form.administeredBy || null,
      administeredDate: form.administeredDate ? new Date(form.administeredDate).toISOString() : null,
      withdrawalPeriodDays: wdDays,
      withdrawalEndDate: wdEnd,
      reason: form.reason || null,
      vetName: form.vetName || null,
      notes: form.notes || null,
      isOrganicTreatment: form.isOrganicTreatment ?? false,
      doubledWithdrawalDays: form.doubledWithdrawalDays ? Number(form.doubledWithdrawalDays) : null,
      certifierNotified: form.certifierNotified ?? false,
      certifierNotifiedDate: form.certifierNotified && form.certifierNotifiedDate ? new Date(form.certifierNotifiedDate).toISOString() : null,
      prescriptionId: form.prescriptionId ? Number(form.prescriptionId) : null,
      stockItemId: form.stockItemId ? Number(form.stockItemId) : void 0,
      stockQuantityUsed: form.stockQuantityUsed ? Number(form.stockQuantityUsed) : void 0
    };
  }
  function handleSubmit(e) {
    e.preventDefault();
    const { tags, count, hasUnmatched } = getVerifiedTags();
    if (form.treatmentScope === "group" && form.treatedAnimalTags && tagValidations.length === 0) {
      runTagValidation();
      toast({ title: "Tags validated — please review and save again", variant: "default" });
      return;
    }
    const body = buildBody(tags, count);
    if (form.treatmentScope === "group" && hasUnmatched) {
      setPendingBodyWithUnmatched(body);
      return;
    }
    if (editing) {
      updateM.mutate({ id: editing.id, body });
    } else {
      createM.mutate(body);
    }
  }
  function confirmSaveWithUnmatched() {
    if (!pendingBodyWithUnmatched) return;
    if (editing) {
      updateM.mutate({ id: editing.id, body: pendingBodyWithUnmatched });
    } else {
      createM.mutate(pendingBodyWithUnmatched);
    }
    setPendingBodyWithUnmatched(null);
  }
  const isSubmitting = createM.isPending || updateM.isPending;
  const previewWdEnd = form.withdrawalPeriodDays && form.administeredDate ? addDays(form.administeredDate, Number(form.withdrawalPeriodDays)) : null;
  const unmatchedCount = tagValidations.filter((v) => !v.animal).length;
  const selectedHerd = form.herdId ? herds.find((h) => h.id === Number(form.herdId)) : null;
  const isOrganicHerdSelected = selectedHerd?.isOrganicHerd ?? false;
  const previewDoubledWdEnd = form.doubledWithdrawalDays && form.administeredDate ? addDays(form.administeredDate, Number(form.doubledWithdrawalDays)) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    inWithdrawal.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-amber-800", children: [
          inWithdrawal.length,
          " active withdrawal period",
          inWithdrawal.length !== 1 ? "s" : "",
          " — check before selling or slaughtering"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-0.5", children: [
          inWithdrawal.slice(0, 3).map((r) => {
            const days = daysUntil(r.withdrawalEndDate);
            return `${r.medicineName} — ${days} day${days !== 1 ? "s" : ""} remaining`;
          }).join(" · "),
          inWithdrawal.length > 3 ? ` · +${inWithdrawal.length - 3} more` : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "all", onClick: () => setStatusFilter("all"), children: [
        "All ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
          "(",
          tabCounts.all,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "in_withdrawal", onClick: () => setStatusFilter("in_withdrawal"), children: [
        "In Withdrawal ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
          "(",
          tabCounts.in_withdrawal,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "cleared", onClick: () => setStatusFilter("cleared"), children: [
        "Cleared ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
          "(",
          tabCounts.cleared,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "no_withdrawal", onClick: () => setStatusFilter("no_withdrawal"), children: [
        "No W/D Required ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
          "(",
          tabCounts.no_withdrawal,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: statusFilter === "analytics", onClick: () => setStatusFilter("analytics"), children: "Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "adr", onClick: () => setStatusFilter("adr"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-3.5 h-3.5 mr-1 inline-block" }),
        "ADR Register",
        tabCounts.adr > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs bg-red-100 text-red-700 rounded-full px-1.5", children: tabCounts.adr })
      ] })
    ] }),
    statusFilter === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(MedicineAnalyticsPanel, { records: allRecords }),
    statusFilter === "adr" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-4 h-4" }),
          "Adverse Drug Reaction (ADR) Register — VMR 2013 / VMD SARSS"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-800", children: "Under the Veterinary Medicines Regulations 2013 (Reg 58 & Sch 6), suspected adverse reactions must be reported to your prescribing vet. Serious reactions must reach the VMD SARSS portal within 15 days; non-serious within 90 days. This register tracks all flagged records and their reporting status." })
      ] }),
      adrRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-xl bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "mx-auto mb-2 w-8 h-8 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-sm", children: [
          "No adverse reactions recorded for ",
          cropYear
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Flag a reaction when adding or editing a medicine record." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-red-50 border-b border-red-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800", children: "Medicine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800", children: "Herd / Animal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800", children: "Severity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800", children: "Signs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800", children: "Reported to Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800", children: "VMD SARSS Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-medium text-xs text-red-800" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: adrRecords.map((r) => {
          const herd = r.herdId ? herds.find((h) => h.id === r.herdId) : null;
          const animal = r.animalId ? animals.find((a) => a.id === r.animalId) : null;
          const severityColour = r.adverseReactionSeverity === "fatal" ? "text-red-700 bg-red-100" : r.adverseReactionSeverity === "severe" ? "text-orange-700 bg-orange-100" : r.adverseReactionSeverity === "moderate" ? "text-amber-700 bg-amber-100" : "text-green-700 bg-green-100";
          const vetReported = !!r.reportedToVetDate;
          const sarssReported = !!r.vetReportedToVmdDate || !!r.vmdSarssRef;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t hover:bg-red-50/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 whitespace-nowrap text-xs", children: formatDate(r.administeredDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium text-xs", children: r.medicineName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs text-muted-foreground", children: animal ? animalShortLabel(animal) : herd?.name ?? r.treatedAnimalTags ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: r.adverseReactionSeverity ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full capitalize ${severityColour}`, children: r.adverseReactionSeverity }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs max-w-[180px] truncate", title: r.adverseReactionSigns ?? "", children: r.adverseReactionSigns || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs capitalize", children: r.adverseReactionOutcome?.replace("_", " ") || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: vetReported ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-green-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
              formatDate(r.reportedToVetDate)
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-red-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3.5 h-3.5" }),
              "Not reported"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs font-mono", children: sarssReported ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-green-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
              r.vmdSarssRef || "Submitted"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Pending" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), className: "h-7 w-7 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }) })
          ] }, r.id);
        }) })
      ] }) })
    ] }),
    statusFilter !== "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-72", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search medicine, ref, ear tag, reason...", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setHistoryOpen(true), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4" }),
            " Full History"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printMedicineRegister(filtered, herds, animals, farm, filterLabel), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
            " Print Register"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
            setEditing(null);
            setForm(EMPTY_FORM);
            setTagValidations([]);
            setFormOpen(true);
          }, className: "gap-2", size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            " Add Record"
          ] })
        ] })
      ] }),
      medicineQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
        "Loading..."
      ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center py-16 px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-8 h-8 text-primary/40" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No medicine records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search ? "No records match your search." : statusFilter === "all" ? "Record all veterinary medicines administered to your livestock." : `No records in the "${filterLabel}" category.` })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(RecordCard, { record: r, herds, animals, prescriptions, onEdit: openEdit, onDelete: setDeleteId, onView: setViewRecord, onRaiseTask: setRaiseTaskRecord }, r.id)) })
    ] }),
    historyOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(MedHistoryDialog, { records: allRecords, herds, onClose: () => setHistoryOpen(false) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-5 h-5 text-primary" }),
          "Medicine Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Full record detail for audit and compliance purposes." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Medicine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: viewRecord.medicineName })
          ] }),
          viewRecord.medicineRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.medicineRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { record: viewRecord })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 bg-violet-50 border border-violet-200 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-violet-700 uppercase font-semibold mb-2 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3.5 h-3.5" }),
              "Animal Traceability"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 uppercase font-medium mb-0.5 text-[10px]", children: "Treatment Scope" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold capitalize", children: viewRecord.treatmentScope === "individual" ? "Individual Animal" : viewRecord.treatmentScope === "group" ? "Group / Batch" : viewRecord.treatmentScope === "whole_herd" ? "Whole Herd" : "—" })
              ] }),
              viewRecord.treatmentScope === "individual" && viewRecord.animalId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 uppercase font-medium mb-0.5 text-[10px]", children: "Ear Tag" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold font-mono", children: (() => {
                  const a = animals.find((x) => x.id === viewRecord.animalId);
                  return a?.earTagNumber ?? a?.tagNumber ?? `Animal #${viewRecord.animalId}`;
                })() })
              ] }),
              viewRecord.herdId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 uppercase font-medium mb-0.5 text-[10px]", children: "Herd / Group" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: herds.find((h) => h.id === viewRecord.herdId)?.name ?? `Herd #${viewRecord.herdId}` })
              ] }),
              viewRecord.treatedAnimalCount && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 uppercase font-medium mb-0.5 text-[10px]", children: "Animals Treated" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: viewRecord.treatedAnimalCount })
              ] }),
              viewRecord.treatedAnimalTags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 uppercase font-medium mb-1 text-[10px]", children: "Verified Ear Tags" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: viewRecord.treatedAnimalTags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => {
                  const a = lookupAnimalByTag(tag, animals);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border ${a ? "bg-green-50 text-green-800 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`, children: [
                    a && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                    tag
                  ] }, tag);
                }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Administered Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.administeredDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Administered By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.administeredBy || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Dosage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.dosage || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Route" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.administrationRoute || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewRecord.batchNumber || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Vet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.vetName || "—" })
          ] }),
          viewRecord.withdrawalPeriodDays != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Withdrawal Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              viewRecord.withdrawalPeriodDays,
              " days"
            ] })
          ] }),
          viewRecord.withdrawalEndDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Withdrawal End" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatDate(viewRecord.withdrawalEndDate) })
          ] })
        ] }),
        viewRecord.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.reason })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.notes })
        ] }),
        viewRecord.prescriptionId && (() => {
          const rx = prescriptions.find((p) => p.id === viewRecord.prescriptionId);
          if (!rx) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 p-3 rounded-lg border border-purple-200 bg-purple-50 text-sm text-purple-900", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-1 flex items-center gap-1.5 text-purple-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4" }),
              "Linked Prescription"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs", children: [
              rx.productName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-purple-700", children: "Product:" }),
                " ",
                rx.productName
              ] }),
              rx.prescriptionRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-purple-700", children: "Ref:" }),
                " ",
                rx.prescriptionRef
              ] }),
              rx.vetName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-purple-700", children: "Vet:" }),
                " ",
                rx.vetName
              ] }),
              rx.prescriptionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-purple-700", children: "Issued:" }),
                " ",
                formatDate(rx.prescriptionDate)
              ] }),
              rx.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-purple-700", children: "Expires:" }),
                " ",
                formatDate(rx.expiryDate)
              ] }),
              rx.withdrawalPeriodMeat != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-purple-700", children: "W/D Meat:" }),
                " ",
                rx.withdrawalPeriodMeat,
                "d"
              ] }),
              rx.withdrawalPeriodMilk != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-purple-700", children: "W/D Milk:" }),
                " ",
                rx.withdrawalPeriodMilk,
                "d"
              ] })
            ] })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) closeForm();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "60rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-5 h-5 text-primary" }),
          editing ? "Edit Medicine Record" : "Add Medicine Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          editing?.medicineRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-foreground/50 mr-2", children: [
            "Ref: ",
            editing.medicineRef
          ] }),
          "Required under Red Tractor Livestock Standards and the Veterinary Medicines Regulations 2013."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-violet-200 bg-violet-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-violet-800 uppercase tracking-wide mb-3 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3.5 h-3.5" }),
            "Animal Traceability (Red Tractor / VMR 2013 required)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4", children: ["individual", "group", "whole_herd"].map((scope) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                const autoCount = scope === "whole_herd" && form.herdId ? String(animals.filter((a) => a.herdId === Number(form.herdId)).length || "") : "";
                setForm((f) => ({ ...f, treatmentScope: scope, animalId: "", treatedAnimalCount: autoCount, treatedAnimalTags: "" }));
              },
              className: `flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${form.treatmentScope === scope ? "border-violet-500 bg-violet-100 text-violet-800" : "border-border bg-white text-foreground/60 hover:border-violet-300"}`,
              children: scope === "individual" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5" }),
                "Individual Animal"
              ] }) : scope === "group" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }),
                "Group / Batch"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }),
                "Whole Herd"
              ] })
            },
            scope
          )) }),
          form.treatmentScope === "individual" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Select Animal ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            animals.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                className: "w-full h-12 rounded-xl border-2 border-border bg-white px-4 py-2 text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10",
                value: form.animalId,
                onChange: (e) => setForm((f) => ({ ...f, animalId: e.target.value })),
                required: form.treatmentScope === "individual",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select animal by ear tag..." }),
                  animals.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: animalShortLabel(a) }, a.id))
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Enter ear tag number (e.g. UK123456/0001)",
                  value: form.treatedAnimalTags,
                  onChange: (e) => setForm((f) => ({ ...f, treatedAnimalTags: e.target.value })),
                  required: form.treatmentScope === "individual"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1", children: "No animals registered — enter ear tag manually." })
            ] })
          ] }) }),
          form.treatmentScope === "group" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Herd / Group ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "w-full h-12 rounded-xl border-2 border-border bg-white px-4 py-2 text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10",
                  value: form.herdId,
                  onChange: (e) => setForm((f) => ({ ...f, herdId: e.target.value })),
                  required: true,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select herd / group..." }),
                    herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: h.id, children: [
                      h.name,
                      " (",
                      h.type,
                      ")"
                    ] }, h.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              EarTagValidatorPanel,
              {
                rawInput: form.treatedAnimalTags,
                onRawChange: (v) => setForm((f) => ({ ...f, treatedAnimalTags: v })),
                validations: tagValidations,
                onValidate: runTagValidation,
                onCorrect: applyCorrection
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Animals Treated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "1",
                  value: tagValidations.length > 0 ? String(tagValidations.filter((v) => v.animal).length) : form.treatedAnimalCount,
                  readOnly: tagValidations.length > 0,
                  onChange: (e) => setForm((f) => ({ ...f, treatedAnimalCount: e.target.value })),
                  className: tagValidations.length > 0 ? "bg-green-50 text-green-800 font-semibold" : ""
                }
              ),
              tagValidations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 mt-1", children: [
                "Auto-set from ",
                tagValidations.filter((v) => v.animal).length,
                " verified tags."
              ] })
            ] })
          ] }),
          form.treatmentScope === "whole_herd" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
                "Herd ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "w-full h-12 rounded-xl border-2 border-border bg-white px-4 py-2 text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10",
                  value: form.herdId,
                  onChange: (e) => {
                    const newHerdId = e.target.value;
                    const autoCount = newHerdId ? String(animals.filter((a) => a.herdId === Number(newHerdId)).length || "") : form.treatedAnimalCount;
                    setForm((f) => ({ ...f, herdId: newHerdId, treatedAnimalCount: autoCount }));
                  },
                  required: true,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select herd..." }),
                    herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: h.id, children: [
                      h.name,
                      " (",
                      h.type,
                      ")"
                    ] }, h.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Total Animals in Herd" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "1",
                  placeholder: "Auto-filled from registered animals",
                  value: form.treatedAnimalCount,
                  onChange: (e) => setForm((f) => ({ ...f, treatedAnimalCount: e.target.value }))
                }
              ),
              form.herdId && Number(form.treatedAnimalCount) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-violet-700 mt-1", children: "Auto-filled · adjust if animals have moved in/out." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "vmd-medicine-list", children: VMD_MEDICINES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m.name }, m.name)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "vet-name-list", children: uniqueVetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Medicine Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs font-normal text-foreground/40", children: "Start typing to search the UK VMD reference list of licensed veterinary medicines" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                list: "vmd-medicine-list",
                placeholder: "e.g. Alamycin 300, Metacam 20 mg/ml, Draxxin...",
                value: form.medicineName,
                onChange: (e) => {
                  const val = e.target.value;
                  const match = findVmdMedicine(val);
                  setVmdMatch(match);
                  setForm((f) => ({
                    ...f,
                    medicineName: val,
                    administrationRoute: match?.route && !f.administrationRoute ? match.route : f.administrationRoute
                  }));
                },
                required: true
              }
            ),
            form.medicineName.length >= 3 && (vmdMatch ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-3 h-3" }),
                "VMD Reference Listed"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/60", children: vmdMatch.activeIngredient }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground/70", children: vmdMatch.legalCategory }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: vmdMatch.species.join(", ") })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-1.5 text-xs text-amber-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3 h-3 shrink-0" }),
              "Not found in VMD reference list — verify product name against",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.vmd.defra.gov.uk/productinformationdatabase/", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "vmd.defra.gov.uk" })
            ] }))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Batch / Licence Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. UK/V/0083451/0001", value: form.batchNumber, onChange: (e) => setForm((f) => ({ ...f, batchNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Administered By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of person administering", value: form.administeredBy, onChange: (e) => setForm((f) => ({ ...f, administeredBy: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Date Administered ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.administeredDate, onChange: (e) => setForm((f) => ({ ...f, administeredDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Administration Route" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
                value: ADMIN_ROUTES.filter((r) => r !== "Other").includes(form.administrationRoute) ? form.administrationRoute : form.administrationRoute ? "Other" : "",
                onChange: (e) => setForm((f) => ({ ...f, administrationRoute: e.target.value })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select route..." }),
                  ADMIN_ROUTES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r, children: r === "Other" ? "Other (please specify)" : r }, r))
                ]
              }
            ),
            (form.administrationRoute === "Other" || form.administrationRoute && !ADMIN_ROUTES.filter((r) => r !== "Other").includes(form.administrationRoute)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                className: "mt-1.5",
                value: form.administrationRoute === "Other" ? "" : form.administrationRoute,
                onChange: (e) => setForm((f) => ({ ...f, administrationRoute: e.target.value || "Other" })),
                placeholder: "Please specify administration route…",
                autoFocus: form.administrationRoute === "Other"
              }
            ),
            vmdMatch && form.administrationRoute && form.administrationRoute !== "Other" && form.administrationRoute !== vmdMatch.route && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-1", children: [
              "VMD reference typical route: ",
              vmdMatch.route
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Dose Given (per animal)",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs font-normal text-foreground/40", children: "total amount administered" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "0",
                  step: "0.1",
                  placeholder: "Amount",
                  className: "flex-1",
                  value: form.doseAmount,
                  onChange: (e) => setForm((f) => ({ ...f, doseAmount: e.target.value }))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  className: "h-12 rounded-xl border-2 border-border bg-transparent px-3 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 min-w-[90px]",
                  value: form.doseUnit,
                  onChange: (e) => setForm((f) => ({ ...f, doseUnit: e.target.value })),
                  children: DOSE_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u, children: u }, u))
                }
              )
            ] }),
            editing && form.dosage && !form.doseAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-1", children: [
              "Saved value: ",
              form.dosage
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Withdrawal Period (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", placeholder: "e.g. 7 — leave blank if none", value: form.withdrawalPeriodDays, onChange: (e) => setForm((f) => ({ ...f, withdrawalPeriodDays: e.target.value })) }),
            previewWdEnd && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-1 font-medium", children: [
              "Withdrawal ends: ",
              formatDate(previewWdEnd)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Prescribing Vet",
              uniqueVetNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs font-normal text-foreground/40", children: "— select from your registered vets or type a new name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                list: "vet-name-list",
                placeholder: uniqueVetNames.length > 0 ? "Type or select vet name..." : "Vet name / practice",
                value: form.vetName,
                onChange: (e) => setForm((f) => ({ ...f, vetName: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Reason / Indication" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Mastitis, lameness, respiratory", value: form.reason, onChange: (e) => setForm((f) => ({ ...f, reason: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Any additional information...", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
              "Link to Written Prescription",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs font-normal text-foreground/40", children: "— optional, creates audit trail" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PrescriptionCombobox,
              {
                prescriptions,
                value: form.prescriptionId ?? "",
                onChange: (id) => setForm((f) => ({ ...f, prescriptionId: id }))
              }
            ),
            (() => {
              const linkedRx = form.prescriptionId ? prescriptions.find((p) => p.id === Number(form.prescriptionId)) : null;
              if (!linkedRx) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 p-3 rounded-lg border border-blue-200 bg-blue-50 text-xs text-blue-900 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-blue-800", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 text-blue-600" }),
                  "Prescription found"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-0.5", children: [
                  linkedRx.productName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Product:" }),
                    " ",
                    linkedRx.productName
                  ] }),
                  linkedRx.activeIngredient && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Active:" }),
                    " ",
                    linkedRx.activeIngredient
                  ] }),
                  linkedRx.vetName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Vet:" }),
                    " ",
                    linkedRx.vetName
                  ] }),
                  linkedRx.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Expires:" }),
                    " ",
                    new Date(linkedRx.expiryDate).toLocaleDateString("en-GB")
                  ] }),
                  linkedRx.withdrawalPeriodMeat != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "W/D Meat:" }),
                    " ",
                    linkedRx.withdrawalPeriodMeat,
                    "d"
                  ] }),
                  linkedRx.withdrawalPeriodMilk != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "W/D Milk:" }),
                    " ",
                    linkedRx.withdrawalPeriodMilk,
                    "d"
                  ] })
                ] }),
                linkedRx.indicationOrDiagnosis && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "italic text-blue-700", children: linkedRx.indicationOrDiagnosis })
              ] });
            })()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full pt-3 border-t border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3.5 h-3.5" }),
              "Link to Stock Register",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs font-normal text-foreground/40", children: "— optional, auto-deducts from inventory" })
            ] }),
            stockItemsForPicker.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Stock item" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: String(form.stockItemId ?? ""),
                    onValueChange: (v) => setForm((f) => ({
                      ...f,
                      stockItemId: v,
                      medicineName: v ? stockItemsForPicker.find((s) => String(s.id) === v)?.name ?? f.medicineName : f.medicineName
                    })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select item from stock register…" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— Not linked —" }),
                        stockItemsForPicker.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                          s.name,
                          s.unit ? ` (${s.unit})` : ""
                        ] }, s.id))
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Quantity used from stock" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: "0",
                    step: "0.01",
                    className: "h-8 text-sm",
                    placeholder: "e.g. 10",
                    value: form.stockQuantityUsed,
                    onChange: (e) => setForm((f) => ({ ...f, stockQuantityUsed: e.target.value })),
                    disabled: !form.stockItemId
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "No stock items found. Add medicines to your",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/stock", className: "underline text-blue-600", children: "Stock Register" }),
              " to enable automatic inventory deductions."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `rounded-xl border-2 p-4 space-y-3 transition-colors ${form.adverseReactionSuspected ? "border-red-400 bg-red-50" : "border-border bg-muted/20"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: `w-4 h-4 ${form.adverseReactionSuspected ? "text-red-600" : "text-muted-foreground"}` }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-semibold ${form.adverseReactionSuspected ? "text-red-800" : "text-foreground/70"}`, children: "Suspected Adverse Reaction (ADR)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: form.adverseReactionSuspected,
                        onChange: (e) => setForm((f) => ({ ...f, adverseReactionSuspected: e.target.checked })),
                        className: "w-4 h-4 accent-red-600"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/70", children: "Flag this treatment as a suspected ADR" })
                  ] })
                ] }),
                form.adverseReactionSuspected && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-800", children: "VMR 2013 Reg 58: report to your prescribing vet immediately. Serious reactions must reach the VMD SARSS portal within 15 days; non-serious within 90 days." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-red-800 mb-1 block", children: "Clinical Signs Observed" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          placeholder: "Describe the adverse signs observed (e.g. anaphylaxis, injection-site reaction, neurological signs)",
                          value: form.adverseReactionSigns,
                          onChange: (e) => setForm((f) => ({ ...f, adverseReactionSigns: e.target.value })),
                          className: "border-red-300 focus:border-red-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-red-800 mb-1 block", children: "Severity" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "select",
                        {
                          className: "w-full h-12 rounded-xl border-2 border-red-300 bg-transparent px-4 py-2 text-base focus:outline-none focus:border-red-500",
                          value: form.adverseReactionSeverity,
                          onChange: (e) => setForm((f) => ({ ...f, adverseReactionSeverity: e.target.value })),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select severity..." }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "mild", children: "Mild — self-limiting, no treatment required" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderate", children: "Moderate — required treatment" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "severe", children: "Severe — life-threatening" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fatal", children: "Fatal" })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-red-800 mb-1 block", children: "Onset (hours after treatment)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "number",
                          min: "0",
                          placeholder: "e.g. 2",
                          value: form.adverseReactionOnsetHours,
                          onChange: (e) => setForm((f) => ({ ...f, adverseReactionOnsetHours: e.target.value })),
                          className: "border-red-300"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-red-800 mb-1 block", children: "Outcome" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "select",
                        {
                          className: "w-full h-12 rounded-xl border-2 border-red-300 bg-transparent px-4 py-2 text-base focus:outline-none focus:border-red-500",
                          value: form.adverseReactionOutcome,
                          onChange: (e) => setForm((f) => ({ ...f, adverseReactionOutcome: e.target.value })),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select outcome..." }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "recovered", children: "Recovered" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "recovering", children: "Recovering" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "not_recovered", children: "Not recovered" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fatal", children: "Fatal" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "Unknown" })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-red-800 mb-1 block", children: "Date Reported to Vet" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "date",
                          value: form.reportedToVetDate,
                          onChange: (e) => setForm((f) => ({ ...f, reportedToVetDate: e.target.value })),
                          className: "border-red-300"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-red-800 mb-1 block", children: "Date Vet Reported to VMD SARSS" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "date",
                          value: form.vetReportedToVmdDate,
                          onChange: (e) => setForm((f) => ({ ...f, vetReportedToVmdDate: e.target.value })),
                          className: "border-red-300"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-red-800 mb-1 block", children: "VMD SARSS Reference Number" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          placeholder: "e.g. SARSS-2025-12345",
                          value: form.vmdSarssRef,
                          onChange: (e) => setForm((f) => ({ ...f, vmdSarssRef: e.target.value })),
                          className: "border-red-300"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-700 italic", children: [
                    "Report via the VMD SARSS online portal at ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.vmd.defra.gov.uk/adversereactionreporting/", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "vmd.defra.gov.uk/adversereactionreporting/" })
                  ] })
                ] })
              ]
            }
          ) }),
          (isOrganicHerdSelected || form.isOrganicTreatment) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full rounded-xl border-2 border-green-400 bg-green-50 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-100 border border-green-300 rounded-full px-2.5 py-1", children: "🌿 Organic Treatment Compliance" }),
              selectedHerd?.organicCertBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-700", children: [
                selectedHerd.organicCertBody,
                selectedHerd.organicCertNumber ? ` · ${selectedHerd.organicCertNumber}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-800", children: [
              "UK organic standards require withdrawal periods to be ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "doubled" }),
              " for organic animals. Complete the fields below to generate a compliant organic treatment record."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-green-800 mb-1 block", children: "Doubled Withdrawal Period (days)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: "0",
                    placeholder: "Standard × 2",
                    value: form.doubledWithdrawalDays,
                    onChange: (e) => setForm((f) => ({ ...f, doubledWithdrawalDays: e.target.value, isOrganicTreatment: true })),
                    className: "border-green-300 focus:border-green-500"
                  }
                ),
                form.withdrawalPeriodDays && !form.doubledWithdrawalDays && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: "mt-1 text-xs text-green-700 underline",
                    onClick: () => setForm((f) => ({ ...f, doubledWithdrawalDays: String(Number(form.withdrawalPeriodDays) * 2), isOrganicTreatment: true })),
                    children: [
                      "Auto-fill: ",
                      Number(form.withdrawalPeriodDays) * 2,
                      " days (standard × 2)"
                    ]
                  }
                ),
                previewDoubledWdEnd && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 mt-1 font-medium", children: [
                  "Organic withdrawal ends: ",
                  formatDate(previewDoubledWdEnd)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-green-800 mb-1 block", children: "Certifier Notified?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 h-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: form.certifierNotified,
                      onChange: (e) => setForm((f) => ({ ...f, certifierNotified: e.target.checked, isOrganicTreatment: true })),
                      className: "w-4 h-4 accent-green-600"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-green-800", children: "Certifier informed" })
                ] }) })
              ] }),
              form.certifierNotified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-green-800 mb-1 block", children: "Date Notified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "date",
                    value: form.certifierNotifiedDate,
                    onChange: (e) => setForm((f) => ({ ...f, certifierNotifiedDate: e.target.value })),
                    className: "border-green-300"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 italic", children: "This treatment will be automatically logged in the Organic Treatment Compliance register for this herd." })
          ] })
        ] }),
        form.treatmentScope === "group" && unmatchedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            unmatchedCount,
            " ear tag",
            unmatchedCount !== 1 ? "s" : "",
            " still unmatched. Correct them above before saving, or save now and they will not appear on individual animal records."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editing ? updateM : createM, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: closeForm, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isSubmitting, children: [
            isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editing ? "Save Changes" : "Add to Register"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!pendingBodyWithUnmatched, onOpenChange: (o) => {
      if (!o) {
        setPendingBodyWithUnmatched(null);
        createM.reset();
        updateM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "30rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5 text-amber-600" }),
          "Unverified Ear Tags"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          unmatchedCount,
          " ear tag",
          unmatchedCount !== 1 ? "s" : "",
          " could not be matched to a registered animal. Those animals will not have this medicine record on their individual profile."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/70 px-1", children: "You can go back and correct the tags, or save now. The unmatched tags will be discarded from the record — only the verified animals will be linked." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editing ? updateM : createM, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPendingBodyWithUnmatched(null), children: "Go back and fix" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: confirmSaveWithUnmatched, disabled: isSubmitting, children: [
          isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
          "Save with verified tags only"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteId, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "28rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Medicine Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This will permanently remove the record from the medicine register. This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteM, message: "Failed to delete — the record is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteM.mutate(deleteId), disabled: deleteM.isPending, children: [
          deleteM.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
          "Delete"
        ] })
      ] })
    ] }) }),
    raiseTaskRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskRecord,
        onClose: () => setRaiseTaskRecord(null),
        defaultTitle: `Withdrawal check: ${raiseTaskRecord.medicineName} — due ${raiseTaskRecord.withdrawalEndDate ? new Date(raiseTaskRecord.withdrawalEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBC"}`,
        defaultDescription: `Verify animals treated with ${raiseTaskRecord.medicineName} have completed their withdrawal period before slaughter or milk use.`,
        defaultDueDate: raiseTaskRecord.withdrawalEndDate?.slice(0, 10) ?? "",
        taskType: "medicine_followup",
        module: "Medicine Register"
      }
    )
  ] });
}
export {
  MedicinePageDedicated as default
};
