import { s as createLucideIcon, r as reactExports, b as useAppStore, m as useQuery, M as MapPin, j as jsxRuntimeExports, I as Input, e as LoaderCircle, n as Card } from "./index--RDxgHeZ.js";
import { N as Navigation, B as BookOpen, d as Wrench, A as AppLayout, I as Info } from "./AppLayout-ByvIcI2Y.js";
import { T as Tractor } from "./tractor-qoZVciyB.js";
import { D as Droplets, G as GraduationCap } from "./shield-alert-CQ0_UDlT.js";
import { S as Shield } from "./shield-qgBqzgSO.js";
import { A as ArrowRightLeft } from "./arrow-right-left-DcW2QXpg.js";
import { P as Pill } from "./pill-D46HXQlY.js";
import { G as Globe } from "./globe-DDFI7Yld.js";
import { C as CircleCheck } from "./circle-check-vElB3ACz.js";
import { L as Leaf } from "./triangle-alert-ShRJ-Swk.js";
import { T as Tag } from "./tag-BGgVTROQ.js";
import { S as Search } from "./search-C0dvsUV-.js";
import { C as ChevronUp } from "./chevron-up-DGVaQAaQ.js";
import { C as ChevronDown } from "./trash-2-BTblqQ9f.js";
import "./use-safe-clerk-B1DvtNOD.js";
import "./database-45RVQtCz.js";
import "./shield-check-CAU7U2dm.js";
const __iconNode$1 = [
  ["path", { d: "M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12", key: "1le142" }]
];
const Egg = createLucideIcon("egg", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
      key: "m3kijz"
    }
  ],
  [
    "path",
    {
      d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
      key: "1fmvmk"
    }
  ],
  ["path", { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0", key: "1f8sc4" }],
  ["path", { d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5", key: "qeys4" }]
];
const Rocket = createLucideIcon("rocket", __iconNode);
const WORKFLOWS = [
  {
    id: "farm-setup",
    title: "Set up your farm",
    icon: Rocket,
    moduleKey: null,
    steps: [
      { title: "Complete the farm profile", detail: "Add the holding, contact and business details you use on records and reports." },
      { title: "Build your registers", detail: "Add fields, blocks, livestock groups, equipment and staff that you need to record against." },
      { title: "Check access", detail: "Enable the modules in your subscription and give each team member the right access before they start recording." }
    ]
  },
  {
    id: "field-and-crop-recording",
    title: "Record everyday field and crop work",
    icon: Tractor,
    moduleKey: "field-crop-management",
    steps: [
      { title: "Choose the field or block", detail: "Start from the field register so the work is attached to the correct land and crop history." },
      { title: "Record the job while it is fresh", detail: "Add the date, operation, crop or variety, operator or contractor, machinery and a short note." },
      { title: "Add inputs and outcomes", detail: "Link seed, fertiliser, spray, harvest or other relevant details to keep the season record complete." },
      { title: "Review the history", detail: "Use the field history before the next operation to see what has already been done." }
    ]
  },
  {
    id: "spray-input-record",
    title: "Capture a spray or input record",
    icon: Droplets,
    moduleKey: "sprays-inputs",
    steps: [
      { title: "Select the treated area", detail: "Choose the field or fields and confirm the crop or growth stage where recorded." },
      { title: "Enter the application", detail: "Record the product, rate, quantity, application date and operator from the label and job sheet." },
      { title: "Add conditions and restrictions", detail: "Capture relevant weather, buffer, harvest interval and other label information." },
      { title: "Check before saving", detail: "Review the record against your own agronomy advice and label requirements; the saved record supports, but does not replace, that judgement." }
    ]
  },
  {
    id: "mobile-offline",
    title: "Work on mobile and sync safely",
    icon: Navigation,
    moduleKey: null,
    steps: [
      { title: "Sync before leaving coverage", detail: "Open the mobile app while online so current assignments and reference data are available." },
      { title: "Record work in the field", detail: "Save observations and completed work as you go, including dates, locations and notes." },
      { title: "Reconnect and confirm", detail: "When you have a signal, allow sync to finish and check that the record appears in the dashboard before relying on it for reporting." }
    ]
  },
  {
    id: "inspection-evidence",
    title: "Prepare compliance evidence",
    icon: Shield,
    moduleKey: "red-tractor-compliance",
    steps: [
      { title: "Start with the requirement", detail: "Use your scheme standard and inspector guidance to identify the records and dates that must be available." },
      { title: "Review linked records", detail: "Check field operations, inputs, medicines, training, equipment and documents for gaps or expired evidence." },
      { title: "Attach supporting documents", detail: "Store certificates, invoices, test results and signed forms with clear dates and descriptions." },
      { title: "Export and verify", detail: "Create the relevant report or document pack, then check it is complete for your scheme before an inspection." }
    ]
  },
  {
    id: "livestock-movement-boundaries",
    title: "Record a livestock movement",
    icon: ArrowRightLeft,
    moduleKey: "livestock-management",
    steps: [
      { title: "Create the holding record", detail: "Record the movement type, date, animals or batch, and the source or destination holding details." },
      { title: "Save the farm register entry", detail: "Keep tag, batch and transport details with the record so your on-farm history is traceable." },
      { title: "Make the statutory submission separately", detail: "Use the official service required for your species and nation, within its deadline. A Farm Trac record is not confirmation that a statutory submission has been accepted." },
      { title: "Keep the confirmation", detail: "Add the official reference or retain the paperwork alongside the movement for audit and reconciliation." }
    ]
  },
  {
    id: "medicine-and-welfare",
    title: "Log medicine and welfare treatments",
    icon: Pill,
    moduleKey: "livestock-management",
    steps: [
      { title: "Identify the animal or group", detail: "Select the individual, batch or flock and record the treatment date." },
      { title: "Capture the treatment details", detail: "Enter the medicine, batch, dose, route, prescriber or operator, and the reason for treatment." },
      { title: "Record withdrawals and follow-up", detail: "Enter the withdrawal information from the product instructions and record observations or adverse reactions where relevant." },
      { title: "Review before sale or movement", detail: "Use the register as a check, while following veterinary advice and the product label." }
    ]
  },
  {
    id: "reports-and-exports",
    title: "Create a report or export",
    icon: BookOpen,
    moduleKey: null,
    steps: [
      { title: "Choose the question", detail: "Start from the dashboard or module that owns the records you need: field history, livestock, finance, compliance or planning." },
      { title: "Set a clear date range and filters", detail: "Limit the report to the holding, fields, batches or period that the recipient needs." },
      { title: "Check the totals and dates", detail: "Review the on-screen result before exporting, especially when records are still being entered." },
      { title: "Export and store securely", detail: "Share only with authorised people and retain the version used for an inspection, adviser or business decision." }
    ]
  },
  {
    id: "connected-services",
    title: "Use integrations responsibly",
    icon: Globe,
    moduleKey: null,
    steps: [
      { title: "Check the connection in Settings", detail: "Review the available connection, the account it uses and the data you intend to share." },
      { title: "Match records before sending", detail: "Confirm holding identifiers, dates, units and contacts are correct in both systems." },
      { title: "Send a small, reviewable set first", detail: "Confirm the receiving service shows the expected result before relying on a wider transfer." },
      { title: "Keep the source record", detail: "Retain the Farm Trac entry and any external confirmation; connected services can have their own validation rules and downtime." }
    ]
  },
  {
    id: "weekly-planning",
    title: "Plan work, resources and actuals",
    icon: CircleCheck,
    moduleKey: "resource-planner",
    steps: [
      { title: "Add the work to the planner", detail: "Schedule the task with its field, timing and owner so the week has a single view of planned work." },
      { title: "Set requirements", detail: "Add the people, machinery and materials needed, then review clashes before committing the plan." },
      { title: "Brief the team", detail: "Use the assignment and task details to make the job, location and preparation clear." },
      { title: "Record what happened", detail: "Capture completion, changes, actual resources and notes so future plans use real evidence." }
    ]
  },
  {
    id: "organic-workflow",
    title: "Maintain organic records",
    icon: Leaf,
    moduleKey: ["organic-compliance", "organic-arable", "organic-livestock", "organic-dairy", "organic-fresh-produce", "organic-poultry"],
    steps: [
      { title: "Start with your certification plan", detail: "Use your current certifier requirements, land status and approved-input rules as the source of truth." },
      { title: "Record inputs and activities by field or group", detail: "Log purchases, applications, livestock activity and separation measures when they occur." },
      { title: "Keep evidence with the record", detail: "Attach or retain invoices, approvals, certificates and supplier information needed to support traceability." },
      { title: "Review before inspection or sale", detail: "Check completeness with your certifier; the workflow helps organise evidence but does not determine approval." }
    ]
  },
  {
    id: "vineyard-season",
    title: "Manage vineyard and winery records",
    icon: MapPin,
    moduleKey: ["viticulture", "organic-viticulture"],
    steps: [
      { title: "Set up vineyard blocks", detail: "Record block names, varieties and relevant site details so each observation and operation has a clear location." },
      { title: "Log seasonal work", detail: "Record canopy work, crop observations, applications, irrigation and harvest activity against the right block." },
      { title: "Carry harvest into winery records", detail: "Keep lot, weight, date and quality details together so vineyard and winery traceability can be reconciled." },
      { title: "Review traceability regularly", detail: "Use the history and reports to check that block, harvest and lot records agree before dispatch or audit." }
    ]
  },
  {
    id: "pig-and-poultry-batches",
    title: "Record pig and poultry batches",
    icon: Egg,
    moduleKey: ["pig-production", "poultry-production"],
    steps: [
      { title: "Create the batch or placement", detail: "Record the arrival date, source, house or unit, breed or strain, and starting numbers." },
      { title: "Add daily production and welfare records", detail: "Capture mortality, feed, environment, treatments and observations at the interval your system uses." },
      { title: "Reconcile movements and outputs", detail: "Record transfers, sales, slaughter or egg and crop outputs against the correct batch." }
    ]
  },
  {
    id: "equipment-readiness",
    title: "Keep equipment ready for work",
    icon: Wrench,
    moduleKey: ["equipment-management", "equipment-workshop"],
    steps: [
      { title: "Maintain the asset register", detail: "Add each machine with an identifiable name, key details and responsible person." },
      { title: "Log service, repair and calibration", detail: "Record work completed, provider, date, cost and the next due date." },
      { title: "Keep supporting evidence", detail: "Attach or retain certificates and invoices, then check readiness before allocating the machine to a task." }
    ]
  },
  {
    id: "staff-competency",
    title: "Track staff competency",
    icon: GraduationCap,
    moduleKey: "staff-training",
    steps: [
      { title: "Add each worker", detail: "Record their role and the contact details needed to assign work appropriately." },
      { title: "Record training and certificates", detail: "Add qualification dates, evidence and expiry dates for the tasks they carry out." },
      { title: "Review before assigning work", detail: "Check competence and supervision requirements rather than treating the record alone as authorisation." }
    ]
  },
  {
    id: "pig-movement-record",
    title: "Prepare a pig movement record",
    icon: Tag,
    moduleKey: "pig-production",
    steps: [
      { title: "Record the movement details", detail: "Capture the date, numbers, source or destination and any batch references in the pig register." },
      { title: "Use the official movement process", detail: "Complete the required external movement licence or notification through the relevant official service." },
      { title: "Reconcile the confirmation", detail: "Retain the official reference with your farm record and correct any differences promptly." }
    ]
  }
];
const CATEGORY_COLORS = {
  "Getting Started": "bg-blue-50 text-blue-700",
  "Sprays & Inputs": "bg-cyan-50 text-cyan-700",
  "Fields & Crops": "bg-emerald-50 text-emerald-700",
  "Equipment": "bg-orange-50 text-orange-700",
  "Livestock": "bg-amber-50 text-amber-700",
  "Inspections": "bg-violet-50 text-violet-700",
  "Compliance": "bg-red-50 text-red-700",
  "Biosecurity": "bg-lime-50 text-lime-700",
  "Staff & Training": "bg-indigo-50 text-indigo-700",
  "Risk & Waste": "bg-rose-50 text-rose-700",
  "Health, Safety & Risk": "bg-rose-50 text-rose-700",
  "Financial": "bg-green-50 text-green-700",
  "Weather": "bg-sky-50 text-sky-700",
  "Documents": "bg-gray-50 text-gray-700",
  "Biofuel / RTFO": "bg-teal-50 text-teal-700",
  "Mobile App": "bg-purple-50 text-purple-700",
  "Dashboards": "bg-fuchsia-50 text-fuchsia-700",
  "Nutrient Management": "bg-yellow-50 text-yellow-700",
  "Account & Settings": "bg-slate-50 text-slate-700",
  "Workshop": "bg-teal-50 text-teal-700",
  "Equipment & Machinery": "bg-orange-50 text-orange-700",
  "Pig Production": "bg-pink-50 text-pink-700",
  "Poultry Production": "bg-yellow-50 text-yellow-800",
  "Fresh Produce": "bg-green-50 text-green-800",
  "Carbon & Sustainability": "bg-emerald-50 text-emerald-800",
  "Farm Diversification": "bg-indigo-50 text-indigo-800",
  "Water & Irrigation": "bg-sky-50 text-sky-800",
  "Environmental": "bg-teal-50 text-teal-800",
  "Trade Contacts & Stock": "bg-amber-50 text-amber-800",
  "Sales & Trading": "bg-teal-50 text-teal-700",
  "Grants & Funding": "bg-violet-50 text-violet-700",
  "Crop Trials": "bg-lime-50 text-lime-700",
  "Compliance & Plans": "bg-red-50 text-red-700",
  "Fuel & Energy": "bg-orange-50 text-orange-700",
  "Haulage": "bg-zinc-50 text-zinc-700",
  "Organic Compliance": "bg-green-50 text-green-800",
  "Organic Livestock": "bg-emerald-50 text-emerald-800",
  "Organic Dairy": "bg-teal-50 text-teal-800",
  "Organic Fresh Produce": "bg-lime-50 text-lime-800",
  "Organic Arable": "bg-amber-50 text-amber-800",
  "Organic Poultry": "bg-orange-50 text-orange-800",
  "Viticulture": "bg-purple-50 text-purple-700",
  "Winery Management": "bg-purple-50 text-purple-700",
  "Organic Viticulture": "bg-purple-50 text-purple-800",
  "Resource Planner": "bg-indigo-50 text-indigo-700",
  "Planning": "bg-violet-50 text-violet-700"
};
const ALWAYS_SHOW_CATEGORIES = /* @__PURE__ */ new Set([
  "Getting Started",
  "Mobile App",
  "Dashboards",
  "Account & Settings"
]);
const CATEGORY_TO_MODULE = {
  "Sprays & Inputs": "sprays-inputs",
  "Fields & Crops": "field-crop-management",
  "Equipment": ["equipment-management", "equipment-workshop"],
  "Equipment & Machinery": ["equipment-management", "equipment-workshop"],
  "Workshop": ["workshop-management", "equipment-workshop"],
  "Livestock": "livestock-management",
  "Feed Management": ["feed-management", "livestock-management"],
  "Inspections": ["inspections", "safety-risk-audits"],
  "Compliance": "red-tractor-compliance",
  "Biosecurity": "biosecurity",
  "Staff & Training": "staff-training",
  "Risk & Waste": ["risk-waste", "safety-risk-audits"],
  "Health, Safety & Risk": ["risk-waste", "safety-risk-audits"],
  "Financial": ["financial-records", "finance-business"],
  "Sales & Trading": ["financial-records", "finance-business"],
  "Trade Contacts & Stock": ["stock-suppliers", "finance-business"],
  "Weather": "weather-tracking",
  "Documents": "document-management",
  "Biofuel / RTFO": "biofuel-rtfo",
  "Nutrient Management": "soil-management",
  "Dairy": "dairy-management",
  "Pig Production": "pig-production",
  "Poultry Production": "poultry-production",
  "Fresh Produce": "fresh-produce",
  "Carbon & Sustainability": ["carbon-sustainability", "environment-sustainability"],
  "Farm Diversification": "farm-diversification",
  "Water & Irrigation": "water-irrigation",
  "Environmental": ["soil-management", "environment-sustainability"],
  "Crop Trials": "field-crop-management",
  "Compliance & Plans": "biosecurity",
  "Fuel & Energy": "fuel-energy",
  "Haulage": "haulage-transport",
  "Organic Compliance": "organic-compliance",
  "Organic Livestock": "organic-livestock",
  "Organic Dairy": "organic-dairy",
  "Organic Fresh Produce": "organic-fresh-produce",
  "Organic Arable": "organic-arable",
  "Organic Poultry": "organic-poultry",
  "Viticulture": "viticulture",
  "Winery Management": "viticulture",
  "Organic Viticulture": "organic-viticulture",
  "Resource Planner": "resource-planner",
  "Planning": "resource-planner"
};
function categoryColor(cat) {
  return CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-600";
}
function isArticleVisible(category, activeModuleKeys) {
  if (!activeModuleKeys) return true;
  if (ALWAYS_SHOW_CATEGORIES.has(category)) return true;
  const requiredModule = CATEGORY_TO_MODULE[category];
  if (!requiredModule) return true;
  if (Array.isArray(requiredModule)) {
    return requiredModule.some((key) => activeModuleKeys.includes(key));
  }
  return activeModuleKeys.includes(requiredModule);
}
function isWorkflowVisible(workflow, activeModuleKeys) {
  if (!activeModuleKeys) return true;
  if (workflow.moduleKey === null) return true;
  if (Array.isArray(workflow.moduleKey)) {
    return workflow.moduleKey.some((key) => activeModuleKeys.includes(key));
  }
  return activeModuleKeys.includes(workflow.moduleKey);
}
function WorkflowCard({ workflow }) {
  const [open, setOpen] = reactExports.useState(false);
  const Icon = workflow.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden hover:border-primary/40 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "flex w-full items-center justify-between px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
        "aria-expanded": open,
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: workflow.title })
          ] }),
          open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-5 h-5 text-foreground/40 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-5 h-5 text-foreground/40 flex-shrink-0" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-5 pt-0 border-t border-border bg-black/[0.015]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-4 space-y-3", children: workflow.steps.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-start gap-2 pt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold", children: i + 1 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground leading-snug", children: step.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60 mt-0.5 leading-relaxed", children: step.detail })
        ] })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-1.5 text-xs text-foreground/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          workflow.steps.length,
          " steps"
        ] })
      ] })
    ] })
  ] });
}
function HelpCentre() {
  const [search, setSearch] = reactExports.useState("");
  const [openId, setOpenId] = reactExports.useState(null);
  const { farmId } = useAppStore();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["help-articles"],
    queryFn: async () => {
      const res = await fetch("/api/help/articles");
      if (!res.ok) throw new Error("Failed to load articles");
      return res.json();
    }
  });
  const { data: modulesData } = useQuery({
    queryKey: ["farm-modules", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/modules`);
      if (!res.ok) throw new Error("Failed to load modules");
      return res.json();
    },
    enabled: !!farmId
  });
  const activeModuleKeys = modulesData?.activeModuleKeys ?? null;
  const articles = data?.records ?? [];
  const filtered = articles.filter((a) => {
    if (!isArticleVisible(a.category, activeModuleKeys)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return a.title.toLowerCase().includes(s) || a.category.toLowerCase().includes(s) || a.content.toLowerCase().includes(s);
  });
  const grouped = filtered.reduce((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});
  const toggle = (id) => setOpenId((prev) => prev === id ? null : id);
  const hiddenCount = activeModuleKeys ? articles.filter((a) => !isArticleVisible(a.category, activeModuleKeys)).length : 0;
  const visibleWorkflows = WORKFLOWS.filter(
    (w) => isWorkflowVisible(w, activeModuleKeys)
  );
  !search || visibleWorkflows.some(
    (w) => w.title.toLowerCase().includes(search.toLowerCase()) || w.steps.some(
      (s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.detail.toLowerCase().includes(search.toLowerCase())
    )
  );
  const filteredWorkflows = search ? visibleWorkflows.filter(
    (w) => w.title.toLowerCase().includes(search.toLowerCase()) || w.steps.some(
      (s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.detail.toLowerCase().includes(search.toLowerCase())
    )
  ) : visibleWorkflows;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Help Centre", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search guides and articles...",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "pl-10 bg-white h-12 text-base"
        }
      )
    ] }),
    hiddenCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Showing articles for your active modules. ",
        hiddenCount,
        " article",
        hiddenCount !== 1 ? "s" : "",
        " for modules not in your subscription are hidden."
      ] })
    ] }),
    filteredWorkflows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold tracking-wide text-primary", children: "Step-by-Step Guides" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredWorkflows.map((workflow) => /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowCard, { workflow }, workflow.id)) })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-primary" }) }),
    isError && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-foreground/60", children: "Failed to load help articles. Please try again later." }),
    !isLoading && !isError && filtered.length === 0 && filteredWorkflows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-10 h-10 text-foreground/20 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50", children: "No guides or articles match your search." })
    ] }),
    filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-10", children: Object.entries(grouped).map(([category, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-bold tracking-wide ${categoryColor(category).replace(/bg-\S+\s?/g, "").trim()}`, children: category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((article) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "overflow-hidden cursor-pointer hover:border-primary/40 transition-colors",
          onClick: () => toggle(article.id),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-4 h-4 text-primary/60 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: article.title })
              ] }),
              openId === article.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-5 h-5 text-foreground/40 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-5 h-5 text-foreground/40 flex-shrink-0" })
            ] }),
            openId === article.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pb-5 pt-0 border-t border-border bg-black/[0.015]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 help-article-body", children: article.content.includes("<") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "help-html-content",
                dangerouslySetInnerHTML: { __html: article.content }
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: article.content.split("\n\n").map((para, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/75 text-sm leading-relaxed", children: para }, i)) }) }) })
          ]
        },
        article.id
      )) })
    ] }, category)) })
  ] }) });
}
export {
  HelpCentre as default
};
