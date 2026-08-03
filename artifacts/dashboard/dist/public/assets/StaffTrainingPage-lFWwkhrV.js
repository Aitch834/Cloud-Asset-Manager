import { b as useAppStore, m as useQuery, j as jsxRuntimeExports, p as Link, d as Button, c as useQueryClient, a as useToast, r as reactExports, Q as React, O as useMutation, I as Input, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, e as LoaderCircle } from "./index-D3ci1CPp.js";
import { u as usePersistedTab } from "./use-persisted-tab-B7XId28y.js";
import { A as AppLayout, c as ClipboardList } from "./AppLayout-DbjZWq5V.js";
import { T as Textarea } from "./textarea-BPPsYQr1.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, g as SelectSeparator, e as SelectGroup, f as SelectLabel } from "./select-x_Q45jhl.js";
import { B as Badge } from "./badge-BV4p060L.js";
import { T as TabBar, a as TabButton } from "./tab-button-BeiAjhI4.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CGGzmRaT.js";
import { u as useUpload } from "./use-upload-CXxWTgQl.js";
import { C as CropYearSelector } from "./CropYearSelector-yXT58ZR0.js";
import { i as isInCropYear, c as currentCropYear } from "./cropYear-Dmv-iNR6.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-DayjaTgR.js";
import { S as StaffSelect } from "./staff-select-Xg3aq-Tj.js";
import { G as GraduationCap } from "./shield-alert-pZG9KGQ8.js";
import { P as Printer } from "./printer-BzElkSG2.js";
import { T as TriangleAlert } from "./triangle-alert-Bqcrw-v5.js";
import { H as History } from "./history-Cs5tbJMn.js";
import { E as Eye } from "./eye-CIHS1oSv.js";
import { P as Pencil } from "./pencil-BMy1aUAs.js";
import { A as Award } from "./award-YXhsbnD7.js";
import { F as File } from "./file-CS7KYOsr.js";
import { P as Paperclip } from "./paperclip-DE1eqzKn.js";
import { C as ChevronUp } from "./chevron-up-NX4-4gA8.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-B2GshPcl.js";
import { R as RefreshCw } from "./refresh-cw-DMTq_FO2.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell, L as Legend } from "./generateCategoricalChart-Gpiw4lrs.js";
import { B as BarChart } from "./BarChart-BLxfXeEi.js";
import { C as CartesianGrid } from "./CartesianGrid-BR4XTEOU.js";
import { P as PieChart, a as Pie } from "./PieChart-CVvG8L4O.js";
import { U as Upload } from "./upload-Bxt6K0oE.js";
import "./use-safe-clerk-DCmy8ml9.js";
import "./database-DD352gRa.js";
import "./shield-check-BRixbyJP.js";
import "./tractor-DVIW15KL.js";
import "./index-Qju3PjcJ.js";
import "./index-OKZ1NYld.js";
const STAFF_TAB_IDS = ["training", "certificates", "rtw", "courses", "analytics", "matrix"];
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
function expiryBadge(expiry) {
  if (!expiry) return null;
  const now = /* @__PURE__ */ new Date();
  const exp = new Date(expiry);
  const daysLeft = Math.floor((exp.getTime() - now.getTime()) / 864e5);
  if (daysLeft < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }, children: "Expired" });
  if (daysLeft <= 60) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }, children: [
    "Expires ",
    fmt(expiry)
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }, children: [
    "Valid · ",
    fmt(expiry)
  ] });
}
const CERT_GROUPS = [
  {
    group: "Pesticide Application (NPTC/Lantra)",
    certs: [
      "PA1 — Safe use of pesticides",
      "PA2 — Ground crop sprayers",
      "PA3 — Hand-held applicators",
      "PA4 — Broadcast air-assisted applicators",
      "PA6 — Amenity & hard surfaces",
      "PA6AW — Aerial application (UAV/drone)",
      "Safe use of rodenticides"
    ]
  },
  {
    group: "Livestock Welfare & Husbandry",
    certs: [
      "WASK/WATOK — On-farm Emergency Slaughter Certificate of Competence",
      "Cattle Disbudding & Dehorning (NPTC/Lantra)",
      "Cattle Castration (NPTC/Lantra)",
      "Sheep Castration & Tail Docking (NPTC/Lantra)",
      "Pig Castration & Tail Docking (NPTC/Lantra)",
      "Bovine Artificial Insemination (AI) Certificate",
      "Poultry Emergency Culling Competence",
      "Poultry Catching & Handling (Lantra)"
    ]
  },
  {
    group: "Animal Transport",
    certs: [
      "Animal Transport Certificate — Category 1 (journeys under 8 hours)",
      "Animal Transport Certificate — Category 2 (long journeys, over 8 hours)",
      "Certificate of Competence — Livestock Vehicle Driver"
    ]
  },
  {
    group: "Machinery & Equipment (NPORS/Lantra/RTITB)",
    certs: [
      "Tractor & Machinery Safety",
      "Telehandler Operator (NPORS/Lantra/RTITB)",
      "Counterbalance Fork Lift Truck (FLT)",
      "Reach Fork Lift Truck (FLT)",
      "ATV / Quad Bike Safety Certificate (Lantra)",
      "ROLO — Reversing Operations & Lifting Operations (Banks Person)",
      "Combine Harvester Operation (NPTC/Lantra)",
      "Grain Dryer Operation"
    ]
  },
  {
    group: "Chainsaw (NPTC/Lantra)",
    certs: [
      "CS30 — Chainsaw crosscutting & maintenance",
      "CS31 — Felling small trees",
      "CS32 — Felling medium trees",
      "CS38 — Chainsaw from rope & harness"
    ]
  },
  {
    group: "Health & Safety",
    certs: [
      "First Aid at Work (FAW) — 3 year",
      "Emergency First Aid at Work (EFAW) — 1 year",
      "Fire Warden / Fire Marshal",
      "Manual Handling",
      "Working at Height",
      "Confined Space Entry",
      "Asbestos Awareness",
      "COSHH Awareness"
    ]
  },
  {
    group: "Agronomy & Advisory",
    certs: [
      "BASIS Certificate in Agronomy",
      "BASIS Certificate in Crop Protection",
      "FACTS — Fertiliser Adviser",
      "NRoSO — National Register of Spray Operators (CPD)"
    ]
  },
  {
    group: "Veterinary & Medicines",
    certs: [
      "AMTRA SQP — Suitably Qualified Person (veterinary medicines)",
      "Responsible for Medicines (named person)",
      "BVetMed / MRCVS — Veterinary Surgeon"
    ]
  },
  {
    group: "Food, Hygiene & Environment",
    certs: [
      "Food Hygiene — Level 2 Award",
      "Food Hygiene — Level 3 Award",
      "Food Safety in Manufacturing (Level 3)",
      "Water Hygiene Awareness"
    ]
  },
  {
    group: "Formal Qualifications",
    certs: [
      "City & Guilds Level 2 Agriculture",
      "City & Guilds Level 3 Agriculture",
      "BTEC Level 3 Agriculture",
      "HND Agriculture",
      "BSc Agriculture / Land Management",
      "NVQ Level 2 / 3 Agriculture"
    ]
  },
  {
    group: "Other",
    certs: ["Other — see notes"]
  }
];
const ALL_CERT_TYPES = CERT_GROUPS.flatMap((g) => g.certs);
const CERT_ISSUER_MAP = {
  // Pesticides
  "PA1 — Safe use of pesticides": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "PA2 — Ground crop sprayers": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "PA3 — Hand-held applicators": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "PA4 — Broadcast air-assisted applicators": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "PA6 — Amenity & hard surfaces": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "PA6AW — Aerial application (UAV/drone)": ["NPTC Awards (Lantra)", "Lantra Awards", "Civil Aviation Authority (CAA)"],
  "Safe use of rodenticides": ["CRRU UK", "NPTC Awards (Lantra)"],
  // Livestock Welfare
  "WASK/WATOK — On-farm Emergency Slaughter Certificate of Competence": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "Cattle Disbudding & Dehorning (NPTC/Lantra)": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "Cattle Castration (NPTC/Lantra)": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "Sheep Castration & Tail Docking (NPTC/Lantra)": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "Pig Castration & Tail Docking (NPTC/Lantra)": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "Bovine Artificial Insemination (AI) Certificate": ["NPTC Awards (Lantra)", "Genus ABS", "Viking Genetics UK", "DAFFA"],
  "Poultry Emergency Culling Competence": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "Poultry Catching & Handling (Lantra)": ["Lantra Awards", "NPTC Awards (Lantra)"],
  // Animal Transport
  "Animal Transport Certificate — Category 1 (journeys under 8 hours)": ["APHA (Animal & Plant Health Agency)", "DAERA (Northern Ireland)"],
  "Animal Transport Certificate — Category 2 (long journeys, over 8 hours)": ["APHA (Animal & Plant Health Agency)", "DAERA (Northern Ireland)"],
  "Certificate of Competence — Livestock Vehicle Driver": ["APHA (Animal & Plant Health Agency)", "DAERA (Northern Ireland)"],
  // Machinery
  "Tractor & Machinery Safety": ["NPTC Awards (Lantra)", "Lantra Awards", "NPORS", "RTITB"],
  "Telehandler Operator (NPORS/Lantra/RTITB)": ["NPORS", "Lantra Awards", "RTITB", "CPCS"],
  "Counterbalance Fork Lift Truck (FLT)": ["RTITB", "NPORS", "CPCS", "AITT"],
  "Reach Fork Lift Truck (FLT)": ["RTITB", "NPORS", "CPCS", "AITT"],
  "ATV / Quad Bike Safety Certificate (Lantra)": ["Lantra Awards", "NPTC Awards (Lantra)"],
  "ROLO — Reversing Operations & Lifting Operations (Banks Person)": ["CPCS", "NPORS"],
  "Combine Harvester Operation (NPTC/Lantra)": ["NPTC Awards (Lantra)", "Lantra Awards"],
  "Grain Dryer Operation": ["NPTC Awards (Lantra)", "Lantra Awards", "NABIM"],
  // Chainsaw
  "CS30 — Chainsaw crosscutting & maintenance": ["NPTC Awards (Lantra)", "Lantra Awards", "City & Guilds"],
  "CS31 — Felling small trees": ["NPTC Awards (Lantra)", "Lantra Awards", "City & Guilds"],
  "CS32 — Felling medium trees": ["NPTC Awards (Lantra)", "Lantra Awards", "City & Guilds"],
  "CS38 — Chainsaw from rope & harness": ["NPTC Awards (Lantra)", "Lantra Awards", "City & Guilds"],
  // Health & Safety
  "First Aid at Work (FAW) — 3 year": ["St John Ambulance", "British Red Cross", "RoSPA", "HSE-approved provider"],
  "Emergency First Aid at Work (EFAW) — 1 year": ["St John Ambulance", "British Red Cross", "RoSPA", "HSE-approved provider"],
  "Fire Warden / Fire Marshal": ["IOSH", "NEBOSH", "Highfield Awarding Body", "St John Ambulance"],
  "Manual Handling": ["IOSH", "Highfield Awarding Body", "RoSPA"],
  "Working at Height": ["IPAF", "PASMA", "IOSH", "NEBOSH"],
  "Confined Space Entry": ["IOSH", "BOHS", "SPA (Safer People)"],
  "Asbestos Awareness": ["IOSH", "BOHS", "Highfield Awarding Body"],
  "COSHH Awareness": ["IOSH", "Highfield Awarding Body", "NEBOSH"],
  // Agronomy
  "BASIS Certificate in Agronomy": ["BASIS Registration Ltd"],
  "BASIS Certificate in Crop Protection": ["BASIS Registration Ltd"],
  "FACTS — Fertiliser Adviser": ["FACTS (Fertiliser Advisers Certification & Training Scheme)"],
  "NRoSO — National Register of Spray Operators (CPD)": ["NRoSO (National Register of Spray Operators)"],
  // Veterinary
  "AMTRA SQP — Suitably Qualified Person (veterinary medicines)": ["AMTRA"],
  "Responsible for Medicines (named person)": ["Veterinary Medicines Directorate (VMD)", "Farm veterinary practice"],
  "BVetMed / MRCVS — Veterinary Surgeon": ["RCVS (Royal College of Veterinary Surgeons)"],
  // Food & Hygiene
  "Food Hygiene — Level 2 Award": ["Highfield Awarding Body", "RSPH (Royal Society for Public Health)", "CIEH (Chartered Institute of Environmental Health)", "City & Guilds"],
  "Food Hygiene — Level 3 Award": ["Highfield Awarding Body", "RSPH (Royal Society for Public Health)", "CIEH (Chartered Institute of Environmental Health)", "City & Guilds"],
  "Food Safety in Manufacturing (Level 3)": ["Highfield Awarding Body", "RSPH (Royal Society for Public Health)", "CIEH (Chartered Institute of Environmental Health)"],
  "Water Hygiene Awareness": ["EUSR (Energy & Utility Skills Register)", "Highfield Awarding Body", "City & Guilds"],
  // Formal Qualifications
  "City & Guilds Level 2 Agriculture": ["City & Guilds"],
  "City & Guilds Level 3 Agriculture": ["City & Guilds"],
  "BTEC Level 3 Agriculture": ["Pearson / BTEC"],
  "HND Agriculture": ["Pearson / BTEC"],
  "BSc Agriculture / Land Management": ["University awarding body"],
  "NVQ Level 2 / 3 Agriculture": ["City & Guilds", "Lantra Awards", "NPTC Awards (Lantra)"]
};
const COMPLIANCE_FLAGS = [
  { label: "WASK/WATOK (Emergency Slaughter)", match: "WASK/WATOK", detail: "Legally required — any farm with livestock must have at least one person holding a Certificate of Competence for on-farm emergency slaughter.", severity: "error" },
  { label: "Animal Transport Certificate Cat. 1", match: "Animal Transport Certificate — Category 1", detail: "Required by law for anyone transporting live animals on journeys over 65km.", severity: "error" },
  { label: "First Aid at Work or EFAW", match: "First Aid", detail: "First aid coverage is required under the Health & Safety (First-Aid) Regulations 1981 for any farm with employees.", severity: "warning" },
  { label: "PA1 — Safe use of pesticides", match: "PA1 —", detail: "Any person using or supervising the use of professional pesticide products must hold at minimum a PA1 certificate.", severity: "warning" }
];
function StaffHistoryDialog({ member, allRecords, resolveStaffName, onClose }) {
  const [yearFilter, setYearFilter] = React.useState("all");
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const memberRecords = allRecords.filter((r) => r.userId === member.userId || resolveStaffName(r.userId) === member.name);
  const sorted = [...memberRecords].sort((a, b) => new Date(b.trainingDate ?? 0).getTime() - new Date(a.trainingDate ?? 0).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter((r) => r.trainingDate && new Date(r.trainingDate).getFullYear() === yearFilter);
  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  }
  function expiryStatus(d) {
    if (!d) return { text: "No expiry", color: "#6b7280", bg: "#f9fafb" };
    const exp = new Date(d);
    const now = /* @__PURE__ */ new Date();
    const days = Math.ceil((exp.getTime() - now.getTime()) / 864e5);
    if (days < 0) return { text: `Expired ${fmtDate(d)}`, color: "#dc2626", bg: "#fef2f2" };
    if (days <= 90) return { text: `Expires ${fmtDate(d)} (${days}d)`, color: "#b45309", bg: "#fffbeb" };
    return { text: `Valid until ${fmtDate(d)}`, color: "#15803d", bg: "#f0fdf4" };
  }
  function handlePrint() {
    const rows = filtered.map((r) => {
      expiryStatus(r.expiryDate);
      return `<tr><td>${fmtDate(r.trainingDate)}</td><td>${r.trainingTitle}</td><td>${r.trainingProvider || "—"}</td><td>${r.competencyAchieved || "—"}</td><td>${r.expiryDate ? fmtDate(r.expiryDate) : "No expiry"}</td><td>${r.assessorName || "—"}</td><td>${r.notes || ""}</td></tr>`;
    }).join("");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Training History — ${member.name}</title><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:5px 7px;text-align:left;font-size:8.5pt}td{padding:4px 7px;border-bottom:1px solid #e5e7eb;font-size:9pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1 style="font-size:14pt">Training &amp; Competency Record — ${member.name}</h1><p style="font-size:9pt;color:#555">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} · ${filtered.length} record${filtered.length !== 1 ? "s" : ""}${yearFilter !== "all" ? ` (${yearFilter})` : ""}</p><table><thead><tr><th>Date</th><th>Training / Course</th><th>Provider</th><th>Competency Achieved</th><th>Expiry</th><th>Assessor</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">H&amp;S / COSHH requirement: retain training records for duration of employment plus 3 years.</p></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-green-700" }),
      "Training History — ",
      member.name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap border-b pb-3", children: [
      ["all", ...recentYears].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setYearFilter(y), style: { padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }, children: y === "all" ? "All years" : y }, y)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " record",
        filtered.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "w-9 h-9 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "No training records for ",
        member.name,
        yearFilter !== "all" ? ` in ${yearFilter}` : ""
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: filtered.map((r) => {
      const exp = expiryStatus(r.expiryDate);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3 px-1 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 w-24 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800 leading-tight", children: r.trainingDate ? new Date(r.trainingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: r.trainingDate ? new Date(r.trainingDate).getFullYear() : "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800 leading-tight", children: r.trainingTitle }),
          r.trainingProvider && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: r.trainingProvider }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", padding: "2px 7px", borderRadius: 99, background: exp.bg, color: exp.color, fontWeight: 600 }, children: exp.text }),
            r.competencyAchieved && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.7rem", color: "#6b7280" }, children: [
              "· ",
              r.competencyAchieved
            ] })
          ] }),
          r.assessorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Assessed by: ",
            r.assessorName
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: r.notes })
        ] })
      ] }, r.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "border-t pt-3 flex-row items-center gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex-1", children: [
        "H&S / COSHH: retain training records for duration of employment plus ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 years" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handlePrint, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print / Export"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: onClose, children: "Close" })
      ] })
    ] })
  ] }) });
}
function TrainingTab({ farmId, staffNames, staffLoading, defaultMember }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState(defaultMember ?? "");
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [deptFilter, setDeptFilter] = reactExports.useState("all");
  const [historyMember, setHistoryMember] = reactExports.useState(null);
  const membersQ = useFarmMembers(farmId);
  const memberNameMap = React.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    (membersQ.data?.members ?? []).forEach((m) => {
      const full = memberFullName(m);
      map.set(String(m.id), full);
      map.set(full, full);
      if (m.linkedUserId) map.set(m.linkedUserId, full);
    });
    return map;
  }, [membersQ.data]);
  const resolveStaffName = (uid) => memberNameMap.get(String(uid)) ?? memberNameMap.get(uid) ?? (uid || "—");
  const memberDeptMap = React.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    (membersQ.data?.members ?? []).forEach((m) => {
      const dept = m.departmentName ?? null;
      map.set(String(m.id), dept);
      map.set(memberFullName(m), dept);
      if (m.linkedUserId) map.set(m.linkedUserId, dept);
    });
    return map;
  }, [membersQ.data]);
  const trainingDepartments = React.useMemo(() => {
    const seen = /* @__PURE__ */ new Set();
    (membersQ.data?.members ?? []).forEach((m) => {
      if (m.departmentName) seen.add(m.departmentName);
    });
    return Array.from(seen).sort();
  }, [membersQ.data]);
  const coursesQ = useQuery({
    queryKey: ["training-courses", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training-courses`).then((r) => r.json()),
    enabled: !!farmId
  });
  const providersQ = useQuery({
    queryKey: ["training-providers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training-providers`).then((r) => r.json()),
    enabled: !!farmId
  });
  const courses = coursesQ.data?.records ?? [];
  const providers = providersQ.data?.records ?? [];
  const [courseSearch, setCourseSearch] = reactExports.useState("");
  const [courseDropOpen, setCourseDropOpen] = reactExports.useState(false);
  const empty = { userId: "", trainingTitle: "", trainingProvider: "", trainingProviderId: "", courseId: "", trainingDate: "", expiryDate: "", competencyAchieved: "", assessorName: "", notes: "" };
  const [form, setForm] = reactExports.useState({ ...empty });
  const q = useQuery({
    queryKey: ["training-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training`).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = (q.data?.records ?? []).filter((r) => {
    const inYear = isInCropYear(r.trainingDate, cropYear);
    const matchesSearch = !search || r.trainingTitle.toLowerCase().includes(search.toLowerCase()) || (r.trainingProvider ?? "").toLowerCase().includes(search.toLowerCase());
    const memberDept = memberDeptMap.get(String(r.userId)) ?? memberDeptMap.get(r.userId) ?? null;
    const matchesDept = deptFilter === "all" || memberDept === deptFilter;
    return inYear && matchesSearch && matchesDept;
  });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/training`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Training record added" });
      qc.invalidateQueries({ queryKey: ["training-records", farmId] });
      setAddOpen(false);
      setForm({ ...empty });
      setCourseSearch("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/training/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Training record updated" });
      qc.invalidateQueries({ queryKey: ["training-records", farmId] });
      setEditItem(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/training/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Record deleted" });
      qc.invalidateQueries({ queryKey: ["training-records", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditItem(r);
    setForm({
      userId: r.userId ?? "",
      trainingTitle: r.trainingTitle,
      trainingProvider: r.trainingProvider ?? "",
      trainingProviderId: r.trainingProviderId ? String(r.trainingProviderId) : "",
      courseId: r.courseId ? String(r.courseId) : "",
      trainingDate: r.trainingDate ? r.trainingDate.slice(0, 10) : "",
      expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      competencyAchieved: r.competencyAchieved ?? "",
      assessorName: r.assessorName ?? "",
      notes: r.notes ?? ""
    });
    setCourseSearch(r.trainingTitle ?? "");
  }
  function handleSubmit(isEdit) {
    const providerIdNum = form.trainingProviderId && form.trainingProviderId !== "__custom__" ? parseInt(form.trainingProviderId) : null;
    const body = {
      ...form,
      courseId: form.courseId ? parseInt(form.courseId) : null,
      trainingProviderId: providerIdNum
    };
    if (isEdit && editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }
  function selectCourse(course) {
    const expiryDate = course.defaultValidityMonths && form.trainingDate ? (() => {
      const d = new Date(form.trainingDate);
      d.setMonth(d.getMonth() + course.defaultValidityMonths);
      return d.toISOString().slice(0, 10);
    })() : form.expiryDate;
    setForm((f) => ({
      ...f,
      trainingTitle: course.name,
      courseId: String(course.id),
      expiryDate
    }));
    setCourseSearch(course.name);
    setCourseDropOpen(false);
  }
  const expiredCount = records.filter((r) => r.expiryDate && new Date(r.expiryDate) < /* @__PURE__ */ new Date()).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search training records…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-[240px]" }),
      trainingDepartments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deptFilter, onValueChange: setDeptFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All departments" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All departments" }),
          trainingDepartments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d, children: d }, d))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1 } }),
      expiredCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13 }),
        " ",
        expiredCount,
        " expired"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm({ ...empty });
        setCourseSearch("");
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        " Add Training Record"
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { size: 32, style: { margin: "0 auto 8px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No training records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Log training courses, safety briefings, and competency assessments for all farm operators." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "2px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Staff Member" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Training" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Provider" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Expiry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Competency" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { width: 100 } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: resolveStaffName(r.userId) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.trainingTitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.trainingProvider || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: fmt(r.trainingDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.expiryDate ? expiryBadge(r.expiryDate) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "No expiry" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8125rem" }, children: r.competencyAchieved || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0, color: "#6b7280" }, onClick: () => setHistoryMember({ userId: String(r.userId), name: resolveStaffName(r.userId) }), title: "Training history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0, color: "#9ca3af" }, onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28 }, onClick: () => openEdit(r), children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#dc2626" }, onClick: () => setDeleteId(r.id), children: "Del" })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    historyMember && /* @__PURE__ */ jsxRuntimeExports.jsx(StaffHistoryDialog, { member: historyMember, allRecords: q.data?.records ?? [], resolveStaffName, onClose: () => setHistoryMember(null) }),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Training Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12, padding: "4px 0", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Staff Member" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: resolveStaffName(viewItem.userId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Training Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(viewItem.trainingDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Training Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600 }, children: viewItem.trainingTitle })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Provider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.trainingProvider || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Expiry" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.expiryDate ? fmt(viewItem.expiryDate) : "No expiry" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Competency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.competencyAchieved || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Assessor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.assessorName || "—" })
          ] })
        ] }),
        viewItem.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { whiteSpace: "pre-line", color: "#374151" }, children: viewItem.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewItem);
          setViewItem(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, style: { marginRight: 4 } }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewItem(null), children: "Close" })
      ] })
    ] }) }),
    [addOpen, !!editItem].includes(true) && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen || !!editItem, onOpenChange: (open) => {
      if (!open) {
        setAddOpen(false);
        setEditItem(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Training Record" : "Add Training Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.userId, onChange: (v) => setForm((f) => ({ ...f, userId: v })), staffNames, loading: staffLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Training Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", marginTop: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: courseSearch,
                onChange: (e) => {
                  setCourseSearch(e.target.value);
                  setForm((f) => ({ ...f, trainingTitle: e.target.value, courseId: "" }));
                  setCourseDropOpen(true);
                },
                onFocus: () => setCourseDropOpen(true),
                onBlur: () => setTimeout(() => setCourseDropOpen(false), 150),
                placeholder: courses.length ? "Search or type a course name…" : "e.g. PA1 Safe Use of Pesticides"
              }
            ),
            courseDropOpen && courses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxHeight: 220, overflowY: "auto", marginTop: 2 }, children: courses.filter((c) => !courseSearch || c.name.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "8px 12px", fontSize: "0.8125rem", color: "#9ca3af" }, children: "No matching courses — your typed text will be saved" }) : courses.filter((c) => !courseSearch || c.name.toLowerCase().includes(courseSearch.toLowerCase())).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                onMouseDown: () => selectCourse(c),
                style: { padding: "8px 12px", cursor: "pointer", fontSize: "0.8125rem", borderBottom: "1px solid #f3f4f6" },
                onMouseEnter: (e) => e.currentTarget.style.background = "#f9fafb",
                onMouseLeave: (e) => e.currentTarget.style.background = "",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 500 }, children: c.name }),
                  (c.issuingBody || c.defaultValidityMonths) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }, children: [
                    c.issuingBody,
                    c.issuingBody && c.defaultValidityMonths ? " · " : "",
                    c.defaultValidityMonths ? `Valid ${c.defaultValidityMonths} months` : ""
                  ] })
                ]
              },
              c.id
            )) })
          ] }),
          courses.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }, children: "Add standard courses in the Course Register tab to enable quick lookup." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Training Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.trainingDate, onChange: (e) => {
              const newDate = e.target.value;
              setForm((f) => {
                let expiryDate = f.expiryDate;
                if (f.courseId) {
                  const course = courses.find((c) => String(c.id) === f.courseId);
                  if (course?.defaultValidityMonths && newDate) {
                    const d = new Date(newDate);
                    d.setMonth(d.getMonth() + course.defaultValidityMonths);
                    expiryDate = d.toISOString().slice(0, 10);
                  }
                }
                return { ...f, trainingDate: newDate, expiryDate };
              });
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.expiryDate, onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Training Provider" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "mt-1",
              value: form.trainingProviderId,
              onChange: (e) => {
                const id = e.target.value;
                const p = providers.find((p2) => String(p2.id) === id);
                setForm((f) => ({ ...f, trainingProviderId: id, trainingProvider: p ? p.name : f.trainingProvider }));
              },
              style: { width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— select registered provider —" }),
                providers.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(p.id), children: p.name }, p.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__custom__", children: "Other / not listed" })
              ]
            }
          ),
          (form.trainingProviderId === "__custom__" || form.trainingProviderId === "" && form.trainingProvider) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "mt-1",
              value: form.trainingProvider,
              onChange: (e) => setForm((f) => ({ ...f, trainingProvider: e.target.value })),
              placeholder: "Provider name"
            }
          ),
          providers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }, children: "Add training providers to your Suppliers list (category: Training Provider) to enable this lookup." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Competency Achieved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.competencyAchieved, onChange: (e) => setForm((f) => ({ ...f, competencyAchieved: e.target.value })), placeholder: "e.g. Safe pesticide handling" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.assessorName, onChange: (e) => setForm((f) => ({ ...f, assessorName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditItem(null);
          setCourseSearch("");
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleSubmit(!!editItem), disabled: !form.trainingTitle || !form.trainingDate || !form.userId, children: "Save Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (open) => {
      if (!open) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Training Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Are you sure you want to delete this training record? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function CertDocPanel({ certId, farmId, documentPath, documentName }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const removeMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/certificates/${certId}/document`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const fileName = response.objectPath.split("/").pop() ?? "document";
      await fetch(`/api/farms/${farmId}/certificates/${certId}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: fileName })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "8px 12px 10px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }, children: "Certificate Scan" }),
    documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(File, { style: { width: 14, height: 14, color: "#6b7280", flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${documentPath}`, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none", flex: 1 }, children: documentName ?? "View Scan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeMut.mutate(), style: { background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9ca3af" }, title: "Remove scan", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { style: { width: 13, height: 13 } }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*,application/pdf",
          style: { display: "none" },
          disabled: isUploading,
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff" }, children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 12, height: 12, animation: "spin 1s linear infinite" } }),
        " Uploading ",
        progress,
        "%"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { style: { width: 12, height: 12 } }),
        " Attach Scan"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: "PDF, JPG or PNG" })
    ] })
  ] });
}
function CertificatesTab({ farmId, staffNames, staffLoading, defaultMember }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [expandedCertId, setExpandedCertId] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [issuerOtherMode, setIssuerOtherMode] = reactExports.useState(false);
  const membersQ = useFarmMembers(farmId);
  const memberNameMap = React.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    (membersQ.data?.members ?? []).forEach((m) => {
      const full = memberFullName(m);
      map.set(String(m.id), full);
      map.set(full, full);
      if (m.linkedUserId) map.set(m.linkedUserId, full);
    });
    return map;
  }, [membersQ.data]);
  const resolveStaffName = (uid) => memberNameMap.get(String(uid)) ?? memberNameMap.get(uid) ?? (uid || "—");
  const empty = { userId: "", certificateType: "", certificateNumber: "", issuer: "", issueDate: "", expiryDate: "", notes: "" };
  const [form, setForm] = reactExports.useState({ ...empty, userId: defaultMember ?? "" });
  reactExports.useEffect(() => {
    if (defaultMember) {
      setForm((f) => ({ ...f, userId: defaultMember }));
      setAddOpen(true);
    }
  }, [defaultMember]);
  const q = useQuery({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = q.data?.records ?? [];
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/certificates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Certificate added" });
      qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] });
      setAddOpen(false);
      setForm({ ...empty });
      setRenewMode(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/certificates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Certificate updated" });
      qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] });
      setEditItem(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/certificates/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Certificate deleted" });
      qc.invalidateQueries({ queryKey: ["staff-certificates", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [renewMode, setRenewMode] = reactExports.useState(false);
  function openEdit(r) {
    setRenewMode(false);
    setEditItem(r);
    const existingIssuer = r.issuer ?? "";
    const suggestions = CERT_ISSUER_MAP[r.certificateType] ?? [];
    setIssuerOtherMode(existingIssuer !== "" && !suggestions.includes(existingIssuer));
    setForm({
      userId: r.userId ?? "",
      certificateType: r.certificateType,
      certificateNumber: r.certificateNumber ?? "",
      issuer: existingIssuer,
      issueDate: r.issueDate ? r.issueDate.slice(0, 10) : "",
      expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      notes: r.notes ?? ""
    });
  }
  function openRenew(r) {
    setEditItem(null);
    setRenewMode(true);
    const existingIssuer = r.issuer ?? "";
    const suggestions = CERT_ISSUER_MAP[r.certificateType] ?? [];
    setIssuerOtherMode(existingIssuer !== "" && !suggestions.includes(existingIssuer));
    setForm({
      userId: r.userId ?? "",
      certificateType: r.certificateType,
      certificateNumber: "",
      issuer: existingIssuer,
      issueDate: "",
      expiryDate: "",
      notes: ""
    });
    setAddOpen(true);
  }
  const expiredCount = records.filter((r) => r.expiryDate && new Date(r.expiryDate) < /* @__PURE__ */ new Date()).length;
  const expiringCount = records.filter((r) => {
    if (!r.expiryDate) return false;
    const days = Math.floor((new Date(r.expiryDate).getTime() - Date.now()) / 864e5);
    return days >= 0 && days <= 60;
  }).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1 } }),
      expiredCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13 }),
        " ",
        expiredCount,
        " expired"
      ] }),
      expiringCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 4 }, children: [
        expiringCount,
        " expiring soon"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm({ ...empty });
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        " Add Certificate"
      ] })
    ] }),
    !q.isLoading && (() => {
      const missingFlags = COMPLIANCE_FLAGS.filter((f) => !records.some((r) => r.certificateType.includes(f.match)));
      if (missingFlags.length === 0) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 2 }, children: "Compliance Gaps Detected" }),
        missingFlags.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 8, background: f.severity === "error" ? "#fef2f2" : "#fffbeb", border: `1px solid ${f.severity === "error" ? "#fecaca" : "#fde68a"}` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, style: { flexShrink: 0, marginTop: 1, color: f.severity === "error" ? "#dc2626" : "#d97706" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", fontWeight: 600, color: f.severity === "error" ? "#991b1b" : "#92400e", marginBottom: 2 }, children: [
              f.label,
              " — no record on file"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: f.severity === "error" ? "#b91c1c" : "#b45309" }, children: f.detail })
          ] })
        ] }, f.label))
      ] });
    })(),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 32, style: { margin: "0 auto 8px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No certificates recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record operator certificates, professional qualifications and welfare competencies here. Inspectors will ask to see these." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "2px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Staff Member" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Certificate Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Cert. No." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Issuer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Issued" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: "Expiry / Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { width: 100 } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: expandedCertId === r.id ? "none" : "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: resolveStaffName(r.userId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: r.certificateType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontFamily: "monospace", fontSize: "0.8125rem", color: "#374151" }, children: r.certificateNumber || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.issuer || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: fmt(r.issueDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.expiryDate ? expiryBadge(r.expiryDate) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }, children: "No expiry" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0, color: "#9ca3af" }, onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                style: { fontSize: "0.75rem", height: 28, display: "flex", alignItems: "center", gap: 3 },
                onClick: () => setExpandedCertId(expandedCertId === r.id ? null : r.id),
                children: [
                  r.documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsx(File, { style: { width: 11, height: 11, color: "#2563eb" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { style: { width: 11, height: 11 } }),
                  "Scan",
                  expandedCertId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { style: { width: 11, height: 11 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { style: { width: 11, height: 11 } })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#059669" }, onClick: () => openRenew(r), title: "Create a new renewal record — keeps this one intact", children: "Renew" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28 }, onClick: () => openEdit(r), children: "Edit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#dc2626" }, onClick: () => setDeleteId(r.id), children: "Del" }),
            r.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#7c3aed" }, onClick: () => setRaiseTaskFor(r), title: "Raise certificate renewal task", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { style: { width: 11, height: 11, marginRight: 3 } }),
              "Task"
            ] })
          ] }) })
        ] }),
        expandedCertId === r.id && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, style: { padding: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CertDocPanel, { certId: r.id, farmId, documentPath: r.documentPath, documentName: r.documentName }) }) })
      ] }, r.id)) })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Certificate Renewal — ${raiseTaskFor.certificateType ?? "Training Certificate"}`,
        defaultDescription: `Holder: ${resolveStaffName(raiseTaskFor.userId)} · Expiry: ${raiseTaskFor.expiryDate ? new Date(raiseTaskFor.expiryDate).toLocaleDateString("en-GB") : "—"} · Issuer: ${raiseTaskFor.issuer ?? "—"}`,
        module: "staff-training"
      }
    ),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Certificate" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Staff Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: resolveStaffName(viewItem.userId) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewItem.certificateType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewItem.certificateNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Issuer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewItem.issuer ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Issue Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewItem.issueDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.expiryDate ? fmt(viewItem.expiryDate) : "No expiry" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewItem.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewItem);
          setViewItem(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewItem(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen || !!editItem, onOpenChange: (open) => {
      if (!open) {
        setAddOpen(false);
        setEditItem(null);
        setRenewMode(false);
        setIssuerOtherMode(false);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Certificate" : renewMode ? "Renew Certificate" : "Add Certificate" }) }),
      renewMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, marginBottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14, style: { flexShrink: 0, marginTop: 2, color: "#16a34a" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#166534", margin: 0 }, children: [
          "A ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "new" }),
          " certificate record will be created. The previous record is kept — both will be stored and viewable."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.userId, onChange: (v) => setForm((f) => ({ ...f, userId: v })), staffNames, loading: staffLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certificateType, onValueChange: (v) => {
            const issuers = CERT_ISSUER_MAP[v] ?? [];
            setIssuerOtherMode(false);
            setForm((f) => ({ ...f, certificateType: v, issuer: issuers.length === 1 ? issuers[0] : "" }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category then type…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-80", children: CERT_GROUPS.map((g, gi) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              gi > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectSeparator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1", children: g.group }),
                g.certs.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ] }, g.group)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.certificateNumber, onChange: (e) => setForm((f) => ({ ...f, certificateNumber: e.target.value })), placeholder: "e.g. PA1-123456" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issuing Body" }),
          (() => {
            const suggestions = CERT_ISSUER_MAP[form.certificateType] ?? [];
            if (suggestions.length === 0) {
              return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.issuer, onChange: (e) => setForm((f) => ({ ...f, issuer: e.target.value })), placeholder: "e.g. Lantra Awards, BASIS, FACTS" });
            }
            const inList = suggestions.includes(form.issuer);
            const selectValue = inList ? form.issuer : issuerOtherMode ? "__other__" : "";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selectValue,
                  onValueChange: (v) => {
                    if (v === "__other__") {
                      setIssuerOtherMode(true);
                      setForm((f) => ({ ...f, issuer: "" }));
                    } else {
                      setIssuerOtherMode(false);
                      setForm((f) => ({ ...f, issuer: v }));
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select issuing body…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      suggestions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectSeparator, {}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / not listed…" })
                    ] })
                  ]
                }
              ),
              issuerOtherMode && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: form.issuer, onChange: (e) => setForm((f) => ({ ...f, issuer: e.target.value })), placeholder: "Enter issuing body…", autoFocus: true })
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.issueDate, onChange: (e) => setForm((f) => ({ ...f, issueDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.expiryDate, onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditItem(null);
          setRenewMode(false);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const body = { ...form };
          if (editItem) updateMut.mutate({ id: editItem.id, body });
          else createMut.mutate(body);
        }, disabled: !form.certificateType || !form.issueDate || !form.userId, children: renewMode ? "Save Renewal" : "Save Certificate" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (open) => {
      if (!open) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Certificate" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Are you sure? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
const RTW_DOCUMENT_TYPES = [
  { group: "List A — Unrestricted Right to Work (no expiry)", docs: [
    "UK or Irish Passport / Passport Card",
    "UK Biometric Residence Permit — settled status",
    "Certificate of Naturalisation or Registration as a British Citizen",
    "UK Birth or Adoption Certificate + NI evidence",
    "Letter from Home Office — indefinite leave"
  ] },
  { group: "List B — Time-Limited Right to Work (expiry date required)", docs: [
    "UK Biometric Residence Permit — pre-settled status",
    "UK Biometric Residence Permit — limited leave",
    "Online Share Code — Home Office Employer Checking Service",
    "Passport with vignette / entry clearance sticker",
    "Seasonal Worker visa (Defra/GLAA approved)",
    "Student visa — evidence of study",
    "Other immigration status document"
  ] }
];
function rtwStatusBadge(expiryDate) {
  if (!expiryDate) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }, children: "Valid — No Expiry" });
  const now = /* @__PURE__ */ new Date();
  const exp = new Date(expiryDate);
  const days = Math.floor((exp.getTime() - now.getTime()) / 864e5);
  if (days < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }, children: "EXPIRED — Re-check required" });
  if (days <= 28) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }, children: [
    "Expires ",
    fmt(expiryDate),
    " — urgent"
  ] });
  if (days <= 90) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }, children: [
    "Expires ",
    fmt(expiryDate)
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }, children: [
    "Valid · ",
    fmt(expiryDate)
  ] });
}
function RtwDocsPanel({ rtwId, farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["rtw-docs", rtwId],
    queryFn: () => fetch(`/api/farms/${farmId}/right-to-work/${rtwId}/documents`).then((r) => r.json())
  });
  const deleteMut = useMutation({
    mutationFn: (docId) => fetch(`/api/farms/${farmId}/right-to-work/${rtwId}/documents/${docId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rtw-docs", rtwId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const fileName = response.objectPath.split("/").pop() ?? "document";
      await fetch(`/api/farms/${farmId}/right-to-work/${rtwId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, objectPath: response.objectPath })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["rtw-docs", rtwId] });
    }
  });
  const docs = data?.documents ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "8px 12px 10px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }, children: "Attached Document Copies" }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#9ca3af" }, children: "Loading…" }) : docs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#9ca3af", fontStyle: "italic", marginBottom: 6 }, children: "No documents attached. Upload a scan or photo of the identity document below." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }, children: docs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 5, padding: "4px 8px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(File, { style: { width: 13, height: 13, color: "#6b7280", flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${doc.objectPath}`, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none", flex: 1 }, children: doc.fileName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: new Date(doc.uploadedAt).toLocaleDateString("en-GB") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMut.mutate(doc.id), style: { background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9ca3af" }, title: "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { style: { width: 12, height: 12 } }) })
    ] }, doc.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*,application/pdf",
          style: { display: "none" },
          disabled: isUploading,
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff" }, children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 12, height: 12, animation: "spin 1s linear infinite" } }),
        " Uploading ",
        progress,
        "%"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { style: { width: 12, height: 12 } }),
        " Add Document"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: "PDF, JPG or PNG — scan or photo of original document" })
    ] })
  ] });
}
function RightToWorkTab({ farmId, staffNames, staffLoading, defaultMember }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState(defaultMember ?? "");
  const [expandedRtwId, setExpandedRtwId] = reactExports.useState(null);
  const [checkedByOther, setCheckedByOther] = reactExports.useState(false);
  const emptyForm = { staffName: defaultMember ?? "", documentType: "", documentReference: "", checkDate: "", checkedBy: "", expiryDate: "", followUpDate: "", notes: "" };
  const [form, setForm] = reactExports.useState({ ...emptyForm });
  reactExports.useEffect(() => {
    if (defaultMember) {
      setForm((f) => ({ ...f, staffName: defaultMember }));
      setAddOpen(true);
    }
  }, [defaultMember]);
  const q = useQuery({
    queryKey: ["staff-rtw", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/right-to-work`).then((r) => r.json()),
    enabled: !!farmId
  });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/right-to-work`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "RTW check recorded" });
      qc.invalidateQueries({ queryKey: ["staff-rtw", farmId] });
      setAddOpen(false);
      setForm({ ...emptyForm });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/right-to-work/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "RTW record updated" });
      qc.invalidateQueries({ queryKey: ["staff-rtw", farmId] });
      setEditItem(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/right-to-work/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Record deleted" });
      qc.invalidateQueries({ queryKey: ["staff-rtw", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditItem(r);
    const existingCheckedBy = r.checkedBy ?? "";
    setCheckedByOther(existingCheckedBy !== "" && !staffNames.includes(existingCheckedBy));
    setForm({
      staffName: r.staffName,
      documentType: r.documentType,
      documentReference: r.documentReference ?? "",
      checkDate: r.checkDate ? r.checkDate.slice(0, 10) : "",
      checkedBy: existingCheckedBy,
      expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      followUpDate: r.followUpDate ? r.followUpDate.slice(0, 10) : "",
      notes: r.notes ?? ""
    });
  }
  const records = (q.data?.records ?? []).filter(
    (r) => !search || r.staffName.toLowerCase().includes(search.toLowerCase())
  );
  const now = /* @__PURE__ */ new Date();
  const expired = records.filter((r) => r.expiryDate && new Date(r.expiryDate) < now).length;
  const urgent = records.filter((r) => {
    if (!r.expiryDate) return false;
    const d = Math.floor((new Date(r.expiryDate).getTime() - now.getTime()) / 864e5);
    return d >= 0 && d <= 28;
  }).length;
  const followUpOverdue = records.filter((r) => r.followUpDate && new Date(r.followUpDate) < now).length;
  const followUpSoon = records.filter((r) => {
    if (!r.followUpDate) return false;
    const d = Math.floor((new Date(r.followUpDate).getTime() - now.getTime()) / 864e5);
    return d >= 0 && d <= 28;
  }).length;
  const checkedNames = new Set((q.data?.records ?? []).map((r) => r.staffName));
  const uncheckedStaff = staffNames.filter((n) => !checkedNames.has(n));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Filter by staff member…", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-[260px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1 } }),
      expired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13 }),
        " ",
        expired,
        " expired"
      ] }),
      urgent > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }, children: [
        urgent,
        " expiring <28 days"
      ] }),
      followUpOverdue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13 }),
        " ",
        followUpOverdue,
        " repeat check overdue"
      ] }),
      followUpSoon > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }, children: [
        followUpSoon,
        " repeat check due <28 days"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm({ ...emptyForm });
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        " Record RTW Check"
      ] })
    ] }),
    !q.isLoading && uncheckedStaff.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, fontSize: "0.8125rem", color: "#991b1b", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14 }),
        " No RTW check recorded for: ",
        uncheckedStaff.join(", ")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#b91c1c" }, children: "UK law requires a Right to Work check before employment begins. Civil penalties of up to £45,000 per worker apply if checks are not completed. Record a check for each person above." })
    ] }),
    !q.isLoading && expired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, fontSize: "0.8125rem", color: "#991b1b", display: "flex", alignItems: "center", gap: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14 }),
      " ",
      expired,
      " time-limited RTW check",
      expired !== 1 ? "s have" : " has",
      " expired — repeat checks must be completed immediately."
    ] }) }),
    !q.isLoading && followUpOverdue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, fontSize: "0.8125rem", color: "#92400e", display: "flex", alignItems: "center", gap: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14 }),
      " ",
      followUpOverdue,
      " repeat / follow-up RTW check",
      followUpOverdue !== 1 ? "s are" : " is",
      " overdue — carry out a new check and update the record."
    ] }) }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 32, style: { margin: "0 auto 8px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No Right to Work checks recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", maxWidth: 420, margin: "0 auto" }, children: "Record documentary evidence of each staff member's right to work in the UK. Required under the Immigration, Asylum and Nationality Act 2006 before employment starts." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb" }, children: ["Staff Member", "Document Type", "Reference / Share Code", "Check Date", "Checked By", "Status / Expiry", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: h }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: expandedRtwId === r.id ? "none" : "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: r.staffName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.documentType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontFamily: "monospace", fontSize: "0.8125rem", color: "#374151" }, children: r.documentReference || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: fmt(r.checkDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.checkedBy || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 3 }, children: [
            rtwStatusBadge(r.expiryDate),
            r.followUpDate && (() => {
              const days = Math.floor((new Date(r.followUpDate).getTime() - Date.now()) / 864e5);
              if (days < 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: "0.68rem" }, children: [
                "Repeat overdue: ",
                fmt(r.followUpDate)
              ] });
              if (days <= 28) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", fontSize: "0.68rem" }, children: [
                "Repeat due: ",
                fmt(r.followUpDate)
              ] });
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", fontSize: "0.68rem" }, children: [
                "Repeat: ",
                fmt(r.followUpDate)
              ] });
            })()
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { height: 28, width: 28, padding: 0, color: "#9ca3af" }, onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                style: { fontSize: "0.75rem", height: 28, display: "flex", alignItems: "center", gap: 3, border: "1px solid #93c5fd", color: "#1d4ed8", background: expandedRtwId === r.id ? "#dbeafe" : "#eff6ff", fontWeight: 600 },
                onClick: () => setExpandedRtwId(expandedRtwId === r.id ? null : r.id),
                title: "Upload and view identity document scans for this RTW check",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { style: { width: 11, height: 11 } }),
                  "Docs / Scans",
                  expandedRtwId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { style: { width: 11, height: 11 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { style: { width: 11, height: 11 } })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28 }, onClick: () => openEdit(r), children: "Edit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#dc2626" }, onClick: () => setDeleteId(r.id), children: "Del" })
          ] }) })
        ] }),
        expandedRtwId === r.id && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, style: { padding: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RtwDocsPanel, { rtwId: r.id, farmId }) }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen || !!editItem, onOpenChange: (open) => {
      if (!open) {
        setAddOpen(false);
        setEditItem(null);
        setCheckedByOther(false);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit RTW Record" : "Record Right to Work Check" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.staffName, onChange: (v) => setForm((f) => ({ ...f, staffName: v })), staffNames, loading: staffLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.documentType, onValueChange: (v) => setForm((f) => ({ ...f, documentType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select document type…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-80", children: RTW_DOCUMENT_TYPES.map((g, gi) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              gi > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectSeparator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1", children: g.group }),
                g.docs.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d, children: d }, d))
              ] })
            ] }, g.group)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Reference / Share Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.documentReference, onChange: (e) => setForm((f) => ({ ...f, documentReference: e.target.value })), placeholder: "e.g. 4HB8YR or passport number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Check Carried Out *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.checkDate, onChange: (e) => setForm((f) => ({ ...f, checkDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Checked By" }),
            staffNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: checkedByOther ? "__other__" : form.checkedBy || "",
                  onValueChange: (v) => {
                    if (v === "__other__") {
                      setCheckedByOther(true);
                      setForm((f) => ({ ...f, checkedBy: "" }));
                    } else {
                      setCheckedByOther(false);
                      setForm((f) => ({ ...f, checkedBy: v }));
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select who carried out the check…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectSeparator, {}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / not a listed member…" })
                    ] })
                  ]
                }
              ),
              checkedByOther && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: form.checkedBy, onChange: (e) => setForm((f) => ({ ...f, checkedBy: e.target.value })), placeholder: "Enter name…", autoFocus: true })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.checkedBy, onChange: (e) => setForm((f) => ({ ...f, checkedBy: e.target.value })), placeholder: "e.g. Farm Manager" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.expiryDate, onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }, children: "Leave blank for List A (indefinite)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Follow-Up / Repeat Check Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.followUpDate, onChange: (e) => setForm((f) => ({ ...f, followUpDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditItem(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const body = { ...form };
          if (editItem) updateMut.mutate({ id: editItem.id, body });
          else createMut.mutate(body);
        }, disabled: !form.staffName || !form.documentType || !form.checkDate, children: "Save Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (open) => {
      if (!open) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete RTW Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Are you sure? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function printTrainingRegister(trainingRecords, certificates, farmName, members, cphNumber, redTractorId) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const nameMap = /* @__PURE__ */ new Map();
  members.forEach((m) => {
    const fullName = memberFullName(m);
    nameMap.set(String(m.id), fullName);
    nameMap.set(fullName, fullName);
    if (m.linkedUserId) nameMap.set(m.linkedUserId, fullName);
  });
  const staffName = (userId) => nameMap.get(String(userId)) ?? nameMap.get(userId) ?? (userId || "—");
  const trainingRows = trainingRecords.map((r) => {
    const expired = r.expiryDate && new Date(r.expiryDate) < /* @__PURE__ */ new Date();
    const expTxt = r.expiryDate ? `<span style="color:${expired ? "#dc2626" : "#16a34a"}">${fmtD(r.expiryDate)}${expired ? " &#9888; EXPIRED" : ""}</span>` : "—";
    return `<tr><td class="name">${staffName(r.userId)}</td><td>${r.trainingTitle}</td><td>${r.trainingProvider || "—"}</td><td class="date">${fmtD(r.trainingDate)}</td><td class="date">${expTxt}</td><td>${r.competencyAchieved || "—"}</td></tr>`;
  }).join("");
  const certRows = certificates.map((r) => {
    const expired = r.expiryDate && new Date(r.expiryDate) < /* @__PURE__ */ new Date();
    const expTxt = r.expiryDate ? `<span style="color:${expired ? "#dc2626" : "#16a34a"}">${fmtD(r.expiryDate)}${expired ? " &#9888; EXPIRED" : ""}</span>` : "No expiry";
    return `<tr><td class="name">${staffName(r.userId)}</td><td>${r.certificateType}</td><td class="mono">${r.certificateNumber || "—"}</td><td>${r.issuer || "—"}</td><td class="date">${fmtD(r.issueDate)}</td><td class="date">${expTxt}</td></tr>`;
  }).join("");
  const html = `<html><head><title>Staff Training &amp; Qualifications Register — ${farmName}</title>
<style>
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;font-size:10pt;margin:0;color:#111;background:#fff;line-height:1.4}
  .page{padding:1.8cm 2cm 2.5cm}
  /* Header */
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;margin-bottom:22px;border-bottom:3px solid #16a34a}
  .hdr-left{max-width:60%}
  .hdr-left h1{font-size:15pt;font-weight:800;margin:0 0 3px;color:#111;letter-spacing:-.01em}
  .hdr-left .doc-type{font-size:8.5pt;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:.08em;margin:0 0 2px}
  .hdr-left p{font-size:8.5pt;color:#6b7280;margin:4px 0 0}
  .hdr-right{text-align:right;font-size:8.5pt;color:#6b7280;line-height:1.7;flex-shrink:0}
  .hdr-right .farm{font-size:11.5pt;font-weight:700;color:#111;display:block;margin-bottom:3px}
  /* Section headings */
  h2{font-size:10pt;font-weight:700;margin:24px 0 6px;padding:6px 10px 6px;background:#f0fdf4;border-left:4px solid #16a34a;color:#14532d;letter-spacing:.01em;page-break-after:avoid}
  .subtitle{font-size:8pt;color:#6b7280;font-style:italic;margin:0 0 8px 0}
  /* Tables */
  table{width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:4px;page-break-inside:auto}
  thead{display:table-header-group}
  thead tr{page-break-after:avoid}
  tbody tr{page-break-inside:avoid}
  th{background:#f0fdf4;font-weight:700;text-align:left;border-top:2px solid #16a34a;border-bottom:1.5px solid #16a34a;border-right:1px solid #dcfce7;padding:6px 9px;font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:#166534}
  th:first-child{border-left:2px solid #16a34a}
  th:last-child{border-right:2px solid #16a34a}
  td{border:1px solid #e5e7eb;padding:5px 9px;vertical-align:top}
  tr:nth-child(even) td{background:#f9fafb}
  td.name{font-weight:600;color:#111;white-space:nowrap;min-width:110px}
  td.date{white-space:nowrap;color:#374151;min-width:80px}
  td.mono{font-family:'Courier New',monospace;font-size:8pt;letter-spacing:.02em}
  td.status-ok{color:#15803d;font-weight:600}
  td.status-exp{color:#dc2626;font-weight:600}
  /* Signature block */
  .sig{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:52px;page-break-inside:avoid}
  .sig-box{border-top:2px solid #374151;padding-top:10px;font-size:8.5pt;line-height:2.2}
  .sig-box strong{font-size:9pt;display:block;margin-bottom:4px;color:#111}
  /* Footer */
  .footer{font-size:7.5pt;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:32px;line-height:1.5}
  .empty{color:#9ca3af;font-style:italic;font-size:8.5pt;padding:8px 0 14px}
  /* Summary row */
  .summary{display:flex;gap:24px;margin:0 0 18px;font-size:8.5pt}
  .summary-item{border:1px solid #e5e7eb;border-radius:5px;padding:5px 12px;background:#f9fafb}
  .summary-item strong{display:block;font-size:11pt;font-weight:700;color:#111;line-height:1.1}
  .summary-item span{color:#6b7280;font-size:7.5pt;text-transform:uppercase;letter-spacing:.05em}
  @media print{
    @page{size:A4 landscape;margin:1.2cm 1.5cm}
    body{font-size:9.5pt}
    .page{padding:0}
    h2{margin-top:18px}
  }
</style></head><body><div class="page">
<div class="hdr">
  <div class="hdr-left">
    <p class="doc-type">Red Tractor Compliance Record</p>
    <h1>Staff Training &amp; Qualifications Register</h1>
    <p>Red Tractor Combinable Crops &amp; Sugar Beet — Staff Competency Record</p>
  </div>
  <div class="hdr-right">
    <span class="farm">${farmName}</span>${cphNumber ? `<br>CPH: ${cphNumber}` : ""}${redTractorId ? `<br>Red Tractor ID: ${redTractorId}` : ""}
    <br>Printed: ${today}<br>
    Retain for minimum 3 years — make available at audit
  </div>
</div>
<div class="summary">
  <div class="summary-item"><strong>${trainingRecords.length}</strong><span>Training Records</span></div>
  <div class="summary-item"><strong>${certificates.length}</strong><span>Certificates</span></div>
  <div class="summary-item"><strong>${trainingRecords.filter((r) => r.expiryDate && new Date(r.expiryDate) < /* @__PURE__ */ new Date()).length + certificates.filter((r) => r.expiryDate && new Date(r.expiryDate) < /* @__PURE__ */ new Date()).length}</strong><span>Expired</span></div>
</div>

<h2>Training Records</h2>
${trainingRecords.length === 0 ? '<p class="empty">No training records on file.</p>' : `<table><thead><tr><th style="width:16%">Staff Member</th><th style="width:25%">Training Title</th><th style="width:16%">Provider</th><th style="width:10%">Date</th><th style="width:13%">Expiry</th><th>Competency Achieved</th></tr></thead><tbody>${trainingRows}</tbody></table>`}

<h2>Operator Certificates &amp; Qualifications</h2>
<p class="subtitle">Includes PA1, PA2, PA3, PA6, PA6AW, BASIS, FACTS, and all other required operator certificates.</p>
${certificates.length === 0 ? '<p class="empty">No certificates on file.</p>' : `<table><thead><tr><th style="width:16%">Staff Member</th><th style="width:22%">Certificate Type</th><th style="width:14%">Cert. Number</th><th style="width:14%">Issuer</th><th style="width:10%">Issue Date</th><th>Expiry / Status</th></tr></thead><tbody>${certRows}</tbody></table>`}

<div class="sig">
  <div class="sig-box"><strong>Farm Manager</strong>Signature: ____________________________<br>Name (print): ________________________<br>Date: ________________________________</div>
  <div class="sig-box"><strong>Red Tractor Assessor</strong>Signature: ____________________________<br>Name (print): ________________________<br>Date: ________________________________</div>
</div>
<div class="footer">
  Staff Training &amp; Qualifications Register &mdash; Red Tractor compliance record. Retain for a minimum of 3 years and make available at audit.<br>
  Generated by BDE Farm Trac &middot; ${today}
</div>
</div></body></html>`;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.addEventListener("afterprint", () => w.close());
    w.print();
  }
}
const KEY_CERTS = [
  "PA1 — Safe use of pesticides",
  "PA2 — Ground crop sprayers",
  "PA6 — Amenity & hard surfaces",
  "WASK/WATOK — On-farm Emergency Slaughter Certificate of Competence",
  "Cattle Disbudding & Dehorning (NPTC/Lantra)",
  "Bovine Artificial Insemination (AI) Certificate",
  "Sheep Castration & Tail Docking (NPTC/Lantra)",
  "Animal Transport Certificate — Category 1 (journeys under 8 hours)",
  "Certificate of Competence in Agricultural Spraying (BASIS/FACTS)",
  "First Aid at Work (HSE-approved, 3-year)",
  "NPTC/Lantra Chainsaw Certificates",
  "Counterbalance Forklift (ITSSAR/RTITB)",
  "Telehandler Certificate (LANTRA/RTITB)",
  "Safe Crop Advisor Certificate (BASIS)"
];
function certStatus(cert) {
  if (!cert) return "none";
  if (!cert.expiryDate) return "valid";
  const exp = new Date(cert.expiryDate);
  const now = /* @__PURE__ */ new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1e3);
  if (exp < now) return "expired";
  if (exp < in90) return "expiring";
  return "valid";
}
const CERT_KEYWORDS = {
  "PA1 — Safe use of pesticides": ["pa1"],
  "PA2 — Ground crop sprayers": ["pa2"],
  "PA3 — Hand-held applicators": ["pa3"],
  "PA4 — Broadcast air-assisted applicators": ["pa4"],
  "PA6 — Amenity & hard surfaces": ["pa6"],
  "PA6AW — Aerial application (UAV/drone)": ["pa6aw"],
  "Safe use of rodenticides": ["rodenticide"],
  "WASK/WATOK — On-farm Emergency Slaughter Certificate of Competence": ["wask", "watok", "emergency slaughter"],
  "Cattle Disbudding & Dehorning (NPTC/Lantra)": ["disbudding", "dehorning"],
  "Cattle Castration (NPTC/Lantra)": ["cattle castration"],
  "Sheep Castration & Tail Docking (NPTC/Lantra)": ["sheep castration", "tail docking"],
  "Pig Castration & Tail Docking (NPTC/Lantra)": ["pig castration"],
  "Bovine Artificial Insemination (AI) Certificate": ["artificial insemination", "bovine ai"],
  "Poultry Emergency Culling Competence": ["poultry emergency culling", "poultry culling"],
  "Poultry Catching & Handling (Lantra)": ["poultry catching"],
  "Animal Transport Certificate — Category 1 (journeys under 8 hours)": ["animal transport"],
  "Animal Transport Certificate — Category 2 (long journeys, over 8 hours)": ["animal transport", "long journey"],
  "Certificate of Competence — Livestock Vehicle Driver": ["livestock vehicle driver"],
  "Tractor & Machinery Safety": ["tractor", "machinery safety"],
  "Telehandler Operator (NPORS/Lantra/RTITB)": ["telehandler"],
  "Counterbalance Fork Lift Truck (FLT)": ["counterbalance", "fork lift", "forklift", "flt"],
  "Reach Fork Lift Truck (FLT)": ["reach fork lift", "reach truck"],
  "ATV / Quad Bike Safety Certificate (Lantra)": ["atv", "quad bike"],
  "ROLO — Reversing Operations & Lifting Operations (Banks Person)": ["rolo", "banks person", "reversing operations"],
  "Combine Harvester Operation (NPTC/Lantra)": ["combine harvester"],
  "Grain Dryer Operation": ["grain dryer"],
  "CS30 — Chainsaw crosscutting & maintenance": ["cs30"],
  "CS31 — Felling small trees": ["cs31"],
  "CS32 — Felling medium trees": ["cs32"],
  "CS38 — Chainsaw from rope & harness": ["cs38"],
  "NPTC/Lantra Chainsaw Certificates": ["chainsaw", "cs30", "cs31", "cs32", "cs38"],
  "First Aid at Work (FAW) — 3 year": ["first aid at work", "faw", "first aid (3"],
  "First Aid at Work (HSE-approved, 3-year)": ["first aid at work", "faw", "first aid (3"],
  "Emergency First Aid at Work (EFAW) — 1 year": ["emergency first aid"],
  "Fire Warden / Fire Marshal": ["fire warden", "fire marshal"],
  "Manual Handling": ["manual handling"],
  "Working at Height": ["working at height"],
  "Confined Space Entry": ["confined space"],
  "Asbestos Awareness": ["asbestos"],
  "COSHH Awareness": ["coshh"],
  "BASIS Certificate in Agronomy": ["basis certificate in agronomy"],
  "BASIS Certificate in Crop Protection": ["basis certificate in crop"],
  "Certificate of Competence in Agricultural Spraying (BASIS/FACTS)": ["agricultural spraying"],
  "Safe Crop Advisor Certificate (BASIS)": ["crop advisor", "safe crop"],
  "FACTS — Fertiliser Adviser": ["facts"],
  "NRoSO — National Register of Spray Operators (CPD)": ["nroso"],
  "AMTRA SQP — Suitably Qualified Person (veterinary medicines)": ["amtra", "sqp"],
  "Responsible for Medicines (named person)": ["responsible for medicines", "named person"],
  "BVetMed / MRCVS — Veterinary Surgeon": ["bvetmed", "mrcvs", "veterinary surgeon"],
  "Food Hygiene — Level 2 Award": ["food hygiene"],
  "Food Hygiene — Level 3 Award": ["food hygiene", "level 3"],
  "Food Safety in Manufacturing (Level 3)": ["food safety in manufacturing"],
  "Water Hygiene Awareness": ["water hygiene"],
  "Telehandler Certificate (LANTRA/RTITB)": ["telehandler"],
  "Counterbalance Forklift (ITSSAR/RTITB)": ["counterbalance", "forklift", "fork lift"]
};
function CompetencyMatrixTab({ farmId, members, certificates, certsLoading }) {
  const [filterStaff, setFilterStaff] = reactExports.useState("");
  const [showAll, setShowAll] = reactExports.useState(false);
  const trainingQ = useQuery({
    queryKey: ["training-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training`).then((r) => r.json()),
    enabled: !!farmId
  });
  const trainingRecords = trainingQ.data?.records ?? [];
  const activeMembers = members.filter((m) => m.isActive !== false);
  const visibleMembers = activeMembers.filter(
    (m) => !filterStaff || memberFullName(m).toLowerCase().includes(filterStaff.toLowerCase())
  );
  const certsToShow = showAll ? ALL_CERT_TYPES : KEY_CERTS;
  const certMap = /* @__PURE__ */ new Map();
  for (const c of certificates) {
    const key = String(c.userId);
    if (!certMap.has(key)) certMap.set(key, /* @__PURE__ */ new Map());
    certMap.get(key).set(c.certificateType, c);
  }
  const trainingByUser = /* @__PURE__ */ new Map();
  for (const t of trainingRecords) {
    const key = String(t.userId);
    if (!trainingByUser.has(key)) trainingByUser.set(key, []);
    trainingByUser.get(key).push(t);
  }
  function memberKeys(m) {
    const keys = [String(m.id)];
    if (m.linkedUserId) keys.push(m.linkedUserId);
    keys.push(memberFullName(m));
    return keys;
  }
  function getMemberCerts(m) {
    for (const key of memberKeys(m)) {
      const map = certMap.get(key);
      if (map && map.size > 0) return map;
    }
    return void 0;
  }
  function getMemberTraining(m) {
    const results = [];
    for (const key of memberKeys(m)) {
      const recs = trainingByUser.get(key);
      if (recs) results.push(...recs);
    }
    return results;
  }
  function certStatusFromExpiry(expiryDate) {
    if (!expiryDate) return "valid";
    const exp = new Date(expiryDate);
    const now = /* @__PURE__ */ new Date();
    if (exp < now) return "expired";
    if (exp < new Date(now.getTime() + 90 * 24 * 60 * 60 * 1e3)) return "expiring";
    return "valid";
  }
  function combinedCertStatus(m, certType) {
    const cert = getMemberCerts(m)?.get(certType);
    if (cert) return certStatus(cert);
    const keywords = CERT_KEYWORDS[certType];
    if (keywords) {
      const matched = getMemberTraining(m).filter((t) => {
        const title = t.trainingTitle.toLowerCase();
        return keywords.some((kw) => title.includes(kw));
      });
      if (matched.length > 0) {
        const best = matched.reduce((a, b) => {
          const ae = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          const be = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          return be > ae ? b : a;
        });
        return certStatusFromExpiry(best.expiryDate);
      }
    }
    return "none";
  }
  const statusCell = (status) => {
    if (status === "valid") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: "Valid", className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold", children: "✓" }) });
    if (status === "expiring") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: "Expiring within 90 days", className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold", children: "!" }) });
    if (status === "expired") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: "Expired", className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold", children: "✗" }) });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: "Not held", className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs", children: "–" }) });
  };
  if (certsLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
    "Loading certificate data…"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-col sm:flex-row sm:items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Staff Competency Matrix" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Traffic-light view of certificates held by each staff member. Green = valid, Amber = expiring within 90 days, Red = expired, Grey = not held." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:ml-auto flex items-center gap-2 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Filter staff…",
            value: filterStaff,
            onChange: (e) => setFilterStaff(e.target.value),
            className: "border rounded-md px-3 py-1.5 text-sm w-40"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowAll((v) => !v),
            className: "text-xs text-blue-600 underline whitespace-nowrap",
            children: showAll ? "Show key certs only" : "Show all cert types"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mb-4 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 rounded-full bg-green-500 inline-block" }),
        " Valid"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 rounded-full bg-amber-400 inline-block" }),
        " Expiring (<90d)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 rounded-full bg-red-500 inline-block" }),
        " Expired"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 rounded-full bg-gray-200 inline-block" }),
        " Not held"
      ] })
    ] }),
    visibleMembers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-gray-400 text-sm", children: "No staff found. Add staff members first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto border rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "text-xs w-max min-w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-semibold text-gray-700 sticky left-0 bg-gray-50 min-w-[220px] w-[220px] border-r", children: "Certificate" }),
        visibleMembers.map((m) => {
          const name = memberFullName(m);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "px-2 py-2.5 font-medium text-gray-600 text-center min-w-[100px] border-l", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[96px] truncate", title: name, children: m.firstName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-gray-400 font-normal truncate max-w-[96px]", children: m.lastName })
          ] }, m.id);
        })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: certsToShow.map((certType) => {
        const rowStatuses = visibleMembers.map((m) => combinedCertStatus(m, certType));
        const anyIssue = rowStatuses.some((s) => s === "expired" || s === "expiring");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: anyIssue ? "bg-red-50/30" : "hover:bg-gray-50/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium text-gray-700 sticky left-0 bg-white border-r min-w-[220px] w-[220px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-normal leading-snug", children: certType }) }),
          rowStatuses.map((status, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 text-center border-l", children: statusCell(status) }, visibleMembers[i].id))
        ] }, certType);
      }) })
    ] }) })
  ] });
}
function CoursesTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useQuery({
    queryKey: ["training-courses", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training-courses`).then((r) => r.json()),
    enabled: !!farmId
  });
  const courses = q.data?.records ?? [];
  const emptyForm = { name: "", courseType: "", issuingBody: "", defaultValidityMonths: "", notes: "" };
  const [form, setForm] = reactExports.useState({ ...emptyForm });
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  function openEdit(c) {
    setEditItem(c);
    setForm({
      name: c.name ?? "",
      courseType: c.courseType ?? "",
      issuingBody: c.issuingBody ?? "",
      defaultValidityMonths: c.defaultValidityMonths ?? "",
      notes: c.notes ?? ""
    });
  }
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/training-courses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Course added" });
      qc.invalidateQueries({ queryKey: ["training-courses", farmId] });
      setAddOpen(false);
      setForm({ ...emptyForm });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/training-courses/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Course updated" });
      qc.invalidateQueries({ queryKey: ["training-courses", farmId] });
      setEditItem(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/training-courses/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Course removed" });
      qc.invalidateQueries({ queryKey: ["training-courses", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function handleSubmit(isEdit) {
    const body = {
      ...form,
      defaultValidityMonths: form.defaultValidityMonths !== "" ? parseInt(String(form.defaultValidityMonths)) : null
    };
    if (isEdit && editItem) {
      body.isActive = !!editItem.isActive;
      updateMut.mutate({ id: editItem.id, body });
    } else {
      createMut.mutate(body);
    }
  }
  const COURSE_TYPES = ["Safety", "Pesticide / PA Award", "First Aid", "Machinery", "Animal Welfare", "Environmental", "Business / Admin", "Other"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Define standard courses your farm uses. These appear as quick-select options in the Training Records form." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm({ ...emptyForm });
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        " Add Course"
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "Loading…" }) : courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { size: 32, style: { margin: "0 auto 8px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No courses defined yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Add standard courses (e.g. PA1, First Aid, Safe Tractor Operation) to speed up training record entry." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-4", onClick: () => {
        setForm({ ...emptyForm });
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        " Add Course"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Course Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Issuing Body" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Valid (months)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 14px" } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: courses.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < courses.length - 1 ? "1px solid #f3f4f6" : void 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", fontWeight: 500 }, children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280" }, children: c.courseType || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280" }, children: c.issuingBody || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280" }, children: c.defaultValidityMonths ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, background: c.isActive ? "#f0fdf4" : "#f9fafb", color: c.isActive ? "#16a34a" : "#9ca3af", border: `1px solid ${c.isActive ? "#bbf7d0" : "#e5e7eb"}` }, children: c.isActive ? "Active" : "Inactive" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewItem(c), style: { height: 28, width: 28, padding: 0, color: "#9ca3af" }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(c), style: { padding: "4px 8px" }, children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeleteId(c.id), style: { padding: "4px 8px", color: "#dc2626" }, children: "Delete" })
        ] }) })
      ] }, c.id)) })
    ] }) }),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Course" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Course Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewItem.name ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Course Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewItem.courseType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Issuing Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewItem.issuingBody ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Default Validity (months)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewItem.defaultValidityMonths ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.isActive ? "Active" : "Inactive" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewItem.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewItem);
          setViewItem(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewItem(null), children: "Close" })
      ] })
    ] }) }),
    (addOpen || !!editItem) && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen || !!editItem, onOpenChange: (open) => {
      if (!open) {
        setAddOpen(false);
        setEditItem(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Course" : "Add Course" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Course Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), placeholder: "e.g. PA1 Safe Use of Pesticides" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Course Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "mt-1",
              value: COURSE_TYPES.filter((t) => t !== "Other").includes(form.courseType) ? form.courseType : form.courseType ? "Other" : "",
              onChange: (e) => setForm((f) => ({ ...f, courseType: e.target.value })),
              style: { width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: "0.875rem", background: "#fff" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— select type —" }),
                COURSE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t === "Other" ? "Other (please specify)" : t }, t))
              ]
            }
          ),
          (form.courseType === "Other" || form.courseType && !COURSE_TYPES.filter((t) => t !== "Other").includes(form.courseType)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "mt-1",
              value: form.courseType === "Other" ? "" : form.courseType,
              onChange: (e) => setForm((f) => ({ ...f, courseType: e.target.value || "Other" })),
              placeholder: "Please specify course type…",
              autoFocus: form.courseType === "Other",
              style: { fontSize: "0.875rem" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issuing Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.issuingBody, onChange: (e) => setForm((f) => ({ ...f, issuingBody: e.target.value })), placeholder: "e.g. Lantra Awards, NPTC Group" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Default Validity (months)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, className: "mt-1", value: form.defaultValidityMonths, onChange: (e) => setForm((f) => ({ ...f, defaultValidityMonths: e.target.value })), placeholder: "e.g. 36" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }, children: "When a course is selected in a training record, expiry date is auto-calculated from this value." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        editItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "courseActive", checked: !!editItem.isActive, onChange: (e) => setEditItem((ei) => ({ ...ei, isActive: e.target.checked })), style: { width: 16, height: 16 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "courseActive", style: { marginBottom: 0, cursor: "pointer" }, children: "Active (available for selection)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditItem(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleSubmit(!!editItem), disabled: !form.name, children: "Save Course" })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Course?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "This will remove the course from your register. Existing training records that reference this course will not be deleted." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
const TRAINING_PIE_COLOURS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#84cc16"];
function StaffTrainingAnalyticsTab({ trainingRecords, certificates }) {
  const now = /* @__PURE__ */ new Date();
  const titleMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    trainingRecords.forEach((r) => {
      m.set(r.trainingTitle, (m.get(r.trainingTitle) ?? 0) + 1);
    });
    return m;
  }, [trainingRecords]);
  const topTitles = [...titleMap.entries()].sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));
  const providerMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    trainingRecords.forEach((r) => {
      const p = r.trainingProvider || "In-house / Other";
      m.set(p, (m.get(p) ?? 0) + 1);
    });
    return m;
  }, [trainingRecords]);
  const providerData = [...providerMap.entries()].sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));
  const monthMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    trainingRecords.forEach((r) => {
      if (!r.trainingDate) return;
      const d = new Date(r.trainingDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!m.has(key)) m.set(key, { label, count: 0 });
      m.get(key).count++;
    });
    return m;
  }, [trainingRecords]);
  const monthData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  const certStatusData = reactExports.useMemo(() => {
    let valid = 0, expiring = 0, expired = 0, noExpiry = 0;
    certificates.forEach((c) => {
      if (!c.expiryDate) {
        noExpiry++;
        return;
      }
      const exp = new Date(c.expiryDate);
      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 864e5);
      if (daysLeft < 0) expired++;
      else if (daysLeft <= 90) expiring++;
      else valid++;
    });
    return [
      { name: "Valid", value: valid },
      { name: "Expiring (90d)", value: expiring },
      { name: "Expired", value: expired },
      { name: "No Expiry", value: noExpiry }
    ].filter((d) => d.value > 0);
  }, [certificates]);
  const expiredTraining = trainingRecords.filter((r) => r.expiryDate && new Date(r.expiryDate) < now).length;
  const expiringTraining = trainingRecords.filter((r) => {
    if (!r.expiryDate) return false;
    const d = Math.ceil((new Date(r.expiryDate).getTime() - now.getTime()) / 864e5);
    return d >= 0 && d <= 90;
  }).length;
  if (trainingRecords.length === 0 && certificates.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-12 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "w-10 h-10 mx-auto mb-3 text-gray-300" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600 mb-1", children: "No training data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Add training records and certificates to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Training Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: trainingRecords.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Certificates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-700", children: certificates.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Expiring (90d)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-700", children: expiringTraining })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Expired" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: expiredTraining })
      ] })
    ] }),
    topTitles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: [
        "Training Records by Course Title (top ",
        topTitles.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(160, topTitles.length * 36), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: topTitles, layout: "vertical", margin: { top: 4, right: 24, left: 0, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", horizontal: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, allowDecimals: false, unit: " records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 220 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} record${v !== 1 ? "s" : ""}`, ""] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#16a34a", radius: [0, 3, 3, 0] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
      certStatusData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Certificate Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: certStatusData, dataKey: "value", nameKey: "name", cx: "40%", cy: "50%", outerRadius: 85, label: false, children: certStatusData.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: d.name === "Valid" ? "#16a34a" : d.name === "Expiring (90d)" ? "#f59e0b" : d.name === "Expired" ? "#ef4444" : "#9ca3af" }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", formatter: (n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11 }, children: n }) })
        ] }) })
      ] }),
      providerData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Training by Provider" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: providerData, dataKey: "count", nameKey: "name", cx: "40%", cy: "50%", outerRadius: 85, label: false, children: providerData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: TRAINING_PIE_COLOURS[i % TRAINING_PIE_COLOURS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} record${v !== 1 ? "s" : ""}`, ""] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", formatter: (n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11 }, children: n }) })
        ] }) })
      ] })
    ] }),
    monthData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Monthly Training Completions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, width: 30, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} completion${v !== 1 ? "s" : ""}`, ""] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#16a34a", name: "Completions", radius: [3, 3, 0, 0] })
      ] }) })
    ] })
  ] });
}
function StaffTrainingPage() {
  const { farmId } = useAppStore();
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const currentFarm = farmData?.record ?? null;
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const urlMember = params.get("member") ?? void 0;
  const [tab, setTab] = usePersistedTab({ page: "staff-training", farmId, validIds: STAFF_TAB_IDS, defaultTab: "training", urlOverride: params.get("tab") });
  const membersQ = useFarmMembers(farmId);
  const staffNames = (membersQ.data?.members ?? []).filter((m) => m.isActive !== false).map(memberFullName);
  const staffLoading = membersQ.isLoading;
  const trainingQ = useQuery({
    queryKey: ["training-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/training`).then((r) => r.json()),
    enabled: !!farmId
  });
  const certsQ = useQuery({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then((r) => r.json()),
    enabled: !!farmId
  });
  const trainingRecords = trainingQ.data?.records ?? [];
  const trainingRecordsThisYear = trainingRecords.filter((r) => isInCropYear(r.trainingDate, currentCropYear()));
  const certificates = certsQ.data?.records ?? [];
  const farmName = currentFarm?.name ?? "Farm";
  const farmCph = currentFarm?.cphNumber ?? null;
  const farmRtId = currentFarm?.redTractorId ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href: "/staff", style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8125rem", color: "#6b7280", textDecoration: "none" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 18l-6-6 6-6" }) }),
      "Staff"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { style: { fontSize: "1.375rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { size: 22, style: { color: "#16a34a" } }),
          " Staff Training Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280", marginTop: 4 }, children: "Training records, operator certificates, and qualifications — required for Red Tractor Combinable Crops compliance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => printTrainingRegister(trainingRecords, certificates, farmName, membersQ.data?.members ?? [], farmCph, farmRtId),
          disabled: trainingRecords.length === 0 && certificates.length === 0 || !currentFarm,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-2" }),
            " Print Register"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "training", onClick: () => setTab("training"), children: [
        "Training Records ",
        trainingRecordsThisYear.length > 0 && `(${trainingRecordsThisYear.length})`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "certificates", onClick: () => setTab("certificates"), children: [
        "Certificates & Qualifications ",
        certificates.length > 0 && `(${certificates.length})`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "rtw", onClick: () => setTab("rtw"), children: "Right to Work" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "courses", onClick: () => setTab("courses"), children: "Course Register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "matrix", onClick: () => setTab("matrix"), children: "Competency Matrix" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: "Analytics" })
    ] }),
    !farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", marginBottom: 24, borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, style: { flexShrink: 0, marginTop: 1, color: "#d97706" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#92400e", margin: 0 }, children: "No farm selected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#b45309", margin: "2px 0 0" }, children: [
          "Use the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Current Farm" }),
          " dropdown in the top-left of the sidebar to select a farm — then this page will load your training records and the Add buttons will become active."
        ] })
      ] })
    ] }),
    !farmId ? null : tab === "training" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrainingTab, { farmId, staffNames, staffLoading, defaultMember: tab === "training" ? urlMember : void 0 }) : tab === "certificates" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CertificatesTab, { farmId, staffNames, staffLoading, defaultMember: tab === "certificates" ? urlMember : void 0 }) : tab === "rtw" ? /* @__PURE__ */ jsxRuntimeExports.jsx(RightToWorkTab, { farmId, staffNames, staffLoading, defaultMember: tab === "rtw" ? urlMember : void 0 }) : tab === "analytics" ? /* @__PURE__ */ jsxRuntimeExports.jsx(StaffTrainingAnalyticsTab, { trainingRecords, certificates }) : tab === "matrix" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CompetencyMatrixTab, { farmId, members: membersQ.data?.members ?? [], certificates, certsLoading: certsQ.isLoading }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CoursesTab, { farmId })
  ] }) });
}
export {
  StaffTrainingPage as default
};
