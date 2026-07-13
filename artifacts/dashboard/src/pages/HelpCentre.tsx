import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  Search, ChevronDown, ChevronUp, BookOpen, Loader2, Info,
  Rocket, Droplets, ArrowRightLeft, Pill, ClipboardCheck,
  Tractor, GraduationCap, Leaf, Tag, Egg, Wrench, Shield,
  CheckCircle2, type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";

interface HelpArticle {
  id: number;
  title: string;
  category: string;
  content: string;
}

interface WorkflowStep {
  title: string;
  detail: string;
}

interface Workflow {
  id: string;
  title: string;
  icon: LucideIcon;
  moduleKey: string | string[] | null;
  steps: WorkflowStep[];
}

const WORKFLOWS: Workflow[] = [
  {
    id: "getting-started",
    title: "Getting Started with BDE Farm Trac",
    icon: Rocket,
    moduleKey: null,
    steps: [
      { title: "Set up your farm profile", detail: "Add your farm name, CPH number, address and contact details under Settings → Farm Profile." },
      { title: "Register your fields", detail: "Go to Fields & Crops to add each field with its area, soil type and land use." },
      { title: "Activate your modules", detail: "In Settings, enable the modules that match your farming enterprise." },
      { title: "Invite your team", detail: "Add staff members under Staff & Training so they can log records via the mobile app." },
      { title: "Download the mobile app", detail: "Install BDE Farm Trac on iOS or Android for on-the-go recording." },
      { title: "Start recording", detail: "Begin logging spray applications, livestock movements or field operations." },
    ],
  },
  {
    id: "spray-application",
    title: "Recording a Spray Application",
    icon: Droplets,
    moduleKey: "sprays-inputs",
    steps: [
      { title: "Open Sprays & Inputs", detail: "Navigate to the Sprays & Inputs section from the main menu." },
      { title: "Select the field(s)", detail: "Choose the target field or fields from your field register." },
      { title: "Enter the product details", detail: "Add the product name, MAPP number, active ingredient and dose rate." },
      { title: "Log application conditions", detail: "Record wind speed, temperature, soil moisture and the operator name." },
      { title: "Set the harvest interval", detail: "Enter the application date and the harvest interval (HI) for the crop." },
      { title: "Save and review", detail: "Save the record. The system will flag any buffer zone or withdrawal period issues." },
    ],
  },
  {
    id: "livestock-movement",
    title: "Reporting a Livestock Movement",
    icon: ArrowRightLeft,
    moduleKey: "livestock-management",
    steps: [
      { title: "Open Livestock → Movements", detail: "Navigate to the Movements section under Livestock." },
      { title: "Select movement type", detail: "Choose On, Off, or Standstill depending on the nature of the movement." },
      { title: "Enter animal details", detail: "Log the number of animals, species, breed and tag or batch reference." },
      { title: "Record destination or source", detail: "Add the destination CPH or departure holding details." },
      { title: "Set the movement date", detail: "Confirm the date the animals moved. BCMS reporting is automatic if LIS is linked." },
      { title: "Submit and retain paperwork", detail: "Save the record and print a movement document if required for your herd or flock register." },
    ],
  },
  {
    id: "medicine-record",
    title: "Logging a Medicine Record",
    icon: Pill,
    moduleKey: "livestock-management",
    steps: [
      { title: "Go to Livestock → Medicines", detail: "Open the Medicines section in the Livestock menu." },
      { title: "Select the animal or batch", detail: "Identify the treated animal(s) or batch from your register." },
      { title: "Enter the product", detail: "Type the medicine name or choose from recently used products." },
      { title: "Record dose and route", detail: "Enter the quantity, dose rate and route of administration (e.g. oral, injection)." },
      { title: "Add the withdrawal period", detail: "The system calculates the earliest sale or slaughter date automatically." },
      { title: "Sign off the record", detail: "Enter the treating person's name and save. A COSHH record is created where applicable." },
    ],
  },
  {
    id: "red-tractor-inspection",
    title: "Preparing for a Red Tractor Inspection",
    icon: ClipboardCheck,
    moduleKey: "red-tractor-compliance",
    steps: [
      { title: "Run the Compliance Dashboard", detail: "Go to Dashboards → Red Tractor to review your current compliance status at a glance." },
      { title: "Check spray records", detail: "Ensure all spray applications are logged with MAPP numbers and operator details." },
      { title: "Review livestock records", detail: "Confirm medicine records and livestock movements are complete and up to date." },
      { title: "Verify equipment calibration", detail: "Check that sprayer calibration records and NSTS certificates are current." },
      { title: "Confirm staff training", detail: "Ensure all certificates (NPTC, PA1, PA6 etc.) are logged and in date." },
      { title: "Export an Audit Pack", detail: "Use Documents → Generate Audit Pack to produce a PDF summary ready for the inspector." },
    ],
  },
  {
    id: "field-operation",
    title: "Recording a Field Operation",
    icon: Tractor,
    moduleKey: "field-crop-management",
    steps: [
      { title: "Open Fields & Crops", detail: "Navigate to Field Operations from the main menu." },
      { title: "Select the field", detail: "Choose the field you worked on from your field register." },
      { title: "Choose the operation type", detail: "Select from cultivation, drilling, spraying, fertiliser, harvest or other." },
      { title: "Enter operation details", detail: "Add the date, operator or contractor, machinery used and any relevant notes." },
      { title: "Confirm crop and variety", detail: "Ensure the current crop and variety are correctly set for the field." },
      { title: "Save the record", detail: "The operation is logged against the field and added to your full field history." },
    ],
  },
  {
    id: "staff-training",
    title: "Adding a Staff & Competency Record",
    icon: GraduationCap,
    moduleKey: "staff-training",
    steps: [
      { title: "Go to Staff & Training", detail: "Open the Staff section from the main menu." },
      { title: "Add a new staff member", detail: "Enter their name, role and contact details." },
      { title: "Log certificates", detail: "Add qualifications such as PA1, PA6 or NPTC certificates, including expiry dates." },
      { title: "Record training activities", detail: "Log any completed or upcoming training sessions." },
      { title: "Assign compliance tasks", detail: "Use the Task Board to allocate compliance tasks to the staff member." },
      { title: "Monitor expiry alerts", detail: "The system flags approaching certificate expiry dates so nothing lapses unnoticed." },
    ],
  },
  {
    id: "nutrient-plan",
    title: "Setting Up a Nutrient Management Plan",
    icon: Leaf,
    moduleKey: "soil-management",
    steps: [
      { title: "Go to Nutrient Management", detail: "Open the Nutrient Management section from the main menu." },
      { title: "Link your fields", detail: "Select the fields to include in the plan." },
      { title: "Enter soil sample results", detail: "Log soil test results (P, K, Mg, pH) for each field." },
      { title: "Add organic manure applications", detail: "Record any slurry, FYM or digestate applied to each field." },
      { title: "Review nutrient recommendations", detail: "The system recommends nitrogen and phosphate rates based on soil indices and crop type." },
      { title: "Save and export the plan", detail: "Save the completed NMP and export a PDF for your records or an inspector." },
    ],
  },
  {
    id: "pig-movement",
    title: "Recording a Pig Movement",
    icon: Tag,
    moduleKey: "pig-production",
    steps: [
      { title: "Open Pig Production → Movements", detail: "Navigate to the Pig Movements section." },
      { title: "Select the movement type", detail: "Choose on-unit, off-unit, within-unit or slaughter movement." },
      { title: "Enter pig details", detail: "Log the number of pigs and their average or range of weights." },
      { title: "Record source or destination", detail: "Add the holding number or slaughterhouse details." },
      { title: "Confirm the movement date", detail: "Enter the date the pigs moved." },
      { title: "Save and note eAML2 requirements", detail: "Save the record and note any eAML2 submission obligations if applicable." },
    ],
  },
  {
    id: "poultry-placement",
    title: "Poultry Placement & First Welfare Check",
    icon: Egg,
    moduleKey: "poultry-production",
    steps: [
      { title: "Open Poultry Production → Placements", detail: "Navigate to the Placement Records section." },
      { title: "Create a new placement", detail: "Enter the house, breed or strain, chick source and number of birds placed." },
      { title: "Record the placement date", detail: "Log the exact date the birds arrived on site." },
      { title: "Complete a biosecurity check", detail: "Log the pre-placement biosecurity and cleanout record for the house." },
      { title: "Start the welfare log", detail: "Record your first welfare observation — mortality, water, feed and environment." },
      { title: "Set thinning dates if applicable", detail: "Note planned thinning dates for batch tracking and scheduling." },
    ],
  },
  {
    id: "equipment-service",
    title: "Logging Equipment Service Records",
    icon: Wrench,
    moduleKey: ["equipment-management", "equipment-workshop"],
    steps: [
      { title: "Go to Equipment & Machinery", detail: "Open the Equipment section from the main menu." },
      { title: "Select or add the asset", detail: "Choose the machine from your asset register, or add a new one." },
      { title: "Choose the record type", detail: "Select service, MOT, repair, calibration or NSTS test." },
      { title: "Enter service details", detail: "Add the date, service provider, work carried out and cost." },
      { title: "Set the next service due date", detail: "Add a reminder date so the system alerts you when the next service is approaching." },
      { title: "Attach documents", detail: "Upload a service certificate, NSTS certificate or invoice if available." },
    ],
  },
  {
    id: "resource-assignment",
    title: "Assigning Resources in the Gantt View",
    icon: CheckCircle2,
    moduleKey: "resource-planner",
    steps: [
      { title: "Open Week Ahead", detail: "Navigate to Week Ahead from the main menu and switch to Gantt view." },
      { title: "Show the resource sidebar", detail: "Click Show Resources above the Gantt chart to open the sidebar listing all your registered machines, implements, and staff." },
      { title: "Drag a resource onto a task bar", detail: "Drag a resource card from the sidebar and drop it onto the target task bar in the Gantt chart. The assignment is created instantly." },
      { title: "Check for conflicts", detail: "An amber ⚠ icon on a task label means that resource is already assigned to another task on the same day. Resolve by removing one assignment or rescheduling." },
      { title: "Review from the task panel", detail: "Click any task bar to open the expanded panel. The Resources section shows all current assignments and an inline picker to add or remove more." },
    ],
  },
  {
    id: "biosecurity-event",
    title: "Recording a Biosecurity Event",
    icon: Shield,
    moduleKey: "biosecurity",
    steps: [
      { title: "Open Biosecurity", detail: "Navigate to the Biosecurity section from the main menu." },
      { title: "Select the event type", detail: "Choose from visitor log, pest control, cleaning record or disease alert." },
      { title: "Enter visitor or contractor details", detail: "For visitors, log their name, company and farm of origin." },
      { title: "Record biosecurity measures taken", detail: "Note any PPE requirements, disinfection applied or access restrictions." },
      { title: "Log any follow-up actions", detail: "If a disease risk is identified, record the action taken and the person responsible." },
      { title: "Save the record", detail: "All events are timestamped and contribute to your biosecurity audit trail." },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
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
  "Viticulture": "bg-purple-50 text-purple-700",
  "Organic Viticulture": "bg-purple-50 text-purple-800",
  "Resource Planner": "bg-indigo-50 text-indigo-700",
  "Planning": "bg-violet-50 text-violet-700",
};

const ALWAYS_SHOW_CATEGORIES = new Set([
  "Getting Started",
  "Mobile App",
  "Dashboards",
  "Account & Settings",
]);

const CATEGORY_TO_MODULE: Record<string, string | string[]> = {
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
  "Viticulture": "viticulture",
  "Organic Viticulture": "organic-viticulture",
  "Resource Planner": "resource-planner",
  "Planning": "resource-planner",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-600";
}

function isArticleVisible(category: string, activeModuleKeys: string[] | null): boolean {
  if (!activeModuleKeys) return true;
  if (ALWAYS_SHOW_CATEGORIES.has(category)) return true;
  const requiredModule = CATEGORY_TO_MODULE[category];
  if (!requiredModule) return true;
  if (Array.isArray(requiredModule)) {
    return requiredModule.some((key) => activeModuleKeys.includes(key));
  }
  return activeModuleKeys.includes(requiredModule);
}

function isWorkflowVisible(workflow: Workflow, activeModuleKeys: string[] | null): boolean {
  if (!activeModuleKeys) return true;
  if (workflow.moduleKey === null) return true;
  if (Array.isArray(workflow.moduleKey)) {
    return workflow.moduleKey.some((key) => activeModuleKeys.includes(key));
  }
  return activeModuleKeys.includes(workflow.moduleKey);
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const [open, setOpen] = useState(false);
  const Icon = workflow.icon;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">{workflow.title}</span>
        </div>
        {open
          ? <ChevronUp className="w-5 h-5 text-foreground/40 flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-foreground/40 flex-shrink-0" />
        }
      </div>

      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-border bg-black/[0.015]">
          <ol className="mt-4 space-y-3">
            {workflow.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex-shrink-0 flex items-start gap-2 pt-0.5">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {i + 1}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug">{step.title}</p>
                  <p className="text-sm text-foreground/60 mt-0.5 leading-relaxed">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-foreground/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{workflow.steps.length} steps</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function HelpCentre() {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const { farmId } = useAppStore();

  const { data, isLoading, isError } = useQuery<{ records: HelpArticle[] }>({
    queryKey: ["help-articles"],
    queryFn: async () => {
      const res = await fetch("/api/help/articles");
      if (!res.ok) throw new Error("Failed to load articles");
      return res.json();
    },
  });

  const { data: modulesData } = useQuery<{ activeModuleKeys: string[] }>({
    queryKey: ["farm-modules", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/modules`);
      if (!res.ok) throw new Error("Failed to load modules");
      return res.json();
    },
    enabled: !!farmId,
  });

  const activeModuleKeys = modulesData?.activeModuleKeys ?? null;
  const articles = data?.records ?? [];

  const filtered = articles.filter((a) => {
    if (!isArticleVisible(a.category, activeModuleKeys)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(s) ||
      a.category.toLowerCase().includes(s) ||
      a.content.toLowerCase().includes(s)
    );
  });

  const grouped = filtered.reduce<Record<string, HelpArticle[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  const hiddenCount = activeModuleKeys
    ? articles.filter((a) => !isArticleVisible(a.category, activeModuleKeys)).length
    : 0;

  const visibleWorkflows = WORKFLOWS.filter((w) =>
    isWorkflowVisible(w, activeModuleKeys)
  );

  const workflowsMatchSearch = !search || visibleWorkflows.some(
    (w) => w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.steps.some(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.detail.toLowerCase().includes(search.toLowerCase())
      )
  );

  const filteredWorkflows = search
    ? visibleWorkflows.filter(
        (w) =>
          w.title.toLowerCase().includes(search.toLowerCase()) ||
          w.steps.some(
            (s) =>
              s.title.toLowerCase().includes(search.toLowerCase()) ||
              s.detail.toLowerCase().includes(search.toLowerCase())
          )
      )
    : visibleWorkflows;

  return (
    <AppLayout title="Help Centre">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <Input
            placeholder="Search guides and articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white h-12 text-base"
          />
        </div>

        {hiddenCount > 0 && (
          <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Showing articles for your active modules. {hiddenCount} article{hiddenCount !== 1 ? "s" : ""} for modules not in your subscription are hidden.
            </span>
          </div>
        )}

        {filteredWorkflows.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold tracking-wide text-primary">
                Step-by-Step Guides
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <Card className="p-8 text-center text-foreground/60">
            Failed to load help articles. Please try again later.
          </Card>
        )}

        {!isLoading && !isError && filtered.length === 0 && filteredWorkflows.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
            <p className="text-foreground/50">No guides or articles match your search.</p>
          </Card>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-col gap-10">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-sm font-bold tracking-wide ${categoryColor(category).replace(/bg-\S+\s?/g, '').trim()}`}>
                    {category}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-2">
                  {items.map((article) => (
                    <Card
                      key={article.id}
                      className="overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
                      onClick={() => toggle(article.id)}
                    >
                      <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-primary/60 flex-shrink-0" />
                          <span className="font-semibold text-foreground">{article.title}</span>
                        </div>
                        {openId === article.id
                          ? <ChevronUp className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-foreground/40 flex-shrink-0" />
                        }
                      </div>
                      {openId === article.id && (
                        <div className="px-5 pb-5 pt-0 border-t border-border bg-black/[0.015]">
                          <div className="mt-4 help-article-body">
                            {article.content.includes("<") ? (
                              <div
                                className="help-html-content"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                              />
                            ) : (
                              <div className="space-y-3">
                                {article.content.split("\n\n").map((para, i) => (
                                  <p key={i} className="text-foreground/75 text-sm leading-relaxed">
                                    {para}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
