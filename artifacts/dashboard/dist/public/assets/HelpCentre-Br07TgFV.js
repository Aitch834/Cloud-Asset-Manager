import { s as createLucideIcon, r as reactExports, b as useAppStore, m as useQuery, M as MapPin, j as jsxRuntimeExports, I as Input, e as LoaderCircle, n as Card } from "./index-B8sVot4o.js";
import { H as HeartPulse, d as Wrench, I as Info, N as Navigation, A as AppLayout, B as BookOpen } from "./AppLayout-Bs7WB20u.js";
import { D as Droplets, C as ClipboardCheck, G as GraduationCap } from "./shield-alert-BHtht01A.js";
import { A as ArrowRightLeft } from "./arrow-right-left-CGmYMHaM.js";
import { P as Pill } from "./pill-D9ed8TQn.js";
import { T as Tractor } from "./tractor-BIyncDZ-.js";
import { L as Leaf } from "./triangle-alert-DoQ8EUIO.js";
import { T as Tag } from "./tag-B4aHWkqY.js";
import { C as CircleCheck } from "./circle-check-B2didL8S.js";
import { S as Shield } from "./shield-Cig-tHRG.js";
import { G as Globe } from "./globe-CmwHWd2-.js";
import { S as Search } from "./search-GbHQcCCU.js";
import { C as ChevronUp } from "./chevron-up-q1nvWxlD.js";
import { C as ChevronDown } from "./trash-2-C2Fh_1Gp.js";
import "./use-safe-clerk-CX5yKyqg.js";
import "./database-XKt5Qy7o.js";
import "./shield-check-CkrOgCmu.js";
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
      { title: "Start recording", detail: "Begin logging spray applications, livestock movements or field operations." }
    ]
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
      { title: "Save and review", detail: "Save the record. The system will flag any buffer zone or withdrawal period issues." }
    ]
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
      { title: "Set the movement date", detail: "Confirm the date the animals moved. For England cattle, save the record then submit on BCMS Online (www.bcms.gov.uk) and use the amber 'Record BCMS Ref' button on the row to log your confirmation reference — the automated CTS Web Services API is pending DEFRA vendor approval. For England sheep, goats, and deer, LIS CLA handles on/off submissions; births and deaths require a manual LIS keeper portal reference. For Wales farms, EIDCymru submission is available. For Scotland farms, ScotEID covers all species." },
      { title: "Submit and retain paperwork", detail: "Save the record, then use the relevant submission tab (LIS, EIDCymru, or ScotEID) to submit with one click. For England cattle, use the 'Record BCMS Ref' button on each movement row after submitting on BCMS Online — the LIS LIP tab is temporarily paused. For pig movements in England, use the eAML2 XML button to export a compliant file for upload to eAML2.org.uk. Print a movement document if required for your herd or flock register." }
    ]
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
      { title: "Sign off the record", detail: "Enter the treating person's name and save. A COSHH record is created where applicable." }
    ]
  },
  {
    id: "adr-record",
    title: "Recording an Adverse Drug Reaction (ADR)",
    icon: HeartPulse,
    moduleKey: "livestock-management",
    steps: [
      { title: "Open the medicine treatment record", detail: "Go to Livestock → Medicines and open the relevant treatment record (or create a new one)." },
      { title: "Toggle 'Adverse reaction suspected'", detail: "Enable the ADR toggle on the record form. The ADR section expands automatically." },
      { title: "Record clinical signs and severity", detail: "Describe the signs observed and select the severity: Mild, Moderate, Severe, or Fatal." },
      { title: "Enter onset and outcome", detail: "Record how many hours after administration the reaction started and choose the current outcome (Recovered, Recovering, Not Recovered, Unknown, or Fatal)." },
      { title: "Log reporting dates", detail: "Enter the date you reported the reaction to your vet, and — once confirmed — the date your vet reported to VMD via SARSS." },
      { title: "Add the VMD SARSS reference", detail: "Once VMD assign a reference number, enter it on the record. The ADR Register tab lists all suspected reactions with vet-report and SARSS status at a glance." }
    ]
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
      { title: "Export an Audit Pack", detail: "Use Documents → Generate Audit Pack to produce a PDF summary ready for the inspector." }
    ]
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
      { title: "Save the record", detail: "The operation is logged against the field and added to your full field history." }
    ]
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
      { title: "Monitor expiry alerts", detail: "The system flags approaching certificate expiry dates so nothing lapses unnoticed." }
    ]
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
      { title: "Save and export the plan", detail: "Save the completed NMP and export a PDF for your records or an inspector." }
    ]
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
      { title: "Export eAML2 XML and submit", detail: "Save the record, then click the eAML2 XML button above the Movements table to download a compliant XML file. Upload the file directly to eAML2.org.uk to obtain your Animal Movement Licence. No API credentials are needed — this works for all farms today." }
    ]
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
      { title: "Set thinning dates if applicable", detail: "Note planned thinning dates for batch tracking and scheduling." }
    ]
  },
  {
    id: "pig-vaccination",
    title: "Recording a Pig Vaccination Programme",
    icon: Tag,
    moduleKey: "pig-production",
    steps: [
      { title: "Open Pig Production → Vaccination", detail: "Navigate to the Vaccination tab within the Pig Production module." },
      { title: "Click Add Vaccination Record", detail: "Open the new vaccination form." },
      { title: "Select the disease category", detail: "Choose the target disease — PRRS, PCV2/Circovirus, Enzootic Pneumonia (MH), Erysipelas/PPV, E. coli/Clostridial, APP, Swine Influenza, PED, or Other." },
      { title: "Pick a licensed vaccine or enter manually", detail: "A pre-loaded list of licensed UK vaccines for the selected category appears. Choose a preset or select 'Other — enter manually' for an unlisted product." },
      { title: "Complete the record details", detail: "Enter batch number, expiry date, age group treated, number treated, dose volume, administration route, withdrawal period, next due date, administered by, and tick the vet-prescribed flag if the product is POM-V." },
      { title: "Check the booster alert panel", detail: "The amber panel at the top of the Vaccination tab highlights any records with an upcoming or overdue next due date so you can stay on schedule with your booster programme." }
    ]
  },
  {
    id: "poultry-vaccination",
    title: "Recording a Poultry Vaccination Programme",
    icon: Egg,
    moduleKey: "poultry-production",
    steps: [
      { title: "Open Poultry Production → Vaccination", detail: "Navigate to the Vaccination tab within the Poultry Production module." },
      { title: "Click Add Vaccination Record", detail: "Open the new vaccination form." },
      { title: "Select the disease category", detail: "Choose the target disease — Newcastle Disease (ND), Infectious Bronchitis (IB), Marek's Disease, Gumboro/IBD, aMPV/TRT, ILT, EDS, AE/Fowl Typhoid, Salmonella, Mycoplasma (MG), Fowl Pox, or Other." },
      { title: "Pick a licensed vaccine or enter manually", detail: "A pre-loaded list of licensed UK vaccines for the selected category appears. Choose a preset or select 'Other — enter manually' for an unlisted product." },
      { title: "Complete the record details", detail: "Enter batch number, expiry date, age group treated (Broilers, Layers, Breeders, Pullets, Day-old chicks, Turkeys, or All birds), number treated, dose volume, administration route (Drinking water, Eye drop, Spray, Injection, Wing web/stab, or In ovo), withdrawal period, next due date, administered by, and tick the vet-prescribed flag for POM-V products." },
      { title: "Check the booster alert panel", detail: "The amber panel at the top of the Vaccination tab flags any records with an upcoming or overdue next due date to keep your flock vaccination schedule on track." }
    ]
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
      { title: "Attach documents", detail: "Upload a service certificate, NSTS certificate or invoice if available." }
    ]
  },
  {
    id: "resource-assignment",
    title: "Assigning Resources in the Gantt View",
    icon: CircleCheck,
    moduleKey: "resource-planner",
    steps: [
      { title: "Import your fleet & staff", detail: "Open Resource Planner from the sidebar. The Import from your farm records panel shows all active equipment and staff from your existing registers — tick what you need and click Import selected. Items are added instantly with type and colour pre-set." },
      { title: "Add custom resources if needed", detail: "For hired contractors, rented plant, or anything not in your Equipment Register, click Add custom to enter a name, type, colour, and optional description." },
      { title: "Open the Gantt view", detail: "Navigate to Week Ahead and switch to Gantt view. Click Show Resources above the chart to open the sidebar listing all your registered machines and staff." },
      { title: "Drag a resource onto a task bar", detail: "Drag a resource card from the sidebar and drop it onto the target task bar in the Gantt chart. The assignment is created instantly." },
      { title: "Check for conflicts", detail: "An amber ⚠ icon on a task label means that resource is already assigned to another task on the same day. Resolve by removing one assignment or rescheduling." }
    ]
  },
  {
    id: "resource-requirements",
    title: "Setting Resource Requirements for a Task",
    icon: ClipboardCheck,
    moduleKey: "resource-planner",
    steps: [
      { title: "Open the task card", detail: "In the Week Ahead planner, click any task card to expand it. The Resource Requirements section appears below the task details — it contains a row of steppers for each resource type: Tractors, Implements, Vehicles, Sprayers, Trailers, and Staff." },
      { title: "Set the number needed", detail: "Use the + and − buttons on each stepper to enter how many of each resource type are needed for this task. A tractor job that needs two tractors and one operator: set Tractors to 2 and Staff to 1. Requirements default to zero if not set." },
      { title: "Add Other resource descriptions", detail: "If you need resources that do not fit the standard types — a water bowser, a fuel trailer, a specific piece of hired plant — scroll to the Other section and click Add. Type a name for each item. You can add as many named Other resources as needed; they are stored as individual entries against the task." },
      { title: "Save the requirements", detail: "Requirements are saved automatically as you adjust them. No additional save button is needed. The figures feed the Pinch Point panel and the materials summary across the whole planning week." },
      { title: "Review across the week", detail: "Open the Pinch Point Analysis panel (the alert icon above the planner) to see a day-by-day summary of total demand versus your registered supply for each resource type. Days where requirements exceed your fleet or team are flagged in amber with a plain-English description of the shortfall." }
    ]
  },
  {
    id: "pinch-point-analysis",
    title: "Understanding Pinch Point Analysis",
    icon: Info,
    moduleKey: "resource-planner",
    steps: [
      { title: "Open the Pinch Point panel", detail: "In the Week Ahead planner, click the amber alert icon in the toolbar above the task list. The Pinch Point Analysis panel slides open alongside the planner. If no pinch points exist for the week, the panel shows a green 'No conflicts this week' message." },
      { title: "Read the day-by-day summary", detail: "Each day with a resource conflict appears as an amber card. The card names the resource type and shows the demand (total required across all tasks that day) versus supply (total of that resource type in your Resource Planner registry). For example: 'Tuesday — Tractors: 4 required, 2 registered.'" },
      { title: "Identify which tasks are driving demand", detail: "Expand a pinch point card to see which specific tasks are contributing to the demand on that day. This helps you decide whether to reschedule a task, hire in additional resource, or reduce the requirement on a lower-priority job." },
      { title: "Resolve the conflict", detail: "Adjust task requirements using the steppers on each task card (reduce the requirement if the task can be done with less), reschedule one of the affected tasks to a less congested day, or add more resources to your registry if you have availability that is not yet registered." },
      { title: "Confirm the panel clears", detail: "Once all pinch points are resolved, the panel shows the green all-clear message. The panel updates in real time as you adjust requirements and task dates — no page refresh needed." }
    ]
  },
  {
    id: "materials-tracking",
    title: "Tracking Materials for Tasks",
    icon: Tag,
    moduleKey: "resource-planner",
    steps: [
      { title: "Open the task card", detail: "In the Week Ahead planner, click any task card to expand it. Scroll to the Materials section below the resource requirements. This is where you list the consumable products, chemicals, or supplies needed to carry out the task." },
      { title: "Add a material entry", detail: "Click Add Material. A row appears with three fields: Product name (e.g. Glyphosate, Fertiliser 34N, Diesel), Quantity (a number), and Unit (e.g. L, kg, bags, tonnes). Fill in the fields and click the tick to save the entry. Repeat for each material needed." },
      { title: "Edit or remove entries", detail: "Click the pencil icon on any material row to edit it, or the × to remove it. Changes are saved immediately." },
      { title: "View the weekly materials summary", detail: "Click the Materials icon in the toolbar above the planner to open the Materials Preparation Checklist panel. This aggregates all materials across every task in the current week into a single list — product name, total quantity needed, and unit — so you can check stock and prepare in advance rather than reading through individual task cards." },
      { title: "Field workers see materials on the mobile app", detail: "When a task is assigned to a staff member, the BDE Farm Trac mobile app shows a 'Materials needed' section in the expanded task card on the Task Inbox screen. Each product, quantity, and unit is listed so the worker knows exactly what to prepare before heading to the field — no phone calls needed." }
    ]
  },
  {
    id: "planning-status-tab",
    title: "Using the Planning Status Tab",
    icon: ClipboardCheck,
    moduleKey: "resource-planner",
    steps: [
      { title: "Open Planning Status", detail: "In the Resource Planner page, click the Planning Status tab (the third tab, alongside Resources and Planner). The tab loads all upcoming tasks from today onwards — every planner event that has not yet passed." },
      { title: "Filter by date range", detail: "Use the date range pills at the top of the tab — Next week, 2 weeks, 4 weeks, 8 weeks, or All upcoming — to focus on the tasks that need attention right now. The summary count cards and task groups update immediately as you switch range." },
      { title: "Search for a specific task", detail: "Type into the search box next to the date range pills to filter all groups by task name. This is useful when you have a large number of upcoming tasks and know the job you are looking for. Clear the search with the × button to return to all tasks." },
      { title: "Read the summary strip", detail: "Three cards at the top show the count of tasks in each state: Not started (red — no requirements entered), Needs sign-off (amber — requirements entered but not yet committed), and Committed (green — fully planned and signed off). These give you an at-a-glance picture of how far through the planning process you are for the week." },
      { title: "Understand the three groups", detail: "Tasks are listed under three headings. Not started: no resource or material requirements have been entered — you cannot commit these until you have done the planning work. Needs sign-off: requirements are in place and the task is ready for a manager to review and commit. Committed: planning is complete and the task is ready to proceed." },
      { title: "Commit a task", detail: "Find a task in the 'Needs sign-off' group and click the Commit button. Your name and the date are recorded automatically against the task — no extra step needed. The task moves immediately to the Committed group. The Commit button is intentionally disabled on Not started tasks so planning cannot be signed off without requirements being set first." },
      { title: "Review who committed and when", detail: "On each committed task you will see a small line below the green badge showing the name of the person who committed it and the date — for example 'James Fletcher · 25 Jul 2026'. This is the audit trail of who signed off the planning, stored permanently in the database." },
      { title: "Uncommit if plans change", detail: "If a task needs to be re-planned — a resource changes, a date shifts, a material is no longer available — click Uncommit. The task moves back to Needs sign-off, the previous commitment record is cleared, and the manager who re-commits will be recorded afresh once the updated planning is in place." },
      { title: "Review past tasks", detail: "Click Show past tasks at the bottom of the tab to expand all planner events that have already passed. Past tasks show the same resource and commitment details as upcoming ones, and display any actuals that have been recorded against them." },
      { title: "Export the list to CSV", detail: "Click the Export CSV button in the toolbar to download the currently filtered task list as a spreadsheet. The file includes task name, date, planning status, resource requirements, committing manager, and commitment date — ready to share with a contractor, agronomist, or bank." }
    ]
  },
  {
    id: "recording-actuals",
    title: "Recording Actuals (Plan vs Actual)",
    icon: ClipboardCheck,
    moduleKey: "resource-planner",
    steps: [
      { title: "What are actuals?", detail: "Actuals record what really happened on a task — the date the work was done, how many resources were used, what materials were consumed, whether the task was completed, only partially done, or abandoned — and any notes explaining why things differed from the plan. Over time these records reveal patterns: which jobs always need an extra tractor, which tasks slip in wet weather, and where planning has been consistently optimistic." },
      { title: "Open the Past Tasks section", detail: "In the Planning Status tab, click Show past tasks at the bottom to expand all past planner events. Each past task has a Record actuals button on the right-hand side. Tasks that already have actuals recorded show an Edit actuals button instead, along with a coloured outcome badge (✓ Completed, ⚡ Partial, ✕ Abandoned)." },
      { title: "Open the actuals modal", detail: "Click Record actuals on any past task. The modal opens pre-filled with the planned values — planned date, planned resource counts, and planned material quantities — so you only need to change what differed from the plan." },
      { title: "Set the outcome", detail: "Choose one of three outcomes: Completed (the task was fully carried out), Partial (work started but was not completed — for example a spray run cut short by rain), or Abandoned (the task was not carried out at all)." },
      { title: "Record the actual date", detail: "If the work was done on a different day from the planned date, change the date field. The planned date is shown alongside for reference. Leave it unchanged if the task ran on time." },
      { title: "Adjust resource counts", detail: "Change the resource counts to reflect what was actually used. As you type, a red or green delta appears next to each field showing whether you used more or fewer than planned. Resources with a planned count of zero are hidden by default but can be added if something extra was brought in." },
      { title: "Adjust material quantities", detail: "If material quantities differed from the plan — more fertiliser used than expected, less chemical applied — edit the quantity in each row. A delta indicator shows the variance against the planned figure." },
      { title: "Add a deviation note", detail: "Use the Notes field to record why things differed from the plan. Keep it brief and factual: 'Wet ground required 3rd tractor to avoid compaction', 'Application stopped at field boundary — nozzle blockage', 'Delayed 3 days — waiting for agronomy advice'. These notes are shown in the Plan vs Actual table and in the deviation notes section below it." },
      { title: "Save the actuals", detail: "Click Save actuals. The task row immediately updates to show the outcome badge and, if the date changed, the actual date alongside the planned date. Your name and the time of recording are saved automatically. To correct a mistake, click Edit actuals on the same task at any time." },
      { title: "View the Plan vs Actual table", detail: "Below the past tasks section, click Plan vs Actual to open the comparison table. Every task with actuals recorded appears as a row showing: planned date, actual date, date slip in days (On time / +Nd late / early), planned versus actual resource totals, resource delta (red if over, green if under), and outcome. Deviation notes are listed separately below the table." }
    ]
  },
  {
    id: "analytics-tab",
    title: "Using the Resource Planner Analytics Tab",
    icon: Info,
    moduleKey: "resource-planner",
    steps: [
      { title: "Open the Analytics tab", detail: "In the Resource Planner page, click the Analytics tab (the fourth tab, alongside Resources, Planner, and Planning Status). The tab loads automatically and does not require any filter to be set first." },
      { title: "Read the KPI cards", detail: "Four summary cards appear at the top: total upcoming tasks from today, planning completion percentage (how many are committed), active resources on file, and total resource allocations logged in the past and next year. The planning completion card turns green when all upcoming tasks are committed and amber or red when sign-offs are outstanding." },
      { title: "Planning status chart", detail: "A horizontal bar chart shows the count of Not started, Needs sign-off, and Committed tasks at a glance — backed by a green progress bar showing overall planning completion as a percentage. Use this to assess planning health before a busy season." },
      { title: "Tasks by week", detail: "A stacked bar chart shows how many tasks fall in each of the next 8 weeks, colour-coded by planning state (red = not started, amber = needs sign-off, green = committed). Weeks with a lot of red need planning attention before the work arrives." },
      { title: "Resource demand", detail: "A bar chart shows total resource-slot demand across all upcoming tasks, broken down by type (Tractors, Implements, Vehicles, Sprayers, Trailers, Staff). Compare this against how many of each type you have registered to spot long-term capacity gaps before they become week-of problems." },
      { title: "Resource utilisation", detail: "A horizontal bar chart shows how many times each named resource has been allocated to a task over the past and next year. Resources are colour-coded by their assigned colour. Use this to identify which machines or staff members are consistently over-used and which are rarely drawn upon." },
      { title: "Material totals", detail: "A table aggregates the planned material quantities across all upcoming tasks — product name, total quantity, and unit. Use this for bulk ordering decisions and to compare with current stock levels." },
      { title: "Plan vs Actual charts", detail: "Once actuals are recorded on completed tasks, a Plan vs Actual section appears at the bottom. It shows a date slip distribution chart (bucketed into Early, On time, 1–3 days late, 4–7 days late, and more than 7 days late) alongside either a resource planned-vs-actual grouped bar chart or a task outcome breakdown. An average slip figure is shown as a badge next to the section heading." }
    ]
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
      { title: "Save the record", detail: "All events are timestamped and contribute to your biosecurity audit trail." }
    ]
  },
  {
    id: "resource-map",
    title: "Using the Resource Map",
    icon: Navigation,
    moduleKey: null,
    steps: [
      { title: "Open the Resource Map", detail: "Click Resource Map in the left-hand navigation sidebar. The map loads and displays all staff currently sharing their location and any GPS-connected equipment from your integrated providers." },
      { title: "Understand the icons", detail: "Each asset type has its own recognisable SVG icon inside a colour-coded pin: brown for tractors, dark amber for combine harvesters, dark green for sprayers, navy for vehicles, deep orange for plant/excavators, grey for trailers, purple for ATVs. Staff appear as name initials inside a coloured circle." },
      { title: "Hover for a quick summary", detail: "Hover any marker to see a concise tooltip: the asset or staff name, category, and last-seen time. If the machine is moving, its current speed is shown too." },
      { title: "Click for full detail", detail: "Click any marker to open the full detail popup — showing ignition state, GPS accuracy, provider name, asset ID, and a precise last-seen timestamp for assets; shift start time and accuracy for staff." },
      { title: "Filter by category", detail: "Use the toggle pills at the top of the page to show or hide specific asset types. Only categories with at least one active asset appear. Use the 'Show all assets' or 'Hide all assets' shortcut to switch everything on or off at once." },
      { title: "Connect a GPS provider", detail: "If no assets appear, go to Settings → Farm Settings → GPS Tracking Integration. Choose a provider (Teltonika RMS, Webfleet, John Deere Operations Center, or AGCO Connect) and follow the authorisation steps. Once connected, live positions update automatically." }
    ]
  },
  {
    id: "gps-equipment",
    title: "Marking Equipment as GPS Tracked",
    icon: MapPin,
    moduleKey: ["equipment-management", "equipment-workshop"],
    steps: [
      { title: "Open Equipment & Machinery", detail: "Navigate to the Equipment section from the main menu." },
      { title: "Add or edit an asset", detail: "Click Add New to register a new machine, or click the Edit (pencil) icon on an existing entry." },
      { title: "Toggle the GPS Tracked switch", detail: "Find the GPS Tracked toggle in the form. Switch it on for any machine that has a GPS device fitted or is tracked via a connected GPS provider integration." },
      { title: "Save the record", detail: "Save the form. A coloured GPS badge now appears alongside the asset on the equipment list, confirming it is flagged as tracked." },
      { title: "Filter GPS-tracked assets", detail: "On the Equipment list, use the GPS filter button in the filter bar to show only GPS-tracked machines — useful for quickly auditing fleet coverage on large farms." },
      { title: "View live on the Resource Map", detail: "GPS-tracked machines connected to a live provider integration appear on the Resource Map with real-time location, speed, and ignition status." }
    ]
  },
  {
    id: "govt-submission",
    title: "Submitting Movements to Government Livestock Databases",
    icon: Globe,
    moduleKey: "livestock-management",
    steps: [
      { title: "Identify your submission route", detail: "England cattle movements → BCMS via CTS Web Services (LIS LIP cattle submissions are temporarily paused from 21 July 2026 — use BCMS in the meantime). England sheep, goat & deer movements → LIS CLA API. Wales sheep, goat & deer movements → EIDCymru API. Scotland all-species movements → ScotEID API. England pig movements → eAML2 XML export to eAML2.org.uk." },
      { title: "Connect your credentials in Farm Settings", detail: "Go to Settings → Farm Settings. For BCMS enter your CTS Web Services username and password. For LIS, click the OAuth link to sign in to your Livestock Information Service account. For EIDCymru (Wales farms), paste in your EIDCymru API key. For ScotEID (Scotland farms), paste in your ScotEID API key. Each credential is stored securely per farm. Note: LIS LIP cattle sign-in is temporarily unavailable during the LIS service transition." },
      { title: "Open Livestock → Movements", detail: "Navigate to Livestock → Movements. Submission tabs appear above the table based on your farm's country — you will see LIS, LIP, EIDCymru, or ScotEID tabs alongside the main movements list. The LIP tab is currently showing a service notice; use BCMS for cattle movements. Tabs not applicable to your farm's country are hidden automatically." },
      { title: "Submit with one click", detail: "On the relevant submission tab, each movement row has a Submit button. Click it to open a confirmation dialog showing the full payload before it is sent. Confirm to submit. The government reference number is stored back against the movement record automatically." },
      { title: "Export eAML2 XML for pig movements (England)", detail: "For pig movements, click the eAML2 XML button above the Movements table. The system generates a standards-compliant XML file for that movement. Download it and upload directly to eAML2.org.uk to obtain your Animal Movement Licence. No API credentials are needed." },
      { title: "Review submission history", detail: "Each submission tab maintains a full history showing every submission attempt with its status (Pending, Submitted, or Rejected), the government reference number, the date submitted, and the raw response payload. Rejected submissions show the error reason so you can correct and resubmit." }
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "overflow-hidden cursor-pointer hover:border-primary/40 transition-colors",
      onClick: () => setOpen((o) => !o),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: workflow.title })
          ] }),
          open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-5 h-5 text-foreground/40 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-5 h-5 text-foreground/40 flex-shrink-0" })
        ] }),
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
      ]
    }
  );
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
